import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getState } from '../../store';
import { useDim, selectAt, hoverProps, tmpV } from '../selectable';

/* ------------------------------------------------------------------ */
/* Cell membrane — large translucent, gently deformed sphere           */
/* ------------------------------------------------------------------ */
export function CellMembrane() {
  const dim = useDim('membrane');
  const mesh = useRef<THREE.Mesh>(null!);

  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(9, 48, 32);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      const d = 1 + 0.045 * Math.sin(n.x * 5 + 1) * Math.sin(n.y * 4) * Math.sin(n.z * 6 + 2);
      v.copy(n.multiplyScalar(9 * d));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((st) => {
    const t = st.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.02;
    mesh.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.006);
  });

  return (
    <mesh ref={mesh} geometry={geo} onClick={selectAt('membrane')} {...hoverProps()}>
      <meshPhysicalMaterial
        color="#2dd4bf"
        transparent
        opacity={0.13 * dim}
        roughness={0.18}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.4}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Nucleus — translucent shell, glowing nucleolus, tangled chromatin   */
/* ------------------------------------------------------------------ */
const KNOTS = [
  { pos: [0.75, 0.45, 0.3] as const, color: '#f0abfc', speed: 0.28 },
  { pos: [-0.8, -0.35, 0.6] as const, color: '#67e8f9', speed: -0.22 },
  { pos: [0.1, -0.7, -0.75] as const, color: '#fda4af', speed: 0.34 },
];

