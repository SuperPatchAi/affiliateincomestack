import type { ExperienceAspect } from "../../data/experienceMedia";
import {
  experienceMediaForSlide,
  resolveExperienceSrc,
} from "../../data/experienceMedia";
import {
  fittedSizePct,
  type Slide as SlideData,
} from "../../data/slides";
import {
  INCOME_STREAMS,
  activeStacksForSlide,
  isIncomeStreamSlide,
  isStreamIndexSlide,
} from "../../data/streamIndex";
import { shouldShowLiveAnnotations } from "../../remotion/labels";
import type { SceneLifecycle } from "../../motion/experienceMotionConfig";
import { Flywheel } from "../Flywheel";
import type { ProductionCtaLinks } from "./ctaLinks";
import { SceneVideo } from "./SceneVideo";

type Props = {
  slide: SlideData;
  index: number;
  aspect: ExperienceAspect;
  attachVideo: boolean;
  autoplay: boolean;
  soundEnabled: boolean;
  lifecycle: SceneLifecycle;
  motionLayerActive?: boolean;
  ctaLinks?: ProductionCtaLinks | null;
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
}: Props) {
  const media = experienceMediaForSlide(slide.id);
  if (!media) {
    throw new Error(`Missing experience media for ${slide.id}`);
  }
  const variant = resolveExperienceSrc(media, aspect);
  const HeadingTag = index === 0 ? "h1" : "h2";
  const showAnnotations = shouldShowLiveAnnotations(slide);
  const showStreamIndex = isStreamIndexSlide(slide.id);
  const showSpine = isIncomeStreamSlide(slide.id);
  const activeStacks = new Set(activeStacksForSlide(slide.id));
  const body = slide.onScreenBody?.trim() ? slide.onScreenBody : slide.body;

  return (
    <section
      id={`scene-${slide.id}`}
      className={`experience-scene accent-${slide.accent}`}
      data-experience-scene
      data-slide={slide.id}
      data-motion={slide.motionPreset}
      data-scene-lifecycle={lifecycle}
      data-motion-layer-active={motionLayerActive ? "true" : "false"}
      aria-label={`Scene ${index + 1}: ${slide.headline}`}
      style={{ zIndex: index + 1 }}
    >
      <div className="scene-sticky" data-scene-sticky>
        <div className="scene-card" data-scene-card>
          <div className="scene-plane" data-scene-plane>
            <SceneVideo
              variant={variant}
              attachVideo={attachVideo}
              autoplay={autoplay}
              muted={!soundEnabled}
              priority={index === 0}
            />
            {showAnnotations && slide.annotations?.length ? (
              <div className="scene-annotations" data-annotation-layer aria-hidden>
                {motionLayerActive
                  ? slide.annotations.map((annotation, i) => (
                      <span
                        key={`${annotation.text}-${i}`}
                        className={`plate-annotation role-${annotation.role}`}
                        style={{
                          left: `${annotation.xPct}%`,
                          top: `${annotation.yPct}%`,
                          fontSize: `${fittedSizePct(annotation)}cqh`,
                        }}
                        data-plate-annotation
                        data-anim="annotation"
                      >
                        {annotation.text}
                      </span>
                    ))
                  : null}
              </div>
            ) : null}
          </div>

          <div className="scene-scrim" data-scene-scrim aria-hidden="true" />

          <div className="scene-copy" data-scene-copy>
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
          {slide.disclosure ? (
            <p
              className="scene-disclosure"
              data-anim="disclosure"
              data-anim-layer="disclosure"
            >
              {slide.disclosure}
            </p>
          ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
