import { describe, expect, it } from "vitest";
import { SLIDES } from "../../data/slides";
import { MOTION_PRESETS, getMotionBeat } from "./presets";

describe("MOTION_PRESETS", () => {
  it("registers every motionPreset used by SLIDES", () => {
    for (const s of SLIDES) {
      expect(MOTION_PRESETS[s.motionPreset], s.motionPreset).toBeDefined();
      const beat = getMotionBeat(s.motionPreset);
      expect(["copy-first", "diagram-first", "copy-only"]).toContain(
        beat.secondaryPolicy,
      );
      expect(beat.plate.from.scale).toBeGreaterThan(0);
      expect(beat.ambientScale[1]).toBeLessThanOrEqual(1.06);
    }
  });
});
