import { describe, expect, it } from "vitest";

import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  CHIP_IMAGE_SPECS,
  CHIP_MEDIA_READY_SLIDES,
  CHIP_STYLE_ANCHOR,
  CHIP_VIDEO_READY_SLIDES,
  PLATE_RETAKES,
  NEON_CITY_STYLE_ANCHOR,
  buildChipImagePrompt,
  buildChipMotionPrompt,
  buildPlateRetakePrompt,
  buildPortraitRecomposePrompt,
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

  it("locks every prompt to its style anchor and the text ban", () => {
    for (const spec of CHIP_IMAGE_SPECS) {
      const prompt = buildChipImagePrompt(spec);
      expect(prompt).toContain(spec.style ?? CHIP_STYLE_ANCHOR);
      expect(prompt).toContain(OMNI_TEXT_BAN);
      expect(prompt).toContain(spec.subject);
      if (spec.style) {
        expect(prompt, spec.slug).not.toContain(CHIP_STYLE_ANCHOR);
      }
    }
  });

  it("keeps subjects centered for later lower-third text overlays", () => {
    for (const spec of CHIP_IMAGE_SPECS) {
      expect(buildChipImagePrompt(spec)).toMatch(/center/i);
    }
  });

  it("grounds every title chip in a real-world neon-city scene", () => {
    const titleSpecs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === "01-title");
    expect(titleSpecs).toHaveLength(3);
    for (const spec of titleSpecs) {
      expect(spec.style, spec.slug).toBe(NEON_CITY_STYLE_ANCHOR);
      expect(spec.setting, spec.slug).toMatch(/neon|city|rooftop/i);
    }
    const [health, freedom, impact] = titleSpecs;
    expect(health.subject).toMatch(/runner|sprint/i);
    expect(freedom.subject).toMatch(/rooftop|railing/i);
    expect(impact.subject).toMatch(/crowd|people|crossing/i);
  });

  it("grounds every world chip in a real-world neon-city scene", () => {
    const worldSpecs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === "02-world");
    expect(worldSpecs).toHaveLength(4);
    for (const spec of worldSpecs) {
      expect(spec.style, spec.slug).toBe(NEON_CITY_STYLE_ANCHOR);
      expect(spec.setting, spec.slug).toMatch(/neon|city/i);
    }
    const [jobs, gig, creator, social] = worldSpecs;
    expect(jobs.subject).toMatch(/office|tower/i);
    expect(gig.subject).toMatch(/rider|scooter|courier/i);
    expect(creator.subject).toMatch(/ring light|studio|camera/i);
    expect(social.subject).toMatch(/hands|phone/i);
  });

  it("uses the portrait subject override when rendering 9:16", () => {
    const social = CHIP_IMAGE_SPECS.find(
      (s) => s.slideId === "02-world" && s.slug === "social-commerce",
    )!;
    expect(social.portraitSubject).toBeDefined();
    expect(buildChipImagePrompt(social, "9:16")).toContain(
      social.portraitSubject!,
    );
    expect(buildChipImagePrompt(social, "16:9")).toContain(social.subject);
    expect(buildChipImagePrompt(social)).toContain(social.subject);
  });

  it("recomposes portraits from the wide frame as one continuous photograph", () => {
    const spec = CHIP_IMAGE_SPECS.find((s) => s.style)!;
    const prompt = buildPortraitRecomposePrompt(spec);
    expect(prompt).toMatch(/attached photograph/i);
    expect(prompt).toMatch(/vertical portrait/i);
    expect(prompt).toMatch(/no black bars/i);
    expect(prompt).toMatch(/no collage/i);
    expect(prompt).toMatch(/unbroken depth of field/i);
    expect(prompt).toContain(OMNI_TEXT_BAN);
  });

  it("keeps the world city photoreal but free of readable signage", () => {
    expect(NEON_CITY_STYLE_ANCHOR).toMatch(/photoreal/i);
    expect(NEON_CITY_STYLE_ANCHOR).toMatch(/neon/i);
    expect(NEON_CITY_STYLE_ANCHOR).toMatch(/no readable characters/i);
    expect(NEON_CITY_STYLE_ANCHOR).toMatch(/center/i);
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

  it("uses each spec's setting instead of the abstract dark void", () => {
    const world = CHIP_IMAGE_SPECS.find((s) => s.slideId === "02-world")!;
    const worldPrompt = buildChipMotionPrompt(world, null);
    expect(worldPrompt).toContain(world.setting!);
    expect(worldPrompt).not.toMatch(/dark void/i);
    expect(worldPrompt).not.toMatch(/abstract motion/i);

    const tron = CHIP_IMAGE_SPECS.find((s) => !s.setting)!;
    const tronPrompt = buildChipMotionPrompt(tron, null);
    expect(tronPrompt).toMatch(/dark void/i);
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
        const videoReady = CHIP_VIDEO_READY_SLIDES.includes(slideId);
        for (const entry of entries) {
          if (videoReady) {
            expect(entry.video).toMatch(/_omni\.mp4$/);
          } else {
            expect(entry.video, `${slideId}/${entry.slug}`).toBeUndefined();
          }
          expect(entry.poster).toMatch(/\.png$/);
        }
      }
    }
  });

  it("returns nothing for slides without generated media", () => {
    expect(chipMediaForSlide("nonexistent-slide", "landscape")).toEqual([]);
  });

  it("only marks video-ready slides that are also media-ready", () => {
    for (const slideId of CHIP_VIDEO_READY_SLIDES) {
      expect(CHIP_MEDIA_READY_SLIDES).toContain(slideId);
    }
  });

  it("only lists slides whose assets exist on disk", () => {
    for (const slideId of CHIP_MEDIA_READY_SLIDES) {
      for (const aspect of ["landscape", "portrait"] as const) {
        for (const entry of chipMediaForSlide(slideId, aspect)) {
          for (const rel of [entry.video, entry.poster].filter(
            (p): p is string => Boolean(p),
          )) {
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
  it("covers the four off-style plates plus the world hero retake", () => {
    expect(PLATE_RETAKES.map((r) => r.plateFile).sort()).toEqual([
      "sp-stack-02-world.png",
      "sp-stack-13-executive.png",
      "sp-stack-15-closing.png",
      "sp-stack-18-different.png",
      "sp-stack-19-future.png",
    ]);
  });

  it("tells the world hero as a real aerial neon city whose routes branch", () => {
    const world = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-02-world.png",
    );
    expect(world).toBeDefined();
    expect(world!.slideId).toBe("02-world");
    expect(world!.style).toBe(NEON_CITY_STYLE_ANCHOR);
    expect(world!.subject).toMatch(/aerial|above/i);
    expect(world!.subject).toMatch(/city|metropolis/i);
    expect(world!.subject).toMatch(/branch/i);
  });

  it("locks retake prompts to their style anchor and text ban", () => {
    for (const retake of PLATE_RETAKES) {
      const prompt = buildPlateRetakePrompt(retake);
      expect(prompt).toContain(retake.style ?? CHIP_STYLE_ANCHOR);
      expect(prompt).toContain(OMNI_TEXT_BAN);
      expect(`${retake.subject}`).not.toMatch(/[0-9%$"]/);
      if (retake.style) {
        expect(prompt, retake.plateFile).not.toContain(CHIP_STYLE_ANCHOR);
      }
    }
  });
});
