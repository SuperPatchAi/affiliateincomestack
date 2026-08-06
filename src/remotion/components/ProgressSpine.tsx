import type { SlideAccent } from "../../data/slides";
import { INCOME_STREAMS } from "../../data/streamIndex";
import { accentColor, COLORS } from "../theme";

export type ProgressSpineProps = {
  activeStacks: number[];
  accent: SlideAccent;
  /** When true, every stack reads as complete (recap beat). */
  complete?: boolean;
};

/**
 * Compact left-rail of ten dots for income slides 07–14.
 * Left placement avoids collision with the corner flywheel (top-right).
 * Active stacks fill the slide accent; completed recap fills all.
 */
export function ProgressSpine({
  activeStacks,
  accent,
  complete = false,
}: ProgressSpineProps) {
  const fill = accentColor(accent);
  const active = new Set(activeStacks);

  return (
    <div
      data-progress-spine
      style={{
        position: "absolute",
        top: 36,
        left: 48,
        zIndex: 6,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
      }}
      aria-hidden
    >
      {INCOME_STREAMS.map((stream) => {
        const isActive = complete || active.has(stream.stackNumber);
        const isComplete = complete;
        return (
          <div
            key={stream.id}
            data-spine-dot
            data-stack={stream.stackNumber}
            data-active={isActive ? "true" : "false"}
            data-complete={isComplete ? "true" : "false"}
            title={`${stream.stackNumber}. ${stream.shortLabel}`}
            style={{
              width: isActive ? 10 : 8,
              height: isActive ? 10 : 8,
              borderRadius: 999,
              backgroundColor: isActive ? fill : "rgba(255,255,255,0.22)",
              boxShadow: isActive ? `0 0 10px ${fill}88` : "none",
              border: isComplete
                ? `1px solid ${COLORS.text}`
                : "1px solid transparent",
            }}
          />
        );
      })}
    </div>
  );
}
