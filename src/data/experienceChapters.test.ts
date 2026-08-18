import { describe, expect, it } from "vitest";
import * as SlideData from "./slides";

describe("experienceChapters", () => {
  it("maps every scene into the four approved chapters", () => {
    expect(SlideData.chapterForSceneIndex(0).id).toBe("full-stack");
    expect(SlideData.chapterForSceneIndex(6).id).toBe("full-stack");
    expect(SlideData.chapterForSceneIndex(7).id).toBe("ten-income-streams");
    expect(SlideData.chapterForSceneIndex(15).id).toBe("ten-income-streams");
    expect(SlideData.chapterForSceneIndex(16).id).toBe("momentum");
    expect(SlideData.chapterForSceneIndex(18).id).toBe("momentum");
    expect(SlideData.chapterForSceneIndex(19).id).toBe("action");
    expect(SlideData.formatSceneCounter(0)).toBe("01 / 20");
    expect(SlideData.formatSceneCounter(19)).toBe("20 / 20");
  });
});
