import type { SequencedChip } from "../../data/slides";

/**
 * Grid-stacked chip items for the scroll-driven sequence. Purely decorative:
 * the motion hook fades items in/out; screen readers get the static
 * [data-chip-fallback] list inside the copy block instead.
 */
export function ChipStage({ chips }: { chips: SequencedChip[] }) {
  return (
    <div className="chip-stage" data-chip-stage aria-hidden="true">
      {chips.map((chip, index) => (
        <div
          key={chip.label}
          className="chip-stage-item"
          data-chip-item
          data-chip-index={index}
        >
          <p className="chip-stage-label">{chip.label}</p>
          <p className="chip-stage-sub">{chip.sub}</p>
        </div>
      ))}
    </div>
  );
}
