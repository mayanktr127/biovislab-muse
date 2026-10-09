import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Reusable ambient particle field for microscopic environments.
 * A single THREE.Points draw call; per-frame drift is computed on the CPU
 * from base positions + phases (no per-particle React components).
 */

function makeSprite(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

interface ParticleFieldProps {
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
  /** drift speed multiplier (respects lesson speed via prop) */
  drift?: number;
  opacity?: number;
}

export function ParticleField({
  count = 700,
  radius = 24,
  color = '#7fd4ff',
  size = 0.14,
  drift = 1,
  opacity = 0.55,
}: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null!);

  const { base, phase, amp } = useMemo(() => {
    const base = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const amp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // uniform distribution inside a sphere
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      base[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      base[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      base[i * 3 + 2] = r * Math.cos(phi);
      phase[i] = Math.random() * Math.PI * 2;
      amp[i] = 0.3 + Math.random() * 0.9;
    }
    return { base, phase, amp };
  }, [count, radius]);

  const map = useMemo(makeSprite, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime * drift;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const s = 0.22;
    for (let i = 0; i < count; i++) {
      const p = phase[i];
      const a = amp[i];
      arr[i * 3] = base[i * 3] + Math.sin(t * s + p) * a;
      arr[i * 3 + 1] = base[i * 3 + 1] + Math.cos(t * s * 0.8 + p * 1.7) * a;
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.sin(t * s * 0.6 + p * 2.3) * a;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        {/* copy the base array: the attribute array is mutated every frame */}
        <bufferAttribute attach="attributes-position" args={[base.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        map={map}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
