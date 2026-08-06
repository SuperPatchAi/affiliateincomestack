#!/usr/bin/env node
/**
 * Batch Veo 3.1 image-to-video for Income Stack clean plates.
 *
 * Usage (from apps/superpatch-income-stack):
 *   node scripts/veo-animate-plates.mjs            # missing outputs only
 *   node scripts/veo-animate-plates.mjs --all      # regenerate every plate
 *   node scripts/veo-animate-plates.mjs 02 05 07   # specific stack numbers
 *
 * Requires GOOGLE_API_KEY in repo-root .env.local.
 * Uses Superpatch backend venv python + google-genai.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = resolve(__dirname, "..");
const REPO = resolve(APP, "../..");
const CLEAN = join(APP, "public/concepts/clean");
const OUT_DIR = join(APP, "public/concepts/animated");
const PY =
  "/Users/cbsuperpatch/Desktop/Superpatch_Context/content-studio/superpatch-backend/venv/bin/python";

const PLATES = [
  ["01", "sp-stack-01-title.png", "sp-stack-01-title_animated.mp4"],
  ["02", "sp-stack-02-the-question.png", "sp-stack-02-the-question_animated.mp4"],
  ["03", "sp-stack-03-four-stacks.png", "sp-stack-03-four-stacks_animated.mp4"],
  ["04", "sp-stack-04-flywheel.png", "sp-stack-04-flywheel_animated.mp4"],
  ["05", "sp-stack-05-ecosystem.png", "sp-stack-05-ecosystem_animated.mp4"],
  ["06", "sp-stack-06-ten-layers.png", "sp-stack-06-ten-layers_animated.mp4"],
  ["07", "sp-stack-07-retail.png", "sp-stack-07-retail_animated.mp4"],
  ["08", "sp-stack-08-fast-start.png", "sp-stack-08-fast-start_animated.mp4"],
  ["09", "sp-stack-09-team-overrides.png", "sp-stack-09-team-overrides_animated.mp4"],
  ["10", "sp-stack-10-unlimited-depth.png", "sp-stack-10-unlimited-depth_animated.mp4"],
  ["11", "sp-stack-11-vp-override.png", "sp-stack-11-vp-override_animated.mp4"],
  ["12", "sp-stack-12-generations.png", "sp-stack-12-generations_animated.mp4"],
  ["13", "sp-stack-13-executive.png", "sp-stack-13-executive_animated.mp4"],
  ["14", "sp-stack-14-global-pool.png", "sp-stack-14-global-pool_animated.mp4"],
  ["15", "sp-stack-15-closing.png", "sp-stack-15-closing_animated.mp4"],
];

const PROMPT = "animate this image, keep proportions intact";

function loadEnvLocal() {
  const envPath = join(REPO, ".env.local");
  if (!existsSync(envPath)) throw new Error(`Missing ${envPath}`);
  const vals = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    vals[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return vals;
}

function parseArgs(argv) {
  const forceAll = argv.includes("--all");
  const nums = argv.filter((a) => /^\d{2}$/.test(a));
  return { forceAll, nums };
}

function runPython(img, out, model, apiKey) {
  const code = `
import asyncio, base64, os, sys, time
from pathlib import Path
from google import genai

IMG = Path(${JSON.stringify(img)})
OUT = Path(${JSON.stringify(out)})
MODEL = ${JSON.stringify(model)}
PROMPT = ${JSON.stringify(PROMPT)}
KEY = ${JSON.stringify(apiKey)}

async def main():
    client = genai.Client(api_key=KEY)
    image = genai.types.Image(image_bytes=IMG.read_bytes(), mime_type="image/png")
    config = {
        "duration_seconds": 8,
        "aspect_ratio": "16:9",
        "number_of_videos": 1,
        "resolution": "1080p",
    }
    from google.genai import errors as genai_errors

    print(f"START model={MODEL} out={OUT.name}", flush=True)
    t0 = time.monotonic()
    last_err = None
    for attempt in range(4):
        try:
            op = await client.aio.models.generate_videos(
                model=MODEL, prompt=PROMPT, image=image, config=config,
            )
            print(f"OP {getattr(op, 'name', None)} attempt={attempt+1}", flush=True)
            while not op.done:
                await asyncio.sleep(10)
                for poll_try in range(5):
                    try:
                        op = await client.aio.operations.get(op)
                        break
                    except genai_errors.ServerError as e:
                        wait = 15 * (poll_try + 1)
                        print(f"POLL retry {poll_try+1} after {e.code}: sleep {wait}s", flush=True)
                        await asyncio.sleep(wait)
                    except Exception as e:
                        if "503" in str(e) or "UNAVAILABLE" in str(e):
                            wait = 15 * (poll_try + 1)
                            print(f"POLL retry {poll_try+1}: sleep {wait}s ({e})", flush=True)
                            await asyncio.sleep(wait)
                        else:
                            raise
                else:
                    raise RuntimeError("poll retries exhausted")
                print(f"POLL {time.monotonic()-t0:.0f}s", flush=True)
                if time.monotonic() - t0 > 900:
                    raise TimeoutError("Veo timed out after 900s")
            if getattr(op, "error", None):
                raise RuntimeError(f"Veo error: {op.error}")
            resp = getattr(op, "response", None) or getattr(op, "result", None)
            videos = getattr(resp, "generated_videos", None) or []
            if not videos:
                raise RuntimeError(
                    f"No videos rai={getattr(resp, 'rai_media_filtered_count', None)} "
                    f"{getattr(resp, 'rai_media_filtered_reasons', None)}"
                )
            video_obj = videos[0].video
            raw = getattr(video_obj, "video_bytes", None)
            if raw:
                data = raw if isinstance(raw, bytes) else base64.b64decode(raw)
            else:
                import httpx
                uri = video_obj.uri
                url = f"{uri}&key={KEY}" if "?" in uri else f"{uri}?key={KEY}"
                async with httpx.AsyncClient(timeout=180, follow_redirects=True) as http:
                    r = await http.get(url)
                    r.raise_for_status()
                    data = r.content
            OUT.parent.mkdir(parents=True, exist_ok=True)
            OUT.write_bytes(data)
            print(f"OK bytes={len(data)} elapsed={time.monotonic()-t0:.0f}s", flush=True)
            return
        except Exception as e:
            last_err = e
            msg = str(e)
            retryable = "503" in msg or "UNAVAILABLE" in msg or "429" in msg
            print(f"ATTEMPT {attempt+1} failed: {msg[:200]}", flush=True)
            if not retryable or attempt == 3:
                raise
            wait = 30 * (attempt + 1)
            print(f"Retrying in {wait}s…", flush=True)
            await asyncio.sleep(wait)
    raise last_err

asyncio.run(main())
`;
  return new Promise((resolvePromise, reject) => {
    const child = spawn(PY, ["-"], {
      env: { ...process.env, GOOGLE_API_KEY: apiKey, GEMINI_API_KEY: apiKey },
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
      if (code === 0) resolvePromise(stdout);
      else reject(new Error(stderr || stdout || `python exit ${code}`));
    });
    child.stdin.write(code);
    child.stdin.end();
  });
}

async function main() {
  if (!existsSync(PY)) {
    console.error(`Python venv missing: ${PY}`);
    process.exit(1);
  }
  const env = loadEnvLocal();
  const apiKey = env.GOOGLE_API_KEY || env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_API_KEY missing in .env.local");
    process.exit(1);
  }
  const model =
    env.VEO_FAST_MODEL || env.VEO_MODEL || "veo-3.1-fast-generate-preview";
  const { forceAll, nums } = parseArgs(process.argv.slice(2));
  mkdirSync(OUT_DIR, { recursive: true });

  let jobs = PLATES;
  if (nums.length) {
    jobs = PLATES.filter(([n]) => nums.includes(n));
  } else if (!forceAll) {
    // Default: skip 04 (already native 1080p) and any existing file unless
    // regenerating legacy 720p (01/03) or missing outputs.
    jobs = PLATES.filter(([n, , outName]) => {
      const out = join(OUT_DIR, outName);
      if (n === "04" && existsSync(out)) return false;
      if (!existsSync(out)) return true;
      // Re-do 01/03 when present but we want 1080p upgrade in default batch
      return n === "01" || n === "03";
    });
  }

  console.log(`Model=${model} jobs=${jobs.length}`);
  const results = [];
  for (const [n, png, mp4] of jobs) {
    const img = join(CLEAN, png);
    const out = join(OUT_DIR, mp4);
    if (!existsSync(img)) {
      results.push({ n, ok: false, error: `missing ${img}` });
      continue;
    }
    console.log(`\n=== Stack ${n}: ${png} → ${mp4} ===`);
    try {
      await runPython(img, out, model, apiKey);
      results.push({ n, ok: true, out });
    } catch (e) {
      console.error(`FAIL stack ${n}:`, e.message || e);
      results.push({ n, ok: false, error: String(e.message || e) });
      // brief pause after failures / before next (rate limits)
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  const summaryPath = join(OUT_DIR, "veo-batch-summary.json");
  writeFileSync(summaryPath, JSON.stringify({ model, prompt: PROMPT, results }, null, 2));
  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok);
  console.log(`\nDone: ${ok}/${results.length} ok. Summary: ${summaryPath}`);
  if (fail.length) {
    console.error("Failures:", fail);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
