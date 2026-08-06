import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { heroSrc, type Slide } from "../../data/slides";
import { pickCopyAnchor } from "../layout";
import { shouldShowLiveAnnotations } from "../labels";
import { getMotionPhases } from "../motion/gating";
import { getMotionBeat } from "../motion/presets";
import { publicAssetPath } from "../timeline";
import { COLORS } from "../theme";
import { AnnotationLayers, SlabDropLayers } from "./DiagramLayers";
import { CopyBlock } from "./CopyBlock";
import { FlywheelRemotion } from "./FlywheelRemotion";
import { PlateMotion } from "./PlateMotion";
import { copyEyebrowDelay, flywheelPlacement } from "./flywheelPlacement";

type Props = {
  slide: Slide;
};

export function SlideScene({ slide }: Props) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const beat = getMotionBeat(slide.motionPreset);
  const liveAnnotations = shouldShowLiveAnnotations(slide);
  const { anchor, showAnnotations } = pickCopyAnchor(slide);
  const videoSrc = heroSrc(slide);
  const useSlabs = !videoSrc && slide.motionPreset === "parallax-slabs";
  const placement = flywheelPlacement(slide);

  const phases = getMotionPhases({
    frame,
    durationInFrames,
    primarySettleFrames: beat.primarySettleFrames,
    secondaryPolicy: beat.secondaryPolicy,
    hasAnnotations: liveAnnotations && showAnnotations,
    ambientScale: [...beat.ambientScale] as [number, number],
  });

  const eyebrowStart = copyEyebrowDelay(phases.eyebrowStart, Boolean(videoSrc));
  const bodyDelta = phases.bodyStart - phases.eyebrowStart;
  const disclosureDelta = phases.disclosureStart - phases.eyebrowStart;
  const bodyStart = eyebrowStart + bodyDelta;
  const disclosureStart = eyebrowStart + disclosureDelta;

  const plateMedia = videoSrc ? (
    <OffthreadVideo
      src={staticFile(publicAssetPath(videoSrc))}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        objectPosition: "center",
        backgroundColor: COLORS.bg,
      }}
      muted
    />
  ) : (
    <Img
      src={staticFile(publicAssetPath(slide.conceptSrc))}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        objectPosition: "center",
      }}
    />
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Layer A — plate / hero / slabs */}
      <AbsoluteFill>
        {useSlabs ? (
          <PlateMotion
            beat={beat}
            ambientScale={phases.ambientScale}
            entrance={false}
          >
            <SlabDropLayers />
          </PlateMotion>
        ) : (
          <PlateMotion
            beat={beat}
            ambientScale={phases.ambientScale}
            entrance={!videoSrc}
          >
            {plateMedia}
          </PlateMotion>
        )}
      </AbsoluteFill>

      {/* Layer B — annotations + flywheel */}
      {showAnnotations && slide.annotations?.length ? (
        <AnnotationLayers
          annotations={slide.annotations}
          accent={slide.accent}
          startFrame={phases.annotationStart}
        />
      ) : null}

      {placement && slide.flywheelArc ? (
        <FlywheelRemotion
          active={slide.flywheelArc}
          size={placement}
          startFrame={phases.annotationStart}
        />
      ) : null}

      {/* Layer C — copy */}
      <CopyBlock
        slide={slide}
        anchor={anchor}
        eyebrowStart={eyebrowStart}
        bodyStart={bodyStart}
        disclosureStart={disclosureStart}
      />
    </AbsoluteFill>
  );
}
