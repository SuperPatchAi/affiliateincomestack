import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SLIDES } from "../../data/slides";
import { ExperienceShell } from "./ExperienceShell";

const experienceCss = readFileSync(
  resolve(import.meta.dirname, "experience.css"),
  "utf8",
);

function renderShell() {
  return render(<ExperienceShell />);
}

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

  it("renders 20 ordered semantic scenes with heading hierarchy", () => {
    const { container } = render(<ExperienceShell />);
    const scenes = container.querySelectorAll("[data-experience-scene]");
    expect(scenes).toHaveLength(20);
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
    expect(screen.getByText(SLIDES[1].body)).toBeTruthy();
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
    render(<ExperienceShell />);
    expect(play).toHaveBeenCalled();
    for (const source of playedSources) {
      expect(source).toMatch(/\/9x16\//);
    }
  });

  it("uses Omni landscape sources by default with WebP posters", () => {
    const { container } = render(<ExperienceShell />);
    expect(
      container.querySelector('[data-slide="00-super-stack"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-slide="01-title"]')?.getAttribute("data-hero3d"),
    ).toBe("false");
    expect(
      container.querySelector('[data-slide="01-title"] [data-scene-hero3d]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-slide="05-product"]')?.getAttribute("data-hero3d"),
    ).toBe("true");
    expect(
      container.querySelector('[data-slide="05-product"] [data-scene-hero3d]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-slide="05-product"] video'),
    ).toBeNull();
    expect(
      container
        .querySelector('[data-slide="01-title"] [data-scene-poster]')
        ?.getAttribute("src"),
    ).toMatch(/\/concepts\/omni-chain\/posters\/16x9\/sp-stack-01-title\.webp$/);
    // Later scenes still use Omni video (warm window attaches src).
    // 02-world is still-only; assert via poster. Omni video lives on later mapped scenes.
    const worldPoster = container.querySelector<HTMLImageElement>(
      '[data-slide="02-world"] [data-scene-poster]',
    );
    expect(worldPoster?.getAttribute("src") ?? "").toMatch(
      /sp-stack-02-world/,
    );
    const stacksVideo = container.querySelector<HTMLVideoElement>(
      '[data-slide="03-four-stacks"] video',
    );
    const stacksPoster = container.querySelector<HTMLImageElement>(
      '[data-slide="03-four-stacks"] [data-scene-poster]',
    );
    const stacksSrc =
      stacksVideo?.getAttribute("src") ??
      stacksPoster?.getAttribute("src") ??
      "";
    expect(stacksSrc).toMatch(/sp-stack-03-four-stacks/);
  });

  it("keeps the complete-opportunity copy on the opening title scene", () => {
    const { container } = render(<ExperienceShell />);
    const copy = container.querySelector(
      '[data-slide="01-title"] [data-scene-copy]',
    );
    expect(copy?.querySelector("[data-anim-layer='headline']")?.textContent).toMatch(
      /More Than an Affiliate Program\. A Complete Opportunity\./i,
    );
    expect(copy?.querySelector("[data-anim-layer='eyebrow']")).toBeTruthy();
    expect(copy?.querySelector("[data-anim-layer='body']")).toBeTruthy();
  });

  it("exposes a vertical scene navigator with 20 steps", () => {
    render(<ExperienceShell />);
    const nav = screen.getByRole("navigation", { name: /scene navigator/i });
    expect(nav.querySelectorAll("button")).toHaveLength(20);
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

  it("does not render the corner flywheel above scene titles", () => {
    const { container } = render(<ExperienceShell />);
    expect(container.querySelectorAll("[data-flywheel]")).toHaveLength(0);
    expect(container.querySelectorAll("[data-flywheel-wrap]")).toHaveLength(0);
  });

  it("uses the approved Super Patch corporate mark in the chrome", () => {
    render(<ExperienceShell />);
    const mark = screen.getByRole("img", {
      name: "The Super Patch Company",
    });

    expect(mark.getAttribute("src")).toBe(
      "/brand/superpatch-horizontal-wordmark.png",
    );
    expect(mark.className).toContain("experience-brand");
    expect(experienceCss).toMatch(
      /\.experience-brand\s*\{[^}]*filter:\s*brightness\(0\)\s+invert\(1\)/,
    );
  });

  it("aligns the brand mark to the same left gutter as scene copy", () => {
    expect(experienceCss).toMatch(/--scene-inset-left:/);
    for (const selector of [
      ".experience-top",
      ".scene-copy",
      ".chip-stage",
      ".scene-disclosure-pinned",
    ]) {
      expect(experienceCss).toMatch(
        new RegExp(
          `${selector.replace(".", "\\.")}\\s*\\{[^}]*left:\\s*var\\(--scene-inset-left\\)`,
        ),
      );
    }
    expect(experienceCss).not.toMatch(
      /\.experience-top\s*\{[^}]*right:\s*var\(--scene-inset-right\)/,
    );
    expect(experienceCss).toMatch(
      /\.experience-top\s*\{[^}]*right:\s*calc\(clamp\(20px, 4vw, 64px\) \+ var\(--safe-right\)\)/,
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
    expect(screen.getByText("01 / 20")).toBeTruthy();
    expect(
      screen.getByText("Full Stack", { selector: ".experience-chapter-label" }),
    ).toBeTruthy();
  });

  it("does not expose hash placeholder CTA destinations in production scenes", () => {
    const { container } = render(<ExperienceShell />);
    const closing = container.querySelector('[data-slide="15-closing"]');
    const primary = closing?.querySelector('[data-cta="primary"]');
    const secondary = closing?.querySelector('[data-cta="secondary"]');
    expect(primary?.getAttribute("href")).toMatch(/^https:\/\//);
    expect(secondary?.getAttribute("href")).toMatch(/^https:\/\//);
  });

  it("renders the chip stage and static fallback list for chip scenes", () => {
    const { container } = render(<ExperienceShell />);
    const scene = container.querySelector('[data-slide="01-title"]')!;
    expect(scene.querySelectorAll("[data-chip-item]")).toHaveLength(3);
    const fallback = scene.querySelector("[data-chip-fallback]")!;
    expect(fallback.textContent).toContain("BETTER HEALTH");
  });

  it("no longer renders the plate-annotation overlay on the web", () => {
    const { container } = render(<ExperienceShell />);
    expect(container.querySelectorAll("[data-plate-annotation]")).toHaveLength(0);
  });

  it("pins the income disclosure outside the copy block on chip scenes", () => {
    const { container } = renderShell();
    const scene = container.querySelector('[data-slide="07-retail"]')!;
    const pinned = scene.querySelector("[data-disclosure-pinned]")!;
    expect(pinned.textContent).toContain("Income is not guaranteed");
    expect(pinned.closest("[data-scene-copy]")).toBeNull();
    expect(pinned.getAttribute("data-anim-layer")).toBe("disclosure");
    // Non-chip scenes keep the disclosure where it was.
    const closing = container.querySelector('[data-slide="15-closing"]')!;
    expect(closing.querySelector("[data-disclosure-pinned]")).toBeNull();
  });
});
