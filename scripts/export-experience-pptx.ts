/**
 * Export the stills experience as an editable 16:9 PowerPoint.
 *
 *   npx tsx scripts/export-experience-pptx.ts
 *   npx tsx scripts/export-experience-pptx.ts --tron
 *   npm run export:pptx
 *   npm run export:pptx:tron
 *
 * Photoreal output: exports/SuperPatch-Income-Stack-Experience.pptx
 * Tron output:      exports/SuperPatch-Income-Stack-Experience-Tron.pptx
 *
 * Backgrounds are full-bleed 16:9 plates; eyebrow / headline / body are editable.
 */
import { mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import PptxGenJS from "pptxgenjs";

import {
  PPTX_SLIDE_INCHES,
  buildPptxSlideSpecs,
  materializePptxImagePath,
  publicPathToDisk,
  type PptxPlateVariant,
  type PptxSlideSpec,
} from "../src/data/pptxExport";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = join(__dirname, "..");
/** Same mark as ExperienceShell chrome (CSS-inverted white). */
const BRAND_WORDMARK = join(
  APP,
  "public/brand/superpatch-horizontal-wordmark-white.png",
);

const COLORS = {
  white: "FFFFFF",
  muted: "C8C8C8",
  fine: "888888",
  red: "DD0604",
  scrim: "05070F",
  meta: "C8C8C8",
};

function addScrim(slide: PptxGenJS.Slide, pptx: PptxGenJS) {
  const layers = [
    { x: 0, y: 0, w: 4.2, h: 7.5, t: 55 },
    { x: 4.0, y: 0, w: 3.2, h: 7.5, t: 72 },
    { x: 7.0, y: 0, w: 2.8, h: 7.5, t: 88 },
    { x: 0, y: 5.1, w: 13.333, h: 2.4, t: 45 },
  ];
  for (const layer of layers) {
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: layer.x,
      y: layer.y,
      w: layer.w,
      h: layer.h,
      fill: { type: "solid", color: COLORS.scrim, transparency: layer.t },
      line: { color: COLORS.scrim, transparency: 100 },
    });
  }
}

function addChrome(
  slide: PptxGenJS.Slide,
  _pptx: PptxGenJS,
  opts: { brandLockup: boolean },
) {
  if (!existsSync(BRAND_WORDMARK)) {
    throw new Error(
      `Missing brand wordmark: ${BRAND_WORDMARK} (same SUPERPATCH mark as the web chrome)`,
    );
  }
  // 376×64 → keep aspect; chrome uses ~1.85" wide.
  slide.addImage({
    path: BRAND_WORDMARK,
    x: 0.85,
    y: 0.32,
    w: 1.85,
    h: 0.315,
  });
  slide.addText("Income Stack™", {
    x: 10.2,
    y: 0.34,
    w: 2.4,
    h: 0.3,
    fontFace: "Montserrat",
    fontSize: 11,
    color: COLORS.meta,
    align: "right",
    bold: true,
  });

  // Closing: larger centered lockup in the quiet mid band (gate still stays readable).
  if (opts.brandLockup) {
    slide.addImage({
      path: BRAND_WORDMARK,
      x: 4.55,
      y: 2.55,
      w: 4.2,
      h: 0.715,
    });
  }
}

