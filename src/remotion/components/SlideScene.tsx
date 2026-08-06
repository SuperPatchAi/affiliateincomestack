import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Slide } from "../../data/slides";
import { pickCopyAnchor } from "../layout";
import { publicAssetPath } from "../timeline";
import { COLORS } from "../theme";
import { AnnotationLayers, SlabDropLayers } from "./DiagramLayers";
import { CopyBlock } from "./CopyBlock";

type Props = {
  slide: Slide;
};

function KenBurnsPlate({ src }: { src: string }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.04, 1.12], {
    extrapolateRight: "clamp",
  });
  return (
    <Img
      src={staticFile(publicAssetPath(src))}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        objectPosition: "center",
        transform: `scale(${scale})`,
      }}
    />
  );
}

export function SlideScene({ slide }: Props) {
  const { anchor, showAnnotations } = pickCopyAnchor(slide);
  const useSlabs =
    !slide.heroVideoSrc && slide.motionPreset === "parallax-slabs";

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill>
        {slide.heroVideoSrc ? (
          <OffthreadVideo
            src={staticFile(publicAssetPath(slide.heroVideoSrc))}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
              backgroundColor: COLORS.bg,
            }}
            muted
          />
        ) : useSlabs ? (
          <SlabDropLayers />
        ) : (
          <KenBurnsPlate src={slide.conceptSrc} />
        )}
      </AbsoluteFill>

      {showAnnotations && slide.annotations?.length ? (
        <AnnotationLayers
          annotations={slide.annotations}
          accent={slide.accent}
        />
      ) : null}

      <CopyBlock slide={slide} anchor={anchor} />
    </AbsoluteFill>
  );
}
