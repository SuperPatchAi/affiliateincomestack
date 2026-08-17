import { describe, expect, it } from "vitest";
import { SLIDES } from "../data/slides";
import { shouldShowLiveAnnotations } from "./labels";

describe("shouldShowLiveAnnotations", () => {
  it("hides live labels only when hero declares baked annotations", () => {
    const four = SLIDES.find((s) => s.id === "03-four-stacks")!;
    expect(four.hero?.annotationsBaked).toBe(true);
    expect(shouldShowLiveAnnotations(four)).toBe(false);
  });

  it("shows live labels when hero is present but annotations are not baked", () => {
    const title = SLIDES.find((s) => s.id === "01-title")!;
    expect(title.hero?.annotationsBaked).toBe(false);
    expect(title.annotations?.length).toBeGreaterThan(0);
    expect(shouldShowLiveAnnotations(title)).toBe(true);
  });

  it("shows live labels on still plates with annotations", () => {
    const retail = SLIDES.find((s) => s.id === "07-retail")!;
    expect(shouldShowLiveAnnotations(retail)).toBe(true);
  });
});
