#!/usr/bin/env python3
"""Remove baked-in text from concept plates so type can live in the overlay layer.

Text boxes come from scripts/plate-text.json (macOS Vision OCR via plate-ocr.swift).
Glyph pixels are masked, then filled by inverse-distance interpolation from the nearest
untouched pixel in each of four directions. Row-wise reconstruction keeps horizontal
gradients, horizon lines and reflections intact instead of blurring across them.

    python3 scripts/clean-plates.py --out public/concepts/clean
    python3 scripts/clean-plates.py --out /tmp/qa --debug-masks /tmp/qa/masks
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SCRIPT_DIR = Path(__file__).resolve().parent
APP_DIR = SCRIPT_DIR.parent

# Plates whose type crosses horizontally banded scenery (horizon, city grid, cloud deck).
PLATE_HORIZONTAL_BIAS = {
    "sp-stack-13-executive.png": 14.0,
    "sp-stack-14-global-pool.png": 4.0,
    "sp-stack-15-closing.png": 4.0,
}


def luminance(arr: np.ndarray) -> np.ndarray:
    return 0.2126 * arr[..., 0] + 0.7152 * arr[..., 1] + 0.0722 * arr[..., 2]


def box_mask(shape: tuple[int, int], text_area: tuple[int, int, int, int], grow: int) -> np.ndarray:
    """Mask the whole text rectangle — used for display numerals too large to interpolate
    glyph-by-glyph, where the surrounding haze reads better than reconstructed strokes."""
    x0, y0, x1, y1 = text_area
    mask = np.zeros(shape, dtype=bool)
    mask[max(0, y0 - grow) : y1 + grow, max(0, x0 - grow) : x1 + grow] = True
    return mask


def glyph_mask(arr: np.ndarray, text_area: tuple[int, int, int, int], grow: int) -> np.ndarray:
    """Boolean mask of glyph pixels (plus glow) inside text_area."""
    lum = luminance(arr)
    x0, y0, x1, y1 = text_area
    inner = lum[y0:y1, x0:x1]
    if inner.size == 0:
        return np.zeros(lum.shape, dtype=bool)

    # Type is far brighter than the studio backdrop; a low cut also catches the glow.
    base = float(np.percentile(inner, 35))
    peak = float(np.percentile(inner, 99.5))
    threshold = base + 0.06 * max(peak - base, 1.0)

    hits = np.zeros(lum.shape, dtype=np.uint8)
    hits[y0:y1, x0:x1] = (inner > threshold).astype(np.uint8) * 255

    mask = Image.fromarray(hits, mode="L")
    if grow > 0:
        mask = mask.filter(ImageFilter.MaxFilter(grow * 2 + 1))
    return np.asarray(mask, dtype=np.uint8) > 127


def _axis_neighbours(
    arr: np.ndarray, mask: np.ndarray
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Nearest untouched pixel to the left and right of every masked pixel, per row."""
    height, width, _ = arr.shape
    cols = np.tile(np.arange(width), (height, 1))
    valid = ~mask

    left_idx = np.maximum.accumulate(np.where(valid, cols, -1), axis=1)
    right_idx = np.minimum.accumulate(np.where(valid, cols, width)[:, ::-1], axis=1)[:, ::-1]

    rows = np.arange(height)[:, None]
    left_val = arr[rows, np.clip(left_idx, 0, width - 1)]
    right_val = arr[rows, np.clip(right_idx, 0, width - 1)]

    left_dist = np.where(left_idx >= 0, cols - left_idx, np.inf)
    right_dist = np.where(right_idx < width, right_idx - cols, np.inf)
    return left_val, left_dist, right_val, right_dist


def directional_fill(arr: np.ndarray, mask: np.ndarray, horizontal_bias: float = 1.0) -> np.ndarray:
    """Inverse-distance blend of the nearest untouched pixel in all four directions.

    horizontal_bias > 1 favours same-row samples, which keeps horizon lines, city-light
    bands and reflections from turning into vertical streaks.
    """
    if not mask.any():
        return arr

    horizontal = _axis_neighbours(arr, mask)
    transposed = _axis_neighbours(arr.transpose(1, 0, 2), mask.T)
    vertical = (
        transposed[0].transpose(1, 0, 2),
        transposed[1].T,
        transposed[2].transpose(1, 0, 2),
        transposed[3].T,
    )

    total_weight = np.zeros(arr.shape[:2], dtype=np.float32)
    accum = np.zeros(arr.shape, dtype=np.float32)
    for value, distance, axis_bias in (
        (horizontal[0], horizontal[1], horizontal_bias),
        (horizontal[2], horizontal[3], horizontal_bias),
        (vertical[0], vertical[1], 1.0),
        (vertical[2], vertical[3], 1.0),
    ):
        weight = np.where(
            np.isfinite(distance), axis_bias / np.maximum(distance, 1.0) ** 2, 0.0
        )
        accum += value * weight[..., None]
        total_weight += weight

    safe = total_weight > 0
    filled = arr.copy()
    blended = np.divide(accum, np.maximum(total_weight, 1e-6)[..., None])
    apply = mask & safe
    filled[apply] = blended[apply]
    return filled


