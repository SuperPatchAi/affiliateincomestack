import { OMNI_TEXT_BAN } from "./omniChain";

/**
 * Per-chip background imagery for the scroll-driven chip sequence.
 *
 * Every chip gets a text-free "Tron" still that reads as a deeper camera beat
 * inside its slide's scene. Images are generated with Kling Image Omni using
 * the slide's clean plate (plus the previous chip image) as style references,
 * then animated later with Gemini Omni Flash — so subjects stay centered and
 * the palette never drifts from the canonical plates.
 */

export type ChipImageSpec = {
  slideId: string;
  chipIndex: number;
  /** Filename slug under public/concepts/chips/<slideId>/. */
  slug: string;
  /** Scene accent wording used inside the prompt. */
  accent: string;
  /** Visual metaphor for this chip — objects only, never glyphs. */
  subject: string;
  /** Motion note reused when the still is animated with Omni. */
  motion: string;
};

export type PlateRetakeSpec = {
  /** File under public/concepts/clean/ that breaks the Tron arc today. */
  plateFile: string;
  slideId: string;
  accent: string;
  subject: string;
  motion: string;
};

/** Canonical deck style — matches the fifteen on-style clean plates. */
export const CHIP_STYLE_ANCHOR =
  "Premium keynote motion-graphic still in a Tron-like aesthetic: pitch-black void, " +
  "luminous edge-lit glass structures, holographic wireframe light-figures, thin neon " +
  "light trails, and a dark reflective floor mirroring every glow. Apple x Nike x " +
  "McKinsey cinematic presentation style — large scale, abstract, restrained. " +
  "Keep the hero subject in the center of frame with quiet, dark edges reserved for " +
  "later interface overlays. All surfaces stay pure and unmarked: no HUD readouts, " +
  "no data panels, no dashboards, no tiny glyph-like clusters, no interface markings " +
  "or symbol-like details anywhere in the scene.";

export function buildChipImagePrompt(spec: ChipImageSpec): string {
  return [
    CHIP_STYLE_ANCHOR,
    `Accent lighting: ${spec.accent}.`,
    spec.subject,
    "Match the palette, lighting mood, and floor reflections of the reference images exactly.",
    OMNI_TEXT_BAN,
  ].join(" ");
}

export function buildPlateRetakePrompt(spec: PlateRetakeSpec): string {
  return [
    CHIP_STYLE_ANCHOR,
    `Accent lighting: ${spec.accent}.`,
    spec.subject,
    "Match the palette, lighting mood, and floor reflections of the reference images exactly.",
    OMNI_TEXT_BAN,
  ].join(" ");
}

export type ChipAspect = "16:9" | "9:16";

export function chipAspectDir(aspect: ChipAspect): string {
  return aspect === "16:9" ? "16x9" : "9x16";
}

export function chipImagePath(
  spec: ChipImageSpec,
  aspect: ChipAspect = "16:9",
): string {
  return `/concepts/chips/${spec.slideId}/${chipAspectDir(aspect)}/${spec.slug}.png`;
}

export function chipVideoPath(
  spec: ChipImageSpec,
  aspect: ChipAspect = "16:9",
): string {
  return chipImagePath(spec, aspect).replace(/\.png$/, "_omni.mp4");
}

/**
 * Slides whose per-chip stills + omni clips have been generated (both aspects)
 * and live under public/concepts/chips/<slideId>/. Add ids here as batches land.
 */
export const CHIP_MEDIA_READY_SLIDES: readonly string[] = ["01-title"];

export type ChipMediaEntry = {
  slug: string;
  /** Omni warp clip for this chip beat. */
  video: string;
  /** Text-free still, used as the video poster / reduced-motion fallback. */
  poster: string;
};

/** Per-chip backdrop media for a slide's scroll sequence, in chip order. */
export function chipMediaForSlide(
  slideId: string,
  aspect: "landscape" | "portrait",
): ChipMediaEntry[] {
  if (!CHIP_MEDIA_READY_SLIDES.includes(slideId)) return [];
  const chipAspect: ChipAspect = aspect === "landscape" ? "16:9" : "9:16";
  return CHIP_IMAGE_SPECS.filter((spec) => spec.slideId === slideId).map(
    (spec) => ({
      slug: spec.slug,
      video: chipVideoPath(spec, chipAspect),
      poster: chipImagePath(spec, chipAspect),
    }),
  );
}

