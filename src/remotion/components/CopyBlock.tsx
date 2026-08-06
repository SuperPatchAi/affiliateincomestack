import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CSSProperties } from "react";
import type { Slide } from "../../data/slides";
import { accentTextColor } from "../theme";
import { KineticHeadline } from "./KineticHeadline";
import { COLORS } from "../theme";

type Anchor = "bl" | "br" | "tl" | "tr";

type Props = {
  slide: Slide;
  anchor?: Anchor;
  eyebrowStart?: number;
  bodyStart?: number;
  disclosureStart?: number;
};

const ANCHOR_STYLE: Record<Anchor, CSSProperties> = {
  bl: { left: 72, bottom: 64, right: "auto", top: "auto" },
  br: { right: 72, bottom: 64, left: "auto", top: "auto" },
  tl: { left: 72, top: 64, right: "auto", bottom: "auto" },
  tr: { right: 72, top: 64, left: "auto", bottom: "auto" },
};

export function CopyBlock({
  slide,
  anchor = "bl",
  eyebrowStart = 4,
  bodyStart = 22,
  disclosureStart = 40,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eyebrowColor = accentTextColor(slide.accent);

  const eyebrowIn = spring({
    frame: Math.max(0, frame - eyebrowStart),
    fps,
    config: { damping: 20, stiffness: 160, mass: 0.5 },
  });
  const bodyIn = spring({
    frame: Math.max(0, frame - bodyStart),
    fps,
    config: { damping: 22, stiffness: 120, mass: 0.7 },
  });
  const disclosureIn = interpolate(
    frame,
    [disclosureStart, disclosureStart + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const topHeavy = anchor === "tl" || anchor === "tr";

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 4,
        maxWidth: 640,
        ...ANCHOR_STYLE[anchor],
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: topHeavy ? "-24px -32px 40% -32px" : "30% -32px -28px -32px",
          background: topHeavy
            ? "linear-gradient(180deg, rgba(5,7,15,0.92) 0%, rgba(5,7,15,0.55) 70%, transparent 100%)"
            : "linear-gradient(0deg, rgba(5,7,15,0.92) 0%, rgba(5,7,15,0.55) 70%, transparent 100%)",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      <div
        style={{
          fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "0.02em",
          color: eyebrowColor,
          opacity: eyebrowIn,
          transform: `translateY(${interpolate(eyebrowIn, [0, 1], [12, 0])}px)`,
          marginBottom: 14,
          textTransform: "none",
        }}
      >
        {slide.eyebrow}
      </div>
      <KineticHeadline
        text={slide.headline}
        fontSize={48}
        delayFrames={eyebrowStart + 4}
      />
      <p
        style={{
          margin: "18px 0 0",
          fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
          fontWeight: 500,
          fontSize: 22,
          lineHeight: 1.5,
          color: COLORS.muted,
          opacity: bodyIn,
          transform: `translateY(${interpolate(bodyIn, [0, 1], [16, 0])}px)`,
        }}
      >
        {slide.onScreenBody?.trim() ? slide.onScreenBody : slide.body}
      </p>
      {/* EndCard owns disclosure + CTAs when ctaPrimary is present. */}
      {slide.disclosure && !slide.ctaPrimary ? (
        <p
          style={{
            margin: "14px 0 0",
            fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            lineHeight: 1.4,
            color: COLORS.fine,
            opacity: disclosureIn,
          }}
        >
          {slide.disclosure}
        </p>
      ) : null}
    </div>
  );
}
