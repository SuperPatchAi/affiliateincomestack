import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChipBackdrops } from "./ChipBackdrops";

const ENTRIES = [
  {
    slug: "better-health",
    video: "/concepts/chips/01-title/16x9/better-health_omni.mp4",
    poster: "/concepts/chips/01-title/16x9/better-health.png",
  },
  {
    slug: "greater-freedom",
    video: "/concepts/chips/01-title/16x9/greater-freedom_omni.mp4",
    poster: "/concepts/chips/01-title/16x9/greater-freedom.png",
  },
];

describe("ChipBackdrops", () => {
  it("renders one hidden backdrop layer per chip, indexed for the motion hook", () => {
    const { container } = render(
      <ChipBackdrops entries={ENTRIES} attachVideo={true} />,
    );
    const wrap = container.querySelector("[data-chip-backdrops]")!;
    expect(wrap.getAttribute("aria-hidden")).toBe("true");
    const layers = wrap.querySelectorAll("[data-chip-backdrop]");
    expect(layers).toHaveLength(2);
    expect(layers[0].getAttribute("data-chip-index")).toBe("0");
    expect(layers[1].getAttribute("data-chip-index")).toBe("1");
  });

  it("attaches muted video with the still as poster, playback owned by the cycle", () => {
    const { container } = render(
      <ChipBackdrops entries={ENTRIES} attachVideo={true} />,
    );
    const video = container.querySelector<HTMLVideoElement>(
      "[data-chip-backdrop] video",
    )!;
    expect(video.getAttribute("src")).toBe(ENTRIES[0].video);
    expect(video.getAttribute("poster")).toBe(ENTRIES[0].poster);
    expect(video.muted).toBe(true);
    // The auto-cycle plays each clip once and advances on `ended`.
    expect(video.loop).toBe(false);
    expect(video.autoplay).toBe(false);
    expect(video.getAttribute("playsinline")).not.toBeNull();
  });

  it("keeps the poster still and skips the video src in data-save mode", () => {
    const { container } = render(
      <ChipBackdrops entries={ENTRIES} attachVideo={false} />,
    );
    const video = container.querySelector<HTMLVideoElement>(
      "[data-chip-backdrop] video",
    )!;
    expect(video.getAttribute("src")).toBeNull();
    expect(video.getAttribute("poster")).toBe(ENTRIES[0].poster);
  });

  it("shows only the poster for stills-only entries, so the cycle falls back to its timer", () => {
    const stillsOnly = ENTRIES.map(({ video: _video, ...rest }) => rest);
    const { container } = render(
      <ChipBackdrops entries={stillsOnly} attachVideo={true} />,
    );
    const video = container.querySelector<HTMLVideoElement>(
      "[data-chip-backdrop] video",
    )!;
    expect(video.getAttribute("src")).toBeNull();
    expect(video.getAttribute("preload")).toBe("none");
    expect(video.getAttribute("poster")).toBe(ENTRIES[0].poster);
  });

  it("renders nothing without entries", () => {
    const { container } = render(
      <ChipBackdrops entries={[]} attachVideo={true} />,
    );
    expect(container.querySelector("[data-chip-backdrops]")).toBeNull();
  });
});
