import { describe, expect, it } from "vitest";
import { PLATE_COUNT } from "./platePalette";
import {
  FOCUS_PEAK_GAP,
  accumulateOrbitRevolutions,
  collapsedPlateYs,
  focusEmissiveBoost,
  focusIndexFromWorldY,
  heroOrbitPhase,
  idleWaveOffset,
  localFocusOffsets,
  stackFloatPose,
  STILL_FLOAT_AMP,
  OPEN_GAP_MULTIPLIER,
  ORBIT_COLLAPSE_DURATION,
  ORBIT_DISTANCE_CLOSE,
  ORBIT_DISTANCE_END,
  ORBIT_DISTANCE_WIDE,
  ORBIT_FLEX_INTRO_MUL,
  ORBIT_FRONT_AZIMUTH,
  ORBIT_INTRO_SPEED,
  ORBIT_POST_SPIN_DURATION,
  ORBIT_REBOUND_DURATION,
  ORBIT_SPIN_DURATION_SEC,
  ORBIT_SPIN_TURNS,
  ORBIT_START_AZIMUTH,
  ORBIT_ZOOM_HOLD_END,
  ORBIT_ZOOM_IN_END,
  createPlatePhysicsState,
  lerpAzimuthShortest,
  orbitAngularAcceleration,
  orbitAngularVelocity,
  orbitAzimuthAt,
  orbitFrontAlignT,
  spinProgressFromElapsed,
  orbitAutoRotateSpeed,
  orbitBreathOffset,
  orbitCameraDistance,
  orbitCollapseTFromElapsed,
  orbitFlexAmpScale,
  orbitFlexPose,
  orbitParallaxZ,
  plateCenterYs,
  platePhysicsToFlexPose,
  plateTargetYs,
  plateTimelineYs,
  springRestLengths,
  stepPlatePhysics,
  toggleAccordion,
} from "./accordionState";

