import { Atom, Dna, Virus, ArrowRight, Play, MousePointerClick, Layers } from 'lucide-react';
import { lessons } from '../data/lessons';

const ICONS: Record<string, React.ReactNode> = {
  cell: <Atom size={24} />,
  dna: <Dna size={24} />,
  virus: <Virus size={24} />,
};

export function Home({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="home">
      <div className="home-inner">
        <div className="home-badge">Visual prototype</div>
        <h1>
          Explore Biology <span className="grad">in 3D</span>
        </h1>
        <p className="home-sub">
          Understand cells, DNA, proteins and biological processes by exploring them in an
          interactive 3D environment — not just text, diagrams and conventional videos.
        </p>
        <p className="home-note">Simplified visual prototype. Structures are illustrative, not to scale.</p>

        <div className="topic-grid">
          {lessons.map((l) => (
            <button key={l.id} className="topic-card" onClick={() => onOpen(l.id)}>
              <span className="topic-icon">{ICONS[l.scene]}</span>
              <h3>{l.title}</h3>
              <p>{l.tagline}</p>
              <div className="topic-meta">
                <span>{l.steps.length} steps</span>
                <span>Interactive 3D</span>
              </div>
              <span className="topic-cta">
                Open lesson <ArrowRight size={16} />
              </span>
            </button>
          ))}
        </div>

        <div className="how-strip">
          <div className="how-step">
            <b>
              <Play size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Play the explanation
            </b>
            <span>Each lesson is a guided, step-by-step 3D story with cinematic camera moves.</span>
          </div>
          <div className="how-step">
            <b>
              <MousePointerClick size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Inspect structures
            </b>
            <span>Click any organelle, molecule or virus to focus it and read what it does.</span>
          </div>
          <div className="how-step">
            <b>
              <Layers size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Peel back layers
            </b>
            <span>Toggle structures on and off to reveal the biology piece by piece.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
