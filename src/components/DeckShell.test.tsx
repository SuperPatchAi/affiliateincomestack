import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeckShell } from "./DeckShell";
import { SLIDES } from "../data/slides";

describe("DeckShell", () => {
  it("renders all slides with on-slide copy", () => {
    const { container } = render(<DeckShell />);
    expect(container.querySelectorAll("[data-slide]")).toHaveLength(15);
    expect(screen.getByText(SLIDES[0].headline)).toBeTruthy();
    expect(screen.getByText(SLIDES[6].headline)).toBeTruthy();
  });

  it("uses fluid layout with contained high-quality concept plates", () => {
    const { container } = render(<DeckShell />);
    const slides = container.querySelectorAll("[data-layout='fluid']");
    expect(slides).toHaveLength(15);
    const plate = container.querySelector<HTMLImageElement>("[data-slide-plate]");
    expect(plate?.getAttribute("src")).toMatch(/\/concepts\/clean\/sp-stack-/);
    expect(plate?.getAttribute("width")).toBe("1920");
  });

  it("renders plate annotations as positioned overlay type", () => {
    const { container } = render(<DeckShell />);
    const expected = SLIDES.reduce(
      (total, s) => total + (s.annotations?.length ?? 0),
      0,
    );
    const rendered = container.querySelectorAll<HTMLElement>("[data-plate-annotation]");
    expect(rendered).toHaveLength(expected);

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
});
