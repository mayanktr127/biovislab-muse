import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { select, useStore } from '../store';

/**
 * Shared interaction helpers for clickable biological structures.
 * - useDim: returns an opacity multiplier — when anything is selected,
 *   every other object dims so the selection stands out (focus mode).
 * - selectAt: click handler that selects the object and stores the exact
 *   click point so the camera can focus on it.
 */

/** Opacity multiplier for focus mode (1 = normal, 0.15 = dimmed). */
export function useDim(id: string): number {
  const selected = useStore((s) => s.selected);
  return selected != null && selected !== id ? 0.15 : 1;
}

/** Click handler: select `id`, focusing the camera on the click point. */
export function selectAt(id: string) {
  return (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(id, [e.point.x, e.point.y, e.point.z]);
  };
}

export function onHover(on: boolean) {
  document.body.style.cursor = on ? 'pointer' : '';
}

/** Shared hover props for clickable meshes. */
export function hoverProps() {
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onHover(true);
    },
    onPointerOut: () => onHover(false),
  };
}

/** Reusable world-position temp (avoid per-frame allocations in callers). */
export const tmpV = new THREE.Vector3();
