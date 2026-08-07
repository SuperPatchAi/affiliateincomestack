#!/usr/bin/env node
/**
 * Batch Gemini Omni Flash image-to-video for Income Stack clean plates.
 *
 * Usage (from apps/superpatch-income-stack):
 *   node scripts/omni-animate-plates.mjs --aspect 16:9
 *   node scripts/omni-animate-plates.mjs --aspect 9:16
 *   node scripts/omni-animate-plates.mjs --aspect both
 *   node scripts/omni-animate-plates.mjs --aspect 16:9 01 02
 *   node scripts/omni-animate-plates.mjs --all --aspect both
 *
 * Requires GEMINI_API_KEY or GOOGLE_API_KEY in repo-root .env.local.
 * Does not overwrite public/concepts/animated Veo heroes.
 */
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = resolve(__dirname, "..");
const REPO = resolve(APP, "../..");
const CLEAN = join(APP, "public/concepts/clean");
const OUT_ROOT = join(APP, "public/concepts/omni-chain");
const PROMPTS_PATH = join(OUT_ROOT, "prompts.json");
const MANIFEST_PATH = join(OUT_ROOT, "manifest.json");
const OPENMONTAGE = join(
  REPO,
  "skills/community/openmontage",
);
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

function parseArgs(argv) {
  const forceAll = argv.includes("--all");
  let aspect = "16:9";
  const aspectIdx = argv.indexOf("--aspect");
  if (aspectIdx !== -1) aspect = argv[aspectIdx + 1] || aspect;
  const nums = argv.filter((a) => /^\d{2}$/.test(a));
  return { forceAll, aspect, nums };
}

function aspectDir(aspect) {
  return aspect === "16:9" ? "16x9" : "9x16";
}

function extractLastFrame(videoPath, bridgePath) {
  mkdirSync(dirname(bridgePath), { recursive: true });
  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-sseof",
      "-0.1",
      "-i",
      videoPath,
      "-frames:v",
      "1",
      bridgePath,
    ],
    { encoding: "utf8" },
  );
  if (r.status !== 0) {
    throw new Error(`ffmpeg last-frame failed: ${r.stderr?.slice(0, 400)}`);
  }
}

