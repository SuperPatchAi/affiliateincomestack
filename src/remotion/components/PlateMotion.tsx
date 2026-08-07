import type { ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { MotionBeat } from "../../motion/presets";

type Props = {
  beat: MotionBeat;
  /** Current ambient scale from getMotionPhases (already interpolated). */
  ambientScale: number;
  /**
   * When false (hero video), skip plate entrance spring — ambient only.
   */
  entrance?: boolean;
  children: ReactNode;
};

/**
 * Applies registry plate entrance (from → identity) plus ambient Ken Burns drift.
 */
export function PlateMotion({
  beat,
  ambientScale,
  entrance = true,
  children,
}: Props) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const from = beat.plate.from;

  const enter = entrance
    ? spring({
        frame,
        fps,
        config: { damping: 18, stiffness: 120, mass: 0.75 },
        durationInFrames: beat.plate.durationFrames,
      })
    : 1;

  const opacity = entrance
    ? interpolate(enter, [0, 1], [from.opacity, 1])
    : 1;
  const y = entrance ? interpolate(enter, [0, 1], [from.y, 0]) : 0;
  const baseScale = entrance
    ? interpolate(enter, [0, 1], [from.scale, 1])
    : 1;
  const rotateX = entrance
    ? interpolate(enter, [0, 1], [from.rotateX, 0])
    : 0;
  const brightness = entrance
    ? interpolate(enter, [0, 1], [from.brightness, 1])
    : 1;

  const ambientY = interpolate(
    frame,
    [0, durationInFrames],
    [0, beat.ambientYPercent],
    { extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(calc(${y}px + ${ambientY}%)) scale(${baseScale * ambientScale}) rotateX(${rotateX}deg)`,
        filter: `brightness(${brightness})`,
        transformOrigin: "center center",
        perspective: 1200,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
