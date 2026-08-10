import { describe, expect, it } from "vitest";
import { SLIDES } from "../data/slides";
import * as MotionConfig from "./experienceMotionConfig";

const ROTATION_KEYS = [
  "rotation",
  "rotationX",
  "rotationY",
  "rotate",
  "rotateX",
  "rotateY",
  "skew",
  "skewX",
  "skewY",
] as const;

function assertNoRotation(value: unknown, path = "choreography"): void {
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      assertNoRotation(item, `${path}[${index}]`);
    }
    return;
  }
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    expect(
      ROTATION_KEYS,
      `${path}.${key} must not use ornamental rotation`,
    ).not.toContain(key);
    assertNoRotation(nested, `${path}.${key}`);
  }
}

describe("Premium V2 web choreography", () => {
  it("exports resolveWebChoreography derived from slide motionPreset ids", () => {
    expect(typeof MotionConfig.resolveWebChoreography).toBe("function");
  });

  it("maps every slide motionPreset to handoff and dwell phases", () => {
    const resolve = MotionConfig.resolveWebChoreography as (
      preset: string,
    ) => {
      presetId: string;
      handoff: { durationRatio: number };
      dwell: { mediaDrift: { yPercent: number; scale: number } };
    };

    for (const slide of SLIDES) {
      const choreo = resolve(slide.motionPreset);
      expect(choreo.presetId, slide.id).toBe(slide.motionPreset);
      expect(choreo.handoff.durationRatio).toBeGreaterThan(0);
      expect(choreo.handoff.durationRatio).toBeLessThan(1);
      expect(choreo.dwell.mediaDrift.scale).toBeGreaterThanOrEqual(1);
      expect(choreo.dwell.mediaDrift.scale).toBeLessThanOrEqual(1.06);
      assertNoRotation(choreo, slide.motionPreset);
    }
  });

  it("uses unique preset ids without inventing rotation-based web motion", () => {
    const resolve = MotionConfig.resolveWebChoreography as (preset: string) => {
      presetId: string;
    };
    const ids = SLIDES.map((slide) => resolve(slide.motionPreset).presetId);
    expect(new Set(ids).size).toBe(new Set(SLIDES.map((s) => s.motionPreset)).size);
  });

  it("hands dwell motion the exact transforms produced by handoff", () => {
    const choreography = MotionConfig.resolveWebChoreography(
      SLIDES[1].motionPreset,
    );
    expect(choreography.handoff.mediaEnd).toEqual(
      MotionConfig.buildParallaxLayerVars("media"),
    );
    expect(choreography.handoff.scrimEnd).toEqual(
      MotionConfig.buildParallaxLayerVars("scrim"),
    );
    expect(choreography.dwell.mediaFrom).toEqual(
      choreography.handoff.mediaEnd,
    );
    expect(choreography.dwell.scrimFrom).toEqual(
      choreography.handoff.scrimEnd,
    );
  });

  it("uses touch copyMode on coarse pointers without body parallax scrub", () => {
    const cinematic = MotionConfig.resolveWebChoreography(
      SLIDES[1].motionPreset,
      { coarsePointer: false },
    );
    const touch = MotionConfig.resolveWebChoreography(SLIDES[1].motionPreset, {
      coarsePointer: true,
    });
    expect(cinematic.copyMode).toBe("cinematic");
    expect(cinematic.parallaxCopyLayers).toBe(true);
    expect(touch.copyMode).toBe("touch");
    expect(touch.parallaxCopyLayers).toBe(false);
    expect(touch.headlineLineStagger).toBeLessThan(cinematic.headlineLineStagger);
    expect(touch.handoff.copyStagger).toBeLessThanOrEqual(
      cinematic.handoff.copyStagger,
    );
  });

  it("provides modest dwell with a shorter touch scroll track", () => {
    expect(MotionConfig.sceneScrollHeightVh({ coarsePointer: false })).toBeGreaterThan(
      MotionConfig.sceneScrollHeightVh({ coarsePointer: true }),
    );
    expect(MotionConfig.sceneScrollHeightVh({ coarsePointer: true })).toBeGreaterThan(
      100,
    );
    expect(
      MotionConfig.sceneScrollHeightVh({ coarsePointer: false }),
    ).toBeLessThanOrEqual(180);
  });

  it("skips the zero-distance first-scene dwell range", () => {
    expect(MotionConfig.sceneDwellEnabled(0)).toBe(false);
    expect(MotionConfig.sceneDwellEnabled(1)).toBe(true);
    expect(MotionConfig.sceneDwellEnabled(14)).toBe(true);
  });

  it("ignores coarse height-only resize jitter while refreshing on orientation", () => {
    expect(
      MotionConfig.shouldRefreshScrollTriggerOnResize({
        coarsePointer: true,
        previousWidth: 390,
        previousHeight: 844,
        nextWidth: 390,
        nextHeight: 760,
      }),
    ).toBe(false);
    expect(
      MotionConfig.shouldRefreshScrollTriggerOnResize({
        coarsePointer: true,
        previousWidth: 390,
        previousHeight: 844,
        nextWidth: 844,
        nextHeight: 390,
      }),
    ).toBe(true);
  });

  it("measures an svh probe for shuffle distance", () => {
    expect(typeof MotionConfig.measureSceneViewportHeight).toBe("function");
    const height = MotionConfig.measureSceneViewportHeight();
    expect(height).toBeGreaterThan(0);
  });

  it("computes max scroll from a stable viewport height", () => {
    expect(MotionConfig.computeMaxScroll(2000, 800)).toBe(1200);
    expect(MotionConfig.computeMaxScroll(500, 800)).toBe(0);
  });

  it("resets future cards to a deterministic hidden state after rapid jumps", () => {
    expect(MotionConfig.sceneLayerState(10, 14, 900)).toEqual({
      y: 0,
      scale: 1,
      opacity: 1,
      visibility: "visible",
    });
    expect(MotionConfig.sceneLayerState(14, 7, 900)).toEqual({
      y: 900,
      scale: 1.02,
      opacity: 1,
      visibility: "hidden",
    });
  });
});
