import { describe, expect, it } from "vitest";
import * as SlideData from "./slides";

describe("experienceChapters", () => {
  it("maps every scene into the four approved chapters", () => {
    expect(SlideData.chapterForSceneIndex(0).id).toBe("full-stack");
    expect(SlideData.chapterForSceneIndex(11).id).toBe("full-stack");
    expect(SlideData.chapterForSceneIndex(12).id).toBe("ten-income-streams");
    expect(SlideData.chapterForSceneIndex(20).id).toBe("ten-income-streams");
    expect(SlideData.chapterForSceneIndex(21).id).toBe("momentum");
    expect(SlideData.chapterForSceneIndex(23).id).toBe("momentum");
    expect(SlideData.chapterForSceneIndex(24).id).toBe("action");
    expect(SlideData.formatSceneCounter(0)).toBe("01 / 25");
    expect(SlideData.formatSceneCounter(24)).toBe("25 / 25");
    expect(SlideData.formatSceneCounter(23)).toBe("24 / 25");
  });
});
