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
  it("maps exactly 20 unique scenes that match SLIDES order", () => {
    expect(EXPERIENCE_MEDIA).toHaveLength(SLIDES.length);
    expect(EXPERIENCE_MEDIA).toHaveLength(20);
    expect(EXPERIENCE_MEDIA.map((m) => m.slideId)).toEqual(
      SLIDES.map((s) => s.id),
    );
    expect(new Set(EXPERIENCE_MEDIA.map((m) => m.slideId)).size).toBe(20);
  });

  it("provides Omni mp4s for motion scenes and empty src for still-only rows", () => {
    for (const media of EXPERIENCE_MEDIA) {
      if (media.stillOnly) {
        expect(media.landscape.src).toBe("");
        expect(media.portrait.src).toBe("");
        expect(media.landscape.poster).toMatch(/^\/concepts\/clean\//);
        expect(media.portrait.poster).toMatch(/^\/concepts\/clean\//);
        continue;
      }
      expect(media.landscape.src).toMatch(
        /^\/concepts\/omni-chain\/16x9\/sp-stack-\d{2}-.+_omni\.mp4$/,
      );
      expect(media.portrait.src).toMatch(
        /^\/concepts\/omni-chain\/9x16\/sp-stack-\d{2}-.+_omni\.mp4$/,
      );
      expect(media.landscape.poster).toMatch(
        /^\/concepts\/omni-chain\/posters\/16x9\/sp-stack-\d{2}-.+\.webp$/,
      );
      expect(media.portrait.poster).toMatch(
        /^\/concepts\/omni-chain\/posters\/9x16\/sp-stack-\d{2}-.+\.webp$/,
      );
      expect(media.landscape.width).toBe(1280);
      expect(media.landscape.height).toBe(720);
      expect(media.portrait.width).toBe(720);
      expect(media.portrait.height).toBe(1280);
    }
  });

  it("marks the closing scene for deterministic brand lockup treatment", () => {
    const closing = experienceMediaForSlide("15-closing");
    expect(closing?.brandLockup).toBe(true);
    expect(
      EXPERIENCE_MEDIA.filter((m) => m.brandLockup).map((m) => m.slideId),
    ).toEqual(["15-closing"]);
  });

  it("plays 01-title, 02-world, and 04-flywheel as photoreal Omni plates", () => {
    const title = experienceMediaForSlide("01-title");
    const world = experienceMediaForSlide("02-world");
    const flywheel = experienceMediaForSlide("04-flywheel");
    expect(title?.stillOnly).toBeFalsy();
    expect(world?.stillOnly).toBeFalsy();
    expect(flywheel?.stillOnly).toBeFalsy();
    expect(title?.landscape.src).toBe(
      "/concepts/omni-chain/16x9/sp-stack-01-title_omni.mp4",
    );
    expect(world?.landscape.src).toBe(
      "/concepts/omni-chain/16x9/sp-stack-02-world_omni.mp4",
    );
    expect(flywheel?.landscape.src).toBe(
      "/concepts/omni-chain/16x9/sp-stack-04-flywheel_omni.mp4",
    );
  });

  it("resolves aspect-specific sources and keeps a three-scene media window", () => {
    const stacks = experienceMediaForSlide("03-four-stacks");
    expect(stacks).toBeTruthy();
    expect(resolveExperienceSrc(stacks!, "landscape").src).toContain("/16x9/");
    expect(resolveExperienceSrc(stacks!, "portrait").src).toContain("/9x16/");
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
    // Guard against a near-duplicate woman still being copied under the four-stacks name.
    expect(fourStacksHash).toBe("202f398b34a98a7e60ec7d8e0ce40763");
  });
});
