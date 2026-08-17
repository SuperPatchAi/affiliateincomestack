import { describe, expect, it } from "vitest";
import {
  IDLE_ROCK_PITCH,
  IDLE_ROCK_YAW,
  PATCH_AMBIENT_INTENSITY,
  PATCH_CAMERA_Y,
  PATCH_DIAMOND_ROLL,
  PATCH_FILL_INTENSITY,
  PATCH_MODEL_URL,
  PRODUCT_PATCH_MODEL_URL,
  PATCH_SPOTLIGHTS,
  PATCH_TARGET_HEIGHT,
  PATCH_TONE_MAPPING_EXPOSURE,
  PATCH_Y_LIFT,
  TILT_PITCH_MAX,
  TILT_YAW_MAX,
} from "./patchHero";

describe("patchHero framing", () => {
  it("loads the SuperPatch logo GLB on the title opener", () => {
    expect(PATCH_MODEL_URL).toBe("/models/superpatch_logo.glb");
  });

  it("keeps the original 3D patch GLB for Product Stack", () => {
    expect(PRODUCT_PATCH_MODEL_URL).toBe("/models/superpatch-title.glb");
  });

  it("fits the hero 20 percent larger than the half-size pass", () => {
    expect(PATCH_TARGET_HEIGHT).toBeCloseTo(0.93);
  });

  it("faces the camera square-on with no diamond roll", () => {
    expect(PATCH_DIAMOND_ROLL).toBeCloseTo(0);
  });

  it("uses a pronounced idle rock and a wide hover tilt", () => {
    expect(IDLE_ROCK_YAW).toBeGreaterThanOrEqual((7 * Math.PI) / 180);
    expect(IDLE_ROCK_PITCH).toBeGreaterThanOrEqual((4 * Math.PI) / 180);
    expect(TILT_YAW_MAX).toBeGreaterThanOrEqual((28 * Math.PI) / 180);
    expect(TILT_PITCH_MAX).toBeGreaterThanOrEqual((18 * Math.PI) / 180);
  });

  it("places the hero near the optical center of the slide", () => {
    expect(PATCH_Y_LIFT).toBeLessThan(0.2);
    expect(PATCH_CAMERA_Y).toBeCloseTo(PATCH_Y_LIFT);
  });

  it("lifts the patch out of the dark plate-stack exposure", () => {
    expect(PATCH_AMBIENT_INTENSITY).toBeGreaterThanOrEqual(0.6);
    expect(PATCH_FILL_INTENSITY).toBeGreaterThanOrEqual(1.2);
    expect(PATCH_TONE_MAPPING_EXPOSURE).toBeGreaterThan(0.8);
  });

  it("aims three spotlights down from above the patch", () => {
    expect(PATCH_SPOTLIGHTS).toHaveLength(3);
    for (const spot of PATCH_SPOTLIGHTS) {
      expect(spot.position[1]).toBeGreaterThan(3);
      expect(spot.position[1]).toBeGreaterThan(Math.abs(spot.position[0]));
    }
    const xs = PATCH_SPOTLIGHTS.map((spot) => spot.position[0]).toSorted(
      (a, b) => a - b,
    );
    expect(xs[0]).toBeLessThan(0);
    expect(xs[2]).toBeGreaterThan(0);
  });
});
