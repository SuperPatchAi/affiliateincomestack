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
  /** One Super Patch mark is allowed on a single screen; no other brand marks. */
  allowBrandMark?: boolean;
  /** Stage LED screens at a live event may carry the Super Patch mark. */
  allowStageScreenMarks?: boolean;
  /** Exact Freedom pouch from the attached pack still — do not redraw. */
  allowProductPack?: boolean;
  /** Exact press-row marks from the attached still may appear on one wall. */
  allowPressMarks?: boolean;
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
  /** Exact Freedom pouch from the attached pack still — do not redraw. */
  allowProductPack?: boolean;
  /**
   * Neon-city mode: when false, do not use the photoreal clean plate as a
   * composition reference (needed when that plate's setting fights neon city).
   */
  composeFromPhotoreal?: boolean;
  /**
   * Extra image refs under public/ (e.g. science diagram) appended for compose.
   */
  extraRefs?: string[];
  /** Preserve an attached science diagram (incl. its labels) as hologram art. */
  allowScienceDiagram?: boolean;
  /**
   * Neon-city fresh compose: skip title/world/development style-lock plates
   * (needed when those refs pull the wrong composition, e.g. globe or terrace).
   */
  skipNeonStyleLock?: boolean;
  /**
   * Neon-city fresh compose on a deep black void stage (no metropolis language).
   * Use with skipNeonStyleLock for abstract beats like human constellation.
   */
  neonVoidStage?: boolean;
  /**
   * Neon-city fresh compose as an endless retail/wellness aisle interior
   * (no outdoor skyline / terrace / Earth language).
   */
  neonRetailInterior?: boolean;
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
/** Lived-in faces — pores, laugh lines, wrinkles. Never plastic or airbrushed. */
export const SKIN_REALISM_LOCK =
  "Lived-in adult skin in open shade: visible pores, laugh lines, fine wrinkles where age calls for them, slight uneven tone, a stray blemish or freckle. Faces look photographed, not retouched. Not plastic, not airbrushed, not a beauty filter, not porcelain CGI.";

export const DAYLIGHT_CITY_STYLE_ANCHOR =
  "Cinematic photorealistic daylight city photograph: a bright airy metropolis " +
  "in late-morning sun, warm stone and glass, pale sky, open shade on the street. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses: shallow " +
  "depth of field, natural skin with laugh lines, no neon, no rain, no night. " +
  "Keep the hero subject centered with quieter edges reserved for later " +
  "interface overlays. Every sign, screen, and billboard is a blank soft shape " +
  "or distant bokeh — no readable characters anywhere in the scene.";

export const DAYLIGHT_PACK_STYLE_ANCHOR =
  "Cinematic photorealistic daylight city photograph: a bright airy metropolis " +
  "in late-morning sun, warm stone and glass, pale sky, open shade on the street. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses: shallow " +
  "depth of field, natural skin with laugh lines, no neon, no rain, no night. " +
  "The hero is the man whose pinch holds the pouch — the pouch lives in his hand, " +
  "not as a separate graphic. Keep quieter edges for later overlays. " +
  "Aside from the exact attached Super Patch Freedom pouch, every sign and screen " +
  "is a blank soft shape — no other readable characters.";

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

/** Looking straight down into open ocean — depth continuing past the near swimmers. */
export const DAYLIGHT_OCEAN_DEPTH_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning ocean photograph shot looking straight " +
  "down from just below the surface: clear turquoise water near the top of frame " +
  "fading into deep cobalt and near-black depth below, sun shafts cutting through. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses. Natural skin, " +
  "no neon, no night, no CGI tunnel rings. Keep the near divers in the upper-center " +
  "band with quieter edges for later overlays. Masks and fins stay unmarked — no " +
  "readable characters anywhere in the scene.";

/** Aerial river delta — one channel splitting into many legs. */
export const DAYLIGHT_DELTA_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning aerial photograph of a real river delta: " +
  "one main channel forking into many sunlit arms of water across pale sand and " +
  "marsh green, cobalt sea at the horizon under a pale sky. Shot like a premium " +
  "Apple x Nike commercial on anamorphic lenses from high above: deep focus across " +
  "the water legs, natural color, no neon, no night, no CGI diagrams. Keep the " +
  "forking channels in the center band with quieter edges for later overlays. " +
  "No boats with readable marks and no signage — no readable characters anywhere " +
  "in the scene.";

/** Sunlit craft studio — mentor, mentee, mentee's mentee. */
export const DAYLIGHT_STUDIO_MENTOR_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning interior photograph of a real craft " +
  "workshop: pale plaster walls, wood benches, tall windows with open shade on " +
  "faces, dust motes in sun shafts. Shot like a premium Apple x Nike commercial " +
  "on anamorphic lenses: shallow depth of field, lived-in adult skin, no neon, " +
  "no night, no CGI rings. Keep the three people in the center band with quieter " +
  "edges for later overlays. Tools and boards stay unmarked — no readable " +
  "characters anywhere in the scene.";

/** Lone summit at dawn overlooking a real city — peak executive view. */
export const DAYLIGHT_SUMMIT_CITY_STYLE_ANCHOR =
  "Cinematic photorealistic dawn photograph on a real mountain summit: pale " +
  "golden light on the horizon, cool open shade on rock and clothing, a real " +
  "city skyline soft in morning haze far below — no neon grids, no CGI glow. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses. Lived-in " +
  "adult skin, no night Tron void. Keep the person near the ridge edge in the " +
  "center band with quieter edges for later overlays. Clothing and packs stay " +
  "unmarked — no readable characters anywhere in the scene.";

/** One continuous hallway — four open doorways, one company path. */
export const DAYLIGHT_HALLWAY_STACK_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning interior photograph looking down a " +
  "real company hallway: continuous pale wood floorboards, plaster walls, " +
  "tall doorways with open shade and soft sun shafts. Shot like a premium " +
  "Apple x Nike commercial on anamorphic lenses: deep focus along the corridor, " +
  "lived-in adult skin, no neon, no night, no CGI collage panels. Keep the " +
  "hallway centered with quieter edges for later overlays. Screens and boards " +
  "inside the rooms stay blank soft shapes — no readable characters anywhere " +
  "in the scene.";

/** Empty highway at dawn — path vanishing; you choose the distance. */
export const DAYLIGHT_HIGHWAY_DAWN_STYLE_ANCHOR =
  "Cinematic photorealistic dawn photograph on an empty real highway: pale " +
  "sunrise on the horizon, cool asphalt, dashed lane lines racing toward a soft " +
  "vanishing point under a huge quiet sky. Shot like a premium Apple x Nike " +
  "commercial on anamorphic lenses from a low camera on the road: deep focus " +
  "down the lane, no cars, no neon, no night city glow. Keep the road centered " +
  "with quieter edges for later overlays. Signs and mile markers stay blank soft " +
  "shapes — no readable characters anywhere in the scene.";

/** Open gate onto a bright path — join / take the next step. */
export const DAYLIGHT_OPEN_GATE_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning photograph at a real wooden or metal " +
  "farm gate swung open at the near edge of frame: pale gravel or dirt path " +
  "continuing into sunlit meadow or open country under a pale sky. Shot like a " +
  "premium Apple x Nike commercial on anamorphic lenses: shallow depth of field " +
  "on the gate posts, path soft into the distance, no neon, no night. Keep the " +
  "open gateway centered with quieter edges for later overlays and a brand lockup. " +
  "No readable characters anywhere in the scene.";

export const DAYLIGHT_CAMPAIGN_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning photograph of an award-level commercial " +
  "being made: daylight set, bounce boards, a cinema camera, vivid wardrobe color, " +
  "pale sky or open warehouse light. Shot like a premium Apple x Nike commercial on " +
  "anamorphic lenses. Lived-in adult skin with pores, laugh lines, and wrinkles " +
  "where age belongs — photographed, not retouched. No neon, no rain, no night. " +
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

