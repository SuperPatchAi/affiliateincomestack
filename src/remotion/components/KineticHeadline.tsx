import type { CSSProperties } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  text: string;
  color?: string;
  fontSize?: number;
  delayFrames?: number;
  style?: CSSProperties;
};

/**
 * Word-by-word spring entrance — first-class kinetic type for the film surface.
 */
export function KineticHeadline({
  text,
  color = "#ffffff",
  fontSize = 56,
  delayFrames = 8,
  style,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.trim().split(/\s+/).filter(Boolean);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.28em 0.35em",
        justifyContent: "flex-start",
        fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
        fontWeight: 900,
        fontSize,
        lineHeight: 1.05,
        letterSpacing: "-0.016em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const local = Math.max(0, frame - delayFrames - i * 3);
        const enter = spring({
          frame: local,
          fps,
          config: { damping: 16, stiffness: 140, mass: 0.7 },
        });
        const y = interpolate(enter, [0, 1], [28, 0]);
        const opacity = interpolate(enter, [0, 1], [0, 1]);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

/** Full-bleed centered kinetic line (title moments). */
export function KineticHeroLine({
  text,
  color = "#ffffff",
}: {
  text: string;
  color?: string;
}) {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 8%",
      }}
    >
      <KineticHeadline text={text} color={color} fontSize={72} delayFrames={12} />
    </AbsoluteFill>
  );
}
