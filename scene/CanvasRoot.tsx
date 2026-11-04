'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';
import { reportContextLost, reportFrameRateDecline } from '@/lib/qualityState';
import type { Tier } from '@/lib/quality';
import { Experience } from './Experience';

// Shader compilation always stutters at first, so give the scene time to settle
// before a low frame rate counts against the device.
const SETTLE_MS = 4000;
// The floor sits below 30 because a steady 30fps, which laptops often lock to on battery, is
// smooth enough to keep. Only a rate that is genuinely struggling should lose the 3D.
const FPS_BOUNDS = (): [number, number] => [26, 55];

export default function CanvasRoot({ tier, pathname }: { tier: Tier; pathname: string }) {
  const [ready, setReady] = useState(false);
  const mountedAt = useRef(0);
  const onReady = useCallback(() => {
    // The frame rate only counts against the device from here, once it is actually drawing.
    mountedAt.current = performance.now();
    setReady(true);
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
        frameloop={ready ? 'always' : 'never'}
        onCreated={({ gl }) => {
          // Reading back shader logs makes the browser wait for each compile to finish.
          gl.debug.checkShaderErrors = process.env.NODE_ENV !== 'production';
          gl.domElement.addEventListener('webglcontextlost', reportContextLost);
          // Lets tests read draw calls. Only present when a tier is pinned with ?quality=.
          if (window.location.search.includes('quality=')) {
            (window as unknown as { __platinumRenderer?: unknown }).__platinumRenderer = gl;
          }
        }}
      >
        <PerformanceMonitor
          bounds={FPS_BOUNDS}
          onDecline={() => {
            if (performance.now() - mountedAt.current > SETTLE_MS) reportFrameRateDecline();
          }}
        />
        <Experience pathname={pathname} tier={tier} onReady={onReady} />
      </Canvas>
    </div>
  );
}
