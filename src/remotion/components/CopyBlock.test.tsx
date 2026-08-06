import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { INCOME_DISCLOSURE, type Slide } from "../../data/slides";

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

vi.mock("./KineticHeadline", () => ({
  KineticHeadline: ({ text }: { text: string }) => <h1>{text}</h1>,
}));

import { CopyBlock } from "./CopyBlock";

const baseSlide: Slide = {
  id: "test-slide",
  conceptSrc: "/concepts/clean/sp-stack-15-closing.png",
  accent: "blue",
  eyebrow: "Close",
  headline: "Start where you are.",
  body: "Most affiliate programs pay one commission. Super Patch rewards every stage of building — from retail customers to leadership pools. Choose your starting pace, then take the next step with your sponsor.",
  motionPreset: "hold",
  requiresDisclosure: true,
  disclosure: INCOME_DISCLOSURE,
};

describe("CopyBlock disclosure vs EndCard", () => {
  it("keeps disclosure in CopyBlock when CTA trio is incomplete", () => {
    const { container } = render(
      <CopyBlock
        slide={{
          ...baseSlide,
          ctaPrimary: "Get your affiliate link",
          // missing ctaSecondary — EndCard must not own disclosure yet
        }}
      />,
    );
    expect(container.textContent).toContain(INCOME_DISCLOSURE);
  });

  it("hides CopyBlock disclosure when full EndCard trio is present", () => {
    const { container } = render(
      <CopyBlock
        slide={{
          ...baseSlide,
          ctaPrimary: "Get your affiliate link",
          ctaSecondary: "Read the Income Disclosure",
        }}
      />,
    );
    expect(container.textContent).not.toContain(INCOME_DISCLOSURE);
  });
});
