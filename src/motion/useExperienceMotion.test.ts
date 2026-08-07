import { describe, expect, it } from "vitest";
import {
  buildCardShuffleVars,
  buildOutgoingTweenVars,
  buildParallaxLayerVars,
  experienceMotionEnabled,
  sceneScrollHeightVh,
  shouldRefreshScrollTriggerOnResize,
} from "./experienceMotionConfig";

describe("experienceMotionConfig", () => {
  it("disables pin/scrub motion under reduced-motion", () => {
    expect(experienceMotionEnabled({ reduceMotion: true, coarsePointer: false })).toBe(
      false,
    );
    expect(experienceMotionEnabled({ reduceMotion: false, coarsePointer: false })).toBe(
      true,
    );
  });

  it("shortens dwell distance on coarse pointers", () => {
    expect(sceneScrollHeightVh({ coarsePointer: false })).toBeGreaterThan(
      sceneScrollHeightVh({ coarsePointer: true }),
    );
  });

  it("ignores mobile URL-bar height jitter on coarse pointers", () => {
    expect(
      shouldRefreshScrollTriggerOnResize({
        coarsePointer: true,
        previousWidth: 390,
        previousHeight: 844,
        nextWidth: 390,
        nextHeight: 780,
      }),
    ).toBe(false);
    expect(
      shouldRefreshScrollTriggerOnResize({
        coarsePointer: true,
        previousWidth: 390,
        previousHeight: 844,
        nextWidth: 844,
        nextHeight: 390,
      }),
    ).toBe(true);
    expect(
      shouldRefreshScrollTriggerOnResize({
        coarsePointer: false,
        previousWidth: 1440,
        previousHeight: 900,
        nextWidth: 1440,
        nextHeight: 860,
      }),
    ).toBe(true);
  });

  it("assigns visibly different travel to each depth plane", () => {
    const media = buildParallaxLayerVars("media");
    const scrim = buildParallaxLayerVars("scrim");
    const eyebrow = buildParallaxLayerVars("eyebrow");
    const headline = buildParallaxLayerVars("headline");
    const body = buildParallaxLayerVars("body");

    expect(
      new Set([
        media.yPercent,
        scrim.yPercent,
        eyebrow.yPercent,
        headline.yPercent,
        body.yPercent,
      ]).size,
    ).toBe(5);
    expect(media.scale).toBeGreaterThan(1);
    expect(Math.abs(headline.yPercent)).toBeGreaterThan(
      Math.abs(body.yPercent),
    );
  });

  it("keeps the outgoing card flat while it recedes", () => {
    const vars = buildOutgoingTweenVars();
    expect(vars.scale).toBe(0.94);
    expect(vars.opacity).toBeLessThan(1);
    expect(vars).not.toHaveProperty("rotation");
    expect(vars).not.toHaveProperty("rotationX");
    expect(vars).not.toHaveProperty("rotationY");
  });

  it("moves the incoming card by one viewport without stacking transforms", () => {
    const vars = buildCardShuffleVars(900);
    expect(vars.from).toEqual({ y: 900, scale: 1.02, opacity: 1 });
    expect(vars.to).toEqual({ y: 0, scale: 1, opacity: 1 });
    expect(vars.from).not.toHaveProperty("yPercent");
  });
});
