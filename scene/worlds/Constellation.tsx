'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import { usePresence } from './usePresence';

/** Must match the label positions on the About page and the 'team' beams in threadPath. */
const NODES = [
  [-4.4, 3, 0.6],
  [4.4, 3, 0.6],
  [-4.4, -3, 0.6],
  [4.4, -3, 0.6],
] as const;

/** The team as four glowing points, joined to the Core and each other by the thread. */
export function Constellation({ active }: { active: boolean }) {
  const { group } = usePresence(active);
  const spin = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!spin.current || !active) return;
    spin.current.children.forEach((node, index) => {
      node.rotation.x += delta * (0.2 + index * 0.05);
      node.rotation.y += delta * 0.3;
    });
  });

  return (
    <group ref={group} visible={false}>
      <group ref={spin}>
        {NODES.map((position, index) => (
          <mesh key={index} position={position}>
            <icosahedronGeometry args={[0.24, 1]} />
            <meshBasicMaterial color={[3.6, 2.2, 0.5]} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
