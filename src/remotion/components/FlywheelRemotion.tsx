import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { FlywheelArc } from "../../data/slides";
import { COLORS } from "../theme";

const ARCS: { id: Exclude<FlywheelArc, "all">; label: string; color: string }[] =
  [
    { id: "product", label: "Product", color: COLORS.blue },
    { id: "brand", label: "Brand", color: COLORS.green },
    { id: "income", label: "Income", color: COLORS.orange },
    { id: "development", label: "Development", color: COLORS.violet },
  ];

type Props = {
  active?: FlywheelArc;
  size?: "corner" | "hero";
  startFrame?: number;
};

/**
 * Remotion-safe flywheel using theme hex colors (CSS vars are not loaded in Studio).
 */
export function FlywheelRemotion({
  active = "all",
  size = "corner",
  startFrame = 0,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dim = size === "hero" ? 280 : 96;
  const stroke = size === "hero" ? 14 : 7;

  const wrapStyle =
    size === "hero"
      ? {
          right: 48,
          bottom: 48,
          width: dim,
          height: dim,
          filter: "drop-shadow(0 0 18px rgba(47, 107, 255, 0.35))",
        }
      : {
          right: 48,
          top: 48,
          width: dim,
          height: dim,
        };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 3 }}>
      <div
        style={{
          position: "absolute",
          ...wrapStyle,
        }}
      >
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 100 100"
          aria-hidden
          data-flywheel={active}
        >
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          {ARCS.map((arc, i) => {
            const start = i * 90 - 90;
            const lit = active === "all" || active === arc.id;
            const local = Math.max(0, frame - startFrame - i * 3);
            const enter = spring({
              frame: local,
              fps,
              config: { damping: 16, stiffness: 140, mass: 0.6 },
            });
            const opacity = lit
              ? interpolate(enter, [0, 1], [0.12, 1])
              : 0.18;
            return (
              <path
                key={arc.id}
                d={describeArc(50, 50, 38, start, start + 80)}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                opacity={opacity}
                data-arc={arc.id}
              />
            );
          })}
          <circle
            cx="50"
            cy="50"
            r="10"
            fill="rgba(5,7,15,0.9)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
          {size === "hero" ? (
            <text
              x="50"
              y="53"
              textAnchor="middle"
              fill={COLORS.text}
              fontSize="5"
              fontFamily="Montserrat, Helvetica, Arial, sans-serif"
              fontWeight="700"
            >
              FULL STACK
            </text>
          ) : null}
        </svg>
      </div>
    </AbsoluteFill>
  );
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}
