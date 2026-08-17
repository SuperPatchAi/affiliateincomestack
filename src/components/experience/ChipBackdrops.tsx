import type { ChipMediaEntry } from "../../data/chipImagery";

/**
 * Per-chip omni backdrop layers stacked inside the scene plane. Playback is
 * owned by the chip auto-cycle (see useExperienceMotion/chipAutoCycle): each
 * 8s clip plays once and its `ended` event advances the sequence, so videos
 * are rendered paused with no loop. In data-save mode only the text-free
 * still (poster) is shown.
 */
export function ChipBackdrops({
  entries,
  attachVideo,
}: {
  entries: ChipMediaEntry[];
  attachVideo: boolean;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="chip-backdrops" data-chip-backdrops aria-hidden="true">
      {entries.map((entry, index) => (
        <div
          key={entry.slug}
          className="chip-backdrop"
          data-chip-backdrop
          data-chip-index={index}
        >
          <video
            src={attachVideo ? entry.video : undefined}
            poster={entry.poster}
            muted
            playsInline
            preload={attachVideo ? "auto" : "none"}
            disablePictureInPicture
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  );
}
