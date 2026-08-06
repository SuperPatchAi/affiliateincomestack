import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Flywheel } from "./Flywheel";

describe("Flywheel ARCS", () => {
  it("matches plate-art stroke variables in order", () => {
    const { container } = render(<Flywheel active="all" />);
    const expected: [string, string][] = [
      ["product", "var(--sp-blue)"],
      ["brand", "var(--sp-green)"],
      ["income", "var(--sp-orange)"],
      ["development", "var(--sp-violet)"],
    ];
    for (const [id, color] of expected) {
      expect(
        container.querySelector(`[data-arc="${id}"]`)?.getAttribute("stroke"),
      ).toBe(color);
    }
  });
});
