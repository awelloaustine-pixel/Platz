'use client';

import { useFrame } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, type ChromaticAberrationEffect, ToneMappingMode } from 'postprocessing';
import { useMemo, useRef } from 'react';
import { Vector2 } from 'three';
import type { Tier } from '@/lib/quality';
import { master } from '@/timeline/store';

const RESTING_OFFSET = 0.00025;
const FLASH_PER_SPEED = 0.9;
const TRANSITION_OFFSET = 0.0014;

/**
 * Only values above 1 bloom, so the gold and the thread glow while rock and text stay crisp.
 * A DepthOfField pass held Iris Xe laptops to 22-25fps, so Dust fakes lens blur in its shader.
 */
export function Effects({ tier }: { tier: Tier }) {
  const aberration = useRef<ChromaticAberrationEffect>(null);
  const offset = useMemo(() => new Vector2(RESTING_OFFSET, RESTING_OFFSET), []);

  const motion = useRef({ last: 0, flash: 0 });

  useFrame((_, delta) => {
    if (!aberration.current) return;
    const state = motion.current;
    // A flash while moving quickly between chapters, gone the moment scrolling stops.
    const speed = Math.abs(master.chapter - state.last) / Math.max(delta, 0.001);
    state.last = master.chapter;
    state.flash += (Math.min(speed * FLASH_PER_SPEED, 1) - state.flash) * (1 - Math.exp(-6 * delta));
    const value = RESTING_OFFSET + state.flash * TRANSITION_OFFSET;
    aberration.current.offset.set(value, value);
  });

  if (tier === 'high') {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.6} radius={0.72} levels={5} />
        <ChromaticAberration ref={aberration} offset={offset} radialModulation={false} modulationOffset={0} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.28} darkness={0.72} />
        <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.16} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.55} radius={0.68} levels={5} />
      <ChromaticAberration ref={aberration} offset={offset} radialModulation={false} modulationOffset={0} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette eskil={false} offset={0.28} darkness={0.7} />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.14} />
    </EffectComposer>
  );
}
