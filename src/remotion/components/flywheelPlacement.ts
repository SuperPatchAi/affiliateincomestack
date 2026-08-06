import type { Slide } from "../../data/slides";

export type FlywheelPlacement = "hero" | "corner";

/**
 * Remotion flywheel placement from slide metadata.
 * Slide 04 (`flywheel-scrub`) gets a hero overlay; other `flywheelArc` slides get corner.
 * Slides without `flywheelArc` (e.g. 02-question) render none.
 */
export function flywheelPlacement(slide: Slide): FlywheelPlacement | null {
  if (!slide.flywheelArc) return null;
  if (slide.motionPreset === "flywheel-scrub") return "hero";
  return "corner";
}

/** Hero video is primary — delay copy entrance slightly. */
export function copyEyebrowDelay(
  eyebrowStart: number,
  hasHeroVideo: boolean,
): number {
  return hasHeroVideo ? Math.max(eyebrowStart, 12) : eyebrowStart;
}
