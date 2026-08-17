export type SlideAccent =
  | "blue"
  | "green"
  | "orange"
  | "violet"
  | "multi"
  | "cool"
  | "red";

export type FlywheelArc =
  | "product"
  | "brand"
  | "income"
  | "development"
  | "all";

export type PlateAnnotationRole = "label" | "metric";

/**
 * Type that used to be baked into the concept plate. The plates are now text-free, so
 * these strings ride in the overlay layer where they can animate and re-typeset.
 * Positions are the centre of the original burned-in type, as a percent of plate size.
 */
export type PlateAnnotation = {
  text: string;
  xPct: number;
  yPct: number;
  /** Font size as a percent of plate height, matched to the original burned-in type. */
  sizePct: number;
  role: PlateAnnotationRole;
};

/** Plates are 3:2, and annotation type is sized in plate-height units. */
const PLATE_ASPECT = 1.5;
/** Keep type off the letterboxed image edge, in percent of plate width. */
const EDGE_MARGIN_PCT = 1.5;
/**
 * Approximate advance width per character, in em. Montserrat is wider than the condensed
 * face the plates were originally set in, so a metric reproduced at its original cap
 * height can overrun the plate; these values drive the fit-to-plate clamp below.
 */
const EM_PER_CHAR: Record<PlateAnnotationRole, number> = {
  label: 0.95, // includes 0.16em tracking
  metric: 0.72,
};

/**
 * Font size to actually render, in percent of plate height. Annotations are centred on
 * the original type, so a wide string can extend past the plate edge; this shrinks such
 * a string until it fits. Both the web deck and the HyperFrames film call this so the two
 * surfaces stay identical.
 */
export function fittedSizePct(a: PlateAnnotation): number {
  const halfRoomPct = Math.min(
    a.xPct - EDGE_MARGIN_PCT,
    100 - EDGE_MARGIN_PCT - a.xPct,
  );
  if (halfRoomPct <= 0) return a.sizePct;
  // Widths live in plate-width units, type in plate-height units, hence the aspect factor.
  const maxSizePct =
    (halfRoomPct * 2 * PLATE_ASPECT) / (a.text.length * EM_PER_CHAR[a.role]);
  return Math.min(a.sizePct, Number(maxSizePct.toFixed(2)));
}

/**
 * Estimated box the annotation occupies once fitted: x in percent of plate width, y in
 * percent of plate height. The film uses this to park its copy block clear of the type.
 */
export function annotationSpanPct(a: PlateAnnotation): {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
} {
  const size = fittedSizePct(a);
  const halfW = (a.text.length * size * EM_PER_CHAR[a.role]) / PLATE_ASPECT / 2;
  return {
    x0: a.xPct - halfW,
    x1: a.xPct + halfW,
    y0: a.yPct - size / 2,
    y1: a.yPct + size / 2,
  };
}

/**
 * Compact / portrait chrome owns the cinematic lower third. Annotations below this
 * Y% collide with copy + scrim and read as “cut off”, so drop them on compact layouts.
 */
export const COMPACT_ANNOTATION_MAX_Y_PCT = 58;

/** Max label/metric width budget on compact layouts, as % of container width. */
const COMPACT_MAX_WIDTH_PCT: Record<PlateAnnotationRole, number> = {
  label: 30,
  metric: 44,
};

/**
 * Font-size CSS for plate annotations. Desktop keeps height-based `cqh` (plate parity).
 * Compact also caps by `cqw` so tall phones cannot blow labels past the viewport width
 * (e.g. PRODUCT + BRAND merging into one clipped word on flywheel).
 */
export function annotationFontSizeCss(
  annotation: PlateAnnotation,
  compact: boolean,
): string {
  const heightPct = fittedSizePct(annotation);
  if (!compact) return `${heightPct}cqh`;
  const widthPct =
    COMPACT_MAX_WIDTH_PCT[annotation.role] /
    (annotation.text.length * EM_PER_CHAR[annotation.role]);
  return `min(${heightPct}cqh, ${widthPct.toFixed(2)}cqw)`;
}

export function annotationsVisibleInLayout(
  annotations: PlateAnnotation[] | undefined,
  compact: boolean,
): PlateAnnotation[] {
  const list = annotations ?? [];
  if (!compact) return list;
  return list.filter((annotation) => {
    if (annotation.yPct >= COMPACT_ANNOTATION_MAX_Y_PCT) return false;
    // Hide labels that would still be unreadably wide/tiny after the width cap.
    if (annotation.role === "label") {
      const widthPct =
        COMPACT_MAX_WIDTH_PCT.label /
        (annotation.text.length * EM_PER_CHAR.label);
      if (widthPct < 2.8) return false;
    }
    return true;
  });
}

export type HeroMedia = {
  src: string;
  /** Native pixel size of the source file. New assets must be 1920×1080. */
  width: number;
  height: number;
  /** True when the loop already contains diagram labels that would duplicate live overlays. */
  annotationsBaked: boolean;
};

