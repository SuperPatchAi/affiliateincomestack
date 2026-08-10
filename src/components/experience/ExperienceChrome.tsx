import { useEffect, useId, useState, type KeyboardEvent } from "react";
import {
  SLIDES,
  chapterForSceneIndex,
  formatSceneCounter,
} from "../../data/slides";
import type { ProductionCtaLinks } from "./ctaLinks";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";

export type ExperienceChromeLayout = "default" | "compact";

type Props = {
  activeIndex: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onJumpTo: (index: number) => void;
  layout?: ExperienceChromeLayout;
  /** Continuous 0–1 scroll progress; motion hook wiring is Task 4. */
  scrollProgress?: number;
  ctaLinks?: ProductionCtaLinks | null;
  showAffiliateCta?: boolean;
};

export function ExperienceChrome({
  activeIndex,
  soundEnabled,
  onToggleSound,
  onJumpTo,
  layout = "default",
  scrollProgress,
  ctaLinks,
  showAffiliateCta = false,
}: Props) {
  const jumpSelectId = useId();
  const [jumpOpen, setJumpOpen] = useState(false);
  const chapter = chapterForSceneIndex(activeIndex);
  const sceneCounter = formatSceneCounter(activeIndex);
  const progressFraction =
    scrollProgress ?? (activeIndex + 1) / SLIDES.length;
  const audioLabel = soundEnabled ? "Mute audio" : "Enable audio";

  useEffect(() => {
    setJumpOpen(false);
  }, [activeIndex]);

  const onNavKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = Math.min(SLIDES.length - 1, index + 1);
      onJumpTo(next);
      document
        .querySelector<HTMLButtonElement>(`[data-nav-index="${next}"]`)
        ?.focus();
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      const prev = Math.max(0, index - 1);
      onJumpTo(prev);
      document
        .querySelector<HTMLButtonElement>(`[data-nav-index="${prev}"]`)
        ?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      onJumpTo(0);
      document.querySelector<HTMLButtonElement>('[data-nav-index="0"]')?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      const last = SLIDES.length - 1;
      onJumpTo(last);
      document
        .querySelector<HTMLButtonElement>(`[data-nav-index="${last}"]`)
        ?.focus();
    }
  };

  return (
    <>
      <div className="experience-progress-track" aria-hidden>
        <div
          className="experience-progress"
          data-experience-progress
          style={{
            transform: `scaleY(${progressFraction})`,
          }}
        />
      </div>

      <div
        className="experience-orientation"
        data-experience-orientation
        aria-live="polite"
      >
        <span className="experience-scene-counter">{sceneCounter}</span>
        <span className="experience-chapter-label">{chapter.label}</span>
      </div>

      {showAffiliateCta && ctaLinks ? (
        <div className="experience-affiliate-cta" data-affiliate-cta>
          <a
            className="experience-affiliate-cta-link ui-btn ui-btn-default ui-btn-sm experience-touch-target"
            href={ctaLinks.primary}
          >
            Get your affiliate link
          </a>
        </div>
      ) : null}

      {layout === "compact" ? (
        <div
          className="experience-compact-nav"
          data-nav-mode="compact"
          data-experience-compact-nav
        >
          <Button
            variant="outline"
            size="sm"
            className="experience-touch-target"
            aria-expanded={jumpOpen}
            aria-controls={jumpSelectId}
            onClick={() => setJumpOpen((open) => !open)}
          >
            Jump to scene
          </Button>
          {jumpOpen ? (
            <label className="experience-jump-label" htmlFor={jumpSelectId}>
              <span className="sr-only">Jump to scene</span>
              <select
                id={jumpSelectId}
                className="experience-jump-select"
                value={activeIndex}
                onChange={(event) => {
                  onJumpTo(Number(event.target.value));
                  setJumpOpen(false);
                }}
              >
                {SLIDES.map((slide, index) => (
                  <option key={slide.id} value={index}>
                    {formatSceneCounter(index)} — {slide.headline}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ) : (
        <nav
          className="experience-navigator"
          aria-label="Scene navigator"
          data-experience-navigator
          data-nav-mode="default"
        >
          <ol className="experience-nav-list">
            {SLIDES.map((slide, index) => {
              const current = index === activeIndex;
              return (
                <li key={slide.id}>
                  <button
                    type="button"
                    className={
                      current
                        ? "experience-nav-step active"
                        : "experience-nav-step"
                    }
                    aria-label={`Scene ${index + 1}: ${slide.headline}`}
                    aria-current={current ? "true" : undefined}
                    data-nav-index={index}
                    onClick={() => onJumpTo(index)}
                    onKeyDown={(event) => onNavKeyDown(event, index)}
                  >
                    <span className="experience-nav-hit" aria-hidden />
                    <span className="experience-nav-label">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="experience-controls">
        <Tooltip content={audioLabel}>
          <Button
            variant="outline"
            size="sm"
            className="experience-touch-target"
            aria-pressed={soundEnabled}
            aria-label={audioLabel}
            data-sound-toggle
            onClick={onToggleSound}
          >
            {soundEnabled ? "Mute audio" : "Enable audio"}
          </Button>
        </Tooltip>
      </div>
    </>
  );
}