/**
 * Omni motion prompt for a chip still. The clip awakens, performs the chip's
 * own motion, then either accelerates into a light-warp that hands off to the
 * next chip (scroll fast-forward) or settles back for a clean loop.
 */
export function buildChipMotionPrompt(
  spec: ChipImageSpec,
  next: ChipImageSpec | null,
): string {
  const exit = next
    ? `[6-8s] Accelerate everything into a forward warp of streaking light — ` +
      `the whole scene rushes past the camera as if fast-forwarding to the next moment, ` +
      `light trails shifting toward ${next.accent} as the frame fills with motion blur.`
    : `[6-8s] Ease every element back toward the opening composition so the clip loops cleanly, ` +
      `letting the scene settle to rest.`;
  return [
    "In a single continuous shot with no scene cuts.",
    "<FIRST_FRAME> Animate this premium keynote motion graphic still.",
    `Dark void with ${spec.accent} accent lighting on a dark reflective floor.`,
    "Apple x Nike x McKinsey cinematic presentation aesthetic — large scale, premium, abstract motion.",
    "[0-2s] Awaken the composition with a restrained camera drift.",
    `[2-6s] ${spec.motion} Keep primary motion in the center sixty percent of the frame; quieter edges for later interface overlays.`,
    exit,
    OMNI_TEXT_BAN,
  ].join(" ");
}

