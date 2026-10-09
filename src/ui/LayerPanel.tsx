import { toggleLayer, useStore } from '../store';
import type { Lesson } from '../data/lessons';

/** Layer visibility toggles — reveal the scene structure piece by piece. */
export function LayerPanel({ lesson }: { lesson: Lesson }) {
  const layers = useStore((s) => s.layers);

  return (
    <div className="layer-panel" role="group" aria-label="Scene layers">
      <h4>Layers</h4>
      {lesson.layers.map((l) => (
        <label key={l.id} className="layer-row">
          <input type="checkbox" checked={!!layers[l.id]} onChange={() => toggleLayer(l.id)} />
          {l.label}
        </label>
      ))}
    </div>
  );
}
