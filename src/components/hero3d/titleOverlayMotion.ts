import {
  ORBIT_COLLAPSE_DURATION,
  ORBIT_SPIN_DURATION_SEC,
} from "./accordionState";

export type TitleOverlayBeat = {
  /** Delay from mount before this layer starts (seconds). */
  delaySec: number;
  durationSec: number;
};

export type TitleOverlayMotionPlan = {
  /** When the overlay sequence begins (after stack zoom-out is underway). */
  startSec: number;
  eyebrow: TitleOverlayBeat;
  headline: TitleOverlayBeat;
  body: TitleOverlayBeat;
};

/**
 * Title copy enters as the stack finishes zoom-out / starts collapse,
 * so the 3D whip reads first, then the slide-01 chrome lands.
 */
export function titleOverlayMotionPlan(
  spinDurationSec = ORBIT_SPIN_DURATION_SEC,
  collapseDurationSec = ORBIT_COLLAPSE_DURATION,
): TitleOverlayMotionPlan {
  const startSec = spinDurationSec + collapseDurationSec * 0.35;
  return {
    startSec,
    eyebrow: { delaySec: 0, durationSec: 0.5 },
    headline: { delaySec: 0.16, durationSec: 0.75 },
    body: { delaySec: 0.42, durationSec: 0.6 },
  };
}

export function titleOverlayAbsoluteDelay(
  plan: TitleOverlayMotionPlan,
  layer: keyof Pick<TitleOverlayMotionPlan, "eyebrow" | "headline" | "body">,
): number {
  return plan.startSec + plan[layer].delaySec;
}
