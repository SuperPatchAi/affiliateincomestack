import { describe, expect, it } from "vitest";
import {
  ORBIT_COLLAPSE_DURATION,
  ORBIT_SPIN_DURATION_SEC,
} from "./accordionState";
import {
  titleOverlayAbsoluteDelay,
  titleOverlayMotionPlan,
} from "./titleOverlayMotion";

describe("titleOverlayMotionPlan", () => {
  it("starts after the stack whip, with staggered eyebrow → headline → body", () => {
    const plan = titleOverlayMotionPlan();
    expect(plan.startSec).toBeGreaterThan(ORBIT_SPIN_DURATION_SEC);
    expect(plan.startSec).toBeLessThan(
      ORBIT_SPIN_DURATION_SEC + ORBIT_COLLAPSE_DURATION,
    );
    expect(plan.eyebrow.delaySec).toBeLessThan(plan.headline.delaySec);
    expect(plan.headline.delaySec).toBeLessThan(plan.body.delaySec);
    expect(titleOverlayAbsoluteDelay(plan, "body")).toBeGreaterThan(
      titleOverlayAbsoluteDelay(plan, "eyebrow"),
    );
  });
});
