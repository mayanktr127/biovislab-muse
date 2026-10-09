import { X } from 'lucide-react';
import { useStore, clearSelection } from '../store';
import type { Lesson } from '../data/lessons';

/** Information card shown when a biological structure is selected. */
export function InfoPanel({ lesson }: { lesson: Lesson }) {
  const selected = useStore((s) => s.selected);
  if (!selected) return null;
  const info = lesson.info[selected];
  if (!info) return null;

  return (
    <div className="info-panel" role="dialog" aria-label={info.title}>
      <button className="info-close" onClick={clearSelection} aria-label="Close information panel">
        <X size={16} />
      </button>
      <h3>{info.title}</h3>
      <p>{info.text}</p>
    </div>
  );
}
