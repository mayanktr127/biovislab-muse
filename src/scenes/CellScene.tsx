import { useStore } from '../store';
import type { Lesson } from '../data/lessons';
import { ParticleField } from '../three/ParticleField';
import { SceneLabels } from '../three/Labels';
import {
  CellMembrane,
  Nucleus,
  MitochondriaField,
  Ribosomes,
  MoleculeSwarm,
} from '../three/parts/CellParts';

/** Scene 1 — stylized animal cell interior. */
export function CellScene({ lesson }: { lesson: Lesson }) {
  const layers = useStore((s) => s.layers);
  const stepIndex = useStore((s) => s.stepIndex);
  const speed = useStore((s) => s.speed);
  const step = lesson.steps[stepIndex];

  return (
    <>
      {layers.membrane && <CellMembrane />}
      {layers.nucleus && <Nucleus />}
      {layers.mitochondria && <MitochondriaField />}
      {layers.ribosomes && <Ribosomes />}
      {layers.molecules && <MoleculeSwarm crossing={step.id === 'membrane'} />}
      {layers.particles && (
        <ParticleField count={600} radius={20} color="#67e8f9" size={0.12} drift={speed} opacity={0.5} />
      )}
      <SceneLabels defs={lesson.labels} active={step.labels} show={!!layers.labels} />
    </>
  );
}
