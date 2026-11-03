'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, CatmullRomCurve3, Color, type Mesh, type ShaderMaterial, TubeGeometry, Vector3 } from 'three';
import type { Tier } from '@/lib/quality';
import { getWorld, segment } from '@/timeline/chapters';
import { master } from '@/timeline/store';
import { BEAMS, THREAD_WEIGHTS } from './threadPath';
import { flareFragmentShader, flareVertexShader, threadFragmentShader, threadVertexShader } from './threadShader';

const SHOOT_IN_SECONDS = 1.8;
const accentA = new Color();
const accentB = new Color();

export function Thread({ pathname, tier }: { pathname: string; tier: Tier }) {
  const beams = useMemo(() => {
    const radial = tier === 'high' ? 10 : 6;
    return BEAMS.map((beam, index) => {
      const curve = new CatmullRomCurve3(
        beam.points.map(([x, y, z]) => new Vector3(x, y, z)),
        Boolean(beam.closed),
      );
      return {
        ...beam,
        key: index,
        geometry: new TubeGeometry(curve, tier === 'high' ? 320 : 180, beam.radius, radial, Boolean(beam.closed)),
        length: curve.getLength(),
      };
    });
  }, [tier]);

  const materials = useRef<(ShaderMaterial | null)[]>([]);
  const flareMesh = useRef<Mesh>(null);
  const flareMaterial = useRef<ShaderMaterial>(null);
  const motion = useRef({
    time: 0,
    weights: BEAMS.map(() => 0),
    color: new Color('#D4A62A'),
    flare: 0,
  });

  useFrame(({ camera, size }, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20);
    const state = motion.current;
    state.time += delta;
    const shootIn = Math.min(state.time / SHOOT_IN_SECONDS, 1);
    const draw = 1 - Math.pow(1 - shootIn, 3);

    const chapters = getWorld(pathname).chapters;
    const { from, to, blend } = segment(master.chapter, chapters.length);
    const a = chapters[from];
    const b = chapters[to];
    const amount = 1 - Math.exp(-3 * delta);

    accentA.set(a.grade.accent).lerp(accentB.set(b.grade.accent), blend);
    state.color.lerp(accentA, amount);

    beams.forEach((beam, index) => {
      // On portrait phones the text sits directly below the hub, where the vertical beam would run.
      const placement = beam.group === 'cross' && size.width < size.height ? 0.2 : 1;
      const target =
        (THREAD_WEIGHTS[a.thread][beam.group] * (1 - blend) + THREAD_WEIGHTS[b.thread][beam.group] * blend) * placement;
      state.weights[index] += (target - state.weights[index]) * amount;
      const material = materials.current[index];
      if (!material) return;
      material.uniforms.uTime.value = state.time;
      material.uniforms.uWeight.value = state.weights[index];
      material.uniforms.uDraw.value = draw * 1.04;
      material.uniforms.uColor.value.copy(state.color);
      material.visible = state.weights[index] > 0.004;
    });

    const flareTarget = a.flare * (1 - blend) + b.flare * blend;
    state.flare += (flareTarget * draw - state.flare) * amount;
    if (flareMesh.current && flareMaterial.current) {
      flareMesh.current.quaternion.copy(camera.quaternion);
      flareMaterial.current.uniforms.uWeight.value = state.flare;
      flareMaterial.current.uniforms.uTime.value = state.time;
      flareMaterial.current.uniforms.uColor.value.copy(state.color);
    }
  });

  return (
    <>
      {beams.map((beam) => (
        <mesh key={beam.key} geometry={beam.geometry} frustumCulled={false}>
          <shaderMaterial
            ref={(material) => {
              materials.current[beam.key] = material;
            }}
            vertexShader={threadVertexShader}
            fragmentShader={threadFragmentShader}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
            uniforms={{
              uTime: { value: 0 },
              uWeight: { value: 0 },
              uDraw: { value: 0 },
              uBroken: { value: beam.broken ? 1 : 0 },
              uLength: { value: beam.length },
              uFlow: { value: 1 },
              uColor: { value: new Color('#D4A62A') },
            }}
          />
        </mesh>
      ))}

      <mesh ref={flareMesh} position={[0, 0, 0.7]} renderOrder={5}>
        <planeGeometry args={[22, 22]} />
        <shaderMaterial
          ref={flareMaterial}
          vertexShader={flareVertexShader}
          fragmentShader={flareFragmentShader}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={AdditiveBlending}
          toneMapped={false}
          uniforms={{
            uWeight: { value: 0 },
            uTime: { value: 0 },
            uColor: { value: new Color('#D4A62A') },
          }}
        />
      </mesh>
    </>
  );
}
