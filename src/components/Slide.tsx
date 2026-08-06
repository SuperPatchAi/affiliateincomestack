import type { Slide as SlideData } from "../data/slides";
import { Flywheel } from "./Flywheel";

type Props = {
  slide: SlideData;
  index: number;
};

export function Slide({ slide, index }: Props) {
  const showCornerFlywheel = Boolean(slide.flywheelArc) && slide.motionPreset !== "flywheel-scrub";

  return (
    <section
      className={`deck-slide accent-${slide.accent}`}
      data-slide={slide.id}
      data-motion={slide.motionPreset}
      aria-label={`Slide ${index + 1}: ${slide.headline}`}
    >
      <div className="slide-media" data-slide-media>
        {slide.heroVideoSrc ? (
          <video
            className="slide-plate"
            src={slide.heroVideoSrc}
            poster={slide.conceptSrc}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img className="slide-plate" src={slide.conceptSrc} alt="" data-slide-plate />
        )}
        <div className="slide-scrim" />
      </div>

      {showCornerFlywheel ? (
        <div className="slide-flywheel-corner" data-flywheel-wrap>
          <Flywheel active={slide.flywheelArc} size="corner" />
        </div>
      ) : null}

      {slide.motionPreset === "flywheel-scrub" ? (
        <div className="slide-flywheel-hero" data-flywheel-wrap>
          <Flywheel active={slide.flywheelArc ?? "all"} size="hero" />
        </div>
      ) : null}

      <div className="slide-copy" data-slide-copy>
        <p className="slide-eyebrow">{slide.eyebrow}</p>
        <h2 className="slide-headline">{slide.headline}</h2>
        <p className="slide-body">{slide.body}</p>
        {slide.disclosure ? <p className="slide-disclosure">{slide.disclosure}</p> : null}
      </div>
    </section>
  );
}