/** One step of the scroll-driven chip sequence: big accent label + one-line context. */
export type SequencedChip = {
  label: string;
  sub: string;
};

export type Slide = {
  id: string;
  conceptSrc: string;
  /** @deprecated Prefer `hero`. Kept during migration if any scripts still read it. */
  heroVideoSrc?: string;
  hero?: HeroMedia;
  accent: SlideAccent;
  eyebrow: string;
  headline: string;
  body: string;
  /** If set, Remotion/web film overlay prefers this over `body`. */
  onScreenBody?: string;
  disclosure?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  voiceover?: string;
  presenterNotes?: string;
  annotations?: PlateAnnotation[];
  /** Scroll-sequenced lower-third chips; replaces the web plate-annotation overlay. */
  chips?: SequencedChip[];
  flywheelArc?: FlywheelArc;
  motionPreset: string;
  /** Scene 01 renders a centered hero caption instead of the cinematic lower third. */
  copyLayout?: "lower-third" | "hero-caption";
  requiresDisclosure: boolean;
};

/** Still plates hold 5s; operator-supplied hero loops are 10s and need the full clip. */
export const STILL_CLIP_SEC = 5;
export const HERO_CLIP_SEC = 10;

export function heroSrc(slide: Slide): string | undefined {
  return slide.hero?.src ?? slide.heroVideoSrc;
}

export function clipDurationSec(slide: Slide): number {
  return heroSrc(slide) ? HERO_CLIP_SEC : STILL_CLIP_SEC;
}

export const INCOME_DISCLOSURE =
  "Income is not guaranteed. Results vary. See the Super Patch Income Disclosure.";

/** Title plate stack: 10 coloured slabs drop in one-by-one. Paths under public/. */
export const TITLE_SLAB_BASE = "/concepts/slabs/title-base.png";
export const TITLE_SLAB_SRCS = Array.from(
  { length: 10 },
  (_, i) => `/concepts/slabs/title-slab-${String(i).padStart(2, "0")}.png`,
);

export function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** True when EndCard owns CTAs + disclosure (all three fields present). */
export function hasEndCard<
  T extends Pick<Slide, "ctaPrimary" | "ctaSecondary" | "disclosure">,
>(
  slide: T,
): slide is T & {
  ctaPrimary: string;
  ctaSecondary: string;
  disclosure: string;
} {
  return Boolean(slide.ctaPrimary && slide.ctaSecondary && slide.disclosure);
}

/**
 * Known 720p hero debt. Remove an id once its loop lands at native 1920×1080
 * (update `hero.width` / `hero.height`, then drop it from this set).
 */
export const LEGACY_720P_HERO_IDS = new Set(["01-title", "03-four-stacks"]);

/**
 * Enforce the native-1080p hero delivery contract. Legacy allowlisted slides may
 * remain below 1080 until operator re-export; all other heroes must be ≥1920×1080.
 */
export function assertHeroMedia(slide: Slide): void {
  const hero = slide.hero;
  if (!hero) return;
  if (LEGACY_720P_HERO_IDS.has(slide.id)) {
    if (hero.height >= 1080) {
      throw new Error(
        `Slide ${slide.id} is on the 720p allowlist but declares ${hero.width}×${hero.height}; remove it from LEGACY_720P_HERO_IDS`,
      );
    }
    return;
  }
  if (hero.width < 1920 || hero.height < 1080) {
    throw new Error(
      `Slide ${slide.id} hero is ${hero.width}×${hero.height}; new delivery must be ≥1920×1080 (no 720p upscale)`,
    );
  }
}

