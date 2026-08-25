#!/usr/bin/env node
/**
 * Generate text-free Tron-style chip backdrops with the Gemini image API
 * (gemini-2.5-flash-image), style-locked to the slide's clean plate via
 * reference images and chained chip-to-chip for palette continuity.
 *
 * Usage (from the app root):
 *   node scripts/generate-chip-images.mjs 01-title                 # one slide, 16:9
 *   node scripts/generate-chip-images.mjs 01-title --aspect 9:16   # mobile
 *   node scripts/generate-chip-images.mjs 04-flywheel products-create-customers
 *   node scripts/generate-chip-images.mjs --all --aspect both      # everything
 *   node scripts/generate-chip-images.mjs --retakes                # daylight plate retakes
 *   node scripts/generate-chip-images.mjs --neon-city              # neon restyle of photoreal titles
 *   node scripts/generate-chip-images.mjs --neon-city 05-product --force
 *   node scripts/generate-chip-images.mjs 01-title --force         # regenerate
 *
 * Requires GEMINI_API_KEY (or GOOGLE_API_KEY) in repo-root .env.local.
 * Outputs: public/concepts/chips/<slideId>/<16x9|9x16>/<slug>.png
 *          public/concepts/clean-retakes/<16x9|9x16>/<plateFile>   (retakes mode)
 *          public/concepts/clean-neon-city/<16x9|9x16>/<plateFile> (neon-city mode)
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = resolve(__dirname, "..");
const REPO = resolve(APP, "../..");
const CLEAN = join(APP, "public/concepts/clean");
const CHIP_OUT = join(APP, "public/concepts/chips");
const RETAKE_OUT = join(APP, "public/concepts/clean-retakes");
const NEON_CITY_OUT = join(APP, "public/concepts/clean-neon-city");
const CONCEPTS = join(APP, "public/concepts");
const MANIFEST_PATH = join(CHIP_OUT, "manifest.json");

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Style references for the plate retakes: same-accent on-style plates.
 * The world plate is photoreal (own style anchor) and renders without refs.
 */
