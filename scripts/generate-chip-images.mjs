#!/usr/bin/env node
/**
 * Generate text-free Tron-style chip backdrops with the Gemini image API
 * (gemini-2.5-flash-image), style-locked to the slide's clean plate via
 * reference images and chained chip-to-chip for palette continuity.
 *
 * Usage (from the app root):
 *   node scripts/generate-chip-images.mjs 01-title                 # one slide, 16:9
 *   node scripts/generate-chip-images.mjs 01-title --aspect 9:16   # mobile
 *   node scripts/generate-chip-images.mjs --all --aspect both      # everything
 *   node scripts/generate-chip-images.mjs --retakes                # 4 off-style plates
 *   node scripts/generate-chip-images.mjs 01-title --force         # regenerate
 *
 * Requires GEMINI_API_KEY (or GOOGLE_API_KEY) in repo-root .env.local.
 * Outputs: public/concepts/chips/<slideId>/<16x9|9x16>/<slug>.png
 *          public/concepts/clean-retakes/<16x9|9x16>/<plateFile>   (retakes mode)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = resolve(__dirname, "..");
const REPO = resolve(APP, "../..");
const CLEAN = join(APP, "public/concepts/clean");
const CHIP_OUT = join(APP, "public/concepts/chips");
const RETAKE_OUT = join(APP, "public/concepts/clean-retakes");
const MANIFEST_PATH = join(CHIP_OUT, "manifest.json");

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

/** Style references for the four plate retakes: same-accent on-style plates. */
const RETAKE_REFS = {
  "sp-stack-13-executive.png": ["sp-stack-08-fast-start.png", "sp-stack-07-development.png"],
  "sp-stack-19-future.png": ["sp-stack-08-fast-start.png", "sp-stack-06-ten-layers.png"],
  "sp-stack-15-closing.png": ["sp-stack-08-fast-start.png", "sp-stack-12-generations.png"],
  "sp-stack-18-different.png": ["sp-stack-01-title.png", "sp-stack-03-four-stacks.png"],
};

function loadEnvLocal() {
  const envPath = join(REPO, ".env.local");
  if (!existsSync(envPath)) throw new Error(`Missing ${envPath}`);
  const vals = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    vals[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return vals;
}

async function loadSpecs() {
  const { createServer } = await import(
    join(APP, "node_modules/vite/dist/node/index.js")
  );
  const server = await createServer({
    root: APP,
    logLevel: "error",
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true },
  });
  try {
    const imagery = await server.ssrLoadModule("/src/data/chipImagery.ts");
    const slides = await server.ssrLoadModule("/src/data/slides.ts");
    return { imagery, slides };
  } finally {
    await server.close();
  }
}

function imagePart(path) {
  return {
    inline_data: {
      mime_type: "image/png",
      data: readFileSync(path).toString("base64"),
    },
  };
}

async function generateImage({ apiKey, prompt, refPaths, outPath, aspect }) {
  const portraitNote =
    aspect === "9:16"
      ? " Vertical portrait composition for a phone screen: stack the scene " +
        "vertically, keep the hero subject in the middle band of the frame, " +
        "and leave the top and bottom thirds quiet and dark."
      : "";
  const parts = [
    ...refPaths.map(imagePart),
    {
      text:
        `${prompt} Use the attached reference images strictly as the style, ` +
        "palette, lighting, and floor-reflection guide. Compose a brand new scene; " +
        `do not copy the reference composition.${portraitNote}`,
    },
  ];
  const body = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: aspect, imageSize: "2K" },
    },
  };
  const res = await fetch(`${API_ROOT}/${MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 400)}`);
  }
  const json = await res.json();
  const partsOut = json?.candidates?.[0]?.content?.parts ?? [];
  const image = partsOut.find((p) => p.inlineData?.data || p.inline_data?.data);
  if (!image) {
    const finish = json?.candidates?.[0]?.finishReason;
    throw new Error(`No image in response (finishReason=${finish ?? "?"})`);
  }
  const data = image.inlineData?.data ?? image.inline_data?.data;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, Buffer.from(data, "base64"));
  return outPath;
}