/** Low tracking shot of a real sports car at speed — motion-blurred scenery, sharp car. */
export const DAYLIGHT_ROAD_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning automotive photograph: a real asphalt " +
  "road under pale sky, hard sun sparkle on paint and glass, countryside or coast " +
  "scenery streaked into heavy motion blur while the car stays tack-sharp. Shot " +
  "like a premium Porsche and Apple commercial on anamorphic lenses from a low " +
  "tracking camera: shallow depth of field, natural color, no neon, no night, no " +
  "CGI wireframe. Keep the car in the center band with quieter edges for later " +
  "overlays. License plates, badges, and roadside signs stay blank soft shapes — " +
  "no readable characters anywhere in the scene.";

/** Bright alpine ridge — rope team depth without neon org trees. */
export const DAYLIGHT_ALPINE_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning alpine photograph: a real mountain " +
  "ridge under pale sky, sunlit rock and snow patches, thin cold air haze in " +
  "the valleys. Shot like a premium Apple x Nike commercial on anamorphic " +
  "lenses: shallow depth of field, natural skin with laugh lines, no neon, no " +
  "night, no CGI wireframe. Keep the rope team in the center band with quieter " +
  "edges for later overlays. Clothing and packs stay unmarked — no readable " +
  "characters anywhere in the scene.";

export const LONDON_HIGH_STREET_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning street photograph on a London high street: " +
  "Portland stone, brick, plate glass, plane trees, a black cab, mixed everyday clothing. " +
  "Documentary camera, real people, not a fashion campaign and not a matched outfit. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses. " +
  "Natural skin, no neon, no rain, no night. Keep the queue in the center band " +
  "with quieter edges for later overlays. Store signs and phones are blank soft shapes — " +
  "no readable characters anywhere in the scene.";

export const DAYLIGHT_PROCESSION_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning photograph of a European festa procession: " +
  "a stone street, a moving column of people, pale sky, open shade on faces. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses. " +
  "Natural skin, no neon, no rain, no night. Keep the column in the center band " +
  "with quieter edges for later overlays. Banners, drums, and phones are blank " +
  "soft shapes — no readable characters anywhere in the scene.";

export const DAYLIGHT_LOCK_STYLE_ANCHOR =
  "Cinematic photorealistic late-morning photograph at a working canal lock: " +
  "stone chamber, cobalt water, a small cargo boat, pale sky, green bank. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses. " +
  "Natural skin, correct adult human scale against the gates, no neon, no rain, no night. " +
  "Keep the lock and boat in the center band with quieter edges for later overlays. " +
  "Hull and gates are unmarked — no readable characters anywhere in the scene.";

export const TIMES_SQUARE_STYLE_ANCHOR =
  "Cinematic photorealistic night photograph in Times Square: wet asphalt, " +
  "towering LED boards, taxi light, a crowd in open shade under the screens. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses. " +
  "Natural skin, no rain. Keep the hero screen in the center band with quieter " +
  "edges for later overlays. Aside from one Super Patch mark, every screen and " +
  "sign is a blank glow or abstract color field — no readable characters.";

export const TOKYO_BILLBOARD_STYLE_ANCHOR =
  "Cinematic photorealistic dusk photograph in downtown Tokyo: a wet stone avenue, " +
  "glass towers, giant LED billboards, cobalt sky, crimson and amber city glow. " +
  "Shot like a premium Apple x Nike commercial on anamorphic lenses. Lived-in adult skin " +
  "with pores and laugh lines. No beige lobby. Keep the hero boards in the center band " +
  "with quieter edges for later overlays. Aside from the attached press-row marks, " +
  "every other board is an abstract color field.";

export const CREATOR_STREET_STYLE_ANCHOR =
  "Documentary photograph shot on a real 35mm camera in late-morning sun: a live taping in a bright loft, one creator facing a camera on a tripod, a crowd watching, mixed everyday clothing. Candid, not a red carpet, not a fashion campaign, not a movie star, not a concert. Lived-in adult skin — visible pores, laugh lines, uneven tone, a stray blemish. Phones and camera screens show blank glass. Keep the creator, the camera, and the nearest fans in the center band with quieter edges for later overlays.";

export const NFL_STADIUM_STYLE_ANCHOR =
  "Cinematic photorealistic dusk photograph in an NFL football stadium: packed stands as soft bokeh, green turf, stadium lights, a sharp scoreboard. Shot like a premium Apple x Nike commercial on anamorphic lenses. Lived-in adult skin with pores and laugh lines. Keep the scoreboard in the center band with quieter edges for later overlays. Aside from the Super Patch mark on that one scoreboard, every other screen is a blank glow.";

export const CHIP_PRESS_MARK_LOCK =
  "The attached still is the exact press row. Place those exact outlet marks huge and bold on giant LED billboards — filling the boards, readable from the street. Keep every mark from the attached still. Do not invent other outlet marks. Do not shrink them onto a small plaque. Other boards stay abstract color fields.";

export const CHIP_BRAND_MARK_LOCK =
  "One giant screen may show only the Super Patch mark from the attached brand still. " +
  "Every other screen, sign, taxi ad, and storefront is a blank glow or abstract color field. " +
  "No other brand marks. Soft ambient cinematic audio bed only — no dialogue, no voiceover, no speech.";

/** Concert stadium stage screens may carry the Super Patch mark on each LED panel. */
export const CHIP_STAGE_SCREEN_MARK_LOCK =
  "The attached brand still is the exact Super Patch mark — rounded-square S icon and SUPER PATCH wordmark. " +
  "Place that exact mark large and sharp on every blank stage LED screen in the scene: the main backdrop, " +
  "the side stage screen, and the overhead ribbon. Render the mark light or white on the blue screens so it reads cleanly. " +
  "Do not invent other brand marks. Soft ambient cinematic audio bed only — no dialogue, no voiceover, no speech.";

export const CHIP_PRODUCT_PACK_LOCK =
  "The first attached image is the official Super Patch Freedom retail pouch. " +
  "Generate one photograph of the man holding that exact unaltered pouch. " +
  "Do not redraw, restyle, recolor, warp, or invent new lettering. " +
  "Keep every printed mark, hang-hole, and footer icon exactly as in the official pouch. " +
  "Do not alter the package in any way. Do not paste or overlay the pouch after generation.";

/** 9:16 of the approved product still — keep that photo, do not generate a new pouch. */
export const CHIP_PRODUCT_PACK_RECOMPOSE_LOCK =
  "The attached photograph is the approved scene. Keep the exact same man, white shirt, one-hand pinch, and exact Freedom pouch. Do not redraw, restyle, or replace the pouch. Do not add a second hand. Do not pull the pouch to the chest. The man stands fully on the sidewalk — torso continues into legs and shoes. Do not cut him off at the waist. Do not float him as a cutout. Extend the street and sky above and below so the same photograph fills a tall frame.";

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
    ...(spec.style ? [SKIN_REALISM_LOCK] : []),
    `Accent lighting: ${spec.accent}.`,
    subject,
    "Match the palette, lighting mood, and reflections of the reference images exactly.",
    spec.allowProductPack
      ? CHIP_PRODUCT_PACK_LOCK
      : spec.allowStageScreenMarks
        ? CHIP_STAGE_SCREEN_MARK_LOCK
        : spec.allowBrandMark
          ? CHIP_BRAND_MARK_LOCK
          : spec.allowPressMarks
            ? CHIP_PRESS_MARK_LOCK
            : OMNI_TEXT_BAN,
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
    "no black bars, no borders, no split panels, no collage. Do not stack two photographs. Do not put a blurred skyline panel above a street panel.",
    "Extend the scene naturally above and below, keeping the hero subject in the middle band with the upper and lower areas quieter and softer.",
    SKIN_REALISM_LOCK,
    spec.allowProductPack
      ? CHIP_PRODUCT_PACK_RECOMPOSE_LOCK
      : spec.allowStageScreenMarks
        ? CHIP_STAGE_SCREEN_MARK_LOCK
        : spec.allowBrandMark
          ? CHIP_BRAND_MARK_LOCK
          : spec.allowPressMarks
            ? CHIP_PRESS_MARK_LOCK
            : OMNI_TEXT_BAN,
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

