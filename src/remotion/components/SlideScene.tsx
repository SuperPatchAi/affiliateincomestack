import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { hasEndCard, heroSrc, type Slide } from "../../data/slides";
import {
  RECAP_WINDOW_SEC,
  activeStacksForSlide,
  isIncomeStreamSlide,
  isRecapSlide,
  isStreamIndexSlide,
} from "../../data/streamIndex";
import { pickCopyAnchor } from "../layout";
import { shouldShowLiveAnnotations } from "../labels";
import { getMotionPhases } from "../motion/gating";
import { getMotionBeat } from "../../motion/presets";
import { publicAssetPath } from "../timeline";
import { COLORS } from "../theme";
import { AnnotationLayers, SlabDropLayers } from "./DiagramLayers";
import { CopyBlock } from "./CopyBlock";
import { EndCard } from "./EndCard";
import { FlywheelRemotion } from "./FlywheelRemotion";
import { PlateMotion } from "./PlateMotion";
import { ProgressSpine } from "./ProgressSpine";
import { StreamIndexOverlay } from "./StreamIndexOverlay";
import { copyEyebrowDelay, flywheelPlacement } from "./flywheelPlacement";

type Props = {
  slide: Slide;
};

export function SlideScene({ slide }: Props) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const beat = getMotionBeat(slide.motionPreset);
  const liveAnnotations = shouldShowLiveAnnotations(slide);
  const picked = pickCopyAnchor(slide);
  // Closing CTAs sit in the lower third — park copy top-left so they don't collide.
  const endCard = hasEndCard(slide);
  const anchor = endCard ? "tl" : picked.anchor;
  const showAnnotations = picked.showAnnotations;
  const videoSrc = heroSrc(slide);
  const useSlabs = !videoSrc && slide.motionPreset === "parallax-slabs";
  const placement = flywheelPlacement(slide);
  const showSpine = isIncomeStreamSlide(slide.id);
  const showIndex = isStreamIndexSlide(slide.id);
  const recapStart = durationInFrames - Math.round(RECAP_WINDOW_SEC * fps);
  const showRecap = isRecapSlide(slide.id) && frame >= recapStart;
  const spineComplete = showRecap;
  const activeStacks = spineComplete
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    : activeStacksForSlide(slide.id);

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

      {/* Layer D — progress spine (income slides) + stream index / recap */}
      {showSpine ? (
        <ProgressSpine
          activeStacks={activeStacks}
          accent={slide.accent}
          complete={spineComplete}
        />
      ) : null}
      {showIndex ? (
        <StreamIndexOverlay mode="index" startFrame={bodyStart} />
      ) : null}
      {showRecap ? (
        <StreamIndexOverlay mode="recap" startFrame={recapStart} />
      ) : null}

      {/* Layer E — closing end card (CTAs + disclosure ≥16px) */}
      {hasEndCard(slide) ? (
        <EndCard
          ctaPrimary={slide.ctaPrimary}
          ctaSecondary={slide.ctaSecondary}
          disclosure={slide.disclosure}
          startFrame={disclosureStart}
        />
      ) : null}
    </AbsoluteFill>
  );
}
