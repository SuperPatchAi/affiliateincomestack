import type { Slide } from "../data/slides";
import { heroSrc } from "../data/slides";

export function shouldShowLiveAnnotations(slide: Slide): boolean {
  const annotations = slide.annotations ?? [];
  if (!annotations.length) return false;
  if (heroSrc(slide) && slide.hero?.annotationsBaked === true) return false;
  // Hero without baked labels: allow live overlays
  return true;
}
