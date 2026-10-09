import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/**
 * Subtle cinematic post-processing: gentle bloom for emissive elements
 * and a vignette for focus. Deliberately restrained — readability first.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.52} luminanceSmoothing={0.3} />
      <Vignette eskil={false} offset={0.22} darkness={0.78} />
    </EffectComposer>
  );
}
