import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExperienceChrome } from "./ExperienceChrome";

describe("ExperienceChrome", () => {
  it("marks the active navigator step with aria-current", () => {
    render(
      <ExperienceChrome
        activeIndex={2}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
      />,
    );
    const buttons = screen.getAllByRole("button", { name: /Scene \d+/ });
    expect(buttons[2]?.getAttribute("aria-current")).toBe("true");
    expect(buttons[0]?.getAttribute("aria-current")).toBeNull();
  });

  it("invokes onJumpTo when a navigator step is activated", () => {
    const onJumpTo = vi.fn();
    render(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={onJumpTo}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Scene 5:/ }));
    expect(onJumpTo).toHaveBeenCalledWith(4);
  });

  it("exposes a pressed sound toggle for ambient opt-in", () => {
    const onToggleSound = vi.fn();
    render(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled={false}
        onToggleSound={onToggleSound}
        onJumpTo={() => {}}
      />,
    );
    const toggle = screen.getByRole("button", { name: /Enable audio/i });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(toggle);
    expect(onToggleSound).toHaveBeenCalled();
  });

  it("shows the formatted scene counter and active chapter label", () => {
    render(
      <ExperienceChrome
        activeIndex={6}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
      />,
    );
    expect(screen.getByText("07 / 20")).toBeTruthy();
    expect(screen.getByText("Full Stack")).toBeTruthy();
  });

  it("uses Premium V2 audio control labels", () => {
    const { rerender } = render(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Enable audio" }),
    ).toBeTruthy();

    rerender(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled
        onToggleSound={() => {}}
        onJumpTo={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Mute audio" })).toBeTruthy();
  });

  it("shows the mid-funnel affiliate CTA on compact layouts when links are verified", () => {
    render(
      <ExperienceChrome
        activeIndex={6}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
        layout="compact"
        showAffiliateCta
        ctaLinks={{
          primary: "https://affiliate.example.com",
          disclosure: "https://disclosure.example.com",
        }}
      />,
    );
    const link = screen.getByRole("link", { name: /affiliate link/i });
    expect(link.getAttribute("href")).toBe("https://affiliate.example.com");
  });

  it("keeps compact chrome controls at least 44px tall", () => {
    render(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
        layout="compact"
      />,
    );
    const jump = screen.getByRole("button", { name: /jump to scene/i });
    const sound = screen.getByRole("button", { name: /Enable audio/i });
    expect(jump.className).toMatch(/experience-touch-target/);
    expect(sound.className).toMatch(/experience-touch-target/);
  });

  it("closes the compact jump panel when the active scene changes", () => {
    const { rerender } = render(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
        layout="compact"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /jump to scene/i }));
    expect(screen.getByRole("combobox")).toBeTruthy();

    rerender(
      <ExperienceChrome
        activeIndex={3}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
        layout="compact"
      />,
    );
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
