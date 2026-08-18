import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
};

function seedMotes(count: number, width: number, height: number): Mote[] {
  const motes: Mote[] = [];
  for (let i = 0; i < count; i++) {
    motes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 1.4,
      vx: 0.08 + Math.random() * 0.12,
      vy: -0.04 - Math.random() * 0.08,
      a: 0.08 + Math.random() * 0.12,
    });
  }
  return motes;
}

/**
 * Warm dust motes + sun haze. Bright only. Pauses when the scene is inactive.
 */
export function DustHazeCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let motes = seedMotes(32, 1, 1);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = seedMotes(32, width, height);
    };
    resize();

    const tick = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";
      for (const mote of motes) {
        mote.x += mote.vx;
        mote.y += mote.vy;
        if (mote.x > width + 8) mote.x = -8;
        if (mote.y < -8) mote.y = height + 8;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 236, 210, ${mote.a})`;
        ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="dust-haze"
      data-dust-haze
      data-active={active ? "true" : "false"}
      aria-hidden="true"
    />
  );
}
