import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { INCOME_DISCLOSURE } from "../../data/slides";

vi.mock("remotion", () => ({
  useCurrentFrame: () => 90,
  useVideoConfig: () => ({
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 150,
  }),
  spring: () => 1,
  interpolate: (_frame: number, _input: number[], output: number[]) =>
    output[output.length - 1] ?? 1,
}));

import { EndCard } from "./EndCard";

describe("EndCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders primary CTA, secondary CTA, and disclosure at ≥16px", () => {
    const { container } = render(
      <EndCard
        ctaPrimary="Get your affiliate link"
        ctaSecondary="Read the Income Disclosure"
        disclosure={INCOME_DISCLOSURE}
        startFrame={40}
      />,
    );

    expect(container.querySelector("[data-end-card]")).toBeTruthy();
    expect(container.querySelector("[data-cta-primary]")?.textContent).toBe(
      "Get your affiliate link",
    );
    expect(container.querySelector("[data-cta-secondary]")?.textContent).toBe(
      "Read the Income Disclosure",
    );
    const disclosure = container.querySelector<HTMLElement>("[data-end-disclosure]");
    expect(disclosure?.textContent).toBe(INCOME_DISCLOSURE);
    expect(Number.parseFloat(disclosure!.style.fontSize)).toBeGreaterThanOrEqual(16);
  });
});
