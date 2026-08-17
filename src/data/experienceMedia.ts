import { OMNI_PLATES } from "./omniChain";
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

/** Omni plate slug keyed by slide id — plate filenames differ from a few slide ids. */
const SLIDE_TO_OMNI_SLUG: Record<string, string> = {
  "01-title": "title",
  "03-four-stacks": "four-stacks",
  "04-flywheel": "flywheel",
  "08-ten-layers": "ten-layers",
  "07-retail": "retail",
  "08-fast-start": "fast-start",
  "09-team-overrides": "team-overrides",
  "10-md-depth": "unlimited-depth",
  "11-vp-override": "vp-override",
  "12-generations": "generations",
  "13-executive": "executive",
  "14-global": "global-pool",
  "15-closing": "closing",
};

const STILL_ONLY_IDS = new Set([
  "00-super-stack",
  "02-world",
  "05-product",
  "06-brand",
  "07-development",
  "17-compounding",
  "18-different",
  "19-future",
]);

function omniIdForSlide(slideId: string): string {
  const plate = OMNI_PLATES.find(
    (p) => SLIDE_TO_OMNI_SLUG[slideId] === p.slug,
  );
  if (!plate) {
    throw new Error(`No Omni plate mapped for slide ${slideId}`);
  }
  return plate.id;
}

function variantFor(
  slideId: string,
  aspectDir: "16x9" | "9x16",
  width: number,
  height: number,
): ExperienceVariant {
  const plate = OMNI_PLATES.find(
    (p) => SLIDE_TO_OMNI_SLUG[slideId] === p.slug,
  );
  if (!plate) {
    throw new Error(`No Omni plate mapped for slide ${slideId}`);
  }
  const base = `sp-stack-${plate.id}-${plate.slug}`;
  return {
    src: `/concepts/omni-chain/${aspectDir}/${base}_omni.mp4`,
    poster: `/concepts/omni-chain/posters/${aspectDir}/${base}.webp`,
    width,
    height,
  };
}

export const EXPERIENCE_MEDIA: ExperienceMedia[] = SLIDES.map((slide) => {
  if (STILL_ONLY_IDS.has(slide.id)) {
    const poster =
      slide.id === "00-super-stack"
        ? "/concepts/clean/sp-stack-18-different.webp"
        : slide.conceptSrc;
    return {
      slideId: slide.id,
      stillOnly: true,
      landscape: { src: "", poster, width: 1920, height: 1080 },
      portrait: { src: "", poster, width: 1920, height: 1080 },
    };
  }
  return {
    slideId: slide.id,
    landscape: variantFor(slide.id, "16x9", 1280, 720),
    portrait: variantFor(slide.id, "9x16", 720, 1280),
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
    if (entry.stillOnly) {
      if (entry.landscape.src || entry.portrait.src) {
        throw new Error(`stillOnly ${entry.slideId} must have empty src`);
      }
      if (!entry.landscape.poster || !entry.portrait.poster) {
        throw new Error(`stillOnly ${entry.slideId} needs posters`);
      }
      continue;
    }
    const slug = SLIDE_TO_OMNI_SLUG[entry.slideId];
    if (!slug) {
      throw new Error(`Missing Omni slug for ${entry.slideId}`);
    }
    // Ensure mapping stays aligned with OMNI_PLATES ids.
    omniIdForSlide(entry.slideId);
    if (entry.slideId === "15-closing" && !entry.brandLockup) {
      throw new Error("Closing scene must set brandLockup");
    }
  }
}
