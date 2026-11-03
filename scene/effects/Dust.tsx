'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Color, type ShaderMaterial } from 'three';
import type { Tier } from '@/lib/quality';
import { seededRandom } from '@/lib/random';
import { getWorld, segment } from '@/timeline/chapters';
import { master } from '@/timeline/store';

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uFocus;
  uniform float uDrift;
  varying float vBlur;
  varying float vPhase;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.09 + aPhase * 6.28) * uDrift;
    p.y += cos(uTime * 0.07 + aPhase * 9.1) * uDrift;
    p.z += sin(uTime * 0.05 + aPhase * 3.7) * uDrift;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    float depth = -view.z;
    // Cheap depth of field: points away from the focal plane become large soft discs.
    vBlur = clamp(abs(depth - uFocus) / (uFocus * 0.85), 0.0, 1.0);
    vPhase = aPhase;
    gl_PointSize = aSize * uPixelRatio * (1.0 + vBlur * vBlur * 16.0) * (70.0 / max(depth, 0.5));
    gl_Position = projectionMatrix * view;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uWeight;
  uniform float uTime;
  varying float vBlur;
  varying float vPhase;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float spark = pow(1.0 - d, 2.4);
    float disc = smoothstep(1.0, 0.82, d) * (0.38 + 0.62 * smoothstep(0.35, 1.0, d));
    float shape = mix(spark * 3.0, disc * 0.2, smoothstep(0.08, 0.5, vBlur));
    float twinkle = 0.65 + 0.35 * sin(uTime * (0.6 + vPhase * 1.6) + vPhase * 40.0);
    vec3 tint = mix(uColor, vec3(1.0, 0.92, 0.78), step(0.86, vPhase));
    float alpha = shape * twinkle * uWeight;
    gl_FragColor = vec4(tint * alpha, alpha);
  }
`;

const tintA = new Color();
const tintB = new Color();

function useDustGeometry(count: number, seed: number, place: (random: () => number) => [number, number, number]) {
  return useMemo(() => {
    const random = seededRandom(seed);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const [x, y, z] = place(random);
      positions.set([x, y, z], i * 3);
      sizes[i] = 0.5 + Math.pow(random(), 3) * 2.6;
      phases[i] = random();
    }
    return { positions, sizes, phases };
  }, [count, seed, place]);
}

function placeInVolume(random: () => number): [number, number, number] {
  const angle = random() * Math.PI * 2;
  const radius = 2.4 + Math.pow(random(), 0.7) * 24;
  return [Math.cos(angle) * radius, (random() - 0.5) * 26, Math.sin(angle) * radius];
}

/** A low band of warm lights far behind the Core, hinting at Nairobi at night. */
function placeInSkyline(random: () => number): [number, number, number] {
  const x = (random() - 0.5) * 92;
  const blocks = Math.abs(Math.sin(Math.floor(x / 3.2) * 12.9)) * 7;
  return [x, -12 + random() * (2 + blocks), -34 - random() * 6];
}

export function Dust({ pathname, tier }: { pathname: string; tier: Tier }) {
  const count = tier === 'high' ? 2400 : 800;
  const volume = useDustGeometry(count, 11, placeInVolume);
  const city = useDustGeometry(tier === 'high' ? 340 : 140, 23, placeInSkyline);
  const dust = useRef<ShaderMaterial>(null);
  const skyline = useRef<ShaderMaterial>(null);
  const time = useRef(0);
  const cityWeight = useRef(0);

  useFrame(({ camera, gl }, delta) => {
    if (!dust.current || !skyline.current) return;
    time.current += delta;
    const chapters = getWorld(pathname).chapters;
    const { from, to, blend } = segment(master.chapter, chapters.length);
    const amount = 1 - Math.exp(-3 * delta);
    const a = chapters[from];
    const b = chapters[to];
    const focus = camera.position.length();
    const pixelRatio = gl.getPixelRatio();

    const { uniforms } = dust.current;
    uniforms.uTime.value = time.current;
    uniforms.uFocus.value = focus;
    uniforms.uPixelRatio.value = pixelRatio;
    uniforms.uColor.value.lerp(tintA.set(a.grade.accent).lerp(tintB.set(b.grade.accent), blend), amount);

    const cityTarget = a.city * (1 - blend) + b.city * blend;
    cityWeight.current += (cityTarget - cityWeight.current) * amount;
    const sky = skyline.current.uniforms;
    sky.uTime.value = time.current;
    sky.uFocus.value = focus;
    sky.uPixelRatio.value = pixelRatio;
    sky.uWeight.value = cityWeight.current;
  });

  return (
    <>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[volume.positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[volume.sizes, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[volume.phases, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={dust}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
          uniforms={{
            uTime: { value: 0 },
            uPixelRatio: { value: 1 },
            uFocus: { value: 12 },
            uDrift: { value: 0.9 },
            uWeight: { value: 0.85 },
            uColor: { value: new Color('#D4A62A') },
          }}
        />
      </points>

      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[city.positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[city.sizes, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[city.phases, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={skyline}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
          uniforms={{
            uTime: { value: 0 },
            uPixelRatio: { value: 1 },
            uFocus: { value: 12 },
            uDrift: { value: 0.05 },
            uWeight: { value: 0 },
            uColor: { value: new Color('#FFB35C') },
          }}
        />
      </points>
    </>
  );
}