export const CHIP_IMAGE_SPECS: ChipImageSpec[] = [
  // 01-title — Health / Freedom / Impact (blue)
  {
    slideId: "01-title",
    chipIndex: 0,
    slug: "better-health",
    accent: "electric blue with a soft cyan aura",
    subject:
      "A single luminous glass wellness patch floats above the reflective floor, radiating slow concentric rings of healing light that ripple outward across the dark mirror surface.",
    motion:
      "The patch bobs gently while rings of light pulse outward across the floor.",
  },
  {
    slideId: "01-title",
    chipIndex: 1,
    slug: "greater-freedom",
    accent: "electric blue",
    subject:
      "Ten thin streams of light rise from a single point on the reflective floor and arc outward like a fountain opening, each stream a slightly different cool hue.",
    motion:
      "Streams rise and fan outward, particles drifting off their crests.",
  },
  {
    slideId: "01-title",
    chipIndex: 2,
    slug: "bigger-impact",
    accent: "electric blue",
    subject:
      "A wave of light expands across the dark reflective floor toward a distant horizon lined with countless tiny glowing wireframe figures, each igniting as the wave reaches them.",
    motion:
      "The wave sweeps outward and the horizon figures ignite in sequence.",
  },

  // 02-world — how earning changed (cool)
  {
    slideId: "02-world",
    chipIndex: 0,
    slug: "traditional-jobs",
    accent: "dim steel blue",
    subject:
      "A single dim glass column stands locked inside a rigid lattice cage of faint light lines, evenly gridded like an endless office, cold and motionless.",
    motion: "The cage lines hum faintly while the column stays fixed.",
  },
  {
    slideId: "02-world",
    chipIndex: 1,
    slug: "gig-economy",
    accent: "cool cyan",
    subject:
      "Dozens of small glass shards drift loosely through the void, each glowing on its own but unconnected, scattering soft reflections across the dark floor.",
    motion: "Shards drift and slowly rotate, never touching.",
  },
  {
    slideId: "02-world",
    chipIndex: 2,
    slug: "creator-economy",
    accent: "cool cyan and violet",
    subject:
      "One glowing wireframe figure stands at center projecting thin beams of light outward to a constellation of small floating glass panes that brighten as the beams arrive.",
    motion: "Beams sweep outward and panes flare one by one.",
  },
  {
    slideId: "02-world",
    chipIndex: 3,
    slug: "social-commerce",
    accent: "cool cyan",
    subject:
      "A flowing ribbon of glowing glass panes streams between wireframe figures, light passing hand to hand along the ribbon like momentum moving through a feed.",
    motion: "The ribbon flows continuously, glow passing pane to pane.",
  },

  // 03-four-stacks — one pillar per chip (multi)
  {
    slideId: "03-four-stacks",
    chipIndex: 0,
    slug: "product-stack",
    accent: "emerald green",
    subject:
      "Close on a tall emerald glass pillar with a luminous wellness patch embedded at its heart, energy veins branching from the patch through the glass.",
    motion: "Energy veins pulse outward from the embedded patch.",
  },
  {
    slideId: "03-four-stacks",
    chipIndex: 1,
    slug: "brand-marketing",
    accent: "electric blue",
    subject:
      "Close on a tall blue glass pillar broadcasting expanding rings of light from its crown into the darkness, like a beacon transmitting.",
    motion: "Broadcast rings expand and fade in steady rhythm.",
  },
  {
    slideId: "03-four-stacks",
    chipIndex: 2,
    slug: "income-stack",
    accent: "warm amber orange",
    subject:
      "Close on a tall amber glass pillar filled with thin horizontal light strata that rise slowly inside it, stacking brightness toward the top.",
    motion: "Inner strata climb and stack, the crown brightening.",
  },
  {
    slideId: "03-four-stacks",
    chipIndex: 3,
    slug: "personal-development",
    accent: "deep violet",
    subject:
      "Close on a tall violet glass pillar with a wireframe figure ascending a spiral of light steps inside it, glow trailing behind each step.",
    motion: "The figure climbs the inner spiral, steps igniting underfoot.",
  },

  // 04-flywheel — one arc per chip (multi)
  {
    slideId: "04-flywheel",
    chipIndex: 0,
    slug: "products-create-customers",
    accent: "emerald green",
    subject:
      "A glowing green ring arc sheds drifting particles that condense into small radiant orbs gathering on the reflective floor beneath it.",
    motion: "Particles fall from the arc and coalesce into orbs.",
  },
  {
    slideId: "04-flywheel",
    chipIndex: 1,
    slug: "marketing-creates-demand",
    accent: "electric blue",
    subject:
      "A glowing blue ring arc emits long rays of light that sweep across the darkness like searchlights, drawing faint glass panes toward it.",
    motion: "Rays sweep and panes drift inward toward the arc.",
  },
  {
    slideId: "04-flywheel",
    chipIndex: 2,
    slug: "income-creates-opportunity",
    accent: "warm amber orange",
    subject:
      "A glowing amber ring arc pours a thin waterfall of light into a rising pool of luminescence on the reflective floor.",
    motion: "Light pours steadily and the pool level climbs.",
  },
  {
    slideId: "04-flywheel",
    chipIndex: 3,
    slug: "development-creates-leaders",
    accent: "deep violet",
    subject:
      "A glowing violet ring arc lifts a wireframe figure upward on a column of light, the figure brightening as it rises.",
    motion: "The figure rises smoothly, glow intensifying.",
  },

  // 05-product — the product stack (green)
  {
    slideId: "05-product",
    chipIndex: 0,
    slug: "proprietary-technology",
    accent: "emerald green",
    subject:
      "Extreme macro of a translucent glass patch surface: a precise hexagonal ridge micro-texture glowing from within, ridges catching emerald light.",
    motion: "Light travels across the ridge lattice in slow waves.",
  },
  {
    slideId: "05-product",
    chipIndex: 1,
    slug: "backed-by-science",
    accent: "emerald green",
    subject:
      "A neon molecular lattice and a smooth flowing waveform pass through a floating glass prism, refracting into ordered strands of light.",
    motion: "The waveform flows through the prism, strands refracting.",
  },
  {
    slideId: "05-product",
    chipIndex: 2,
    slug: "many-solutions",
    accent: "emerald green with prismatic accents",
    subject:
      "A fanned arc of edge-lit glass patches floats above the reflective floor, each patch rimmed in a different accent hue like a hand of glowing cards.",
    motion: "The fan spreads slowly, each patch glinting in turn.",
  },
  {
    slideId: "05-product",
    chipIndex: 3,
    slug: "trusted-by-millions",
    accent: "emerald green",
    subject:
      "A vast field of tiny glowing wireframe figures stretches to the dark horizon, their collective glow forming a soft aurora above the reflective floor.",
    motion: "Waves of brightness roll gently across the field.",
  },

  // 06-brand — the brand engine (blue)
  {
    slideId: "06-brand",
    chipIndex: 0,
    slug: "global-media",
    accent: "electric blue",
    subject:
      "A tall glass monolith projects beams of light onto a ring of large floating blank glass panes that glow like screens catching a broadcast.",
    motion: "Beams sweep pane to pane, each flaring as it is lit.",
  },
  {
    slideId: "06-brand",
    chipIndex: 1,
    slug: "top-creators",
    accent: "electric blue",
    subject:
      "A single radiant wireframe figure stands on a glass plinth while hundreds of small light nodes orbit and stream toward it like an audience gathering.",
    motion: "Nodes spiral inward, the figure brightening.",
  },
  {
    slideId: "06-brand",
    chipIndex: 2,
    slug: "retail-digital",
    accent: "electric blue",
    subject:
      "Twin glass archways stand side by side — one solid and grounded, one holographic and translucent — joined by a flowing bridge of light particles.",
    motion: "Particles flow across the bridge between the arches.",
  },
  {
    slideId: "06-brand",
    chipIndex: 3,
    slug: "healthcare-professionals",
    accent: "electric blue with white highlights",
    subject:
      "A double helix ribbon of light winds around a clear glass column, clinical and precise, casting orderly reflections on the dark floor.",
    motion: "The helix rotates slowly around the column.",
  },
  {
    slideId: "06-brand",
    chipIndex: 4,
    slug: "pro-sports",
    accent: "electric blue",
    subject:
      "A sprinting wireframe athlete crosses the frame inside a vast stadium ring of light, long trails streaming from its limbs.",
    motion: "The athlete strides in place as light trails whip past.",
  },

  // 07-development — personal development (violet)
  {
    slideId: "07-development",
    chipIndex: 0,
    slug: "leadership-development",
    accent: "deep violet",
    subject:
      "One bright wireframe figure stands atop a glass step reaching down, passing a sphere of light to dimmer figures below who begin to glow.",
    motion: "The sphere passes downward and each figure ignites.",
  },
  {
    slideId: "07-development",
    chipIndex: 1,
    slug: "sales-mastery",
    accent: "deep violet",
    subject:
      "Two wireframe figures face each other across a thin bridge of light, exchanging a glowing orb that brightens mid-handoff.",
    motion: "The orb travels across the bridge and back.",
  },
  {
    slideId: "07-development",
    chipIndex: 2,
    slug: "communication-skills",
    accent: "deep violet",
    subject:
      "Concentric rings of soft light emanate from a speaking wireframe figure, each ring rippling the reflections on the dark floor as it expands.",
    motion: "Rings emanate steadily, floor reflections rippling.",
  },
  {
    slideId: "07-development",
    chipIndex: 3,
    slug: "financial-education",
    accent: "deep violet",
    subject:
      "Edge-lit glass blocks assemble themselves into an ascending staircase of light, each block clicking into place brighter than the last.",
    motion: "Blocks fly in and assemble, the staircase rising.",
  },
  {
    slideId: "07-development",
    chipIndex: 4,
    slug: "mindset-growth",
    accent: "deep violet",
    subject:
      "A wireframe head in profile holds a rising constellation inside it, stars connecting one by one into a radiant inner lattice.",
    motion: "Stars connect in sequence, the lattice brightening.",
  },
  {
    slideId: "07-development",
    chipIndex: 5,
    slug: "community-support",
    accent: "deep violet",
    subject:
      "A circle of wireframe figures stands joined by one continuous ring of light flowing through all of them, no beginning and no end.",
    motion: "The ring's glow circulates through the circle.",
  },

  // 08-ten-layers — three tiers of the stack (orange)
  {
    slideId: "08-ten-layers",
    chipIndex: 0,
    slug: "foundation",
    accent: "warm amber orange",
    subject:
      "Low camera angle on the bottom three glass layers of a stacked tower, glowing warm and solid, energy roots spreading into the reflective floor.",
    motion: "Roots pulse and the base layers glow steadily.",
  },
  {
    slideId: "08-ten-layers",
    chipIndex: 1,
    slug: "leadership-tiers",
    accent: "warm amber orange",
    subject:
      "The middle four glass layers of the stacked tower energize, light climbing the thin columns between them like elevators of glow.",
    motion: "Light climbs between the middle layers in sequence.",
  },
  {
    slideId: "08-ten-layers",
    chipIndex: 2,
    slug: "executive-global",
    accent: "warm amber orange",
    subject:
      "The top three glass layers blaze above the rest of the tower, crowned by a soft corona of light with a faint earth-glow on the horizon.",
    motion: "The corona breathes and the crown layers shimmer.",
  },

  // 07-retail — stream one (green)
  {
    slideId: "07-retail",
    chipIndex: 0,
    slug: "retail-commissions",
    accent: "emerald green",
    subject:
      "A graceful arc of light carries glowing orbs from a floating glass pane down into a growing stack of luminous discs on the reflective floor.",
    motion: "Orbs travel the arc and the disc stack grows.",
  },

  // 08-fast-start — streams two and three (orange)
  {
    slideId: "08-fast-start",
    chipIndex: 0,
    slug: "fast-start-bonus",
    accent: "warm amber orange",
    subject:
      "A wireframe light-figure explodes off a glass starting block, speed trails and sparks streaming behind it across the reflective floor.",
    motion: "Trails whip backward as the figure launches.",
  },
  {
    slideId: "08-fast-start",
    chipIndex: 1,
    slug: "rank-advancement",
    accent: "warm amber orange",
    subject:
      "A rising series of glass podiums, each taller and more radiant than the last, ascends toward a bright summit column of light.",
    motion: "Each podium ignites in turn toward the summit.",
  },

  // 09-team-overrides — three depth beats (blue-green tree)
  {
    slideId: "09-team-overrides",
    chipIndex: 0,
    slug: "first-line",
    accent: "vivid green",
    subject:
      "Beneath one brilliant apex point, the first row of light nodes ignites, connected to the apex by clean direct beams.",
    motion: "Beams flow from apex to nodes, nodes brightening.",
  },
  {
    slideId: "09-team-overrides",
    chipIndex: 1,
    slug: "second-line",
    accent: "vivid green",
    subject:
      "Energy cascades from the first row of light nodes into a wider second row, the branching web of connections glowing as it spreads.",
    motion: "The cascade rolls downward through the branches.",
  },
  {
    slideId: "09-team-overrides",
    chipIndex: 2,
    slug: "deeper-lines",
    accent: "green fading to teal",
    subject:
      "The node tree deepens into shimmering teal rows that recede into the void, each deeper row finer and more numerous than the last.",
    motion: "Deep rows shimmer in waves receding into darkness.",
  },

  // 10-md-depth — infinite depth (violet)
  {
    slideId: "10-md-depth",
    chipIndex: 0,
    slug: "unlimited-depth",
    accent: "deep violet",
    subject:
      "Looking down an endless tunnel of concentric violet light rings, one brilliant white gate ring marks a threshold with infinite rings beyond it.",
    motion: "The camera drifts forward, rings passing the gate.",
  },

  // 11-vp-override — every leg (blue-violet)
  {
    slideId: "11-vp-override",
    chipIndex: 0,
    slug: "every-leg",
    accent: "magenta and violet",
    subject:
      "From one apex star, dotted legs of light fan down to the reflective floor; one leg pulses brighter along its entire length from apex to floor.",
    motion: "The bright pulse travels down one leg, then the next.",
  },

  // 12-generations — leadership generations (green-gold)
  {
    slideId: "12-generations",
    chipIndex: 0,
    slug: "three-generations",
    accent: "gold at center fading to green and cyan",
    subject:
      "Three concentric rings of tiny glowing figures ignite in waves from a radiant golden center outward, each ring a cooler hue than the last.",
    motion: "Ignition waves roll outward ring by ring.",
  },

  // 13-executive — executive overrides (orange)
  {
    slideId: "13-executive",
    chipIndex: 0,
    slug: "executive-override",
    accent: "warm amber orange",
    subject:
      "From a glass summit platform, wide beams of light sweep across a vast constellation of nodes spread over the dark floor far below.",
    motion: "Beams sweep slowly across the constellation.",
  },
  {
    slideId: "13-executive",
    chipIndex: 1,
    slug: "ceo-bonus",
    accent: "warm amber orange",
    subject:
      "A crown-like ring of amber light descends onto the peak of a tall glass monolith, setting its upper edges alight.",
    motion: "The ring settles and the monolith crown ignites.",
  },

  // 14-global — global overrides and pool (violet)
  {
    slideId: "14-global",
    chipIndex: 0,
    slug: "global-override",
    accent: "violet over a night earth",
    subject:
      "A luminous night earth wrapped in neon arcs, with one continuous violet beam sweeping across every arc in a single orbit.",
    motion: "The beam completes a slow orbit, arcs flaring as it passes.",
  },
  {
    slideId: "14-global",
    chipIndex: 1,
    slug: "global-pool",
    accent: "violet and gold",
    subject:
      "Neon arcs rising from a night earth converge into a floating basin of pooled light that brims and glows above the globe.",
    motion: "Arc light streams upward, the pool brimming brighter.",
  },

  // 17-compounding — the growth ladder (orange)
  {
    slideId: "17-compounding",
    chipIndex: 0,
    slug: "one-customer",
    accent: "warm amber orange",
    subject:
      "A single small radiant orb rests alone at the center of the vast dark reflective floor, its glow the only light in the void.",
    motion: "The orb pulses softly, reflection breathing with it.",
  },
  {
    slideId: "17-compounding",
    chipIndex: 1,
    slug: "ten-customers",
    accent: "warm amber orange",
    subject:
      "A small cluster of radiant orbs linked by thin threads of light, the threads glinting as energy passes between them.",
    motion: "Energy glints travel thread to thread.",
  },
  {
    slideId: "17-compounding",
    chipIndex: 2,
    slug: "hundreds-of-customers",
    accent: "warm amber orange",
    subject:
      "A wide lattice of glowing orbs spreads across the floor to the horizon, new connections sparking at its growing edge.",
    motion: "The lattice edge sparks and extends outward.",
  },
  {
    slideId: "17-compounding",
    chipIndex: 3,
    slug: "teams",
    accent: "warm amber orange",
    subject:
      "Orbs rise from the lattice and bloom into wireframe figures standing in loose formation, light still webbing between them.",
    motion: "Orbs lift and unfold into standing figures.",
  },
  {
    slideId: "17-compounding",
    chipIndex: 4,
    slug: "leaders",
    accent: "warm amber orange",
    subject:
      "Several wireframe figures stand elevated on glass steps above the formation, each casting light down that brightens the figures below.",
    motion: "Downcast light pulses, lower figures brightening.",
  },
  {
    slideId: "17-compounding",
    chipIndex: 5,
    slug: "multiple-streams",
    accent: "warm amber orange",
    subject:
      "Ten distinct streams of light flow inward and braid together into one broad glowing river crossing the reflective floor.",
    motion: "Streams braid continuously into the flowing river.",
  },

  // 18-different — why this is different (multi)
  {
    slideId: "18-different",
    chipIndex: 0,
    slug: "true-full-stack",
    accent: "prismatic multi-hue",
    subject:
      "Four colored glass pillars — green, blue, amber, violet — lean inward and merge into one tall prismatic column of white light.",
    motion: "The pillars merge upward, the white core brightening.",
  },
  {
    slideId: "18-different",
    chipIndex: 1,
    slug: "proven-products",
    accent: "emerald green",
    subject:
      "A translucent glass patch hovers at center emitting a steady heartbeat pulse of light that echoes across the floor reflections.",
    motion: "Heartbeat pulses ripple outward in rhythm.",
  },
  {
    slideId: "18-different",
    chipIndex: 2,
    slug: "brand-engine",
    accent: "electric blue",
    subject:
      "A turbine of thin light blades spins inside a large glass ring, throwing off arcs of glow like an engine at speed.",
    motion: "Blades spin steadily, arcs shedding outward.",
  },
  {
    slideId: "18-different",
    chipIndex: 3,
    slug: "ten-ways-to-earn",
    accent: "warm amber orange",
    subject:
      "Ten edge-lit glass layers fan out like a hand of cards, each catching a different warmth of amber light.",
    motion: "The fan spreads and each layer glints in turn.",
  },
  {
    slideId: "18-different",
    chipIndex: 4,
    slug: "development-built-in",
    accent: "deep violet",
    subject:
      "Inside a tall clear column, a wireframe figure climbs an internal staircase of light, each step igniting underfoot.",
    motion: "The figure climbs, steps igniting in sequence.",
  },
  {
    slideId: "18-different",
    chipIndex: 5,
    slug: "global-vision",
    accent: "prismatic multi-hue",
    subject:
      "A luminous lattice horizon curves away like the surface of a planet, prismatic light tracing its meridians into the dark.",
    motion: "Meridian light flows along the curving lattice.",
  },

  // 19-future — imagine your future (orange)
  {
    slideId: "19-future",
    chipIndex: 0,
    slug: "side-income",
    accent: "warm amber orange",
    subject:
      "One modest glowing glass bar stands beside a dim skyline lattice, its small light steady against the dark grid behind it.",
    motion: "The bar glows steadily, skyline lattice flickering faintly.",
  },
  {
    slideId: "19-future",
    chipIndex: 1,
    slug: "income-replacement",
    accent: "warm amber orange",
    subject:
      "A row of glowing glass bars rises until it eclipses a thin dim baseline of light stretched across the frame.",
    motion: "Bars rise past the baseline, glow overtaking it.",
  },
  {
    slideId: "19-future",
    chipIndex: 2,
    slug: "business-ownership",
    accent: "warm amber orange",
    subject:
      "A glass tower assembles itself from stacked luminous slabs above the reflective floor, scaffolds of light guiding each slab home.",
    motion: "Slabs fly in and stack, the tower completing.",
  },
  {
    slideId: "19-future",
    chipIndex: 3,
    slug: "financial-freedom",
    accent: "warm amber orange",
    subject:
      "A wireframe figure steps off the top of a glass tower onto an open bridge of light extending toward a bright horizon.",
    motion: "The bridge extends ahead as the figure walks.",
  },
  {
    slideId: "19-future",
    chipIndex: 4,
    slug: "generational-wealth",
    accent: "warm amber orange",
    subject:
      "A chain of glass towers recedes to the horizon, each tower igniting the next with a passed torch of light.",
    motion: "Ignition passes tower to tower into the distance.",
  },
];

