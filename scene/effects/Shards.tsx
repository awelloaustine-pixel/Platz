'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { type InstancedMesh, Object3D } from 'three';
import type { Tier } from '@/lib/quality';
import { seededRandom } from '@/lib/random';
import { createPanelMaterial } from '../core/petalMaterial';

const dummy = new Object3D();

/** Broken-off solar panels drifting in the distance, giving the space depth and scale. */
export function Shards({ tier }: { tier: Tier }) {
  const count = tier === 'high' ? 70 : 24;
  const material = useMemo(() => createPanelMaterial(), []);
  const { shards, emissive } = useMemo(() => {
    const random = seededRandom(31);
    const glow = new Float32Array(count * 3);
    const list = Array.from({ length: count }, (_, index) => {
      const angle = random() * Math.PI * 2;
      const radius = 7 + random() * 15;
      const lit = random() > 0.8 ? 1.5 : 0.01;
      glow.set([lit, lit * 0.62, lit * 0.14], index * 3);
      return {
        x: Math.cos(angle) * radius,
        y: (random() - 0.5) * 16,
        z: Math.sin(angle) * radius - 3,
        rx: random() * 6.28,
        ry: random() * 6.28,
        speed: 0.04 + random() * 0.12,
        scaleX: 0.25 + random() * 0.9,
        scaleY: 0.2 + random() * 0.6,
      };
    });
    return { shards: list, emissive: glow };
  }, [count]);
  const mesh = useRef<InstancedMesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    time.current += delta;
    shards.forEach((shard, index) => {
      dummy.position.set(shard.x, shard.y + Math.sin(time.current * shard.speed + shard.rx) * 0.5, shard.z);
      dummy.rotation.set(shard.rx + time.current * shard.speed, shard.ry + time.current * shard.speed * 0.7, 0);
      dummy.scale.set(shard.scaleX, shard.scaleY, 1);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, material, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 0.05]}>
        <instancedBufferAttribute attach="attributes-aEmissive" args={[emissive, 3]} />
      </boxGeometry>
    </instancedMesh>
  );
}