function runOmni({ apiKey, platePath, prompt, aspect, outputPath, bridgeRef }) {
  const code = `
import json, os, sys
from pathlib import Path
sys.path.insert(0, ${JSON.stringify(OPENMONTAGE)})
os.environ["GEMINI_API_KEY"] = ${JSON.stringify(apiKey)}
os.environ["GOOGLE_API_KEY"] = ${JSON.stringify(apiKey)}
from tools.video.gemini_omni_video import GeminiOmniVideo

tool = GeminiOmniVideo()
refs = [${JSON.stringify(platePath)}]
prompt = ${JSON.stringify(prompt)}
bridge = ${JSON.stringify(bridgeRef || "")}
if bridge:
    refs.append(bridge)
    # refs[0]=plate (<FIRST_FRAME>), refs[1]=prior last frame (<IMAGE_REF_1>)
    prompt = prompt + " Match the palette and lighting mood of <IMAGE_REF_1> only. Do not continue the previous camera move; this is a new scroll-stack layer."

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

async function generateAspect(aspect, plates, apiKey, { forceAll, nums }) {
  const dir = join(OUT_ROOT, aspectDir(aspect));
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(OUT_ROOT, "bridges", aspectDir(aspect)), { recursive: true });

  let jobs = plates;
  if (nums.length) jobs = plates.filter((p) => nums.includes(p.id));

  const results = [];
  // Seed palette bridge from the previous plate on disk when starting mid-chain.
  let prevBridge = null;
  if (jobs.length) {
    const firstIdx = plates.findIndex((p) => p.id === jobs[0].id);
    if (firstIdx > 0) {
      const prior = plates[firstIdx - 1];
      const priorBridge = join(
        OUT_ROOT,
        "bridges",
        aspectDir(aspect),
        `sp-stack-${prior.id}-${prior.slug}_last.png`,
      );
      if (existsSync(priorBridge)) prevBridge = priorBridge;
    }
  }

  for (const plate of jobs) {
    const outName = `sp-stack-${plate.id}-${plate.slug}_omni.mp4`;
    const outPath = join(dir, outName);
    const bridgePath = join(
      OUT_ROOT,
      "bridges",
      aspectDir(aspect),
      `sp-stack-${plate.id}-${plate.slug}_last.png`,
    );
    const platePath = join(CLEAN, plate.plateFile);

    if (!existsSync(platePath)) {
      results.push({ id: plate.id, aspect, ok: false, error: `missing ${platePath}` });
      continue;
    }
    if (!forceAll && existsSync(outPath)) {
      console.log(`SKIP ${aspect} ${plate.id} (exists)`);
      if (existsSync(bridgePath)) prevBridge = bridgePath;
      else {
        try {
          extractLastFrame(outPath, bridgePath);
          prevBridge = bridgePath;
        } catch {
          prevBridge = null;
        }
      }
      results.push({ id: plate.id, aspect, ok: true, skipped: true, out: outPath });
      continue;
    }

    console.log(`\n=== Omni ${aspect} slide ${plate.id} ${plate.slug} ===`);
    try {
      const result = await runOmni({
        apiKey,
        platePath,
        prompt: plate.prompt,
        aspect,
        outputPath: outPath,
        bridgeRef: prevBridge,
      });
      extractLastFrame(outPath, bridgePath);
      prevBridge = bridgePath;
      results.push({
        id: plate.id,
        aspect,
        ok: true,
        out: outPath,
        bridge: bridgePath,
        interaction_id: result.data?.interaction_id,
        cost_usd: result.cost_usd,
        duration_seconds: result.duration_seconds,
      });
      console.log(`OK ${outName}`);
    } catch (e) {
      console.error(`FAIL ${plate.id}: ${e.message?.slice(0, 300)}`);
      results.push({ id: plate.id, aspect, ok: false, error: String(e.message || e) });
      // Keep previous bridge so later slides can still share world palette
    }
  }
  return results;
}

async function main() {
  if (!existsSync(PY)) {
    console.error(`Python missing: ${PY}`);
    process.exit(1);
  }
  if (!existsSync(PROMPTS_PATH)) {
    console.error(`Missing ${PROMPTS_PATH} — run tests / export prompts first`);
    process.exit(1);
  }
  const env = loadEnvLocal();
  const apiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY / GOOGLE_API_KEY missing in .env.local");
    process.exit(1);
  }

  const { forceAll, aspect, nums } = parseArgs(process.argv.slice(2));
  const pack = JSON.parse(readFileSync(PROMPTS_PATH, "utf8"));
  const aspects =
    aspect === "both" ? ["16:9", "9:16"] : aspect === "9:16" ? ["9:16"] : ["16:9"];

  mkdirSync(OUT_ROOT, { recursive: true });
  console.log(
    `model=${pack.model} aspects=${aspects.join(",")} plates=${pack.plates.length} forceAll=${forceAll}`,
  );

  const allResults = [];
  for (const a of aspects) {
    const chunk = await generateAspect(a, pack.plates, apiKey, { forceAll, nums });
    allResults.push(...chunk);
  }

  const manifest = {
    model: pack.model,
    generatedAt: new Date().toISOString(),
    aspects,
    results: allResults,
    okCount: allResults.filter((r) => r.ok).length,
    failCount: allResults.filter((r) => !r.ok).length,
    cost_usd_sum: allResults.reduce((s, r) => s + (r.cost_usd || 0), 0),
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(
    `\nDone ok=${manifest.okCount} fail=${manifest.failCount} cost~$${manifest.cost_usd_sum.toFixed(2)}`,
  );
  console.log(`manifest: ${MANIFEST_PATH}`);
  if (manifest.failCount) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
