import { PATCH_CAMERA_Z } from "./patchHero";

export const TITLE_INTRO_DURATION_SEC = 3.2;
export const TITLE_INTRO_DURATION_COMPACT_SEC = 2.6;
export const TITLE_INTRO_IDLE_START = 0.78;

export type Vec3 = { x: number; y: number; z: number };

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function titleIntroDurationSec(compact: boolean): number {
  return compact ? TITLE_INTRO_DURATION_COMPACT_SEC : TITLE_INTRO_DURATION_SEC;
}

export function titleIntroProgress(elapsedSec: number, durationSec: number): number {
  const duration = Math.max(0.001, durationSec);
  return clamp01(elapsedSec / duration);
}

/** Ease-in-out cubic so the overhead pass is visible, then the settle is soft. */
export function titleIntroEase(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

function lerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/** Behind and high → over the logo → rest seat in front. */
export function titleIntroCamera(eased: number, yLift: number): Vec3 {
  const t = clamp01(eased);
  const start = { x: 1.55, y: yLift + 2.6, z: -2.15 };
  const over = { x: 0.12, y: yLift + 2.4, z: 0.2 };
  const end = { x: 0, y: yLift, z: PATCH_CAMERA_Z };
  if (t < 0.5) return lerpVec(start, over, t / 0.5);
  return lerpVec(over, end, (t - 0.5) / 0.5);
}

export function titleIntroSpinYaw(eased: number): number {
  return clamp01(eased) * Math.PI * 2;
}

export function titleIntroIdleMix(progress: number): number {
  const p = clamp01(progress);
  if (p <= TITLE_INTRO_IDLE_START) return 0;
  const t = (p - TITLE_INTRO_IDLE_START) / (1 - TITLE_INTRO_IDLE_START);
  return t * t * (3 - 2 * t);
}
