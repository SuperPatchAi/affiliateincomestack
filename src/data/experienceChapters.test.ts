import { describe, expect, it } from "vitest";
import * as SlideData from "./slides";

describe("experienceChapters", () => {
  it("maps every scene into the four approved chapters", () => {
    expect(SlideData.chapterForSceneIndex(0).id).toBe("super-stack");
    expect(SlideData.chapterForSceneIndex(1).id).toBe("full-stack");
    expect(SlideData.chapterForSceneIndex(7).id).toBe("full-stack");
    expect(SlideData.chapterForSceneIndex(8).id).toBe("ten-income-streams");
    expect(SlideData.chapterForSceneIndex(16).id).toBe("ten-income-streams");
    expect(SlideData.chapterForSceneIndex(17).id).toBe("momentum");
    expect(SlideData.chapterForSceneIndex(19).id).toBe("momentum");
    expect(SlideData.chapterForSceneIndex(20).id).toBe("action");
    expect(SlideData.formatSceneCounter(0)).toBe("01 / 21");
    expect(SlideData.formatSceneCounter(20)).toBe("21 / 21");
  });
});
