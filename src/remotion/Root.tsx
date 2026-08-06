import { Composition } from "remotion";
import { IncomeStackFilm } from "./IncomeStackFilm";
import { SLIDES } from "../data/slides";
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
      durationInFrames={filmDurationInFrames(SLIDES)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
}
