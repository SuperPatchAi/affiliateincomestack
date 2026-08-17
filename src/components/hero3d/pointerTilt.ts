export type TiltPose = { yaw: number; pitch: number };
export type MotionMode = "tilt" | "idle" | "none";

export function restPose(): TiltPose {
  return { yaw: 0, pitch: 0 };
}

export function ndcFromPointer(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { x: number; y: number } {
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const ndcY = ((clientY - rect.top) / h) * 2 - 1;
  const y = (-ndcY) || 0;
  return {
    x: ((clientX - rect.left) / w) * 2 - 1,
    y,
  };
}

export function tiltFromNdc(
  ndc: { x: number; y: number },
  yawMax: number,
  pitchMax: number,
): TiltPose {
  const x = Math.min(1, Math.max(-1, ndc.x));
  const y = Math.min(1, Math.max(-1, ndc.y));
  return { yaw: x * yawMax, pitch: (-y * pitchMax) || 0 };
}

export function motionMode(input: {
  coarsePointer: boolean;
  reducedMotion: boolean;
}): MotionMode {
  if (input.reducedMotion) return "none";
  return input.coarsePointer ? "idle" : "tilt";
}

export function composeHeroPose(base: TiltPose, idle: TiltPose): TiltPose {
  return { yaw: base.yaw + idle.yaw, pitch: base.pitch + idle.pitch };
}

export type HoverFlex = { scale: number; z: number; roll: number };

export function hoverFlexFromPointer(
  ndc: { x: number; y: number } | null,
  opts: { scaleBoost: number; zBoost: number; rollMax: number },
): HoverFlex {
  if (!ndc) return { scale: 1, z: 0, roll: 0 };
  const x = Math.min(1, Math.max(-1, ndc.x));
  return {
    scale: 1 + opts.scaleBoost,
    z: opts.zBoost,
    roll: x * opts.rollMax,
  };
}

export function dampHoverFlex(
  current: HoverFlex,
  target: HoverFlex,
  dtSec: number,
  returnMs: number,
): HoverFlex {
  const pose = dampPose(
    { yaw: current.scale, pitch: current.z },
    { yaw: target.scale, pitch: target.z },
    dtSec,
    returnMs,
  );
  return {
    scale: pose.yaw,
    z: pose.pitch,
    roll: dampPose(
      { yaw: current.roll, pitch: 0 },
      { yaw: target.roll, pitch: 0 },
      dtSec,
      returnMs,
    ).yaw,
  };
}

export function idleRockAt(
  elapsedSec: number,
  yawAmp: number,
  pitchAmp: number,
  hz: number,
): TiltPose {
  const t = elapsedSec * hz * Math.PI * 2;
  return {
    yaw: Math.sin(t) * yawAmp,
    pitch: Math.cos(t * 0.85) * pitchAmp,
  };
}

/** Millisecond divisor that converts spring-back duration into damp tau (seconds). */
export const DAMP_POSE_TAU_DIVISOR_MS = 5000;

export function dampPose(
  current: TiltPose,
  target: TiltPose,
  dtSec: number,
  returnMs: number,
): TiltPose {
  const tau = Math.max(0.001, returnMs / DAMP_POSE_TAU_DIVISOR_MS);
  const alpha = 1 - Math.exp(-dtSec / tau);
  return {
    yaw: current.yaw + (target.yaw - current.yaw) * alpha,
    pitch: current.pitch + (target.pitch - current.pitch) * alpha,
  };
}
