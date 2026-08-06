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
});
