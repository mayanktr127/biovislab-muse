import { Suspense, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraRig } from './CameraRig';
import { SceneLighting } from './SceneLighting';
import { Effects } from './Effects';
import { clearSelection } from '../store';
import type { Lesson } from '../data/lessons';

/**
 * Shared canvas wrapper: background, fog, cinematic lighting,
 * camera rig (orbit + programmed moves), post-processing.
 * Clicking empty space clears the current selection.
 */
export function SceneCanvas({ lesson, children }: { lesson: Lesson; children: ReactNode }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: lesson.introCamera.position, fov: 45, near: 0.1, far: 220 }}
      onPointerMissed={() => clearSelection()}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#04070d']} />
      <fog attach="fog" args={['#04070d', 26, 72]} />
      <SceneLighting />
      <CameraRig defaultTarget={lesson.introCamera.target} focusDistance={lesson.focusDistance} />
      <Suspense fallback={null}>{children}</Suspense>
      <Effects />
    </Canvas>
  );
}
