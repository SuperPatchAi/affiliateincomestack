import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { execFileSync } from "node:child_process";

import { SLIDES, type Slide } from "./slides";
import {
  INCOME_STREAMS,
  activeStacksForSlide,
  isIncomeStreamSlide,
  isStreamIndexSlide,
} from "./streamIndex";

/** Widescreen 16:9 — PptxGenJS LAYOUT_WIDE. */
export const PPTX_SLIDE_INCHES = {
  width: 13.333,
  height: 7.5,
} as const;

/** Max long edge for PPTX Online-safe plate embeds (1080p 16:9). */
export const PPTX_ONLINE_MAX_EDGE_PX = 1920;

/** Photoreal stills (current clean/) vs original clean Tron plates (clean-tron/). */
export type PptxPlateVariant = "photoreal" | "tron";

export type PptxSlideSpec = {
  slideId: string;
  index: number;
  backgroundPublicPath: string;
  eyebrow: string;
  eyebrowDisplay: string;
  headline: string;
  headlineDisplay: string;
  body: string;
  /** Skip eyebrow + body blocks (era opener). */
  headlineOnly?: boolean;
  disclosure?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  showStreamIndex: boolean;
  streamLabels?: string[];
  activeStacks?: number[];
  brandLockup: boolean;
  notes?: string;
};

/** Convert a public URL path (`/concepts/...`) to a repo-relative file path. */
export function publicPathToDisk(publicPath: string): string {
  const trimmed = publicPath.startsWith("/")
    ? publicPath.slice(1)
    : publicPath;
  return `public/${trimmed}`;
}

/**
 * PowerPoint Online rejects Gemini plates that are JPEG bytes named `.png`,
 * and often fails on high-DPI / oversized slide backgrounds.
 *
 * Always emit a fresh `.jpg` under `tempDir` when the source is JPEG:
 * correct extension, 72 dpi, long edge capped at 1920px.
 */
export function materializePptxImagePath(
  srcPath: string,
  tempDir: string,
): string {
  const bytes = readFileSync(srcPath);
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!isJpeg) return srcPath;

  mkdirSync(tempDir, { recursive: true });
  const base = basename(srcPath).replace(/\.(png|jpe?g)$/i, ".jpg");
  const rawJpg = join(tempDir, `raw-${base}`);
  writeFileSync(rawJpg, bytes);

  const optimized = join(tempDir, base);
  try {
    execFileSync(
      "sips",
      [
        "-s",
        "format",
        "jpeg",
        "-s",
        "formatOptions",
        "85",
        "-s",
        "dpiWidth",
        "72",
        "-s",
        "dpiHeight",
        "72",
        "-Z",
        String(PPTX_ONLINE_MAX_EDGE_PX),
        rawJpg,
        "--out",
        optimized,
      ],
      { stdio: "pipe" },
    );
    if (existsSync(optimized) && readFileSync(optimized).length > 0) {
      return optimized;
    }
  } catch {
    // Fall back to extension-corrected JPEG if sips cannot rewrite the bytes.
  }
  return rawJpg;
}

/**
 * Resolve the on-disk background for a slide concept path.
 * Photoreal uses `slide.conceptSrc` (clean/). Tron swaps `/concepts/clean/` →
 * `/concepts/clean-tron/` (original neon plates from the pre-photoreal deck).
 */
export function resolvePptxBackgroundPath(
  conceptSrc: string,
  variant: PptxPlateVariant = "photoreal",
): string {
  if (variant === "photoreal") return conceptSrc;
  if (!conceptSrc.includes("/concepts/clean/")) {
    throw new Error(
      `Tron PPTX variant expects a /concepts/clean/ plate, got ${conceptSrc}`,
    );
  }
  return conceptSrc.replace("/concepts/clean/", "/concepts/clean-tron/");
}

export function buildPptxSlideSpecs(
  slides: readonly Slide[] = SLIDES,
  variant: PptxPlateVariant = "photoreal",
): PptxSlideSpec[] {
  return slides.map((slide, index) => {
    const headlineOnly = slide.copyLayout === "headline-only";
    const body = headlineOnly
      ? ""
      : slide.onScreenBody?.trim()
        ? slide.onScreenBody.trim()
        : slide.body;
    const showStreamIndex = isStreamIndexSlide(slide.id);
    const streamSlide = isIncomeStreamSlide(slide.id);
    return {
      slideId: slide.id,
      index,
      backgroundPublicPath: resolvePptxBackgroundPath(slide.conceptSrc, variant),
      eyebrow: headlineOnly ? "" : slide.eyebrow,
      eyebrowDisplay: headlineOnly ? "" : slide.eyebrow.toUpperCase(),
      headline: slide.headline,
      headlineDisplay: slide.headline.toUpperCase(),
      body,
      headlineOnly: headlineOnly || undefined,
      disclosure: slide.disclosure,
      ctaPrimary: slide.ctaPrimary,
      ctaSecondary: slide.ctaSecondary,
      showStreamIndex,
      streamLabels: showStreamIndex
        ? INCOME_STREAMS.map((s) => s.shortLabel)
        : undefined,
      activeStacks: streamSlide ? activeStacksForSlide(slide.id) : undefined,
      brandLockup: slide.id === "15-closing",
      notes: slide.presenterNotes,
    };
  });
}