/** Remove the brown fill behind a composited Freedom pouch. Keep the photograph and pack. */
export function buildProductPackHealPrompt(): string {
  return [
    "The first attached photograph is the scene. Keep the person, pose, clothing, city, lighting, and composition identical.",
    "Remove only the brown rectangular panel behind and around the pouch.",
    "Fill that area with the subject's jacket, hands, and the street so the pouch sits naturally in the hands.",
    "Keep the exact pouch. Do not redraw, restyle, recolor, or invent new lettering.",
    "The second attached image is the exact pouch if the print must be restored.",
  ].join(" ");
}

/** Close the pinch around the pouch already in the scene. Keep the photograph. */
export function buildProductPackGripEditPrompt(): string {
  return [
    "The attached photograph is the scene. Keep the man, face, hair, clothes, city, lighting, and the Freedom pouch identical.",
    "Do not redraw the pouch. Do not alter the package in any way.",
    "Only change the right hand: slide the thumb and forefinger down so they clamp the top edge of the pouch.",
    "The thumb pad and forefinger pad both press on the pouch. The pouch hangs from that pinch.",
    "There is no air gap between the fingers and the pouch. Do not leave the fingers pinching empty air above or behind the pack.",
  ].join(" ");
}

/** Replace the held pouch with the exact Freedom pack still. Keep the photograph. */
export function buildProductPackCompositePrompt(): string {
  return [
    "The first attached photograph is the scene. Keep the person, pose, clothing, city, lighting, and composition identical.",
    "Replace only the pouch in the subject's hands with the exact second attached image.",
    "Composite that pouch as a rigid printed pack. Do not redraw, restyle, recolor, or invent new lettering.",
    "Keep every printed mark exactly as in the second image. Do not alter the package in any way.",
  ].join(" ");
}

/** Edit the compounding / trusted-by stadium still so stage screens carry the Super Patch mark. */
export function buildCompoundingScreenMarkEditPrompt(): string {
  return [
    "The first attached photograph is the scene. Keep the stadium, crowd, stage, speaker, podium, city, sky, camera, and lighting identical.",
    "The second attached image is the exact Super Patch mark — rounded-square S icon and SUPER PATCH wordmark.",
    "Place that exact mark large and sharp on every blank stage LED screen: the main backdrop behind the speaker, the side stage screen, and the overhead ribbon.",
    "Render the mark light or white on the blue screens so it is readable. Do not invent other brand marks.",
    "Do not change the crowd, speaker, or architecture.",
    CHIP_STAGE_SCREEN_MARK_LOCK,
  ].join(" ");
}