def smooth_seams(arr: np.ndarray, mask: np.ndarray, passes: int = 2) -> np.ndarray:
    """Soften interpolation ridges without touching untouched pixels."""
    out = arr
    soft = Image.fromarray((mask * 255).astype(np.uint8), mode="L").filter(
        ImageFilter.GaussianBlur(1.0)
    )
    soft_arr = (np.asarray(soft, dtype=np.float32) / 255.0)[..., None]
    for _ in range(passes):
        image = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), mode="RGB")
        blurred = np.asarray(image.filter(ImageFilter.GaussianBlur(1.6)), dtype=np.float32)
        out = out * (1 - soft_arr) + blurred * soft_arr
    return out


def regrain(arr: np.ndarray, mask: np.ndarray, source: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Match the backdrop's film grain so the fill does not read as a flat patch."""
    lum = luminance(source)
    smooth = luminance(
        np.asarray(
            Image.fromarray(np.clip(source, 0, 255).astype(np.uint8), mode="RGB").filter(
                ImageFilter.GaussianBlur(2)
            ),
            dtype=np.float32,
        )
    )
    background = ~mask
    if background.sum() < 128:
        return arr
    sigma = float(np.std((lum - smooth)[background]))
    if sigma <= 0.3:
        return arr
    noise = rng.normal(0.0, sigma, size=arr.shape[:2])[..., None]
    return arr + noise * mask[..., None]


def clean_plate(
    src: Path,
    boxes: list[dict],
    dest: Path,
    grow: int,
    grain: bool,
    box_fill_min_height: int,
    horizontal_bias: float,
    debug_dir: Path | None,
    rng: np.random.Generator,
) -> int:
    image = Image.open(src).convert("RGB")
    width, height = image.size
    debug = Image.new("L", image.size, 0) if debug_dir else None

    for box in boxes:
        oversized = box["h"] >= box_fill_min_height
        pad = max(28, box["h"] if not oversized else box["h"] // 2 + 60)
        left = max(0, box["x"] - pad)
        top = max(0, box["y"] - pad)
        right = min(width, box["x"] + box["w"] + pad)
        bottom = min(height, box["y"] + box["h"] + pad)
        if right - left < 4 or bottom - top < 4:
            continue

        region = np.asarray(image.crop((left, top, right, bottom)), dtype=np.float32)
        text_area = (
            box["x"] - left,
            box["y"] - top,
            box["x"] + box["w"] - left,
            box["y"] + box["h"] - top,
        )
        mask = (
            box_mask(region.shape[:2], text_area, max(grow, 30))
            if oversized
            else glyph_mask(region, text_area, grow)
        )
        filled = directional_fill(region, mask, horizontal_bias=horizontal_bias)
        filled = smooth_seams(filled, mask)
        if grain:
            filled = regrain(filled, mask, region, rng)
        image.paste(
            Image.fromarray(np.clip(filled, 0, 255).astype(np.uint8), mode="RGB"), (left, top)
        )

        if debug is not None:
            mask_img = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
            debug.paste(mask_img, (left, top), mask_img)

    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest, format="PNG", optimize=True)

    if debug is not None and debug_dir is not None:
        debug_dir.mkdir(parents=True, exist_ok=True)
        debug.save(debug_dir / f"{src.stem}-mask.png")

    return len(boxes)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ocr", type=Path, default=SCRIPT_DIR / "plate-text.json")
    parser.add_argument("--src", type=Path, default=APP_DIR / "public/concepts")
    parser.add_argument("--out", type=Path, default=APP_DIR / "public/concepts/clean")
    parser.add_argument("--grow", type=int, default=8, help="glyph mask dilation in px")
    parser.add_argument(
        "--grain",
        action="store_true",
        help="re-add matched film grain (leave off for smooth dark backdrops)",
    )
    parser.add_argument(
        "--box-fill-min-height",
        type=int,
        default=150,
        help="text taller than this is cleared as a whole rectangle, not glyph-by-glyph",
    )
    parser.add_argument("--debug-masks", type=Path, default=None)
    parser.add_argument("--only", nargs="*", default=None, help="limit to these file names")
    args = parser.parse_args()

    plates = json.loads(args.ocr.read_text())
    rng = np.random.default_rng(7)
    total = 0

    for plate in plates:
        name = plate["file"]
        if args.only and name not in args.only:
            continue
        removed = clean_plate(
            src=args.src / name,
            boxes=plate["boxes"],
            dest=args.out / name,
            grow=args.grow,
            grain=args.grain,
            box_fill_min_height=args.box_fill_min_height,
            horizontal_bias=PLATE_HORIZONTAL_BIAS.get(name, 1.0),
            debug_dir=args.debug_masks,
            rng=rng,
        )
        total += removed
        print(f"{name}: removed {removed} text region(s)")

    print(f"\ncleaned {len(plates)} plate(s), {total} text region(s) -> {args.out}")


if __name__ == "__main__":
    main()
