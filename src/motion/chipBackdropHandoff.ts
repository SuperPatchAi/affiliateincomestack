/** First chip fades in over the title 3D stack. */
export const CHIP_BACKDROP_FIRST_ENTER_MS = 800;
/**
 * Outgoing chip stays fully opaque this long after a handoff so the next
 * poster/frame can cover before we hide the last frame.
 */
export const CHIP_BACKDROP_HANDOFF_HOLD_MS = 160;
/**
 * After a chip-to-chip snap, wait until the incoming clip has finished
 * traveling into its destination (Omni 0–3s) before the label slides in.
 */
export const CHIP_OVERLAY_AFTER_HANDOFF_MS = 900;
/** Drop the last second — Omni tails settle/glitch into the next scene. */
export const CHIP_VIDEO_TAIL_TRIM_SEC = 1.1;

export function chipVideoAdvanceAt(duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  const trimmed = duration - CHIP_VIDEO_TAIL_TRIM_SEC;
  return trimmed > 1 ? trimmed : Math.max(0, duration - 0.05);
}

export function chipVideoTickAction(opts: {
  currentTime: number;
  duration: number;
  loop: boolean;
}): "advance" | "loop" | "none" {
  const at = chipVideoAdvanceAt(opts.duration);
  if (at <= 0 || opts.currentTime < at) return "none";
  return opts.loop ? "loop" : "advance";
}

export function chipBackdropEnterOpacity(handoff: boolean): {
  from?: number;
  to: number;
  duration: number;
} {
  if (handoff) {
    return { to: 1, duration: 0 };
  }
  return {
    from: 0,
    to: 1,
    duration: CHIP_BACKDROP_FIRST_ENTER_MS / 1000,
  };
}

/** Chip label waits until the video/backdrop transition has landed. */
export function chipOverlayEnterDelayMs(opts: { handoff: boolean }): number {
  return opts.handoff
    ? CHIP_OVERLAY_AFTER_HANDOFF_MS
    : CHIP_BACKDROP_FIRST_ENTER_MS;
}

/** Park an ended clip on the last clean frame so the browser cannot blank it. */
export function freezeVideoLastFrame(video: {
  duration: number;
  currentTime: number;
  pause: () => void;
}): void {
  const at = chipVideoAdvanceAt(video.duration);
  if (at <= 0) return;
  video.pause();
  video.currentTime = at;
}

/** Hide the title 3D only once a chip layer is fully covering it. */
export function shouldCoverSceneHero3d(args: {
  hasHero3d: boolean;
  backdropFullyOpaque: boolean;
}): boolean {
  return args.hasHero3d && args.backdropFullyOpaque;
}
