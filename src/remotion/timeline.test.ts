import { describe, expect, it } from "vitest";
import {
  SLIDES,
  STILL_CLIP_SEC,
  HERO_CLIP_SEC,
  clipDurationSec,
} from "../data/slides";
import {
  FPS,
  TRANSITION_FRAMES,
  clipFrames,
  filmDurationInFrames,
  publicAssetPath,
} from "./timeline";

describe("remotion timeline", () => {
  it("uses 30 fps and a sub-second fade that fits inside a still clip", () => {
    expect(FPS).toBe(30);
    expect(TRANSITION_FRAMES).toBeGreaterThanOrEqual(15);
    expect(TRANSITION_FRAMES).toBeLessThanOrEqual(20);
    expect(TRANSITION_FRAMES).toBeLessThan(STILL_CLIP_SEC * FPS);
  });

  it("maps still vs hero clip lengths to frames", () => {
    const still = {
      ...SLIDES[0],
      hero: undefined,
      heroVideoSrc: undefined,
    };
    const hero = SLIDES.find((s) => s.heroVideoSrc)!;
    expect(clipFrames(still)).toBe(STILL_CLIP_SEC * FPS);
    expect(clipFrames(hero)).toBe(HERO_CLIP_SEC * FPS);
    expect(clipFrames(still)).toBe(clipDurationSec(still) * FPS);
  });

  it("subtracts overlapping fades from total film length", () => {
    const raw = SLIDES.reduce((sum, s) => sum + clipFrames(s), 0);
    const expected = raw - (SLIDES.length - 1) * TRANSITION_FRAMES;
    expect(filmDurationInFrames(SLIDES)).toBe(expected);
    // 15×10s = 150s raw; 14 fades × 18f = 8.4s overlap → 4248f (~141.6s)
    expect(filmDurationInFrames(SLIDES)).toBe(4248);
  });

  it("strips leading slash for Remotion staticFile paths", () => {
    expect(publicAssetPath("/concepts/clean/x.png")).toBe(
      "concepts/clean/x.png",
    );
    expect(publicAssetPath("concepts/clean/x.png")).toBe(
      "concepts/clean/x.png",
    );
  });
});
