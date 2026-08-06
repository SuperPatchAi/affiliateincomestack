import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export type EndCardProps = {
  ctaPrimary: string;
  ctaSecondary: string;
  disclosure: string;
  /** Frame when the card begins fading in (after copy settles). */
  startFrame?: number;
};

/**
 * Closing end card: primary CTA, secondary disclosure CTA, and income disclosure ≥16px.
 */
export function EndCard({
  ctaPrimary,
  ctaSecondary,
  disclosure,
  startFrame = 0,
}: EndCardProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 22, stiffness: 120, mass: 0.7 },
  });
  const y = interpolate(enter, [0, 1], [20, 0]);

  return (
    <div
      data-end-card
      style={{
        position: "absolute",
        left: 72,
        right: 72,
        bottom: 48,
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxWidth: 720,
        opacity: enter,
        transform: `translateY(${y}px)`,
        fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        data-cta-primary
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          padding: "14px 28px",
          backgroundColor: COLORS.red,
          color: COLORS.text,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "0.01em",
          borderRadius: 4,
        }}
      >
        {ctaPrimary}
      </div>
      <div
        data-cta-secondary
        style={{
          color: COLORS.redText,
          fontWeight: 700,
          fontSize: 18,
          textDecoration: "underline",
          textUnderlineOffset: 4,
        }}
      >
        {ctaSecondary}
      </div>
      <p
        data-end-disclosure
        style={{
          margin: 0,
          color: COLORS.fine,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: 1.45,
          maxWidth: 640,
        }}
      >
        {disclosure}
      </p>
    </div>
  );
}