const RETAKE_REFS = {
  "sp-stack-01-title.png": [],
  "sp-stack-02-world.png": [],
  "sp-stack-03-four-stacks.png": [],
  "sp-stack-05-product.png": [],
  "sp-stack-08-fast-start.png": [],
  "sp-stack-09-team-overrides.png": [],
  "sp-stack-10-unlimited-depth.png": [],
  "sp-stack-11-vp-override.png": [],
  "sp-stack-12-generations.png": [],
  "sp-stack-13-executive.png": [],
  "sp-stack-18-different.png": [],
  "sp-stack-19-future.png": [],
  "sp-stack-15-closing.png": [],
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

async function generateImage({
  apiKey,
  prompt,
  refPaths,
  outPath,
  aspect,
  styled,
  recompose = false,
  identityRef = false,
  packIdentity = false,
  personIdentity = false,
}) {
  const portraitNote =
    aspect === "9:16" && !recompose
      ? styled
        ? " Vertical portrait composition for a phone screen: recompose the " +
          "photograph to fill the entire vertical frame edge to edge with the " +
          "scene — absolutely no black bars, borders, or letterboxing. Keep " +
          "the hero subject in the middle band with the upper and lower " +
          "thirds dim and out of focus but still part of the continuous scene."
        : " Vertical portrait composition for a phone screen: stack the scene " +
          "vertically, keep the hero subject in the middle band of the frame, " +
          "and leave the top and bottom thirds quiet and dark."
      : "";
  // Recompose mode inverts the usual ref guidance: the prompt itself asks the
  // model to re-frame the attached photograph, so no style-only note applies.
  const refNote =
    refPaths.length > 0 && !recompose
      ? packIdentity
        ? " The first attached image is the official pouch. Keep that packaging " +
          "unaltered — do not redraw or restyle it. If a second image is attached, " +
          "it is the same man; keep his face, hair, clothes, and one-arm pose. " +
          "Generate one new photograph of him holding the official pouch. " +
          "Do not paste the pouch on afterwards."
        : personIdentity
          ? " The attached photographs are the exact person identity reference. " +
            "Keep his face, bald head, salt-and-pepper goatee, body, and navy suit " +
            "identical and unaltered. Natural lived-in skin with pores and laugh lines — " +
            "not plastic, not airbrushed, not porcelain CGI. Compose a brand-new neon " +
            "night-city scene and camera; do not copy the daylight lobby backdrop."
          : identityRef
          ? " The attached image is a product or brand-mark identity reference only. " +
            "Compose a brand-new photograph; do not copy the reference composition, " +
            "camera, or backdrop."
          : " Use the attached reference images strictly as the style, " +
            "palette, lighting, and reflection guide. Compose a brand new scene; " +
            "do not copy the reference composition."
      : "";
  const parts = [
    ...refPaths.map(imagePart),
    { text: `${prompt}${refNote}${portraitNote}` },
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
  const neonCityMode = argv.includes("--neon-city");
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
    NEON_CITY_PLATE_RETAKES,
    NEON_CITY_EXISTING_FITS,
    buildChipImagePrompt,
    buildPlateRetakePrompt,
    buildNeonCityFromPhotorealPrompt,
    buildPlatePatchEditPrompt,
    buildEraPatchDepthEditPrompt,
    buildPlateRemoveArmPatchPrompt,
    buildCompoundingScreenMarkEditPrompt,
    buildProductPackCompositePrompt,
    buildProductPackGripEditPrompt,
    buildProductPackHealPrompt,
    buildProductPatchScaleEditPrompt,
    buildPortraitRecomposePrompt,
    buildHarborConstructionStartPrompt,
    chipImagePath,
  } = imagery;
  const slideById = new Map(slides.SLIDES.map((s) => [s.id, s]));
  const manifest = loadManifest();

  if (argv.includes("--construct-start")) {
    const prompt = buildHarborConstructionStartPrompt();
    for (const aspect of aspects) {
      const scenePath = join(RETAKE_OUT, aspectDir(aspect), "sp-stack-03-four-stacks.png");
      const fallback = aspect === "16:9" ? join(CLEAN, "sp-stack-03-four-stacks.png") : "";
      const source = existsSync(scenePath) ? scenePath : fallback;
      if (!source || !existsSync(source)) {
        throw new Error(`missing harbor still for ${aspect}: ${scenePath}`);
      }
      const outPath = join(
        RETAKE_OUT,
        aspectDir(aspect),
        "sp-stack-03-four-stacks-foundation.png",
      );
      if (existsSync(outPath) && !force) {
        console.log(`skip (exists): ${aspectDir(aspect)}/sp-stack-03-four-stacks-foundation.png`);
        continue;
      }
      console.log(`construct-start: ${aspectDir(aspect)}/sp-stack-03-four-stacks-foundation.png`);
      await withRetries(() =>
        generateImage({
          apiKey,
          prompt,
          refPaths: [source],
          outPath,
          aspect,
          styled: true,
          recompose: true,
        }),
      );
      console.log(`  wrote ${outPath}`);
    }
    return;
  }

  if (argv.includes("--scale-patch")) {
    const scenePath = join(
      APP,
      "public/concepts/chips/03-four-stacks/16x9/product-stack.png",
    );
    if (!existsSync(scenePath)) throw new Error(`missing ${scenePath}`);
    const prompt = buildProductPatchScaleEditPrompt();
    console.log("scale-patch: product-stack.png");
    await withRetries(() =>
      generateImage({
        apiKey,
        prompt,
        refPaths: [scenePath],
        outPath: scenePath,
        aspect: "16:9",
        styled: true,
        recompose: true,
      }),
    );
    console.log(`  wrote ${scenePath}`);
    return;
  }

  if (argv.includes("--grip-pack")) {
    const scenePath = join(RETAKE_OUT, "16x9", "sp-stack-05-product.png");
    if (!existsSync(scenePath)) throw new Error(`missing ${scenePath}`);
    const prompt = buildProductPackGripEditPrompt();
    console.log("grip-pack: sp-stack-05-product.png");
    await withRetries(() =>
      generateImage({
        apiKey,
        prompt,
        refPaths: [scenePath],
        outPath: scenePath,
        aspect: "16:9",
        styled: true,
        recompose: true,
      }),
    );
    console.log(`  wrote ${scenePath}`);
    return;
  }

  if (argv.includes("--heal-pack")) {
    const scenePath = join(RETAKE_OUT, "16x9", "sp-stack-05-product.png");
    const pouchPath = join(APP, "public/concepts/refs/na-sp-freedom-30pk.png");
    if (!existsSync(scenePath)) throw new Error(`missing ${scenePath}`);
    if (!existsSync(pouchPath)) throw new Error(`missing ${pouchPath}`);
    const prompt = buildProductPackHealPrompt();
    console.log("heal-pack: sp-stack-05-product.png");
    await withRetries(() =>
      generateImage({
        apiKey,
        prompt,
        refPaths: [scenePath, pouchPath],
        outPath: scenePath,
        aspect: "16:9",
        styled: true,
        recompose: true,
        identityRef: true,
      }),
    );
    console.log(`  wrote ${scenePath}`);
    return;
  }

  if (argv.includes("--pack-composite")) {
    const scenePath = join(RETAKE_OUT, "16x9", "sp-stack-05-product.png");
    const pouchPath = join(APP, "public/concepts/refs/na-sp-freedom-30pk.png");
    if (!existsSync(scenePath)) throw new Error(`missing ${scenePath}`);
    if (!existsSync(pouchPath)) throw new Error(`missing ${pouchPath}`);
    const prompt = buildProductPackCompositePrompt();
    console.log("pack-composite: sp-stack-05-product.png");
    await withRetries(() =>
      generateImage({
        apiKey,
        prompt,
        refPaths: [scenePath, pouchPath],
        outPath: scenePath,
        aspect: "16:9",
        styled: true,
        recompose: true,
        identityRef: true,
      }),
    );
    console.log(`  wrote ${scenePath}`);
    return;
  }

  if (argv.includes("--remove-arm-patch")) {
    const scenePath = join(CLEAN, "sp-stack-01-title.png");
    if (!existsSync(scenePath)) throw new Error(`missing ${scenePath}`);
    const prompt = buildPlateRemoveArmPatchPrompt();
    console.log("remove-arm-patch: sp-stack-01-title.png");
    await withRetries(() =>
      generateImage({
        apiKey,
        prompt,
        refPaths: [scenePath],
        outPath: scenePath,
        aspect: "16:9",
        styled: true,
        recompose: true,
      }),
    );
    console.log(`  wrote ${scenePath}`);
    const retake16 = join(RETAKE_OUT, "16x9", "sp-stack-01-title.png");
    mkdirSync(dirname(retake16), { recursive: true });
    writeFileSync(retake16, readFileSync(scenePath));
    console.log(`  wrote ${retake16}`);
    // Recompose portrait from the healed landscape still.
    const retake9 = join(RETAKE_OUT, "9x16", "sp-stack-01-title.png");
    mkdirSync(dirname(retake9), { recursive: true });
    await withRetries(() =>
      generateImage({
        apiKey,
        prompt:
          "Recompose the attached photograph into a vertical phone-screen frame. Keep the same person with bare upper arms, same city, lighting, and no wearable on the arm. Fill the frame edge to edge with no letterboxing.",
        refPaths: [scenePath],
        outPath: retake9,
        aspect: "9:16",
        styled: true,
        recompose: true,
      }),
    );
    console.log(`  wrote ${retake9}`);
    return;
  }

  if (argv.includes("--era-depth")) {
    const scenePath = join(CLEAN, "sp-stack-00-era.png");
    const patchPath = join(
      APP,
      "public/concepts/refs/packages/Patch_Freedom_NoPeel_RGB.png",
    );
    const neonBg = join(NEON_CITY_OUT, "16x9", "sp-stack-00-era.png");
    if (!existsSync(patchPath)) throw new Error(`missing ${patchPath}`);
    if (!existsSync(neonBg)) throw new Error(`missing ${neonBg}`);

    // Always rebuild from the official NoPeel still first so fingerprint ridges
    // are exact before the Gemini depth/lighting pass.
    console.log("era-depth: recomposing from official NoPeel + neon city BG");
    const compose = spawnSync(
      "python3",
      [join(APP, "scripts/compose-era-plate.py"), "--also-tron"],
      { cwd: APP, encoding: "utf8" },
    );
    if (compose.status !== 0) {
      throw new Error(
        `compose-era-plate failed: ${compose.stderr || compose.stdout}`,
      );
    }
    console.log(compose.stdout.trim());

    if (!existsSync(scenePath)) throw new Error(`missing ${scenePath}`);
    const backup = `${scenePath}.pre-depth`;
    copyFileSync(scenePath, backup);
    console.log(`backup: ${backup}`);

    const prompt = buildEraPatchDepthEditPrompt();
    console.log("era-depth: Gemini thickness + ridge restore on sp-stack-00-era.png");
    await withRetries(() =>
      generateImage({
        apiKey,
        prompt,
        refPaths: [scenePath, patchPath],
        outPath: scenePath,
        aspect: "16:9",
        styled: true,
        recompose: true,
      }),
    );
    copyFileSync(scenePath, join(APP, "public/concepts/clean-tron/sp-stack-00-era.png"));
    console.log(`  wrote ${scenePath}`);
    return;
  }

  if (argv.includes("--patch-edit")) {
    const scenePath = join(CLEAN, "sp-stack-01-title.png");
    const patchPath = join(APP, "public/concepts/refs/superpatch-freedom.png");
    if (!existsSync(scenePath)) throw new Error(`missing ${scenePath}`);
    if (!existsSync(patchPath)) throw new Error(`missing ${patchPath}`);
    const prompt = buildPlatePatchEditPrompt();
    console.log("patch-edit: sp-stack-01-title.png");
    await withRetries(() =>
      generateImage({
        apiKey,
        prompt,
        refPaths: [scenePath, patchPath],
        outPath: scenePath,
        aspect: "16:9",
        styled: true,
        recompose: true,
      }),
    );
    console.log(`  wrote ${scenePath}`);
    return;
  }

  if (argv.includes("--compounding-screens")) {
    const chipPath = join(
      APP,
      "public/concepts/chips/05-product/16x9/trusted-by-millions.png",
    );
    const cleanPath = join(CLEAN, "sp-stack-17-compounding.png");
    const markPath = join(APP, "public/brand/superpatch-horizontal-wordmark.png");
    if (!existsSync(chipPath)) throw new Error(`missing ${chipPath}`);
    if (!existsSync(markPath)) throw new Error(`missing ${markPath}`);
    const prompt = buildCompoundingScreenMarkEditPrompt();
    console.log("compounding-screens: trusted-by-millions + clean compounding");
    await withRetries(() =>
      generateImage({
        apiKey,
        prompt,
        refPaths: [chipPath, markPath],
        outPath: chipPath,
        aspect: "16:9",
        styled: true,
        recompose: true,
      }),
    );
    mkdirSync(dirname(cleanPath), { recursive: true });
    writeFileSync(cleanPath, readFileSync(chipPath));
    const retakePath = join(RETAKE_OUT, "16x9", "sp-stack-17-compounding.png");
    mkdirSync(dirname(retakePath), { recursive: true });
    writeFileSync(retakePath, readFileSync(chipPath));
    console.log(`  wrote ${chipPath}`);
    console.log(`  wrote ${cleanPath}`);
    console.log(`  wrote ${retakePath}`);
    return;
  }

  if (retakesMode) {
    // Optional slide-id args narrow which retakes run (e.g. --retakes 02-world).
    const retakes =
      slideIds.length > 0
        ? PLATE_RETAKES.filter((r) => slideIds.includes(r.slideId))
        : PLATE_RETAKES;
    for (const aspect of aspects) {
      for (const retake of retakes) {
        const outPath = join(RETAKE_OUT, aspectDir(aspect), retake.plateFile);
        if (existsSync(outPath) && !force) {
          console.log(`skip (exists): ${aspectDir(aspect)}/${retake.plateFile}`);
          continue;
        }
        const wideRetake = join(RETAKE_OUT, "16x9", retake.plateFile);
        const recompose =
          aspect === "9:16" && existsSync(wideRetake) && Boolean(retake.style);
        const pouchPath = join(APP, "public/concepts/refs/na-sp-freedom-30pk.png");
        const styleRefs = (RETAKE_REFS[retake.plateFile] ?? []).map((f) =>
          join(CLEAN, f),
        );
        const packRefs = [pouchPath];
        const refPaths = recompose
          ? [wideRetake]
          : retake.allowProductPack
            ? [...packRefs, ...styleRefs]
            : styleRefs;
        const prompt = recompose
          ? retake.allowProductPack
            ? buildPortraitRecomposePrompt(retake)
            : `${buildPortraitRecomposePrompt(retake)} Lived-in adult faces — pores, laugh lines, wrinkles where age belongs. Not plastic, not airbrushed.`
          : retake.slideId === "06-brand"
            ? `${buildPlateRetakePrompt(retake)} Documentary campaign-street photograph. Lived-in adult faces — pores, laugh lines, wrinkles where age belongs. Not plastic, not airbrushed. Screens stay blank soft shapes.`
            : buildPlateRetakePrompt(retake);
        console.log(
          `retake: ${aspectDir(aspect)}/${retake.plateFile}${recompose ? " (recompose)" : ""}`,
        );
        await withRetries(() =>
          generateImage({
            apiKey,
            prompt,
            refPaths,
            outPath,
            aspect,
            styled: Boolean(retake.style),
            recompose,
            identityRef: Boolean(retake.allowProductPack),
            packIdentity: Boolean(retake.allowProductPack),
          }),
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

  if (neonCityMode) {
    const retakes =
      slideIds.length > 0
        ? NEON_CITY_PLATE_RETAKES.filter((r) => slideIds.includes(r.slideId))
        : NEON_CITY_PLATE_RETAKES;
    mkdirSync(join(NEON_CITY_OUT, "16x9"), { recursive: true });
    mkdirSync(join(NEON_CITY_OUT, "9x16"), { recursive: true });

    // Promote composition-matched existing neon stills (skip Gemini).
    for (const retake of retakes) {
      const fitRel = NEON_CITY_EXISTING_FITS[retake.plateFile];
      if (!fitRel) continue;
      const src = join(CONCEPTS, fitRel);
      if (!existsSync(src)) {
        throw new Error(`Missing neon fit source: ${fitRel}`);
      }
      for (const aspect of aspects) {
        if (aspect !== "16:9") continue; // fits are landscape; regenerate 9:16 later if needed
        const outPath = join(NEON_CITY_OUT, aspectDir(aspect), retake.plateFile);
        if (existsSync(outPath) && !force) {
          console.log(`skip fit (exists): ${aspectDir(aspect)}/${retake.plateFile}`);
          continue;
        }
        copyFileSync(src, outPath);
        console.log(`fit → neon-city: ${retake.plateFile} ← ${fitRel}`);
        // Update the live presentation plate for composition-matched fits only.
        copyFileSync(src, join(CLEAN, retake.plateFile));
        console.log(`  updated clean/${retake.plateFile}`);
      }
    }

    for (const aspect of aspects) {
      for (const retake of retakes) {
        if (NEON_CITY_EXISTING_FITS[retake.plateFile] && aspect === "16:9") {
          continue; // already promoted
        }
        const outPath = join(NEON_CITY_OUT, aspectDir(aspect), retake.plateFile);
        if (existsSync(outPath) && !force) {
          console.log(`skip (exists): neon-city/${aspectDir(aspect)}/${retake.plateFile}`);
          continue;
        }
        const photoreal = join(CLEAN, retake.plateFile);
        const wideNeon = join(NEON_CITY_OUT, "16x9", retake.plateFile);
        const recompose = aspect === "9:16" && existsSync(wideNeon);
        const composeFromPhotoreal = retake.composeFromPhotoreal !== false;
        let refPaths = [];
        if (recompose) {
          refPaths = [wideNeon];
        } else if (composeFromPhotoreal) {
          if (!existsSync(photoreal)) {
            throw new Error(`Missing photoreal reference: ${photoreal}`);
          }
          refPaths = [photoreal];
        } else if (retake.allowScienceDiagram) {
          // Science void stage — do not style-lock to neon city title plates.
          refPaths = [];
        } else if (retake.skipNeonStyleLock) {
          // Fresh compose without title/world terrace-or-city pulls.
          refPaths = [];
        } else {
          // Fresh neon compose — style-lock to approved neon titles, not alpine photoreal.
          for (const stylePlate of [
            "sp-stack-01-title.png",
            "sp-stack-02-world.png",
            "sp-stack-07-development.png",
          ]) {
            const p = join(NEON_CITY_OUT, "16x9", stylePlate);
            const fallback = join(CLEAN, stylePlate);
            if (existsSync(p)) refPaths.push(p);
            else if (existsSync(fallback)) refPaths.push(fallback);
          }
        }
        for (const rel of retake.extraRefs ?? []) {
          const extra = join(APP, "public", rel.replace(/^\//, ""));
          if (!existsSync(extra)) {
            throw new Error(`Missing neon extraRef: ${extra}`);
          }
          refPaths.push(extra);
        }
        const prompt = recompose
          ? `${buildNeonCityFromPhotorealPrompt(retake)} Vertical portrait recomposition of the attached neon still — fill the frame edge to edge, no letterboxing.`
          : buildNeonCityFromPhotorealPrompt(retake);
        console.log(
          `neon-city: ${aspectDir(aspect)}/${retake.plateFile}${recompose ? " (recompose)" : composeFromPhotoreal ? " (from photoreal)" : " (fresh neon)"}`,
        );
        await withRetries(() =>
          generateImage({
            apiKey,
            prompt,
            refPaths,
            outPath,
            aspect,
            styled: true,
            recompose,
            personIdentity: Boolean(retake.personIdentity),
          }),
        );
        // Keep photoreal clean/ intact for review — only write neon-city outputs here.
        manifest.entries[`neon-city:${aspectDir(aspect)}/${retake.plateFile}`] = {
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

  const knownSlideIds = new Set(CHIP_IMAGE_SPECS.map((spec) => spec.slideId));
  const knownSlugs = new Set(CHIP_IMAGE_SPECS.map((spec) => spec.slug));
  const requestedSlides = slideIds.filter((id) => knownSlideIds.has(id));
  const requestedSlugs = slideIds.filter((id) => knownSlugs.has(id));
  const specs = CHIP_IMAGE_SPECS.filter((spec) => {
    if (all) return true;
    if (requestedSlugs.length > 0 && requestedSlides.length > 0) {
      return (
        requestedSlides.includes(spec.slideId) &&
        requestedSlugs.includes(spec.slug)
      );
    }
    if (requestedSlugs.length > 0) return requestedSlugs.includes(spec.slug);
    if (requestedSlides.length > 0) return requestedSlides.includes(spec.slideId);
    return false;
  });
  if (specs.length === 0) {
    console.error(
      "No chips selected. Pass slide ids (e.g. 01-title), --all, --retakes, or --neon-city.",
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

      // Style-override chips (photoreal scenes) render without references —
      // chained refs force the model to clone the plate's composition.
      // Their 9:16 pass instead recomposes the approved 16:9 still, which
      // avoids the letterboxed-collage failure mode of fresh portrait renders.
      const widePath = join(APP, "public", chipImagePath(spec, "16:9"));
      const recompose =
        Boolean(spec.style) && aspect === "9:16" && existsSync(widePath);
      const refPaths = [];
      if (recompose) {
        refPaths.push(widePath);
      } else if (!spec.style) {
        refPaths.push(join(APP, "public", slide.conceptSrc.replace(/^\//, "")));
        const prev = prevBySlide.get(spec.slideId);
        if (prev && existsSync(prev)) refPaths.push(prev);
      }

      const patchPath = join(APP, "public/concepts/refs/superpatch-freedom.png");
      if (
        (spec.slug === "product-stack" || spec.slug === "proprietary-technology") &&
        !recompose &&
        existsSync(patchPath)
      ) {
        refPaths.push(patchPath);
      }
      const varietyDir = join(APP, "public/concepts/refs/patches");
      if (spec.slug === "many-solutions" && !recompose && existsSync(varietyDir)) {
        for (const name of readdirSync(varietyDir).toSorted()) {
          if (name.endsWith(".png")) refPaths.push(join(varietyDir, name));
        }
      }
      const markPath = join(
        APP,
        "public/brand/superpatch-horizontal-wordmark.png",
      );
      if (
        (spec.slug === "marketing-creates-demand" ||
          spec.slug === "pro-sports" ||
          spec.slug === "trusted-by-millions") &&
        !recompose &&
        existsSync(markPath)
      ) {
        refPaths.push(markPath);
      }
      const pressRowPath = join(APP, "public/concepts/refs/press-row.png");
      if (spec.slug === "global-media" && !recompose && existsSync(pressRowPath)) {
        refPaths.push(pressRowPath);
      }

      const prompt = recompose
        ? buildPortraitRecomposePrompt(spec)
        : spec.slug === "product-stack"
          ? `${buildChipImagePrompt(spec, aspect)} The last attached image is the SuperPatch product still. Match that exact white rounded-square patch with red repeating marks and a clear fingerprint gel on the forearm. Ignore any watermark or black backdrop. Do not invent a beige oval.`
          : spec.slug === "proprietary-technology"
            ? `${buildChipImagePrompt(spec, aspect)} The last attached image is the SuperPatch product still. Place that exact white rounded-square patch with red repeating marks and a clear fingerprint gel inside the locked glass case. Ignore any watermark or black backdrop. Do not invent a beige oval. The vitrine and lock are the hero.`
            : spec.slug === "backed-by-science"
              ? `${buildChipImagePrompt(spec, aspect)} Documentary sports-science photograph. The treadmill runner and the lab-coat clinician are the hero. Monitors stay blank soft shapes.`
              : spec.slug === "many-solutions"
                ? `${buildChipImagePrompt(spec, aspect)} The attached images are official Super Patch variants. Place those exact patches in the tray — mixed colors and marks, several different designs visible at once. Ignore watermarks and black backdrops. Do not redraw them all as one red patch. The mixed assortment on the tray is the hero.`
                : spec.slug === "trusted-by-millions"
                  ? `${buildChipImagePrompt(spec, aspect)} Documentary concert-stadium photograph. A live event with a stage and one speaker — not a sports match, no grass pitch, no goals. The packed stands facing the stage are the hero. The last attached image is the Super Patch mark — place that exact mark large and sharp on the stage LED screens (backdrop, side screen, overhead ribbon) in light or white.`
                : spec.slug === "retail-digital"
                  ? `${buildChipImagePrompt(spec, aspect)} Documentary high-street photograph. The open flagship storefront is the hero — people walking in through the doors. Windows stay blank soft glass. Lived-in adult faces — pores, laugh lines, wrinkles where age belongs. Not plastic, not airbrushed.`
                : spec.slug === "global-media"
                  ? `${buildChipImagePrompt(spec, aspect)} Dusk at the Shibuya scramble in downtown Tokyo — Japanese crossing paint, Japanese street lamps, glass towers. Not New York and not Times Square. The last attached still is the exact press row — CBS, Forbes, NBC, Fortune, Fox, MarketWatch, Medium, Yahoo Finance. Put those marks huge and bold on giant LED billboards that fill the canyon. No extra brand marks. Wet stone, cobalt sky, crimson and amber city glow. One person in the street for scale. Lived-in adult faces — pores, laugh lines, wrinkles where age belongs. Not plastic, not airbrushed.`
                : spec.slug === "pro-sports"
                  ? `${buildChipImagePrompt(spec, aspect)} Packed NFL stadium during a live American football game. The last attached image is the Super Patch mark. Place that exact mark huge and sharp on the scoreboard — the scoreboard is the focus. Packed stands and the play on the field stay soft and blurred. Not a running track. Lived-in adult faces — pores, laugh lines, wrinkles where age belongs. Not plastic, not airbrushed.`
                : spec.slug === "top-creators"
                  ? `${buildChipImagePrompt(spec, aspect)} Documentary live-taping still in a sunlit loft, not a red carpet and not a sidewalk crush. One creator in everyday athleisure facing a camera on a tripod. A dense crowd of fans watches the taping, some phones raised. Blank phone and camera glass. Unrecognizable real faces — pores, laugh lines, wrinkles, a stray blemish. Not a movie star, not CGI, not a beauty campaign, not plastic. Not a concert, not a stadium.`
                : spec.slideId === "06-brand"
                  ? `${buildChipImagePrompt(spec, aspect)} Documentary photograph. Lived-in adult faces — pores, laugh lines, wrinkles where age belongs. Not plastic, not airbrushed. Screens and windows stay blank soft shapes.`
            : spec.slug === "products-create-customers"
            ? `${buildChipImagePrompt(spec, aspect)} Documentary street photograph, not a styled campaign. Real people in varied everyday clothing — do not dress the line in matching coral and cobalt. Do not unify the street into one brand color. The long London high-street queue in front of the flagship store is the hero.`
            : spec.slug === "marketing-creates-demand"
              ? `${buildChipImagePrompt(spec, aspect)} The last attached image is the Super Patch mark. Place that exact mark on one giant screen only. Every other screen is a blank glow.`
              : buildChipImagePrompt(spec, aspect);
      console.log(
        `chip: ${spec.slideId}/${spec.slug} ${aspect} (${refPaths.length} refs${recompose ? ", recompose" : ""})`,
      );
      await withRetries(() =>
        generateImage({
          apiKey,
          prompt,
          refPaths,
          outPath,
          aspect,
          styled: Boolean(spec.style),
          recompose,
          identityRef:
            spec.slug === "marketing-creates-demand" ||
            spec.slug === "proprietary-technology" ||
            spec.slug === "many-solutions" ||
            spec.slug === "global-media" ||
            spec.slug === "pro-sports",
        }),
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
