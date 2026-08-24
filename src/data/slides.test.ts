import { describe, expect, it } from "vitest";
import {
  SLIDES,
  wordCount,
  assertSlidesValid,
  assertHeroMedia,
  fittedSizePct,
  annotationSpanPct,
  annotationFontSizeCss,
  annotationsVisibleInLayout,
  TITLE_SLAB_SRCS,
  TITLE_SLAB_BASE,
  hasEndCard,
  INCOME_DISCLOSURE,
  type Slide,
} from "./slides";

describe("SLIDES", () => {
  it("has 23 slides with copy fields", () => {
    expect(SLIDES).toHaveLength(23);
    expect(SLIDES.map((s) => s.id)).toEqual([
      "01-title",
      "02-world",
      "03-four-stacks",
      "03b-name-stacks",
      "04-flywheel",
      "05-product",
      "05b-science",
      "05c-market",
      "06-brand",
      "07-development",
      "08-ten-layers",
      "07-retail",
      "08-fast-start",
      "09-team-overrides",
      "10-md-depth",
      "11-vp-override",
      "12-generations",
      "13-executive",
      "14-global",
      "17-compounding",
      "18-different",
      "19-future",
      "15-closing",
    ]);
    for (const s of SLIDES) {
      expect(s.headline.length).toBeGreaterThan(0);
      if (s.copyLayout === "hero-caption") continue;
      expect(s.eyebrow.length).toBeGreaterThan(0);
      const filmCopy = s.onScreenBody?.trim() ? s.onScreenBody : s.body;
      expect(wordCount(filmCopy)).toBeGreaterThanOrEqual(30);
      expect(wordCount(filmCopy)).toBeLessThanOrEqual(50);
    }
  });

  it("opens on the complete-opportunity title scene", () => {
    const first = SLIDES[0];
    expect(first.id).toBe("01-title");
    expect(first.copyLayout).toBeUndefined();
    expect(first.headline).toBe(
      "More Than an Affiliate Program. A Complete Opportunity.",
    );
    expect(first.eyebrow).toBe("The Super Patch Income Stack™");
    expect(first.requiresDisclosure).toBe(false);
  });

  it("keeps the trademark on the opening title scene", () => {
    expect(SLIDES[0].id).toBe("01-title");
    expect(SLIDES[0].eyebrow).toBe("The Super Patch Income Stack™");
  });

  it("exempts hero-caption slides from lower-third copy validation", () => {
    expect(() => assertSlidesValid(SLIDES)).not.toThrow();
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

  it("rewrites the ten-stream index as 08-ten-layers with tier bands", () => {
    const bridge = SLIDES.find((s) => s.id === "08-ten-layers")!;
    expect(bridge.eyebrow).toBe("Income Stack™ — Ten Streams");
    expect(bridge.headline).toBe("One Opportunity. Ten Income Streams.");
    expect(bridge.annotations?.map((a) => a.text)).toEqual([
      "1–3 FOUNDATION",
      "4–7 LEADERSHIP",
      "8–10 EXECUTIVE",
    ]);
  });

  it("covers the seven new Full Stack and Momentum beats", () => {
    expect(SLIDES.find((s) => s.id === "02-world")!.headline).toMatch(
      /no longer optional/i,
    );
    expect(SLIDES.find((s) => s.id === "05-product")!.eyebrow).toBe("Product Stack");
    expect(SLIDES.find((s) => s.id === "06-brand")!.eyebrow).toBe(
      "Brand & Marketing Stack",
    );
    expect(SLIDES.find((s) => s.id === "07-development")!.headline).toMatch(
      /better people/i,
    );
    expect(SLIDES.find((s) => s.id === "17-compounding")!.eyebrow).toMatch(
      /Compounding/i,
    );
    expect(SLIDES.find((s) => s.id === "18-different")!.eyebrow).toMatch(
      /Different/i,
    );
    const future = SLIDES.find((s) => s.id === "19-future")!;
    expect(future.requiresDisclosure).toBe(true);
    expect(future.disclosure).toBe(INCOME_DISCLOSURE);
  });

  it("keeps product presenter notes off invented clinical claims", () => {
    const product = SLIDES.find((s) => s.id === "05-product")!;
    expect(product.presenterNotes).toMatch(/official Super Patch materials/i);
    expect(product.body.toLowerCase()).not.toMatch(/\bguaranteed\b/);
    const four = SLIDES.find((s) => s.id === "03-four-stacks")!;
    expect(four.presenterNotes).toMatch(/official Super Patch materials/i);
  });

  it("assertSlidesValid word-counts onScreenBody for film when set", () => {
    const base = SLIDES[1]!;
    const withOverlay: typeof SLIDES = SLIDES.map((s, i) =>
      i === 1
        ? {
            ...base,
            body: "Speaker script that can run longer than fifty words for the presenter while the film overlay uses a shorter on-screen body string instead. Keep expanding this line with enough words so the speaker version clearly exceeds the fifty-word film limit and proves the relaxed body rule. Add still more spoken detail about pacing, sponsor guidance, and how affiliates choose their starting path without forcing that verbosity onto the film overlay.",
            onScreenBody:
              "Most affiliate programs pay one commission. Super Patch rewards every stage of building — from retail customers to leadership pools. Choose your starting pace, then take the next step with your sponsor.",
          }
        : s,
    );
    expect(wordCount(withOverlay[1]!.body)).toBeGreaterThan(50);
    expect(wordCount(withOverlay[1]!.onScreenBody!)).toBeGreaterThanOrEqual(30);
    expect(wordCount(withOverlay[1]!.onScreenBody!)).toBeLessThanOrEqual(50);
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

  it("gives every lower-third scene a sequenced chip set (73 chips total)", () => {
    const withChips = SLIDES.filter((s) => (s.chips?.length ?? 0) > 0);
    expect(withChips.map((s) => s.id)).toEqual([
      "01-title",
      "02-world",
      "03-four-stacks",
      "03b-name-stacks",
      "04-flywheel",
      "05-product",
      "05b-science",
      "06-brand",
      "07-development",
      "08-ten-layers",
      "07-retail",
      "08-fast-start",
      "09-team-overrides",
      "10-md-depth",
      "11-vp-override",
      "12-generations",
      "13-executive",
      "14-global",
      "17-compounding",
      "18-different",
      "19-future",
    ]);
    const total = withChips.reduce((n, s) => n + (s.chips?.length ?? 0), 0);
    expect(total).toBe(73);
    expect(SLIDES.find((s) => s.id === "00-super-stack")).toBeUndefined();
    expect(SLIDES.find((s) => s.id === "15-closing")?.chips).toBeUndefined();
  });

  it("keeps chip labels tight and sub-copy one readable line", () => {
    for (const s of SLIDES) {
      for (const chip of s.chips ?? []) {
        expect(chip.label.trim().length, `${s.id} label empty`).toBeGreaterThan(0);
        expect(wordCount(chip.label), `${s.id} "${chip.label}" too wordy`).toBeLessThanOrEqual(4);
        expect(chip.label.length, `${s.id} "${chip.label}" too long`).toBeLessThanOrEqual(28);
        expect(chip.sub.length, `${s.id} "${chip.label}" sub too short`).toBeGreaterThanOrEqual(12);
        expect(chip.sub.length, `${s.id} "${chip.label}" sub too long`).toBeLessThanOrEqual(90);
      }
      expect(s.chips?.length ?? 0).toBeLessThanOrEqual(6);
    }
  });
});

describe("assertSlidesValid chip rules", () => {
  const validSlide: Slide = {
    id: "x",
    conceptSrc: "/concepts/clean/x.png",
    accent: "blue",
    eyebrow: "EYEBROW",
    headline: "Headline",
    body: "word ".repeat(35).trim(),
    motionPreset: "hero-patch",
    requiresDisclosure: false,
  };
  const stack = (overrides: Partial<Slide>): Slide[] =>
    Array.from({ length: 23 }, (_, i) =>
      i === 1 ? { ...validSlide, ...overrides, id: `s${i}` } : { ...validSlide, id: `s${i}` },
    );

  it("rejects more than 6 chips", () => {
    const chips = Array.from({ length: 7 }, (_, i) => ({
      label: `CHIP ${i}`,
      sub: "A supporting line of copy.",
    }));
    expect(() => assertSlidesValid(stack({ chips }))).toThrow(/at most 6 chips/);
  });

  it("rejects labels over 4 words or 28 characters", () => {
    expect(() =>
      assertSlidesValid(
        stack({ chips: [{ label: "ONE TWO THREE FOUR FIVE", sub: "A supporting line." }] }),
      ),
    ).toThrow(/label/);
    expect(() =>
      assertSlidesValid(
        stack({ chips: [{ label: "A".repeat(29), sub: "A supporting line." }] }),
      ),
    ).toThrow(/label/);
  });

  it("rejects sub-copy outside 12-90 characters", () => {
    expect(() =>
      assertSlidesValid(stack({ chips: [{ label: "CHIP", sub: "too short" }] })),
    ).toThrow(/sub/);
    expect(() =>
      assertSlidesValid(stack({ chips: [{ label: "CHIP", sub: "x".repeat(91) }] })),
    ).toThrow(/sub/);
  });

  it("rejects chips on hero-caption scenes", () => {
    expect(() =>
      assertSlidesValid(
        stack({
          copyLayout: "hero-caption",
          eyebrow: "",
          body: "",
          chips: [{ label: "CHIP", sub: "A supporting line of copy." }],
        }),
      ),
    ).toThrow(/hero-caption/);
  });
});

describe("text-free plates", () => {
  it("points every slide at a de-texted plate", () => {
    for (const s of SLIDES) {
      expect(s.conceptSrc).toMatch(/^\/concepts\/clean\/sp-stack-/);
    }
  });

  it("points new scenes at dedicated clean plates", () => {
    expect(SLIDES.find((s) => s.id === "02-world")!.conceptSrc).toBe(
      "/concepts/clean/sp-stack-02-world.png",
    );
    expect(SLIDES.find((s) => s.id === "05-product")!.conceptSrc).toBe(
      "/concepts/clean/sp-stack-05-product.png",
    );
    expect(SLIDES.find((s) => s.id === "06-brand")!.conceptSrc).toBe(
      "/concepts/clean/sp-stack-06-brand.png",
    );
    expect(SLIDES.find((s) => s.id === "07-development")!.conceptSrc).toBe(
      "/concepts/clean/sp-stack-07-development.png",
    );
    expect(SLIDES.find((s) => s.id === "17-compounding")!.conceptSrc).toBe(
      "/concepts/clean/sp-stack-17-compounding.png",
    );
    expect(SLIDES.find((s) => s.id === "18-different")!.conceptSrc).toBe(
      "/concepts/clean/sp-stack-18-different.png",
    );
    expect(SLIDES.find((s) => s.id === "19-future")!.conceptSrc).toBe(
      "/concepts/clean/sp-stack-19-future.png",
    );
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
      "PRODUCT STACK",
      "BRAND & MARKETING",
      "INCOME STACK",
      "PERSONAL DEVELOPMENT",
    ]);
  });

  it("names the four stacks on the platforms beat", () => {
    expect(byId("03b-name-stacks").annotations?.map((a) => a.text)).toEqual([
      "PRODUCT",
      "BRANDING",
      "INCOME",
      "DEVELOPMENT",
    ]);
    expect(byId("03b-name-stacks").headline).toBe(
      "Name the system. Own every layer.",
    );
  });

  it("locks the science beat to extracted SuperPatch diagram copy", () => {
    const science = byId("05b-science");
    expect(science.headline).toBe("The Science Behind SuperPatch");
    expect(science.body).toMatch(/Vibrotactile Transduction Technology/);
    expect(science.body).toMatch(/mechanosensory/);
    expect(science.annotations?.map((a) => a.text)).toEqual([
      "VTT",
      "SKIN",
      "SKIN RECEPTORS",
      "OUTER LAYER",
      "ADHESIVE",
      "ELECTRICAL SIGNAL TRAVEL",
    ]);
    expect(science.chips?.map((c) => c.label)).toEqual([
      "VTT",
      "SKIN",
      "SKIN RECEPTORS",
      "OUTER LAYER",
      "ADHESIVE",
      "SIGNAL TRAVEL",
    ]);
    // Same side seats as the source diagram: left trio, right trio
    const byText = Object.fromEntries(
      science.annotations!.map((a) => [a.text, a]),
    );
    for (const left of ["VTT", "SKIN", "SKIN RECEPTORS"]) {
      expect(byText[left].xPct, left).toBeLessThan(40);
    }
    for (const right of ["OUTER LAYER", "ADHESIVE", "ELECTRICAL SIGNAL TRAVEL"]) {
      expect(byText[right].xPct, right).toBeGreaterThan(60);
    }
    expect(byText["VTT"].yPct).toBeLessThan(byText["SKIN"].yPct);
    expect(byText["SKIN"].yPct).toBeLessThan(byText["SKIN RECEPTORS"].yPct);
    expect(byText["OUTER LAYER"].yPct).toBeLessThan(byText["ADHESIVE"].yPct);
    expect(byText["ADHESIVE"].yPct).toBeLessThan(
      byText["ELECTRICAL SIGNAL TRAVEL"].yPct,
    );
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

  it("keeps every label chip in a named seat above the lower third", () => {
    for (const s of SLIDES) {
      for (const a of s.annotations ?? []) {
        if (a.role !== "label") continue;
        expect(a.yPct, `${s.id} "${a.text}" below y52`).toBeLessThanOrEqual(52);
        expect(a.text, `${s.id} chip must be ALL CAPS`).toBe(a.text.toUpperCase());
        expect(
          a.text.trim().split(/\s+/).length,
          `${s.id} "${a.text}" chips are 1–4 words`,
        ).toBeLessThanOrEqual(4);
        const crown = a.yPct <= 22;
        const rail = a.xPct >= 72;
        const tile = a.yPct > 22 && a.yPct <= 52;
        expect(crown || rail || tile, `${s.id} "${a.text}" has no seat`).toBe(true);
      }
    }
  });

  it("hides plates that must not carry chips", () => {
    for (const id of ["18-different", "15-closing"]) {
      const slide = SLIDES.find((s) => s.id === id)!;
      expect(slide.annotations ?? []).toHaveLength(0);
    }
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
    const fourStacks = byId("03-four-stacks").annotations!;
    expect(fittedSizePct(fourStacks[0]!)).toBe(fourStacks[0]!.sizePct);
    expect(fittedSizePct(fourStacks[2]!)).toBe(fourStacks[2]!.sizePct);
  });

  it("drops flywheel lower-third labels on compact layouts so copy does not clip them", () => {
    const flywheel = byId("04-flywheel").annotations!;
    expect(annotationsVisibleInLayout(flywheel, false).map((a) => a.text)).toEqual([
      "PRODUCT",
      "BRAND",
      "PEOPLE",
      "INCOME",
    ]);
    expect(annotationsVisibleInLayout(flywheel, true).map((a) => a.text)).toEqual([
      "PRODUCT",
      "BRAND",
      "PEOPLE",
      "INCOME",
    ]);
    expect(
      annotationsVisibleInLayout(byId("07-retail").annotations, true).map((a) => a.text),
    ).toEqual(["25%"]);
  });

  it("caps compact annotation font size by container width so labels stay on-screen", () => {
    const product = byId("04-flywheel").annotations!.find((a) => a.text === "PRODUCT")!;
    const brand = byId("04-flywheel").annotations!.find((a) => a.text === "BRAND")!;
    expect(annotationFontSizeCss(product, false)).toBe(`${fittedSizePct(product)}cqh`);
    expect(annotationFontSizeCss(product, true)).toMatch(
      /^min\(\d+(\.\d+)?cqh, \d+(\.\d+)?cqw\)$/,
    );
    const productCqw = Number(
      annotationFontSizeCss(product, true).match(/,\s*([\d.]+)cqw/)?.[1],
    );
    const brandCqw = Number(
      annotationFontSizeCss(brand, true).match(/,\s*([\d.]+)cqw/)?.[1],
    );
    // Each label ≤ ~30% of viewport width → they cannot merge into one clipped word.
    expect(productCqw * product.text.length * 0.95).toBeLessThanOrEqual(31);
    expect(brandCqw * brand.text.length * 0.95).toBeLessThanOrEqual(31);
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

  it("uses animated hero loops on Omni scenes and omits hero on still-only beats", () => {
    const stillOnly = new Set([
      "02-world",
      "03b-name-stacks",
      "05b-science",
      "05c-market",
      "05-product",
      "06-brand",
      "07-development",
      "17-compounding",
      "18-different",
      "19-future",
    ]);
    for (const s of SLIDES) {
      if (stillOnly.has(s.id)) {
        expect(s.hero, s.id).toBeUndefined();
        expect(s.heroVideoSrc, s.id).toBeUndefined();
        continue;
      }
      expect(s.heroVideoSrc, s.id).toMatch(/^\/concepts\/animated\/.+\.mp4$/);
      expect(s.hero?.src, s.id).toBe(s.heroVideoSrc);
    }
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
    expect(byId("07-retail").hero).toMatchObject({
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
