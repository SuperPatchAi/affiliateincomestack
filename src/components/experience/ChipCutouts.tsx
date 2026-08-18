import type { ChipCutoutEntry } from "../../data/chipImagery";

/**
 * Isolated photoreal cutouts stacked in the scene plane. GSAP owns opacity,
 * scale, and path — layers start hidden.
 */
export function ChipCutouts({ entries }: { entries: ChipCutoutEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="chip-cutouts" data-chip-cutouts aria-hidden="true">
      {entries.map((entry, index) => (
        <div
          key={entry.slug}
          className="chip-cutout"
          data-chip-cutout
          data-chip-index={index}
        >
          <img src={entry.src} alt="" draggable={false} />
        </div>
      ))}
    </div>
  );
}
