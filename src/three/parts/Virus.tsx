import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDim, selectAt, hoverProps } from '../selectable';
import { BioLabel } from '../Labels';

export const CELL_CENTER: [number, number, number] = [0, -14, 0];
export const CELL_R = 16;
/** y of the membrane surface directly above the cell center */
export const SURFACE_Y = CELL_CENTER[1] + CELL_R; // 2

/* ------------------------------------------------------------------ */
/* Virus — spiked sphere, position driven by a shared ref (no renders) */
/* ------------------------------------------------------------------ */
export function VirusBody({
  positionRef,
  showVirusLabel,
  showSpikeLabel,
}: {
  positionRef: React.MutableRefObject<THREE.Vector3>;
  showVirusLabel: boolean;
  showSpikeLabel: boolean;
}) {
  const dim = useDim('virus');
  const spikeDim = useDim('spike');
  const group = useRef<THREE.Group>(null!);
  const stalk = useRef<THREE.InstancedMesh>(null!);
  const head = useRef<THREE.InstancedMesh>(null!);

  const spikes = useMemo(() => {
    const pts: { dir: THREE.Vector3; quat: THREE.Quaternion }[] = [];
    const n = 80;
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(Math.max(1 - y * y, 0));
      const th = i * 2.39996; // golden angle
      const dir = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      pts.push({ dir, quat });
    }
    return pts;
  }, []);

  useEffect(() => {
    const d = new THREE.Object3D();
    spikes.forEach((s, i) => {
      d.quaternion.copy(s.quat);
      d.position.copy(s.dir).multiplyScalar(1.15 + 0.28);
      d.updateMatrix();
      stalk.current.setMatrixAt(i, d.matrix);
      d.position.copy(s.dir).multiplyScalar(1.15 + 0.56 + 0.1);
      d.updateMatrix();
      head.current.setMatrixAt(i, d.matrix);
    });
    stalk.current.instanceMatrix.needsUpdate = true;
    head.current.instanceMatrix.needsUpdate = true;
  }, [spikes]);

  useFrame((st, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    group.current.position.copy(positionRef.current);
    group.current.position.y += Math.sin(st.clock.elapsedTime * 1.4) * 0.1;
    group.current.rotation.y += dt * 0.35;
  });

  return (
    <group ref={group}>
      <mesh onClick={selectAt('virus')} {...hoverProps()}>
        <sphereGeometry args={[1.15, 40, 28]} />
        <meshStandardMaterial
          color="#dc2626"
          roughness={0.35}
          metalness={0.05}
          emissive="#7f1d1d"
          emissiveIntensity={0.7 * dim}
          transparent
          opacity={dim}
        />
      </mesh>
      {/* inner glow */}
      <mesh>
        <sphereGeometry args={[0.92, 24, 18]} />
        <meshBasicMaterial color="#f87171" transparent opacity={0.3 * dim} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <instancedMesh ref={stalk} args={[undefined, undefined, spikes.length]}>
        <cylinderGeometry args={[0.05, 0.07, 0.56, 6]} />
        <meshStandardMaterial
          color="#fca5a5"
          roughness={0.5}
          emissive="#b91c1c"
          emissiveIntensity={0.4 * dim}
          transparent
          opacity={dim}
        />
      </instancedMesh>
      <instancedMesh ref={head} args={[undefined, undefined, spikes.length]} onClick={selectAt('spike')} {...hoverProps()}>
        <sphereGeometry args={[0.15, 10, 8]} />
        <meshStandardMaterial
          color="#fecaca"
          emissive="#ef4444"
          emissiveIntensity={1.4 * spikeDim}
          transparent
          opacity={spikeDim}
        />
      </instancedMesh>
      <BioLabel position={[0, 2.2, 0]} text="Virus" visible={showVirusLabel} />
      <BioLabel position={[1.6, 1.3, 0.9]} text="Spike proteins" visible={showSpikeLabel} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Cell membrane — the visible "floor": top of a giant cell sphere      */
/* ------------------------------------------------------------------ */
export function MembranePatch() {
  const dim = useDim('membrane');
  const mesh = useRef<THREE.Mesh>(null!);

  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(CELL_R, 72, 48);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      const d = 1 + 0.012 * Math.sin(n.x * 9) * Math.sin(n.y * 7 + 2) * Math.sin(n.z * 8 + 1);
      v.copy(n.multiplyScalar(CELL_R * d));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((st) => {
    mesh.current.scale.setScalar(1 + Math.sin(st.clock.elapsedTime * 0.4) * 0.004);
  });

  return (
    <mesh ref={mesh} geometry={geo} position={CELL_CENTER} onClick={selectAt('membrane')} {...hoverProps()}>
      <meshPhysicalMaterial
        color="#14b8a6"
        transparent
        opacity={0.24 * dim}
        roughness={0.22}
        clearcoat={1}
        clearcoatRoughness={0.5}
        emissive="#0f766e"
        emissiveIntensity={0.25 * dim}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** y of membrane surface at (x, z) on the giant cell sphere */
export function surfaceY(x: number, z: number): number {
  const dx = x - CELL_CENTER[0];
  const dz = z - CELL_CENTER[2];
  const inside = Math.max(CELL_R * CELL_R - dx * dx - dz * dz, 0);
  return CELL_CENTER[1] + Math.sqrt(inside);
}

/* ------------------------------------------------------------------ */
/* Receptors — small proteins on the membrane; one highlighted target  */
/* ------------------------------------------------------------------ */
export function Receptors({ highlight, count = 34 }: { highlight: boolean; count?: number }) {
  const dim = useDim('receptor');
  const ref = useRef<THREE.InstancedMesh>(null!);
  const specialMat = useRef<THREE.MeshStandardMaterial>(null!);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const center = useMemo(() => new THREE.Vector3(...CELL_CENTER), []);

  useEffect(() => {
    const d = new THREE.Object3D();
    const p = new THREE.Vector3();
    const n = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2.5 + Math.random() * 5;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      p.set(x, surfaceY(x, z), z);
      n.copy(p).sub(center).normalize();
      d.position.copy(p).addScaledVector(n, 0.35);
      d.quaternion.setFromUnitVectors(up, n);
      d.updateMatrix();
      ref.current.setMatrixAt(i, d.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count, up, center]);

  useFrame((st) => {
    if (specialMat.current) {
      const pulse = 0.8 + 0.4 * Math.sin(st.clock.elapsedTime * 3);
      specialMat.current.emissiveIntensity = (highlight ? 2.4 : 1.1) * pulse * dim;
    }
  });

  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, count]}>
        <capsuleGeometry args={[0.09, 0.6, 4, 10]} />
        <meshStandardMaterial
          color="#5eead2"
          emissive="#0d9488"
          emissiveIntensity={0.5 * dim}
          roughness={0.45}
          transparent
          opacity={dim}
        />
      </instancedMesh>
      {/* the target receptor the virus docks to */}
      <mesh
        position={[0, SURFACE_Y + 0.5, 0]}
        onClick={selectAt('receptor')}
        {...hoverProps()}
      >
        <capsuleGeometry args={[0.16, 0.9, 4, 12]} />
        <meshStandardMaterial
          ref={specialMat}
          color="#67e8f9"
          emissive="#22d3ee"
          emissiveIntensity={1.2}
          roughness={0.35}
          transparent
          opacity={dim}
        />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* FusionGlow — expanding ring at the entry site during endocytosis    */
/* ------------------------------------------------------------------ */
export function FusionGlow({ active }: { active: boolean }) {
  const ring = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame((st) => {
    if (!active) {
      ring.current.visible = false;
      return;
    }
    ring.current.visible = true;
    const p = (st.clock.elapsedTime * 0.55) % 1;
    ring.current.scale.setScalar(0.5 + p * 2.6);
    mat.current.opacity = (1 - p) * 0.85;
  });

  return (
    <mesh ref={ring} position={[0, SURFACE_Y + 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <torusGeometry args={[1, 0.09, 10, 48]} />
      <meshBasicMaterial ref={mat} color="#67e8f9" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* GenomeBurst — viral genome particles released inside the cell       */
/* ------------------------------------------------------------------ */
export function GenomeBurst({
  positionRef,
  released,
  count = 26,
}: {
  positionRef: React.MutableRefObject<THREE.Vector3>;
  released: boolean;
  count?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const origin = useMemo(() => new THREE.Vector3(), []);
  const originSet = useRef(false);
  const p = useRef(0);
  const dirs = useMemo(
    () => Array.from({ length: count }, () => new THREE.Vector3().randomDirection()),
    [count],
  );

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (released && !originSet.current) {
      origin.copy(positionRef.current);
      originSet.current = true;
    }
    const target = released ? 1 : 0;
    p.current += (target - p.current) * (1 - Math.exp(-dt * 1.4));
    const eased = p.current * p.current * (3 - 2 * p.current);
    for (let i = 0; i < count; i++) {
      dummy.position.copy(origin).addScaledVector(dirs[i], eased * 3.4);
      dummy.scale.setScalar(Math.max(eased, 0.0001));
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.visible = p.current > 0.02;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      onClick={selectAt('genome')}
      {...hoverProps()}
    >
      <sphereGeometry args={[0.16, 10, 8]} />
      <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={1.6} roughness={0.4} />
    </instancedMesh>
  );
}

/** Thin glowing tether from virus toward receptor while docking (steps 1-2). */
export function DockTether({ visible }: { visible: boolean }) {
  const line = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame((st) => {
    line.current.visible = visible;
    if (visible && mat.current) mat.current.opacity = 0.35 + Math.sin(st.clock.elapsedTime * 4) * 0.15;
  });
  return (
    <mesh ref={line} position={[0.55, SURFACE_Y + 0.9, 0.55]} visible={false}>
      <cylinderGeometry args={[0.03, 0.03, 1.6, 6]} />
      <meshBasicMaterial ref={mat} color="#67e8f9" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}
