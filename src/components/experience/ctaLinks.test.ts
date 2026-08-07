import { describe, expect, it } from "vitest";
import * as CtaLinks from "./ctaLinks";

describe("ctaLinks", () => {
  it("returns only a complete pair of verified https destinations", () => {
    expect(typeof CtaLinks.resolveProductionCtaLinks).toBe("function");
    if (typeof CtaLinks.resolveProductionCtaLinks !== "function") return;

    expect(
      CtaLinks.resolveProductionCtaLinks({
        primary: "#get-affiliate-link",
        secondary: "#income-disclosure",
      }),
    ).toBeNull();
    expect(
      CtaLinks.resolveProductionCtaLinks({
        primary: "https://example.com/affiliate",
        secondary: "https://example.com/disclosure",
      }),
    ).toEqual({
      primary: "https://example.com/affiliate",
      secondary: "https://example.com/disclosure",
    });
    expect(
      CtaLinks.resolveProductionCtaLinks({
        primary: "https://example.com/affiliate",
        secondary: "",
      }),
    ).toBeNull();
  });
});
