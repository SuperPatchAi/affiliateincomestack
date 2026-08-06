import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  TITLE_SLAB_BASE,
  TITLE_SLAB_SRCS,
  fittedSizePct,
  type PlateAnnotation,
  type Slide,
} from "../../data/slides";
import { publicAssetPath } from "../timeline";
import { accentColor } from "../theme";

/** Drop title slabs one-by-one over the base plate (parallax-slabs preset). */
export function SlabDropLayers() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(publicAssetPath(TITLE_SLAB_BASE))}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      {TITLE_SLAB_SRCS.map((src, i) => {
        const local = Math.max(0, frame - 6 - i * 5);
        const drop = spring({
          frame: local,
          fps,
          config: { damping: 14, stiffness: 120, mass: 0.85 },
        });
        const y = interpolate(drop, [0, 1], [-120, 0]);
        const opacity = interpolate(drop, [0, 0.2, 1], [0, 1, 1]);
        return (
          <Img
            key={src}
            src={staticFile(publicAssetPath(src))}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: `translateY(${y}px)`,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

/** Stagger live annotations onto a clean plate (pillars / flywheel / metrics). */
export function AnnotationLayers({
  annotations,
  accent,
  startFrame = 10,
}: {
  annotations: PlateAnnotation[];
  accent: Slide["accent"];
  /** Frame when the first annotation begins its entrance spring. */
  startFrame?: number;
}) {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const color = accentColor(accent);

  return (
    <AbsoluteFill>
      {annotations.map((a, i) => {
        const sizePct = fittedSizePct(a);
        const local = Math.max(0, frame - startFrame - i * 4);
        const enter = spring({
          frame: local,
          fps,
          config: { damping: 18, stiffness: 160, mass: 0.6 },
        });
        const scale = interpolate(enter, [0, 1], [0.85, 1]);
        const opacity = interpolate(enter, [0, 1], [0, 1]);
        const fontSize = (sizePct / 100) * height * 0.72;
        return (
          <div
            key={`${a.text}-${i}`}
            style={{
              position: "absolute",
              left: `${a.xPct}%`,
              top: `${a.yPct}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              color: a.role === "metric" ? color : "#ffffff",
              fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
              fontWeight: a.role === "metric" ? 800 : 700,
              fontSize,
              letterSpacing: a.role === "label" ? "0.16em" : "-0.01em",
              textTransform: a.role === "label" ? "uppercase" : "none",
              whiteSpace: "nowrap",
              textShadow: "0 2px 18px rgba(0,0,0,0.55)",
            }}
          >
            {a.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
