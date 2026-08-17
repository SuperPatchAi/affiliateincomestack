import { sceneScrollHeightVh } from "./experienceMotionConfig";

export type SegmentWindow = { start: number; end: number };
export type ChipWindow = { enter: SegmentWindow; exit: SegmentWindow | null };
export type DwellSegments = {
  copyExit: SegmentWindow;
  chips: ChipWindow[];
};

/** Copy sits still until here so the scene stays readable before anything moves. */
export const READ_HOLD_END = 0.12;
/** Copy has fully exited left by here; chip slots own the rest of the dwell. */
export const COPY_EXIT_END = 0.22;
/** A chip spends the first 30% of its slot entering, then holds. */
const CHIP_ENTER_FRACTION = 0.3;

/** Extra scroll distance per chip so each one gets a deliberate beat. */
const PER_CHIP_VH_FINE = 45;
const PER_CHIP_VH_COARSE = 35;

/**
 * Normalized (0..1) windows over a scene's dwell scrub.
 * Chip i exits exactly during chip i+1's enter window (cross-fade);
 * the last chip has no exit — it holds until the scene handoff.
 */
export function buildDwellSegments(chipCount: number): DwellSegments | null {
  if (chipCount <= 0) return null;
  const slot = (1 - COPY_EXIT_END) / chipCount;
  const enterFor = (i: number): SegmentWindow => {
    const start = COPY_EXIT_END + i * slot;
    return { start, end: start + slot * CHIP_ENTER_FRACTION };
  };
  const chips: ChipWindow[] = Array.from({ length: chipCount }, (_, i) => ({
    enter: enterFor(i),
    exit: i + 1 < chipCount ? enterFor(i + 1) : null,
  }));
  return {
    copyExit: { start: READ_HOLD_END, end: COPY_EXIT_END },
    chips,
  };
}

export function sceneScrollHeightVhForChips(options: {
  coarsePointer: boolean;
  chipCount: number;
}): number {
  const perChip = options.coarsePointer ? PER_CHIP_VH_COARSE : PER_CHIP_VH_FINE;
  return (
    sceneScrollHeightVh({ coarsePointer: options.coarsePointer }) +
    perChip * Math.max(0, options.chipCount)
  );
}
