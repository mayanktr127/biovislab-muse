import { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Focus,
  Layers,
} from 'lucide-react';
import { getState, setState, useStore, flyTo, clearSelection, goToStep } from '../store';
import type { Lesson } from '../data/lessons';

const SPEEDS = [0.5, 1, 1.5, 2];

export function Timeline({ lesson, onToggleLayers }: { lesson: Lesson; onToggleLayers: () => void }) {
  const stepIndex = useStore((s) => s.stepIndex);
  const playing = useStore((s) => s.playing);
  const speed = useStore((s) => s.speed);
  const step = lesson.steps[stepIndex];
  const fillRef = useRef<HTMLDivElement>(null!);
  const startRef = useRef(0);

  // restart the progress clock whenever the step, speed or play state changes
  useEffect(() => {
    startRef.current = performance.now();
  }, [stepIndex, speed, playing]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const dur = (step.duration * 1000) / getState().speed;
      const p = Math.min((performance.now() - startRef.current) / dur, 1);
      if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const resetCamera = () => {
    clearSelection();
    const c = lesson.steps[getState().stepIndex].camera;
    flyTo(c.position, c.target);
  };

  const restart = () => {
    goToStep(0);
    setState({ playing: true });
  };

  return (
    <div className="timeline">
      <div className="timeline-steps" role="tablist" aria-label="Lesson steps">
        {lesson.steps.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === stepIndex}
            className={`step-pill${i === stepIndex ? ' active' : ''}${i < stepIndex ? ' done' : ''}`}
            onClick={() => goToStep(i)}
          >
            <span className="n">Step {i + 1}</span>
            <span className="t">{s.title}</span>
          </button>
        ))}
      </div>

      <div className="timeline-controls">
        <button
          className="btn"
          onClick={() => goToStep(Math.max(0, stepIndex - 1))}
          disabled={stepIndex === 0}
          aria-label="Previous step"
        >
          <SkipBack size={16} />
        </button>
        <button
          className="btn primary"
          onClick={() => setState({ playing: !playing })}
          aria-label={playing ? 'Pause explanation' : 'Play explanation'}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          className="btn"
          onClick={() => goToStep(Math.min(lesson.steps.length - 1, stepIndex + 1))}
          disabled={stepIndex === lesson.steps.length - 1}
          aria-label="Next step"
        >
          <SkipForward size={16} />
        </button>
        <button className="btn" onClick={restart} aria-label="Restart lesson">
          <RotateCcw size={16} /> Restart
        </button>

        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" ref={fillRef} />
        </div>

        <div className="speed-group" role="group" aria-label="Animation speed">
          {SPEEDS.map((v) => (
            <button
              key={v}
              className={speed === v ? 'active' : ''}
              onClick={() => setState({ speed: v })}
              aria-pressed={speed === v}
            >
              {v}×
            </button>
          ))}
        </div>

        <button className="btn" onClick={resetCamera} aria-label="Reset camera view">
          <Focus size={16} /> Reset view
        </button>
        <button className="btn" onClick={onToggleLayers} aria-label="Toggle layer panel">
          <Layers size={16} /> Layers
        </button>
      </div>

      <div className="step-desc">
        <h3>
          Step {stepIndex + 1}: {step.title}
        </h3>
        <p>{step.description}</p>
      </div>
    </div>
  );
}
