#!/usr/bin/env python3
"""Compose the 00-era plate: translucent Freedom patch over neon city BG.

Does not redraw the patch — knocks out black, softens white fill alpha,
and pastes the official NoPeel Freedom PNG onto the dark terrace zone so
the seal stays readable (quiet left reserved for headline).
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PATCH_SRC = ROOT / "public/concepts/refs/packages/Patch_Freedom_NoPeel_RGB.png"
NEON_BG = ROOT / "public/concepts/clean-neon-city/16x9/sp-stack-00-era.png"
OUT_CLEAN = ROOT / "public/concepts/clean/sp-stack-00-era.png"
OUT_TRON = ROOT / "public/concepts/clean-tron/sp-stack-00-era.png"

# Plate is 16:9 experience still size.
PLATE_W, PLATE_H = 2752, 1536
# Float center of the cityscape side, a little higher; quiet left for headline.
PATCH_SCALE = 0.46  # fraction of plate height
PATCH_CENTER_X = 0.62  # cityscape side (center-right)
PATCH_CENTER_Y = 0.42  # float higher above the glass rail
PRINT_ALPHA = 255  # red icons fully solid
# Keep the official white seal face (opaque); only knock out the outer black void.
WHITE_ALPHA = 255
MID_ALPHA_MIN = 200
MID_ALPHA_MAX = 255


def translucent_patch(src: Image.Image) -> Image.Image:
    """Knock out black void only; keep white seal face + print + fingerprint."""
    rgba = src.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = pixels[x, y]
            lum = (r + g + b) / 3.0
            if lum < 22:
                pixels[x, y] = (r, g, b, 0)
                continue
            # Red SuperPatch print / circle-X marks
            if r > 140 and r >= g * 1.35 and r >= b * 1.35:
                pixels[x, y] = (r, g, b, PRINT_ALPHA)
                continue
            # Near-white seal face — keep white
            if lum >= 200 and abs(r - g) < 22 and abs(g - b) < 22:
                pixels[x, y] = (r, g, b, WHITE_ALPHA)
                continue
            # Fingerprint ridges / soft gray relief
            t = max(0.0, min(1.0, (lum - 22) / (200 - 22)))
            a = int(MID_ALPHA_MIN + t * (MID_ALPHA_MAX - MID_ALPHA_MIN))
            pixels[x, y] = (r, g, b, a)
    return rgba


def compose(bg_path: Path, patch_path: Path, out_path: Path) -> None:
    bg = Image.open(bg_path).convert("RGB").resize(
        (PLATE_W, PLATE_H), Image.Resampling.LANCZOS
    )
    patch = translucent_patch(Image.open(patch_path))
    target_h = int(PLATE_H * PATCH_SCALE)
    scale = target_h / patch.size[1]
    target_w = int(patch.size[0] * scale)
    patch = patch.resize((target_w, target_h), Image.Resampling.LANCZOS)

    cx = int(PLATE_W * PATCH_CENTER_X)
    cy = int(PLATE_H * PATCH_CENTER_Y)
    x0 = cx - target_w // 2
    y0 = cy - target_h // 2

    canvas = bg.convert("RGBA")
    canvas.alpha_composite(patch, (x0, y0))
    out = canvas.convert("RGB")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(out_path, format="PNG", optimize=True)
    print(f"wrote {out_path} ({out.size[0]}x{out.size[1]}) patch@({x0},{y0})")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--bg",
        type=Path,
        default=NEON_BG,
        help="Neon cityscape background (city only, no patch)",
    )
    parser.add_argument("--patch", type=Path, default=PATCH_SRC)
    parser.add_argument("--out", type=Path, default=OUT_CLEAN)
    parser.add_argument(
        "--also-tron",
        action="store_true",
        help=f"Also write {OUT_TRON}",
    )
    args = parser.parse_args()
    if not args.bg.exists():
        raise SystemExit(f"missing neon background: {args.bg}")
    if not args.patch.exists():
        raise SystemExit(f"missing Freedom patch: {args.patch}")
    compose(args.bg, args.patch, args.out)
    if args.also_tron:
        compose(args.bg, args.patch, OUT_TRON)


if __name__ == "__main__":
    main()
