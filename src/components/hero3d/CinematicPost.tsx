import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { QualityTierConfig } from "./qualityTier";

type Props = {
  config: QualityTierConfig;
};

export function CinematicPost({ config }: Props) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={config.tier === "phone" ? 0.52 : 0.44}
        luminanceSmoothing={0.35}
        intensity={config.bloomIntensity}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.22} darkness={0.5} />
      <Noise
        opacity={config.tier === "desktop" ? 0.02 : 0.012}
        blendFunction={BlendFunction.SOFT_LIGHT}
      />
      {config.enableDof ? (
        <DepthOfField
          focusDistance={0.016}
          focalLength={0.025}
          bokehScale={0.75}
          height={360}
        />
      ) : null}
    </EffectComposer>
  );
}
