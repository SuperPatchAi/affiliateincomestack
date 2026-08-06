import { describe, expect, it } from "vitest";
import { SLIDES, wordCount, assertSlidesValid } from "./slides";

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