export function Nucleus() {
  const dim = useDim('nucleus');
  const dnaDim = useDim('dna');
  const group = useRef<THREE.Group>(null!);
  const knots = useRef<(THREE.Mesh | null)[]>([]);
  const nucleolusMat = useRef<THREE.MeshStandardMaterial>(null!);
  const knotGeo = useMemo(() => new THREE.TorusKnotGeometry(0.85, 0.2, 80, 10, 2, 3), []);

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime;
    knots.current.forEach((k, i) => {
      if (!k) return;
      k.rotation.x += dt * KNOTS[i].speed;
      k.rotation.y += dt * KNOTS[i].speed * 0.7;
    });
    group.current.rotation.y = t * 0.05;
    if (nucleolusMat.current) {
      nucleolusMat.current.emissiveIntensity = (0.7 + Math.sin(t * 2) * 0.25) * dim;
    }
  });

  return (
    <group ref={group} position={[0, 0.8, 0]}>
      {/* shell */}
      <mesh onClick={selectAt('nucleus')} {...hoverProps()}>
        <sphereGeometry args={[3.1, 40, 28]} />
        <meshPhysicalMaterial
          color="#8b5cf6"
          transparent
          opacity={0.28 * dim}
          roughness={0.35}
          clearcoat={0.6}
          emissive="#4c1d95"
          emissiveIntensity={0.3 * dim}
          depthWrite={false}
        />
      </mesh>
      {/* nucleolus */}
      <mesh position={[0.9, -0.8, 0.9]}>
        <sphereGeometry args={[0.85, 24, 18]} />
        <meshStandardMaterial
          ref={nucleolusMat}
          color="#f472b6"
          emissive="#ec4899"
          emissiveIntensity={0.8}
          roughness={0.4}
          transparent
          opacity={dim}
        />
      </mesh>
      {/* chromatin tangles = simplified DNA packaging */}
      {KNOTS.map((k, i) => (
        <mesh
          key={i}
          ref={(m) => {
            knots.current[i] = m;
          }}
          geometry={knotGeo}
          position={[k.pos[0], k.pos[1], k.pos[2]]}
          onClick={selectAt('dna')}
          {...hoverProps()}
        >
          <meshStandardMaterial
            color={k.color}
            emissive={k.color}
            emissiveIntensity={0.55 * dnaDim}
            roughness={0.4}
            transparent
            opacity={0.95 * dnaDim}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Mitochondria — capsule with glowing folded inner membrane (cristae) */
/* ------------------------------------------------------------------ */
export function Mitochondria({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const dim = useDim('mitochondria');
  const group = useRef<THREE.Group>(null!);

  const cristaeGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      pts.push(
        new THREE.Vector3(
          Math.sin(i * 1.4) * 0.32,
          -1.1 + (i / 20) * 2.2,
          Math.cos(i * 1.1) * 0.22,
        ),
      );
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.11, 8, false);
  }, []);

  useFrame((st) => {
    const t = st.clock.elapsedTime;
    group.current.position.y = position[1] + Math.sin(t * 0.9 + position[0] * 2) * 0.25;
    group.current.rotation.y = rotation[1] + t * 0.08;
  });

  return (
    <group ref={group} position={position} rotation={rotation} onClick={selectAt('mitochondria')} {...hoverProps()}>
      <mesh>
        <capsuleGeometry args={[0.72, 1.7, 8, 18]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#92400e"
          emissiveIntensity={0.45 * dim}
          roughness={0.42}
          transparent
          opacity={0.92 * dim}
        />
      </mesh>
      <mesh geometry={cristaeGeo}>
        <meshStandardMaterial
          color="#fdba74"
          emissive="#fb923c"
          emissiveIntensity={1.15 * dim}
          roughness={0.4}
          transparent
          opacity={0.95 * dim}
        />
      </mesh>
    </group>
  );
}

export function MitochondriaField() {
  return (
    <>
      <Mitochondria position={[4.4, 0.2, 1.6]} rotation={[0.4, 0.6, 0.2]} />
      <Mitochondria position={[-3.6, 1.6, -2.4]} rotation={[-0.3, 2.1, 0.4]} />
      <Mitochondria position={[1.2, -3.2, 2.8]} rotation={[0.9, -0.5, 0.1]} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Ribosomes — instanced two-subunit protein builders                  */
/* ------------------------------------------------------------------ */
export function Ribosomes({ count = 70 }: { count?: number }) {
  const dim = useDim('ribosomes');
  const big = useRef<THREE.InstancedMesh>(null!);
  const small = useRef<THREE.InstancedMesh>(null!);
  const group = useRef<THREE.Group>(null!);

  const data = useMemo(() => {
    const arr: { pos: THREE.Vector3; s: number }[] = [];
    let guard = 0;
    while (arr.length < count && guard++ < 4000) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(4.2 + Math.random() * 3.6);
      arr.push({ pos: v, s: 0.8 + Math.random() * 0.6 });
    }
    return arr;
  }, [count]);

  useEffect(() => {
    const d = new THREE.Object3D();
    data.forEach((r, i) => {
      d.position.copy(r.pos);
      d.scale.setScalar(r.s);
      d.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      d.updateMatrix();
      big.current.setMatrixAt(i, d.matrix);
      d.position.y += 0.3 * r.s;
      d.scale.setScalar(r.s * 0.62);
      d.updateMatrix();
      small.current.setMatrixAt(i, d.matrix);
    });
    big.current.instanceMatrix.needsUpdate = true;
    small.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  useFrame((_, dt) => {
    group.current.rotation.y += dt * 0.02;
  });

  return (
    <group ref={group}>
      <instancedMesh
        ref={big}
        args={[undefined, undefined, count]}
        onClick={selectAt('ribosomes')}
        {...hoverProps()}
      >
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshStandardMaterial
          color="#bef264"
          emissive="#4d7c0f"
          emissiveIntensity={0.35 * dim}
          roughness={0.5}
          transparent
          opacity={dim}
        />
      </instancedMesh>
      <instancedMesh ref={small} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshStandardMaterial
          color="#d9f99d"
          emissive="#4d7c0f"
          emissiveIntensity={0.35 * dim}
          roughness={0.5}
          transparent
          opacity={dim}
        />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* MoleculeSwarm — drifting molecules; some cross the membrane on cue   */
/* ------------------------------------------------------------------ */
export function MoleculeSwarm({ count = 44, crossing = false }: { count?: number; crossing?: boolean }) {
  const dim = useDim('molecules');
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const arr: {
      base: THREE.Vector3;
      phase: number;
      speed: number;
      dir: THREE.Vector3;
      cross: boolean;
    }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        base: new THREE.Vector3().randomDirection().multiplyScalar(3 + Math.random() * 5),
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        dir: new THREE.Vector3().randomDirection(),
        cross: i < 8,
      });
    }
    return arr;
  }, [count]);

  useFrame((st) => {
    const t = st.clock.elapsedTime * getState().speed;
    for (let i = 0; i < data.length; i++) {
      const m = data[i];
      if (m.cross && crossing) {
        // shuttle from inside the cell (r=5.5) to outside (r=12) and loop
        const p = (t * 0.12 + m.phase / (Math.PI * 2)) % 1;
        tmpV.copy(m.dir).multiplyScalar(5.5 + p * 6.5);
        dummy.position.copy(tmpV);
      } else {
        dummy.position.set(
          m.base.x + Math.sin(t * m.speed + m.phase) * 0.7,
          m.base.y + Math.cos(t * m.speed * 0.9 + m.phase) * 0.7,
          m.base.z + Math.sin(t * m.speed * 0.7 + m.phase * 2) * 0.7,
        );
      }
      dummy.rotation.set(m.phase, t * 0.2 + m.phase, 0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      onClick={selectAt('molecules')}
      {...hoverProps()}
    >
      <icosahedronGeometry args={[0.16, 0]} />
      <meshStandardMaterial
        color="#5eead2"
        emissive="#0f766e"
        emissiveIntensity={0.7 * dim}
        roughness={0.4}
        transparent
        opacity={0.9 * dim}
      />
    </instancedMesh>
  );
}
