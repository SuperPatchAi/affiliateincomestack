import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChipStage } from "./ChipStage";

const CHIPS = [
  { label: "BETTER HEALTH", sub: "World-class wellness solutions that deliver real results." },
  { label: "GREATER FREEDOM", sub: "Ten income streams you can build at your own pace." },
];

describe("ChipStage", () => {
  it("renders one stacked item per chip with counter, label, and sub", () => {
    const { container } = render(<ChipStage chips={CHIPS} />);
    const stage = container.querySelector("[data-chip-stage]")!;
    expect(stage.getAttribute("aria-hidden")).toBe("true");
    const items = stage.querySelectorAll("[data-chip-item]");
    expect(items).toHaveLength(2);
    expect(items[0].getAttribute("data-chip-index")).toBe("0");
    expect(items[0].textContent).toContain("01 / 02");
    expect(items[0].textContent).toContain("BETTER HEALTH");
    expect(items[1].textContent).toContain(
      "Ten income streams you can build at your own pace.",
    );
  });
});
