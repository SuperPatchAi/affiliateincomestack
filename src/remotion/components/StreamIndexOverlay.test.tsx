import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { INCOME_STREAMS, RECAP_OVERLAY_TEXT } from "../../data/streamIndex";

vi.mock("remotion", () => ({
  useCurrentFrame: () => 120,
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

import { StreamIndexOverlay } from "./StreamIndexOverlay";

describe("StreamIndexOverlay", () => {
  it("lists all ten streams in index mode", () => {
    const { container } = render(<StreamIndexOverlay mode="index" />);
    const items = container.querySelectorAll("[data-stream-item]");
    expect(items).toHaveLength(10);
    expect(items[0]?.textContent).toContain(INCOME_STREAMS[0]!.shortLabel);
  });

  it("shows recap copy in recap mode", () => {
    const { container } = render(<StreamIndexOverlay mode="recap" />);
    expect(container.querySelector("[data-recap-overlay]")?.textContent).toBe(
      RECAP_OVERLAY_TEXT,
    );
  });
});
