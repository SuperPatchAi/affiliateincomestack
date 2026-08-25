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

  it("renders 24 ordered semantic scenes with heading hierarchy", () => {
    const { container } = render(<ExperienceShell />);
    const scenes = container.querySelectorAll("[data-experience-scene]");
    expect(scenes).toHaveLength(24);
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

  it("uses the title still poster in portrait orientation", () => {
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
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    const { container } = render(<ExperienceShell />);
    expect(play).not.toHaveBeenCalled();
    expect(
      container
        .querySelector('[data-slide="01-title"] [data-scene-poster]')
        ?.getAttribute("src"),
    ).toBe("/concepts/clean/sp-stack-01-title.png");
  });

  it("uses title still posters full-bleed with no Omni video", () => {
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
    ).toBe("false");
    expect(
      container.querySelector('[data-slide="05-product"] [data-chip-backdrops]'),
    ).toBeNull();
    expect(
      container
        .querySelector('[data-slide="05-product"] [data-scene-poster]')
        ?.getAttribute("src"),
    ).toBe("/concepts/clean/sp-stack-05-product.png");
    expect(
      container
        .querySelector('[data-slide="01-title"] [data-scene-poster]')
        ?.getAttribute("src"),
    ).toBe("/concepts/clean/sp-stack-01-title.png");
    expect(
      container
        .querySelector('[data-slide="02-world"] [data-scene-poster]')
        ?.getAttribute("src"),
    ).toBe("/concepts/clean/sp-stack-02-world.png");
    expect(
      container
        .querySelector('[data-slide="03-four-stacks"] [data-scene-poster]')
        ?.getAttribute("src"),
    ).toBe("/concepts/clean/sp-stack-03-four-stacks.png");
    expect(container.querySelectorAll("[data-experience-scene] video[src]")).toHaveLength(
      0,
    );
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

  it("exposes a vertical scene navigator with 24 steps", () => {
    render(<ExperienceShell />);
    const nav = screen.getByRole("navigation", { name: /scene navigator/i });
    expect(nav.querySelectorAll("button")).toHaveLength(24);
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
    expect(screen.getByText("01 / 24")).toBeTruthy();
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

  it("keeps simple overlay copy and hides chip stage on title stills", () => {
    const { container } = render(<ExperienceShell />);
    const scene = container.querySelector('[data-slide="01-title"]')!;
    expect(scene.querySelectorAll("[data-chip-item]")).toHaveLength(0);
    expect(scene.querySelector("[data-chip-fallback]")).toBeNull();
    expect(scene.querySelector("[data-chip-stage]")).toBeNull();
    expect(scene.querySelector("[data-chip-backdrops]")).toBeNull();
    const copy = scene.querySelector("[data-scene-copy]")!;
    expect(copy.querySelector("[data-anim-layer='eyebrow']")?.textContent).toMatch(
      /Super Patch Income Stack/i,
    );
    expect(copy.querySelector("[data-anim-layer='headline']")?.textContent).toMatch(
      /More Than an Affiliate Program/i,
    );
    expect(copy.querySelector("[data-anim-layer='body']")?.textContent?.length).toBeGreaterThan(
      40,
    );
  });

  it("keeps income disclosure inside the simple copy block", () => {
    const { container } = renderShell();
    const scene = container.querySelector('[data-slide="07-retail"]')!;
    expect(scene.querySelector("[data-disclosure-pinned]")).toBeNull();
    const disclosure = scene.querySelector("[data-scene-copy] [data-anim='disclosure']");
    expect(disclosure?.textContent).toContain("Income is not guaranteed");
    const closing = container.querySelector('[data-slide="15-closing"]')!;
    expect(closing.querySelector("[data-disclosure-pinned]")).toBeNull();
  });

  it("no longer renders the plate-annotation overlay on the web", () => {
    const { container } = render(<ExperienceShell />);
    expect(container.querySelectorAll("[data-plate-annotation]")).toHaveLength(0);
  });
});
