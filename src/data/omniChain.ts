export type OmniAspect = "16:9" | "9:16";

export type OmniPlate = {
  id: string;
  slug: string;
  plateFile: string;
  accent: string;
  motion: string;
  /** Daylight photograph — prompt for motion only, no neon stack language. */
  photoreal?: boolean;
  /** Harbor HQ rises floor by floor from a foundation start still. */
  construct?: boolean;
  /** Filename under public/concepts/clean-retakes/<aspect>/. */
  startStill?: string;
};

export const OMNI_PHOTOREAL_LOCK =
  "Image-to-video: prompt for motion only. The attached still is the first frame. " +
  "Stay in this one scene for the entire clip. No cuts, no morph, " +
  "no jump to another place, no flashing, no warp, no mid-video scene change. " +
  "Subtle human motion only — small natural gestures, cloth, hair, breath. " +
  "Each person keeps the same face, hair, body, and clothing. No identity change. " +
  "Do not re-describe the setting, lighting, or wardrobe. Refer to people as the subject or they.";

export const OMNI_CONSTRUCT_LOCK =
  "Image-to-video. The first attached still is the first frame — foundation and dock. " +
  "Stay in this one harbor for the entire clip. No cuts, no jump to another place, " +
  "no flashing, no warp. The yacht, water, sky, and camera stay locked. " +
  "Only the headquarters changes: it rises from that foundation, one glass floor " +
  "stacking on the last, until four floors stand complete and match the destination building. " +
  "Refer to people as they.";

export const OMNI_TEXT_BAN =
  "Absolutely no on-screen text, letters, numbers, captions, logos, watermarks, UI chrome, or typography of any kind. Do not form letter-like shapes from grids, light trails, or geometry — including N, И, mirrored N, Z, or any alphabet glyph. Pure cinematic motion graphics only. Soft ambient cinematic audio bed only — no dialogue, no voiceover, no speech.";

export const OMNI_PLATES: OmniPlate[] = [
  {
    id: "01",
    slug: "title",
    plateFile: "sp-stack-01-title.png",
    photoreal: true,
    accent: "late-morning sun on skin and pale stone",
    motion:
      "The subject breathes. Hair and clothes stir in a light breeze. Distant traffic drifts. The camera holds a slow, almost still push-in.",
  },
  {
    id: "02",
    slug: "world",
    plateFile: "sp-stack-02-world.png",
    photoreal: true,
    accent: "late-morning sun on glass and pale stone",
    motion:
      "Light streaks along the avenue keep a slow flow. Window reflections drift. The camera holds a slow, almost still aerial drift.",
  },
  {
    id: "03",
    slug: "four-stacks",
    plateFile: "sp-stack-03-four-stacks.png",
    photoreal: true,
    construct: true,
    startStill: "sp-stack-03-four-stacks-foundation.png",
    accent: "late-morning sun on glass, teak, and harbor water",
    motion:
      "The headquarters rises from the ground up. The first floor locks, then the next stacks on it, then the next, then the last — four floors, each one building on the one before. Water moves against the hull. People stay small.",
  },
  {
    id: "04",
    slug: "flywheel",
    plateFile: "sp-stack-04-flywheel.png",
    photoreal: true,
    accent: "coral, cobalt, sunflower yellow, and living green in late-morning plaza light",
    motion:
      "The castell is frozen as a rigid structure. Nobody climbs. Nobody is added or removed. Do not turn a woman into a man or a man into a woman. Do not change anyone's age, face, hair, or clothing. Do not merge two people into one or split one person into two. Each person stays in the same place in the tower and pinya and keeps the same face from first frame to last. Only micro motion: a breath, a grip tighten, a tiny sway of the whole tower together. The camera holds a slow, almost still drift.",
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

export function omniPlateFirstFramePath(
  plate: OmniPlate,
  aspect: OmniAspect,
): string {
  if (plate.construct && plate.startStill) {
    return `public/concepts/clean-retakes/${aspectDir(aspect)}/${plate.startStill}`;
  }
  return `public/concepts/clean/${plate.plateFile}`;
}

export function buildOmniPrompt(plate: OmniPlate): string {
  if (plate.construct) {
    return [
      "In a single continuous shot with no scene cuts. <FIRST_FRAME> Begin on the attached foundation still.",
      OMNI_CONSTRUCT_LOCK,
      plate.motion,
      "If a destination still is attached, the last frame matches that completed headquarters.",
      OMNI_TEXT_BAN,
    ].join(" ");
  }

  if (plate.photoreal) {
    return [
      "In a single continuous shot with no scene cuts. <FIRST_FRAME> Animate only the attached still.",
      OMNI_PHOTOREAL_LOCK,
      `Slow, subtle motion: ${plate.motion}`,
      "Slow dolly or gentle handheld drift.",
      "Hold the same composition through the last frame. No settle warp and no morph at the end.",
      OMNI_TEXT_BAN,
    ].join(" ");
  }

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
