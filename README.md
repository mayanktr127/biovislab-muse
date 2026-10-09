# BioVisual Lab — Interactive 3D Biology Prototype

An experimental prototype exploring a simple question:

> What would learning biology feel like if concepts were explained through cinematic,
> interactive 3D visualizations instead of only text, diagrams, and conventional videos?

Pick a topic, enter a 3D lesson, and play a guided step-by-step explanation: orbit the
scene freely, click structures to inspect them, peel back layers, and watch biological
processes animate — all rendered live with Three.js. No videos, no static images, no
paid APIs, no backend.

## Tech stack

- **React 19 + TypeScript + Vite** — UI and build (no SSR needed for this prototype)
- **Three.js** — real-time 3D rendering (everything is procedural geometry)
- **@react-three/fiber** — React renderer for Three.js
- **@react-three/drei** — OrbitControls, Html labels
- **@react-three/postprocessing** — Bloom + Vignette for the cinematic look
- **GSAP** — smooth cinematic camera tweens
- **lucide-react** — icons

No backend, no database, no auth, no API keys. All lesson content is local mock data.

## Installation

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To verify the production build:

```bash
npm run build
```

## Architecture

```text
React (UI: home, timeline, panels)
  ↓
React Three Fiber (declarative Three.js)
  ↓
Three.js (WebGL)
  ↓
Procedural 3D scenes (no external models or textures)
```

Key pieces:

- `src/data/lessons.ts` — the lesson data model (`Lesson`, `LessonStep`). All copy,
  cameras, labels, layers and info-panel text live here as plain data.
- `src/store.ts` — a tiny dependency-free external store shared by the UI and the
  3D scene (selection, layers, timeline state, camera requests). Per-frame animation
  reads it via `getState()` so nothing re-renders inside the render loop.
- `src/three/` — reusable 3D infrastructure:
  - `SceneCanvas.tsx` — canvas wrapper (fog, lighting, camera rig, post-processing)
  - `CameraRig.tsx` — OrbitControls + GSAP cinematic moves + click-to-focus
  - `ParticleField.tsx` — one-draw-call drifting particle system
  - `Labels.tsx` — floating 3D annotations (drei `Html`)
  - `SceneLighting.tsx`, `Effects.tsx` — cinematic light rig, Bloom + Vignette
  - `selectable.tsx` — click-to-select with focus-mode dimming
  - `parts/` — biological building blocks (cell parts, DNA helix, virus)
- `src/scenes/` — one component per lesson scene composing the parts
- `src/ui/` — Home, LessonView, Timeline, InfoPanel, LayerPanel
- `src/App.tsx` — minimal view router (home ↔ lesson) + error boundary

## The three demo scenes

1. **Inside a Living Cell** — fly through a stylized animal cell: translucent
   membrane, nucleus with glowing chromatin, mitochondria with folded cristae,
   instanced ribosomes, drifting molecules (some cross the membrane on cue).
2. **DNA Replication** — parametric double helix that unwinds at a replication
   fork while a helicase enzyme rides along; nucleotides fly in and dock via
   complementary pairing; a second complete helix scales in at the end.
3. **Virus Entry** (showcase scene) — a spiked virus approaches a giant cell,
   recognizes a glowing receptor, docks, sinks through the membrane with a fusion
   glow, and releases its genome inside.

Every scene supports: orbit / zoom / pan, click-to-inspect with camera focus and
info panel, layer toggles, play / pause / restart / prev / next, 0.5×–2× speed,
reset view, and per-step cinematic camera moves with contextual explanations.

## Performance notes

- Particles, ribosomes, spikes, DNA beads/rungs/nucleotides all use
  `InstancedMesh` / `THREE.Points` — a handful of draw calls, not thousands of components.
- Per-frame updates mutate buffers directly; React state stays out of the loop.
- Geometry segment counts are kept modest; pixel ratio is capped at 2.

## Future direction

This prototype could evolve into a fuller platform:

```text
AI lesson planning
  + curated biology knowledge base
  + richer 3D asset library
  + interactive lessons with progress tracking
  + user accounts
```

For now it deliberately stays a local, offline-capable visual experiment.
