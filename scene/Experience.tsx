'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import {
  type Camera,
  type Group,
  HalfFloatType,
  MathUtils,
  type Scene,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import type { Tier } from '@/lib/quality';
import { AnchorProjector } from './AnchorProjector';
import { CameraRig } from './CameraRig';
import { Core } from './core/Core';
import { prebuildRocks } from './core/rockGeometry';
import { Atmosphere } from './effects/Atmosphere';
import { Debris } from './effects/Debris';
import { Dust } from './effects/Dust';
import { Effects } from './effects/Effects';
import { GradeRig } from './effects/GradeRig';
import { Gates } from './thread/Gates';
import { Thread } from './thread/Thread';
import { Worlds } from './worlds/Worlds';

const LAST_STAGE = 4;
const COMPILE_TIMEOUT_MS = 8000;

/** Waits for a painted frame and a moment of quiet, so that taps and scrolling get a turn. */
function nextSlice(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 250 });
      else setTimeout(resolve, 16);
    });
  });
}

/**
 * Compiles every shader in the background where the device allows it. Compiling on first draw
 * was the largest single block on a throttled phone. The effects pipeline draws into a float
 * target, and shaders differ by target, so compiling for the screen would all be wasted.
 */
async function compileInBackground(gl: WebGLRenderer, scene: Scene, camera: Camera): Promise<void> {
  const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
  gl.setRenderTarget(target);
  const compiled = gl.compileAsync(scene, camera);
  gl.setRenderTarget(null);
  const giveUp = new Promise((resolve) => setTimeout(resolve, COMPILE_TIMEOUT_MS));
  await Promise.race([compiled, giveUp]).catch(() => undefined);
  target.dispose();
}

/**
 * Brings the scene up in steps, with the canvas not drawing at all until the end (see the
 * frameloop in CanvasRoot), so that a half-built scene never competes with the page.
 */
function useStages(tier: Tier, onReady: () => void): number {
  const [stage, setStage] = useState(0);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await prebuildRocks(tier, nextSlice);
      for (let next = 1; next <= LAST_STAGE; next += 1) {
        await nextSlice();
        if (cancelled) return;
        setStage((current) => Math.max(current, next));
      }
      await nextSlice();
      if (cancelled) return;
      await compileInBackground(gl, scene, camera);
      if (!cancelled) onReady();
    })();
    return () => {
      cancelled = true;
    };
  }, [tier, onReady, gl, scene, camera]);

  return stage;
}

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

interface ExperienceProps {
  pathname: string;
  tier: Tier;
  /** Called once everything exists, when the canvas can fade in. */
  onReady: () => void;
}

export function Experience({ pathname, tier, onReady }: ExperienceProps) {
  const stage = useStages(tier, onReady);

  return (
    <>
      <ambientLight intensity={0.12} />
      {/* The studio's environment map is costly to prepare, so phones use a plain sky light. */}
      {tier === 'high' ? <Studio /> : <hemisphereLight args={['#dfe8ff', '#ffb24d', 0.55]} />}
      <CameraRig pathname={pathname} />
      <AnchorProjector pathname={pathname} />
      <GradeRig pathname={pathname} />
      <Atmosphere pathname={pathname} />
      <PointerTilt>
        {stage >= 1 && <Core key={tier} pathname={pathname} tier={tier} />}
        {stage >= 2 && (
          <>
            <Thread pathname={pathname} tier={tier} />
            <Gates pathname={pathname} />
            <Worlds pathname={pathname} tier={tier} />
          </>
        )}
      </PointerTilt>
      {stage >= 3 && (
        <>
          <Dust pathname={pathname} tier={tier} />
          <Debris tier={tier} />
        </>
      )}
      {stage >= 4 && <Effects tier={tier} />}
    </>
  );
}