export function assertSlidesValid(slides: Slide[]): void {
  if (slides.length !== 21) {
    throw new Error(`Expected 21 slides, got ${slides.length}`);
  }
  for (const s of slides) {
    const heroCaption = s.copyLayout === "hero-caption";
    if (!s.headline?.trim()) {
      throw new Error(`Slide ${s.id} missing headline`);
    }
    if (!heroCaption) {
      if (!s.eyebrow?.trim() || !s.body?.trim()) {
        throw new Error(`Slide ${s.id} missing copy fields`);
      }
      // Film overlay word budget: prefer onScreenBody; otherwise body is the on-screen script.
      const filmCopy = s.onScreenBody?.trim() ? s.onScreenBody : s.body;
      const n = wordCount(filmCopy);
      if (n < 30 || n > 50) {
        throw new Error(
          `Slide ${s.id} ${s.onScreenBody?.trim() ? "onScreenBody" : "body"} word count ${n} not in 30–50`,
        );
      }
    }
    if (s.requiresDisclosure) {
      if (!s.disclosure || s.disclosure.length < 10) {
        throw new Error(`Slide ${s.id} requires disclosure`);
      }
    }
    // Partial CTA data would hide disclosure in CopyBlock without rendering EndCard.
    if ((s.ctaPrimary || s.ctaSecondary) && !hasEndCard(s)) {
      throw new Error(
        `Slide ${s.id} has incomplete end-card CTA trio (needs ctaPrimary, ctaSecondary, and disclosure)`,
      );
    }
    assertHeroMedia(s);
    for (const a of s.annotations ?? []) {
      if (!a.text.trim()) {
        throw new Error(`Slide ${s.id} has an empty annotation`);
      }
      const inside =
        a.xPct >= 0 && a.xPct <= 100 && a.yPct >= 0 && a.yPct <= 100;
      if (!inside) {
        throw new Error(
          `Slide ${s.id} annotation "${a.text}" sits off the plate (${a.xPct}, ${a.yPct})`,
        );
      }
      if (!(a.sizePct > 0 && a.sizePct <= 60)) {
        throw new Error(
          `Slide ${s.id} annotation "${a.text}" has unusable size ${a.sizePct}`,
        );
      }
    }
    const chips = s.chips ?? [];
    if (chips.length > 0 && s.copyLayout === "hero-caption") {
      throw new Error(`Slide ${s.id} is hero-caption and cannot carry chips`);
    }
    if (chips.length > 6) {
      throw new Error(`Slide ${s.id} has ${chips.length} chips; at most 6 chips per scene`);
    }
    for (const chip of chips) {
      const words = wordCount(chip.label);
      if (!chip.label.trim() || words < 1 || words > 4 || chip.label.length > 28) {
        throw new Error(
          `Slide ${s.id} chip label "${chip.label}" must be 1-4 words and <= 28 chars`,
        );
      }
      if (chip.sub.length < 12 || chip.sub.length > 90) {
        throw new Error(
          `Slide ${s.id} chip "${chip.label}" sub must be 12-90 chars, got ${chip.sub.length}`,
        );
      }
    }
  }
}

export type ExperienceChapterId =
  | "super-stack"
  | "full-stack"
  | "ten-income-streams"
  | "momentum"
  | "action";

export type ExperienceChapter = {
  id: ExperienceChapterId;
  label: string;
  sceneStart: number;
  sceneEnd: number;
};

/** Super Stack layout chapter groupings — scenes 01, 02–08, 09–17, 18–20, 21. */
export const EXPERIENCE_CHAPTERS: ExperienceChapter[] = [
  { id: "super-stack", label: "Super Stack", sceneStart: 0, sceneEnd: 0 },
  { id: "full-stack", label: "Full Stack", sceneStart: 1, sceneEnd: 7 },
  { id: "ten-income-streams", label: "Ten Income Streams", sceneStart: 8, sceneEnd: 16 },
  { id: "momentum", label: "Momentum", sceneStart: 17, sceneEnd: 19 },
  { id: "action", label: "Action", sceneStart: 20, sceneEnd: 20 },
];

export function chapterForSceneIndex(index: number): ExperienceChapter {
  const chapter = EXPERIENCE_CHAPTERS.find(
    (entry) => index >= entry.sceneStart && index <= entry.sceneEnd,
  );
  if (!chapter) {
    throw new Error(`No chapter for scene index ${index}`);
  }
  return chapter;
}

export function formatSceneCounter(index: number): string {
  const clamped = Math.max(0, Math.min(SLIDES.length - 1, index));
  return `${String(clamped + 1).padStart(2, "0")} / ${String(SLIDES.length).padStart(2, "0")}`;
}

