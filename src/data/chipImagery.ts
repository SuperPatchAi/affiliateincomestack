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
  /** Optional style anchor override (defaults to CHIP_STYLE_ANCHOR). */
  style?: string;
  /** Optional scene setting for the motion prompt (defaults to the dark void). */
  setting?: string;
  /** Optional vertically-native recomposition used for 9:16 renders. */
  portraitSubject?: string;
};

export type PlateRetakeSpec = {
  /** File under public/concepts/clean/ that breaks the Tron arc today. */
  plateFile: string;
  slideId: string;
  accent: string;
  subject: string;
  motion: string;
  /** Optional style anchor override (defaults to CHIP_STYLE_ANCHOR). */
  style?: string;
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

/**
 * Legacy night-city look, kept for plate retakes that still want neon.
 * Live chips on 01-title and 02-world use DAYLIGHT_CITY_STYLE_ANCHOR.
 */
export const NEON_CITY_STYLE_ANCHOR =
  "Cinematic photorealistic night-city photograph: a rain-slicked metropolis " +
  "after dark, alive with vivid mixed neon color — cyan, magenta, amber, and " +
  "violet — glowing from windows, abstract signage shapes, and traffic light " +
  "trails, with wet asphalt and glass mirroring every glow. Shot like a premium " +
  "Apple x Nike commercial on anamorphic lenses: shallow depth of field, deep " +
  "clean blacks, cinematic contrast. Keep the hero subject centered with " +
  "quieter, darker edges reserved for later interface overlays. Every sign, " +
  "screen, and billboard reads as pure abstract glowing shape or soft bokeh — " +
  "no readable characters anywhere in the scene.";

/**
 * Same city-scale photoreal as the neon plates, but late-morning sun:
 * glass, stone, sky, and skin — no neon tubes, no night rain.
 */
export const DAYLIGHT_CITY_STYLE_ANCHOR =
  "Cinematic photorealistic daylight city photograph: a bright airy metropolis " +
  "in late-morning sun, warm stone and glass, pale sky, open shade on the street. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses: shallow " +
  "depth of field, natural skin with laugh lines, no neon, no rain, no night. " +
  "Keep the hero subject centered with quieter edges reserved for later " +
  "interface overlays. Every sign, screen, and billboard is a blank soft shape " +
  "or distant bokeh — no readable characters anywhere in the scene.";

/**
 * Golden-hour beach still for Greater Freedom — warm, open, no city night.
 */
/**
 * Late-morning interiors for company-system slides: atrium, studio, loft.
 * Same photoreal lock as the city plates, without street or neon language.
 */
export const DAYLIGHT_INTERIOR_STYLE_ANCHOR =
  "Cinematic photorealistic daylight interior photograph: a bright airy room " +
  "in late-morning sun, warm pale stone or plaster, pale wood, large windows, " +
  "open shade on faces. Shot like a premium Apple x Nike commercial on " +
  "anamorphic lenses: shallow depth of field, natural skin with laugh lines, " +
  "no neon, no rain, no night. Keep the hero subject centered with quieter " +
  "edges reserved for later interface overlays. Every sign, screen, and board " +
  "is a blank soft shape or distant bokeh — no readable characters anywhere in the scene.";

export const DAYLIGHT_POOL_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning photograph shot straight down from above: " +
  "turquoise pool water #2EC4B6 filling most of the frame, white tile, an orange towel, " +
  "a lime citrus slice, hard sun sparkle on water. Shot like a premium Apple x Nike " +
  "commercial on anamorphic lenses. Natural skin, no neon, no rain, no night. " +
  "Keep the person near the pool edge in the center band with quieter corners for later overlays. " +
  "No readable characters anywhere in the scene.";

export const DAYLIGHT_CAMPAIGN_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning photograph of an award-level commercial " +
  "being made: daylight set, bounce boards, a cinema camera, vivid wardrobe color, " +
  "pale sky or open warehouse light. Shot like a premium Apple x Nike commercial on " +
  "anamorphic lenses. Natural skin, no neon, no rain, no night. " +
  "Keep the talent and camera in the center band with quieter edges for later overlays. " +
  "Every slate, screen, and board is a blank soft shape — no readable characters.";

export const DAYLIGHT_YACHT_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning photograph on a real yacht at sea: " +
  "teak deck, white hull, cobalt water #2563EB, pale sky. Shot like a premium " +
  "Apple x Nike commercial on anamorphic lenses. Natural skin, correct adult " +
  "human scale against the rail and furniture, no neon, no rain, no night. " +
  "Keep the person in the center band with quieter edges for later overlays. " +
  "Hull and flags are unmarked — no readable characters anywhere in the scene.";

export const DAYLIGHT_RIVER_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning photograph at water level on a river: " +
  "cobalt water #2563EB, a yellow racing shell, green bank #166534, pale sky. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses. " +
  "Natural skin, no neon, no rain, no night. Keep the boat in the center band " +
  "with quieter edges for later overlays. No readable characters anywhere in the scene.";

export const DAYLIGHT_HARBOR_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning elevated photograph of one company " +
  "on a harbor: glass headquarters, teak terrace, a real yacht at the dock at " +
  "correct adult scale, cobalt water #2563EB, pale sky. One continuous place, " +
  "not a collage. Shot like a premium Apple x Nike commercial on anamorphic lenses. " +
  "Natural skin, no neon, no rain, no night. People stay small for scale. " +
  "Hull and walls are unmarked — no readable characters anywhere in the scene.";

export const SUNSET_BEACH_STYLE_ANCHOR =
  "Cinematic photorealistic golden-hour photograph on an open beach: " +
  "warm sunset over the water, long soft shadows, honey light on skin and wet sand. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses: shallow " +
  "depth of field, natural skin with laugh lines. No neon, no rain, no city night. " +
  "Keep the hero subject centered with quieter edges reserved for later " +
  "interface overlays. The shore is unmarked — no readable characters anywhere in the scene.";

export const CUTOUT_STYLE_ANCHOR =
  "Bright airy photoreal photograph on a clean warm-white void, late-morning " +
  "window light, soft open shade, natural skin with laugh lines and pores, " +
  "premium Super Patch lifestyle still — no neon, no rain, no night. " +
  "Keep the hero subject centered in frame. Exactly one head, exactly two arms, " +
  "exactly two legs, five fingers on every visible hand. No extra limbs or " +
  "appendages. Isolate the hero so the background can be erased. Screens and " +
  "badges are blank soft shapes.";

export function buildChipImagePrompt(
  spec: ChipImageSpec,
  aspect: ChipAspect = "16:9",
): string {
  const subject =
    aspect === "9:16" && spec.portraitSubject
      ? spec.portraitSubject
      : spec.subject;
  return [
    spec.style ?? CHIP_STYLE_ANCHOR,
    `Accent lighting: ${spec.accent}.`,
    subject,
    "Match the palette, lighting mood, and reflections of the reference images exactly.",
    OMNI_TEXT_BAN,
  ].join(" ");
}

/**
 * Portrait pass for photoreal chips: rather than composing 9:16 from scratch
 * (which reliably produces letterboxed collages), recompose the approved 16:9
 * still — attached as the sole reference — into one continuous vertical frame.
 */
export function buildPortraitRecomposePrompt(spec: ChipImageSpec): string {
  return [
    "Recompose the attached photograph as a tall vertical portrait image for a phone screen.",
    "Keep the exact same scene, subject, lighting, palette, and photographic style.",
    "One single continuous photograph with one camera and one unbroken depth of field, filling the whole frame edge to edge —",
    "no black bars, no borders, no split panels, no collage.",
    "Extend the scene naturally above and below, keeping the hero subject in the middle band with the upper and lower areas quieter and softer.",
    OMNI_TEXT_BAN,
  ].join(" ");
}

/** Shrink only the SuperPatch on the product-stack still. Keep the photograph. */
export function buildProductPatchScaleEditPrompt(): string {
  return [
    "The attached photograph is the scene. Keep the person, pose, clothing, room, lighting, and composition identical.",
    "The SuperPatch on the forearm is oversized. Resize only that patch so it is 25% smaller — three-quarters of its current width and height, no wider than two fingers.",
    "Keep it a white rounded square with red repeating SuperPatch marks and a clear fingerprint gel center.",
    "Fill the newly exposed skin naturally. Do not change anything else.",
    OMNI_TEXT_BAN,
  ].join(" ");
}

/** Edit the approved harbor plate down to foundation so Omni can raise the floors. */
export function buildHarborConstructionStartPrompt(): string {
  return [
    "The attached photograph is the scene. Keep the harbor water, yacht, dock, sky, camera height, and lighting identical.",
    "Remove the completed glass headquarters.",
    "In its place show only a foundation and ground-floor slab on the same footprint — raw concrete and steel just beginning, no finished floors yet.",
    "The yacht stays at the dock at the same scale. People stay small on the dock.",
    "Do not change anything else.",
    OMNI_TEXT_BAN,
  ].join(" ");
}

/** Edit the approved title still so only the arm wearable matches the product photo. */
export function buildPlatePatchEditPrompt(): string {
  return [
    "The first attached photograph is the scene. Keep the person, pose, clothing, city, lighting, and composition identical.",
    "Replace only the wearable on the subject's upper arm with the product in the second attached image.",
    "The patch is a white rounded square with a red repeating SuperPatch mark — diamond S and circle-X — and a clear fingerprint gel in the center.",
    "Ignore any watermark or black backdrop on the product photo. Do not change anything else.",
    OMNI_TEXT_BAN,
  ].join(" ");
}

export function buildPlateRetakePrompt(spec: PlateRetakeSpec): string {
  return [
    spec.style ?? CHIP_STYLE_ANCHOR,
    `Accent lighting: ${spec.accent}.`,
    spec.subject,
    // Style-override retakes render without style references; the anchor
    // itself carries the look.
    ...(spec.style
      ? []
      : [
          "Match the palette, lighting mood, and reflections of the reference images exactly.",
        ]),
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
 * Slides whose per-chip stills have been generated (both aspects) and live
 * under public/concepts/chips/<slideId>/. Add ids here as batches land.
 */
export const CHIP_MEDIA_READY_SLIDES: readonly string[] = [
  "01-title",
  "02-world",
  "03-four-stacks",
];

/**
 * Slides whose omni warp clips have also been generated (both aspects).
 * Slides listed in CHIP_MEDIA_READY_SLIDES but not here run stills-only:
 * the poster shows and the chip cycle advances on its fallback timer.
 */
export const CHIP_VIDEO_READY_SLIDES: readonly string[] = [
  "01-title",
  "02-world",
  "03-four-stacks",
];

/** Slides that use isolated cutout stills instead of omni / neon backdrops. */
export const CHIP_CUTOUT_SLIDES: readonly string[] = [];

export type ChipCutoutEntry = {
  slug: string;
  src: string;
};

export function chipCutoutForSlide(
  slideId: string,
  aspect: "landscape" | "portrait",
): ChipCutoutEntry[] {
  if (!CHIP_CUTOUT_SLIDES.includes(slideId)) return [];
  const chipAspect: ChipAspect = aspect === "landscape" ? "16:9" : "9:16";
  return CHIP_IMAGE_SPECS.filter((spec) => spec.slideId === slideId).map(
    (spec) => ({
      slug: spec.slug,
      src: chipImagePath(spec, chipAspect),
    }),
  );
}

export type ChipMediaEntry = {
  slug: string;
  /** Omni warp clip for this chip beat; absent when the slide is stills-only. */
  video?: string;
  /** Text-free still, used as the video poster / reduced-motion fallback. */
  poster: string;
};

/** Per-chip backdrop media for a slide's scroll sequence, in chip order. */
export function chipMediaForSlide(
  slideId: string,
  aspect: "landscape" | "portrait",
): ChipMediaEntry[] {
  if (!CHIP_MEDIA_READY_SLIDES.includes(slideId)) return [];
  if (CHIP_CUTOUT_SLIDES.includes(slideId)) return [];
  const hasVideo = CHIP_VIDEO_READY_SLIDES.includes(slideId);
  const chipAspect: ChipAspect = aspect === "landscape" ? "16:9" : "9:16";
  return CHIP_IMAGE_SPECS.filter((spec) => spec.slideId === slideId).map(
    (spec) => ({
      slug: spec.slug,
      ...(hasVideo ? { video: chipVideoPath(spec, chipAspect) } : {}),
      poster: chipImagePath(spec, chipAspect),
    }),
  );
}

/**
 * Omni motion prompt for a chip still.
 *
 * Photoreal chips chain naturally: the first clip stays in its own scene;
 * later clips start on the previous last frame (<FIRST_FRAME>) and arrive
 * at this chip's still (<IMAGE_REF_1>). Abstract Tron chips still warp
 * toward the next accent, or settle on the final beat.
 */
/**
 * Gemini Omni / Veo I2V lock — official guidance:
 * prompt for motion only, one scene per short clip, general terms for people,
 * direct a slow camera. Do not re-describe the still or chain A-then-B events.
 */
export const CHIP_MOTION_ONLY_LOCK =
  "Image-to-video: prompt for motion only. The attached still is the first frame. " +
  "Stay in this one scene for the entire clip. No cuts, no morph, " +
  "no jump to another place, no flashing, no warp, no mid-video scene change. " +
  "Subtle human motion only — small natural gestures, cloth, hair, breath. " +
  "Do not re-describe the setting, lighting, or wardrobe. Refer to people as the subject or they.";

export function buildChipMotionPrompt(
  spec: ChipImageSpec,
  next: ChipImageSpec | null,
  _prev: ChipImageSpec | null = null,
): string {
  if (spec.setting) {
    return [
      "In a single continuous shot with no scene cuts. <FIRST_FRAME> Animate only the attached still.",
      CHIP_MOTION_ONLY_LOCK,
      `Slow, subtle motion: ${spec.motion}`,
      "Slow dolly or gentle handheld drift. The subject moves like a real unhurried person.",
      "Hold the same composition through the last frame. No settle warp and no morph at the end.",
      OMNI_TEXT_BAN,
    ].join(" ");
  }

  const setting = `Dark void with ${spec.accent} accent lighting on a dark reflective floor.`;
  const exit = next
    ? `[6-8s] Accelerate everything into a forward warp of streaking light — ` +
      `the whole scene rushes past the camera as if fast-forwarding to the next moment, ` +
      `light trails shifting toward ${next.accent} as the frame fills with motion blur.`
    : `[6-8s] Ease every element back toward the opening composition so the clip loops cleanly, ` +
      `letting the scene settle to rest.`;

  return [
    "In a single continuous shot with no scene cuts.",
    "<FIRST_FRAME> Animate this premium keynote motion graphic still.",
    setting,
    "Apple x Nike x McKinsey cinematic presentation aesthetic — large scale, premium, abstract motion.",
    "[0-2s] Awaken the composition with a restrained camera drift.",
    `[2-6s] ${spec.motion} Keep primary motion in the center sixty percent of the frame; quieter edges for later interface overlays.`,
    exit,
    OMNI_TEXT_BAN,
  ].join(" ");
}

export const CHIP_IMAGE_SPECS: ChipImageSpec[] = [
  // 01-title — Health / Freedom / Impact, same beats as the neon plates minus neon
  {
    slideId: "01-title",
    chipIndex: 0,
    slug: "better-health",
    accent: "warm sun on skin and pale asphalt",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    setting: "A sunlit downtown avenue in late morning, pale sky above.",
    subject:
      "A lone runner in sleek athletic gear sprints across a dry city crosswalk, caught mid-stride, sun on their face and laugh lines visible. Stone and glass towers recede behind them in soft open shade. The street is bright and dry, with quiet traffic bokeh and no signboards.",
    motion:
      "The subject keeps a natural running stride, fabric and hair moving with each step, while the camera makes a slow tracking drift.",
  },
  {
    slideId: "01-title",
    chipIndex: 1,
    slug: "greater-freedom",
    accent: "honey sunset on wet sand and open water",
    style: SUNSET_BEACH_STYLE_ANCHOR,
    setting: "An open beach at sunset, warm sky over calm water.",
    subject:
      "One person walks barefoot along the wet sand at the waterline, in profile, gazing at a wide sunset over the sea. Soft honey light on their face, a light jacket stirring in the breeze, empty beach stretching toward the horizon. No buildings, no boats in the foreground.",
    portraitSubject:
      "A tall vertical photograph of one person walking barefoot along the wet sand at the waterline, in profile, gazing at a wide sunset over the sea. Warm sky fills the upper frame, wet sand and shallow water the lower, empty beach toward the horizon.",
    motion:
      "The subject walks unhurried along the waterline. Hair and jacket stir in a light breeze. The camera makes a slow lateral drift.",
  },
  {
    slideId: "01-title",
    chipIndex: 2,
    slug: "bigger-impact",
    accent: "late-morning sun on pale stone and open sky",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    setting: "A sunlit rooftop terrace in late morning, pale sky above.",
    subject:
      "A small circle of people stands together on a bright rooftop terrace, mid-conversation, cups of coffee or water in hand, faces readable in high even late-morning daylight. The sun is high and white; shadows are short and pale. Pale stone paving, a low glass rail, and a city of stone and glass behind them under a pale blue-white sky. Blank walls and windows, no signboards.",
    portraitSubject:
      "A tall vertical photograph of a small circle of people on a bright rooftop terrace, mid-conversation, cups in hand, faces readable. Pale blue-white sky fills the upper frame, the city of stone and glass falls away below the rail. High even late-morning daylight, short pale shadows.",
    motion:
      "They share a small natural laugh. Hair and clothes stir in a light breeze. The camera holds a slow, quiet drift.",
  },

  // 02-world — daylight cityscapes, same beats as the neon plates minus neon
  {
    slideId: "02-world",
    chipIndex: 0,
    slug: "traditional-jobs",
    accent: "warm sun on glass and pale stone",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    setting: "A sunlit downtown avenue in late morning, pale sky above.",
    subject:
      "A towering glass office block fills the frame, shot from street level looking up: a vast grid of sunlit windows, tiny figures at desks. Below, a bright avenue with soft traffic bokeh and a few pedestrians in open shade.",
    motion:
      "Window reflections drift slowly. A few pedestrians walk at an easy pace. The camera holds a gentle upward drift.",
  },
  {
    slideId: "02-world",
    chipIndex: 1,
    slug: "gig-economy",
    accent: "open daylight on cream paint and pale sky",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    setting: "A sunlit city side street in late morning, pale sky above.",
    subject:
      "A delivery rider on a cream scooter moves along a bright city side street, courier bag on his back, visor up, easy smile. Stone and glass buildings recede in soft daylight. The street has no signboards — only windows, sky, and warm asphalt.",
    motion:
      "The subject rolls forward at an easy pace. The camera follows with a slow, stable tracking move.",
  },
  {
    slideId: "02-world",
    chipIndex: 2,
    slug: "creator-economy",
    accent: "morning window light against a bright city view",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    setting:
      "A bright apartment studio with a floor-to-ceiling window over a sunlit city.",
    subject:
      "A creator sits at a pale desk near a tall window, both hands near a phone on a tiny tripod, mid-laugh. Beyond the glass a sunlit city stretches in pale stone and glass. Screens are blank soft shapes.",
    motion:
      "The subject breathes and shifts slightly at the desk. Soft window light moves. The camera holds a slow, quiet drift.",
  },
  {
    slideId: "02-world",
    chipIndex: 3,
    slug: "social-commerce",
    accent: "sun on skin, pale wood, and a city sidewalk",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    setting: "An outdoor cafe on a sunlit city sidewalk in late morning.",
    subject:
      "Two friends at an outdoor cafe table on a city sidewalk, four hands around one small product, coffee cups only, sun on faces. Behind them the street recedes in stone and glass, pedestrians soft in open shade.",
    portraitSubject:
      "A tall vertical photograph of two friends at an outdoor cafe table on a city sidewalk, four hands around one small product, coffee cups only, sun on faces. The street and pale sky rise above them in stone and glass.",
    motion:
      "Hands turn the product slowly. The subjects share a small natural laugh. The camera holds a gentle close drift.",
  },

  // 03-four-stacks — four unrelated cameras, four palettes
  {
    slideId: "03-four-stacks",
    chipIndex: 0,
    slug: "product-stack",
    accent: "turquoise water, white tile, orange towel",
    style: DAYLIGHT_POOL_STYLE_ANCHOR,
    setting: "A sunlit pool photographed straight down in late morning.",
    subject:
      "Straight-down overhead of a swimmer at the pool edge: turquoise water fills most of the frame, white tile along one side, an orange towel and a lime nearby. The subject rests one arm on the deck. A compact postage-stamp SuperPatch sits on the dry shoulder — white rounded square, red repeating marks, clear fingerprint gel. The patch is a small detail, not the frame.",
    portraitSubject:
      "A tall vertical overhead of a swimmer at the pool edge. Turquoise water fills the lower frame, white tile and an orange towel the upper. A compact SuperPatch on the dry shoulder — white rounded square, red repeating marks, fingerprint gel.",
    motion:
      "Water sparkles. The subject shifts a hand on the tile. The camera holds a slow overhead drift.",
  },
  {
    slideId: "03-four-stacks",
    chipIndex: 1,
    slug: "brand-marketing",
    accent: "daylight on a vivid campaign set",
    style: DAYLIGHT_CAMPAIGN_STYLE_ANCHOR,
    setting: "A late-morning outdoor campaign set, one talent and a small crew.",
    subject:
      "Over the shoulder of a cinema camera on a daylight campaign shoot: one talent in vivid coral wardrobe holds a still pose, bounce boards and a small crew at the edge, pale sky behind. Award-level craft on a set. Screens and slates are blank. Exactly one head and two arms on the talent.",
    portraitSubject:
      "A tall vertical over-the-shoulder of a cinema camera on a daylight campaign shoot. One talent in vivid coral, bounce boards, pale sky filling the upper frame. Screens and slates are blank.",
    motion:
      "The talent breathes. A bounce board shifts. The camera holds a slow, quiet drift.",
  },
  {
    slideId: "03-four-stacks",
    chipIndex: 2,
    slug: "income-stack",
    accent: "late-morning sun on teak, white hull, and open water",
    style: DAYLIGHT_YACHT_STYLE_ANCHOR,
    setting: "The aft deck of a real yacht at sea in late morning.",
    subject:
      "A high-net-worth adult stands on the teak aft deck of a real yacht, correct human scale — the rail, seating, and hull are adult-sized, the person is a normal proportioned adult, not a miniature and not oversized. White unmarked hull, cobalt water, pale sky. Relaxed, easy, looking out. Exactly one head, two arms, two legs.",
    portraitSubject:
      "A tall vertical photograph of a high-net-worth adult on the teak aft deck of a real yacht, correct adult scale against the rail. Pale sky above, cobalt water and white hull below.",
    motion:
      "The subject shifts their weight. Water and a light flag stir. The camera holds a slow, stable drift.",
  },
  {
    slideId: "03-four-stacks",
    chipIndex: 3,
    slug: "personal-development",
    accent: "cobalt river, yellow shell, green bank",
    style: DAYLIGHT_RIVER_STYLE_ANCHOR,
    setting: "A river at water level in late morning.",
    subject:
      "Camera at water level: a yellow racing shell cuts across cobalt river, one person calling the stroke, the others in sync. Green bank and pale sky beyond. Faces readable. Leadership as rhythm, not a meeting.",
    portraitSubject:
      "A tall vertical water-level photograph of a yellow racing shell on a cobalt river. Green bank and pale sky stack above the boat. One person calls, the others row in sync.",
    motion:
      "Oars dip and recover together. Water slides past. The camera holds a low, stable drift.",
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
    plateFile: "sp-stack-01-title.png",
    slideId: "01-title",
    accent: "warm sun on skin and a pale city sky",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    subject:
      "A sunlit late-morning photograph of one person standing at a wide window or open terrace, a white rounded-square SuperPatch on their upper arm with red repeating marks and a clear fingerprint gel center, looking out over an airy city of pale stone and glass. Warm skin, laugh lines, open shade. The feeling is better health, greater freedom, and a bigger life ahead — one quiet human moment, not a collage. No stacked graphics and no signage.",
    motion:
      "The subject breathes and the breeze stirs their clothes. The camera holds a slow, almost still push-in.",
  },
  {
    plateFile: "sp-stack-02-world.png",
    slideId: "02-world",
    accent: "warm sun on glass, pale stone, and open streets",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    subject:
      "A sweeping aerial view from high above a vast real metropolis in late-morning sun: one great avenue of pale traffic bokeh flows in from the foreground, then splits and branches into many sunlit routes that spread through a city of warm stone and glass, each branch catching its own open shade as it weaves between towers. Sunlit windows and pale streets recede to a bright horizon under a clear sky, and the upper band of the frame stays quiet and soft.",
    motion:
      "Traffic streams along the great avenue, splits at the branch point, and flows outward through the sunlit grid while window reflections drift softly across the towers.",
  },
  {
    plateFile: "sp-stack-03-four-stacks.png",
    slideId: "03-four-stacks",
    accent: "late-morning sun on glass, teak, and harbor water",
    style: DAYLIGHT_HARBOR_STYLE_ANCHOR,
    subject:
      "An elevated late-morning photograph of one company headquarters on a harbor in a single continuous place: a glass building, a sunlit terrace with a few small people, and one real yacht at the dock at correct adult scale against cobalt water and pale sky. People stay small. No single person as the hero and no signage.",
    motion:
      "Water moves against the hull. People cross the terrace. The camera holds a slow, almost still elevated drift.",
  },
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
