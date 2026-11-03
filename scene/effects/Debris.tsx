'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { InstancedBufferAttribute, type InstancedMesh, Object3D } from 'three';
import type { Tier } from '@/lib/quality';
import { seededRandom } from '@/lib/random';
import { createRockGeometry } from '../core/rockGeometry';
import { createRockMaterial } from '../core/rockMaterial';

const dummy = new Object3D();

/** Small rocks drifting through the space, giving it depth and scale. */
export function Debris({ tier }: { tier: Tier }) {
  const count = tier === 'high' ? 110 : 36;
  const material = useMemo(() => createRockMaterial(2), []);
  const { pieces, geometry } = useMemo(() => {
    const random = seededRandom(31);
    const shape = createRockGeometry(77, tier === 'high' ? 6 : 4);
    // Debris stays unlit: only the 12 stones carry veins, so the count on the HUD reads true.
    const glow = new Float32Array(count * 3);
    const front = new Float32Array(count);
    const list = Array.from({ length: count }, () => {
      const angle = random() * Math.PI * 2;
      const radius = 3 + Math.pow(random(), 0.6) * 20;
      return {
        x: Math.cos(angle) * radius,
        y: (random() - 0.5) * 18,
        z: Math.sin(angle) * radius - 2,
        rx: random() * 6.28,
        ry: random() * 6.28,
        speed: 0.03 + random() * 0.12,
        scale: 0.05 + Math.pow(random(), 3) * 0.62,
      };
    });
    shape.setAttribute('aEmissive', new InstancedBufferAttribute(glow, 3));
    shape.setAttribute('aFront', new InstancedBufferAttribute(front, 1));
    return { pieces: list, geometry: shape };
  }, [count, tier]);
  const mesh = useRef<InstancedMesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    time.current += delta;
    pieces.forEach((piece, index) => {
      dummy.position.set(piece.x, piece.y + Math.sin(time.current * piece.speed + piece.rx) * 0.5, piece.z);
      dummy.rotation.set(piece.rx + time.current * piece.speed, piece.ry + time.current * piece.speed * 0.7, 0);
      dummy.scale.setScalar(piece.scale);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}
