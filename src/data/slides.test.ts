import { describe, expect, it } from "vitest";
import {
  SLIDES,
  wordCount,
  assertSlidesValid,
  fittedSizePct,
  annotationSpanPct,
  TITLE_SLAB_SRCS,
  TITLE_SLAB_BASE,
} from "./slides";

describe("SLIDES", () => {
  it("has 15 slides with copy fields", () => {
    expect(SLIDES).toHaveLength(15);
    for (const s of SLIDES) {
      expect(s.eyebrow.length).toBeGreaterThan(0);
      expect(s.headline.length).toBeGreaterThan(0);
      const filmCopy = s.onScreenBody?.trim() ? s.onScreenBody : s.body;
      expect(wordCount(filmCopy)).toBeGreaterThanOrEqual(30);
      expect(wordCount(filmCopy)).toBeLessThanOrEqual(50);
    }
  });

  it("requires disclosure on money slides 07-14", () => {
    const money = SLIDES.filter((s) => s.requiresDisclosure);
    expect(money.length).toBeGreaterThanOrEqual(8);
    for (const s of money) {
      expect(s.disclosure && s.disclosure.length).toBeGreaterThan(10);
    }
  });

  it("requires disclosure on closing when income outcomes are mentioned", () => {
    const close = SLIDES.find((s) => s.id === "15-closing")!;
    expect(close.requiresDisclosure).toBe(true);
    expect(close.disclosure?.length).toBeGreaterThan(10);
  });

  it("avoids unqualified guaranteed-earnings language on retail", () => {
    const retail = SLIDES.find((s) => s.id === "07-retail")!;
    expect(retail.body.toLowerCase()).not.toMatch(/\bguaranteed\b/);
  });

  it("closing exposes primary and secondary CTAs", () => {
    const close = SLIDES.find((s) => s.id === "15-closing")!;
    expect(close.ctaPrimary).toBe("Get your affiliate link");
    expect(close.ctaSecondary).toBe("Read the Income Disclosure");
  });

  it("assertSlidesValid word-counts onScreenBody for film when set", () => {
    const base = SLIDES[0]!;
    const withOverlay: typeof SLIDES = SLIDES.map((s, i) =>
      i === 0
        ? {
            ...base,
            body: "Speaker script that can run longer than fifty words for the presenter while the film overlay uses a shorter on-screen body string instead. Keep expanding this line with enough words so the speaker version clearly exceeds the fifty-word film limit and proves the relaxed body rule. Add still more spoken detail about pacing, sponsor guidance, and how affiliates choose their starting path without forcing that verbosity onto the film overlay.",
            onScreenBody:
              "Most affiliate programs pay one commission. Super Patch rewards every stage of building — from retail customers to leadership pools. Choose your starting pace, then take the next step with your sponsor.",
          }
        : s,
    );
    expect(wordCount(withOverlay[0]!.body)).toBeGreaterThan(50);
    expect(wordCount(withOverlay[0]!.onScreenBody!)).toBeGreaterThanOrEqual(30);
    expect(wordCount(withOverlay[0]!.onScreenBody!)).toBeLessThanOrEqual(50);
    expect(() => assertSlidesValid(withOverlay)).not.toThrow();
  });

  it("assertSlidesValid passes for SLIDES", () => {
    expect(() => assertSlidesValid(SLIDES)).not.toThrow();
  });
});

describe("text-free plates", () => {
  it("points every slide at a de-texted plate", () => {
    for (const s of SLIDES) {
      expect(s.conceptSrc).toMatch(/^\/concepts\/clean\/sp-stack-/);
    }
  });
});

