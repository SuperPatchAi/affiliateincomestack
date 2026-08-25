import { describe, expect, it } from "vitest";
import {
  FILM_SLIDES,
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
  });

  it("strips leading slash for Remotion staticFile paths", () => {
    expect(publicAssetPath("/concepts/clean/x.png")).toBe(
      "concepts/clean/x.png",
    );
    expect(publicAssetPath("concepts/clean/x.png")).toBe(
      "concepts/clean/x.png",
    );
  });

  it("keeps the film on the 23-scene cut without headline-only openers", () => {
    expect(FILM_SLIDES).toHaveLength(23);
    expect(FILM_SLIDES.map((s) => s.id)).not.toContain("00-era");
    expect(FILM_SLIDES.map((s) => s.id)).not.toContain("00b-mission");
    expect(FILM_SLIDES[0].id).toBe("01-title");
  });
});
