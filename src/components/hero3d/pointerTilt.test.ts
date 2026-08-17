import { describe, expect, it } from "vitest";
import {
  DAMP_POSE_TAU_DIVISOR_MS,
  composeHeroPose,
  dampPose,
  hoverFlexFromPointer,
  idleRockAt,
  motionMode,
  ndcFromPointer,
  restPose,
  tiltFromNdc,
} from "./pointerTilt";

const YAW_MAX = (18 * Math.PI) / 180;
const PITCH_MAX = (12 * Math.PI) / 180;
const FRAME_SEC = 1 / 60;
const RETURN_MS = 350;

function dampOverMs(start: { yaw: number; pitch: number }, ms: number) {
  let pose = start;
  const steps = Math.round(ms / (FRAME_SEC * 1000));
  for (let i = 0; i < steps; i += 1) {
    pose = dampPose(pose, restPose(), FRAME_SEC, RETURN_MS);
  }
  return pose;
}

describe("pointerTilt", () => {
  it("maps the rect center to NDC origin", () => {
    expect(
      ndcFromPointer(150, 100, { left: 0, top: 0, width: 300, height: 200 }),
    ).toEqual({ x: 0, y: 0 });
  });

  it("maps fine-pointer NDC to clamped yaw/pitch", () => {
    const center = tiltFromNdc({ x: 0, y: 0 }, YAW_MAX, PITCH_MAX);
    expect(center).toEqual({ yaw: 0, pitch: 0 });

    const far = tiltFromNdc({ x: 2, y: -2 }, YAW_MAX, PITCH_MAX);
    expect(far.yaw).toBeCloseTo(YAW_MAX);
    expect(far.pitch).toBeCloseTo(PITCH_MAX);
    expect(Math.abs(far.yaw)).toBeLessThanOrEqual(YAW_MAX);
    expect(Math.abs(far.pitch)).toBeLessThanOrEqual(PITCH_MAX);
  });

  it("returns rest pose on leave", () => {
    expect(restPose()).toEqual({ yaw: 0, pitch: 0 });
  });

  it("uses tilt on fine pointer, idle on coarse, none when reduced motion", () => {
    expect(motionMode({ coarsePointer: false, reducedMotion: false })).toBe(
      "tilt",
    );
    expect(motionMode({ coarsePointer: true, reducedMotion: false })).toBe(
      "idle",
    );
    expect(motionMode({ coarsePointer: false, reducedMotion: true })).toBe(
      "none",
    );
    expect(motionMode({ coarsePointer: true, reducedMotion: true })).toBe(
      "none",
    );
  });

  it("flexes the hero toward the camera while the pointer is over it", () => {
    expect(hoverFlexFromPointer(null, { scaleBoost: 0.08, zBoost: 0.18, rollMax: 0.12 })).toEqual({
      scale: 1,
      z: 0,
      roll: 0,
    });
    const flexed = hoverFlexFromPointer(
      { x: 1, y: -0.4 },
      { scaleBoost: 0.08, zBoost: 0.18, rollMax: 0.12 },
    );
    expect(flexed.scale).toBeCloseTo(1.08);
    expect(flexed.z).toBeCloseTo(0.18);
    expect(flexed.roll).toBeCloseTo(0.12);
  });

  it("layers idle rock onto pointer tilt so the hero always drifts", () => {
    const combined = composeHeroPose(
      { yaw: 0.2, pitch: -0.1 },
      { yaw: 0.05, pitch: 0.02 },
    );
    expect(combined.yaw).toBeCloseTo(0.25);
    expect(combined.pitch).toBeCloseTo(-0.08);
  });

  it("idle rock stays inside a few degrees and does not use pointer NDC", () => {
    const pose = idleRockAt(0.7, (3 * Math.PI) / 180, (1.5 * Math.PI) / 180, 0.18);
    expect(Math.abs(pose.yaw)).toBeLessThanOrEqual((3 * Math.PI) / 180 + 1e-9);
    expect(Math.abs(pose.pitch)).toBeLessThanOrEqual((1.5 * Math.PI) / 180 + 1e-9);
  });

  it("uses a named tau divisor instead of a magic 5000", () => {
    expect(DAMP_POSE_TAU_DIVISOR_MS).toBe(5000);
    const start = { yaw: YAW_MAX, pitch: 0 };
    const next = dampPose(start, restPose(), FRAME_SEC, RETURN_MS);
    const tau = Math.max(0.001, RETURN_MS / DAMP_POSE_TAU_DIVISOR_MS);
    const alpha = 1 - Math.exp(-FRAME_SEC / tau);
    expect(next.yaw).toBeCloseTo(start.yaw * (1 - alpha));
  });

  it("damps toward rest within the 300–400ms return window", () => {
    const start = { yaw: YAW_MAX, pitch: PITCH_MAX };
    const mid = dampOverMs(start, 200);
    expect(Math.abs(mid.yaw)).toBeLessThan(Math.abs(start.yaw));
    expect(Math.abs(mid.pitch)).toBeLessThan(Math.abs(start.pitch));
    const end = dampOverMs(start, 400);
    expect(end.yaw).toBeCloseTo(0, 2);
    expect(end.pitch).toBeCloseTo(0, 2);
  });
});