describe("plate annotations", () => {
  const byId = (id: string) => {
    const slide = SLIDES.find((s) => s.id === id);
    if (!slide) throw new Error(`no slide ${id}`);
    return slide;
  };

  it("re-declares the four-stack pillar labels as overlay graphics", () => {
    expect(byId("03-four-stacks").annotations?.map((a) => a.text)).toEqual([
      "PRODUCT",
      "BRAND",
      "INCOME",
      "PEOPLE",
    ]);
  });

  it("re-declares the flywheel quadrant labels", () => {
    expect(byId("04-flywheel").annotations?.map((a) => a.text)).toEqual([
      "PRODUCT",
      "BRAND",
      "PEOPLE",
      "INCOME",
    ]);
  });

  it("keeps the team override tier percentages exactly as provided", () => {
    expect(byId("09-team-overrides").annotations?.map((a) => a.text)).toEqual([
      "15%",
      "10%",
      "4%",
      "4%",
      "4%",
    ]);
  });

  it("keeps display metrics for the plates that carried one", () => {
    expect(byId("07-retail").annotations?.[0]).toMatchObject({
      text: "25%",
      role: "metric",
    });
    expect(byId("08-fast-start").annotations?.[0]).toMatchObject({
      text: "$2,000",
      role: "metric",
    });
    expect(byId("10-md-depth").annotations?.[0]).toMatchObject({
      text: "2%",
      role: "metric",
    });
  });

  it("positions every annotation inside the plate", () => {
    for (const s of SLIDES) {
      for (const a of s.annotations ?? []) {
        expect(a.text.trim().length).toBeGreaterThan(0);
        expect(a.xPct).toBeGreaterThanOrEqual(0);
        expect(a.xPct).toBeLessThanOrEqual(100);
        expect(a.yPct).toBeGreaterThanOrEqual(0);
        expect(a.yPct).toBeLessThanOrEqual(100);
      }
    }
  });

  it("keeps display metrics far larger than diagram labels, as the plates had them", () => {
    const bigMetric = byId("07-retail").annotations![0].sizePct;
    const tierMetric = byId("09-team-overrides").annotations![0].sizePct;
    const pillarLabel = byId("03-four-stacks").annotations![0].sizePct;
    expect(bigMetric).toBeGreaterThan(tierMetric * 4);
    expect(tierMetric).toBeGreaterThan(pillarLabel);
  });

  it("keeps every fitted annotation inside the plate", () => {
    for (const s of SLIDES) {
      for (const a of s.annotations ?? []) {
        const span = annotationSpanPct(a);
        expect(span.x0, `${s.id} "${a.text}" overruns the left edge`).toBeGreaterThanOrEqual(0);
        expect(span.x1, `${s.id} "${a.text}" overruns the right edge`).toBeLessThanOrEqual(100);
      }
    }
  });

  it("shrinks a wide metric that would overrun the plate edge", () => {
    const wide = byId("08-fast-start").annotations!.find((a) => a.text === "$2,000")!;
    expect(fittedSizePct(wide)).toBeLessThan(wide.sizePct);
  });

  it("leaves annotations that already fit at their original size", () => {
    for (const a of byId("09-team-overrides").annotations!) {
      expect(fittedSizePct(a)).toBe(a.sizePct);
    }
    for (const a of byId("03-four-stacks").annotations!) {
      expect(fittedSizePct(a)).toBe(a.sizePct);
    }
  });

  it("rejects annotations positioned off the plate", () => {
    const broken = SLIDES.map((s) =>
      s.id === "09-team-overrides"
        ? {
            ...s,
            annotations: [
              { text: "15%", xPct: 140, yPct: 20, sizePct: 5, role: "metric" as const },
            ],
          }
        : s,
    );
    expect(() => assertSlidesValid(broken)).toThrow(/annotation/i);
  });

  it("title plate owns ten drop-in slab layers as a still fallback", () => {
    const title = SLIDES.find((s) => s.id === "01-title")!;
    expect(title.motionPreset).toBe("parallax-slabs");
    expect(TITLE_SLAB_SRCS).toHaveLength(10);
    expect(TITLE_SLAB_BASE).toContain("title-base");
  });

  it("uses operator-animated hero loops on slides 01 and 03", () => {
    expect(byId("01-title").heroVideoSrc).toBe(
      "/concepts/animated/sp-stack-01-title_animated.mp4",
    );
    expect(byId("03-four-stacks").heroVideoSrc).toBe(
      "/concepts/animated/sp-stack-03-four-stacks_animated.mp4",
    );
  });

  it("declares hero media metadata with explicit baked-label policy", () => {
    expect(byId("01-title").hero).toMatchObject({
      src: "/concepts/animated/sp-stack-01-title_animated.mp4",
      width: 1280,
      height: 720,
      annotationsBaked: false,
    });
    expect(byId("03-four-stacks").hero).toMatchObject({
      src: "/concepts/animated/sp-stack-03-four-stacks_animated.mp4",
      width: 1280,
      height: 720,
      annotationsBaked: true,
    });
  });

});
