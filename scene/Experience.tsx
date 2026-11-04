'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { type Group, MathUtils } from 'three';
import type { Tier } from '@/lib/quality';
import { AnchorProjector } from './AnchorProjector';
import { CameraRig } from './CameraRig';
import { Core } from './core/Core';
import { Atmosphere } from './effects/Atmosphere';
import { Debris } from './effects/Debris';
import { Dust } from './effects/Dust';
import { Effects } from './effects/Effects';
import { GradeRig } from './effects/GradeRig';
import { Gates } from './thread/Gates';
import { Thread } from './thread/Thread';
import { Worlds } from './worlds/Worlds';

/** Soft fill so the far sides of the rocks hold some shape instead of falling to black. */
function Studio() {
  return (
    <Environment resolution={64} frames={1}>
      <Lightformer form="rect" intensity={1.6} position={[0, 7, 4]} scale={[14, 3, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={2.6} position={[-8, 1, 3]} scale={[1.2, 12, 1]} color="#dfe8ff" />
      <Lightformer form="rect" intensity={2.2} position={[8, -2, 3]} scale={[1, 10, 1]} color="#ffc266" />
      <Lightformer form="rect" intensity={1} position={[0, -7, 2]} scale={[12, 1.5, 1]} color="#ffb24d" />
    </Environment>
  );
}

/** Leans the whole machine slightly toward the pointer, with spring-like easing. */
function PointerTilt({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, pointer.current.x * 0.14, 2.5, delta);
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, pointer.current.y * 0.1, 2.5, delta);
  });

  return <group ref={group}>{children}</group>;
}

export function Experience({ pathname, tier }: { pathname: string; tier: Tier }) {
  return (
    <>
      <ambientLight intensity={0.12} />
      <Studio />
      <CameraRig pathname={pathname} />
      <AnchorProjector pathname={pathname} />
      <GradeRig pathname={pathname} />
      <Atmosphere pathname={pathname} />
      <Dust pathname={pathname} tier={tier} />
      <Debris tier={tier} />
      <PointerTilt>
        <Core key={tier} pathname={pathname} tier={tier} />
        <Thread pathname={pathname} tier={tier} />
        <Gates pathname={pathname} />
        <Worlds pathname={pathname} tier={tier} />
      </PointerTilt>
      <Effects tier={tier} />
    </>
  );
}
