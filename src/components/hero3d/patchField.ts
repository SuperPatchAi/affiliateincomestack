import { PATCH_DIAMOND_ROLL } from "./patchHero";

export type Vec3 = { x: number; y: number; z: number };

export type PatchFieldRole = "hero";

export type PatchFieldInstance = {
  id: string;
  role: PatchFieldRole;
  /** World offset from the fitted hero origin. */
  position: Vec3;
  /** Multiplier on the hero fit scale. */
  scale: number;
  rotation: Vec3;
  /** World offset added at exit t=1. */
  exit: Vec3;
};

export const PATCH_FIELD: readonly PatchFieldInstance[] = [
  {
    id: "hero",
    role: "hero",
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    rotation: { x: 0, y: 0, z: PATCH_DIAMOND_ROLL },
    exit: { x: 0, y: 3.6, z: -0.8 },
  },
];

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** Smoothstep so the fly-off accelerates through the second half of the handoff. */
export function patchExitEase(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

export function patchInstanceWorldPosition(
  instance: PatchFieldInstance,
  origin: Vec3,
  exitT: number,
): Vec3 {
  const t = patchExitEase(exitT);
  return {
    x: origin.x + instance.position.x + instance.exit.x * t,
    y: origin.y + instance.position.y + instance.exit.y * t,
    z: origin.z + instance.position.z + instance.exit.z * t,
  };
}
