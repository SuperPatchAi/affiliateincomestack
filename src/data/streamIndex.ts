import type { Slide } from "./slides";

export type IncomeStream = {
  id: string;
  stackNumber: number;
  shortLabel: string;
  slideId: string;
};

/** Single source of truth for the ten income streams → slide mapping. */
export const INCOME_STREAMS: readonly IncomeStream[] = [
  { id: "retail", stackNumber: 1, shortLabel: "Retail 25%", slideId: "07-retail" },
  {
    id: "fast-start",
    stackNumber: 2,
    shortLabel: "Fast Start & Ranks",
    slideId: "08-fast-start",
  },
  {
    id: "team-overrides",
    stackNumber: 3,
    shortLabel: "Team Overrides",
    slideId: "09-team-overrides",
  },
  {
    id: "md-depth",
    stackNumber: 4,
    shortLabel: "MD Depth Bonus",
    slideId: "10-md-depth",
  },
  {
    id: "vp-override",
    stackNumber: 5,
    shortLabel: "VP Override",
    slideId: "11-vp-override",
  },
  {
    id: "generations",
    stackNumber: 6,
    shortLabel: "Generations",
    slideId: "12-generations",
  },
  {
    id: "executive",
    stackNumber: 7,
    shortLabel: "Executive Override",
    slideId: "13-executive",
  },
  {
    id: "ceo-bonus",
    stackNumber: 8,
    shortLabel: "CEO Leadership Bonus",
    slideId: "13-executive",
  },
  {
    id: "global-president",
    stackNumber: 9,
    shortLabel: "Global President Override",
    slideId: "14-global",
  },
  {
    id: "global-pool",
    stackNumber: 10,
    shortLabel: "Global Leadership Pool",
    slideId: "14-global",
  },
] as const;

/** Option A: last 1.5s of slide 14 shows recap + spine complete. */
export const RECAP_OVERLAY_TEXT = "You've seen all ten stacks";
export const RECAP_WINDOW_SEC = 1.5;

export function slideIdSet(slides: readonly Slide[]): Set<string> {
  return new Set(slides.map((s) => s.id));
}

export function activeStacksForSlide(slideId: string): number[] {
  return INCOME_STREAMS.filter((s) => s.slideId === slideId).map(
    (s) => s.stackNumber,
  );
}

export function isIncomeStreamSlide(slideId: string): boolean {
  return INCOME_STREAMS.some((s) => s.slideId === slideId);
}

export function isStreamIndexSlide(slideId: string): boolean {
  return slideId === "06-ten-layers";
}

export function isRecapSlide(slideId: string): boolean {
  return slideId === "14-global";
}
