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
const { SLIDES } = await import("../src/data/slides.ts");

const CLIP_DUR = 5;
const total = SLIDES.length * CLIP_DUR;
const outDir = join(
  root,
  "docs/orgs/superpatch/customers/affiliates/initiatives/income-stack-deck/business-idea/15-media/hyperframes/income-stack-deck",
);
const assetsDir = join(outDir, "assets");
mkdirSync(assetsDir, { recursive: true });

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

// Plates are 3:2 and contain-fitted into the 1920x1080 stage, so the annotation layer
// covers the 1620x1080 letterboxed image rather than the full frame.
const PLATE_W = 1620;
const PLATE_H = 1080;
const PLATE_X = (1920 - PLATE_W) / 2;

function annotationMarkup(slide) {
  if (!slide.annotations?.length) return "";
  const spans = slide.annotations
    .map((a, i) => {
      const x = Math.round(PLATE_X + (a.xPct / 100) * PLATE_W);
      const y = Math.round((a.yPct / 100) * PLATE_H);
      const size = Math.round((a.sizePct / 100) * PLATE_H);
      return `<span class="annotation ${a.role}" id="an-${slide.id}-${i}" style="left: ${x}px; top: ${y}px; font-size: ${size}px">${escapeHtml(a.text)}</span>`;
    })
    .join("\n          ");
  return `
        <div class="annotations" id="an-${slide.id}" aria-hidden="true">
          ${spans}
        </div>`;
}

const clips = SLIDES.map((s, i) => {
  const start = i * CLIP_DUR;
  const file = s.conceptSrc.split("/").pop();
  const accent = accentHex[s.accent] || "#2f6bff";
  const disclosure = s.disclosure
    ? `<p class="disclosure" id="d-${s.id}">${escapeHtml(s.disclosure)}</p>`
    : "";
  return `
      <section
        id="clip-${s.id}"
        class="clip slide"
        data-start="${start}"
        data-duration="${CLIP_DUR}"
        data-track-index="1"
        data-slide-index="${i}"
        style="--accent: ${accent}"
      >
        <div class="fill" aria-hidden="true"></div>
        <img
          id="img-${s.id}"
          class="plate"
          src="assets/${file}"
          alt=""
          width="1920"
          height="1080"
        />
${annotationMarkup(s)}
        <div class="scrim"></div>
        <div class="copy" id="copy-${s.id}">
          <p class="eyebrow" id="ey-${s.id}">${escapeHtml(s.eyebrow)}</p>
          <h2 class="headline" id="hl-${s.id}">${escapeHtml(s.headline)}</h2>
          <p class="body" id="bd-${s.id}">${escapeHtml(s.body)}</p>
          ${disclosure}
        </div>
      </section>`;
}).join("\n");

const tweenLines = SLIDES.map((s, i) => {
  const t = i * CLIP_DUR;
  return `
      tl.fromTo("#img-${s.id}", { scale: 1.08, y: -20 }, { scale: 1, y: 12, duration: ${CLIP_DUR}, ease: "none" }, ${t});
      tl.from("#ey-${s.id}", { y: 24, opacity: 0, duration: 0.55, ease: "power3.out" }, ${t + 0.25});
      tl.from("#hl-${s.id}", { y: 32, opacity: 0, duration: 0.65, ease: "power3.out" }, ${t + 0.35});
      tl.from("#bd-${s.id}", { y: 28, opacity: 0, duration: 0.6, ease: "power2.out" }, ${t + 0.5});
      ${s.annotations?.length ? `tl.from("#an-${s.id} > *", { scale: 0.82, opacity: 0, duration: 0.5, stagger: 0.12, ease: "back.out(1.8)" }, ${t + 0.45});` : ""}
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
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800;900&display=swap" rel="stylesheet" />
    <style>
      body { margin: 0; background: #05070f; color: #f4f6fb; font-family: "Montserrat", system-ui, sans-serif; }
      #root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #05070f; }
      .clip { position: absolute; inset: 0; overflow: hidden; }
      .fill { position: absolute; inset: 0; background: radial-gradient(80% 60% at 50% 20%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 65%); }
      .plate { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: center; background: #05070f; }
      /* Sits between plate and scrim so recovered plate type reads as artwork and never fights the copy block. */
      .annotations { position: absolute; inset: 0; z-index: 1; }
      .annotation { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; line-height: 1; }
      .annotation.label { color: rgba(255,255,255,0.92); font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; text-shadow: 0 0 12px color-mix(in srgb, var(--accent) 55%, transparent), 0 2px 8px rgba(0,0,0,0.7); }
      .annotation.metric { color: var(--accent); font-weight: 900; letter-spacing: -0.02em; text-shadow: 0 0 34px color-mix(in srgb, var(--accent) 45%, transparent), 0 2px 12px rgba(0,0,0,0.55); }
      .scrim { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(5,7,15,0.15) 0%, rgba(5,7,15,0.25) 40%, rgba(5,7,15,0.92) 78%, #05070f 100%); }
      .copy { position: absolute; left: 96px; right: 96px; bottom: 88px; max-width: 1100px; z-index: 2; }
      .eyebrow { margin: 0 0 14px; color: var(--accent); font-size: 22px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; }
      .headline { margin: 0 0 18px; font-size: 64px; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; }
      .body { margin: 0; max-width: 38ch; color: #9aa3b5; font-size: 28px; font-weight: 600; line-height: 1.4; }
      .disclosure { margin: 18px 0 0; max-width: 52ch; color: rgba(244,246,251,0.5); font-size: 16px; line-height: 1.35; }
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
