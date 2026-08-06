import { describe, expect, it } from "vitest";
import {
  SLIDES,
  wordCount,
  assertSlidesValid,
  assertHeroMedia,
  fittedSizePct,
  annotationSpanPct,
  TITLE_SLAB_SRCS,
  TITLE_SLAB_BASE,
  hasEndCard,
  INCOME_DISCLOSURE,
  type Slide,
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

  it("rewrites slide 06 as the ten-stream index bridge", () => {
    const bridge = SLIDES.find((s) => s.id === "06-ten-layers")!;
    expect(bridge.eyebrow).toBe("Income Stack™ — Ten Streams");
    expect(bridge.headline).toBe("Ten Ways. One Path Forward.");
    expect(bridge.onScreenBody).toMatch(/Start with retail/i);
    expect(bridge.voiceover).toMatch(/one by one/i);
    expect(bridge.body.toLowerCase()).toMatch(/retail/);
    expect(bridge.body.toLowerCase()).toMatch(/global leadership pool/);
  });

  it("adds proof/objection presenter notes without inventing dollar claims", () => {
    const eco = SLIDES.find((s) => s.id === "05-ecosystem")!;
    expect(eco.onScreenBody).toMatch(/Health outcomes/i);
    expect(eco.presenterNotes).toMatch(/Do I have to recruit/i);
    expect(eco.presenterNotes).toMatch(/Income Disclosure/i);
    expect(eco.presenterNotes).not.toMatch(/\$\d/);
    const four = SLIDES.find((s) => s.id === "03-four-stacks")!;
    expect(four.presenterNotes).toMatch(/official Super Patch materials/i);
    expect(four.presenterNotes).not.toMatch(/\b\d+%\b/);
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

  it("hasEndCard requires the full CTA trio", () => {
    const close = SLIDES.find((s) => s.id === "15-closing")!;
    expect(hasEndCard(close)).toBe(true);
    expect(hasEndCard({ ...close, ctaSecondary: undefined })).toBe(false);
    expect(hasEndCard({ disclosure: INCOME_DISCLOSURE })).toBe(false);
    expect(
      hasEndCard({
        ctaPrimary: "Get your affiliate link",
        disclosure: INCOME_DISCLOSURE,
      }),
    ).toBe(false);
  });

  it("assertSlidesValid rejects incomplete CTA end-card data", () => {
    const broken = SLIDES.map((s) =>
      s.id === "15-closing"
        ? { ...s, ctaSecondary: undefined }
        : s,
    );
    expect(() => assertSlidesValid(broken)).toThrow(/incomplete end-card/i);
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

  it("uses operator-animated hero loops on slides 01, 03, and 04", () => {
    expect(byId("01-title").heroVideoSrc).toBe(
      "/concepts/animated/sp-stack-01-title_animated.mp4",
    );
    expect(byId("03-four-stacks").heroVideoSrc).toBe(
      "/concepts/animated/sp-stack-03-four-stacks_animated.mp4",
    );
    expect(byId("04-flywheel").heroVideoSrc).toBe(
      "/concepts/animated/sp-stack-04-flywheel_animated.mp4",
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
    expect(byId("04-flywheel").hero).toMatchObject({
      src: "/concepts/animated/sp-stack-04-flywheel_animated.mp4",
      width: 1920,
      height: 1080,
      annotationsBaked: false,
    });
  });

  it("flags hero media that is below 1920×1080 for new delivery", () => {
    for (const s of SLIDES) {
      if (!s.hero) continue;
      // Transitional: allow known 720p debt with explicit allowlist
      const legacyOk = new Set(["01-title", "03-four-stacks"]);
      if (legacyOk.has(s.id)) {
        expect(s.hero.height).toBeLessThan(1080); // current debt
        continue;
      }
      expect(s.hero.width).toBeGreaterThanOrEqual(1920);
      expect(s.hero.height).toBeGreaterThanOrEqual(1080);
    }
  });

  it("assertHeroMedia rejects non-allowlisted sub-1080p heroes", () => {
    const debt = byId("01-title");
    expect(() => assertHeroMedia(debt)).not.toThrow();

    const fake720: Slide = {
      ...debt,
      id: "99-new-hero",
      hero: {
        src: "/concepts/animated/fake_720.mp4",
        width: 1280,
        height: 720,
        annotationsBaked: false,
      },
    };
    expect(() => assertHeroMedia(fake720)).toThrow(/1920×1080|1080/);
  });

  it("assertHeroMedia accepts native 1080p delivery", () => {
    const ok: Slide = {
      ...byId("01-title"),
      id: "99-native-1080",
      hero: {
        src: "/concepts/animated/native_1080.mp4",
        width: 1920,
        height: 1080,
        annotationsBaked: false,
      },
    };
    expect(() => assertHeroMedia(ok)).not.toThrow();
  });

});