/** The four photographic plates that break the Tron arc, remade in deck style. */
export const PLATE_RETAKES: PlateRetakeSpec[] = [
  {
    plateFile: "sp-stack-13-executive.png",
    slideId: "13-executive",
    accent: "warm amber orange",
    subject:
      "A wireframe light-figure stands atop a faceted glass summit peak, overlooking a vast neon grid of light far below, partially veiled by a low haze of luminous particles. A soft amber dawn-glow rises at the horizon of the void.",
    motion:
      "Haze drifts across the grid while the dawn-glow slowly intensifies.",
  },
  {
    plateFile: "sp-stack-19-future.png",
    slideId: "19-future",
    accent: "warm amber orange",
    subject:
      "A skyline of ascending edge-lit glass bars stands on the reflective floor against the black void, a warm amber glow banding the horizon behind them and thin lattice clouds of light drifting above.",
    motion: "Lattice clouds drift and the horizon band breathes.",
  },
  {
    plateFile: "sp-stack-15-closing.png",
    slideId: "15-closing",
    accent: "warm red-orange",
    subject:
      "Four wireframe light-figures stand together on the reflective floor, seen from behind, facing a brilliant warm portal of light on the horizon whose glow washes toward them across the mirror-dark ground.",
    motion: "The portal glow swells and washes toward the figures.",
  },
  {
    plateFile: "sp-stack-18-different.png",
    slideId: "18-different",
    accent: "prismatic multi-hue",
    subject:
      "A translucent glass wellness patch floats alone in the void above the reflective floor, its rounded edge rimmed with a full prismatic gradient of light, soft caustics playing beneath it.",
    motion: "The patch rotates slowly, caustics shifting below.",
  },
];
