import { useStore } from '../store';
import type { Lesson } from '../data/lessons';
import { ParticleField } from '../three/ParticleField';
import { SceneLabels } from '../three/Labels';
import { DnaHelix, DaughterHelix } from '../three/parts/DNA';

/** Scene 2 — DNA replication: helix → unwinding → nucleotides → two molecules. */
export function DnaScene({ lesson }: { lesson: Lesson }) {
  const layers = useStore((s) => s.layers);
  const stepIndex = useStore((s) => s.stepIndex);
  const speed = useStore((s) => s.speed);
  const step = lesson.steps[stepIndex];

  const openTarget = stepIndex >= 1 ? 1 : 0;

  return (
    <>
      {layers.dna && (
        <DnaHelix
          id="dna"
          openT={openTarget}
          interactive
          showEnzyme={!!layers.enzyme}
          nucleotidesActive={!!layers.nucleotides && stepIndex >= 2}
          spin
        />
      )}
      <DaughterHelix visible={stepIndex >= 3} />
      {layers.particles && (
        <ParticleField count={500} radius={18} color="#c4b5fd" size={0.12} drift={speed} opacity={0.5} />
      )}
      <SceneLabels defs={lesson.labels} active={step.labels} show={!!layers.labels} />
    </>
  );
}
