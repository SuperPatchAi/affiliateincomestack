import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DustHazeCanvas } from "./DustHazeCanvas";

describe("DustHazeCanvas", () => {
  it("renders a hidden canvas when inactive", () => {
    const { container } = render(<DustHazeCanvas active={false} />);
    const canvas = container.querySelector("[data-dust-haze]");
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute("data-active")).toBe("false");
  });

  it("marks the canvas active when the scene is live", () => {
    const { container } = render(<DustHazeCanvas active={true} />);
    expect(
      container.querySelector("[data-dust-haze]")?.getAttribute("data-active"),
    ).toBe("true");
  });
});
