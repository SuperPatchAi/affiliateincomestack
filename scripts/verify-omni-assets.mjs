#!/usr/bin/env node
/**
 * Verifies Omni experience assets: 30 MP4s + 30 WebP posters, dimensions, codecs.
 * Run: node scripts/verify-omni-assets.mjs
 */
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PLATES = [
  ["01", "title"],
  ["02", "world"],
  ["03", "four-stacks"],
  ["04", "flywheel"],
  ["05", "ecosystem"],
  ["06", "ten-layers"],
  ["07", "retail"],
  ["08", "fast-start"],
  ["09", "team-overrides"],
  ["10", "unlimited-depth"],
  ["11", "vp-override"],
  ["12", "generations"],
  ["13", "executive"],
  ["14", "global-pool"],
  ["15", "closing"],
];

function ffprobe(path) {
  const out = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,duration,codec_name",
      "-of",
      "csv=p=0",
      path,
    ],
    { encoding: "utf8" },
  ).trim();
  const [codec, width, height, duration] = out.split(",");
  return {
    codec,
    width: Number(width),
    height: Number(height),
    duration: Number(duration),
  };
}

const errors = [];

for (const [id, slug] of PLATES) {
  const base = `sp-stack-${id}-${slug}`;
  for (const [aspectDir, w, h] of [
    ["16x9", 1280, 720],
    ["9x16", 720, 1280],
  ]) {
    const mp4 = resolve(root, `public/concepts/omni-chain/${aspectDir}/${base}_omni.mp4`);
    const poster = resolve(
      root,
      `public/concepts/omni-chain/posters/${aspectDir}/${base}.webp`,
    );
    if (!existsSync(mp4)) errors.push(`Missing video: ${mp4}`);
    if (!existsSync(poster)) errors.push(`Missing poster: ${poster}`);
    if (!existsSync(mp4)) continue;
    try {
      const meta = ffprobe(mp4);
      if (meta.codec !== "h264") {
        errors.push(`${mp4}: codec ${meta.codec}, expected h264`);
      }
      if (meta.width !== w || meta.height !== h) {
        errors.push(
          `${mp4}: ${meta.width}x${meta.height}, expected ${w}x${h}`,
        );
      }
      if (!(meta.duration >= 7.5 && meta.duration <= 10.5)) {
        errors.push(`${mp4}: duration ${meta.duration}s outside 7.5–10.5s`);
      }
    } catch (e) {
      errors.push(`${mp4}: ffprobe failed (${e.message})`);
    }
  }
}

if (errors.length) {
  console.error("Omni asset verification failed:\n" + errors.join("\n"));
  process.exit(1);
}

console.log(
  `OK: ${PLATES.length * 2} videos + ${PLATES.length * 2} posters verified`,
);
