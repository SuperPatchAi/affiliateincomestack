/**
 * Video-timed chip sequencing. When a chip scene becomes active the hero
 * copy holds for a text-scaled dwell, then `beginChips()` exits the copy
 * and enters chip 0. Each chip beat runs for the length of its omni clip.
 * When a `completeSequence` handler is provided the final clip's ending
 * fires it (auto-advance to the next scene); otherwise the final clip loops.
 * Chips without a playable video advance on a fixed timer.
 */

/** Copy slide-out duration; the first chip enters when it completes. */
export const CHIP_COPY_EXIT_MS = 700;
/** Per-chip dwell when no video is available to time the beat. */
export const CHIP_FALLBACK_DWELL_MS = 6000;
/** Floor / ceiling for the hero-copy read before chips begin. */
export const HERO_COPY_DWELL_MIN_MS = 5000;
export const HERO_COPY_DWELL_MAX_MS = 16_000;
const HERO_COPY_DWELL_BASE_MS = 4000;
const HERO_COPY_DWELL_MS_PER_WORD = 180;

/** Longer hero copy (more written text) holds longer before chips begin. */
export function heroCopyDwellMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const ms = HERO_COPY_DWELL_BASE_MS + words * HERO_COPY_DWELL_MS_PER_WORD;
  return Math.min(
    HERO_COPY_DWELL_MAX_MS,
    Math.max(HERO_COPY_DWELL_MIN_MS, ms),
  );
}

export type ChipCycleHandlers = {
  /** Slide the headline copy off screen. Called once per run. */
  exitCopy: () => void;
  /**
   * Start chip `index` video/backdrop first; overlay text follows after
   * the transition. Return false when no video can play so the cycle
   * falls back to a timer.
   */
  enterChip: (index: number, opts: { loop: boolean; handoff: boolean }) => boolean;
  /**
   * Hide chip `index`. On a chip-to-chip handoff the outgoing last frame
   * stays up until the next backdrop is covering — do not fade both out.
   */
  exitChip: (index: number) => void;
  /** Restore copy, hide all chips, stop all videos. */
  reset: () => void;
  /**
   * When provided, the final chip plays unlooped and this fires as its clip
   * ends — the warp finale hands the story to the next scene. Fires at most
   * once per run; the chip stays on screen for the handoff.
   */
  completeSequence?: () => void;
};

export type ChipAutoCycle = {
  /** Arm the cycle; if `heroDwellMs` is set, chips begin after that read. */
  start: () => void;
  stop: () => void;
  /** Exit the copy and enter the first chip. Idempotent. */
  beginChips: () => void;
  /** Wire to each chip video's `ended` event. */
  handleVideoEnded: (index: number) => void;
  /** -1 before the first chip enters or when stopped. */
  currentChip: () => number;
};

export function createChipAutoCycle(options: {
  chipCount: number;
  handlers: ChipCycleHandlers;
  copyExitMs?: number;
  fallbackChipMs?: number;
  /** When > 0, `start()` begins chips after this read — no scroll gate. */
  heroDwellMs?: number;
}): ChipAutoCycle {
  const {
    chipCount,
    handlers,
    copyExitMs = CHIP_COPY_EXIT_MS,
    fallbackChipMs = CHIP_FALLBACK_DWELL_MS,
    heroDwellMs = 0,
  } = options;

  let running = false;
  let begun = false;
  let completed = false;
  let current = -1;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const canComplete = typeof handlers.completeSequence === "function";

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const schedule = (ms: number, fn: () => void) => {
    clearTimer();
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, ms);
  };

  const complete = () => {
    if (!running || completed) return;
    completed = true;
    handlers.completeSequence?.();
  };

  const enter = (index: number) => {
    const handoff = current >= 0;
    current = index;
    const isLast = index === chipCount - 1;
    // Without a completion target the last clip loops as an idle state.
    const hasVideo = handlers.enterChip(index, {
      loop: isLast && !canComplete,
      handoff,
    });
    if (!hasVideo) {
      if (!isLast) schedule(fallbackChipMs, advance);
      else if (canComplete) schedule(fallbackChipMs, complete);
    }
  };

  const advance = () => {
    if (!running) return;
    if (current >= chipCount - 1) {
      complete();
      return;
    }
    handlers.exitChip(current);
    enter(current + 1);
  };

  const beginChips = () => {
    if (!running || begun) return;
    begun = true;
    handlers.exitCopy();
    schedule(copyExitMs, () => enter(0));
  };

  return {
    start() {
      if (running || chipCount <= 0) return;
      running = true;
      begun = false;
      completed = false;
      current = -1;
      if (heroDwellMs > 0) schedule(heroDwellMs, beginChips);
    },
    beginChips,
    stop() {
      if (!running) return;
      running = false;
      begun = false;
      completed = false;
      current = -1;
      clearTimer();
      handlers.reset();
    },
    handleVideoEnded(index: number) {
      if (!running || index !== current) return;
      advance();
    },
    currentChip: () => current,
  };
}
