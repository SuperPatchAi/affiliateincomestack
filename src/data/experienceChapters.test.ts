import { describe, expect, it } from "vitest";
import * as SlideData from "./slides";

describe("experienceChapters", () => {
  it("maps every scene into the four approved chapters", () => {
    expect(SlideData.chapterForSceneIndex(0).id).toBe("full-stack");
    expect(SlideData.chapterForSceneIndex(10).id).toBe("full-stack");
    expect(SlideData.chapterForSceneIndex(11).id).toBe("ten-income-streams");
    expect(SlideData.chapterForSceneIndex(19).id).toBe("ten-income-streams");
    expect(SlideData.chapterForSceneIndex(20).id).toBe("momentum");
    expect(SlideData.chapterForSceneIndex(22).id).toBe("momentum");
    expect(SlideData.chapterForSceneIndex(23).id).toBe("action");
    expect(SlideData.formatSceneCounter(0)).toBe("01 / 24");
    expect(SlideData.formatSceneCounter(23)).toBe("24 / 24");
    expect(SlideData.formatSceneCounter(22)).toBe("23 / 24");
  });
});
