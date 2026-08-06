import { describe, expect, it } from "vitest";
import { SLIDES } from "../../data/slides";
import { copyEyebrowDelay, flywheelPlacement } from "./flywheelPlacement";

describe("flywheelPlacement", () => {
  it("returns hero for slide 04 flywheel-scrub", () => {
    const flywheel = SLIDES.find((s) => s.id === "04-flywheel")!;
    expect(flywheelPlacement(flywheel)).toBe("hero");
  });

  it("returns corner for flywheelArc slides that are not 04", () => {
    const retail = SLIDES.find((s) => s.id === "07-retail")!;
    expect(flywheelPlacement(retail)).toBe("corner");
  });

  it("returns null when flywheelArc is absent (slide 02)", () => {
    const question = SLIDES.find((s) => s.id === "02-question")!;
    expect(flywheelPlacement(question)).toBeNull();
  });
});

describe("copyEyebrowDelay", () => {
  it("delays hero-video copy to at least frame 12", () => {
    expect(copyEyebrowDelay(8, true)).toBe(12);
    expect(copyEyebrowDelay(20, true)).toBe(20);
  });

  it("keeps still-plate eyebrow start unchanged", () => {
    expect(copyEyebrowDelay(8, false)).toBe(8);
  });
});
