import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getState, useStore } from '../store';
import type { Lesson, Vec3 } from '../data/lessons';
import { ParticleField } from '../three/ParticleField';
import { SceneLabels } from '../three/Labels';
import {
  VirusBody,
  MembranePatch,
  Receptors,
  FusionGlow,
  GenomeBurst,
  DockTether,
  SURFACE_Y,
} from '../three/parts/Virus';

/** Virus flight path across the lesson steps (approach → dock → sink → inside). */
const VIRUS_TARGETS: Vec3[] = [
  [13, 7.5, 9], // 0 approach — wide
  [5.5, 4.8, 4.5], // 1 recognize — closing in
  [0.6, SURFACE_Y + 2.6, 0.6], // 2 bind — docked at the receptor
  [0, SURFACE_Y - 0.8, 0], // 3 enter — sinking through the membrane
  [0, SURFACE_Y - 4.4, 0], // 4 release — inside the cell
];

/** Smoothly steers the shared virus position toward the step target. */
function VirusMover({
  positionRef,
  target,
}: {
  positionRef: React.MutableRefObject<THREE.Vector3>;
  target: Vec3;
}) {
  const t = useRef(new THREE.Vector3(...target));

  useEffect(() => {
    t.current.set(target[0], target[1], target[2]);
  }, [target]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const k = 1 - Math.exp(-dt * 1.1 * getState().speed);
    positionRef.current.lerp(t.current, k);
  });
  return null;
}

/** Scene 3 — cinematic virus entry (the showcase scene). */
export function VirusScene({ lesson }: { lesson: Lesson }) {
  const layers = useStore((s) => s.layers);
  const stepIndex = useStore((s) => s.stepIndex);
  const speed = useStore((s) => s.speed);
  const step = lesson.steps[stepIndex];
  const virusPos = useRef(new THREE.Vector3(...VIRUS_TARGETS[0]));
  const activeLabels = step.labels ?? [];

  // 'virus' + 'spike' labels live inside VirusBody so they follow the virus
  const staticLabels = lesson.labels.filter((l) => l.id !== 'virus' && l.id !== 'spike');

  return (
    <>
      {layers.membrane && <MembranePatch />}
      {layers.receptors && <Receptors highlight={step.highlight === 'receptor'} />}
      {layers.virus && (
        <>
          <VirusMover
            positionRef={virusPos}
            target={VIRUS_TARGETS[Math.min(stepIndex, VIRUS_TARGETS.length - 1)]}
          />
          <VirusBody
            positionRef={virusPos}
            showVirusLabel={!!layers.labels && activeLabels.includes('virus')}
            showSpikeLabel={!!layers.labels && activeLabels.includes('spike')}
          />
          <GenomeBurst positionRef={virusPos} released={stepIndex >= 4} />
        </>
      )}
      <DockTether visible={stepIndex === 1 || stepIndex === 2} />
      <FusionGlow active={stepIndex === 3} />
      {layers.particles && (
        <ParticleField count={650} radius={26} color="#99f6e4" size={0.13} drift={speed} opacity={0.5} />
      )}
      <SceneLabels defs={staticLabels} active={step.labels} show={!!layers.labels} />
    </>
  );
}
