import { describe, expect, it } from "vitest";

import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  CHIP_IMAGE_SPECS,
  CHIP_MEDIA_READY_SLIDES,
  CHIP_STYLE_ANCHOR,
  PLATE_RETAKES,
  buildChipImagePrompt,
  buildChipMotionPrompt,
  buildPlateRetakePrompt,
  chipImagePath,
  chipMediaForSlide,
  chipVideoPath,
} from "./chipImagery";
import { OMNI_TEXT_BAN } from "./omniChain";
import { SLIDES } from "./slides";

const slidesWithChips = SLIDES.filter((s) => (s.chips?.length ?? 0) > 0);

describe("chip image specs", () => {
  it("covers every chip on every slide, in order", () => {
    for (const slide of slidesWithChips) {
      const specs = CHIP_IMAGE_SPECS.filter((c) => c.slideId === slide.id);
      expect(specs.length, `slide ${slide.id}`).toBe(slide.chips!.length);
      specs.forEach((spec, i) => {
        expect(spec.chipIndex, `${slide.id}[${i}]`).toBe(i);
      });
    }
  });

  it("has no specs for unknown slides or out-of-range chips", () => {
    const byId = new Map(SLIDES.map((s) => [s.id, s]));
    for (const spec of CHIP_IMAGE_SPECS) {
      const slide = byId.get(spec.slideId);
      expect(slide, spec.slideId).toBeDefined();
      expect(spec.chipIndex).toBeLessThan(slide!.chips!.length);
    }
  });

  it("produces unique output paths per aspect", () => {
    for (const aspect of ["16:9", "9:16"] as const) {
      const paths = CHIP_IMAGE_SPECS.map((s) => chipImagePath(s, aspect));
      expect(new Set(paths).size).toBe(paths.length);
      const dir = aspect === "16:9" ? "16x9" : "9x16";
      for (const p of paths) {
        expect(p).toMatch(
          new RegExp(`^/concepts/chips/[a-z0-9-]+/${dir}/[a-z0-9-]+\\.png$`),
        );
      }
    }
  });

  it("defaults to the widescreen aspect", () => {
    const spec = CHIP_IMAGE_SPECS[0];
    expect(chipImagePath(spec)).toBe(chipImagePath(spec, "16:9"));
  });

  it("never asks the model to render text, numerals, or symbols", () => {
    for (const spec of CHIP_IMAGE_SPECS) {
      const blob = `${spec.subject} ${spec.motion}`;
      expect(blob, spec.slug).not.toMatch(/[0-9%$"]/);
      expect(blob.toLowerCase(), spec.slug).not.toMatch(
        /\b(text|word|letter|number|numeral|logo|caption|label)\b/,
      );
    }
  });

  it("locks every prompt to the Tron style anchor and the text ban", () => {
    for (const spec of CHIP_IMAGE_SPECS) {
      const prompt = buildChipImagePrompt(spec);
      expect(prompt).toContain(CHIP_STYLE_ANCHOR);
      expect(prompt).toContain(OMNI_TEXT_BAN);
      expect(prompt).toContain(spec.subject);
    }
  });

  it("keeps subjects centered for later lower-third text overlays", () => {
    for (const spec of CHIP_IMAGE_SPECS) {
      expect(buildChipImagePrompt(spec)).toMatch(/center/i);
    }
  });
});

describe("chip motion prompts (omni)", () => {
  it("animates the chip's own motion inside a single continuous shot", () => {
    for (const spec of CHIP_IMAGE_SPECS) {
      const prompt = buildChipMotionPrompt(spec, null);
      expect(prompt).toContain("single continuous shot");
      expect(prompt).toContain("<FIRST_FRAME>");
      expect(prompt).toContain(spec.motion);
      expect(prompt).toContain(OMNI_TEXT_BAN);
    }
  });

  it("warps toward the next chip's scene when one follows", () => {
    const [first, second] = CHIP_IMAGE_SPECS;
    const prompt = buildChipMotionPrompt(first, second);
    expect(prompt).toMatch(/warp|accelerat/i);
    expect(prompt).toContain(second.accent);
  });

  it("settles back to a clean loop on the final chip", () => {
    const last = CHIP_IMAGE_SPECS[CHIP_IMAGE_SPECS.length - 1];
    const prompt = buildChipMotionPrompt(last, null);
    expect(prompt).toMatch(/settle/i);
    expect(prompt).not.toMatch(/warp/i);
  });

  it("derives video paths beside the stills", () => {
    const spec = CHIP_IMAGE_SPECS[0];
    expect(chipVideoPath(spec, "16:9")).toBe(
      chipImagePath(spec, "16:9").replace(/\.png$/, "_omni.mp4"),
    );
    expect(chipVideoPath(spec, "9:16")).toContain("/9x16/");
  });
});

describe("chip media wiring", () => {
  it("returns one entry per chip, in slide order, for ready slides", () => {
    for (const slideId of CHIP_MEDIA_READY_SLIDES) {
      const specs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === slideId);
      for (const aspect of ["landscape", "portrait"] as const) {
        const entries = chipMediaForSlide(slideId, aspect);
        expect(entries.map((e) => e.slug)).toEqual(specs.map((s) => s.slug));
        for (const entry of entries) {
          expect(entry.video).toMatch(/_omni\.mp4$/);
          expect(entry.poster).toMatch(/\.png$/);
        }
      }
    }
  });

  it("returns nothing for slides without generated media", () => {
    expect(chipMediaForSlide("nonexistent-slide", "landscape")).toEqual([]);
  });

  it("only lists slides whose assets exist on disk", () => {
    for (const slideId of CHIP_MEDIA_READY_SLIDES) {
      for (const aspect of ["landscape", "portrait"] as const) {
        for (const entry of chipMediaForSlide(slideId, aspect)) {
          for (const rel of [entry.video, entry.poster]) {
            expect(
              existsSync(join(__dirname, "../../public", rel)),
              `${rel} missing on disk`,
            ).toBe(true);
          }
        }
      }
    }
  });
});

describe("plate retakes", () => {
  it("covers exactly the four off-style photographic plates", () => {
    expect(PLATE_RETAKES.map((r) => r.plateFile).sort()).toEqual([
      "sp-stack-13-executive.png",
      "sp-stack-15-closing.png",
      "sp-stack-18-different.png",
      "sp-stack-19-future.png",
    ]);
  });

  it("locks retake prompts to the style anchor and text ban", () => {
    for (const retake of PLATE_RETAKES) {
      const prompt = buildPlateRetakePrompt(retake);
      expect(prompt).toContain(CHIP_STYLE_ANCHOR);
      expect(prompt).toContain(OMNI_TEXT_BAN);
      expect(`${retake.subject}`).not.toMatch(/[0-9%$"]/);
    }
  });
});
