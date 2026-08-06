import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("remotion", () => ({
  useCurrentFrame: () => 30,
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

import { ProgressSpine } from "./ProgressSpine";

describe("ProgressSpine", () => {
  it("renders ten dots with the active stacks filled", () => {
    const { container } = render(
      <ProgressSpine activeStacks={[1]} accent="green" />,
    );
    const dots = container.querySelectorAll("[data-spine-dot]");
    expect(dots).toHaveLength(10);
    expect(dots[0]?.getAttribute("data-active")).toBe("true");
    expect(dots[1]?.getAttribute("data-active")).toBe("false");
  });

  it("marks all dots complete when complete is true", () => {
    const { container } = render(
      <ProgressSpine activeStacks={[9, 10]} accent="violet" complete />,
    );
    const dots = container.querySelectorAll("[data-spine-dot]");
    expect(
      [...dots].every((d) => d.getAttribute("data-complete") === "true"),
    ).toBe(true);
  });

  it("anchors on the left rail so it does not collide with corner flywheel", () => {
    const { container } = render(
      <ProgressSpine activeStacks={[1]} accent="green" />,
    );
    const spine = container.querySelector<HTMLElement>("[data-progress-spine]");
    expect(spine?.style.left).toBeTruthy();
    expect(spine?.style.right).toBe("");
    expect(Number.parseFloat(spine!.style.left)).toBeLessThan(100);
  });
});
