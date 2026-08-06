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

export type HeroMedia = {
  src: string;
  /** Native pixel size of the source file. New assets must be 1920×1080. */
  width: number;
  height: number;
  /** True when the loop already contains diagram labels that would duplicate live overlays. */
  annotationsBaked: boolean;
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
  disclosure?: string;
  annotations?: PlateAnnotation[];
  flywheelArc?: FlywheelArc;
  motionPreset: string;
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

export function assertSlidesValid(slides: Slide[]): void {
  if (slides.length !== 15) {
    throw new Error(`Expected 15 slides, got ${slides.length}`);
  }
  for (const s of slides) {
    if (!s.eyebrow?.trim() || !s.headline?.trim() || !s.body?.trim()) {
      throw new Error(`Slide ${s.id} missing copy fields`);
    }
    const n = wordCount(s.body);
    if (n < 30 || n > 50) {
      throw new Error(`Slide ${s.id} body word count ${n} not in 30–50`);
    }
    if (s.requiresDisclosure) {
      if (!s.disclosure || s.disclosure.length < 10) {
        throw new Error(`Slide ${s.id} requires disclosure`);
      }
    }
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
  }
}

export const SLIDES: Slide[] = [
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
    headline: "10 Ways to Build Life-Changing Income",
    body: "At Super Patch, we didn't create just another affiliate program. We built an Income Stack™ — ten ways to earn as you grow. Every new activity can unlock another stream without replacing the one before it.",
    flywheelArc: "income",
    motionPreset: "parallax-slabs",
    requiresDisclosure: false,
  },
  {
    id: "02-question",
    conceptSrc: "/concepts/clean/sp-stack-02-the-question.png",
    accent: "cool",
    eyebrow: "The Old Model",
    headline: "One Commission Is Not a Business",
    body: "Most affiliate programs pay a single stream and leave you hoping volume alone will work. When growth stalls, so does income. Super Patch rewards every stage of building — customers, teams, and leaders — so progress compounds instead of resetting.",
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
    headline: "One Company. Four Stacks. Infinite Potential.",
    body: "We are building a full-stack human performance ecosystem: Product delivers outcomes, Brand & Marketing creates demand, Income opens opportunity, and Personal Development builds leaders. Each layer strengthens the others — not a catalog, a system.",
    annotations: [
      { text: "PRODUCT", xPct: 17.12, yPct: 81.15, sizePct: 4.07, role: "label" },
      { text: "BRAND", xPct: 38.44, yPct: 81.15, sizePct: 4.07, role: "label" },
      { text: "INCOME", xPct: 60.97, yPct: 81.15, sizePct: 4.07, role: "label" },
      { text: "PEOPLE", xPct: 82.85, yPct: 81.15, sizePct: 4.07, role: "label" },
    ],
    flywheelArc: "all",
    motionPreset: "pillars-sequence",
    requiresDisclosure: false,
  },
  {
    id: "04-flywheel",
    conceptSrc: "/concepts/clean/sp-stack-04-flywheel.png",
    accent: "multi",
    eyebrow: "The Flywheel Effect",
    headline: "Each Stack Reinforces the Others",
    body: "Better products strengthen the brand. A stronger brand accelerates customers. Greater awareness expands income. Greater income attracts leaders. Better leaders build community. Stronger communities fund innovation. The result is a self-reinforcing ecosystem built to last.",
    annotations: [
      { text: "PRODUCT", xPct: 20.21, yPct: 34.77, sizePct: 5.97, role: "label" },
      { text: "BRAND", xPct: 80.63, yPct: 34.72, sizePct: 5.83, role: "label" },
      { text: "PEOPLE", xPct: 19.73, yPct: 71.09, sizePct: 5.97, role: "label" },
      { text: "INCOME", xPct: 80.76, yPct: 71.14, sizePct: 5.83, role: "label" },
    ],
    flywheelArc: "all",
    motionPreset: "flywheel-scrub",
    requiresDisclosure: false,
  },
  {
    id: "05-ecosystem",
    conceptSrc: "/concepts/clean/sp-stack-05-ecosystem.png",
    accent: "violet",
    eyebrow: "Why It Compounds",
    headline: "Exponential Value Across the Ecosystem",
    body: "Rather than competing with single-product wellness companies, Super Patch connects health outcomes, economic opportunity, leadership, and community. Every major initiative should strengthen one or more stacks — the more stacks touched, the greater the long-term value.",
    flywheelArc: "all",
    motionPreset: "node-mesh",
    requiresDisclosure: false,
  },
  {
    id: "06-ten-layers",
    conceptSrc: "/concepts/clean/sp-stack-06-ten-layers.png",
    accent: "orange",
    eyebrow: "Income Stack™",
    headline: "The More Value You Create, the More Stacks Work for You",
    body: "Instead of relying on a single commission, Super Patch created multiple streams that reward sharing products, building customers, introducing affiliates, and developing leaders. Every new activity can unlock another stream — without replacing the one before it.",
    flywheelArc: "income",
    motionPreset: "exploded-layers",
    requiresDisclosure: false,
  },
  {
    id: "07-retail",
    conceptSrc: "/concepts/clean/sp-stack-07-retail.png",
    accent: "green",
    eyebrow: "Stack 1",
    headline: "25% Retail Affiliate Commissions",
    body: "This is where everyone begins. Every time someone purchases through your personal affiliate link, you earn a guaranteed 25% commission — paid weekly. One product or several, if they buy through your link, you earn 25% of what they pay.",
    annotations: [
      { text: "25%", xPct: 22.62, yPct: 45.61, sizePct: 30.65, role: "metric" },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "coin-rise",
    requiresDisclosure: true,
  },
  {
    id: "08-fast-start",
    conceptSrc: "/concepts/clean/sp-stack-08-fast-start.png",
    accent: "orange",
    eyebrow: "Stack 2",
    headline: "Fast Start & Rank Advancement Bonuses",
    body: "Personally enroll three or more new affiliates in a month with qualifying kits and unlock Fast Start Bonuses from an additional $200 up to $2,000. As your organization hits sales milestones, Rank Advancement Bonuses can reach up to $100,000.",
    annotations: [
      { text: "$2,000", xPct: 81.9, yPct: 32.47, sizePct: 28.35, role: "metric" },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "platform-leap",
    requiresDisclosure: true,
  },
  {
    id: "09-team-overrides",
    conceptSrc: "/concepts/clean/sp-stack-09-team-overrides.png",
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
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "root-tiers",
    requiresDisclosure: true,
  },
  {
    id: "10-md-depth",
    conceptSrc: "/concepts/clean/sp-stack-10-unlimited-depth.png",
    accent: "violet",
    eyebrow: "Stack 4",
    headline: "Managing Director Leaders Unlimited Depth Bonus",
    body: "Once you achieve Managing Director, you begin earning an additional unlimited 2% on qualifying Bonus Volume past level 5, up to the next qualified Managing Director. Leadership unlocks another layer of recurring income that grows with your organization.",
    annotations: [
      { text: "2%", xPct: 37.11, yPct: 13.23, sizePct: 6.1, role: "metric" },
    ],
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "depth-rings",
    requiresDisclosure: true,
  },
  {
    id: "11-vp-override",
    conceptSrc: "/concepts/clean/sp-stack-11-vp-override.png",
    accent: "blue",
    eyebrow: "Stack 5",
    headline: "Vice President Leadership Override",
    body: "As a Vice President, your leadership expands further. Instead of the Managing Director override, you earn 2% of Bonus Volume on every organizational leg down to the next qualified Vice President. The larger your organization becomes, the greater this income grows.",
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "legs-descend",
    requiresDisclosure: true,
  },
  {
    id: "12-generations",
    conceptSrc: "/concepts/clean/sp-stack-12-generations.png",
    accent: "green",
    eyebrow: "Stack 6",
    headline: "Generation Bonuses",
    body: "This is where leadership begins rewarding leadership. As a Vice President and above, you earn 3% Generation Bonuses through up to three generations of Vice Presidents within your organization. Develop leaders who develop leaders — and your income keeps expanding.",
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "development",
    motionPreset: "generation-rings",
    requiresDisclosure: true,
  },
  {
    id: "13-executive",
    conceptSrc: "/concepts/clean/sp-stack-13-executive.png",
    accent: "orange",
    eyebrow: "Stacks 7 & 8",
    headline: "Executive Leadership & CEO Leadership Bonus",
    body: "Reach Executive Leadership and earn up to an additional 2% override on Bonus Volume across your qualified affiliate organization — no preset cap. At President or Global President, earn an extra $10,000 to $20,000 every month for top-tier leadership performance.",
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "summit-reveal",
    requiresDisclosure: true,
  },
  {
    id: "14-global",
    conceptSrc: "/concepts/clean/sp-stack-14-global-pool.png",
    accent: "violet",
    eyebrow: "Stacks 9 & 10",
    headline: "Global President Override & Global Leadership Pool",
    body: "Global Presidents receive an additional 1% override on Bonus Volume throughout their qualified global organization. Qualified National Vice Presidents and above also participate in the Global 1% Leadership Pool — sharing in worldwide growth they help create.",
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "earth-arcs",
    requiresDisclosure: true,
  },
  {
    id: "15-closing",
    conceptSrc: "/concepts/clean/sp-stack-15-closing.png",
    accent: "red",
    eyebrow: "One Opportunity. Ten Income Streams.",
    headline: "Build Customers. Build Leaders. Build Leverage.",
    body: "Most affiliate programs pay one commission. Super Patch rewards every stage of building a business — from retail customers to global profit pools. Whether you want a few hundred a month or generational wealth, the Income Stack gives you multiple ways to get there.",
    flywheelArc: "all",
    motionPreset: "horizon-settle",
    requiresDisclosure: false,
  },
];
