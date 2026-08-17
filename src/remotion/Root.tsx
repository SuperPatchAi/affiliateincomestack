import { Composition } from "remotion";
import { IncomeStackFilm } from "./IncomeStackFilm";
import { FILM_SLIDES } from "../data/slides";
import {
  FPS,
  HEIGHT,
  WIDTH,
  filmDurationInFrames,
} from "./timeline";

export function RemotionRoot() {
  return (
    <Composition
      id="IncomeStackFilm"
      component={IncomeStackFilm}
      durationInFrames={filmDurationInFrames(FILM_SLIDES)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
}
