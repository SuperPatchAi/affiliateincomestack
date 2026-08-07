import { describe, expect, it } from "vitest";
import * as SlideData from "./slides";

describe("experienceChapters", () => {
  it("maps every scene into the three approved chapters", () => {
    expect(typeof SlideData.chapterForSceneIndex).toBe("function");
    expect(typeof SlideData.formatSceneCounter).toBe("function");
    if (
      typeof SlideData.chapterForSceneIndex !== "function" ||
      typeof SlideData.formatSceneCounter !== "function"
    ) {
      return;
    }

    expect(SlideData.chapterForSceneIndex(0).label).toBe("Foundation");
    expect(SlideData.chapterForSceneIndex(6).label).toBe("Ten Income Streams");
    expect(SlideData.chapterForSceneIndex(14).label).toBe("Action");
    expect(SlideData.formatSceneCounter(6)).toBe("07 / 15");
  });
});
