'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { BackSide, Color, type Mesh, type ShaderMaterial } from 'three';
import { getWorld, segment } from '@/timeline/chapters';
import { master } from '@/timeline/store';

const vertexShader = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vDirection = world.xyz - cameraPosition;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/** The volume of coloured light around the Core that gives each world its mood. */
const fragmentShader = /* glsl */ `
  uniform vec3 uBackground;
  uniform vec3 uAccent;
  uniform vec3 uTarget;
  uniform float uStrength;
  uniform float uTime;
  varying vec3 vDirection;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vec3 direction = normalize(vDirection);
    float toward = max(dot(direction, normalize(uTarget - cameraPosition)), 0.0);
    float cloud = noise(direction * 3.2 + uTime * 0.02) * 0.6 + noise(direction * 7.0 - uTime * 0.03) * 0.4;
    float halo = pow(toward, 40.0) * 0.3 + pow(toward, 8.0) * 0.07;
    vec3 color = uBackground + uAccent * halo * uStrength * (0.55 + 0.9 * cloud);
    color += uAccent * pow(cloud, 3.0) * 0.018 * uStrength;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const colorA = new Color();
const colorB = new Color();

export function Atmosphere({ pathname }: { pathname: string }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const clock = useRef(0);

  useFrame(({ camera }, delta) => {
    if (!mesh.current || !material.current) return;
    clock.current += delta;
    const chapters = getWorld(pathname).chapters;
    const { from, to, blend } = segment(master.chapter, chapters.length);
    const a = chapters[from].grade;
    const b = chapters[to].grade;
    const amount = 1 - Math.exp(-3 * delta);
    const { uniforms } = material.current;

    mesh.current.position.copy(camera.position);
    uniforms.uBackground.value.lerp(colorA.set(a.background).lerp(colorB.set(b.background), blend), amount);
    uniforms.uAccent.value.lerp(colorA.set(a.accent).lerp(colorB.set(b.accent), blend), amount);
    uniforms.uStrength.value += (a.glow + (b.glow - a.glow) * blend - uniforms.uStrength.value) * amount;
    uniforms.uTime.value = clock.current;
  });

  return (
    <mesh ref={mesh} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[70, 32, 24]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={BackSide}
        depthWrite={false}
        toneMapped={false}
        fog={false}
        uniforms={{
          uBackground: { value: new Color('#020617') },
          uAccent: { value: new Color('#D4A62A') },
          uTarget: { value: [0, 0, 0] },
          uStrength: { value: 0.3 },
          uTime: { value: 0 },
        }}
      />
    </mesh>
  );
}
