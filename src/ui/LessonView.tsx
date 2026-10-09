import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getLesson } from '../data/lessons';
import { getState, setState, useStore, flyTo, initLesson } from '../store';
import { SceneCanvas } from '../three/SceneCanvas';
import { CellScene } from '../scenes/CellScene';
import { DnaScene } from '../scenes/DnaScene';
import { VirusScene } from '../scenes/VirusScene';
import { Timeline } from './Timeline';
import { InfoPanel } from './InfoPanel';
import { LayerPanel } from './LayerPanel';

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function LessonView({ lessonId, onBack }: { lessonId: string; onBack: () => void }) {
  const lesson = useMemo(() => getLesson(lessonId), [lessonId]);
  const [showLayers, setShowLayers] = useState(false);
  const stepIndex = useStore((s) => s.stepIndex);
  const playing = useStore((s) => s.playing);
  const speed = useStore((s) => s.speed);
  const webgl = useMemo(supportsWebGL, []);
  const firstStep = useRef(true);

  // initialise per-lesson state + cinematic intro sweep into step 1
  useEffect(() => {
    initLesson(lesson.layers.map((l) => l.id));
    firstStep.current = true;
    const t = setTimeout(() => {
      const c = lesson.steps[0].camera;
      flyTo(c.position, c.target);
    }, 400);
    return () => clearTimeout(t);
  }, [lesson]);

  // camera follows step changes (skipped once — the intro timer covers step 0)
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const c = lesson.steps[stepIndex].camera;
    flyTo(c.position, c.target);
  }, [lesson, stepIndex]);

  // auto-advance while playing (respects speed)
  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= lesson.steps.length - 1) {
      setState({ playing: false });
      return;
    }
    const ms = (lesson.steps[stepIndex].duration * 1000) / getState().speed;
    const t = setTimeout(() => setState({ stepIndex: stepIndex + 1 }), ms);
    return () => clearTimeout(t);
  }, [playing, stepIndex, speed, lesson]);

  return (
    <div className="lesson-view">
      <header className="lesson-header">
        <button className="back" onClick={onBack} aria-label="Back to all lessons">
          <ArrowLeft size={15} /> All lessons
        </button>
        <span className="lesson-title">{lesson.title}</span>
        <span className="lesson-stepcount">
          Step {stepIndex + 1} of {lesson.steps.length}
        </span>
      </header>

      <div className="stage">
        {webgl ? (
          <div className="canvas-wrap">
            <SceneCanvas lesson={lesson}>
              {lesson.scene === 'cell' && <CellScene lesson={lesson} />}
              {lesson.scene === 'dna' && <DnaScene lesson={lesson} />}
              {lesson.scene === 'virus' && <VirusScene lesson={lesson} />}
            </SceneCanvas>
          </div>
        ) : (
          <div className="webgl-fallback">
            <div>
              <h2>WebGL is unavailable</h2>
              <p>This interactive 3D prototype needs a browser with WebGL enabled.</p>
            </div>
          </div>
        )}

        <div className="scene-hint">Drag to orbit · Scroll to zoom · Right-drag to pan · Click a structure to inspect it</div>
        <InfoPanel lesson={lesson} />
        {showLayers && <LayerPanel lesson={lesson} />}
      </div>

      <Timeline lesson={lesson} onToggleLayers={() => setShowLayers((v) => !v)} />
    </div>
  );
}
