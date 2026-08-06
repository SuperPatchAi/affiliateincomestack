import { describe, expect, it } from "vitest";
import { SLIDES } from "./slides";
import {
  INCOME_STREAMS,
  RECAP_OVERLAY_TEXT,
  RECAP_WINDOW_SEC,
  activeStacksForSlide,
  isIncomeStreamSlide,
  slideIdSet,
} from "./streamIndex";

describe("INCOME_STREAMS", () => {
  it("has exactly ten streams", () => {
    expect(INCOME_STREAMS).toHaveLength(10);
  });

  it("maps every slideId to an existing SLIDES entry", () => {
    const ids = slideIdSet(SLIDES);
    for (const stream of INCOME_STREAMS) {
      expect(ids.has(stream.slideId), `missing slide ${stream.slideId}`).toBe(
        true,
      );
    }
  });

  it("uses unique stack numbers 1–10", () => {
    const numbers = INCOME_STREAMS.map((s) => s.stackNumber);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("pairs stacks 7–8 on executive and 9–10 on global", () => {
    expect(activeStacksForSlide("13-executive")).toEqual([7, 8]);
    expect(activeStacksForSlide("14-global")).toEqual([9, 10]);
  });

  it("marks income stream slides 07–14 only", () => {
    expect(isIncomeStreamSlide("06-ten-layers")).toBe(false);
    expect(isIncomeStreamSlide("07-retail")).toBe(true);
    expect(isIncomeStreamSlide("14-global")).toBe(true);
    expect(isIncomeStreamSlide("15-closing")).toBe(false);
  });

  it("defines recap copy and window for option A", () => {
    expect(RECAP_OVERLAY_TEXT).toBe("You've seen all ten stacks");
    expect(RECAP_WINDOW_SEC).toBe(1.5);
  });
});
