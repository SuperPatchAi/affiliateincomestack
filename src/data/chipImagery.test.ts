import { describe, expect, it } from "vitest";

import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  CHIP_IMAGE_SPECS,
  CHIP_MEDIA_READY_SLIDES,
  CHIP_STYLE_ANCHOR,
  CHIP_VIDEO_READY_SLIDES,
  DAYLIGHT_CITY_STYLE_ANCHOR,
  SUNSET_BEACH_STYLE_ANCHOR,
  PLATE_RETAKES,
  NEON_CITY_STYLE_ANCHOR,
  buildChipImagePrompt,
  buildChipMotionPrompt,
  buildPlateRetakePrompt,
  buildPlatePatchEditPrompt,
  buildPortraitRecomposePrompt,
  chipImagePath,
  CHIP_CUTOUT_SLIDES,
  chipCutoutForSlide,
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

  it("grounds every title chip in a daylight cityscape with no neon", () => {
    const titleSpecs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === "01-title");
    expect(titleSpecs).toHaveLength(3);
    for (const spec of titleSpecs) {
      const prompt = buildChipImagePrompt(spec);
      expect(prompt).toContain(spec.style);
      expect(spec.subject.toLowerCase()).not.toMatch(/neon/);
      expect(spec.setting?.toLowerCase()).not.toMatch(/neon|night/);
    }
    const [health, freedom, impact] = titleSpecs;
    expect(health.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
    expect(freedom.style).toBe(SUNSET_BEACH_STYLE_ANCHOR);
    expect(impact.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
    expect(health.subject).toMatch(/runner|sprint/i);
    expect(freedom.subject).toMatch(/beach|sunset/i);
    expect(impact.subject).toMatch(/people/i);
  });

  it("tells bigger-impact as a late-morning rooftop circle, not an aerial crowd", () => {
    const impact = CHIP_IMAGE_SPECS.find((s) => s.slug === "bigger-impact")!;
    expect(impact.setting).toMatch(/rooftop|terrace/i);
    expect(impact.setting).toMatch(/late morning/i);
    expect(impact.subject).toMatch(/rooftop|terrace/i);
    expect(impact.subject).not.toMatch(
      /aerial|straight down|crossing|patch|golden hour|sunset/i,
    );
    expect(impact.setting).not.toMatch(/golden hour|sunset|night/i);
    expect(impact.motion).toMatch(/\b(the subject|they)\b/i);
    expect(impact.motion).not.toMatch(/people below|aerial|patch/i);
    expect(`${impact.subject} ${impact.setting} ${impact.motion}`).not.toMatch(
      /patch/i,
    );
  });

  it("grounds every world chip in a daylight cityscape with no neon", () => {
    const specs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === "02-world");
    expect(specs).toHaveLength(4);
    for (const spec of specs) {
      expect(spec.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
      const prompt = buildChipImagePrompt(spec);
      expect(prompt).toContain(DAYLIGHT_CITY_STYLE_ANCHOR);
      expect(spec.subject.toLowerCase()).not.toMatch(/neon/);
      expect(spec.setting?.toLowerCase()).not.toMatch(/neon|night/);
    }
    const [jobs, gig, creator, social] = specs;
    expect(jobs.subject).toMatch(/office|tower|glass/i);
    expect(gig.subject).toMatch(/rider|scooter/i);
    expect(creator.subject).toMatch(/window|city/i);
    expect(social.subject).toMatch(/cafe|street|table/i);
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

  it("keeps the daylight city photoreal, sunlit, and free of readable signage", () => {
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).toMatch(/photoreal/i);
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).toMatch(/daylight/i);
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).toMatch(/late-morning/i);
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).not.toMatch(/rain-slicked|after dark/);
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).toMatch(/no readable characters/i);
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).toMatch(/center/i);
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
    const tron = CHIP_IMAGE_SPECS.filter((s) => !s.setting);
    expect(tron.length).toBeGreaterThan(1);
    const prompt = buildChipMotionPrompt(tron[0], tron[1]);
    expect(prompt).toMatch(/warp|accelerat/i);
    expect(prompt).toContain(tron[1].accent);
  });

  it("keeps a photoreal first clip inside its own scene", () => {
    const health = CHIP_IMAGE_SPECS.find((s) => s.slug === "better-health")!;
    const freedom = CHIP_IMAGE_SPECS.find((s) => s.slug === "greater-freedom")!;
    const prompt = buildChipMotionPrompt(health, freedom);
    expect(prompt).toContain(health.motion);
    expect(prompt).toMatch(/this one scene|motion only/i);
    expect(prompt).not.toContain(freedom.accent);
    expect(prompt).not.toMatch(/beach|sunset/i);
  });

  it("keeps each photoreal clip in one scene and prompts for subtle motion only", () => {
    const health = CHIP_IMAGE_SPECS.find((s) => s.slug === "better-health")!;
    const freedom = CHIP_IMAGE_SPECS.find((s) => s.slug === "greater-freedom")!;
    const impact = CHIP_IMAGE_SPECS.find((s) => s.slug === "bigger-impact")!;
    const prompt = buildChipMotionPrompt(freedom, impact, health);
    expect(prompt).toMatch(/motion only/i);
    expect(prompt).toMatch(/one scene|single scene|this one scene/i);
    expect(prompt).toMatch(/subtle/i);
    expect(prompt).not.toMatch(/last frame of the previous/i);
    expect(prompt).not.toMatch(/arrive at|travel naturally into|last frame of the previous/i);
    expect(prompt).not.toMatch(/IMAGE_REF_1/i);
    expect(prompt).toContain(freedom.motion);
  });

  it("keeps photoreal chip exits free of neon streak warps", () => {
    const photoreal = CHIP_IMAGE_SPECS.filter((s) => s.setting);
    expect(photoreal.length).toBeGreaterThan(1);
    const next = photoreal[1];
    for (const spec of photoreal) {
      const prompt = buildChipMotionPrompt(spec, next, photoreal[0]);
      expect(prompt, spec.slug).not.toMatch(/neon|streaking light/i);
    }
  });

  it("uses each spec's setting instead of the abstract dark void", () => {
    const world = CHIP_IMAGE_SPECS.find((s) => s.slideId === "02-world")!;
    const worldPrompt = buildChipMotionPrompt(world, null);
    expect(worldPrompt).toContain(world.motion);
    expect(worldPrompt).toMatch(/motion only/i);
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
    for (const slideId of CHIP_MEDIA_READY_SLIDES.filter(
      (id) => !CHIP_CUTOUT_SLIDES.includes(id),
    )) {
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

  it("serves 02-world as still backdrops, not cutouts", () => {
    const entries = chipMediaForSlide("02-world", "landscape");
    expect(entries).toHaveLength(4);
    expect(chipCutoutForSlide("02-world", "landscape")).toEqual([]);
  });
});

describe("chip cutout wiring", () => {
  it("has no cutout slides while cityscapes are the 02 treatment", () => {
    expect(CHIP_CUTOUT_SLIDES).toEqual([]);
  });

  it("returns nothing for title or unknown slides", () => {
    expect(chipCutoutForSlide("01-title", "landscape")).toEqual([]);
    expect(chipCutoutForSlide("nope", "portrait")).toEqual([]);
  });
});

describe("chip media wiring leftovers", () => {
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
      "sp-stack-01-title.png",
      "sp-stack-02-world.png",
      "sp-stack-13-executive.png",
      "sp-stack-15-closing.png",
      "sp-stack-18-different.png",
      "sp-stack-19-future.png",
    ]);
  });

  it("tells the title hero as a daylight SuperPatch life, not a neon stack", () => {
    const title = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-01-title.png",
    );
    expect(title).toBeDefined();
    expect(title!.slideId).toBe("01-title");
    expect(title!.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
    expect(title!.subject).toMatch(/patch|wellness|person|terrace|window/i);
    expect(title!.subject).toMatch(/fingerprint|rounded.square|circle.x/i);
    expect(title!.subject.toLowerCase()).not.toMatch(/neon|slab|wireframe|beige oval/);
  });

  it("edits the title plate by swapping only the arm patch for the product still", () => {
    const prompt = buildPlatePatchEditPrompt();
    expect(prompt).toMatch(/attached photograph/i);
    expect(prompt).toMatch(/upper arm/i);
    expect(prompt).toMatch(/fingerprint/i);
    expect(prompt).toMatch(/keep|identical|same/i);
    expect(prompt).toContain(OMNI_TEXT_BAN);
  });

  it("tells the world hero as a real aerial daylight city whose routes branch", () => {
    const world = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-02-world.png",
    );
    expect(world).toBeDefined();
    expect(world!.slideId).toBe("02-world");
    expect(world!.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
    expect(world!.subject).toMatch(/aerial|above/i);
    expect(world!.subject).toMatch(/city|metropolis/i);
    expect(world!.subject).toMatch(/branch/i);
    expect(world!.subject.toLowerCase()).not.toMatch(/neon/);
    expect(world!.accent.toLowerCase()).not.toMatch(/neon|night/);
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
