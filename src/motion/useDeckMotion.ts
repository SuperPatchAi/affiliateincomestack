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

function animatePreset(
  slide: HTMLElement,
  plate: HTMLElement | null,
  copyBits: HTMLElement[],
  arcs: NodeListOf<SVGPathElement>,
) {
  const preset = slide.dataset.motion ?? "ken-burns-glow";
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: slide,
      start: "top 78%",
      end: "top 35%",
      toggleActions: "play none none reverse",
    },
  });

  if (plate) {
    switch (preset) {
      case "parallax-slabs":
      case "exploded-layers":
        tl.fromTo(
          plate,
          { opacity: 0, y: 48, scale: 0.94, rotateX: 8 },
          { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.9, ease: "power3.out" },
          0,
        );
        break;
      case "coin-rise":
      case "platform-leap":
      case "summit-reveal":
        tl.fromTo(
          plate,
          { opacity: 0, y: 64, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power2.out" },
          0,
        );
        break;
      case "root-tiers":
      case "depth-rings":
      case "generation-rings":
      case "legs-descend":
        tl.fromTo(
          plate,
          { opacity: 0, scale: 1.06, filter: "brightness(0.7)" },
          {
            opacity: 1,
            scale: 1,
            filter: "brightness(1)",
            duration: 0.95,
            ease: "power2.out",
          },
          0,
        );
        break;
      case "flywheel-scrub":
      case "pillars-sequence":
      case "node-mesh":
      case "earth-arcs":
        tl.fromTo(
          plate,
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
          0,
        );
        break;
      default:
        tl.fromTo(
          plate,
          { opacity: 0, y: 28, scale: 1.04 },
          { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power2.out" },
          0,
        );
    }

    // Ongoing subtle drift while in view (high-end keynote feel)
    gsap.to(plate, {
      yPercent: preset.includes("leap") || preset.includes("rise") ? -3 : 2.5,
      scale: 1.015,
      ease: "none",
      scrollTrigger: {
        trigger: slide,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  if (copyBits.length) {
    tl.fromTo(
      copyBits,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
      },
      0.12,
    );
  }

  if (arcs.length) {
    tl.fromTo(
      arcs,
      { opacity: 0.12, strokeDashoffset: 40 },
      {
        opacity: 1,
        strokeDashoffset: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: "power1.out",
      },
      0.2,
    );
  }
}

export function useDeckMotion(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    ensurePlugin();

    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]");

      slides.forEach((slide) => {
        const plate = slide.querySelector<HTMLElement>("[data-slide-plate]");
        const copyBits = gsap.utils.toArray<HTMLElement>(
          slide.querySelectorAll("[data-anim]"),
        );
        const arcs = slide.querySelectorAll<SVGPathElement>(".flywheel-arc");
        animatePreset(slide, plate, copyBits, arcs);
      });

      const progress = document.querySelector<HTMLElement>("[data-deck-progress]");
      if (progress) {
        gsap.fromTo(
          progress,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.documentElement,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
      }
    });

    return () => ctx.revert();
  }, [enabled]);
}
