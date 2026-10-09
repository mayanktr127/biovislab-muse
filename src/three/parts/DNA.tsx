import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getState } from '../../store';
import { useDim, selectAt, hoverProps } from '../selectable';

/**
 * Parametric DNA double helix.
 * - backbones rendered as instanced beads along two strands
 * - rungs as instanced cylinders that "break" as the fork passes
 * - `openT` (0..1) drives unwinding; animated smoothly toward the prop
 * - helicase enzyme rides the replication fork
 * - free nucleotides fly in and dock when `nucleotidesActive`
 */

const RUNGS = 26;
const RISE = 0.34;
const RADIUS = 1.15;
const TWIST = 0.62;
const TOTAL_H = RUNGS * RISE;
const Y_BASE = -TOTAL_H / 2;
const BEADS_PER_SEG = 3;
const BEAD_COUNT = 2 * RUNGS * BEADS_PER_SEG;

function strandPoint(i: number, strand: 0 | 1, sep: number, out: THREE.Vector3): THREE.Vector3 {
  const a = i * TWIST + strand * Math.PI;
  out.set(
    Math.cos(a) * RADIUS + (strand === 0 ? sep : -sep),
    Y_BASE + i * RISE,
    Math.sin(a) * RADIUS,
  );
  return out;
}

function sepAt(i: number, open: number, forkIdx: number): number {
  if (open <= 0.001) return 0;
  const f = Math.min(Math.max((i - forkIdx) / 6, 0), 1);
  return open * f * 2.4;
}

interface DnaHelixProps {
  id?: string;
  openT: number;
  position?: [number, number, number];
  interactive?: boolean;
  showEnzyme?: boolean;
  nucleotidesActive?: boolean;
  spin?: boolean;
}

