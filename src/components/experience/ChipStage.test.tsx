import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChipStage } from "./ChipStage";

const CHIPS = [
  { label: "BETTER HEALTH", sub: "World-class wellness solutions that deliver real results." },
  { label: "GREATER FREEDOM", sub: "Ten income streams you can build at your own pace." },
];

const experienceCss = readFileSync(
  resolve(import.meta.dirname, "experience.css"),
  "utf8",
);

function cssRule(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = experienceCss.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`));
  if (!match) {
    throw new Error(`missing CSS rule ${selector}`);
  }
  return match[1];
}

describe("ChipStage", () => {
  it("renders one stacked item per chip with label and sub, without a chip counter", () => {
    const { container } = render(<ChipStage chips={CHIPS} />);
    const stage = container.querySelector("[data-chip-stage]")!;
    expect(stage.getAttribute("aria-hidden")).toBe("true");
    const items = stage.querySelectorAll("[data-chip-item]");
    expect(items).toHaveLength(2);
    expect(items[0].getAttribute("data-chip-index")).toBe("0");
    expect(container.querySelector(".chip-stage-count")).toBeNull();
    expect(items[0].textContent).not.toMatch(/\d{2}\s*\/\s*\d{2}/);
    expect(items[0].textContent).toContain("BETTER HEALTH");
    expect(items[1].textContent).toContain(
      "Ten income streams you can build at your own pace.",
    );
  });

  it("paints chip titles white at the same weight as title-slide headlines", () => {
    const headline = cssRule(".scene-headline");
    const label = cssRule(".chip-stage-label");
    const fallbackTitle = cssRule(".scene-chip-list strong");
    expect(headline).toMatch(/font-weight:\s*900/);
    expect(headline).toMatch(/text-transform:\s*uppercase/);
    expect(label).toMatch(/font-weight:\s*900/);
    expect(label).toMatch(/text-transform:\s*uppercase/);
    expect(label).toMatch(/color:\s*var\(--sp-text\)/);
    expect(fallbackTitle).toMatch(/color:\s*var\(--sp-text\)/);
  });

  it("matches chip body weight to title-slide body copy", () => {
    const body = cssRule(".scene-body");
    const sub = cssRule(".chip-stage-sub");
    expect(body).toMatch(/font-weight:\s*500/);
    expect(sub).toMatch(/font-weight:\s*500/);
  });
});
