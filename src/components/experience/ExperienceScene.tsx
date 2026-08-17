import type { ExperienceAspect } from "../../data/experienceMedia";
import {
  experienceMediaForSlide,
  resolveExperienceSrc,
} from "../../data/experienceMedia";
import { type Slide as SlideData } from "../../data/slides";
import {
  INCOME_STREAMS,
  activeStacksForSlide,
  isIncomeStreamSlide,
  isStreamIndexSlide,
} from "../../data/streamIndex";
import type { SceneLifecycle } from "../../motion/experienceMotionConfig";
import { Flywheel } from "../Flywheel";
import { ChipStage } from "./ChipStage";
import type { ProductionCtaLinks } from "./ctaLinks";
import { SceneHero3d } from "./SceneHero3d";
import { isHero3dExperienceSlide } from "./hero3dExperienceSlide";
import { SceneVideo } from "./SceneVideo";

/** Scene 01 product caption — rendered uppercase via CSS; headline stays sentence case for aria. */
const HERO_CAPTION_LINES = ["The SuperPatch", "Super Stack"] as const;

type Props = {
  slide: SlideData;
  index: number;
  aspect: ExperienceAspect;
  attachVideo: boolean;
  autoplay: boolean;
  soundEnabled: boolean;
  lifecycle: SceneLifecycle;
  motionLayerActive?: boolean;
  compact?: boolean;
  ctaLinks?: ProductionCtaLinks | null;
  reduceMotion?: boolean;
};

export function ExperienceScene({
  slide,
  index,
  aspect,
  attachVideo,
  autoplay,
  soundEnabled,
  lifecycle,
  motionLayerActive = true,
  ctaLinks = null,
  reduceMotion = false,
}: Props) {
  const media = experienceMediaForSlide(slide.id);
  if (!media) {
    throw new Error(`Missing experience media for ${slide.id}`);
  }
  const variant = resolveExperienceSrc(media, aspect);
  const HeadingTag = index === 0 ? "h1" : "h2";
  const showStreamIndex = isStreamIndexSlide(slide.id);
  const showSpine = isIncomeStreamSlide(slide.id);
  const activeStacks = new Set(activeStacksForSlide(slide.id));
  const body = slide.onScreenBody?.trim() ? slide.onScreenBody : slide.body;
  const hero3d = isHero3dExperienceSlide(slide.id);
  const pinDisclosure = Boolean(slide.chips?.length && slide.disclosure);

  return (
    <section
      id={`scene-${slide.id}`}
      className={`experience-scene accent-${slide.accent}`}
      data-experience-scene
      data-slide={slide.id}
      data-motion={slide.motionPreset}
      data-scene-lifecycle={lifecycle}
      data-motion-layer-active={motionLayerActive ? "true" : "false"}
      data-hero3d={hero3d ? "true" : "false"}
      aria-label={`Scene ${index + 1}: ${slide.headline}`}
      style={{ zIndex: index + 1 }}
    >
      <div className="scene-sticky" data-scene-sticky>
        <div className="scene-card" data-scene-card>
          <div className="scene-plane" data-scene-plane>
            {hero3d ? (
              <SceneHero3d
                // Mount while the title scene is the active play target.
                // Do not gate on attachVideo/data-save — that forced the Omni poster on mobile.
                active={autoplay || lifecycle === "active"}
                reducedMotion={reduceMotion}
                poster={variant.poster}
                priority={index === 0}
              />
            ) : (
              <SceneVideo
                variant={variant}
                attachVideo={attachVideo}
                autoplay={autoplay}
                muted={!soundEnabled}
                priority={index === 0}
              />
            )}
          </div>

          <div className="scene-scrim" data-scene-scrim aria-hidden="true" />

          {slide.chips?.length ? <ChipStage chips={slide.chips} /> : null}

          {slide.copyLayout === "hero-caption" ? (
            <div className="scene-copy-hero" data-scene-copy-hero>
              <HeadingTag
                className="scene-hero-title"
                data-anim="headline"
                aria-label={slide.headline}
              >
                {HERO_CAPTION_LINES.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </HeadingTag>
            </div>
          ) : (
            <div
              className="scene-copy"
              data-scene-copy
              tabIndex={0}
              aria-label={`${slide.headline} scene copy`}
            >
              {slide.flywheelArc ? (
                <div className="scene-flywheel" data-flywheel-wrap>
                  <Flywheel active={slide.flywheelArc} size="corner" />
                </div>
              ) : null}
              <p
                className="scene-eyebrow"
                data-anim="eyebrow"
                data-anim-layer="eyebrow"
              >
                {slide.eyebrow}
              </p>
              <HeadingTag
                className="scene-headline"
                data-anim="headline"
                data-anim-layer="headline"
              >
                {slide.headline}
              </HeadingTag>
              <p className="scene-body" data-anim="body" data-anim-layer="body">
                {body}
              </p>
        {slide.chips?.length ? (
          <ul className="scene-chip-list" data-chip-fallback>
            {slide.chips.map((chip) => (
              <li key={chip.label}>
                <strong>{chip.label}</strong> {chip.sub}
              </li>
            ))}
          </ul>
        ) : null}
            {showStreamIndex ? (
              <ol className="stream-index" data-stream-index data-anim="body">
                {INCOME_STREAMS.map((stream) => (
                  <li key={stream.id} data-stream-item>
                    <span className="stream-index-num">
                      {String(stream.stackNumber).padStart(2, "0")}
                    </span>
                    <span className="stream-index-label">{stream.shortLabel}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            {showSpine ? (
              <div
                className="progress-spine"
                data-progress-spine
                role="group"
                aria-label={`Income stacks ${[...activeStacks].join(" and ")} of ten`}
              >
                {INCOME_STREAMS.map((stream) => (
                  <span
                    key={stream.id}
                    className={
                      activeStacks.has(stream.stackNumber)
                        ? "spine-dot active"
                        : "spine-dot"
                    }
                    data-spine-dot
                    data-active={
                      activeStacks.has(stream.stackNumber) ? "true" : "false"
                    }
                    data-stack={stream.stackNumber}
                  />
                ))}
              </div>
            ) : null}
            {slide.ctaPrimary || slide.ctaSecondary ? (
              <div
                className="scene-cta-group"
                data-anim="cta"
                data-anim-layer="cta"
              >
                {slide.ctaPrimary && ctaLinks ? (
                  <a
                    className="scene-cta-primary"
                    data-cta="primary"
                    href={ctaLinks.primary}
                  >
                    {slide.ctaPrimary}
                  </a>
                ) : null}
                {slide.ctaSecondary && ctaLinks ? (
                  <a
                    className="scene-cta-secondary"
                    data-cta="secondary"
                    href={ctaLinks.secondary}
                  >
                    {slide.ctaSecondary}
                  </a>
                ) : null}
              </div>
            ) : null}
            {!pinDisclosure && slide.disclosure ? (
              <p
                className="scene-disclosure"
                data-anim="disclosure"
                data-anim-layer="disclosure"
              >
                {slide.disclosure}
              </p>
            ) : null}
            </div>
          )}
          {pinDisclosure ? (
            <p
              className="scene-disclosure scene-disclosure-pinned"
              data-anim-layer="disclosure"
              data-disclosure-pinned
            >
              {slide.disclosure}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