describe("accordionState", () => {
  it("toggles closed ↔ open", () => {
    expect(toggleAccordion("closed")).toBe("open");
    expect(toggleAccordion("open")).toBe("closed");
  });

  it("returns eleven plate center Ys with crown above base", () => {
    const closed = plateCenterYs("closed");
    const open = plateCenterYs("open");
    expect(closed).toHaveLength(PLATE_COUNT);
    expect(open).toHaveLength(PLATE_COUNT);
    expect(closed[0]).toBeGreaterThan(closed[PLATE_COUNT - 1]);
    expect(open[0] - open[1]).toBeGreaterThan(closed[0] - closed[1]);
    expect(open[0] - open[1]).toBeCloseTo(
      (closed[0] - closed[1] - 0.078) * OPEN_GAP_MULTIPLIER + 0.078,
      1,
    );
  });

  it("returns n-1 spring rest lengths that grow when open", () => {
    const closed = springRestLengths("closed");
    const open = springRestLengths("open");
    expect(closed).toHaveLength(PLATE_COUNT - 1);
    expect(open).toHaveLength(PLATE_COUNT - 1);
    expect(open[0]).toBeGreaterThan(closed[0]);
  });

  it("local focus pushes neighbors apart around the hovered plate only", () => {
    const none = localFocusOffsets(null);
    expect(none).toHaveLength(PLATE_COUNT);
    expect(none.every((v) => v === 0)).toBe(true);

    const focus = 5;
    const offsets = localFocusOffsets(focus);
    expect(offsets[focus]).toBeCloseTo(0, 5);
    // Crown side (lower index) moves up; base side moves down.
    expect(offsets[focus - 1]).toBeGreaterThan(0);
    expect(offsets[focus + 1]).toBeLessThan(0);
    expect(Math.abs(offsets[focus - 1])).toBeGreaterThan(
      Math.abs(offsets[focus - 3] ?? 0),
    );
    // Far plates barely move — not a global accordion.
    expect(Math.abs(offsets[0])).toBeLessThan(FOCUS_PEAK_GAP * 0.15);
    expect(Math.abs(offsets[PLATE_COUNT - 1])).toBeLessThan(
      FOCUS_PEAK_GAP * 0.15,
    );
  });

  it("plateTargetYs stay open and widen only near focus", () => {
    const rest = plateTargetYs(null);
    const open = plateCenterYs("open");
    expect(rest).toEqual(open);

    const focused = plateTargetYs(4);
    expect(focused[3] - focused[4]).toBeGreaterThan(open[3] - open[4]);
    expect(focused[4] - focused[5]).toBeGreaterThan(open[4] - open[5]);
  });

  it("neighborAmp scales local focus separation for Trailer impacts", () => {
    const base = localFocusOffsets(5, 1);
    const boosted = localFocusOffsets(5, 1.8);
    expect(Math.abs(boosted[4])).toBeGreaterThan(Math.abs(base[4]));
    expect(Math.abs(plateTargetYs(5, 1.8)[4] - plateTargetYs(5, 1)[4])).toBeGreaterThan(
      0,
    );
  });

  it("idleWaveOffset is bounded and phase-shifted by index", () => {
    const a = idleWaveOffset(0, 0);
    const b = idleWaveOffset(1, 0);
    expect(Math.abs(a)).toBeLessThanOrEqual(0.02);
    expect(a).not.toBeCloseTo(b, 5);
  });

  it("stackFloatPose gently bobs and is quiet under reduced motion", () => {
    expect(stackFloatPose(0, 1.2, true)).toEqual({
      x: 0,
      y: 0,
      z: 0,
      rotX: 0,
    });
    const a = stackFloatPose(0, 1.2, false);
    const b = stackFloatPose(5, 1.2, false);
    expect(Math.abs(a.y)).toBeLessThanOrEqual(STILL_FLOAT_AMP * 1.5);
    expect(a.y).not.toBeCloseTo(b.y, 5);
    expect(Math.abs(a.rotX)).toBeGreaterThan(0);
  });

  it("hover parting is stronger on the collapsed stack than at open rest", () => {
    expect(FOCUS_PEAK_GAP).toBeGreaterThanOrEqual(0.35);
    const openGap = plateTimelineYs(5, 0)[4]! - plateTimelineYs(5, 0)[5]!;
    const closedGap = plateTimelineYs(5, 1)[4]! - plateTimelineYs(5, 1)[5]!;
    expect(closedGap).toBeGreaterThan(openGap * 0.85);
    expect(Math.abs(localFocusOffsets(5, 1.45)[4]!)).toBeGreaterThan(0.28);
  });

  it("orbitFlexPose twists around the long (X) axis of each plate", () => {
    const crown = orbitFlexPose(0, 0.4);
    const mid = orbitFlexPose(5, 0.4);
    const turned = orbitFlexPose(0, 1.8);
    expect(crown.rotX).not.toBeCloseTo(mid.rotX, 5);
    // Twist = rotation about plate width (X); rotX dominates rotZ.
    expect(Math.abs(crown.rotX)).toBeGreaterThan(Math.abs(crown.rotZ));
    expect(Math.abs(turned.rotX - crown.rotX)).toBeGreaterThan(0.01);
    expect(orbitFlexPose(3, 1.2, true)).toEqual({
      x: 0,
      y: 0,
      z: 0,
      rotX: 0,
      rotZ: 0,
    });
    const boosted = orbitFlexPose(0, 0.4, false, 1.5);
    expect(Math.abs(boosted.rotX)).toBeGreaterThan(Math.abs(crown.rotX));
  });

  it("ramps into fast spin + strong flex for the close hold and zoom-out", () => {
    expect(orbitAutoRotateSpeed(0)).toBeLessThan(ORBIT_INTRO_SPEED);
    expect(orbitAutoRotateSpeed(ORBIT_ZOOM_HOLD_END)).toBeCloseTo(
      ORBIT_INTRO_SPEED,
      5,
    );
    expect(orbitAutoRotateSpeed(0.9)).toBeCloseTo(ORBIT_INTRO_SPEED, 5);
    expect(orbitFlexAmpScale(0, 0)).toBeLessThan(0.2);
    expect(orbitFlexAmpScale(ORBIT_ZOOM_HOLD_END, 0)).toBeCloseTo(
      ORBIT_FLEX_INTRO_MUL,
      5,
    );
    expect(orbitFlexAmpScale(0.95, 0)).toBeCloseTo(ORBIT_FLEX_INTRO_MUL, 5);

    const stepped = accumulateOrbitRevolutions(0, 0, Math.PI);
    expect(stepped.revolutions).toBeCloseTo(0.5, 5);
    const wrapped = accumulateOrbitRevolutions(0.9, 3.0, -3.0);
    expect(wrapped.revolutions).toBeGreaterThan(0.9);
  });

  it("phases spin → collapse → rebound → still, then freezes motion", () => {
    expect(heroOrbitPhase(0, 0)).toBe("spin");
    expect(heroOrbitPhase(0.99, 0)).toBe("spin");
    expect(heroOrbitPhase(1, 0)).toBe("collapse");
    expect(heroOrbitPhase(1, ORBIT_COLLAPSE_DURATION * 0.4)).toBe("collapse");
    expect(heroOrbitPhase(1, ORBIT_COLLAPSE_DURATION)).toBe("rebound");
    expect(
      heroOrbitPhase(1, ORBIT_COLLAPSE_DURATION + ORBIT_REBOUND_DURATION * 0.5),
    ).toBe("rebound");
    expect(heroOrbitPhase(1, ORBIT_POST_SPIN_DURATION)).toBe("still");

    expect(orbitCollapseTFromElapsed(0)).toBe(0);
    expect(orbitCollapseTFromElapsed(ORBIT_COLLAPSE_DURATION)).toBeCloseTo(1, 5);
    // Rebound expands briefly (collapseT dips), then settles closed again.
    const midRebound = orbitCollapseTFromElapsed(
      ORBIT_COLLAPSE_DURATION + ORBIT_REBOUND_DURATION * 0.5,
    );
    expect(midRebound).toBeLessThan(0.85);
    expect(midRebound).toBeGreaterThan(0.4);
    expect(orbitCollapseTFromElapsed(ORBIT_POST_SPIN_DURATION)).toBeCloseTo(
      1,
      5,
    );

    expect(orbitFlexAmpScale(1, 0)).toBeCloseTo(ORBIT_FLEX_INTRO_MUL, 5);
    expect(orbitFlexAmpScale(1, ORBIT_POST_SPIN_DURATION)).toBe(0);
    expect(orbitAutoRotateSpeed(1, ORBIT_POST_SPIN_DURATION)).toBe(0);
  });

  it("eases camera azimuth toward front during collapse", () => {
    expect(orbitFrontAlignT(0)).toBe(0);
    expect(orbitFrontAlignT(ORBIT_COLLAPSE_DURATION)).toBeCloseTo(1, 5);
    expect(ORBIT_FRONT_AZIMUTH).toBe(0);
    expect(lerpAzimuthShortest(2.8, 0, 1)).toBeCloseTo(0, 5);
    expect(lerpAzimuthShortest(-2.8, 0, 0.5)).toBeGreaterThan(-2.8);
    expect(lerpAzimuthShortest(-2.8, 0, 0.5)).toBeLessThan(0.01);
  });

  it("orbits a full unidirectional turn and lands front — never reverses", () => {
    expect(ORBIT_SPIN_TURNS).toBeGreaterThanOrEqual(1);
    const start = orbitAzimuthAt(0);
    expect(start).toBeCloseTo(ORBIT_START_AZIMUTH, 5);
    const mid = orbitAzimuthAt(0.5);
    const end = orbitAzimuthAt(1);
    expect(mid).toBeGreaterThan(start);
    expect(end).toBeGreaterThan(mid);
    // ≥ one full turn of travel, ending on a front-facing multiple of 2π.
    expect(end - start).toBeGreaterThanOrEqual(Math.PI * 2 * 0.85);
    expect(end % (Math.PI * 2)).toBeCloseTo(ORBIT_FRONT_AZIMUTH, 5);
    // Hold through collapse — no shortest-path reverse.
    expect(orbitAzimuthAt(1, ORBIT_COLLAPSE_DURATION)).toBeCloseTo(end, 5);
    // Sampled path is strictly non-decreasing.
    let prev = start;
    for (let i = 1; i <= 20; i += 1) {
      const az = orbitAzimuthAt(i / 20);
      expect(az).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = az;
    }
  });

  it("exposes orbit omega/alpha for plate inertia during the whip", () => {
    expect(orbitAngularVelocity(0)).toBe(0);
    expect(orbitAngularVelocity(1)).toBe(0);
    expect(orbitAngularVelocity(0.5)).toBeGreaterThan(0);
    // Smoothstep peaks mid-progress; acceleration flips sign around p=0.5.
    expect(orbitAngularAcceleration(0.25)).toBeGreaterThan(0);
    expect(orbitAngularAcceleration(0.75)).toBeLessThan(0);
  });

  it("steps plate physics with inertial lag and centrifugal lean", () => {
    let state = createPlatePhysicsState();
    // Sustained positive alpha → twist opposite the acceleration (lag).
    for (let i = 0; i < 12; i += 1) {
      state = stepPlatePhysics(state, {
        index: 0,
        omega: 1.2,
        alpha: 4,
        azimuth: 0.8,
        amp: 1.85,
        dt: 1 / 60,
      });
    }
    expect(state.twist).toBeLessThan(0);
    expect(Math.hypot(state.leanX, state.leanZ)).toBeGreaterThan(0.002);

    // When orbit stops, spring-damper settles toward rest.
    for (let i = 0; i < 90; i += 1) {
      state = stepPlatePhysics(state, {
        index: 0,
        omega: 0,
        alpha: 0,
        azimuth: 0,
        amp: 0,
        dt: 1 / 60,
      });
    }
    expect(Math.abs(state.twist)).toBeLessThan(0.02);
    expect(Math.hypot(state.leanX, state.leanZ)).toBeLessThan(0.02);

    const pose = platePhysicsToFlexPose(state);
    expect(pose.rotX).toBe(state.twist);
    expect(pose.x).toBe(state.leanX);
    expect(pose.z).toBe(state.leanZ);
  });

  it("collapses to a spaced stack that still admits hover parting", () => {
    const open = plateCenterYs("open");
    const closed = plateCenterYs("closed");
    const collapsed = collapsedPlateYs();
    expect(collapsed[0] - collapsed[1]).toBeLessThan(open[0] - open[1]);
    // Keep at least closed face-gap so hover can part plates.
    expect(collapsed[0] - collapsed[1]).toBeGreaterThanOrEqual(
      closed[0] - closed[1] - 0.001,
    );

    const mid = plateTimelineYs(null, 0.5);
    expect(mid[0]).toBeLessThan(open[0]);
    expect(mid[0]).toBeGreaterThan(collapsed[0]);
    expect(plateTimelineYs(null, 1)[3]).toBeCloseTo(collapsed[3], 5);
    expect(plateTimelineYs(null, 0)[2]).toBeCloseTo(plateTargetYs(null)[2], 5);

    const focused = plateTimelineYs(5, 1);
    expect(focused[4]).toBeGreaterThan(collapsed[4]);
    expect(focused[6]).toBeLessThan(collapsed[6]);
  });

  it("breath and parallax are zero under reduced motion and stagger by index", () => {
    expect(orbitBreathOffset(0, 1, 1, true)).toBe(0);
    expect(orbitParallaxZ(0, 0.5, 1, true)).toBe(0);
    expect(orbitBreathOffset(0, 1, 1, false)).not.toBeCloseTo(
      orbitBreathOffset(5, 1, 1, false),
      5,
    );
  });

  it("focusEmissiveBoost lights the hovered plate", () => {
    expect(focusEmissiveBoost(false)).toBe(0);
    expect(focusEmissiveBoost(true)).toBeGreaterThan(
      focusEmissiveBoost(true, false, true),
    );
    expect(focusEmissiveBoost(true, true)).toBeLessThan(0.15);
  });

  it("orbitCameraDistance zooms in, holds close, then zooms out", () => {
    expect(orbitCameraDistance(0)).toBeCloseTo(ORBIT_DISTANCE_WIDE, 5);
    expect(orbitCameraDistance(ORBIT_ZOOM_IN_END)).toBeCloseTo(
      ORBIT_DISTANCE_CLOSE,
      5,
    );
    expect(orbitCameraDistance(ORBIT_ZOOM_HOLD_END)).toBeCloseTo(
      ORBIT_DISTANCE_CLOSE,
      5,
    );
    expect(orbitCameraDistance(1)).toBeCloseTo(ORBIT_DISTANCE_END, 5);
    const midIn = orbitCameraDistance(ORBIT_ZOOM_IN_END * 0.5);
    expect(midIn).toBeLessThan(ORBIT_DISTANCE_WIDE);
    expect(midIn).toBeGreaterThan(ORBIT_DISTANCE_CLOSE);
    const midOut = orbitCameraDistance((ORBIT_ZOOM_HOLD_END + 1) * 0.5);
    expect(midOut).toBeGreaterThan(ORBIT_DISTANCE_CLOSE);
    expect(midOut).toBeLessThan(ORBIT_DISTANCE_END);
    expect(orbitCameraDistance(0, true)).toBeCloseTo(ORBIT_DISTANCE_END, 5);
  });

  it("spinProgressFromElapsed completes the whip on a fixed clock", () => {
    expect(spinProgressFromElapsed(0)).toBe(0);
    expect(spinProgressFromElapsed(ORBIT_SPIN_DURATION_SEC)).toBeCloseTo(1, 5);
    expect(spinProgressFromElapsed(ORBIT_SPIN_DURATION_SEC * 0.25)).toBeCloseTo(
      0.25,
      5,
    );
  });
});

describe("focusIndexFromWorldY", () => {
  it("picks the nearest open-stack plate to the pointer Y", () => {
    const open = plateCenterYs("open");
    expect(focusIndexFromWorldY(open[0])).toBe(0);
    expect(focusIndexFromWorldY(open[5])).toBe(5);
    expect(focusIndexFromWorldY((open[3] + open[4]) / 2)).toBe(3);
  });
});
