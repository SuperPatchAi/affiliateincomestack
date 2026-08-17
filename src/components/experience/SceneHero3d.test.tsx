import { render, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SceneHero3d } from "./SceneHero3d";

const { patchCanvasShouldFail, patchCanvasInnerFail, patchCanvasReady } =
  vi.hoisted(() => ({
    patchCanvasShouldFail: { current: false },
    patchCanvasInnerFail: { current: false },
    patchCanvasReady: { current: false },
  }));

vi.mock("../hero3d/Hero3dCanvas", () => ({
  Hero3dCanvas: ({
    variant,
    modelUrl,
    onError,
    onReady,
  }: {
    variant?: string;
    modelUrl?: string;
    onError?: () => void;
    onReady?: () => void;
  }) => {
    useEffect(() => {
      if (patchCanvasInnerFail.current) {
        onError?.();
      }
      if (patchCanvasReady.current) {
        onReady?.();
      }
    }, [onError, onReady]);
    if (patchCanvasShouldFail.current) {
      throw new Error("GLB load failed");
    }
    return (
      <div
        data-hero3d-canvas
        data-hero3d-variant={variant ?? "stack"}
        data-hero3d-model={modelUrl}
      />
    );
  },
}));

function mockWebgl() {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    (type: string) =>
      type === "webgl2" || type === "webgl"
        ? ({} as WebGLRenderingContext)
        : null,
  );
}

describe("SceneHero3d", () => {
  afterEach(() => {
    patchCanvasShouldFail.current = false;
    patchCanvasInnerFail.current = false;
    patchCanvasReady.current = false;
    vi.restoreAllMocks();
  });

  it("keeps the poster when reduced motion is on", () => {
    const { container } = render(
      <SceneHero3d
        active
        reducedMotion
        poster="/concepts/omni-chain/posters/16x9/sp-stack-01-title.webp"
        priority
      />,
    );
    expect(container.querySelector("[data-scene-poster]")).toBeTruthy();
    expect(container.querySelector("[data-hero3d-canvas]")).toBeNull();
  });

  it("mounts the patch canvas when active and WebGL works", () => {
    mockWebgl();
    const { container } = render(
      <SceneHero3d
        active
        reducedMotion={false}
        poster="/concepts/omni-chain/posters/16x9/sp-stack-01-title.webp"
      />,
    );
    const canvas = container.querySelector("[data-hero3d-canvas]");
    expect(canvas).toBeTruthy();
    expect(canvas?.getAttribute("data-hero3d-variant")).toBe("patch");
    expect(
      container.querySelector<HTMLImageElement>("[data-scene-poster]")?.style
        .opacity,
    ).not.toBe("0");
  });

  it("forwards the per-scene patch GLB to the canvas", () => {
    mockWebgl();
    const { container } = render(
      <SceneHero3d
        active
        reducedMotion={false}
        poster="/concepts/omni-chain/posters/16x9/sp-stack-01-title.webp"
        modelUrl="/models/superpatch-title.glb"
      />,
    );
    expect(
      container
        .querySelector("[data-hero3d-canvas]")
        ?.getAttribute("data-hero3d-model"),
    ).toBe("/models/superpatch-title.glb");
  });

  it("hides the poster after the patch canvas reports ready", async () => {
    mockWebgl();
    patchCanvasReady.current = true;
    const { container } = render(
      <SceneHero3d
        active
        reducedMotion={false}
        poster="/concepts/omni-chain/posters/16x9/sp-stack-01-title.webp"
      />,
    );
    expect(container.querySelector("[data-hero3d-canvas]")).toBeTruthy();
    await waitFor(() => {
      expect(
        container.querySelector<HTMLImageElement>("[data-scene-poster]")?.style
          .opacity,
      ).toBe("0");
    });
  });

  it("keeps the poster when the patch canvas reports a load error", () => {
    mockWebgl();
    patchCanvasShouldFail.current = true;
    const { container } = render(
      <SceneHero3d
        active
        reducedMotion={false}
        poster="/concepts/omni-chain/posters/16x9/sp-stack-01-title.webp"
      />,
    );
    expect(container.querySelector("[data-hero3d-canvas]")).toBeNull();
    expect(
      container.querySelector<HTMLImageElement>("[data-scene-poster]")?.style
        .opacity,
    ).not.toBe("0");
  });

  it("keeps the poster when an inner-canvas useGLTF failure reports onError", async () => {
    mockWebgl();
    patchCanvasInnerFail.current = true;
    const { container } = render(
      <SceneHero3d
        active
        reducedMotion={false}
        poster="/concepts/omni-chain/posters/16x9/sp-stack-01-title.webp"
      />,
    );
    await waitFor(() => {
      expect(container.querySelector("[data-hero3d-canvas]")).toBeNull();
    });
    expect(
      container.querySelector<HTMLImageElement>("[data-scene-poster]")?.style
        .opacity,
    ).not.toBe("0");
  });
});
