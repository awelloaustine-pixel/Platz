'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, type FogExp2 } from 'three';
import { getWorld, segment } from '@/timeline/chapters';
import { master } from '@/timeline/store';

const SMOOTHING = 3;
const colorA = new Color();
const colorB = new Color();

/** Cross-fades the background and fog between chapters and between worlds. */
export function GradeRig({ pathname }: { pathname: string }) {
  const background = useRef<Color>(null);
  const fog = useRef<FogExp2>(null);

  useFrame((_, delta) => {
    if (!background.current || !fog.current) return;
    const chapters = getWorld(pathname).chapters;
    const { from, to, blend } = segment(master.chapter, chapters.length);
    const a = chapters[from].grade;
    const b = chapters[to].grade;
    const amount = 1 - Math.exp(-SMOOTHING * delta);

    background.current.lerp(colorA.set(a.background).lerp(colorB.set(b.background), blend), amount);
    fog.current.color.lerp(colorA.set(a.fog).lerp(colorB.set(b.fog), blend), amount);
    const density = a.fogDensity + (b.fogDensity - a.fogDensity) * blend;
    fog.current.density += (density - fog.current.density) * amount;
  });

  return (
    <>
      <color ref={background} attach="background" args={['#020617']} />
      <fogExp2 ref={fog} attach="fog" args={['#020617', 0.02]} />
    </>
  );
}
