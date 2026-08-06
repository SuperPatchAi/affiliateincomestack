import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  INCOME_STREAMS,
  RECAP_OVERLAY_TEXT,
} from "../../data/streamIndex";
import { COLORS } from "../theme";

export type StreamIndexOverlayProps = {
  mode: "index" | "recap";
  /** Frame when the overlay begins fading in. */
  startFrame?: number;
};

/**
 * Slide 06 index list, or slide 14 Option A recap beat (“You've seen all ten stacks”).
 */
export function StreamIndexOverlay({
  mode,
  startFrame = 0,
}: StreamIndexOverlayProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 20, stiffness: 110, mass: 0.75 },
  });
  const y = interpolate(enter, [0, 1], [16, 0]);

  if (mode === "recap") {
    return (
      <div
        data-recap-overlay
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 56,
          zIndex: 7,
          opacity: enter,
          transform: `translateY(${y}px)`,
          fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: "0.01em",
          color: COLORS.text,
          textShadow: "0 2px 18px rgba(0,0,0,0.55)",
        }}
      >
        {RECAP_OVERLAY_TEXT}
      </div>
    );
  }

  return (
    <ol
      data-stream-index-overlay
      style={{
        position: "absolute",
        top: 120,
        right: 56,
        zIndex: 6,
        margin: 0,
        padding: "18px 22px",
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        maxWidth: 360,
        opacity: enter,
        transform: `translateY(${y}px)`,
        background:
          "linear-gradient(180deg, rgba(5,7,15,0.72), rgba(5,7,15,0.42))",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 6,
        fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
      }}
    >
      {INCOME_STREAMS.map((stream) => (
        <li
          key={stream.id}
          data-stream-item
          style={{
            display: "flex",
            gap: 10,
            alignItems: "baseline",
            color: COLORS.text,
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.35,
          }}
        >
          <span
            style={{
              color: COLORS.orange,
              fontVariantNumeric: "tabular-nums",
              minWidth: 22,
            }}
          >
            {String(stream.stackNumber).padStart(2, "0")}
          </span>
          <span>{stream.shortLabel}</span>
        </li>
      ))}
    </ol>
  );
}
