import { SLIDES } from "./slides";

export type ExperienceAspect = "landscape" | "portrait";

export type ExperienceVariant = {
  src: string;
  poster: string;
  width: number;
  height: number;
};

export type ExperienceMedia = {
  slideId: string;
  landscape: ExperienceVariant;
  portrait: ExperienceVariant;
  /** Closing scene uses the deterministic SuperPatch brand lockup treatment. */
  brandLockup?: boolean;
  stillOnly?: boolean;
};

/**
 * Titles-first branch: every scene is a full-bleed still from the slide's
 * concept plate. Omni video and chip heroes stay off until we re-enable them.
 * Remaining Tron plates for later scenes are temporary stand-ins.
 */
export const EXPERIENCE_MEDIA: ExperienceMedia[] = SLIDES.map((slide) => {
  const poster = slide.conceptSrc;
  return {
    slideId: slide.id,
    stillOnly: true,
    landscape: { src: "", poster, width: 1920, height: 1080 },
    portrait: { src: "", poster, width: 1920, height: 1080 },
    brandLockup: slide.id === "15-closing" ? true : undefined,
  };
});

export function experienceMediaForSlide(
  slideId: string,
): ExperienceMedia | undefined {
  return EXPERIENCE_MEDIA.find((m) => m.slideId === slideId);
}

export function resolveExperienceSrc(
  media: ExperienceMedia,
  aspect: ExperienceAspect,
): ExperienceVariant {
  return aspect === "landscape" ? media.landscape : media.portrait;
}

/** Previous / current / next indices for bounded media attachment. */
export function mediaWindow(activeIndex: number, total: number): number[] {
  const indices: number[] = [];
  for (let i = activeIndex - 1; i <= activeIndex + 1; i++) {
    if (i >= 0 && i < total) indices.push(i);
  }
  return indices;
}

/** Convert a public URL path (`/concepts/...`) to a repo-relative file path. */
export function publicExperiencePath(publicPath: string): string {
  const trimmed = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  return `public/${trimmed}`;
}

export function assertExperienceMediaValid(media: ExperienceMedia[]): void {
  if (media.length !== SLIDES.length) {
    throw new Error(
      `Expected ${SLIDES.length} experience media entries, got ${media.length}`,
    );
  }
  const ids = media.map((m) => m.slideId);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Duplicate experience media slide ids");
  }
  for (const entry of media) {
    if (!entry.stillOnly) {
      throw new Error(`Expected stillOnly for ${entry.slideId}`);
    }
    if (entry.landscape.src || entry.portrait.src) {
      throw new Error(`stillOnly ${entry.slideId} must have empty src`);
    }
    if (!entry.landscape.poster || !entry.portrait.poster) {
      throw new Error(`stillOnly ${entry.slideId} needs posters`);
    }
    if (entry.slideId === "15-closing" && !entry.brandLockup) {
      throw new Error("Closing scene must set brandLockup");
    }
  }
}
