import { describe, expect, it } from "vitest";
import { getMotionPhases } from "./gating";

describe("getMotionPhases", () => {
  it("delays copy until primary settles when diagram-first", () => {
    const p = getMotionPhases({
      frame: 0,
      durationInFrames: 150,
      primarySettleFrames: 24,
      secondaryPolicy: "diagram-first",
      hasAnnotations: true,
    });
    expect(p.annotationStart).toBe(30); // 24 + 6
    expect(p.eyebrowStart).toBeGreaterThan(p.annotationStart);
    expect(p.bodyStart).toBeGreaterThan(p.eyebrowStart);
  });

  it("keeps ambient scale capped", () => {
    const p = getMotionPhases({
      frame: 75,
      durationInFrames: 150,
      primarySettleFrames: 20,
      secondaryPolicy: "copy-first",
      hasAnnotations: false,
      ambientScale: [1, 1.03],
    });
    expect(p.ambientScale).toBeGreaterThanOrEqual(1);
    expect(p.ambientScale).toBeLessThanOrEqual(1.03);
  });
});
