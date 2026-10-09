import { Html } from '@react-three/drei';
import type { LabelDef, Vec3 } from '../data/lessons';

/** Small floating annotation: glowing dot + pill label (HTML overlay). */
export function BioLabel({ position, text, visible }: { position: Vec3; text: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <Html position={position} center distanceFactor={24} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <div className="bio-label">
        <span className="dot" />
        <span className="lbl">{text}</span>
      </div>
    </Html>
  );
}

interface SceneLabelsProps {
  defs: LabelDef[];
  /** label ids visible for the current step; undefined = show all */
  active?: string[];
  show: boolean;
}

/** Renders all lesson labels, filtered by the active step + layer toggle. */
export function SceneLabels({ defs, active, show }: SceneLabelsProps) {
  if (!show) return null;
  return (
    <>
      {defs.map((d) => (
        <BioLabel key={d.id} position={d.position} text={d.text} visible={!active || active.includes(d.id)} />
      ))}
    </>
  );
}
