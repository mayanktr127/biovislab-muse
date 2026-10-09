import { useSyncExternalStore } from 'react';

/**
 * Tiny external store (no extra dependency) shared between the React UI
 * and the 3D scene. 3D components subscribe selectively so only the parts
 * that need a value re-render; per-frame animation reads via getState()
 * to avoid re-renders entirely.
 */

export interface CameraMove {
  id: number;
  position: [number, number, number];
  target: [number, number, number];
}

interface State {
  /** id of the currently selected biological object, or null */
  selected: string | null;
  /** world position of the selected object (for camera focus) */
  selectedPos: [number, number, number] | null;
  /** incremented each time a selection should trigger a camera focus */
  focusPulse: number;
  /** layer visibility flags, keyed by layer id */
  layers: Record<string, boolean>;
  /** lesson timeline */
  stepIndex: number;
  playing: boolean;
  speed: number;
  /** latest programmatic camera request */
  cameraMove: CameraMove | null;
}

const initial: State = {
  selected: null,
  selectedPos: null,
  focusPulse: 0,
  layers: {},
  stepIndex: 0,
  playing: false,
  speed: 1,
  cameraMove: null,
};

let state: State = { ...initial };
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getState(): State {
  return state;
}

export function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => selector(state),
  );
}

/** Programmatic cinematic camera move (consumed by CameraRig). */
export function flyTo(position: [number, number, number], target: [number, number, number]) {
  setState({ cameraMove: { id: ++seq, position, target } });
}

/** Select a biological object (click). Also triggers camera focus. */
export function select(id: string | null, pos?: [number, number, number] | null) {
  setState({
    selected: id,
    selectedPos: pos ?? null,
    focusPulse: id ? state.focusPulse + 1 : state.focusPulse,
  });
}

export function clearSelection() {
  setState({ selected: null, selectedPos: null });
}

export function toggleLayer(id: string) {
  setState({ layers: { ...state.layers, [id]: !state.layers[id] } });
}

export function goToStep(i: number) {
  setState({ stepIndex: i, selected: null, selectedPos: null });
}

/** (Re)initialise per-lesson state when entering a lesson. */
export function initLesson(layerIds: string[]) {
  const layers: Record<string, boolean> = {};
  layerIds.forEach((id) => {
    layers[id] = true;
  });
  state = { ...initial, layers };
  emit();
}
