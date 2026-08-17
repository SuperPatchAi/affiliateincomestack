import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { FILM_SLIDES } from "../data/slides";
import { SlideScene } from "./components/SlideScene";
import { TRANSITION_FRAMES, clipFrames } from "./timeline";
import { COLORS } from "./theme";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "700", "900"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

/**
 * Full Income Stack film: TransitionSeries fades + per-slide kinetic type + diagram layers.
 */
export function IncomeStackFilm() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily,
      }}
    >
      <TransitionSeries>
        {FILM_SLIDES.flatMap((slide, i) => {
          const sequence = (
            <TransitionSeries.Sequence
              key={slide.id}
              durationInFrames={clipFrames(slide)}
            >
              <SlideScene slide={slide} />
            </TransitionSeries.Sequence>
          );
          if (i === FILM_SLIDES.length - 1) return [sequence];
          return [
            sequence,
            <TransitionSeries.Transition
              key={`fade-after-${slide.id}`}
              presentation={fade()}
              timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
            />,
          ];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
}
