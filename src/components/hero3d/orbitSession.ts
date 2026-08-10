import {
  ORBIT_INTRO_SPEED,
  ORBIT_POST_SPIN_DURATION,
  ORBIT_SPIN_DURATION_SEC,
  orbitAutoRotateSpeed,
  orbitCollapseTFromElapsed,
  orbitFlexAmpScale,
  orbitIntroProgress,
  spinProgressFromElapsed,
} from "./accordionState";

/**
 * Legacy key — intro now always replays on mount (preview iteration).
 * Kept so old tabs can clear stale flags if needed.
 */
export const INTRO_SESSION_KEY = "sp-hero3d-orbit-intro-v4";

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

/**
 * Always play the whip on mount (unless reduced-motion is handled by caller).
 * Session skip was hiding the choreography during material/look iteration.
 */
export function shouldPlayOrbitIntro(_storage?: StorageLike | null): boolean {
  return true;
}

/** No-op — intro always replays; kept for API compatibility. */
export function markOrbitIntroPlayed(_storage?: StorageLike | null): void {
  // intentionally empty
}

/**
 * Compress intro progress on phone (`introScale` < 1 finishes sooner).
 * Prefer `spinProgressFromElapsed` for the live clock.
 */
export function scaledOrbitProgress(
  revolutions: number,
  introScale: number,
): number {
  const scale = Math.max(0.2, introScale);
  return revolutions / scale;
}

/**
 * Seed revolutions so progress is already past the first spin when skipping.
 */
export function seedRevolutionsForSkippedIntro(introScale: number): number {
  return Math.max(0.2, introScale);
}

/** Elapsed post-spin time when skipping straight to the still stack. */
export function seedCollapseElapsedForSkippedIntro(): number {
  return ORBIT_POST_SPIN_DURATION;
}

/** Elapsed spin time when skipping straight past the whip. */
export function seedSpinElapsedForSkippedIntro(introScale: number): number {
  return ORBIT_SPIN_DURATION_SEC * Math.max(0.2, introScale);
}

export function effectiveOrbitSpeed(
  spinProgress: number,
  skipIntro: boolean,
  collapseElapsed = 0,
): number {
  if (skipIntro) return 0;
  return orbitAutoRotateSpeed(spinProgress, collapseElapsed);
}

export function effectiveOrbitFlexAmp(
  spinProgress: number,
  skipIntro: boolean,
  reducedMotion: boolean,
  collapseElapsed = 0,
): number {
  if (reducedMotion) return 0;
  if (skipIntro) return 0;
  return orbitFlexAmpScale(spinProgress, collapseElapsed);
}

export function effectiveCollapseT(
  skipIntro: boolean,
  collapseElapsed: number,
): number {
  if (skipIntro) return 1;
  return orbitCollapseTFromElapsed(collapseElapsed);
}

export function introJustCompleted(
  prevProgress: number,
  nextProgress: number,
): boolean {
  return prevProgress < 1 && nextProgress >= 1;
}

export function initialAutoRotateSpeed(skipIntro: boolean): number {
  return skipIntro ? 0 : ORBIT_INTRO_SPEED;
}

export { orbitIntroProgress, spinProgressFromElapsed };
