import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeckShell } from "./DeckShell";
import { SLIDES } from "../data/slides";
import { shouldShowLiveAnnotations } from "../remotion/labels";

describe("DeckShell", () => {
  it("renders all slides with on-slide copy", () => {
    const { container } = render(<DeckShell />);
    expect(container.querySelectorAll("[data-slide]")).toHaveLength(25);
    expect(screen.getByText(SLIDES[0].headline)).toBeTruthy();
    expect(screen.getByText(SLIDES[6].headline)).toBeTruthy();
  });

  it("uses fluid layout with contained high-quality concept plates", () => {
    const { container } = render(<DeckShell />);
    const slides = container.querySelectorAll("[data-layout='fluid']");
    expect(slides).toHaveLength(25);
    // Title ships an animated hero loop; clean PNG is the poster.
    const title = container.querySelector<HTMLVideoElement>(
      "[data-slide='01-title'] [data-slide-plate]",
    );
    expect(title?.tagName).toBe("VIDEO");
    expect(title?.getAttribute("src")).toMatch(
      /\/concepts\/animated\/sp-stack-01-title_animated\.mp4$/,
    );
    expect(title?.getAttribute("poster")).toMatch(/\/concepts\/clean\/sp-stack-01-title\.png$/);
    // Gap-fill still scenes use concept PNG plates until animated assets land.
    const world = container.querySelector<HTMLImageElement>(
      "[data-slide='02-world'] [data-slide-plate]",
    );
    expect(world?.tagName).toBe("IMG");
    expect(world?.getAttribute("src")).toMatch(
      /\/concepts\/clean\/sp-stack-02-world\.png$/,
    );
    const videos = container.querySelectorAll("[data-slide] video[data-slide-plate]");
    expect(videos).toHaveLength(
      SLIDES.filter((s) => Boolean(s.heroVideoSrc || s.hero?.src)).length,
    );
  });

  it("renders plate annotations as positioned overlay type", () => {
    const { container } = render(<DeckShell />);
    // Live overlays follow annotationsBaked policy — not a blanket heroVideoSrc skip.
    const expected = SLIDES.reduce(
      (total, s) =>
        total +
        (shouldShowLiveAnnotations(s) ? (s.annotations?.length ?? 0) : 0),
      0,
    );
    const rendered = container.querySelectorAll<HTMLElement>("[data-plate-annotation]");
    expect(rendered).toHaveLength(expected);
    expect(
      container.querySelectorAll(
        "[data-slide='03-four-stacks'] [data-plate-annotation]",
      ),
    ).toHaveLength(0);

    const tiers = container.querySelectorAll<HTMLElement>(
      "[data-slide='09-team-overrides'] [data-plate-annotation]",
    );
    expect([...tiers].map((el) => el.textContent)).toEqual([
      "15%",
      "10%",
      "4%",
      "4%",
      "4%",
    ]);
    expect(tiers[0].style.left).toBe("10.03%");
    expect(tiers[0].style.top).toBe("25.29%");
  });

  it("hides annotations from assistive tech since the copy column carries the same facts", () => {
    const { container } = render(<DeckShell />);
    const layer = container.querySelector("[data-annotation-layer]");
    expect(layer?.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows disclosure and CTAs on the closing slide", () => {
    const { container } = render(<DeckShell />);
    const closing = container.querySelector("[data-slide='15-closing']");
    expect(closing).toBeTruthy();
    expect(
      closing?.querySelector("[data-cta='primary']")?.textContent,
    ).toBe("Get your affiliate link");
    expect(
      closing?.querySelector("[data-cta='secondary']")?.textContent,
    ).toBe("Read the Income Disclosure");
    expect(closing?.querySelector(".slide-disclosure")?.textContent).toMatch(
      /not guaranteed/i,
    );
  });
});
