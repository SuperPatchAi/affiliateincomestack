import type { FlywheelArc } from "../data/slides";

const ARCS: { id: FlywheelArc; label: string; color: string }[] = [
  { id: "product", label: "Product", color: "var(--sp-blue)" },
  { id: "brand", label: "Brand", color: "var(--sp-green)" },
  { id: "income", label: "Income", color: "var(--sp-orange)" },
  { id: "development", label: "Development", color: "var(--sp-violet)" },
];

type Props = {
  active?: FlywheelArc;
  size?: "corner" | "hero";
  className?: string;
};

export function Flywheel({ active = "all", size = "corner", className = "" }: Props) {
  const dim = size === "hero" ? 280 : 72;
  const stroke = size === "hero" ? 14 : 6;

  return (
    <svg
      className={`flywheel ${className}`}
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      aria-hidden
      data-flywheel={active}
    >
      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      {ARCS.map((arc, i) => {
        const start = i * 90 - 90;
        const lit = active === "all" || active === arc.id;
        return (
          <path
            key={arc.id}
            d={describeArc(50, 50, 38, start, start + 80)}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            opacity={lit ? 1 : 0.18}
            className="flywheel-arc"
            data-arc={arc.id}
          />
        );
      })}
      <circle cx="50" cy="50" r="10" fill="rgba(5,7,15,0.9)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      {size === "hero" ? (
        <text
          x="50"
          y="53"
          textAnchor="middle"
          fill="var(--sp-text)"
          fontSize="5"
          fontFamily="var(--font-display)"
          fontWeight="700"
        >
          FULL STACK
        </text>
      ) : null}
    </svg>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}
