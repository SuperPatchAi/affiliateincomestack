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
    expect(plate?.getAttribute("src")).toMatch(/\/concepts\/sp-stack-/);
    expect(plate?.getAttribute("width")).toBe("1920");
  });
});