export function DnaHelix({
  id = 'dna',
  openT,
  position = [0, 0, 0],
  interactive = true,
  showEnzyme = true,
  nucleotidesActive = false,
  spin = true,
}: DnaHelixProps) {
  const dim = useDim(id);
  const beads = useRef<THREE.InstancedMesh>(null!);
  const rungs = useRef<THREE.InstancedMesh>(null!);
  const nucs = useRef<THREE.InstancedMesh>(null!);
  const group = useRef<THREE.Group>(null!);
  const enzyme = useRef<THREE.Group>(null!);
  const enzymeRing = useRef<THREE.Mesh>(null!);
  const open = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const va = useMemo(() => new THREE.Vector3(), []);
  const vb = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  // per-nucleotide flight state
  const nucState = useMemo(() => {
    const arr: { start: THREE.Vector3; progress: number }[] = [];
    for (let i = 0; i < RUNGS * 2; i++) {
      arr.push({
        start: new THREE.Vector3().randomDirection().multiplyScalar(5 + Math.random() * 3),
        progress: 0,
      });
    }
    return arr;
  }, []);

  // static instance colors: strand A cyan, strand B pink; rungs alternate AT/GC
  useEffect(() => {
    const cA = new THREE.Color('#22d3ee');
    const cB = new THREE.Color('#f472b6');
    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < RUNGS; i++) {
        for (let k = 0; k < BEADS_PER_SEG; k++) {
          beads.current.setColorAt((s * RUNGS + i) * BEADS_PER_SEG + k, s === 0 ? cA : cB);
        }
      }
    }
    if (beads.current.instanceColor) beads.current.instanceColor.needsUpdate = true;
    const cAT = new THREE.Color('#fbbf24');
    const cGC = new THREE.Color('#34d399');
    for (let i = 0; i < RUNGS; i++) {
      rungs.current.setColorAt(i, i % 2 === 0 ? cAT : cGC);
    }
    if (rungs.current.instanceColor) rungs.current.instanceColor.needsUpdate = true;
    const cN = new THREE.Color('#fef08a');
    for (let i = 0; i < RUNGS * 2; i++) nucs.current.setColorAt(i, cN);
    if (nucs.current.instanceColor) nucs.current.instanceColor.needsUpdate = true;
  }, []);

  useFrame((st, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const speed = getState().speed;
    // smooth openness toward target
    open.current += (openT - open.current) * (1 - Math.exp(-dt * 2.2));
    const o = open.current;
    const forkIdx = (1 - o) * RUNGS;

    if (spin) group.current.rotation.y += dt * 0.16 * (1 - o * 0.75) * speed;

    // --- backbone beads ---
    let bi = 0;
    for (let s = 0 as 0 | 1; s < 2; s = (s + 1) as 0 | 1) {
      for (let i = 0; i < RUNGS; i++) {
        const sep = sepAt(i, o, forkIdx);
        for (let k = 0; k < BEADS_PER_SEG; k++) {
          strandPoint(i + k / BEADS_PER_SEG, s, sep, va);
          dummy.position.copy(va);
          dummy.scale.setScalar(1);
          dummy.quaternion.identity();
          dummy.updateMatrix();
          beads.current.setMatrixAt(bi++, dummy.matrix);
        }
      }
    }
    beads.current.instanceMatrix.needsUpdate = true;

    // --- rungs (break where separated) ---
    for (let i = 0; i < RUNGS; i++) {
      const sep = sepAt(i, o, forkIdx);
      strandPoint(i, 0, sep, va);
      strandPoint(i, 1, sep, vb);
      dummy.position.copy(va).add(vb).multiplyScalar(0.5);
      if (sep > 0.9) {
        dummy.scale.setScalar(0.0001);
      } else {
        const len = va.distanceTo(vb);
        dummy.scale.set(1, len, 1);
        dummy.quaternion.setFromUnitVectors(up, vb.sub(va).normalize());
      }
      dummy.updateMatrix();
      rungs.current.setMatrixAt(i, dummy.matrix);
    }
    rungs.current.instanceMatrix.needsUpdate = true;

    // --- nucleotides fly in ---
    for (let n = 0; n < RUNGS * 2; n++) {
      const st8 = nucState[n];
      const target = nucleotidesActive ? 1 : 0;
      st8.progress += (target - st8.progress) * (1 - Math.exp(-dt * 1.6 * speed));
      const i = n % RUNGS;
      const s = (n < RUNGS ? 0 : 1) as 0 | 1;
      const sep = sepAt(i, o, forkIdx);
      strandPoint(i, s, sep, va);
      // dock slightly outside the strand
      const ang = i * TWIST + s * Math.PI;
      vb.set(Math.cos(ang) * 0.55, 0, Math.sin(ang) * 0.55);
      va.add(vb);
      const p = st8.progress * st8.progress * (3 - 2 * st8.progress); // smoothstep
      dummy.position.copy(st8.start).lerp(va, p);
      dummy.scale.setScalar(Math.max(p, 0.0001));
      dummy.quaternion.identity();
      dummy.updateMatrix();
      nucs.current.setMatrixAt(n, dummy.matrix);
    }
    nucs.current.instanceMatrix.needsUpdate = true;

    // --- helicase rides the fork ---
    if (enzyme.current) {
      const vis = showEnzyme && o > 0.04 && o < 0.96;
      enzyme.current.visible = vis;
      if (vis) {
        enzyme.current.position.y = Y_BASE + forkIdx * RISE;
        enzyme.current.rotation.y += dt * 2.2;
        if (enzymeRing.current) {
          const es = 1 + Math.sin(st.clock.elapsedTime * 5) * 0.08;
          enzymeRing.current.scale.setScalar(es);
        }
      }
    }
  });

  const clickProps = interactive ? { onClick: selectAt(id), ...hoverProps() } : {};

  return (
    <group ref={group} position={position}>
      <instancedMesh ref={beads} args={[undefined, undefined, BEAD_COUNT]} frustumCulled={false} {...clickProps}>
        <sphereGeometry args={[0.17, 12, 10]} />
        <meshStandardMaterial roughness={0.35} emissiveIntensity={0.55} transparent opacity={dim} />
      </instancedMesh>
      <instancedMesh ref={rungs} args={[undefined, undefined, RUNGS]} frustumCulled={false}>
        <cylinderGeometry args={[0.07, 0.07, 1, 8]} />
        <meshStandardMaterial roughness={0.4} emissiveIntensity={0.4} transparent opacity={dim} />
      </instancedMesh>
      <instancedMesh
        ref={nucs}
        args={[undefined, undefined, RUNGS * 2]}
        frustumCulled={false}
        {...(interactive ? { onClick: selectAt('nucleotides'), ...hoverProps() } : {})}
      >
        <sphereGeometry args={[0.15, 10, 8]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#facc15"
          emissiveIntensity={1.1 * dim}
          roughness={0.4}
          transparent
          opacity={dim}
        />
      </instancedMesh>

      {/* helicase enzyme */}
      <group ref={enzyme} visible={false}>
        <mesh {...(interactive ? { onClick: selectAt('helicase'), ...hoverProps() } : {})}>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial
            color="#c084fc"
            emissive="#a855f7"
            emissiveIntensity={1.2 * dim}
            roughness={0.35}
            transparent
            opacity={dim}
          />
        </mesh>
        <mesh ref={enzymeRing} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.06, 10, 40]} />
          <meshBasicMaterial color="#e9d5ff" transparent opacity={0.7 * dim} />
        </mesh>
      </group>
    </group>
  );
}

/** Second complete helix that scales in at the final step ("two molecules"). */
export function DaughterHelix({ visible, id = 'daughter' }: { visible: boolean; id?: string }) {
  const group = useRef<THREE.Group>(null!);
  const s = useRef(0.0001);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const target = visible ? 1 : 0.0001;
    s.current += (target - s.current) * (1 - Math.exp(-dt * 2.2));
    const v = Math.max(s.current, 0.0001);
    group.current.scale.setScalar(v);
    group.current.visible = s.current > 0.02;
  });

  return (
    <group ref={group} position={[5.6, 0, -0.5]}>
      <DnaHelix id={id} openT={0} interactive showEnzyme={false} nucleotidesActive={false} spin={false} />
    </group>
  );
}