async function withRetries(fn, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`  retry ${i + 1}/${tries - 1} after: ${err.message}`);
      await new Promise((r) => setTimeout(r, 4000 * (i + 1)));
    }
  }
  throw lastErr;
}

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return { model: MODEL, entries: {} };
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
}

function saveManifest(manifest) {
  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

function aspectDir(aspect) {
  return aspect === "16:9" ? "16x9" : "9x16";
}

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const retakesMode = argv.includes("--retakes");
  const all = argv.includes("--all");
  const aspectIdx = argv.indexOf("--aspect");
  const aspectArg = aspectIdx !== -1 ? argv[aspectIdx + 1] : "16:9";
  const aspects = aspectArg === "both" ? ["16:9", "9:16"] : [aspectArg];
  if (!aspects.every((a) => a === "16:9" || a === "9:16")) {
    throw new Error(`Unsupported --aspect ${aspectArg}`);
  }
  const slideIds = argv.filter(
    (a, i) => !a.startsWith("--") && argv[i - 1] !== "--aspect",
  );

  const env = loadEnvLocal();
  const apiKey =
    process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not found in env or .env.local");

  const { imagery, slides } = await loadSpecs();
  const {
    CHIP_IMAGE_SPECS,
    PLATE_RETAKES,
    buildChipImagePrompt,
    buildPlateRetakePrompt,
    chipImagePath,
  } = imagery;
  const slideById = new Map(slides.SLIDES.map((s) => [s.id, s]));
  const manifest = loadManifest();

  if (retakesMode) {
    for (const aspect of aspects) {
      for (const retake of PLATE_RETAKES) {
        const outPath = join(RETAKE_OUT, aspectDir(aspect), retake.plateFile);
        if (existsSync(outPath) && !force) {
          console.log(`skip (exists): ${aspectDir(aspect)}/${retake.plateFile}`);
          continue;
        }
        const refPaths = (RETAKE_REFS[retake.plateFile] ?? []).map((f) =>
          join(CLEAN, f),
        );
        const prompt = buildPlateRetakePrompt(retake);
        console.log(`retake: ${aspectDir(aspect)}/${retake.plateFile}`);
        await withRetries(() =>
          generateImage({ apiKey, prompt, refPaths, outPath, aspect }),
        );
        manifest.entries[`retake:${aspectDir(aspect)}/${retake.plateFile}`] = {
          prompt,
          refs: refPaths,
          out: outPath,
          aspect,
          generatedAt: new Date().toISOString(),
        };
        saveManifest(manifest);
        console.log(`  wrote ${outPath}`);
      }
    }
    return;
  }

  const specs = CHIP_IMAGE_SPECS.filter(
    (spec) => all || slideIds.includes(spec.slideId),
  );
  if (specs.length === 0) {
    console.error(
      "No chips selected. Pass slide ids (e.g. 01-title), --all, or --retakes.",
    );
    process.exit(1);
  }

  for (const aspect of aspects) {
    const prevBySlide = new Map();
    for (const spec of specs) {
      const rel = chipImagePath(spec, aspect);
      const outPath = join(APP, "public", rel);
      const slide = slideById.get(spec.slideId);
      if (!slide) throw new Error(`Unknown slide ${spec.slideId}`);

      if (existsSync(outPath) && !force) {
        console.log(`skip (exists): ${rel}`);
        prevBySlide.set(spec.slideId, outPath);
        continue;
      }

      const platePath = join(APP, "public", slide.conceptSrc.replace(/^\//, ""));
      const refPaths = [platePath];
      const prev = prevBySlide.get(spec.slideId);
      if (prev && existsSync(prev)) refPaths.push(prev);

      const prompt = buildChipImagePrompt(spec);
      console.log(
        `chip: ${spec.slideId}/${spec.slug} ${aspect} (${refPaths.length} refs)`,
      );
      await withRetries(() =>
        generateImage({ apiKey, prompt, refPaths, outPath, aspect }),
      );
      prevBySlide.set(spec.slideId, outPath);
      manifest.entries[`${aspectDir(aspect)}/${spec.slideId}/${spec.slug}`] = {
        prompt,
        refs: refPaths,
        out: outPath,
        aspect,
        generatedAt: new Date().toISOString(),
      };
      saveManifest(manifest);
      console.log(`  wrote ${rel}`);
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
