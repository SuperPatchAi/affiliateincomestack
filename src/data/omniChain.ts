export type OmniAspect = "16:9" | "9:16";

export type OmniPlate = {
  id: string;
  slug: string;
  plateFile: string;
  accent: string;
  motion: string;
};

export const OMNI_TEXT_BAN =
  "Absolutely no on-screen text, letters, numbers, captions, logos, watermarks, UI chrome, or typography of any kind. Do not form letter-like shapes from grids, light trails, or geometry — including N, И, mirrored N, Z, or any alphabet glyph. Pure cinematic motion graphics only. Soft ambient cinematic audio bed only — no dialogue, no voiceover, no speech.";

export const OMNI_PLATES: OmniPlate[] = [
  {
    id: "01",
    slug: "title",
    plateFile: "sp-stack-01-title.png",
    accent: "neon blue",
    motion:
      "ten luminous slabs stack upward with soft parallax depth; slow cinematic push-in; settle into a stacked resting composition by the end",
  },
  {
    id: "02",
    slug: "the-question",
    plateFile: "sp-stack-02-the-question.png",
    accent: "cool steel blue",
    motion:
      "a single thin income line fractures and dims as void expands around it; settle on the broken single-stream graphic",
  },
  {
    id: "03",
    slug: "four-stacks",
    plateFile: "sp-stack-03-four-stacks.png",
    accent: "multi neon blue green orange violet",
    motion:
      "four monumental pillars assemble from darkness with subtle energy bridging between them; settle as a stable four-pillar composition",
  },
  {
    id: "04",
    slug: "flywheel",
    plateFile: "sp-stack-04-flywheel.png",
    accent: "multi neon",
    motion:
      "a circular flywheel rotates once while energy arcs travel between quadrants; settle loop-ready at a calm mid-rotation pose",
  },
  {
    id: "05",
    slug: "ecosystem",
    plateFile: "sp-stack-05-ecosystem.png",
    accent: "violet",
    motion:
      "a node mesh pulses outward from center as connections brighten; settle as a glowing network",
  },
  {
    id: "06",
    slug: "ten-layers",
    plateFile: "sp-stack-06-ten-layers.png",
    accent: "orange",
    motion:
      "exploded stack layers peel apart then nest back into an ordered tower; settle stacked",
  },
  {
    id: "07",
    slug: "retail",
    plateFile: "sp-stack-07-retail.png",
    accent: "green",
    motion:
      "abstract coin and revenue light particles rise through a clean retail portal; settle",
  },
  {
    id: "08",
    slug: "fast-start",
    plateFile: "sp-stack-08-fast-start.png",
    accent: "orange",
    motion:
      "ascending platforms leap and lock with momentum bursts; settle on the higher platform",
  },
  {
    id: "09",
    slug: "team-overrides",
    plateFile: "sp-stack-09-team-overrides.png",
    accent: "blue",
    motion:
      "a luminous root system grows downward through five tiers as light travels the roots; settle",
  },
  {
    id: "10",
    slug: "unlimited-depth",
    plateFile: "sp-stack-10-unlimited-depth.png",
    accent: "violet",
    motion:
      "depth rings expand past the fifth level into infinite depth; settle",
  },
  {
    id: "11",
    slug: "vp-override",
    plateFile: "sp-stack-11-vp-override.png",
    accent: "blue",
    motion:
      "organizational legs descend while leadership light cascades downward; settle",
  },
  {
    id: "12",
    slug: "generations",
    plateFile: "sp-stack-12-generations.png",
    accent: "green",
    motion: "three concentric generation rings bloom outward; settle",
  },
  {
    id: "13",
    slug: "executive",
    plateFile: "sp-stack-13-executive.png",
    accent: "orange",
    motion:
      "a summit structure rises and dual reward beacons ignite; settle",
  },
  {
    id: "14",
    slug: "global-pool",
    plateFile: "sp-stack-14-global-pool.png",
    accent: "violet",
    motion:
      "earth arcs and a global lattice light continents as a pool glow intensifies; settle",
  },
  {
    id: "15",
    slug: "closing",
    plateFile: "sp-stack-15-closing.png",
    accent: "red and white",
    motion:
      "a horizon opens while the distant glowing horizontal light-stack brightens softly; settle on the landscape with no letter-like shapes formed by lights or trails",
  },
];

function aspectDir(aspect: OmniAspect): "16x9" | "9x16" {
  return aspect === "16:9" ? "16x9" : "9x16";
}

export function plateById(id: string): OmniPlate | undefined {
  return OMNI_PLATES.find((p) => p.id === id);
}

export function omniOutputPath(id: string, aspect: OmniAspect): string {
  const plate = plateById(id);
  if (!plate) throw new Error(`Unknown omni plate id: ${id}`);
  return `public/concepts/omni-chain/${aspectDir(aspect)}/sp-stack-${plate.id}-${plate.slug}_omni.mp4`;
}

export function omniBridgePath(id: string, aspect: OmniAspect): string {
  const plate = plateById(id);
  if (!plate) throw new Error(`Unknown omni plate id: ${id}`);
  return `public/concepts/omni-chain/bridges/${aspectDir(aspect)}/sp-stack-${plate.id}-${plate.slug}_last.png`;
}

export function buildOmniPrompt(plate: OmniPlate): string {
  return [
    "In a single continuous shot with no scene cuts.",
    `<FIRST_FRAME> Animate this premium keynote motion graphic still.`,
    `Dark navy and black background with subtle gradients; ${plate.accent} accent lighting.`,
    "Apple × Nike × McKinsey cinematic presentation aesthetic — large scale, premium, abstract infographic motion.",
    `[0-2s] Assemble and awaken the composition with restrained camera move.`,
    `[2-6s] ${plate.motion}. Keep primary motion in the center sixty percent of the frame; quieter edges for later text overlays.`,
    `[6-8s] Settle back toward the opening composition so the clip loops cleanly.`,
    "Consider micro-detail, timing, and lighting to create a rich but natural premium scene.",
    OMNI_TEXT_BAN,
  ].join(" ");
}

export function promptsPack(): {
  model: string;
  durationSeconds: number;
  ban: string;
  plates: Array<OmniPlate & { prompt: string }>;
} {
  return {
    model: "gemini-omni-flash-preview",
    durationSeconds: 8,
    ban: OMNI_TEXT_BAN,
    plates: OMNI_PLATES.map((p) => ({ ...p, prompt: buildOmniPrompt(p) })),
  };
}
