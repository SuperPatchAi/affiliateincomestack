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

export type Slide = {
  id: string;
  conceptSrc: string;
  heroVideoSrc?: string;
  accent: SlideAccent;
  eyebrow: string;
  headline: string;
  body: string;
  disclosure?: string;
  flywheelArc?: FlywheelArc;
  motionPreset: string;
  requiresDisclosure: boolean;
};

export const INCOME_DISCLOSURE =
  "Income is not guaranteed. Results vary. See the Super Patch Income Disclosure.";

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
  }
}

export const SLIDES: Slide[] = [
  {
    id: "01-title",
    conceptSrc: "/concepts/sp-stack-01-title.png",
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
    conceptSrc: "/concepts/sp-stack-02-the-question.png",
    accent: "cool",
    eyebrow: "The Old Model",
    headline: "One Commission Is Not a Business",
    body: "Most affiliate programs pay a single stream and leave you hoping volume alone will work. When growth stalls, so does income. Super Patch rewards every stage of building — customers, teams, and leaders — so progress compounds instead of resetting.",
    motionPreset: "ken-burns-glow",
    requiresDisclosure: false,
  },
  {
    id: "03-four-stacks",
    conceptSrc: "/concepts/sp-stack-03-four-stacks.png",
    accent: "multi",
    eyebrow: "The Super Patch Full Stack",
    headline: "One Company. Four Stacks. Infinite Potential.",
    body: "We are building a full-stack human performance ecosystem: Product delivers outcomes, Brand & Marketing creates demand, Income opens opportunity, and Personal Development builds leaders. Each layer strengthens the others — not a catalog, a system.",
    flywheelArc: "all",
    motionPreset: "pillars-sequence",
    requiresDisclosure: false,
  },
  {
    id: "04-flywheel",
    conceptSrc: "/concepts/sp-stack-04-flywheel.png",
    accent: "multi",
    eyebrow: "The Flywheel Effect",
    headline: "Each Stack Reinforces the Others",
    body: "Better products strengthen the brand. A stronger brand accelerates customers. Greater awareness expands income. Greater income attracts leaders. Better leaders build community. Stronger communities fund innovation. The result is a self-reinforcing ecosystem built to last.",
    flywheelArc: "all",
    motionPreset: "flywheel-scrub",
    requiresDisclosure: false,
  },
  {
    id: "05-ecosystem",
    conceptSrc: "/concepts/sp-stack-05-ecosystem.png",
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
    conceptSrc: "/concepts/sp-stack-06-ten-layers.png",
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
    conceptSrc: "/concepts/sp-stack-07-retail.png",
    accent: "green",
    eyebrow: "Stack 1",
    headline: "25% Retail Affiliate Commissions",
    body: "This is where everyone begins. Every time someone purchases through your personal affiliate link, you earn a guaranteed 25% commission — paid weekly. One product or several, if they buy through your link, you earn 25% of what they pay.",
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "coin-rise",
    requiresDisclosure: true,
  },
  {
    id: "08-fast-start",
    conceptSrc: "/concepts/sp-stack-08-fast-start.png",
    accent: "orange",
    eyebrow: "Stack 2",
    headline: "Fast Start & Rank Advancement Bonuses",
    body: "Personally enroll three or more new affiliates in a month with qualifying kits and unlock Fast Start Bonuses from an additional $200 up to $2,000. As your organization hits sales milestones, Rank Advancement Bonuses can reach up to $100,000.",
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "platform-leap",
    requiresDisclosure: true,
  },
  {
    id: "09-team-overrides",
    conceptSrc: "/concepts/sp-stack-09-team-overrides.png",
    accent: "blue",
    eyebrow: "Stack 3",
    headline: "Team Override Commissions",
    body: "True residual income begins as you help others build. Earn up to 15% of Bonus Volume on Level 1, up to 10% on Level 2, and up to 4% on Levels 3, 4, and 5. There is no ceiling on organization size.",
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "root-tiers",
    requiresDisclosure: true,
  },
  {
    id: "10-md-depth",
    conceptSrc: "/concepts/sp-stack-10-unlimited-depth.png",
    accent: "violet",
    eyebrow: "Stack 4",
    headline: "Managing Director Leaders Unlimited Depth Bonus",
    body: "Once you achieve Managing Director, you begin earning an additional unlimited 2% on qualifying Bonus Volume past level 5, up to the next qualified Managing Director. Leadership unlocks another layer of recurring income that grows with your organization.",
    disclosure: INCOME_DISCLOSURE,
    flywheelArc: "income",
    motionPreset: "depth-rings",
    requiresDisclosure: true,
  },
  {
    id: "11-vp-override",
    conceptSrc: "/concepts/sp-stack-11-vp-override.png",
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
    conceptSrc: "/concepts/sp-stack-12-generations.png",
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
    conceptSrc: "/concepts/sp-stack-13-executive.png",
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
    conceptSrc: "/concepts/sp-stack-14-global-pool.png",
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
    conceptSrc: "/concepts/sp-stack-15-closing.png",
    accent: "red",
    eyebrow: "One Opportunity. Ten Income Streams.",
    headline: "Build Customers. Build Leaders. Build Leverage.",
    body: "Most affiliate programs pay one commission. Super Patch rewards every stage of building a business — from retail customers to global profit pools. Whether you want a few hundred a month or generational wealth, the Income Stack gives you multiple ways to get there.",
    flywheelArc: "all",
    motionPreset: "horizon-settle",
    requiresDisclosure: false,
  },
];