function addCopy(slide: PptxGenJS.Slide, pptx: PptxGenJS, spec: PptxSlideSpec) {
  const left = 0.85;
  const copyW = 7.2;
  let y = spec.headlineOnly ? 4.75 : 4.55;

  if (!spec.headlineOnly) {
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: left,
      y: y + 0.1,
      w: 0.28,
      h: 0.035,
      fill: { color: COLORS.red },
      line: { color: COLORS.red, width: 0 },
    });

    slide.addText(spec.eyebrowDisplay, {
      x: left + 0.4,
      y,
      w: copyW - 0.4,
      h: 0.28,
      fontFace: "Montserrat",
      fontSize: 11,
      bold: true,
      color: COLORS.white,
      margin: 0,
    });
    y += 0.32;
  }

  const headlineH = Math.min(
    spec.headlineOnly ? 2.1 : 1.55,
    0.42 + spec.headlineDisplay.length * 0.012,
  );
  slide.addText(spec.headlineDisplay, {
    x: left,
    y,
    w: copyW,
    h: headlineH,
    fontFace: "Montserrat",
    fontSize: spec.headlineOnly ? 48 : 40,
    bold: true,
    color: COLORS.white,
    margin: 0,
    valign: "top",
    shadow: {
      type: "outer",
      color: "000000",
      blur: 12,
      offset: 3,
      angle: 90,
      opacity: 0.55,
    },
  });
  y += headlineH + 0.08;

  if (!spec.headlineOnly) {
    slide.addText(spec.body, {
      x: left,
      y,
      w: Math.min(copyW, 7.0),
      h: 1.35,
      fontFace: "Montserrat",
      fontSize: 14,
      color: COLORS.muted,
      margin: 0,
      valign: "top",
    });
    y += 1.2;
  }

  if (spec.showStreamIndex && spec.streamLabels?.length) {
    const rows = spec.streamLabels.map((label, i) => ({
      text: `${String(i + 1).padStart(2, "0")}  ${label}`,
      options: { breakLine: true as const },
    }));
    slide.addText(rows, {
      x: left,
      y: Math.min(y, 6.15),
      w: 5.5,
      h: 1.2,
      fontFace: "Montserrat",
      fontSize: 12,
      color: COLORS.white,
      margin: 0,
    });
  }

  if (spec.activeStacks?.length) {
    const startX = left;
    const dotY = 7.05;
    for (let i = 1; i <= 10; i++) {
      const active = spec.activeStacks.includes(i);
      slide.addShape(pptx.shapes.OVAL, {
        x: startX + (i - 1) * 0.22,
        y: dotY,
        w: 0.14,
        h: 0.14,
        fill: {
          color: active ? COLORS.red : "FFFFFF",
          transparency: active ? 0 : 78,
        },
        line: {
          color: "FFFFFF",
          transparency: active ? 100 : 70,
          width: 0.5,
        },
      });
    }
  }

  if (spec.disclosure) {
    slide.addText(spec.disclosure, {
      x: left,
      y: 7.15,
      w: 8,
      h: 0.28,
      fontFace: "Montserrat",
      fontSize: 9,
      color: COLORS.fine,
      margin: 0,
    });
  }

  if (spec.ctaPrimary || spec.ctaSecondary) {
    const parts: string[] = [];
    if (spec.ctaPrimary) parts.push(spec.ctaPrimary);
    if (spec.ctaSecondary) parts.push(spec.ctaSecondary);
    slide.addText(parts.join("  ·  "), {
      x: left,
      y: 6.85,
      w: 7,
      h: 0.28,
      fontFace: "Montserrat",
      fontSize: 12,
      bold: true,
      color: COLORS.white,
      margin: 0,
    });
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const variant: PptxPlateVariant = argv.includes("--tron")
    ? "tron"
    : "photoreal";
  const outName =
    variant === "tron"
      ? "SuperPatch-Income-Stack-Experience-Tron.pptx"
      : "SuperPatch-Income-Stack-Experience.pptx";
  const OUT = join(APP, "exports", outName);

  const specs = buildPptxSlideSpecs(undefined, variant);
  const pptx = new PptxGenJS();
  pptx.defineLayout({
    name: "INCOME_STACK_16x9",
    width: PPTX_SLIDE_INCHES.width,
    height: PPTX_SLIDE_INCHES.height,
  });
  pptx.layout = "INCOME_STACK_16x9";
  pptx.author = "Super Patch";
  pptx.title =
    variant === "tron"
      ? "Super Patch Income Stack™ (Tron)"
      : "Super Patch Income Stack™";
  pptx.subject =
    variant === "tron"
      ? "Editable 16:9 export with original clean Tron plates"
      : "Editable 16:9 stills experience export (photoreal)";
  pptx.company = "The Super Patch Company";

  const mediaTemp = join(APP, "exports", `.pptx-media-${variant}-${Date.now()}`);
  mkdirSync(mediaTemp, { recursive: true });

  try {
    for (const spec of specs) {
      const bg = join(APP, publicPathToDisk(spec.backgroundPublicPath));
      if (!existsSync(bg)) {
        throw new Error(`Missing background: ${bg}`);
      }
      const slide = pptx.addSlide();
      // Gemini plates are often JPEG bytes with a .png name — Online needs .jpg.
      slide.background = { path: materializePptxImagePath(bg, mediaTemp) };
      addScrim(slide, pptx);
      addChrome(slide, pptx, { brandLockup: spec.brandLockup });
      addCopy(slide, pptx, spec);
      if (spec.notes) slide.addNotes(spec.notes);
    }

    mkdirSync(dirname(OUT), { recursive: true });
    await pptx.writeFile({ fileName: OUT });
    console.log(`wrote ${OUT} (${specs.length} slides, 16:9, ${variant})`);
  } finally {
    rmSync(mediaTemp, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
