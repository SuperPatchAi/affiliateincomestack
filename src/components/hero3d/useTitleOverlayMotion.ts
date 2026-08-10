import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { RefObject } from "react";
import { titleOverlayMotionPlan } from "./titleOverlayMotion";

type Options = {
  overlayRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
};

/**
 * Staggered fade-up for slide-01 copy layers over the live 3D hero.
 * Timed to land as the stack collapses after the whip.
 */
export function useTitleOverlayMotion({ overlayRef, reducedMotion }: Options) {
  useGSAP(
    () => {
      const root = overlayRef.current;
      if (!root) return;

      const eyebrow = root.querySelector<HTMLElement>(
        '[data-anim-layer="eyebrow"]',
      );
      const headline = root.querySelector<HTMLElement>(
        '[data-anim-layer="headline"]',
      );
      const body = root.querySelector<HTMLElement>('[data-anim-layer="body"]');
      const nodes = [eyebrow, headline, body].filter(
        (n): n is HTMLElement => Boolean(n),
      );
      if (nodes.length === 0) return;

      if (reducedMotion) {
        gsap.set(nodes, { opacity: 1, y: 0 });
        return;
      }

      const plan = titleOverlayMotionPlan();
      gsap.set(nodes, { opacity: 0, y: 28 });

      const tl = gsap.timeline({
        delay: plan.startSec,
        defaults: { ease: "power3.out" },
      });
      if (eyebrow) {
        tl.to(
          eyebrow,
          { opacity: 1, y: 0, duration: plan.eyebrow.durationSec },
          plan.eyebrow.delaySec,
        );
      }
      if (headline) {
        tl.to(
          headline,
          { opacity: 1, y: 0, duration: plan.headline.durationSec },
          plan.headline.delaySec,
        );
      }
      if (body) {
        tl.to(
          body,
          { opacity: 1, y: 0, duration: plan.body.durationSec },
          plan.body.delaySec,
        );
      }

      return () => {
        tl.kill();
      };
    },
    { dependencies: [reducedMotion] },
  );
}
