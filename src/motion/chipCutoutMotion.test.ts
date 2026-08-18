import { describe, expect, it } from "vitest";
import {
  CUTOUT_BACK_OPACITY,
  CUTOUT_BACK_SCALE,
  CUTOUT_ENTER_MS,
  CUTOUT_EXIT_MS,
  backStackVars,
  enterTweenVars,
  exitMotionPathD,
} from "./chipCutoutMotion";

describe("chipCutoutMotion", () => {
  it("parks older cutouts smaller and further back", () => {
    expect(backStackVars(0).scale).toBe(CUTOUT_BACK_SCALE);
    expect(backStackVars(0).opacity).toBe(CUTOUT_BACK_OPACITY);
    expect(backStackVars(1).scale).toBeLessThan(backStackVars(0).scale);
    expect(backStackVars(1).yPercent).toBeLessThan(backStackVars(0).yPercent);
  });

  it("defines a forward arc path", () => {
    expect(exitMotionPathD).toMatch(/^M0,0/);
  });

  it("skips duration when motion is reduced", () => {
    expect(enterTweenVars(true)).toEqual({
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0,
    });
    expect(enterTweenVars(false).duration).toBe(CUTOUT_ENTER_MS / 1000);
    expect(CUTOUT_EXIT_MS).toBe(500);
  });
});
