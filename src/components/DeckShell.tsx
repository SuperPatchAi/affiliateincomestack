import { useEffect, useState } from "react";
import { SLIDES } from "../data/slides";
import { useDeckMotion } from "../motion/useDeckMotion";
import { Slide } from "./Slide";

export function DeckShell() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useDeckMotion(!reduceMotion);

  return (
    <div className="deck-shell" data-reduced-motion={reduceMotion ? "true" : "false"}>
      <header className="deck-top">
        <p className="deck-brand">Super Patch</p>
        <p className="deck-meta">Income Stack™</p>
      </header>

      <div className="deck-progress-track" aria-hidden>
        <div className="deck-progress" data-deck-progress style={{ transform: "scaleX(0)" }} />
      </div>

      <main className="deck-main">
        {SLIDES.map((slide, index) => (
          <Slide key={slide.id} slide={slide} index={index} />
        ))}
      </main>
    </div>
  );
}
