import { describe, expect, it } from "vitest";
import * as MotionConfig from "./experienceMotionConfig";

describe("experienceProgress", () => {
  it("computes clamped continuous progress across the scroll range", () => {
    expect(typeof MotionConfig.computeScrollProgress).toBe("function");
    if (typeof MotionConfig.computeScrollProgress !== "function") return;

    expect(MotionConfig.computeScrollProgress(0, 1000)).toBe(0);
    expect(MotionConfig.computeScrollProgress(250, 1000)).toBe(0.25);
    expect(MotionConfig.computeScrollProgress(1500, 1000)).toBe(1);
  });
});
