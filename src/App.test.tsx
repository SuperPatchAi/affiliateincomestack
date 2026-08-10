import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App surface selection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to the cinematic experience shell", () => {
    vi.stubGlobal("location", {
      ...window.location,
      search: "",
    });
    const { container } = render(<App />);
    expect(container.querySelector("[data-experience-shell]")).toBeTruthy();
    expect(container.querySelector(".deck-shell")).toBeNull();
  });

  it("keeps DeckShell available via ?view=legacy", () => {
    vi.stubGlobal("location", {
      ...window.location,
      search: "?view=legacy",
    });
    const { container } = render(<App />);
    expect(container.querySelector(".deck-shell")).toBeTruthy();
    expect(container.querySelector("[data-experience-shell]")).toBeNull();
  });

  it("opens the hero 3D blockout preview via ?view=hero3d", () => {
    vi.stubGlobal("location", {
      ...window.location,
      search: "?view=hero3d",
    });
    const { container } = render(<App />);
    const shell = container.querySelector("[data-hero3d-preview]");
    expect(shell).toBeTruthy();
    expect(shell?.classList.contains("hero3d-shell")).toBe(true);
    expect(shell?.querySelector("[data-hero3d-canvas]")).toBeTruthy();
    expect(
      shell?.querySelector("[data-hero3d-canvas]")?.getAttribute("data-quality-tier"),
    ).toBeTruthy();
    expect(container.querySelector("[data-experience-shell]")).toBeNull();
    expect(container.querySelector(".deck-shell")).toBeNull();
    expect(container.querySelector("[data-title-slide-overlay]")).toBeTruthy();
    expect(
      container.querySelector("[data-title-slide-overlay] [data-anim-layer='headline']")
        ?.textContent,
    ).toMatch(/10 Ways to Build Life-Changing Income/i);
    // No flywheel badge above the eyebrow on the 3D hero composite.
    expect(
      container.querySelector("[data-title-slide-overlay] [data-flywheel]"),
    ).toBeNull();
  });
});
