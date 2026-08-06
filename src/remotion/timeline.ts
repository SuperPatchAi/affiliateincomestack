import { type Slide, clipDurationSec } from "../data/slides";

/** Film clock for Remotion Studio + CLI render. */
export const FPS = 30;
/** Crossfade overlap between adjacent slides (~0.6s). Must fit inside the shortest clip. */
export const TRANSITION_FRAMES = 18;

export const WIDTH = 1920;
export const HEIGHT = 1080;

export function clipFrames(slide: Slide, fps: number = FPS): number {
  return Math.round(clipDurationSec(slide) * fps);
}

/**
 * TransitionSeries overlaps each fade into both neighboring sequences, so total length
 * is the sum of clip lengths minus one transition per boundary.
 */
export function filmDurationInFrames(
  slides: Slide[],
  fps: number = FPS,
  transitionFrames: number = TRANSITION_FRAMES,
): number {
  if (slides.length === 0) return 0;
  const raw = slides.reduce((sum, s) => sum + clipFrames(s, fps), 0);
  return raw - (slides.length - 1) * transitionFrames;
}

/** Remotion `staticFile()` wants paths relative to `public/` with no leading slash. */
export function publicAssetPath(src: string): string {
  return src.replace(/^\//, "");
}
