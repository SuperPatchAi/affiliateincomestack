import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SceneVideo } from "./SceneVideo";

const variant = {
  src: "/concepts/omni-chain/16x9/sp-stack-01-title_omni.mp4",
  poster: "/concepts/omni-chain/posters/16x9/sp-stack-01-title.webp",
  width: 1280,
  height: 720,
};

describe("SceneVideo Premium V2 media contract", () => {
  it("keeps the poster visible until loadeddata, then crossfades the video", async () => {
    const { container } = render(
      <SceneVideo variant={variant} attachVideo autoplay muted />,
    );
    const poster = container.querySelector<HTMLElement>("[data-scene-poster]");
    const video = container.querySelector<HTMLVideoElement>("[data-scene-video]");
    expect(poster).toBeTruthy();
    expect(video).toBeTruthy();
    expect(poster?.getAttribute("data-poster-visible")).not.toBe("false");
    expect(video?.getAttribute("data-video-ready")).not.toBe("true");

    fireEvent.loadedData(video!);

    await waitFor(() => {
      expect(poster?.getAttribute("data-poster-visible")).toBe("false");
      expect(video?.getAttribute("data-video-ready")).toBe("true");
    });
  });

  it("pauses playback when autoplay is false so only the active scene may play", () => {
    const pause = vi.fn();
    const play = vi.fn().mockResolvedValue(undefined);

    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);

    const { rerender } = render(
      <SceneVideo variant={variant} attachVideo autoplay muted />,
    );
    expect(play).toHaveBeenCalled();

    play.mockClear();
    pause.mockClear();

    rerender(
      <SceneVideo variant={variant} attachVideo autoplay={false} muted />,
    );
    expect(pause).toHaveBeenCalled();
    expect(play).not.toHaveBeenCalled();
  });

  it("keeps poster fallback when the video errors", async () => {
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
    const load = vi.spyOn(HTMLMediaElement.prototype, "load");
    const { container } = render(
      <SceneVideo variant={variant} attachVideo autoplay muted />,
    );
    const poster = container.querySelector("[data-scene-poster]");
    const video = container.querySelector<HTMLVideoElement>("[data-scene-video]");
    fireEvent.error(video!);

    await waitFor(() => {
      expect(container.querySelector("[data-scene-video]")).toBeNull();
      expect(poster?.getAttribute("data-poster-visible")).not.toBe("false");
      expect(video?.getAttribute("src")).toBeNull();
      expect(pause).toHaveBeenCalled();
      expect(load).toHaveBeenCalled();
    });
  });

  it("keeps the video attached and retries after NotAllowedError (mobile autoplay)", async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValueOnce(new DOMException("Not allowed", "NotAllowedError"))
      .mockResolvedValue(undefined);

    const { container } = render(
      <SceneVideo variant={variant} attachVideo autoplay muted />,
    );
    const video = container.querySelector<HTMLVideoElement>("[data-scene-video]");
    expect(video).toBeTruthy();

    await waitFor(() => expect(play).toHaveBeenCalled());
    expect(container.querySelector("[data-scene-video]")).toBeTruthy();
    expect(
      container
        .querySelector("[data-scene-poster]")
        ?.getAttribute("data-poster-visible"),
    ).toBe("true");

    play.mockClear();
    fireEvent.loadedData(video!);

    await waitFor(() => expect(play).toHaveBeenCalled());
    expect(container.querySelector("[data-scene-video]")).toBeTruthy();
  });

  it("sets the muted DOM property before play so mobile autoplay policies pass", () => {
    const play = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      expect(this.muted).toBe(true);
      return play();
    });

    render(<SceneVideo variant={variant} attachVideo autoplay muted />);
    expect(play).toHaveBeenCalled();
  });

  it("retries play after AbortError once the element can play", async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValueOnce(new DOMException("Aborted", "AbortError"))
      .mockResolvedValue(undefined);

    const { container } = render(
      <SceneVideo variant={variant} attachVideo autoplay muted />,
    );
    const video = container.querySelector<HTMLVideoElement>("[data-scene-video]");

    await waitFor(() => expect(play).toHaveBeenCalled());
    expect(container.querySelector("[data-scene-video]")).toBeTruthy();
    const callsAfterBlock = play.mock.calls.length;

    fireEvent.loadedData(video!);
    await waitFor(() =>
      expect(play.mock.calls.length).toBeGreaterThan(callsAfterBlock),
    );
    await waitFor(() => {
      expect(
        container
          .querySelector("[data-scene-video]")
          ?.getAttribute("data-video-ready"),
      ).toBe("true");
    });
  });

  it("retries a blocked play after the first user gesture", async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValueOnce(new DOMException("Not allowed", "NotAllowedError"))
      .mockResolvedValue(undefined);

    const { container } = render(
      <SceneVideo variant={variant} attachVideo autoplay muted />,
    );

    await waitFor(() =>
      expect(
        container
          .querySelector("[data-scene-media]")
          ?.getAttribute("data-play-blocked"),
      ).toBe("true"),
    );
    play.mockClear();

    window.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await waitFor(() => expect(play).toHaveBeenCalled());
    expect(container.querySelector("[data-scene-video]")).toBeTruthy();
  });

  it("keeps the same video element across orientation source swaps", async () => {
    const pause = vi.fn();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);

    const { container, rerender } = render(
      <SceneVideo variant={variant} attachVideo autoplay muted />,
    );
    const firstVideo =
      container.querySelector<HTMLVideoElement>("[data-scene-video]");
    fireEvent.loadedData(firstVideo!);
    await waitFor(() =>
      expect(firstVideo?.getAttribute("data-video-ready")).toBe("true"),
    );

    const portraitVariant = {
      ...variant,
      src: "/concepts/omni-chain/9x16/sp-stack-01-title_omni.mp4",
      poster: "/concepts/omni-chain/posters/9x16/sp-stack-01-title.webp",
      width: 720,
      height: 1280,
    };
    rerender(
      <SceneVideo
        variant={portraitVariant}
        attachVideo
        autoplay
        muted
      />,
    );

    const nextVideo =
      container.querySelector<HTMLVideoElement>("[data-scene-video]");
    expect(nextVideo).toBe(firstVideo);
    expect(nextVideo?.getAttribute("src")).toContain("/9x16/");
    expect(nextVideo?.getAttribute("data-video-ready")).toBe("false");
    expect(
      container
        .querySelector("[data-scene-poster]")
        ?.getAttribute("data-poster-visible"),
    ).toBe("true");
    expect(pause).toHaveBeenCalled();
  });

  it("retries a blocked play when the page becomes visible again", async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValueOnce(new DOMException("Not allowed", "NotAllowedError"))
      .mockResolvedValue(undefined);

    render(<SceneVideo variant={variant} attachVideo autoplay muted />);
    await waitFor(() =>
      expect(
        document
          .querySelector("[data-scene-media]")
          ?.getAttribute("data-play-blocked"),
      ).toBe("true"),
    );
    play.mockClear();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    await waitFor(() => expect(play).toHaveBeenCalled());
  });

  it("releases the decoder when a warm video is detached", () => {
    const pause = vi.fn();
    const load = vi.fn();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(load);

    const { container, rerender } = render(
      <SceneVideo variant={variant} attachVideo autoplay={false} muted />,
    );
    expect(container.querySelector("[data-scene-video]")).toBeTruthy();

    rerender(
      <SceneVideo
        variant={variant}
        attachVideo={false}
        autoplay={false}
        muted
      />,
    );

    expect(container.querySelector("[data-scene-video]")).toBeNull();
    expect(pause).toHaveBeenCalled();
    expect(load).toHaveBeenCalled();
  });
});
