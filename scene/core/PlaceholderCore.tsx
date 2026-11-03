'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import { Color, type Group, type InstancedMesh, Object3D } from 'three';
import { master, ui } from '@/timeline/store';

const PETALS = 12;
const DARK = new Color('#2A2F38');
const GOLD = new Color('#D4A62A');
const dummy = new Object3D();

/**
 * Temporary stand-in that proves the wiring: its 12 bars light from the same petalsLit
 * value as the HUD, and it turns with master progress. Step 2 replaces it with the Core.
 */
export function PlaceholderCore() {
  const group = useRef<Group>(null);
  const bars = useRef<InstancedMesh>(null);
  const shownLit = useRef(-1);

  useLayoutEffect(() => {
    const mesh = bars.current;
    if (!mesh) return;
    for (let i = 0; i < PETALS; i += 1) {
      dummy.rotation.set(0, 0, (i / PETALS) * Math.PI * 2);
      dummy.position.set(-Math.sin(dummy.rotation.z) * 1.9, Math.cos(dummy.rotation.z) * 1.9, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, DARK);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame(() => {
    const mesh = bars.current;
    if (group.current) group.current.rotation.z = master.progress * Math.PI * 2;
    const { petalsLit } = ui.get();
    if (!mesh || !mesh.instanceColor || petalsLit === shownLit.current) return;
    shownLit.current = petalsLit;
    for (let i = 0; i < PETALS; i += 1) mesh.setColorAt(i, i < petalsLit ? GOLD : DARK);
    mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[0.8, 0.06, 16, 64]} />
        <meshStandardMaterial color="#C9CCD1" metalness={0.9} roughness={0.3} />
      </mesh>
      <instancedMesh ref={bars} args={[undefined, undefined, PETALS]}>
        <boxGeometry args={[0.28, 1.6, 0.04]} />
        <meshStandardMaterial metalness={0.6} roughness={0.4} />
      </instancedMesh>
    </group>
  );
}
