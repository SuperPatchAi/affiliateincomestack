import type { Slide as SlideData } from "../data/slides";
import { Flywheel } from "./Flywheel";

type Props = {
  slide: SlideData;
  index: number;
};

export function Slide({ slide, index }: Props) {
  const mediaSide = index % 2 === 0 ? "media-first" : "copy-first";
  const showCornerFlywheel =
    Boolean(slide.flywheelArc) && slide.motionPreset !== "flywheel-scrub";

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
            {slide.heroVideoSrc ? (
              <video
                className="slide-plate"
                src={slide.heroVideoSrc}
                poster={slide.conceptSrc}
                autoPlay
                muted
                loop
                playsInline
                data-slide-plate
              />
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
            {slide.body}
          </p>
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
