import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

function ensurePlugin() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

export function useDeckMotion(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    ensurePlugin();

    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]");

      slides.forEach((slide) => {
        const plate = slide.querySelector<HTMLElement>("[data-slide-plate], .slide-plate");
        const copy = slide.querySelector<HTMLElement>("[data-slide-copy]");
        const arcs = slide.querySelectorAll<SVGPathElement>(".flywheel-arc");

        if (plate) {
          gsap.fromTo(
            plate,
            { scale: 1.12, yPercent: -4 },
            {
              scale: 1,
              yPercent: 4,
              ease: "none",
              scrollTrigger: {
                trigger: slide,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }

        if (copy) {
          gsap.fromTo(
            copy,
            { opacity: 0.15, y: 36 },
            {
              opacity: 1,
              y: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: slide,
                start: "top 70%",
                end: "top 25%",
                scrub: true,
              },
            },
          );
        }

        if (arcs.length) {
          gsap.fromTo(
            arcs,
            { opacity: 0.15 },
            {
              opacity: 1,
              stagger: 0.08,
              ease: "none",
              scrollTrigger: {
                trigger: slide,
                start: "top 60%",
                end: "center center",
                scrub: true,
              },
            },
          );
        }
      });

      const progress = document.querySelector<HTMLElement>("[data-deck-progress]");
      if (progress) {
        gsap.to(progress, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [enabled]);
}
