'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Color, type MeshBasicMaterial, Quaternion, Vector3 } from 'three';
import { getWorld, sampleChapter } from '@/timeline/chapters';
import { master } from '@/timeline/store';
import { threadCurve } from './threadPath';

/** Where each gate sits along the thread, and the lit count that switches it on. */
const GATES = [
  { along: 0.2, litAt: 4 },
  { along: 0.27, litAt: 8 },
  { along: 0.345, litAt: 12 },
];
const DARK = new Color('#6b5a33');
const LIT = new Color(4, 2.4, 0.5);
const FORWARD = new Vector3(0, 0, 1);

/** The three light gates the camera rides through in How It Works. */
export function Gates({ pathname }: { pathname: string }) {
  const gates = useMemo(() => {
    const curve = threadCurve();
    return GATES.map((gate) => ({
      ...gate,
      position: curve.getPointAt(gate.along),
      quaternion: new Quaternion().setFromUnitVectors(FORWARD, curve.getTangentAt(gate.along).normalize()),
    }));
  }, []);
  const materials = useRef<(MeshBasicMaterial | null)[]>([]);
  const glow = useRef(GATES.map(() => 0));
  const mix = useRef(new Color());

  useFrame((_, delta) => {
    const chapters = getWorld(pathname).chapters;
    const presence = sampleChapter(chapters, master.chapter, (chapter) => chapter.gates ?? 0);
    const lit = sampleChapter(chapters, master.chapter, (chapter) => chapter.lit);
    gates.forEach((gate, index) => {
      const material = materials.current[index];
      if (!material) return;
      glow.current[index] = damp(glow.current[index], lit >= gate.litAt - 0.6 ? 1 : 0, 4, delta);
      material.color.copy(mix.current.copy(DARK).lerp(LIT, glow.current[index]));
      material.opacity = presence;
      material.visible = presence > 0.01;
    });
  });

  return (
    <>
      {gates.map((gate, index) => (
        <mesh key={index} position={gate.position} quaternion={gate.quaternion}>
          <torusGeometry args={[1.25, 0.022, 10, 96]} />
          <meshBasicMaterial
            ref={(material) => {
              materials.current[index] = material;
            }}
            transparent
            toneMapped={false}
            fog={false}
          />
        </mesh>
      ))}
    </>
  );
}

function damp(from: number, to: number, lambda: number, delta: number): number {
  return from + (to - from) * (1 - Math.exp(-lambda * delta));
}
