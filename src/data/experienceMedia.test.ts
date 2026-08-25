import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SLIDES } from "./slides";
import {
  EXPERIENCE_MEDIA,
  assertExperienceMediaValid,
  experienceMediaForSlide,
  mediaWindow,
  publicExperiencePath,
  resolveExperienceSrc,
  type ExperienceMedia,
} from "./experienceMedia";

const appRoot = resolve(import.meta.dirname, "../..");

function fileMd5(publicPath: string): string {
  const abs = resolve(appRoot, publicExperiencePath(publicPath));
  return createHash("md5").update(readFileSync(abs)).digest("hex");
}

describe("experienceMedia", () => {
  it("maps exactly 24 unique scenes that match SLIDES order", () => {
    expect(EXPERIENCE_MEDIA).toHaveLength(SLIDES.length);
    expect(EXPERIENCE_MEDIA).toHaveLength(24);
    expect(EXPERIENCE_MEDIA.map((m) => m.slideId)).toEqual(
      SLIDES.map((s) => s.id),
    );
    expect(new Set(EXPERIENCE_MEDIA.map((m) => m.slideId)).size).toBe(24);
  });

  it("serves every scene as a still-only title plate from conceptSrc", () => {
    for (const media of EXPERIENCE_MEDIA) {
      const slide = SLIDES.find((s) => s.id === media.slideId)!;
      expect(media.stillOnly).toBe(true);
      expect(media.landscape.src).toBe("");
      expect(media.portrait.src).toBe("");
      expect(media.landscape.poster).toBe(slide.conceptSrc);
      expect(media.portrait.poster).toBe(slide.conceptSrc);
      expect(media.landscape.poster).toMatch(/^\/concepts\/clean\//);
      expect(media.landscape.width).toBe(1920);
      expect(media.landscape.height).toBe(1080);
    }
  });

  it("marks the closing scene for deterministic brand lockup treatment", () => {
    const closing = experienceMediaForSlide("15-closing");
    expect(closing?.brandLockup).toBe(true);
    expect(closing?.stillOnly).toBe(true);
    expect(
      EXPERIENCE_MEDIA.filter((m) => m.brandLockup).map((m) => m.slideId),
    ).toEqual(["15-closing"]);
  });

  it("uses photoreal title stills for the signed-off opening six scenes", () => {
    for (const id of [
      "01-title",
      "02-world",
      "03-four-stacks",
      "04-flywheel",
      "05-product",
      "06-brand",
    ] as const) {
      const media = experienceMediaForSlide(id);
      expect(media?.stillOnly).toBe(true);
      expect(media?.landscape.src).toBe("");
      expect(media?.landscape.poster).toBe(
        SLIDES.find((s) => s.id === id)!.conceptSrc,
      );
    }
  });

  it("uses the global-media chip as the brand title plate", () => {
    const brandPoster = experienceMediaForSlide("06-brand")!.landscape.poster;
    expect(brandPoster).toBe("/concepts/clean/sp-stack-06-brand.png");
    expect(fileMd5(brandPoster)).toBe(
      fileMd5("/concepts/chips/06-brand/16x9/global-media.png"),
    );
  });

  it("uses the photoreal Porsche road retake as the fast-start title plate", () => {
    const poster = experienceMediaForSlide("08-fast-start")!.landscape.poster;
    expect(poster).toBe("/concepts/clean/sp-stack-08-fast-start.png");
    expect(fileMd5(poster)).toBe(
      fileMd5("/concepts/clean-retakes/16x9/sp-stack-08-fast-start.png"),
    );
  });

  it("uses the photoreal mountain rope-team retake as the team-overrides title plate", () => {
    const poster = experienceMediaForSlide("09-team-overrides")!.landscape.poster;
    expect(poster).toBe("/concepts/clean/sp-stack-09-team-overrides.png");
    expect(fileMd5(poster)).toBe(
      fileMd5("/concepts/clean-retakes/16x9/sp-stack-09-team-overrides.png"),
    );
  });

  it("uses the photoreal ocean free-dive retake as the md-depth title plate", () => {
    const poster = experienceMediaForSlide("10-md-depth")!.landscape.poster;
    expect(poster).toBe("/concepts/clean/sp-stack-10-unlimited-depth.png");
    expect(fileMd5(poster)).toBe(
      fileMd5("/concepts/clean-retakes/16x9/sp-stack-10-unlimited-depth.png"),
    );
  });

  it("uses the photoreal river-delta retake as the vp-override title plate", () => {
    const poster = experienceMediaForSlide("11-vp-override")!.landscape.poster;
    expect(poster).toBe("/concepts/clean/sp-stack-11-vp-override.png");
    expect(fileMd5(poster)).toBe(
      fileMd5("/concepts/clean-retakes/16x9/sp-stack-11-vp-override.png"),
    );
  });

  it("uses the photoreal mentorship-studio retake as the generations title plate", () => {
    const poster = experienceMediaForSlide("12-generations")!.landscape.poster;
    expect(poster).toBe("/concepts/clean/sp-stack-12-generations.png");
    expect(fileMd5(poster)).toBe(
      fileMd5("/concepts/clean-retakes/16x9/sp-stack-12-generations.png"),
    );
  });

  it("uses the photoreal dawn-summit retake as the executive title plate", () => {
    const poster = experienceMediaForSlide("13-executive")!.landscape.poster;
    expect(poster).toBe("/concepts/clean/sp-stack-13-executive.png");
    expect(fileMd5(poster)).toBe(
      fileMd5("/concepts/clean-retakes/16x9/sp-stack-13-executive.png"),
    );
  });

  it("uses the photoreal hallway-doorways retake as the different title plate", () => {
    const poster = experienceMediaForSlide("18-different")!.landscape.poster;
    expect(poster).toBe("/concepts/clean/sp-stack-18-different.png");
    expect(fileMd5(poster)).toBe(
      fileMd5("/concepts/clean-retakes/16x9/sp-stack-18-different.png"),
    );
  });

  it("uses the photoreal empty dawn-highway retake as the future title plate", () => {
    const poster = experienceMediaForSlide("19-future")!.landscape.poster;
    expect(poster).toBe("/concepts/clean/sp-stack-19-future.png");
    expect(fileMd5(poster)).toBe(
      fileMd5("/concepts/clean-retakes/16x9/sp-stack-19-future.png"),
    );
  });

  it("uses the photoreal open-gate retake as the closing title plate", () => {
    const poster = experienceMediaForSlide("15-closing")!.landscape.poster;
    expect(poster).toBe("/concepts/clean/sp-stack-15-closing.png");
    expect(fileMd5(poster)).toBe(
      fileMd5("/concepts/clean-retakes/16x9/sp-stack-15-closing.png"),
    );
    expect(experienceMediaForSlide("15-closing")!.brandLockup).toBe(true);
  });

  it("wires four photoreal chip stills onto remaining title plates", () => {
    const wired: Array<{ slideId: string; chip: string }> = [
      {
        slideId: "07-development",
        chip: "/concepts/chips/04-flywheel/16x9/development-creates-leaders.png",
      },
      {
        slideId: "08-ten-layers",
        chip: "/concepts/chips/04-flywheel/16x9/income-creates-opportunity.png",
      },
      {
        slideId: "07-retail",
        chip: "/concepts/chips/04-flywheel/16x9/products-create-customers.png",
      },
      {
        slideId: "17-compounding",
        chip: "/concepts/chips/05-product/16x9/trusted-by-millions.png",
      },
    ];
    for (const { slideId, chip } of wired) {
      const poster = experienceMediaForSlide(slideId)!.landscape.poster;
      expect(poster).toBe(SLIDES.find((s) => s.id === slideId)!.conceptSrc);
      expect(fileMd5(poster)).toBe(fileMd5(chip));
    }
  });

  it("keeps a three-scene media window for scroll attachment", () => {
    expect(mediaWindow(0, 20)).toEqual([0, 1]);
    expect(mediaWindow(7, 20)).toEqual([6, 7, 8]);
    expect(mediaWindow(19, 20)).toEqual([18, 19]);
  });

  it("points public paths at files that exist on disk", () => {
    assertExperienceMediaValid(EXPERIENCE_MEDIA);
    for (const media of EXPERIENCE_MEDIA) {
      for (const variant of [media.landscape, media.portrait]) {
        if (variant.src) {
          expect(existsSync(resolve(appRoot, publicExperiencePath(variant.src)))).toBe(
            true,
          );
        }
        expect(
          existsSync(resolve(appRoot, publicExperiencePath(variant.poster))),
        ).toBe(true);
      }
    }
  });

  it("does not serve a super-stack opener", () => {
    expect(experienceMediaForSlide("00-super-stack")).toBeUndefined();
  });

  it("treats an empty src as still-only poster media", () => {
    const still: ExperienceMedia = {
      slideId: "05-product",
      stillOnly: true,
      landscape: {
        src: "",
        poster: "/concepts/clean/sp-stack-07-retail.png",
        width: 1920,
        height: 1080,
      },
      portrait: {
        src: "",
        poster: "/concepts/clean/sp-stack-07-retail.png",
        width: 1920,
        height: 1080,
      },
    };
    expect(still.stillOnly).toBe(true);
    expect(still.landscape.src).toBe("");
  });

  it("keeps four-stacks landscape poster distinct from the title still", () => {
    const title = experienceMediaForSlide("01-title")!.landscape.poster;
    const fourStacks = experienceMediaForSlide("03-four-stacks")!.landscape.poster;
    const titleHash = fileMd5(title);
    const fourStacksHash = fileMd5(fourStacks);
    expect(fourStacksHash).not.toBe(titleHash);
    // Photoreal harbor plate — guard against a near-duplicate title still.
    expect(fourStacksHash).toBe("c4eefbc35028b95b71441265b8050275");
  });
});
