import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { getState, useStore } from '../store';
import type { Vec3 } from '../data/lessons';

/**
 * Reusable camera system:
 * - free orbit / zoom / pan via OrbitControls
 * - cinematic programmed moves (lesson steps, reset view) via gsap tweens
 * - focus moves when a biological object is selected
 */

interface CameraRigProps {
  defaultTarget: Vec3;
  focusDistance: number;
}

export function CameraRig({ defaultTarget, focusDistance }: CameraRigProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const moveId = useStore((s) => s.cameraMove?.id ?? 0);
  const focusPulse = useStore((s) => s.focusPulse);

  const fly = (pos: Vec3, tgt: Vec3, duration = 1.7) => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.enabled = false;
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);
    gsap.to(camera.position, { x: pos[0], y: pos[1], z: pos[2], duration, ease: 'power3.inOut' });
    gsap.to(controls.target, {
      x: tgt[0],
      y: tgt[1],
      z: tgt[2],
      duration,
      ease: 'power3.inOut',
      onComplete: () => {
        controls.enabled = true;
      },
    });
  };

  // Programmatic moves: lesson step changes, reset view, intro sweep.
  useEffect(() => {
    if (moveId === 0) return;
    const mv = getState().cameraMove;
    if (mv && mv.id === moveId) fly(mv.position, mv.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveId]);

  // Selection focus: pull the camera toward the clicked object.
  useEffect(() => {
    if (focusPulse === 0) return;
    const { selectedPos } = getState();
    if (!selectedPos) return;
    const target = new THREE.Vector3(selectedPos[0], selectedPos[1], selectedPos[2]);
    const dir = camera.position.clone().sub(target);
    if (dir.lengthSq() < 1e-4) dir.set(1, 0.6, 1);
    dir.normalize();
    const pos = target.clone().add(dir.multiplyScalar(focusDistance));
    fly([pos.x, Math.max(pos.y, target.y + 1.2), pos.z], [target.x, target.y, target.z], 1.3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusPulse]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.7}
      minDistance={2.2}
      maxDistance={70}
      target={defaultTarget}
    />
  );
}