/** Edit the era opener so the composited Freedom seal reads more 3D — lighting + thickness. */
export function buildEraPatchDepthEditPrompt(): string {
  return [
    "The first attached photograph is the locked master frame — do not reframe, crop, zoom, tilt, or change camera angle.",
    "Keep the exact neon night city, wet terrace, glass rail, skyline, depth of field, and composition identical.",
    "The white rounded-square Freedom seal already in the scene must stay in the same place and size.",
    "The second attached image is the exact Freedom seal identity reference. Restore the seal face from that second image exactly: opaque white rounded square, red diamond-S and circle-X print on the exact grid, and the clear embossed fingerprint gel in the center with every ridge, highlight, and shadow identical to the second image. Do not flatten, blur, simplify, or invent new ridge patterns. Do not redraw, restyle, recolor, or invent new lettering. Ignore any watermark or black backdrop on the second image.",
    "Then add physical depth to that exact seal only: visible thickness / slight extrusion on the rounded edges, a soft bevel catching light, a thin cyan-magenta neon rim light on the top and side edges, plus a soft contact shadow and faint wet-floor reflection under the seal so it floats just above the terrace.",
    "Change nothing else in the photograph. No people, no extra products, no readable text.",
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

/** Edit the title still to erase the arm wearable and restore bare skin. */
export function buildPlateRemoveArmPatchPrompt(): string {
  return [
    "Inpaint edit only. The attached photograph is the locked master frame — do not reframe, crop, zoom, tilt, or change camera angle.",
    "Keep the exact same person, face, hair, pose, linen shirt, balcony ledge, city street, depth of field, and lighting.",
    "On the subject's left upper arm only, remove the white square adhesive patch completely — erase every edge, red mark, gel center, and any shadow the patch casts.",
    "Fill that small region with continuous natural bare skin matching the surrounding arm tone and sunlight. No bandage, sticker, square outline, or product left behind.",
    "Change zero pixels outside that arm patch region. Do not add any new object on the hands or elsewhere.",
    OMNI_TEXT_BAN,
  ].join(" ");
}

export function buildPlateRetakePrompt(spec: PlateRetakeSpec): string {
  return [
    spec.style ?? CHIP_STYLE_ANCHOR,
    ...(spec.style ? [SKIN_REALISM_LOCK] : []),
    `Accent lighting: ${spec.accent}.`,
    spec.subject,
    // Style-override retakes render without style references; the anchor
    // itself carries the look.
    ...(spec.style
      ? []
      : [
          "Match the palette, lighting mood, and reflections of the reference images exactly.",
        ]),
    spec.allowProductPack ? CHIP_PRODUCT_PACK_LOCK : OMNI_TEXT_BAN,
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
  "04-flywheel",
  "05-product",
  "06-brand",
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
  "04-flywheel",
  "05-product",
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
  "Keep every person the same person for the whole clip: same face, same gender, same clothing. " +
  "Do not re-describe the setting, lighting, or wardrobe. Refer to people as the subject or they.";

export const CHIP_EMPTY_SCENE_MOTION_LOCK =
  "Image-to-video: prompt for motion only. The attached still is the first frame. " +
  "Stay in this one scene for the entire clip. No cuts, no morph, " +
  "no jump to another place, no flashing, no warp, no mid-video scene change. " +
  "This still has no people. Do not add a person. " +
  "Only light, glass, cloth, and a slow camera. " +
  "Do not re-describe the setting or lighting.";

function isEmptySceneChip(spec: ChipImageSpec): boolean {
  return /no people/i.test(spec.subject);
}

export function buildChipMotionPrompt(
  spec: ChipImageSpec,
  next: ChipImageSpec | null,
  _prev: ChipImageSpec | null = null,
): string {
  if (spec.setting) {
    const empty = isEmptySceneChip(spec);
    return [
      "In a single continuous shot with no scene cuts. <FIRST_FRAME> Animate only the attached still.",
      empty ? CHIP_EMPTY_SCENE_MOTION_LOCK : CHIP_MOTION_ONLY_LOCK,
      `Slow, subtle motion: ${spec.motion}`,
      empty
        ? "Slow dolly or gentle handheld drift. Hold an empty room."
        : "Slow dolly or gentle handheld drift. The subject moves like a real unhurried person.",
      "Hold the same composition through the last frame. No settle warp and no morph at the end.",
      spec.allowStageScreenMarks
        ? CHIP_STAGE_SCREEN_MARK_LOCK
        : spec.allowBrandMark
          ? CHIP_BRAND_MARK_LOCK
          : spec.allowPressMarks
            ? CHIP_PRESS_MARK_LOCK
            : OMNI_TEXT_BAN,
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

  // 03b-name-stacks — same four worlds, named as Product / Branding / Income / Development
  {
    slideId: "03b-name-stacks",
    chipIndex: 0,
    slug: "product",
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
    slideId: "03b-name-stacks",
    chipIndex: 1,
    slug: "branding",
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
    slideId: "03b-name-stacks",
    chipIndex: 2,
    slug: "income",
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
    slideId: "03b-name-stacks",
    chipIndex: 3,
    slug: "development",
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

  // 04-flywheel — four unrelated daylight cameras
  {
    slideId: "04-flywheel",
    chipIndex: 0,
    slug: "products-create-customers",
    accent: "Portland stone, brick, glass, and mixed street wardrobe",
    style: LONDON_HIGH_STREET_STYLE_ANCHOR,
    setting: "A downtown London high street in late morning, outside a flagship store.",
    subject:
      "A long line of real people waiting outside a high-end flagship store on a downtown London high street. Varied different clothing — denim, olive coat, black jacket, mustard knit, burgundy scarf — each person dressed differently. The queue recedes along the Portland-stone facade. Scene palette varies: brick, plate glass, plane trees, a black cab. Store sign is a blank soft shape. Faces readable in open shade. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of a long line waiting outside a London high-street store. The queue and facade stack up the frame. Varied everyday clothing. Pale sky above.",
    motion:
      "The line shuffles forward. Someone shifts a bag. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "04-flywheel",
    chipIndex: 1,
    slug: "marketing-creates-demand",
    accent: "wet asphalt, LED boards, and one Super Patch mark",
    style: TIMES_SQUARE_STYLE_ANCHOR,
    setting: "Times Square at night, wet asphalt and towering screens.",
    allowBrandMark: true,
    subject:
      "Times Square at night from street level: a dense crowd, wet asphalt, towering screens. One giant screen shows only the Super Patch mark from the attached brand still. Every other screen is a blank glow or abstract color field. Phones are blank. Adult faces readable in the spill light. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of Times Square at night. Screens stack up the frame. One giant screen shows only the Super Patch mark. Every other screen is a blank glow.",
    motion:
      "The crowd drifts. Screen glow pulses softly. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "04-flywheel",
    chipIndex: 2,
    slug: "income-creates-opportunity",
    accent: "late-morning sun on glass, pale stone, and a departure board",
    style: DAYLIGHT_INTERIOR_STYLE_ANCHOR,
    setting: "A sunlit airport terminal hall in late morning.",
    subject:
      "A late-morning airport terminal: one traveler stands looking up at a vast departure board, carry-on at their side. The board is a field of blank glowing rows and soft destination blocks. High glass, pale stone floor, sun through the roof. Coral or cobalt wardrobe. Face readable. Exactly one head, two arms, and two legs; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of an airport terminal. The departure board stacks up the frame. One traveler looks up from the middle band, carry-on at their side.",
    motion:
      "The traveler shifts their weight, eyes on the board. Distant travelers drift. The camera holds a slow, quiet drift.",
  },
  {
    slideId: "04-flywheel",
    chipIndex: 3,
    slug: "development-creates-leaders",
    accent: "living green canopy and late-morning path light",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    setting: "A sunlit park path in late morning, pale sky above.",
    subject:
      "Two people walk a sunlit path under living-green trees: an older mentor and a younger adult mid-conversation, easy pace, faces readable in open shade. Coral or cobalt wardrobe against the green. Pale sky through the canopy. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of a mentor and a younger adult walking a sunlit park path. Living-green canopy and pale sky fill the upper frame.",
    motion:
      "They walk unhurried. Leaves stir. The camera holds a slow tracking drift.",
  },

  // 05-product — the product stack (green)
  {
    slideId: "05-product",
    chipIndex: 0,
    slug: "proprietary-technology",
    accent: "late-morning sun on glass, pale stone, and a small lock",
    style: DAYLIGHT_INTERIOR_STYLE_ANCHOR,
    setting: "A sunlit museum or lobby vitrine in late morning.",
    subject:
      "A late-morning photograph of a museum-quality glass display case: a single Super Patch rests on a pale linen plinth inside the vitrine, a small metal lock on the door. Stone floor, daylight through tall windows. The case plate is a blank soft shape. Exactly one patch, no people required. Quiet edges for later overlays.",
    portraitSubject:
      "A tall vertical photograph of a locked glass vitrine. Pale stone and window light stack above a single Super Patch on a linen plinth. A small metal lock sits on the door.",
    motion:
      "Light slides across the glass. The lock catches a glint. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "05-product",
    chipIndex: 1,
    slug: "backed-by-science",
    accent: "late-morning sun on a treadmill, pale stone, and a white coat",
    style: DAYLIGHT_INTERIOR_STYLE_ANCHOR,
    setting: "A sunlit sports-science lab in late morning.",
    subject:
      "A late-morning photograph of a sports-science lab: one adult runs on a treadmill while a second person in a white lab coat stands beside them measuring the stress-test, watching a blank unmarked monitor. Faces readable in open window light. Everyday athletic wear on the runner, mixed from the coat. The pair stays centered. Quiet edges for later overlays. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of a treadmill stress-test. Window light stacks above a runner and a person in a white lab coat measuring the readout on a blank monitor.",
    motion:
      "The runner strides. The clinician glances at the monitor. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "05-product",
    chipIndex: 2,
    slug: "many-solutions",
    accent: "late-morning sun on linen and a generous assortment of patches",
    style: DAYLIGHT_INTERIOR_STYLE_ANCHOR,
    setting: "A sunlit studio table in late morning.",
    subject:
      "A late-morning photograph of a studio table: a shallow linen tray holds a mixed variety of official Super Patches — orange, teal, gold, blue, and lime printed marks on white rounded squares, each with a clear gel center. Different designs sit together. Do not repeat one color across the tray. Daylight through a window. The tray stays centered. Quiet edges for later overlays. No people required.",
    portraitSubject:
      "A tall vertical photograph of a linen tray of mixed official Super Patches in orange, teal, gold, blue, and lime. Window light and pale plaster stack above the assortment.",
    motion:
      "Window light slides across the tray. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "05-product",
    chipIndex: 3,
    slug: "trusted-by-millions",
    accent: "late-morning sun on a packed concert stadium and a wide stage",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    setting: "A sunlit concert stadium in late morning.",
    allowStageScreenMarks: true,
    subject:
      "A late-morning photograph of a packed open-air concert stadium: the stands face a wide stage with one speaker on it, a Tony Robbins style live seminar. Everyday people in varied clothing fill the bowl, faces readable in open sun. No pouch and no wearable on anyone. Stage LED screens show the brand mark. Unmarked shirts, pale sky over the bowl. The crowd stays centered. Quiet lower-left for later overlays. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of a packed sunlit concert stadium. Pale sky and the upper bowl stack above a dense crowd facing a wide stage, one speaker, and stage screens with the brand mark. No wearable on anyone.",
    motion:
      "The crowd stirs. The speaker takes a step. The camera holds a slow, almost still drift.",
  },

  // 05b-science — diagram layer chips (same order as source art: left column, then right)
  {
    slideId: "05b-science",
    chipIndex: 0,
    slug: "vtt",
    accent: "late-morning sun on a white rounded patch and pale linen",
    style: DAYLIGHT_INTERIOR_STYLE_ANCHOR,
    setting: "A sunlit studio table in late morning.",
    subject:
      "A late-morning close photograph of one official Super Patch resting on pale linen — white rounded square with a clear gel center and a soft printed mark. No people. Quiet edges for later overlays.",
    motion:
      "Window light slides across the patch. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "05b-science",
    chipIndex: 1,
    slug: "skin",
    accent: "late-morning open shade on natural skin",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    setting: "A sunlit outdoor porch in late morning.",
    subject:
      "A late-morning close photograph of an adult forearm in open shade — natural skin, fine hair, no adhesive patch, no sticker, no product on the skin. Quiet edges for later overlays. Exactly one arm visible.",
    motion:
      "A breath moves the arm slightly. Soft daylight drifts. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "05b-science",
    chipIndex: 2,
    slug: "skin-receptors",
    accent: "cool studio light on abstract soft blue channels",
    style: DAYLIGHT_INTERIOR_STYLE_ANCHOR,
    setting: "A dark studio with a soft luminous abstract prop in late morning spill.",
    subject:
      "A late-morning studio photograph of an abstract soft blue channel form on a dark table — luminous, no readable characters, no diagrams with labels. Quiet edges for later overlays. No people.",
    motion:
      "The blue glow pulses softly. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "05b-science",
    chipIndex: 3,
    slug: "outer-layer",
    accent: "late-morning sun on thin white film and open shade",
    style: DAYLIGHT_INTERIOR_STYLE_ANCHOR,
    setting: "A sunlit studio table in late morning.",
    subject:
      "A late-morning photograph of a thin white flexible film layer held flat over pale linen, edge catching daylight. No readable print. No people. Quiet edges for later overlays.",
    motion:
      "The film edge flexes slightly. Light drifts. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "05b-science",
    chipIndex: 4,
    slug: "adhesive",
    accent: "late-morning sun on translucent medical film",
    style: DAYLIGHT_INTERIOR_STYLE_ANCHOR,
    setting: "A sunlit studio table in late morning.",
    subject:
      "A late-morning photograph of a translucent medical-grade adhesive film sheet on pale linen, soft glare on the surface. No readable print. No people. Quiet edges for later overlays.",
    motion:
      "Soft glare drifts across the film. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "05b-science",
    chipIndex: 5,
    slug: "signal-travel",
    accent: "cyan light trails on a dark reflective surface",
    style: DAYLIGHT_INTERIOR_STYLE_ANCHOR,
    setting: "A dark reflective studio surface with soft cyan light trails.",
    subject:
      "A late-morning studio photograph of soft cyan light trails moving across a dark reflective floor — abstract signal paths, no readable characters, no interface panels. Quiet edges for later overlays. No people.",
    motion:
      "Light trails drift slowly. The camera holds a slow, almost still orbit.",
  },

  // 06-brand — the brand engine (blue)
  {
    slideId: "06-brand",
    chipIndex: 0,
    slug: "global-media",
    accent: "dusk cobalt, crimson, and amber on giant Tokyo boards",
    style: TOKYO_BILLBOARD_STYLE_ANCHOR,
    setting: "A dusk avenue in downtown Tokyo.",
    allowPressMarks: true,
    subject:
      "A dusk photograph at the Shibuya scramble in downtown Tokyo: giant LED billboards tower over wet crossing paint and carry one huge bold press row of outlet marks. Japanese street lamps. Not a New York plaza. One adult in mixed everyday clothing stands in the street for scale, face readable in open city light. The boards stay centered. Quiet edges for later overlays. Exactly one head, two arms, and two legs; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of dusk downtown Tokyo. Giant LED billboards stack above a wet avenue and one adult, the press row of outlet marks filling the boards.",
    motion:
      "Board light breathes. The subject shifts. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "06-brand",
    chipIndex: 1,
    slug: "top-creators",
    accent: "late-morning sun on a loft, a camera, and a watching crowd",
    style: CREATOR_STREET_STYLE_ANCHOR,
    setting: "A sunlit loft during a live taping in late morning.",
    subject:
      "A late-morning photograph of a live taping in a sunlit loft: one adult in everyday athleisure talks toward a camera on a tripod while a dense crowd of fans watches, some raising phones. Phone glass and camera screens stay blank. Faces readable and lived-in, unrecognizable, not a movie star. Not a concert hall and not a sports stadium. The creator, the camera, and the nearest fans stay centered. Quiet edges for later overlays. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of a sunlit loft live taping. Pale windows and ceiling stack above one adult in everyday athleisure, a camera on a tripod, and a watching crowd with phones.",
    motion:
      "The creator gestures. Fans lift phones. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "06-brand",
    chipIndex: 2,
    slug: "retail-digital",
    accent: "late-morning sun on a high-street storefront and pale stone",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    setting: "A sunlit high street in late morning.",
    subject:
      "A late-morning photograph of a sunlit high-street flagship storefront: the open shopfront fills the center, people walk in through the doors, windows blank soft glass. Mixed everyday clothing, faces readable in open shade. Quiet edges for later overlays. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of a high-street storefront. Pale stone and sky stack above people walking into the shop.",
    motion:
      "People walk in. A door swings. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "06-brand",
    chipIndex: 3,
    slug: "healthcare-professionals",
    accent: "late-morning sun on a clinic, pale stone, and a white coat",
    style: DAYLIGHT_INTERIOR_STYLE_ANCHOR,
    setting: "A sunlit clinic in late morning.",
    subject:
      "A late-morning photograph of a clinic consult: a practitioner in a white coat sits with a patient, both faces readable in open window light. No pouch and no wearable on anyone. Blank unmarked boards. The pair stays centered. Quiet edges for later overlays. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of a clinic consult. Window light stacks above a white coat and a patient.",
    motion:
      "The practitioner leans in. The patient nods. The camera holds a slow, almost still drift.",
  },
  {
    slideId: "06-brand",
    chipIndex: 4,
    slug: "pro-sports",
    accent: "stadium lights on a sharp scoreboard, green turf, and a packed bowl",
    style: NFL_STADIUM_STYLE_ANCHOR,
    setting: "A packed NFL stadium at dusk.",
    allowBrandMark: true,
    subject:
      "A dusk photograph of an NFL football stadium during a live American football game: packed stands and the play on the field are soft and blurred. One giant scoreboard is sharp in the center and shows the Super Patch mark. Quiet edges for later overlays. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    portraitSubject:
      "A tall vertical photograph of a packed NFL stadium at dusk. Stadium lights and the upper bowl stack above a sharp scoreboard with the Super Patch mark; the game and crowd stay soft.",
    motion:
      "The crowd stirs as a soft blur. Scoreboard light holds. The camera holds a slow, almost still drift.",
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
      "A sunlit late-morning photograph of one person standing at a wide window or open terrace, looking out over an airy city of pale stone and glass. Warm skin, laugh lines, open shade, sleeves rolled. Both upper arms show only bare skin — absolutely no adhesive patch, no square sticker, no SuperPatch, no bandage, no product on the body. The feeling is better health, greater freedom, and a bigger life ahead — one quiet human moment, not a collage. No stacked graphics and no signage.",
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
    plateFile: "sp-stack-04-flywheel.png",
    slideId: "04-flywheel",
    accent:
      "coral, cobalt, sunflower yellow, orange, and living green in late-morning plaza light",
    style: DAYLIGHT_CITY_STYLE_ANCHOR,
    subject:
      "A late-morning photograph in a sunlit European town plaza: one Catalan castell rising from a dense pinya of people who brace each other with locked arms and shoulders. The tower is mid-build — a coral-shirted column of white trousers and black sashes climbing a living pilar, the top floor not yet placed. Other teams in the base wear cobalt, sunflower-yellow, orange, and living-green shirts so the crowd is mixed color, not one beige uniform. Stone facades, pale sky, unmarked shirts and sashes. Adult faces readable in open shade. Quiet lower-left for later type. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    motion:
      "The castell is frozen as a rigid structure. Nobody climbs. Nobody is added or removed. Do not turn a woman into a man or a man into a woman. Do not change anyone's age, face, hair, or clothing. Do not merge two people into one or split one person into two. Each person stays in the same place in the tower and pinya and keeps the same face from first frame to last. Only micro motion: a breath, a grip tighten, a tiny sway of the whole tower together. The camera holds a slow, almost still drift.",
  },
  {
    plateFile: "sp-stack-05-product.png",
    slideId: "05-product",
    accent: "late-morning sun on skin and a coral-and-white pouch",
    style: DAYLIGHT_PACK_STYLE_ANCHOR,
    allowProductPack: true,
    subject:
      "A late-morning photograph of one man holding a Super Patch Freedom retail pouch out toward the camera with one arm outstretched. He clamps the top edge of the pouch between thumb and forefinger — the thumb pad and forefinger pad both press on the pouch, no air gap. The pouch hangs from that pinch. Do not leave the fingers pinching empty air above or behind the pack. The pouch is as long as a hand and about half as wide — a small retail pouch, not a matchbox and not a torso-sized bag. It stays well below the collarbone and does not cover the neck or face. His other arm hangs relaxed. Medium shot on a sunlit city sidewalk, face readable in open shade, mixed everyday clothing. Quiet left for later type. Exactly one head, two arms, and two legs; five fingers on every visible hand.",
    motion:
      "The subject holds the pouch steady. A breeze stirs their clothes. The camera holds a slow, almost still push-in.",
  },
  {
    plateFile: "sp-stack-06-brand.png",
    slideId: "06-brand",
    accent: "late-morning sun on skin, glass, and bounce boards",
    style: DAYLIGHT_CAMPAIGN_STYLE_ANCHOR,
    subject:
      "A late-morning photograph of a sunlit city avenue: one adult walks the center of the street while a small film crew tracks them with a cinema camera and bounce boards. Tall glass buildings hold blank soft screens. Mixed everyday clothing, faces readable in open shade. Pale sky. Quiet edges for later overlays. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    motion:
      "The subject walks. The crew tracks. The camera holds a slow, almost still drift.",
  },
  {
    plateFile: "sp-stack-08-fast-start.png",
    slideId: "08-fast-start",
    accent: "guards red paint, pale sky, and sun-sparkled asphalt",
    style: DAYLIGHT_ROAD_STYLE_ANCHOR,
    subject:
      "A low tracking photograph of a guards-red Porsche GT three coupe launching hard along a real two-lane road. The car is tack-sharp in the center of frame — wide rear haunches, fixed rear wing, forged wheels — while trees, guardrail, and roadside scenery streak into heavy horizontal motion blur. Late-morning sun flashes on the paint and windshield. Empty cabin, no driver face readable. Quiet lower band for later type. No other cars and no signage.",
    motion:
      "The car holds its line while the blurred scenery streams past. Sun sparkle slides across the body. The camera tracks alongside at matching speed.",
  },
  {
    plateFile: "sp-stack-09-team-overrides.png",
    slideId: "09-team-overrides",
    accent: "late-morning sun on rock, rope, and open shade on faces",
    style: DAYLIGHT_ALPINE_STYLE_ANCHOR,
    subject:
      "A late-morning photograph on a bright alpine ridge: one experienced guide stands at the front of a climbing rope, looking back along the line while several teammates are spaced behind them down the grade — each person clipped to the same rope, packs and helmets in mixed everyday alpine colors. Faces readable in open shade. Pale sky and distant valleys soft behind them. Quiet lower-left for later type. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    motion:
      "A breeze stirs jackets. Someone shifts weight on the rope. The camera holds a slow, almost still ridge drift.",
  },
  {
    plateFile: "sp-stack-10-unlimited-depth.png",
    slideId: "10-md-depth",
    accent: "turquoise near the surface fading to deep cobalt below",
    style: DAYLIGHT_OCEAN_DEPTH_STYLE_ANCHOR,
    subject:
      "A photograph looking straight down through clear open ocean: a few free divers hang in the bright turquoise layer near the surface while the water darkens through cobalt into soft endless depth below them — no seafloor visible. Sun shafts cut the water. Quiet side band for later type. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    motion:
      "Bubbles drift upward. A diver's fin shifts. Light shafts waver. The camera holds a slow, almost still downward drift.",
  },
  {
    plateFile: "sp-stack-11-vp-override.png",
    slideId: "11-vp-override",
    accent: "sunlit water arms, pale sand, and cobalt sea",
    style: DAYLIGHT_DELTA_STYLE_ANCHOR,
    subject:
      "An elevated late-morning aerial photograph of a real river delta: one bright main channel enters from the near edge and splits into many long water legs that fan across sandbars and marsh toward open cobalt sea. Each arm stays a real waterway — no diagram overlay. Quiet corner for later type. No people as heroes and no signage.",
    motion:
      "Sun sparkle drifts on the channels. A faint current moves through the arms. The camera holds a slow, almost still aerial drift.",
  },
  {
    plateFile: "sp-stack-12-generations.png",
    slideId: "12-generations",
    accent: "late-morning sun on wood benches and open shade on faces",
    style: DAYLIGHT_STUDIO_MENTOR_STYLE_ANCHOR,
    subject:
      "A late-morning photograph inside a sunlit craft studio: in the near midground an older master works at a wood bench with a mid-career adult; further back that mid-career adult turns to teach a younger adult at a second bench — three people, three generations of skill in one continuous room. Lived-in faces in open shade. Quiet side for later type. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    motion:
      "Hands adjust a tool. Someone leans in to show a grip. Dust motes drift in the sun shaft. The camera holds a slow, almost still push-in.",
  },
  {
    plateFile: "sp-stack-13-executive.png",
    slideId: "13-executive",
    accent: "pale dawn gold on rock and a soft city haze below",
    style: DAYLIGHT_SUMMIT_CITY_STYLE_ANCHOR,
    subject:
      "A dawn photograph of one adult standing alone near the tip of a real rocky summit, looking out over a real city skyline far below through thin morning haze under a pale sky. Warm horizon light, cool open shade on the face and jacket. Quiet lower band for later type. Exactly one head, two arms, and two legs; five fingers on every visible hand.",
    motion:
      "A breeze stirs the jacket. Thin haze drifts. The camera holds a slow, almost still push-in from behind.",
  },
  {
    plateFile: "sp-stack-19-future.png",
    slideId: "19-future",
    accent: "pale dawn gold on empty asphalt and a soft horizon",
    style: DAYLIGHT_HIGHWAY_DAWN_STYLE_ANCHOR,
    subject:
      "A dawn photograph from a low camera on an empty real highway: one lane of cool asphalt runs straight from the near edge to a soft vanishing point under a huge quiet sky, dashed lane lines racing into pale sunrise haze. No cars and no people. Quiet lower band for later type. Roadside signs stay blank soft shapes.",
    motion:
      "Thin mist drifts. Dawn light strengthens on the horizon. The camera holds a slow, almost still push down the empty lane.",
  },
  {
    plateFile: "sp-stack-15-closing.png",
    slideId: "15-closing",
    accent: "late-morning sun on an open gate and a bright path beyond",
    style: DAYLIGHT_OPEN_GATE_STYLE_ANCHOR,
    subject:
      "A late-morning photograph of a real wooden farm gate swung wide open at the near edge of frame, revealing a pale sunlit path that continues into open meadow and pale sky beyond. Empty threshold — no crowd. Quiet lower band for later type and brand lockup. No signage.",
    motion:
      "A breeze stirs grass beyond the gate. The camera holds a slow, almost still push through the open threshold.",
  },
  {
    plateFile: "sp-stack-18-different.png",
    slideId: "18-different",
    accent: "late-morning sun shafts on pale wood floorboards and open doorways",
    style: DAYLIGHT_HALLWAY_STACK_STYLE_ANCHOR,
    subject:
      "A late-morning photograph looking straight down one continuous company hallway: the same pale wood floorboards run through the whole frame while four open doorways along the corridor reveal four different worlds — a product lab bench, a brand film set with blank bounce boards, a coaching circle of adults, and a bright city window at the far end — yet it is clearly one unbroken path through one building. Lived-in faces in open shade. Quiet lower band for later type. Exactly one head, two arms, and two legs on every person; five fingers on every visible hand.",
    motion:
      "Someone shifts in a doorway. Dust motes drift in a sun shaft. The camera holds a slow, almost still push down the hallway.",
  },
];

/**
 * Existing neon-city stills whose composition already matches a title plate.
 * Paths are relative to public/concepts/.
 */
export const NEON_CITY_EXISTING_FITS: Readonly<Record<string, string>> = {
  "sp-stack-01-title.png": "neon-cityscape/16x9/01-title-greater-freedom.png",
  "sp-stack-02-world.png": "neon-cityscape/plates/sp-stack-02-world.png",
};

/**
 * Neon night-city retakes of every experience title plate.
 * Generation uses the current photoreal clean/ plate as the composition reference
 * and restyles it with NEON_CITY_STYLE_ANCHOR.
 */
export const NEON_CITY_PLATE_RETAKES: PlateRetakeSpec[] = [
  {
    plateFile: "sp-stack-00-era.png",
    slideId: "00-era",
    accent: "cyan and magenta neon on wet night glass with quieter darker left",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    subject:
      "A rain-slicked neon night-city photograph with no product and no people: wet reflective plaza or terrace looking into a cyan-magenta metropolis, soft bokeh towers, deep clean blacks. Completely empty center-right midground — leave a large open dark reflective zone for a later translucent product overlay. Quiet darker left third for later type. Architecture and light only — no patches, no stickers, no packages, no figures, no faces, no readable text.",
    motion:
      "Distant neon traffic trails drift. Wet reflections shimmer. Slow almost-still push-in.",
  },
  {
    plateFile: "sp-stack-01-title.png",
    slideId: "01-title",
    accent: "cyan and magenta neon on wet glass and night skin",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "One person stands at a wide high window or open terrace overlooking a rain-slicked neon metropolis at night. Warm skin in open neon glow, quiet edges for overlays. Same human moment as the daylight title still — better health, greater freedom, a bigger life ahead.",
    motion:
      "The subject breathes. Distant neon traffic trails drift. The camera holds a slow push-in.",
  },
  {
    plateFile: "sp-stack-00b-mission.png",
    slideId: "00b-mission",
    accent: "warm amber path lights and cyan-magenta links over a distant night city",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    skipNeonStyleLock: true,
    subject:
      "Dark void-adjacent night sky filling most of the frame: soft anonymous warm amber and soft cyan-magenta points of light — people as tiny glowing dots and path lights — linked by thin faint luminous threads into one larger constellation network floating high above a distant rain-slicked neon metropolis far below along the bottom edge only. Deep clean blacks between the lights. Completely empty of readable humans — no faces, no bodies, no silhouettes as heroes, no hands, no products, no patches, no packages, no UI charts, no dashboards, no graphs, no icons, no HUD overlays. The dots are photographic bokeh and soft path lights, not interface markers. Quiet darker left third for later type. Mission as connection at scale — one field of light over the world. Not a street-level sidewalk, not a terrace balcony, not a retail aisle, not a product hero.",
    motion:
      "Linked light points breathe softly. Faint threads shimmer. Slow almost-still drift through the constellation above the distant city.",
  },
  {
    plateFile: "sp-stack-02-world.png",
    slideId: "02-world",
    accent: "cyan highways and magenta tower glow on wet night asphalt",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "A sweeping aerial night view of a vast neon metropolis: one great avenue of glowing traffic trails splits and branches into many luminous routes through rain-slicked towers. Same branching-city story as the daylight aerial still.",
    motion:
      "Traffic streams and branches through the neon grid. Window glow drifts softly.",
  },
  {
    plateFile: "sp-stack-03-four-stacks.png",
    slideId: "03-four-stacks",
    accent: "cyan glass tower, amber dock lights, violet water reflections",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "An elevated night photograph of one glass company headquarters on a neon harbor: terrace lights, a yacht at the dock, cobalt water mirroring cyan and magenta city glow. Same harbor-campus composition as the daylight still. People stay small.",
    motion:
      "Water ripples catch neon. Small people cross the terrace. Slow elevated drift.",
  },
  {
    plateFile: "sp-stack-03b-name-stacks.png",
    slideId: "03b-name-stacks",
    accent: "four luminous floor plates stacked above an empty neon plaza",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    subject:
      "A worm's-eye night photograph from an empty rain-slicked neon plaza looking straight up: exactly four luminous architectural floor plates stacked above the camera — not three, not five — each slab edged in cyan and magenta glow with dark sky between the layers so the four floors read clearly as separate rising platforms. Completely empty — no people, no figures, no faces, no silhouettes, no text, no labels. Architecture and light only — four stacked floor plates fill the frame above. Quiet edge for later type.",
    motion:
      "Floor-edge neon pulses softly. Reflections shimmer on wet plaza stone. Slow almost-still upward drift.",
  },
  {
    plateFile: "sp-stack-04-flywheel.png",
    slideId: "04-flywheel",
    accent: "four interlocking cyan-magenta rings on wet reflective stone",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    subject:
      "A rain-slicked neon city plaza at night with no humans anywhere in frame: exactly four large interlocking glowing rings of cyan and magenta light centered on wet reflective stone — not three rings, not five — each ring linked through the others so light flows in a continuous loop. Completely empty plaza — no people, no figures, no faces, no silhouettes. Architecture and light only — four linked rings fill the center. Quiet edge for later type.",
    motion:
      "Light pulses around the rings. Reflections shimmer on wet stone. Slow almost-still orbit.",
  },
  {
    plateFile: "sp-stack-05-product.png",
    slideId: "05-product",
    accent: "coral pouch catching cyan street neon and magenta bokeh",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "One man on a rain-slicked neon city sidewalk holds a small retail pouch out toward camera with one arm outstretched, pinched between thumb and forefinger. Medium shot, face readable in neon open shade. Same pouch-hold beat as the daylight product still. Quiet left for type.",
    motion:
      "He holds steady. Neon rain shimmer drifts on the asphalt. Slow push-in.",
  },
  {
    plateFile: "sp-stack-05b-science.png",
    slideId: "05b-science",
    accent: "cyan-magenta hologram glow against deep black with thin neon edge light",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    allowScienceDiagram: true,
    extraRefs: ["concepts/refs/science-behind-the-patch.png"],
    subject:
      "Deep black void stage only — no city, no skyline, no buildings, no windows, no glass walls, no atrium, no room architecture, no daylight. Soft volumetric darkness with a few thin cyan and magenta neon rim accents that suggest depth without forming architecture. Centered floating luminous hologram of the exploded science stack only: white patterned patch over translucent adhesive over detailed skin cross-section over glowing blue signal layer. Dark wet floor mirrors the hologram glow only, not a city. No labels, no leader lines, no titles, no paragraphs, no callouts, no readable text anywhere. Completely empty — no people, no figures, no faces, no silhouettes, no furniture. Quiet edge for later type.",
    motion:
      "Hologram light pulses softly. Neon edge highlights breathe. Slow almost-still void drift.",
  },
  {
    plateFile: "sp-stack-05c-market.png",
    slideId: "05c-market",
    accent: "cyan and magenta shelf glow along a wet reflective aisle floor",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    skipNeonStyleLock: true,
    neonRetailInterior: true,
    subject:
      "Standing in the center of an infinite neon wellness retail aisle at night looking straight down the corridor: soft anonymous product shapes on shelves left and right vanish into cyan and magenta haze at the far vanishing point, wet reflective floor mirroring the glow. No readable packs, no labels, no logos, no text, no numbers, no barcodes. Completely empty of people, faces, and shopping carts in the foreground. Quiet darker left third of empty aisle floor and soft bokeh for later type. Interior aisle only — not a city plaza, not Earth from orbit, not a terrace.",
    motion:
      "Shelf glow breathes softly. Floor reflections shimmer. Slow almost-still push down the aisle.",
  },
  // 06-brand left alone — global media / press-logo Tokyo still stays as-is.
  {
    plateFile: "sp-stack-07-development.png",
    slideId: "07-development",
    accent: "cyan walkway neon and warm amber on mentor and mentee faces",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "Two adults walk toward camera on a neon-city pedestrian walkway at night — an older mentor in conversation with a younger adult — trees and glass towers glowing with cyan and magenta. Same mentorship walk composition as the daylight development still.",
    motion:
      "They walk and talk. Neon bokeh drifts behind them. Slow almost-still push.",
  },
  {
    plateFile: "sp-stack-06-ten-layers.png",
    slideId: "08-ten-layers",
    accent: "amber terminal boards and cyan glass night beyond",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "A woman walks toward camera through a vast night transit terminal, pulling a rolling suitcase, with glowing blank information boards above and neon city light through floor-to-ceiling glass. Same traveler-in-terminal composition as the daylight ten-layers still.",
    motion:
      "She walks forward. Board glow pulses softly. Slow push-in.",
  },
  {
    plateFile: "sp-stack-07-retail.png",
    slideId: "07-retail",
    accent: "magenta storefront neon and cyan puddle reflections",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "A long single-file queue of everyday people waits outside a modern storefront on a rain-slicked neon city street at night, glass windows glowing, wet sidewalk mirroring cyan and magenta. Same retail-queue composition as the daylight street still.",
    motion:
      "Someone shifts weight. Neon reflections shimmer. Slow sidewalk drift.",
  },
  {
    plateFile: "sp-stack-08-fast-start.png",
    slideId: "08-fast-start",
    accent: "guards-red paint under cyan neon and amber street glow",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "A low tracking night photograph of a guards-red sports coupe launching along a wet neon city road — sharp car, heavy motion-blurred neon scenery and light trails. Same speed-car composition as the daylight road still. Empty cabin, no readable plates.",
    motion:
      "The car holds its line while neon scenery streams past.",
  },
  {
    plateFile: "sp-stack-09-team-overrides.png",
    slideId: "09-team-overrides",
    accent: "cyan and magenta light trails climbing empty neon escalators",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    subject:
      "An empty multi-level neon transit atrium at night photographed with no humans anywhere in frame: several escalators on stacked floors, completely deserted, with soft luminous light trails flowing upward along the steps and glass sides. Wet reflective floors mirror cyan and magenta glow. Quiet lower band for later type. Architecture and light only — absolutely empty, no figures, no faces, no silhouettes, no uniforms, no pedestrians.",
    motion:
      "Light trails climb the escalators. Reflections shimmer. Slow elevated drift.",
  },
  {
    plateFile: "sp-stack-10-unlimited-depth.png",
    slideId: "10-md-depth",
    accent: "cyan and magenta rings descending into soft black",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    subject:
      "Looking straight down an empty neon spiral parking ramp at night: wet concrete rings and glowing cyan-magenta rail light tighten toward a dark center that never resolves into a floor. No cars, no people, no figures. Architecture and light only — unlimited depth, quiet edge for later type.",
    motion:
      "Reflections shimmer on the wet rings. Soft haze drifts in the center. Slow downward drift.",
  },
  {
    plateFile: "sp-stack-11-vp-override.png",
    slideId: "11-vp-override",
    accent: "one cyan highway branching into many magenta traffic legs",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "An elevated night aerial of a neon metropolis: one bright main traffic channel enters from the near edge and splits into many glowing road legs that fan across the rain-slicked city toward the horizon. Same branching-from-one composition as the daylight delta still — now as neon highways.",
    motion:
      "Traffic light trails flow through the arms. Slow aerial drift.",
  },
  {
    plateFile: "sp-stack-12-generations.png",
    slideId: "12-generations",
    accent: "three distinct cyan-magenta corridor echoes in wet glass",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    subject:
      "An empty neon city corridor at night with facing glass creating three clear echoed copies of the same hallway stretching back — distinctly three beats, not infinite. Wet reflective floor, cyan and magenta edge glow, no people, no figures, no faces. Architecture and light only. Quiet lower band for later type.",
    motion:
      "Glass reflections shimmer. Soft haze drifts between the three echoes. Slow push down the corridor.",
  },
  {
    plateFile: "sp-stack-13-executive.png",
    slideId: "13-executive",
    accent: "bright crown glow above quieter cyan-magenta tower floors",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    subject:
      "Looking up a tall neon skyscraper at night: quieter mid floors, then a brilliant glowing crown or antenna deck at the top brighter than everything below. Rain-slicked reflections on nearby glass. No people, no figures, no faces. Architecture and light only — the crown is the hero. Quiet edge for later type.",
    motion:
      "Crown light pulses softly. Rain streaks glass. Slow upward drift.",
  },
  {
    plateFile: "sp-stack-14-global-pool.png",
    slideId: "14-global",
    accent: "cyan magenta and amber arcs linking glowing city nodes on night Earth",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "Night Earth from orbit with dense neon city lights on the surface and thin luminous arcs linking glowing metropolitan nodes across continents. Same global-network composition as the current Earth still, intensified as neon cityscape from space.",
    motion:
      "Arcs pulse softly. City lights shimmer. Slow orbital drift.",
  },
  {
    plateFile: "sp-stack-17-compounding.png",
    slideId: "17-compounding",
    accent: "stadium LED glow cyan magenta amber against a neon skyline",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "A packed outdoor stadium at night inside a neon city: curved seating, a speaker on stage, blank glowing LED boards, and a neon skyline beyond the bowl. Same summit-crowd composition as the daylight compounding still. Screens stay abstract glow — no readable characters.",
    motion:
      "Crowd micro-motion. Board glow pulses. Slow elevated drift.",
  },
  {
    plateFile: "sp-stack-18-different.png",
    slideId: "18-different",
    accent: "neon spilling from four doorways along one dark hallway",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "Looking straight down one continuous company hallway at night: the same floor runs through the frame while four open doorways reveal different glowing neon worlds — product lab, brand set, coaching circle, city window — one unbroken path. Same hallway-of-stacks composition as the daylight still.",
    motion:
      "Someone shifts in a doorway. Neon spill drifts. Slow push down the hall.",
  },
  {
    plateFile: "sp-stack-19-future.png",
    slideId: "19-future",
    accent: "empty wet asphalt racing into distant neon horizon glow",
    style: NEON_CITY_STYLE_ANCHOR,
    subject:
      "A low camera on an empty rain-slicked highway at night: one lane runs straight to a soft vanishing point under a huge quiet sky, dashed lines racing into distant neon city haze. Same empty-road-to-horizon composition as the dawn future still. No cars and no people.",
    motion:
      "Mist drifts. Neon horizon glow strengthens. Slow push down the lane.",
  },
  {
    plateFile: "sp-stack-15-closing.png",
    slideId: "15-closing",
    accent: "dark tunnel framing a bright cyan-magenta city oval ahead",
    style: NEON_CITY_STYLE_ANCHOR,
    composeFromPhotoreal: false,
    subject:
      "Inside a dark empty neon city tunnel at night looking toward the exit: the far end opens as a bright oval of rain-slicked neon metropolis light. No people, no figures, no cars as heroes. Architecture and light only — the glowing exit is the invitation. Quiet lower band for later type and brand lockup.",
    motion:
      "Soft haze drifts in the tunnel. Neon glow at the exit holds. Slow push toward the light.",
  },
];

/** Restyle the attached photoreal plate into neon night-city while keeping the scene. */
export function buildNeonCityFromPhotorealPrompt(spec: PlateRetakeSpec): string {
  const composeFromPhotoreal = spec.composeFromPhotoreal !== false;
  const textRule = spec.allowScienceDiagram
    ? "The attached science diagram is the visual reference only — rebuild its exploded 3D stack as a luminous hologram: patch outer layer, adhesive film, skin cross-section, and blue electrical signal layer. Do not copy any titles, paragraphs, callout labels, leader lines, or readable characters from the diagram. Outside the hologram, no readable characters anywhere in the scene."
    : OMNI_TEXT_BAN;
  if (spec.allowScienceDiagram) {
    return [
      "Cinematic photorealistic dark-studio photograph: deep clean blacks, soft volumetric darkness, thin cyan and magenta neon rim accents for depth only — no city, no metropolis, no skyline, no buildings, no windows.",
      SKIN_REALISM_LOCK,
      "Compose a fresh dark void stage. The exploded science hologram is the only hero subject, centered, with quieter darker edges for later type.",
      "Do not include a city, skyline, buildings, windows, glass walls, atrium architecture, mountains, or wilderness terrain.",
      `Accent lighting: ${spec.accent}.`,
      spec.subject,
      textRule,
    ].join(" ");
  }
  if (spec.neonVoidStage) {
    return [
      "Cinematic photorealistic dark-studio photograph: deep clean blacks, soft volumetric darkness, thin cyan and magenta neon rim accents for depth only — no city, no metropolis, no skyline, no buildings, no windows, no Earth, no globe.",
      "Compose a fresh dark void stage. Keep the hero subject centered with quieter darker edges for later type.",
      "Do not include a city, skyline, plaza, road, terrace, balcony, planet, orbit, mountains, or wilderness terrain.",
      `Accent lighting: ${spec.accent}.`,
      spec.subject,
      textRule,
    ].join(" ");
  }
  if (spec.neonRetailInterior) {
    return [
      "Cinematic photorealistic neon retail interior photograph: an endless wellness aisle stretching to a vanishing point in cyan and magenta haze, wet reflective floor mirroring soft shelf glow, deep clean blacks between fixtures.",
      "Compose a fresh interior aisle. Keep quieter darker left third for later type.",
      "Do not include outdoor streets, terraces, balconies, Earth, globes, orbit, plazas, or highway roads into a skyline.",
      `Accent lighting: ${spec.accent}.`,
      spec.subject,
      textRule,
    ].join(" ");
  }
  return [
    NEON_CITY_STYLE_ANCHOR,
    SKIN_REALISM_LOCK,
    ...(composeFromPhotoreal
      ? [
          "The attached photograph is the scene example. Keep the same subject, pose, camera height, framing, and story beat.",
          "Restyle only: turn the scene into a rain-slicked neon night-city photograph — cyan, magenta, amber, and violet glows, wet reflections, deep clean blacks.",
        ]
      : [
          "Compose a fresh rain-slicked neon night-city photograph — cyan, magenta, amber, and violet glows, wet reflections, deep clean blacks.",
          "Do not include mountains, alpine ridges, snow fields, or wilderness terrain.",
        ]),
    `Accent lighting: ${spec.accent}.`,
    spec.subject,
    textRule,
  ].join(" ");
}
