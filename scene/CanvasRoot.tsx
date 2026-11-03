'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { reportFrameRateDecline } from '@/lib/qualityState';
import type { Tier } from '@/lib/quality';
import { Experience } from './Experience';

// Shader compilation always stutters at first, so give the scene time to settle
// before a low frame rate counts against the device.
const SETTLE_MS = 4000;
const FPS_BOUNDS = (): [number, number] => [30, 55];

export default function CanvasRoot({ tier, pathname }: { tier: Tier; pathname: string }) {
  const [ready, setReady] = useState(false);
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  return (
    <div
      aria-hidden="true"
      data-testid="scene"
      className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
    >
      <Canvas
        dpr={tier === 'high' ? [1, 1.75] : [1, 1.5]}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
        camera={{ position: [0, 0, 16], fov: 35, near: 0.1, far: 160 }}
        onCreated={() => setReady(true)}
      >
        <PerformanceMonitor
          bounds={FPS_BOUNDS}
          onDecline={() => {
            if (performance.now() - mountedAt.current > SETTLE_MS) reportFrameRateDecline();
          }}
        />
        <Experience pathname={pathname} tier={tier} />
      </Canvas>
    </div>
  );
}
