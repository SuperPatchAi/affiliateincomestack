#!/usr/bin/env node
/**
 * Regenerates the HyperFrames composition from slides.ts.
 * Run from apps/superpatch-income-stack: node scripts/generate-hyperframes.mjs
 */
import { writeFileSync, cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../../..");

// Dynamic import of TS via Node type stripping
const {
  SLIDES,
  fittedSizePct,
  annotationSpanPct,
  TITLE_SLAB_BASE,
  TITLE_SLAB_SRCS,
} = await import("../src/data/slides.ts");

const CLIP_DUR = 5;
const total = SLIDES.length * CLIP_DUR;
const outDir = join(
  root,
  "docs/orgs/superpatch/customers/affiliates/initiatives/income-stack-deck/business-idea/15-media/hyperframes/income-stack-deck",
);
const assetsDir = join(outDir, "assets");
mkdirSync(assetsDir, { recursive: true });

// Small accent type needs a lighter tint than the fill accent to clear WCAG AA on the
// near-black stage; only the brand red is dark enough to need one.
const accentTextHex = {
  red: "#ef8989",
};

const accentHex = {
  blue: "#2f6bff",
  green: "#22d36b",
  orange: "#ff7a1a",
  violet: "#8b5cff",
  multi: "#2f6bff",
  cool: "#c8d0e0",
  red: "#dd0604",
};

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

for (const s of SLIDES) {
  const file = s.conceptSrc.split("/").pop();
  cpSync(join(__dirname, "../public", s.conceptSrc), join(assetsDir, file));
}
// Title stack layers (base + 10 coloured slabs) for the drop-in beat.
for (const src of [TITLE_SLAB_BASE, ...TITLE_SLAB_SRCS]) {
  const file = src.split("/").pop();
  cpSync(join(__dirname, "../public", src), join(assetsDir, file));
}

function plateMarkup(slide) {
  if (slide.motionPreset === "parallax-slabs") {
    const base = TITLE_SLAB_BASE.split("/").pop();
    const slabs = TITLE_SLAB_SRCS.map((src, i) => {
      const file = src.split("/").pop();
      return `<img id="slab-${slide.id}-${i}" class="plate slab" src="assets/${file}" alt="" width="1920" height="1080" />`;
    }).join("\n          ");
    return `
        <img
          id="img-${slide.id}"
          class="plate"
          src="assets/${base}"
          alt=""
          width="1920"
          height="1080"
        />
        <div class="slab-stack" id="slabs-${slide.id}" aria-hidden="true">
          ${slabs}
        </div>`;
  }
  const file = slide.conceptSrc.split("/").pop();
  return `
        <img
          id="img-${slide.id}"
          class="plate"
          src="assets/${file}"
          alt=""
          width="1920"
          height="1080"
        />`;
}

// Plates are 3:2 and contain-fitted into the 1920x1080 stage, so the annotation layer
// covers the 1620x1080 letterboxed image rather than the full frame.
const PLATE_W = 1620;
const PLATE_H = 1080;
const PLATE_X = (1920 - PLATE_W) / 2;

// The copy block moves to whichever corner leaves the plate's annotations unobstructed.
// Its footprint is estimated per slide from the wrapped headline and body: a fixed box
// would be wrong in both directions now that headlines are uppercase — too short for a
// three-line headline, and too wide for every slide, which forces annotations off plates
// that in fact have room for them.
const COPY_MAX_W = 1100;
const MARGIN_X = 96;
const MARGIN_Y = 88;
const CLEARANCE = 28;
const EYEBROW_BLOCK = 36;
const HEADLINE_PX = 64;
const HEADLINE_EM = 0.63; // uppercase Montserrat 900 at -1.6% tracking
const HEADLINE_GAP = 18;
const BODY_PX = 28;
const BODY_CH = 38; // .body max-width
const BODY_EM = 0.6;
const DISCLOSURE_BLOCK = 66;

function wrapHeadline(headline) {
  const lines = [];
  let cur = "";
  for (const word of headline.toUpperCase().split(/\s+/)) {
    const candidate = cur ? `${cur} ${word}` : word;
    if (cur && candidate.length * HEADLINE_PX * HEADLINE_EM > COPY_MAX_W) {
      lines.push(cur);
      cur = word;
    } else {
      cur = candidate;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function estimateCopyBox(slide) {
  const lines = wrapHeadline(slide.headline);
  const headlineW = Math.max(
    ...lines.map((l) => l.length * HEADLINE_PX * HEADLINE_EM),
  );
  const bodyLines = Math.ceil(slide.body.length / BODY_CH);
  return {
    w: Math.min(COPY_MAX_W, Math.max(headlineW, BODY_CH * BODY_PX * BODY_EM)),
    h:
      EYEBROW_BLOCK +
      lines.length * HEADLINE_PX +
      HEADLINE_GAP +
      bodyLines * BODY_PX * 1.5 +
      (slide.disclosure ? DISCLOSURE_BLOCK : 0),
  };
}

function copyAnchors(box) {
  return [
    ["bl", MARGIN_X, 1080 - MARGIN_Y - box.h],
    ["br", 1920 - MARGIN_X - box.w, 1080 - MARGIN_Y - box.h],
    ["tl", MARGIN_X, MARGIN_Y],
    ["tr", 1920 - MARGIN_X - box.w, MARGIN_Y],
  ];
}

/** Rendered box of an annotation in stage pixels, from the shared plate-relative span. */
function annotationRect(a) {
  const span = annotationSpanPct(a);
  return {
    x0: PLATE_X + (span.x0 / 100) * PLATE_W - CLEARANCE,
    x1: PLATE_X + (span.x1 / 100) * PLATE_W + CLEARANCE,
    y0: (span.y0 / 100) * PLATE_H - CLEARANCE,
    y1: (span.y1 / 100) * PLATE_H + CLEARANCE,
  };
}

function overlaps(rect, x, y, box) {
  return rect.x0 < x + box.w && rect.x1 > x && rect.y0 < y + box.h && rect.y1 > y;
}

/**
 * Places the copy block clear of the annotations. When no corner is free the annotations
 * are dropped for the film — the copy block states the same figures, and a label sitting
 * under the headline reads like leftover baked type.
 */
function planLayout(slide) {
  const rects = (slide.annotations ?? []).map(annotationRect);
  const box = estimateCopyBox(slide);
  for (const [anchor, x, y] of copyAnchors(box)) {
    if (!rects.some((r) => overlaps(r, x, y, box))) {
      return { anchor, showAnnotations: rects.length > 0, box };
    }
  }
  return { anchor: "bl", showAnnotations: false, box };
}

function annotationMarkup(slide, plan) {
  if (!plan.showAnnotations) return "";
  const spans = slide.annotations
    .map((a, i) => {
      const x = Math.round(PLATE_X + (a.xPct / 100) * PLATE_W);
      const y = Math.round((a.yPct / 100) * PLATE_H);
      const size = Math.round((fittedSizePct(a) / 100) * PLATE_H);
      return `<span class="annotation ${a.role}" id="an-${slide.id}-${i}" style="left: ${x}px; top: ${y}px; font-size: ${size}px">${escapeHtml(a.text)}</span>`;
    })
    .join("\n          ");
  return `
        <div class="annotations" id="an-${slide.id}" aria-hidden="true">
          ${spans}
        </div>`;
}

const layouts = new Map(SLIDES.map((s) => [s.id, planLayout(s)]));

const clips = SLIDES.map((s, i) => {
  const start = i * CLIP_DUR;
  const accent = accentHex[s.accent] || "#2f6bff";
  const accentText = accentTextHex[s.accent] || accent;
  const plan = layouts.get(s.id);
  const disclosure = s.disclosure
    ? `<p class="disclosure" id="d-${s.id}">${escapeHtml(s.disclosure)}</p>`
    : "";
  return `
      <section
        id="clip-${s.id}"
        class="clip slide anchor-${plan.anchor}"
        data-start="${start}"
        data-duration="${CLIP_DUR}"
        data-track-index="1"
        data-slide-index="${i}"
        style="--accent: ${accent}; --accent-text: ${accentText}"
      >
        <div class="fill" aria-hidden="true"></div>
${plateMarkup(s)}
${annotationMarkup(s, plan)}
        <div class="scrim"></div>
        <div class="copy" id="copy-${s.id}" style="width: ${Math.ceil(plan.box.w)}px">
          <p class="eyebrow" id="ey-${s.id}">${escapeHtml(s.eyebrow)}</p>
          <h2 class="headline" id="hl-${s.id}">${escapeHtml(s.headline)}</h2>
          <p class="body" id="bd-${s.id}">${escapeHtml(s.body)}</p>
          ${disclosure}
        </div>
      </section>`;
}).join("\n");

const tweenLines = SLIDES.map((s, i) => {
  const t = i * CLIP_DUR;
  const plateTween =
    s.motionPreset === "parallax-slabs"
      ? `
      tl.from("#img-${s.id}", { opacity: 0, duration: 0.4, ease: "power2.out" }, ${t});
      tl.from("#slabs-${s.id} .slab", { y: -520, opacity: 0, duration: 0.45, stagger: 0.1, ease: "power3.out" }, ${t + 0.15});`
      : `
      tl.fromTo("#img-${s.id}", { scale: 1.08, y: -20 }, { scale: 1, y: 12, duration: ${CLIP_DUR}, ease: "none" }, ${t});`;
  return `${plateTween}
      tl.from("#ey-${s.id}", { y: 24, opacity: 0, duration: 0.55, ease: "power3.out" }, ${t + 0.25});
      tl.from("#hl-${s.id}", { y: 32, opacity: 0, duration: 0.65, ease: "power3.out" }, ${t + 0.35});
      tl.from("#bd-${s.id}", { y: 28, opacity: 0, duration: 0.6, ease: "power2.out" }, ${t + 0.5});
      ${layouts.get(s.id).showAnnotations ? `tl.from("#an-${s.id} > *", { scale: 0.82, opacity: 0, duration: 0.5, stagger: 0.12, ease: "back.out(1.8)" }, ${t + 0.45});` : ""}
      ${s.disclosure ? `tl.from("#d-${s.id}", { opacity: 0, duration: 0.4 }, ${t + 0.7});` : ""}`;
}).join("\n");

const slideshowIsland = {
  version: 1,
  compositionId: "income-stack-main",
  mode: "deck",
  slides: SLIDES.map((s, i) => ({
    id: s.id,
    index: i,
    label: s.headline,
    start: i * CLIP_DUR,
    duration: CLIP_DUR,
    notes: s.body,
  })),
};

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Super Patch Income Stack™ — HyperFrames</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&display=swap" rel="stylesheet" />
    <style>
      body { margin: 0; background: #05070f; color: #ffffff; font-family: "Montserrat", Helvetica, Arial, sans-serif; }
      #root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #05070f; }
      .clip { position: absolute; inset: 0; overflow: hidden; }
      .fill { position: absolute; inset: 0; background: radial-gradient(80% 60% at 50% 20%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 65%); }
      .plate { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: center; background: transparent; }
      .slab-stack { position: absolute; inset: 0; z-index: 0; }
      .slab-stack .slab { background: transparent; }
      /* Sits above the scrim so recovered plate type stays bright artwork instead of reading
         as leftover baked type; the copy block is anchored clear of it per slide. */
      .annotations { position: absolute; inset: 0; z-index: 2; }
      .annotation { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; line-height: 1; }
      .annotation.label { color: rgba(255,255,255,0.92); font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; text-shadow: 0 0 12px color-mix(in srgb, var(--accent) 55%, transparent), 0 2px 8px rgba(0,0,0,0.7); }
      .annotation.metric { color: var(--accent); font-weight: 900; letter-spacing: -0.02em; text-shadow: 0 0 34px color-mix(in srgb, var(--accent) 45%, transparent), 0 2px 12px rgba(0,0,0,0.55); }
      .scrim { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(5,7,15,0.15) 0%, rgba(5,7,15,0.25) 40%, rgba(5,7,15,0.92) 78%, #05070f 100%); }
      /* Top-anchored copy needs the dense end of the scrim flipped up to keep contrast. */
      .anchor-tl .scrim, .anchor-tr .scrim { background: linear-gradient(180deg, #05070f 0%, rgba(5,7,15,0.92) 24%, rgba(5,7,15,0.25) 62%, rgba(5,7,15,0.15) 100%); }
      .copy { position: absolute; max-width: ${COPY_MAX_W}px; z-index: 3; }
      .anchor-bl .copy { left: ${MARGIN_X}px; bottom: ${MARGIN_Y}px; }
      .anchor-br .copy { right: ${MARGIN_X}px; bottom: ${MARGIN_Y}px; }
      .anchor-tl .copy { left: ${MARGIN_X}px; top: ${MARGIN_Y}px; }
      .anchor-tr .copy { right: ${MARGIN_X}px; top: ${MARGIN_Y}px; }
      /* Brand type rules: sub-headline bold sentence case at 150%; headline always
         uppercase Black at 100% leading and -1.6% tracking; body medium at 150% and a
         step lighter than the headline (white over Grey 300, Grey 500 for fine print). */
      .eyebrow { margin: 0 0 14px; color: var(--accent-text, var(--accent)); font-size: 24px; font-weight: 700; line-height: 1.5; }
      .headline { margin: 0 0 18px; font-size: 64px; font-weight: 900; line-height: 1; letter-spacing: -0.016em; text-transform: uppercase; }
      .body { margin: 0; max-width: 38ch; color: #c8c8c8; font-size: 28px; font-weight: 500; line-height: 1.5; }
      .disclosure { margin: 18px 0 0; max-width: 52ch; color: #888888; font-size: 16px; font-weight: 500; line-height: 1.5; }
      .brand { position: absolute; top: 40px; left: 96px; z-index: 3; font-size: 18px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.85; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="income-stack-main" data-start="0" data-width="1920" data-height="1080" data-duration="${total}">
      <div class="brand">Super Patch · Income Stack™</div>
${clips}
    </div>
    <script id="slideshow-deck" type="application/json">
${JSON.stringify(slideshowIsland, null, 2)}
    </script>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${tweenLines}
      window.__timelines["income-stack-main"] = tl;
      window.__incomeStackDeck = JSON.parse(document.getElementById("slideshow-deck").textContent);
    </script>
  </body>
</html>
`;

writeFileSync(join(outDir, "index.html"), html);
console.log(`Wrote ${join(outDir, "index.html")} (${total}s, ${SLIDES.length} slides)`);
for (const s of SLIDES) {
  const plan = layouts.get(s.id);
  if (plan.anchor !== "bl" || (s.annotations?.length && !plan.showAnnotations)) {
    const dropped = s.annotations?.length && !plan.showAnnotations ? " · annotations dropped (no free corner)" : "";
    console.log(`  ${s.id}: copy ${plan.anchor}${dropped}`);
  }
}
