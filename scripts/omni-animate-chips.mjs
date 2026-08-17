#!/usr/bin/env node
/**
 * Batch Gemini Omni Flash image-to-video for the chip backdrops.
 *
 * Each chip still becomes an ~8s clip: awaken -> the chip's own motion ->
 * a forward light-warp that fast-forwards into the next chip (or a clean
 * loop settle on the last chip of a slide). The last frame of each clip is
 * extracted as a bridge reference so palette and lighting stay continuous.
 *
 * Usage (from the app root):
 *   node scripts/omni-animate-chips.mjs 01-title                 # one slide, 16:9
 *   node scripts/omni-animate-chips.mjs 01-title --aspect 9:16   # mobile
 *   node scripts/omni-animate-chips.mjs --all --aspect both      # everything
 *   node scripts/omni-animate-chips.mjs 01-title --force         # regenerate
 *
 * Requires GEMINI_API_KEY or GOOGLE_API_KEY in repo-root .env.local.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = resolve(__dirname, "..");
const REPO = resolve(APP, "../..");
const CHIPS = join(APP, "public/concepts/chips");
const BRIDGES = join(CHIPS, "bridges");
const MANIFEST_PATH = join(CHIPS, "omni-manifest.json");
const OPENMONTAGE = join(REPO, "skills/community/openmontage");
const PY =
  process.env.OMNI_PYTHON ||
  "/Users/cbsuperpatch/Desktop/Superpatch_Context/content-studio/superpatch-backend/venv/bin/python";

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
    return await server.ssrLoadModule("/src/data/chipImagery.ts");
  } finally {
    await server.close();
  }
}

function aspectDir(aspect) {
  return aspect === "16:9" ? "16x9" : "9x16";
}

function extractLastFrame(videoPath, bridgePath) {
  mkdirSync(dirname(bridgePath), { recursive: true });
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-sseof", "-0.1", "-i", videoPath, "-frames:v", "1", bridgePath],
    { encoding: "utf8" },
  );
  if (r.status !== 0) {
    throw new Error(`ffmpeg last-frame failed: ${r.stderr?.slice(0, 400)}`);
  }
}

function runOmni({ apiKey, stillPath, prompt, aspect, outputPath, bridgeRef }) {
  const code = `
import json, os, sys
from pathlib import Path
sys.path.insert(0, ${JSON.stringify(OPENMONTAGE)})
os.environ["GEMINI_API_KEY"] = ${JSON.stringify(apiKey)}
os.environ["GOOGLE_API_KEY"] = ${JSON.stringify(apiKey)}
from tools.video.gemini_omni_video import GeminiOmniVideo

tool = GeminiOmniVideo()
refs = [${JSON.stringify(stillPath)}]
prompt = ${JSON.stringify(prompt)}
bridge = ${JSON.stringify(bridgeRef || "")}
if bridge:
    refs.append(bridge)
    # refs[0]=chip still (<FIRST_FRAME>), refs[1]=prior last frame (<IMAGE_REF_1>)
    prompt = prompt + " Match the palette and lighting mood of <IMAGE_REF_1> only. Do not continue the previous camera move; this is a new scroll beat."

result = tool.execute({
    "prompt": prompt,
    "operation": "image_to_video",
    "aspect_ratio": ${JSON.stringify(aspect)},
    "duration": "8",
    "reference_image_paths": refs,
    "output_path": ${JSON.stringify(outputPath)},
    "store": True,
})
print(json.dumps({
    "success": result.success,
    "error": result.error,
    "data": result.data,
    "cost_usd": result.cost_usd,
    "duration_seconds": result.duration_seconds,
}))
if not result.success:
    sys.exit(1)
`;
  return new Promise((resolvePromise, reject) => {
    const child = spawn(PY, ["-"], {
      env: { ...process.env, GEMINI_API_KEY: apiKey, GOOGLE_API_KEY: apiKey },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      const s = d.toString();
      stdout += s;
      process.stdout.write(s);
    });
    child.stderr.on("data", (d) => {
      const s = d.toString();
      stderr += s;
      process.stderr.write(s);
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || stdout || `python exit ${code}`));
        return;
      }
      const lines = stdout.trim().split("\n");
      const last = lines[lines.length - 1];
      try {
        resolvePromise(JSON.parse(last));
      } catch {
        reject(new Error(`Bad tool JSON: ${last?.slice(0, 400)}`));
      }
    });
    child.stdin.write(code);
    child.stdin.end();
  });
}

async function main() {
  if (!existsSync(PY)) {
    console.error(`Python missing: ${PY}`);
    process.exit(1);
  }
  const env = loadEnvLocal();
  const apiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY / GOOGLE_API_KEY missing in .env.local");
    process.exit(1);
  }

  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
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

  const imagery = await loadSpecs();
  const {
    CHIP_IMAGE_SPECS,
    buildChipMotionPrompt,
    chipImagePath,
    chipVideoPath,
  } = imagery;

  const specs = CHIP_IMAGE_SPECS.filter(
    (spec) => all || slideIds.includes(spec.slideId),
  );
  if (specs.length === 0) {
    console.error("No chips selected. Pass slide ids (e.g. 01-title) or --all.");
    process.exit(1);
  }

  const results = [];
  for (const aspect of aspects) {
    let prevBridge = null;
    let prevSlide = null;
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      // The warp exit targets the next chip in the same slide's sequence.
      const next =
        i + 1 < specs.length && specs[i + 1].slideId === spec.slideId
          ? specs[i + 1]
          : null;
      if (spec.slideId !== prevSlide) {
        prevBridge = null; // new slide, new sequence — fresh palette chain
        prevSlide = spec.slideId;
      }

      const stillRel = chipImagePath(spec, aspect);
      const stillPath = join(APP, "public", stillRel);
      const outPath = join(APP, "public", chipVideoPath(spec, aspect).slice(1));
      const bridgePath = join(
        BRIDGES,
        aspectDir(aspect),
        `${spec.slideId}-${spec.slug}_last.png`,
      );

      if (!existsSync(stillPath)) {
        console.error(`missing still: ${stillRel} — generate images first`);
        results.push({ key: `${aspect} ${spec.slideId}/${spec.slug}`, ok: false, error: "missing still" });
        continue;
      }
      if (existsSync(outPath) && !force) {
        console.log(`SKIP ${aspect} ${spec.slideId}/${spec.slug} (exists)`);
        if (!existsSync(bridgePath)) {
          try {
            extractLastFrame(outPath, bridgePath);
          } catch {}
        }
        if (existsSync(bridgePath)) prevBridge = bridgePath;
        results.push({ key: `${aspect} ${spec.slideId}/${spec.slug}`, ok: true, skipped: true });
        continue;
      }

      const prompt = buildChipMotionPrompt(spec, next);
      console.log(`\n=== Omni chip ${aspect} ${spec.slideId}/${spec.slug} ===`);
      try {
        const result = await runOmni({
          apiKey,
          stillPath,
          prompt,
          aspect,
          outputPath: outPath,
          bridgeRef: prevBridge,
        });
        extractLastFrame(outPath, bridgePath);
        prevBridge = bridgePath;
        results.push({
          key: `${aspect} ${spec.slideId}/${spec.slug}`,
          ok: true,
          out: outPath,
          cost_usd: result.cost_usd,
        });
        console.log(`OK ${spec.slideId}/${spec.slug}`);
      } catch (e) {
        console.error(`FAIL ${spec.slideId}/${spec.slug}: ${e.message?.slice(0, 300)}`);
        results.push({
          key: `${aspect} ${spec.slideId}/${spec.slug}`,
          ok: false,
          error: String(e.message || e),
        });
      }
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    aspects,
    results,
    okCount: results.filter((r) => r.ok).length,
    failCount: results.filter((r) => !r.ok).length,
    cost_usd_sum: results.reduce((s, r) => s + (r.cost_usd || 0), 0),
  };
  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(
    `\nDone ok=${manifest.okCount} fail=${manifest.failCount} cost~$${manifest.cost_usd_sum.toFixed(2)}`,
  );
  if (manifest.failCount) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
