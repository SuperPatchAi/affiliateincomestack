import type { Slide as SlideData } from "../data/slides";
import {
  fittedSizePct,
  heroSrc,
  TITLE_SLAB_BASE,
  TITLE_SLAB_SRCS,
} from "../data/slides";
import { shouldShowLiveAnnotations } from "../remotion/labels";
import { Flywheel } from "./Flywheel";

type Props = {
  slide: SlideData;
  index: number;
};

export function Slide({ slide, index }: Props) {
  const mediaSide = index % 2 === 0 ? "media-first" : "copy-first";
  const showCornerFlywheel =
    Boolean(slide.flywheelArc) && slide.motionPreset !== "flywheel-scrub";
  const videoSrc = heroSrc(slide);
  const showAnnotations = shouldShowLiveAnnotations(slide);

  return (
    <section
      className={`deck-slide accent-${slide.accent} layout-${mediaSide}`}
      data-slide={slide.id}
      data-motion={slide.motionPreset}
      data-layout="fluid"
      aria-label={`Slide ${index + 1}: ${slide.headline}`}
    >
      <div className="slide-inner">
        <div className="slide-media-col" data-slide-media>
          <figure className="slide-media-frame">
            {videoSrc ? (
              <video
                className="slide-plate"
                src={videoSrc}
                poster={slide.conceptSrc}
                autoPlay
                muted
                loop
                playsInline
                data-slide-plate
              />
            ) : slide.motionPreset === "parallax-slabs" ? (
              <>
                <img
                  className="slide-plate"
                  src={TITLE_SLAB_BASE}
                  alt=""
                  width={1920}
                  height={1080}
                  decoding="async"
                  loading="eager"
                  data-slide-plate
                />
                <div className="slab-stack" aria-hidden>
                  {TITLE_SLAB_SRCS.map((src, i) => (
                    <img
                      key={src}
                      className="slide-plate slab"
                      src={src}
                      alt=""
                      width={1920}
                      height={1080}
                      decoding="async"
                      loading="eager"
                      data-slab
                      data-slab-index={i}
                    />
                  ))}
                </div>
              </>
            ) : (
              <img
                className="slide-plate"
                src={slide.conceptSrc}
                alt=""
                width={1920}
                height={1080}
                decoding="async"
                loading={index < 2 ? "eager" : "lazy"}
                data-slide-plate
              />
            )}
            <div className="slide-media-glow" aria-hidden />

            {showAnnotations && slide.annotations?.length ? (
              <div className="plate-annotations" data-annotation-layer aria-hidden>
                {slide.annotations.map((annotation, i) => (
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
                ))}
              </div>
            ) : null}
          </figure>

          {slide.motionPreset === "flywheel-scrub" ? (
            <div className="slide-flywheel-hero" data-flywheel-wrap>
              <Flywheel active={slide.flywheelArc ?? "all"} size="hero" />
            </div>
          ) : null}
        </div>

        <div className="slide-copy-col" data-slide-copy>
          {showCornerFlywheel ? (
            <div className="slide-flywheel-inline" data-flywheel-wrap>
              <Flywheel active={slide.flywheelArc} size="corner" />
            </div>
          ) : null}
          <p className="slide-eyebrow" data-anim="eyebrow">
            {slide.eyebrow}
          </p>
          <h2 className="slide-headline" data-anim="headline">
            {slide.headline}
          </h2>
          <p className="slide-body" data-anim="body">
            {slide.onScreenBody?.trim() ? slide.onScreenBody : slide.body}
          </p>
          {slide.ctaPrimary || slide.ctaSecondary ? (
            <div className="slide-cta-group" data-anim="cta">
              {slide.ctaPrimary ? (
                <span className="slide-cta-primary" data-cta="primary">
                  {slide.ctaPrimary}
                </span>
              ) : null}
              {slide.ctaSecondary ? (
                <span className="slide-cta-secondary" data-cta="secondary">
                  {slide.ctaSecondary}
                </span>
              ) : null}
            </div>
          ) : null}
          {slide.disclosure ? (
            <p className="slide-disclosure" data-anim="disclosure">
              {slide.disclosure}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
