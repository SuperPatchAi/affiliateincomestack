import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SLIDES } from "../../data/slides";
import { shouldShowLiveAnnotations } from "../../remotion/labels";
import { ExperienceShell } from "./ExperienceShell";

describe("ExperienceShell", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("prefers-reduced-motion") ? false : false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })),
    );
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: false },
    });
  });

  it("renders 15 ordered semantic scenes with heading hierarchy", () => {
    const { container } = render(<ExperienceShell />);
    const scenes = container.querySelectorAll("[data-experience-scene]");
    expect(scenes).toHaveLength(15);
    expect([...scenes].map((el) => el.getAttribute("data-slide"))).toEqual(
      SLIDES.map((s) => s.id),
    );
    expect(screen.getByRole("heading", { level: 1, name: SLIDES[0].headline })).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 2, name: SLIDES[6].headline }),
    ).toBeTruthy();
  });

  it("keeps narrative copy accessible and marks video decorative", () => {
    const { container } = render(<ExperienceShell />);
    expect(screen.getByText(SLIDES[0].body)).toBeTruthy();
    const videos = container.querySelectorAll("video");
    for (const video of videos) {
      expect(video.getAttribute("aria-hidden")).toBe("true");
    }
    expect(container.querySelector('a[href="#experience-main"]')).toBeTruthy();
  });

  it("shows disclosures and closing CTAs as real controls", () => {
    const { container } = render(<ExperienceShell />);
    const closing = container.querySelector('[data-slide="15-closing"]');
    expect(closing?.querySelector(".scene-disclosure")?.textContent).toMatch(
      /not guaranteed/i,
    );
    expect(
      screen.getByRole("link", { name: "Get your affiliate link" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Read the Income Disclosure" }),
    ).toBeTruthy();
  });

  it("keeps distant annotations unmounted and suppresses baked labels", () => {
    const { container } = render(<ExperienceShell />);
    expect(
      container.querySelectorAll(
        '[data-slide="03-four-stacks"] [data-plate-annotation]',
      ),
    ).toHaveLength(0);
    expect(
      container.querySelectorAll(
        '[data-slide="03-four-stacks"] [data-annotation-layer]',
      ),
    ).toHaveLength(0);
    expect(container.querySelectorAll("[data-plate-annotation]")).toHaveLength(0);
    expect(container.querySelectorAll("[data-annotation-layer]")).toHaveLength(
      SLIDES.filter(shouldShowLiveAnnotations).length,
    );
  });

  it("marks only the active neighborhood for media and compositing", () => {
    const { container } = render(<ExperienceShell />);
    const scenes = container.querySelectorAll<HTMLElement>(
      "[data-experience-scene]",
    );
    expect(scenes[0]?.dataset.sceneLifecycle).toBe("active");
    expect(scenes[1]?.dataset.sceneLifecycle).toBe("next");
    expect(scenes[2]?.dataset.sceneLifecycle).toBe("distant");
    expect(scenes[0]?.dataset.motionLayerActive).toBe("true");
    expect(scenes[2]?.dataset.motionLayerActive).toBe("false");
  });

  it("never attaches or starts video on the data-save path", () => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    });
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    const { container } = render(<ExperienceShell />);
    expect(container.querySelectorAll("[data-scene-video]")).toHaveLength(0);
    expect(play).not.toHaveBeenCalled();
  });

  it("honors reduced motion before the first media effect runs", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })),
    );
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    const { container } = render(<ExperienceShell />);
    expect(container.querySelectorAll("[data-scene-video]")).toHaveLength(0);
    expect(play).not.toHaveBeenCalled();
  });

  it("uses portrait media on the first playback attempt", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("orientation: portrait"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })),
    );
    const playedSources: string[] = [];
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(function (this: HTMLMediaElement) {
        playedSources.push(this.getAttribute("src") ?? "");
        return Promise.resolve();
      });
    const { container } = render(<ExperienceShell />);
    expect(play).toHaveBeenCalled();
    for (const source of playedSources) {
      expect(source).toMatch(/\/9x16\//);
    }
    // Plate labels sit above the scrim / outside the drifting media plane so
    // cover-crop + scale cannot clip them on mobile.
    const flywheelLayer = container.querySelector(
      '[data-slide="04-flywheel"] [data-annotation-layer]',
    );
    expect(flywheelLayer).toBeTruthy();
    expect(flywheelLayer?.closest("[data-scene-plane]")).toBeNull();
  });

  it("uses Omni landscape sources by default with WebP posters", () => {
    const { container } = render(<ExperienceShell />);
    const titleVideo = container.querySelector<HTMLVideoElement>(
      '[data-slide="01-title"] video',
    );
    // When attached in warm window, src is Omni; otherwise poster img is shown.
    const titlePoster = container.querySelector<HTMLImageElement>(
      '[data-slide="01-title"] [data-scene-poster]',
    );
    expect(titlePoster?.getAttribute("src")).toMatch(
      /\/concepts\/omni-chain\/posters\/16x9\/sp-stack-01-title\.webp$/,
    );
    if (titleVideo?.getAttribute("src")) {
      expect(titleVideo.getAttribute("src")).toMatch(
        /\/concepts\/omni-chain\/16x9\/sp-stack-01-title_omni\.mp4$/,
      );
    }
  });

  it("exposes a vertical scene navigator with 15 steps", () => {
    render(<ExperienceShell />);
    const nav = screen.getByRole("navigation", { name: /scene navigator/i });
    expect(nav.querySelectorAll("button")).toHaveLength(15);
  });

  it("composes each scene as one layered viewport card", () => {
    const { container } = render(<ExperienceShell />);
    const scene = container.querySelector('[data-slide="01-title"]');
    const stage = scene?.querySelector("[data-scene-sticky]");
    const card = stage?.querySelector(":scope > [data-scene-card]");

    expect(card).toBeTruthy();
    expect(card?.querySelector(":scope > [data-scene-plane]")).toBeTruthy();
    expect(card?.querySelector(":scope > [data-scene-scrim]")).toBeTruthy();
    expect(card?.querySelector(":scope > [data-scene-copy]")).toBeTruthy();
    expect(
      card?.querySelector("[data-scene-copy] [data-anim-layer='headline']"),
    ).toBeTruthy();
  });

  it("uses the approved Super Patch corporate mark in the chrome", () => {
    render(<ExperienceShell />);
    const mark = screen.getByRole("img", {
      name: "The Super Patch Company",
    });

    expect(mark.getAttribute("src")).toBe(
      "/brand/superpatch-company-horizontal-white.svg",
    );
  });

  it("shows a first-scroll cue on scene 1 that can be dismissed", () => {
    render(<ExperienceShell />);
    expect(screen.getByText(/scroll to explore/i)).toBeTruthy();
    expect(
      document.querySelector("[data-scroll-cue][data-dismissed='false']"),
    ).toBeTruthy();
  });

  it("exposes chapter-aware orientation in the chrome", () => {
    render(<ExperienceShell />);
    expect(screen.getByText("01 / 15")).toBeTruthy();
    expect(screen.getByText("Foundation")).toBeTruthy();
  });

  it("does not expose hash placeholder CTA destinations in production scenes", () => {
    const { container } = render(<ExperienceShell />);
    const closing = container.querySelector('[data-slide="15-closing"]');
    const primary = closing?.querySelector('[data-cta="primary"]');
    const secondary = closing?.querySelector('[data-cta="secondary"]');
    expect(primary?.getAttribute("href")).toMatch(/^https:\/\//);
    expect(secondary?.getAttribute("href")).toMatch(/^https:\/\//);
  });
});
