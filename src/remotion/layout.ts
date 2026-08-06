import { annotationSpanPct, type Slide } from "../data/slides";
import { shouldShowLiveAnnotations } from "./labels";

export type CopyAnchor = "bl" | "br" | "tl" | "tr";

/**
 * Park the copy block in a corner that does not cover plate annotations.
 * Mirrors the HyperFrames planner at a coarser grain (quadrant occupancy).
 */
export function pickCopyAnchor(slide: Slide): {
  anchor: CopyAnchor;
  showAnnotations: boolean;
} {
  const annotations = slide.annotations ?? [];
  const showAnnotations = shouldShowLiveAnnotations(slide);
  if (!showAnnotations) {
    return { anchor: "bl", showAnnotations: false };
  }

  // Prefer the left column first (tl before br). Jumping to the right to dodge a
  // left-side metric parks copy on the hero graphic — e.g. retail 25% vs phone.
  const corners: CopyAnchor[] = ["bl", "tl", "br", "tr"];
  const occupied = new Set<CopyAnchor>();
  for (const a of annotations) {
    const span = annotationSpanPct(a);
    const left = span.x1 < 50;
    const top = span.y1 < 50;
    if (left && top) occupied.add("tl");
    if (!left && top) occupied.add("tr");
    if (left && !top) occupied.add("bl");
    if (!left && !top) occupied.add("br");
  }

  const free = corners.find((c) => !occupied.has(c));
  if (free) return { anchor: free, showAnnotations: true };
  // No free corner — keep copy, drop annotations (same call as HyperFrames).
  return { anchor: "bl", showAnnotations: false };
}
