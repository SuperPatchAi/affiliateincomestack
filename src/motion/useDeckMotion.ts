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

function buildEntrance(
  slide: HTMLElement,
  plate: HTMLElement | null,
  copyBits: HTMLElement[],
  arcs: NodeListOf<SVGPathElement>,
) {
  const preset = slide.dataset.motion ?? "ken-burns-glow";
  const tl = gsap.timeline({ paused: true });

  const slabs = gsap.utils.toArray<HTMLElement>(
    slide.querySelectorAll("[data-slab]"),
  );

  if (preset === "parallax-slabs" && slabs.length) {
    // Coloured stack sections drop onto the scene one by one from the top.
    // Brand easing is ease-out; duration is longer than the 300ms micro-interaction
    // budget because this is a storytelling beat, not a UI feedback cue.
    if (plate) {
      tl.fromTo(
        plate,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" },
        0,
      );
    }
    tl.fromTo(
      slabs,
      { y: -220, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.45,
        stagger: 0.1,
        ease: "power3.out",
      },
      0.15,
    );
  } else if (plate) {
    const fromVars: gsap.TweenVars = { opacity: 0, duration: 0.9, ease: "power3.out" };
    const toVars: gsap.TweenVars = { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "brightness(1)" };

    switch (preset) {
      case "exploded-layers":
        Object.assign(fromVars, { y: 48, scale: 0.94, rotateX: 8 });
        break;
      case "coin-rise":
      case "platform-leap":
      case "summit-reveal":
        Object.assign(fromVars, { y: 64, scale: 0.96 });
        break;
      case "root-tiers":
      case "depth-rings":
      case "generation-rings":
      case "legs-descend":
        Object.assign(fromVars, { scale: 1.06, filter: "brightness(0.7)" });
        break;
      case "flywheel-scrub":
      case "pillars-sequence":
      case "node-mesh":
      case "earth-arcs":
        Object.assign(fromVars, { scale: 0.92 });
        break;
      default:
        Object.assign(fromVars, { y: 28, scale: 1.04 });
    }

    tl.fromTo(plate, fromVars, toVars, 0);

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

  if (preset === "parallax-slabs" && slabs.length && plate) {
    gsap.to([plate, ...slabs], {
      yPercent: 2.5,
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
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power2.out" },
      0.1,
    );
  }

  if (arcs.length) {
    tl.fromTo(
      arcs,
      { opacity: 0.12 },
      { opacity: 1, stagger: 0.1, duration: 0.65, ease: "power1.out" },
      0.15,
    );
  }

  const st = ScrollTrigger.create({
    trigger: slide,
    start: "top 85%",
    onEnter: () => tl.play(),
    onEnterBack: () => tl.play(),
    onLeaveBack: () => tl.pause(0),
  });

  // First paint: if already in view, show final state (no stuck opacity:0)
  requestAnimationFrame(() => {
    if (st.isActive || slide.getBoundingClientRect().top < window.innerHeight * 0.9) {
      tl.progress(1);
    }
  });
}

export function useDeckMotion(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      // Ensure content visible when motion is off
      gsap.set("[data-slide-plate], [data-slab], [data-anim], .flywheel-arc", {
        clearProps: "all",
      });
      return;
    }
    ensurePlugin();

    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]");
      slides.forEach((slide) => {
        const plate = slide.querySelector<HTMLElement>("[data-slide-plate]");
        const copyBits = gsap.utils.toArray<HTMLElement>(
          slide.querySelectorAll("[data-anim]"),
        );
        const arcs = slide.querySelectorAll<SVGPathElement>(".flywheel-arc");
        buildEntrance(slide, plate, copyBits, arcs);
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

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [enabled]);
}
