import { describe, expect, it } from "vitest";
import {
  effectiveOrbitFlexAmp,
  effectiveOrbitSpeed,
  introJustCompleted,
  shouldPlayOrbitIntro,
  spinProgressFromElapsed,
} from "./orbitSession";
import {
  ORBIT_COLLAPSE_DURATION,
  ORBIT_INTRO_SPEED,
  ORBIT_SPIN_DURATION_SEC,
} from "./accordionState";

function memoryStorage(seed: Record<string, string> = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}

describe("orbitSession", () => {
  it("always replays the intro on mount", () => {
    const store = memoryStorage({ "sp-hero3d-orbit-intro-v4": "1" });
    expect(shouldPlayOrbitIntro(store)).toBe(true);
    expect(shouldPlayOrbitIntro()).toBe(true);
  });

  it("maps wall-clock elapsed to spin progress with phone scale", () => {
    expect(spinProgressFromElapsed(0, 1)).toBe(0);
    expect(
      spinProgressFromElapsed(ORBIT_SPIN_DURATION_SEC, 1),
    ).toBeCloseTo(1, 5);
    expect(
      spinProgressFromElapsed(ORBIT_SPIN_DURATION_SEC * 0.55, 0.55),
    ).toBeCloseTo(1, 5);
    expect(spinProgressFromElapsed(ORBIT_SPIN_DURATION_SEC * 0.5, 1)).toBeCloseTo(
      0.5,
      5,
    );
  });

  it("drives whip speed from spin progress and freezes when skipped", () => {
    expect(effectiveOrbitSpeed(0.7, true, ORBIT_COLLAPSE_DURATION)).toBe(0);
    expect(effectiveOrbitFlexAmp(0.7, true, false, ORBIT_COLLAPSE_DURATION)).toBe(
      0,
    );
    expect(effectiveOrbitSpeed(0.7, false, 0)).toBeCloseTo(ORBIT_INTRO_SPEED, 5);
    expect(effectiveOrbitSpeed(0, false, 0)).toBeLessThan(ORBIT_INTRO_SPEED);
    expect(introJustCompleted(0.9, 1.05)).toBe(true);
    expect(introJustCompleted(1.1, 1.2)).toBe(false);
  });
});
