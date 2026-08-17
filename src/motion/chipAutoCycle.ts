/**
 * Video-timed chip sequencing with a scroll-gated start. When a chip scene
 * becomes active the hero copy holds indefinitely — `start()` only arms the
 * cycle. The user's first scroll into the scene calls `beginChips()`, which
 * exits the copy and enters chip 0; from there each chip beat runs for
 * exactly the length of its omni clip — the clip's warp ending IS the
 * transition cue. When a `completeSequence` handler is provided the final
 * clip's ending fires it (e.g. auto-scroll to the next scene); otherwise the
 * final clip loops (it settles cleanly by design). Chips without a playable
 * video (data-save mode) advance on a fixed timer.
 */

/** Copy slide-out duration; the first chip enters when it completes. */
export const CHIP_COPY_EXIT_MS = 700;
/** Per-chip dwell when no video is available to time the beat. */
export const CHIP_FALLBACK_DWELL_MS = 6000;

export type ChipCycleHandlers = {
  /** Slide the headline copy off screen. Called once per run. */
  exitCopy: () => void;
  /**
   * Show chip `index` (text + backdrop) and start its video.
   * Return false when no video can play so the cycle falls back to a timer.
   */
  enterChip: (index: number, opts: { loop: boolean }) => boolean;
  /** Hide chip `index`; crossfades under the next chip's enter. */
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
  /** Arm the cycle: hero copy holds until `beginChips()`. */
  start: () => void;
  stop: () => void;
  /** Scroll-gated kickoff: exit the copy and enter the first chip. */
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
}): ChipAutoCycle {
  const {
    chipCount,
    handlers,
    copyExitMs = CHIP_COPY_EXIT_MS,
    fallbackChipMs = CHIP_FALLBACK_DWELL_MS,
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
    current = index;
    const isLast = index === chipCount - 1;
    // Without a completion target the last clip loops as an idle state.
    const hasVideo = handlers.enterChip(index, {
      loop: isLast && !canComplete,
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

  return {
    start() {
      if (running || chipCount <= 0) return;
      running = true;
      begun = false;
      completed = false;
      current = -1;
    },
    beginChips() {
      if (!running || begun) return;
      begun = true;
      handlers.exitCopy();
      schedule(copyExitMs, () => enter(0));
    },
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
