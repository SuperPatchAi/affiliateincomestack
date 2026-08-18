import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CHIP_COPY_EXIT_MS,
  CHIP_FALLBACK_DWELL_MS,
  CHIP_SCROLL_GATE_START,
  createChipAutoCycle,
  type ChipCycleHandlers,
} from "./chipAutoCycle";

function makeHandlers(overrides: Partial<ChipCycleHandlers> = {}) {
  return {
    exitCopy: vi.fn(),
    enterChip: vi.fn().mockReturnValue(true),
    exitChip: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

/** Arm the cycle and scroll-trigger the chip sequence. */
function begin(cycle: ReturnType<typeof createChipAutoCycle>) {
  cycle.start();
  cycle.beginChips();
  vi.advanceTimersByTime(CHIP_COPY_EXIT_MS);
}

describe("createChipAutoCycle", () => {
  it("requires a deeper scroll into the scene before copy flies off", () => {
    expect(CHIP_SCROLL_GATE_START).toMatch(/top\+=/);
    expect(CHIP_SCROLL_GATE_START).not.toMatch(/top-=/);
  });

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("holds the hero copy indefinitely until the user scrolls", () => {
    const handlers = makeHandlers();
    const cycle = createChipAutoCycle({ chipCount: 3, handlers });
    cycle.start();

    // No read timer anymore: the hero never advances on its own.
    vi.advanceTimersByTime(60_000);
    expect(handlers.exitCopy).not.toHaveBeenCalled();
    expect(handlers.enterChip).not.toHaveBeenCalled();
    expect(cycle.currentChip()).toBe(-1);
  });

  it("beginChips() exits the copy, then enters the first chip", () => {
    const handlers = makeHandlers();
    const cycle = createChipAutoCycle({ chipCount: 3, handlers });
    cycle.start();

    cycle.beginChips();
    expect(handlers.exitCopy).toHaveBeenCalledOnce();
    expect(handlers.enterChip).not.toHaveBeenCalled();

    vi.advanceTimersByTime(CHIP_COPY_EXIT_MS);
    expect(handlers.enterChip).toHaveBeenCalledWith(0, {
      loop: false,
      handoff: false,
    });
    expect(cycle.currentChip()).toBe(0);
  });

  it("beginChips() is a no-op before start, after stop, and while running", () => {
    const handlers = makeHandlers();
    const cycle = createChipAutoCycle({ chipCount: 3, handlers });

    cycle.beginChips(); // not started yet
    expect(handlers.exitCopy).not.toHaveBeenCalled();

    begin(cycle);
    cycle.beginChips(); // already begun
    cycle.beginChips();
    expect(handlers.exitCopy).toHaveBeenCalledOnce();
    expect(handlers.enterChip).toHaveBeenCalledOnce();

    cycle.stop();
    cycle.beginChips(); // stopped
    vi.advanceTimersByTime(CHIP_COPY_EXIT_MS);
    expect(handlers.exitCopy).toHaveBeenCalledOnce();
  });

  it("advances on video ended: exits the current chip, enters the next", () => {
    const handlers = makeHandlers();
    const cycle = createChipAutoCycle({ chipCount: 3, handlers });
    begin(cycle);

    cycle.handleVideoEnded(0);
    expect(handlers.exitChip).toHaveBeenCalledWith(0);
    expect(handlers.enterChip).toHaveBeenCalledWith(1, {
      loop: false,
      handoff: true,
    });

    cycle.handleVideoEnded(1);
    expect(handlers.exitChip).toHaveBeenCalledWith(1);
    expect(handlers.enterChip).toHaveBeenCalledWith(2, {
      loop: true,
      handoff: true,
    });
  });

  it("marks only chip-to-chip enters as a covered handoff", () => {
    const handlers = makeHandlers();
    const cycle = createChipAutoCycle({ chipCount: 3, handlers });
    begin(cycle);

    expect(handlers.enterChip).toHaveBeenLastCalledWith(0, {
      loop: false,
      handoff: false,
    });

    cycle.handleVideoEnded(0);
    expect(handlers.enterChip).toHaveBeenLastCalledWith(1, {
      loop: false,
      handoff: true,
    });
  });

  it("loops the final chip instead of advancing", () => {
    const handlers = makeHandlers();
    const cycle = createChipAutoCycle({ chipCount: 2, handlers });
    begin(cycle);
    cycle.handleVideoEnded(0);

    expect(handlers.enterChip).toHaveBeenLastCalledWith(1, {
      loop: true,
      handoff: true,
    });
    cycle.handleVideoEnded(1);
    // Last chip holds: no further exits or enters.
    expect(handlers.exitChip).toHaveBeenCalledTimes(1);
    expect(handlers.enterChip).toHaveBeenCalledTimes(2);
  });

  it("ignores ended events from stale chips", () => {
    const handlers = makeHandlers();
    const cycle = createChipAutoCycle({ chipCount: 3, handlers });
    begin(cycle);
    cycle.handleVideoEnded(0); // now on chip 1

    cycle.handleVideoEnded(0); // stale
    expect(handlers.enterChip).toHaveBeenCalledTimes(2);
  });

  it("falls back to a timer when a chip has no playable video", () => {
    const handlers = makeHandlers({
      enterChip: vi.fn().mockReturnValue(false),
    });
    const cycle = createChipAutoCycle({ chipCount: 2, handlers });
    begin(cycle);
    expect(cycle.currentChip()).toBe(0);

    vi.advanceTimersByTime(CHIP_FALLBACK_DWELL_MS);
    expect(handlers.exitChip).toHaveBeenCalledWith(0);
    expect(handlers.enterChip).toHaveBeenLastCalledWith(1, {
      loop: true,
      handoff: true,
    });
    // Last chip without video just holds — no more timers pending.
    vi.advanceTimersByTime(CHIP_FALLBACK_DWELL_MS * 3);
    expect(handlers.enterChip).toHaveBeenCalledTimes(2);
  });

  it("stop() clears pending work and resets the scene", () => {
    const handlers = makeHandlers();
    const cycle = createChipAutoCycle({ chipCount: 3, handlers });
    cycle.start();
    cycle.beginChips(); // copy exited, first chip pending
    cycle.stop();

    expect(handlers.reset).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(CHIP_COPY_EXIT_MS + CHIP_FALLBACK_DWELL_MS);
    expect(handlers.enterChip).not.toHaveBeenCalled();
    expect(cycle.currentChip()).toBe(-1);

    // Ended events after stop are ignored.
    cycle.handleVideoEnded(0);
    expect(handlers.exitChip).not.toHaveBeenCalled();
  });

  it("plays the final chip unlooped and completes the sequence when it ends", () => {
    const completeSequence = vi.fn();
    const handlers = makeHandlers({ completeSequence });
    const cycle = createChipAutoCycle({ chipCount: 2, handlers });
    begin(cycle);
    cycle.handleVideoEnded(0);

    expect(handlers.enterChip).toHaveBeenLastCalledWith(1, {
      loop: false,
      handoff: true,
    });
    expect(completeSequence).not.toHaveBeenCalled();

    cycle.handleVideoEnded(1);
    expect(completeSequence).toHaveBeenCalledOnce();
    // Chip stays on screen for the scene handoff; no exit, no re-fire.
    expect(handlers.exitChip).toHaveBeenCalledTimes(1);
    cycle.handleVideoEnded(1);
    expect(completeSequence).toHaveBeenCalledOnce();
  });

  it("completes via the fallback timer when the final chip has no video", () => {
    const completeSequence = vi.fn();
    const handlers = makeHandlers({
      enterChip: vi.fn().mockReturnValue(false),
      completeSequence,
    });
    const cycle = createChipAutoCycle({ chipCount: 1, handlers });
    begin(cycle);
    expect(completeSequence).not.toHaveBeenCalled();

    vi.advanceTimersByTime(CHIP_FALLBACK_DWELL_MS);
    expect(completeSequence).toHaveBeenCalledOnce();
  });

  it("stop() before the final clip ends prevents completion", () => {
    const completeSequence = vi.fn();
    const handlers = makeHandlers({ completeSequence });
    const cycle = createChipAutoCycle({ chipCount: 1, handlers });
    begin(cycle);
    cycle.stop();

    cycle.handleVideoEnded(0);
    expect(completeSequence).not.toHaveBeenCalled();
  });

  it("start() is idempotent while running and restartable after stop", () => {
    const handlers = makeHandlers();
    const cycle = createChipAutoCycle({ chipCount: 1, handlers });
    cycle.start();
    cycle.start();
    cycle.beginChips();
    vi.advanceTimersByTime(CHIP_COPY_EXIT_MS);
    expect(handlers.exitCopy).toHaveBeenCalledOnce();
    expect(handlers.enterChip).toHaveBeenCalledOnce();
    expect(handlers.enterChip).toHaveBeenCalledWith(0, {
      loop: true,
      handoff: false,
    });

    cycle.stop();
    cycle.start();
    cycle.beginChips();
    vi.advanceTimersByTime(CHIP_COPY_EXIT_MS);
    expect(handlers.exitCopy).toHaveBeenCalledTimes(2);
    expect(handlers.enterChip).toHaveBeenCalledTimes(2);
  });
});
