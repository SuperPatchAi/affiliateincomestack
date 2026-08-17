import { describe, expect, it } from "vitest";
import { PATCH_CAMERA_Z } from "./patchHero";
import {
  TITLE_INTRO_DURATION_COMPACT_SEC,
  TITLE_INTRO_DURATION_SEC,
  titleIntroCamera,
  titleIntroDurationSec,
  titleIntroEase,
  titleIntroIdleMix,
  titleIntroProgress,
  titleIntroSpinYaw,
} from "./patchIntro";

describe("title cinematic intro", () => {
  it("maps elapsed time to 0..1 and eases out", () => {
    expect(titleIntroProgress(0, TITLE_INTRO_DURATION_SEC)).toBe(0);
    expect(titleIntroProgress(TITLE_INTRO_DURATION_SEC / 2, TITLE_INTRO_DURATION_SEC)).toBeCloseTo(0.5);
    expect(titleIntroProgress(TITLE_INTRO_DURATION_SEC, TITLE_INTRO_DURATION_SEC)).toBe(1);
    expect(titleIntroProgress(8, TITLE_INTRO_DURATION_SEC)).toBe(1);
    expect(titleIntroEase(0.5)).toBeCloseTo(0.5);
    expect(titleIntroEase(1)).toBe(1);
  });

  it("uses a shorter flyover on compact", () => {
    expect(titleIntroDurationSec(false)).toBe(TITLE_INTRO_DURATION_SEC);
    expect(titleIntroDurationSec(true)).toBe(TITLE_INTRO_DURATION_COMPACT_SEC);
    expect(TITLE_INTRO_DURATION_COMPACT_SEC).toBeLessThan(TITLE_INTRO_DURATION_SEC);
  });

  it("flies over the logo from behind, then settles in the rest seat", () => {
    const yLift = 0.08;
    const start = titleIntroCamera(0, yLift);
    const over = titleIntroCamera(0.45, yLift);
    const end = titleIntroCamera(1, yLift);
    expect(start.z).toBeLessThan(0);
    expect(start.y).toBeGreaterThan(2);
    expect(over.y).toBeGreaterThan(1.8);
    expect(over.z).toBeGreaterThan(-0.6);
    expect(over.z).toBeLessThan(0.9);
    expect(end.x).toBeCloseTo(0);
    expect(end.y).toBeCloseTo(yLift);
    expect(end.z).toBeCloseTo(PATCH_CAMERA_Z);
  });

  it("spins one turn then hands off to idle rock", () => {
    expect(titleIntroSpinYaw(0)).toBeCloseTo(0);
    expect(titleIntroSpinYaw(1)).toBeCloseTo(Math.PI * 2);
    expect(titleIntroIdleMix(0)).toBe(0);
    expect(titleIntroIdleMix(0.7)).toBe(0);
    expect(titleIntroIdleMix(1)).toBe(1);
  });
});