export const SLIDES: Slide[] = [
  {
    id: "00-super-stack",
    conceptSrc: "/concepts/clean/sp-stack-18-different.png",
    accent: "blue",
    eyebrow: "",
    headline: "The SuperPatch Super Stack",
    body: "",
    copyLayout: "hero-caption",
    motionPreset: "hero-patch",
    requiresDisclosure: false,
  },
  {
    id: "01-title",
    conceptSrc: "/concepts/clean/sp-stack-01-title.png",
    hero: {
      src: "/concepts/animated/sp-stack-01-title_animated.mp4",
      width: 1280,
      height: 720,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-01-title_animated.mp4",
    accent: "blue",
    eyebrow: "The Super Patch Income Stack™",
    headline: "More Than an Affiliate Program. A Complete Opportunity.",
    body: "At Super Patch we did not build another affiliate program. We built a complete opportunity: better health, greater freedom, and bigger impact. One company. Four stacks. Ten income streams. Infinite potential.",
    annotations: [
      { text: "BETTER HEALTH", xPct: 22, yPct: 16, sizePct: 3.2, role: "label" },
      { text: "GREATER FREEDOM", xPct: 50, yPct: 16, sizePct: 3.2, role: "label" },
      { text: "BIGGER IMPACT", xPct: 78, yPct: 16, sizePct: 3.2, role: "label" },
    ],
    chips: [
      { label: "BETTER HEALTH", sub: "World-class wellness solutions that deliver real results." },
      { label: "GREATER FREEDOM", sub: "Ten income streams you can build at your own pace." },
      { label: "BIGGER IMPACT", sub: "A global movement of leaders building together." },
    ],
    flywheelArc: "income",
    motionPreset: "parallax-slabs",
    requiresDisclosure: false,
  },
  {
    id: "02-world",
    conceptSrc: "/concepts/clean/sp-stack-02-world.png",
    accent: "cool",
    eyebrow: "The World Has Changed",
    headline: "Multiple income streams are no longer optional.",
    body: "People want more freedom, more purpose, and more control of their future. Traditional jobs, the gig economy, the creator economy, and social commerce all point the same way: one stream is not a plan. Multiple income streams are essential.",
    annotations: [
      { text: "TRADITIONAL JOBS", xPct: 16, yPct: 18, sizePct: 3.0, role: "label" },
      { text: "GIG ECONOMY", xPct: 38, yPct: 18, sizePct: 3.0, role: "label" },
      { text: "CREATOR ECONOMY", xPct: 60, yPct: 18, sizePct: 3.0, role: "label" },
      { text: "SOCIAL COMMERCE", xPct: 82, yPct: 18, sizePct: 3.0, role: "label" },
    ],
    chips: [
      { label: "TRADITIONAL JOBS", sub: "One paycheck, capped upside, and someone else's schedule." },
      { label: "GIG ECONOMY", sub: "Flexible work proved people want control of their time." },
      { label: "CREATOR ECONOMY", sub: "Millions now earn by sharing what they love." },
      { label: "SOCIAL COMMERCE", sub: "Buying moved to feeds, stories, and trusted voices." },
    ],
    motionPreset: "ken-burns-glow",
    requiresDisclosure: false,
  },
  {
    id: "03-four-stacks",
    conceptSrc: "/concepts/clean/sp-stack-03-four-stacks.png",
    hero: {
      src: "/concepts/animated/sp-stack-03-four-stacks_animated.mp4",
      width: 1280,
      height: 720,
      annotationsBaked: true,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-03-four-stacks_animated.mp4",
    accent: "multi",
    eyebrow: "The Super Patch Full Stack",
    headline: "One Company. Four Stacks. Ten Income Streams. Infinite Potential.",
    body: "We are building a full-stack human performance ecosystem: Product delivers outcomes, Brand & Marketing creates demand, Income opens opportunity, and Personal Development builds leaders. Each layer strengthens the others — not a catalog, a system.",
    annotations: [
      { text: "PRODUCT STACK", xPct: 17.12, yPct: 48, sizePct: 3.2, role: "label" },
      { text: "BRAND & MARKETING", xPct: 38.44, yPct: 48, sizePct: 3.2, role: "label" },
      { text: "INCOME STACK", xPct: 60.97, yPct: 48, sizePct: 3.2, role: "label" },
      { text: "PERSONAL DEVELOPMENT", xPct: 82.85, yPct: 48, sizePct: 3.2, role: "label" },
    ],
    chips: [
      { label: "PRODUCT STACK", sub: "VTT patches and wellness solutions that deliver outcomes." },
      { label: "BRAND & MARKETING", sub: "Global visibility and credibility that create demand." },
      { label: "INCOME STACK", sub: "Ten streams that reward every stage of building." },
      { label: "PERSONAL DEVELOPMENT", sub: "Training and community that build leaders." },
    ],
    flywheelArc: "all",
    motionPreset: "pillars-sequence",
    requiresDisclosure: false,
    presenterNotes:
      "Product trust: point to official Super Patch materials for outcomes — do not invent clinical claims on this slide.",
  },
  {
    id: "04-flywheel",
    conceptSrc: "/concepts/clean/sp-stack-04-flywheel.png",
    hero: {
      src: "/concepts/animated/sp-stack-04-flywheel_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-04-flywheel_animated.mp4",
    accent: "multi",
    eyebrow: "Why the Full Stack Wins",
    headline: "Each Stack Reinforces the Others",
    body: "Better products strengthen the brand. A stronger brand accelerates customers. Greater awareness expands income. Greater income attracts leaders. Better leaders build community. Stronger communities fund innovation. The result is a self-reinforcing ecosystem built to last.",
    annotations: [
      { text: "PRODUCT", xPct: 20.21, yPct: 34.77, sizePct: 5.97, role: "label" },
      { text: "BRAND", xPct: 80.63, yPct: 34.72, sizePct: 5.83, role: "label" },
      { text: "PEOPLE", xPct: 19.73, yPct: 48, sizePct: 5.97, role: "label" },
      { text: "INCOME", xPct: 80.76, yPct: 48, sizePct: 5.83, role: "label" },
    ],
    chips: [
      { label: "PRODUCTS CREATE CUSTOMERS", sub: "Real results turn buyers into raving fans." },
      { label: "MARKETING CREATES DEMAND", sub: "Visibility and credibility bring customers to you." },
      { label: "INCOME CREATES OPPORTUNITY", sub: "Ten streams turn activity into earnings." },
      { label: "DEVELOPMENT CREATES LEADERS", sub: "Better people build stronger communities." },
    ],
    flywheelArc: "all",
    motionPreset: "flywheel-scrub",
    requiresDisclosure: false,
  },
  {
    id: "05-product",
    conceptSrc: "/concepts/clean/sp-stack-05-product.png",
    accent: "green",
    eyebrow: "Product Stack",
    headline: "Better products. Better results. Raving customers.",
    body: "World-class VTT™ patches and innovative wellness solutions that deliver real results. Proprietary technology, backed by science, more than fifteen targeted solutions, trusted by millions. Better products create raving customers — and customers start the Income Stack.",
    annotations: [
      { text: "PROPRIETARY TECHNOLOGY", xPct: 20, yPct: 28, sizePct: 2.8, role: "label" },
      { text: "BACKED BY SCIENCE", xPct: 20, yPct: 36, sizePct: 2.8, role: "label" },
      { text: "15+ SOLUTIONS", xPct: 20, yPct: 44, sizePct: 2.8, role: "label" },
      { text: "TRUSTED BY MILLIONS", xPct: 20, yPct: 52, sizePct: 2.8, role: "label" },
    ],
    chips: [
      { label: "PROPRIETARY TECHNOLOGY", sub: "Vibrotactile trigger technology found nowhere else." },
      { label: "BACKED BY SCIENCE", sub: "Research-driven design behind every patch." },
      { label: "15+ SOLUTIONS", sub: "Targeted patches for sleep, energy, focus, and more." },
      { label: "TRUSTED BY MILLIONS", sub: "Customers worldwide feel the difference daily." },
    ],
    flywheelArc: "product",
    motionPreset: "node-mesh",
    requiresDisclosure: false,
    presenterNotes:
      "Product trust: point to official Super Patch materials for outcomes — do not invent clinical claims on this slide.",
  },
  {
    id: "06-brand",
    conceptSrc: "/concepts/clean/sp-stack-06-brand.png",
    accent: "blue",
    eyebrow: "Brand & Marketing Stack",
    headline: "Massive visibility. Powerful credibility. Relentless momentum.",
    body: "Super Patch shows up where trust is built: global media and PR, top creators, retail and digital channels, healthcare professionals, and pro sports. Massive visibility. Powerful credibility. Relentless momentum. That visibility creates demand.",
    annotations: [
      { text: "GLOBAL MEDIA & PR", xPct: 78, yPct: 26, sizePct: 2.6, role: "label" },
      { text: "TOP CREATORS", xPct: 78, yPct: 32.5, sizePct: 2.6, role: "label" },
      { text: "RETAIL & DIGITAL", xPct: 78, yPct: 39, sizePct: 2.6, role: "label" },
      { text: "HEALTHCARE", xPct: 78, yPct: 45.5, sizePct: 2.6, role: "label" },
      { text: "PRO SPORTS", xPct: 78, yPct: 52, sizePct: 2.6, role: "label" },
    ],
    chips: [
      { label: "GLOBAL MEDIA & PR", sub: "Featured in Forbes and Medical Daily." },
      { label: "TOP CREATORS", sub: "Influencers like Mind Pump share Super Patch." },
      { label: "RETAIL & DIGITAL", sub: "Growing retail and e-commerce channels worldwide." },
      { label: "HEALTHCARE PROFESSIONALS", sub: "Recommended by practitioners on Healthgrades." },
      { label: "PRO SPORTS", sub: "Covered by SportsTech Today. Worn by elite athletes." },
    ],
    flywheelArc: "brand",
    motionPreset: "ken-burns-glow",
    requiresDisclosure: false,
  },
  {
    id: "07-development",
    conceptSrc: "/concepts/clean/sp-stack-07-development.png",
    accent: "violet",
    eyebrow: "Personal Development Stack",
    headline: "We don’t just build businesses. We build better people.",
    body: "Leadership development, sales mastery, communication skills, financial education, mindset and growth, community and support. Grow personally. Lead powerfully. Live fully. Personal development is the stack that turns customers and affiliates into leaders.",
    annotations: [
      { text: "LEADERSHIP", xPct: 50, yPct: 32, sizePct: 2.5, role: "label" },
      { text: "SALES", xPct: 28, yPct: 40, sizePct: 2.5, role: "label" },
      { text: "COMMUNICATION", xPct: 72, yPct: 40, sizePct: 2.5, role: "label" },
      { text: "FINANCE", xPct: 16, yPct: 52, sizePct: 2.5, role: "label" },
      { text: "MINDSET", xPct: 84, yPct: 52, sizePct: 2.5, role: "label" },
    ],
    chips: [
      { label: "LEADERSHIP DEVELOPMENT", sub: "Learn to lead teams that build teams." },
      { label: "SALES MASTERY", sub: "Share products with confidence and skill." },
      { label: "COMMUNICATION SKILLS", sub: "Connect, present, and persuade with clarity." },
      { label: "FINANCIAL EDUCATION", sub: "Understand, manage, and grow what you earn." },
      { label: "MINDSET & GROWTH", sub: "Build the habits of top performers." },
      { label: "COMMUNITY & SUPPORT", sub: "You never build alone at Super Patch." },
    ],
    flywheelArc: "development",
    motionPreset: "generation-rings",
    requiresDisclosure: false,
  },
  {
    id: "08-ten-layers",
    conceptSrc: "/concepts/clean/sp-stack-06-ten-layers.png",
    hero: {
      src: "/concepts/animated/sp-stack-06-ten-layers_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-06-ten-layers_animated.mp4",
    accent: "orange",
    eyebrow: "Income Stack™ — Ten Streams",
    headline: "One Opportunity. Ten Income Streams.",
    body: "On the next slides we walk ten named streams: Retail twenty-five percent, Fast Start and Rank Advancement, Team Overrides, Managing Director Depth Bonus, Vice President Override, Generation Bonuses, Executive Leadership Override, CEO Leadership Bonus, Global President Override, and the Global Leadership Pool. We start where everyone starts.",
    onScreenBody:
      "Start with retail. Stack leadership as you grow. Ten named streams follow — retail, Fast Start and ranks, team overrides, MD depth, VP override, generations, executive and CEO bonuses, then Global President override and the Global Leadership Pool.",
    voiceover: "Let's walk them one by one, starting where everyone starts.",
    annotations: [
      { text: "1–3 FOUNDATION", xPct: 78, yPct: 28, sizePct: 3.0, role: "label" },
      { text: "4–7 LEADERSHIP", xPct: 78, yPct: 40, sizePct: 3.0, role: "label" },
      { text: "8–10 EXECUTIVE", xPct: 78, yPct: 52, sizePct: 3.0, role: "label" },
    ],
    chips: [
      { label: "1-3 FOUNDATION", sub: "Retail commissions, Fast Start bonuses, and team overrides." },
      { label: "4-7 LEADERSHIP", sub: "Depth bonuses, leg overrides, and generation pay." },
      { label: "8-10 EXECUTIVE & GLOBAL", sub: "CEO bonuses, global overrides, and the leadership pool." },
    ],
    flywheelArc: "income",
    motionPreset: "exploded-layers",
    requiresDisclosure: false,
  },
  {
    id: "07-retail",
    conceptSrc: "/concepts/clean/sp-stack-07-retail.png",
    hero: {
      src: "/concepts/animated/sp-stack-07-retail_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-07-retail_animated.mp4",
    accent: "green",
    eyebrow: "Stack 1",
    headline: "25% Retail Affiliate Commissions",
    body: "This is where everyone begins. When someone buys through your personal affiliate link, you earn 25% commission on qualifying purchases — paid weekly. One product or several, if they buy through your link, you earn 25% of what they pay.",
    annotations: [
      { text: "25%", xPct: 22.62, yPct: 45.61, sizePct: 30.65, role: "metric" },
    ],
    chips: [
      { label: "25% RETAIL COMMISSIONS", sub: "Earn 25% on every sale through your link, paid weekly." },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "coin-rise",
    requiresDisclosure: true,
  },
  {
    id: "08-fast-start",
    conceptSrc: "/concepts/clean/sp-stack-08-fast-start.png",
    hero: {
      src: "/concepts/animated/sp-stack-08-fast-start_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-08-fast-start_animated.mp4",
    accent: "orange",
    eyebrow: "Stack 2",
    headline: "Fast Start & Rank Advancement Bonuses",
    body: "Personally enroll three or more new affiliates in a month with qualifying kits and unlock Fast Start Bonuses from an additional $200 up to $2,000. As your organization hits sales milestones, Rank Advancement Bonuses can reach up to $100,000.",
    annotations: [
      { text: "$2,000", xPct: 81.9, yPct: 32.47, sizePct: 28.35, role: "metric" },
    ],
    chips: [
      { label: "$200-$2,000 FAST START", sub: "Enroll three qualifying affiliates in a month to unlock." },
      { label: "UP TO $100,000 RABS", sub: "Rank Advancement Bonuses grow with your sales milestones." },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "platform-leap",
    requiresDisclosure: true,
  },
  {
    id: "09-team-overrides",
    conceptSrc: "/concepts/clean/sp-stack-09-team-overrides.png",
    hero: {
      src: "/concepts/animated/sp-stack-09-team-overrides_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-09-team-overrides_animated.mp4",
    accent: "blue",
    eyebrow: "Stack 3",
    headline: "Team Override Commissions",
    body: "True residual income begins as you help others build. Earn up to 15% of Bonus Volume on Level 1, up to 10% on Level 2, and up to 4% on Levels 3, 4, and 5. There is no ceiling on organization size.",
    annotations: [
      { text: "15%", xPct: 10.03, yPct: 25.29, sizePct: 5.15, role: "metric" },
      { text: "10%", xPct: 9.96, yPct: 41.5, sizePct: 5.15, role: "metric" },
      { text: "4%", xPct: 9.57, yPct: 56.05, sizePct: 4.61, role: "metric" },
      { text: "4%", xPct: 9.51, yPct: 68.36, sizePct: 4.88, role: "metric" },
      { text: "4%", xPct: 9.51, yPct: 78.61, sizePct: 4.88, role: "metric" },
    ],
    chips: [
      { label: "15% ON LEVEL 1", sub: "Earn up to 15% of Bonus Volume on your first level." },
      { label: "10% ON LEVEL 2", sub: "Earn up to 10% as your team helps others build." },
      { label: "4% ON LEVELS 3-5", sub: "Depth pays: up to 4% on three more levels." },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "root-tiers",
    requiresDisclosure: true,
  },
  {
    id: "10-md-depth",
    conceptSrc: "/concepts/clean/sp-stack-10-unlimited-depth.png",
    hero: {
      src: "/concepts/animated/sp-stack-10-unlimited-depth_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-10-unlimited-depth_animated.mp4",
    accent: "violet",
    eyebrow: "Stack 4",
    headline: "Managing Director Leaders Unlimited Depth Bonus",
    body: "Once you achieve Managing Director, you begin earning an additional unlimited 2% on qualifying Bonus Volume past level 5, up to the next qualified Managing Director. Leadership unlocks another layer of recurring income that grows with your organization.",
    annotations: [
      { text: "2%", xPct: 37.11, yPct: 13.23, sizePct: 6.1, role: "metric" },
    ],
    chips: [
      { label: "2% UNLIMITED DEPTH", sub: "Past level 5, down to the next qualified Managing Director." },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "depth-rings",
    requiresDisclosure: true,
  },
  {
    id: "11-vp-override",
    conceptSrc: "/concepts/clean/sp-stack-11-vp-override.png",
    hero: {
      src: "/concepts/animated/sp-stack-11-vp-override_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-11-vp-override_animated.mp4",
    accent: "blue",
    eyebrow: "Stack 5",
    headline: "Vice President Leadership Override",
    body: "As a Vice President, your leadership expands further. Instead of the Managing Director override, you earn 2% of Bonus Volume on every organizational leg down to the next qualified Vice President. The larger your organization becomes, the greater this income grows.",
    chips: [
      { label: "2% ON EVERY LEG", sub: "Every leg of your organization, down to the next VP." },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "legs-descend",
    requiresDisclosure: true,
  },
  {
    id: "12-generations",
    conceptSrc: "/concepts/clean/sp-stack-12-generations.png",
    hero: {
      src: "/concepts/animated/sp-stack-12-generations_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-12-generations_animated.mp4",
    accent: "green",
    eyebrow: "Stack 6",
    headline: "Generation Bonuses",
    body: "This is where leadership begins rewarding leadership. As a Vice President and above, you earn 3% Generation Bonuses through up to three generations of Vice Presidents within your organization. Develop leaders who develop leaders — and your income keeps expanding.",
    chips: [
      { label: "3% x 3 GENERATIONS", sub: "Leadership rewarding leadership, three VP generations deep." },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "development",
    motionPreset: "generation-rings",
    requiresDisclosure: true,
  },
  {
    id: "13-executive",
    conceptSrc: "/concepts/clean/sp-stack-13-executive.png",
    hero: {
      src: "/concepts/animated/sp-stack-13-executive_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-13-executive_animated.mp4",
    accent: "orange",
    eyebrow: "Stacks 7 & 8",
    headline: "Executive Leadership & CEO Leadership Bonus",
    body: "Reach Executive Leadership and earn up to an additional 2% override on Bonus Volume across your qualified affiliate organization — no preset cap. At President or Global President, earn an extra $10,000 to $20,000 every month for top-tier leadership performance.",
    chips: [
      { label: "2% EXECUTIVE OVERRIDE", sub: "Across your qualified organization with no preset cap." },
      { label: "$10K-$20K MONTHLY", sub: "CEO Leadership Bonus at President and Global President." },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "summit-reveal",
    requiresDisclosure: true,
  },
  {
    id: "14-global",
    conceptSrc: "/concepts/clean/sp-stack-14-global-pool.png",
    hero: {
      src: "/concepts/animated/sp-stack-14-global-pool_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-14-global-pool_animated.mp4",
    accent: "violet",
    eyebrow: "Stacks 9 & 10",
    headline: "Global President Override & Global Leadership Pool",
    body: "Global Presidents receive an additional 1% override on Bonus Volume throughout their qualified global organization. Qualified National Vice Presidents and above also participate in the Global 1% Leadership Pool — sharing in worldwide growth they help create.",
    chips: [
      { label: "1% GLOBAL OVERRIDE", sub: "On Bonus Volume across your qualified global organization." },
      { label: "GLOBAL 1% POOL", sub: "Qualified NVPs and above share in worldwide growth." },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "earth-arcs",
    requiresDisclosure: true,
  },
  {
    id: "17-compounding",
    conceptSrc: "/concepts/clean/sp-stack-17-compounding.png",
    accent: "orange",
    eyebrow: "The Power of Compounding Income",
    headline: "Every activity. Every layer. Every time.",
    body: "One customer becomes ten. Ten become more than a hundred. Customers become teams. Teams become leaders. Leaders unlock multiple income streams. The more you build, the more the Income Flywheel grows.",
    annotations: [
      { text: "ONE", xPct: 64, yPct: 46, sizePct: 2.8, role: "label" },
      { text: "100+", xPct: 76, yPct: 38, sizePct: 2.8, role: "label" },
      { text: "STREAMS", xPct: 85, yPct: 30, sizePct: 2.8, role: "label" },
    ],
    chips: [
      { label: "ONE CUSTOMER", sub: "Every stack starts with a single result." },
      { label: "TEN CUSTOMERS", sub: "Real results spread by word of mouth." },
      { label: "100+ CUSTOMERS", sub: "Momentum compounds as your base grows." },
      { label: "TEAMS", sub: "Customers become affiliates and build with you." },
      { label: "LEADERS", sub: "Teams develop leaders who develop leaders." },
      { label: "MULTIPLE INCOME STREAMS", sub: "Every layer adds a new way to earn." },
    ],
    flywheelArc: "income",
    motionPreset: "ken-burns-glow",
    requiresDisclosure: false,
  },
  {
    id: "18-different",
    conceptSrc: "/concepts/clean/sp-stack-18-different.png",
    accent: "multi",
    eyebrow: "Why Super Patch Is Different",
    headline: "A true Full Stack company",
    body: "Proven products people love. A massive brand and marketing engine. Ten ways to earn. Personal development built in. A global vision with unlimited potential. This is a full-stack company — not a single-commission catalog.",
    chips: [
      { label: "TRUE FULL STACK", sub: "Product, brand, income, and development in one company." },
      { label: "PROVEN PRODUCTS", sub: "Wellness people can feel and reorder." },
      { label: "BRAND ENGINE", sub: "Massive marketing that creates demand for you." },
      { label: "TEN WAYS TO EARN", sub: "An Income Stack, not a single commission." },
      { label: "DEVELOPMENT BUILT IN", sub: "Personal growth is part of the plan." },
      { label: "GLOBAL VISION", sub: "Unlimited potential in a worldwide movement." },
    ],
    flywheelArc: "all",
    motionPreset: "node-mesh",
    requiresDisclosure: false,
  },
  {
    id: "19-future",
    conceptSrc: "/concepts/clean/sp-stack-19-future.png",
    accent: "orange",
    eyebrow: "Imagine Your Future",
    headline: "You decide how far you go.",
    body: "Side income, income replacement, business ownership, financial freedom, or generational wealth — you choose the pace. Your future is created by the actions you take today. Income is not guaranteed. Results vary.",
    annotations: [
      { text: "SIDE", xPct: 18, yPct: 48, sizePct: 2.6, role: "label" },
      { text: "REPLACE", xPct: 34, yPct: 42, sizePct: 2.6, role: "label" },
      { text: "OWN", xPct: 50, yPct: 36, sizePct: 2.6, role: "label" },
      { text: "FREEDOM", xPct: 66, yPct: 29, sizePct: 2.6, role: "label" },
      { text: "WEALTH", xPct: 82, yPct: 22, sizePct: 2.6, role: "label" },
    ],
    chips: [
      { label: "SIDE INCOME", sub: "A few hundred a month changes the math." },
      { label: "INCOME REPLACEMENT", sub: "Stack streams until they cover your paycheck." },
      { label: "BUSINESS OWNERSHIP", sub: "Build an organization you are proud to own." },
      { label: "FINANCIAL FREEDOM", sub: "Your time becomes yours again." },
      { label: "GENERATIONAL WEALTH", sub: "Build something that outlasts you." },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "horizon-settle",
    requiresDisclosure: true,
  },
  {
    id: "15-closing",
    conceptSrc: "/concepts/clean/sp-stack-15-closing.png",
    hero: {
      src: "/concepts/animated/sp-stack-15-closing_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    },
    heroVideoSrc: "/concepts/animated/sp-stack-15-closing_animated.mp4",
    accent: "red",
    eyebrow: "Join the Movement",
    headline: "Better Health. Greater Freedom. Bigger Impact.",
    body: "We’re building the world’s leading human performance ecosystem—together. One company. Four stacks. Ten income streams. Infinite potential. Take the next step with your sponsor and begin building your stack today.",
    disclosure: INCOME_DISCLOSURE,
    ctaPrimary: "Get your affiliate link",
    ctaSecondary: "Read the Income Disclosure",
    flywheelArc: "all",
    motionPreset: "horizon-settle",
    requiresDisclosure: true,
  },
];

/** Remotion film scenes — the 3D hero-caption opener is web-only. */
export const FILM_SLIDES: Slide[] = SLIDES.filter(
  (s) => (s.copyLayout ?? "lower-third") !== "hero-caption",
);
