import { describe, expect, it } from "vitest";
import * as SlideData from "./slides";

describe("experienceChapters", () => {
  it("maps every scene into the four approved chapters", () => {
    expect(SlideData.chapterForSceneIndex(0).id).toBe("full-stack");
    expect(SlideData.chapterForSceneIndex(12).id).toBe("full-stack");
    expect(SlideData.chapterForSceneIndex(13).id).toBe("ten-income-streams");
    expect(SlideData.chapterForSceneIndex(21).id).toBe("ten-income-streams");
    expect(SlideData.chapterForSceneIndex(22).id).toBe("momentum");
    expect(SlideData.chapterForSceneIndex(24).id).toBe("momentum");
    expect(SlideData.chapterForSceneIndex(25).id).toBe("action");
    expect(SlideData.formatSceneCounter(0)).toBe("01 / 26");
    expect(SlideData.formatSceneCounter(25)).toBe("26 / 26");
    expect(SlideData.formatSceneCounter(24)).toBe("25 / 26");
  });
});
