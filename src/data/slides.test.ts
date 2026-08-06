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
      expect(wordCount(s.body)).toBeGreaterThanOrEqual(30);
      expect(wordCount(s.body)).toBeLessThanOrEqual(50);
    }
  });

  it("requires disclosure on money slides 07-14", () => {
    const money = SLIDES.filter((s) => s.requiresDisclosure);
    expect(money.length).toBeGreaterThanOrEqual(8);
    for (const s of money) {
      expect(s.disclosure && s.disclosure.length).toBeGreaterThan(10);
    }
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

  it("title plate owns ten drop-in slab layers", () => {
    const title = SLIDES.find((s) => s.id === "01-title")!;
    expect(title.motionPreset).toBe("parallax-slabs");
    expect(TITLE_SLAB_SRCS).toHaveLength(10);
    expect(TITLE_SLAB_BASE).toContain("title-base");
  });

});
