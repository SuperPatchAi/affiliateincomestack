import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { SLIDES } from "./slides";
import { INCOME_STREAMS } from "./streamIndex";
import {
  PPTX_SLIDE_INCHES,
  buildPptxSlideSpecs,
  publicPathToDisk,
  resolvePptxBackgroundPath,
} from "./pptxExport";

const ROOT = join(import.meta.dirname, "../..");

describe("pptx export model", () => {
  it("targets widescreen 16:9 full-bleed inches", () => {
    expect(PPTX_SLIDE_INCHES.width).toBeCloseTo(13.333, 2);
    expect(PPTX_SLIDE_INCHES.height).toBeCloseTo(7.5, 2);
    expect(PPTX_SLIDE_INCHES.width / PPTX_SLIDE_INCHES.height).toBeCloseTo(
      16 / 9,
      2,
    );
  });

  it("emits one editable slide per experience scene, in deck order", () => {
    const specs = buildPptxSlideSpecs(SLIDES);
    expect(specs).toHaveLength(SLIDES.length);
    expect(specs.map((s) => s.slideId)).toEqual(SLIDES.map((s) => s.id));
  });

  it("points each slide at its 16:9 clean concept still on disk", () => {
    const specs = buildPptxSlideSpecs(SLIDES);
    for (const [i, slide] of SLIDES.entries()) {
      expect(specs[i]!.backgroundPublicPath).toBe(slide.conceptSrc);
      const disk = join(ROOT, publicPathToDisk(slide.conceptSrc));
      expect(existsSync(disk), disk).toBe(true);
    }
  });

  it("uses on-screen body when present, otherwise body", () => {
    const withOnScreen = SLIDES.find((s) => s.onScreenBody?.trim());
    const without = SLIDES.find((s) => !s.onScreenBody?.trim());
    expect(without).toBeDefined();
    const specs = buildPptxSlideSpecs(SLIDES);
    if (withOnScreen) {
      const spec = specs.find((s) => s.slideId === withOnScreen.id)!;
      expect(spec.body).toBe(withOnScreen.onScreenBody!.trim());
    }
    const plain = specs.find((s) => s.slideId === without!.id)!;
    expect(plain.body).toBe(without!.body);
  });

  it("marks the ten-stream index scene with all stream labels", () => {
    const spec = buildPptxSlideSpecs(SLIDES).find(
      (s) => s.slideId === "08-ten-layers",
    );
    expect(spec?.showStreamIndex).toBe(true);
    expect(spec?.streamLabels).toEqual(
      INCOME_STREAMS.map((s) => s.shortLabel),
    );
  });

  it("carries active income-stack numbers for stream slides", () => {
    const retail = buildPptxSlideSpecs(SLIDES).find(
      (s) => s.slideId === "07-retail",
    );
    expect(retail?.activeStacks).toEqual([1]);
    const executive = buildPptxSlideSpecs(SLIDES).find(
      (s) => s.slideId === "13-executive",
    );
    expect(executive?.activeStacks).toEqual([7, 8]);
  });

  it("flags closing for brand lockup and keeps eyebrow/headline/body editable", () => {
    const closing = buildPptxSlideSpecs(SLIDES).find(
      (s) => s.slideId === "15-closing",
    );
    expect(closing?.brandLockup).toBe(true);
    expect(closing?.eyebrow.length).toBeGreaterThan(0);
    expect(closing?.headline.length).toBeGreaterThan(0);
    expect(closing?.body.length).toBeGreaterThan(0);
    expect(
      buildPptxSlideSpecs(SLIDES).filter((s) => s.brandLockup),
    ).toHaveLength(1);
  });

  it("uppercases headline for display while keeping source headline", () => {
    const first = buildPptxSlideSpecs(SLIDES)[0]!;
    expect(first.headlineDisplay).toBe(first.headline.toUpperCase());
    expect(first.eyebrowDisplay).toBe(first.eyebrow.toUpperCase());
  });

  it("exports the same SUPERPATCH wordmark family the web chrome uses", () => {
    const white = join(
      ROOT,
      "public/brand/superpatch-horizontal-wordmark-white.png",
    );
    const source = join(ROOT, "public/brand/superpatch-horizontal-wordmark.png");
    expect(existsSync(source)).toBe(true);
    expect(existsSync(white)).toBe(true);
    const exportScript = readFileSync(
      join(ROOT, "scripts/export-experience-pptx.ts"),
      "utf8",
    );
    expect(exportScript).toContain(
      "superpatch-horizontal-wordmark-white.png",
    );
    expect(exportScript).not.toContain(
      "superpatch-company-horizontal-white.svg",
    );
  });

  it("maps photoreal backgrounds to clean/ and tron backgrounds to clean-tron/", () => {
    const sample = "/concepts/clean/sp-stack-08-fast-start.png";
    expect(resolvePptxBackgroundPath(sample, "photoreal")).toBe(sample);
    expect(resolvePptxBackgroundPath(sample, "tron")).toBe(
      "/concepts/clean-tron/sp-stack-08-fast-start.png",
    );
  });

  it("points every tron slide at a clean-tron plate that exists on disk", () => {
    const photo = buildPptxSlideSpecs(SLIDES, "photoreal");
    const tron = buildPptxSlideSpecs(SLIDES, "tron");
    expect(tron).toHaveLength(SLIDES.length);
    let differingPlates = 0;
    for (let i = 0; i < SLIDES.length; i++) {
      expect(tron[i]!.backgroundPublicPath).toContain("/concepts/clean-tron/");
      expect(tron[i]!.backgroundPublicPath).not.toBe(
        photo[i]!.backgroundPublicPath,
      );
      const photoDisk = join(
        ROOT,
        publicPathToDisk(photo[i]!.backgroundPublicPath),
      );
      const tronDisk = join(
        ROOT,
        publicPathToDisk(tron[i]!.backgroundPublicPath),
      );
      expect(existsSync(tronDisk), tronDisk).toBe(true);
      expect(existsSync(photoDisk), photoDisk).toBe(true);
      // Some income plates were never photorealized (e.g. global pool) — identical
      // bytes are fine; the decks still diverge on path + the swapped plates.
      if (!readFileSync(tronDisk).equals(readFileSync(photoDisk))) {
        differingPlates += 1;
      }
    }
    expect(differingPlates).toBeGreaterThan(SLIDES.length / 2);
  });
});
