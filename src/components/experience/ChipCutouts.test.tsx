import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChipCutouts } from "./ChipCutouts";

const ENTRIES = [
  {
    slug: "traditional-jobs",
    src: "/concepts/chips/02-world/16x9/traditional-jobs.png",
  },
  {
    slug: "gig-economy",
    src: "/concepts/chips/02-world/16x9/gig-economy.png",
  },
];

describe("ChipCutouts", () => {
  it("renders one layer per entry with the still as img src", () => {
    const { container } = render(<ChipCutouts entries={ENTRIES} />);
    const wrap = container.querySelector("[data-chip-cutouts]")!;
    expect(wrap.getAttribute("aria-hidden")).toBe("true");
    const layers = wrap.querySelectorAll("[data-chip-cutout]");
    expect(layers).toHaveLength(2);
    expect(layers[0].getAttribute("data-chip-index")).toBe("0");
    const img = container.querySelector("[data-chip-cutout] img");
    expect(img?.getAttribute("src")).toBe(ENTRIES[0].src);
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("renders nothing without entries", () => {
    const { container } = render(<ChipCutouts entries={[]} />);
    expect(container.querySelector("[data-chip-cutouts]")).toBeNull();
  });
});
