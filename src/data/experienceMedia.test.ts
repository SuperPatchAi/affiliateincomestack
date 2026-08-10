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
} from "./experienceMedia";

const appRoot = resolve(import.meta.dirname, "../..");

function fileMd5(publicPath: string): string {
  const abs = resolve(appRoot, publicExperiencePath(publicPath));
  return createHash("md5").update(readFileSync(abs)).digest("hex");
}

describe("experienceMedia", () => {
  it("maps exactly 15 unique scenes that match SLIDES order", () => {
    expect(EXPERIENCE_MEDIA).toHaveLength(15);
    expect(EXPERIENCE_MEDIA.map((m) => m.slideId)).toEqual(
      SLIDES.map((s) => s.id),
    );
    expect(new Set(EXPERIENCE_MEDIA.map((m) => m.slideId)).size).toBe(15);
  });

  it("provides landscape and portrait clips plus WebP posters for every scene", () => {
    for (const media of EXPERIENCE_MEDIA) {
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

  it("resolves aspect-specific sources and keeps a three-scene media window", () => {
    const title = experienceMediaForSlide("01-title");
    expect(title).toBeTruthy();
    expect(resolveExperienceSrc(title!, "landscape").src).toContain("/16x9/");
    expect(resolveExperienceSrc(title!, "portrait").src).toContain("/9x16/");
    expect(mediaWindow(0, 15)).toEqual([0, 1]);
    expect(mediaWindow(7, 15)).toEqual([6, 7, 8]);
    expect(mediaWindow(14, 15)).toEqual([13, 14]);
  });

  it("points public paths at files that exist on disk", () => {
    assertExperienceMediaValid(EXPERIENCE_MEDIA);
    for (const media of EXPERIENCE_MEDIA) {
      for (const variant of [media.landscape, media.portrait]) {
        expect(existsSync(resolve(appRoot, publicExperiencePath(variant.src)))).toBe(
          true,
        );
        expect(
          existsSync(resolve(appRoot, publicExperiencePath(variant.poster))),
        ).toBe(true);
      }
    }
  });

  it("keeps four-stacks landscape poster distinct from the-question woman still", () => {
    const question = experienceMediaForSlide("02-question")!.landscape.poster;
    const fourStacks = experienceMediaForSlide("03-four-stacks")!.landscape.poster;
    const questionHash = fileMd5(question);
    const fourStacksHash = fileMd5(fourStacks);
    expect(fourStacksHash).not.toBe(questionHash);
    // Guard against a near-duplicate woman still being copied under the four-stacks name.
    expect(fourStacksHash).toBe("49c66a63b61b7a0579c6d1e8ee798439");
  });
});
