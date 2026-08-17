import { describe, expect, it } from "vitest";
import {
  READ_HOLD_END,
  COPY_EXIT_END,
  buildDwellSegments,
  sceneScrollHeightVhForChips,
} from "./chipSequence";
import { sceneScrollHeightVh } from "./experienceMotionConfig";

describe("buildDwellSegments", () => {
  it("returns null when there are no chips", () => {
    expect(buildDwellSegments(0)).toBeNull();
    expect(buildDwellSegments(-2)).toBeNull();
  });

  it("holds copy readable, then exits it before the first chip", () => {
    const segments = buildDwellSegments(3)!;
    expect(segments.copyExit.start).toBe(READ_HOLD_END);
    expect(segments.copyExit.end).toBe(COPY_EXIT_END);
    expect(segments.chips[0].enter.start).toBe(COPY_EXIT_END);
  });

  it("divides the remaining dwell into equal slots with 30% enter windows", () => {
    const segments = buildDwellSegments(3)!;
    const slot = (1 - COPY_EXIT_END) / 3;
    expect(segments.chips[0].enter.end).toBeCloseTo(COPY_EXIT_END + slot * 0.3, 10);
    expect(segments.chips[1].enter.start).toBeCloseTo(COPY_EXIT_END + slot, 10);
    expect(segments.chips[2].enter.start).toBeCloseTo(COPY_EXIT_END + 2 * slot, 10);
  });

  it("cross-fades: chip i exits exactly during chip i+1's enter window", () => {
    const segments = buildDwellSegments(4)!;
    for (let i = 0; i < 3; i++) {
      expect(segments.chips[i].exit).toEqual(segments.chips[i + 1].enter);
    }
  });

  it("lets the last chip hold to the scene handoff (no exit)", () => {
    expect(buildDwellSegments(1)!.chips[0].exit).toBeNull();
    expect(buildDwellSegments(6)!.chips[5].exit).toBeNull();
  });

  it("keeps every window inside 0..1 and ordered", () => {
    for (const n of [1, 2, 3, 4, 5, 6]) {
      const segments = buildDwellSegments(n)!;
      for (const chip of segments.chips) {
        expect(chip.enter.start).toBeGreaterThanOrEqual(0);
        expect(chip.enter.end).toBeGreaterThan(chip.enter.start);
        expect(chip.enter.end).toBeLessThanOrEqual(1);
        if (chip.exit) {
          expect(chip.exit.start).toBeGreaterThanOrEqual(chip.enter.end);
          expect(chip.exit.end).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

describe("sceneScrollHeightVhForChips", () => {
  it("matches the base height when a scene has no chips", () => {
    expect(
      sceneScrollHeightVhForChips({ coarsePointer: false, chipCount: 0 }),
    ).toBe(sceneScrollHeightVh({ coarsePointer: false }));
    expect(
      sceneScrollHeightVhForChips({ coarsePointer: true, chipCount: 0 }),
    ).toBe(sceneScrollHeightVh({ coarsePointer: true }));
  });

  it("adds 45svh per chip on fine pointers and 35svh on coarse", () => {
    expect(
      sceneScrollHeightVhForChips({ coarsePointer: false, chipCount: 4 }),
    ).toBe(sceneScrollHeightVh({ coarsePointer: false }) + 180);
    expect(
      sceneScrollHeightVhForChips({ coarsePointer: true, chipCount: 4 }),
    ).toBe(sceneScrollHeightVh({ coarsePointer: true }) + 140);
  });

  it("never returns less than the base height", () => {
    expect(
      sceneScrollHeightVhForChips({ coarsePointer: false, chipCount: -3 }),
    ).toBe(sceneScrollHeightVh({ coarsePointer: false }));
  });
});
