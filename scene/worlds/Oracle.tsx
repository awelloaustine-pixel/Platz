'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  type InstancedMesh,
  type MeshBasicMaterial,
  Object3D,
  type ShaderMaterial,
  TubeGeometry,
  Vector3,
} from 'three';
import type { Tier } from '@/lib/quality';
import { seededRandom } from '@/lib/random';
import { getWorld, segment } from '@/timeline/chapters';
import { master, ui } from '@/timeline/store';
import { usePresence } from './usePresence';

const ORB_RADIUS = 2.5;
const VEINS = 6;
const dummy = new Object3D();
const VEIN_OFF = new Color('#3a2a08');
const VEIN_ON = new Color(4.2, 2.4, 0.5);
const shade = new Color();

const orbVertex = /* glsl */ `
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-view.xyz);
    gl_Position = projectionMatrix * view;
  }
`;

/** Faked glass: a bright rim and a whisper of body, far cheaper than true refraction. */
const orbFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    float facing = abs(dot(normalize(vNormalView), normalize(vViewDir)));
    float rim = pow(1.0 - facing, 4.2);
    float highlight = pow(max(dot(normalize(vNormalView), normalize(vec3(-0.5, 0.6, 0.62))), 0.0), 50.0);
    vec3 color = uColor * (rim * 1.05 + 0.02) + vec3(1.0) * highlight * 0.7;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const grassVertex = /* glsl */ `
  uniform float uTime;
  varying float vHeight;
  void main() {
    vHeight = position.y;
    vec4 world = instanceMatrix * vec4(position, 1.0);
    float wave = sin(uTime * 1.2 + world.x * 0.55 + world.z * 0.4) + 0.5 * sin(uTime * 2.1 + world.x * 1.3);
    world.x += wave * position.y * position.y * 0.4;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * world;
  }
`;

const grassFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vHeight;
  void main() {
    vec3 base = vec3(0.012, 0.01, 0.03);
    vec3 color = mix(base, uColor * 0.8, pow(vHeight, 2.8));
    gl_FragColor = vec4(color, 1.0);
  }
`;

function buildVeins() {
  const random = seededRandom(53);
  return Array.from({ length: VEINS }, () => {
    const points: Vector3[] = [new Vector3(0, 0, 0)];
    const direction = new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
    for (let step = 1; step <= 5; step += 1) {
      const kink = new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.7);
      points.push(direction.clone().multiplyScalar((step / 5) * ORB_RADIUS * 0.92).add(kink.multiplyScalar(step < 5 ? 1 : 0.2)));
    }
    return new TubeGeometry(new CatmullRomCurve3(points), 48, 0.022, 6);
  });
}

/** A glass orb with gold veins over a field of glowing grass, answering with the thread. */
export function Oracle({ pathname, active, tier }: { pathname: string; active: boolean; tier: Tier }) {
  const { group } = usePresence(active);
  const veins = useMemo(() => buildVeins(), []);
  const bladeCount = tier === 'high' ? 5200 : 1700;
  const blade = useMemo(() => {
    const shape = new BufferGeometry();
    shape.setAttribute('position', new Float32BufferAttribute([-0.05, 0, 0, 0.05, 0, 0, 0, 1, 0], 3));
    return shape;
  }, []);
  const orbUniforms = useMemo(() => ({ uColor: { value: new Color('#FFD27A') } }), []);
  const grassUniforms = useMemo(() => ({ uColor: { value: new Color('#9B5CFF') }, uTime: { value: 0 } }), []);
  const grass = useRef<InstancedMesh>(null);
  const grassMaterial = useRef<ShaderMaterial>(null);
  const veinMaterials = useRef<(MeshBasicMaterial | null)[]>([]);
  const state = useRef({ glow: new Array<number>(VEINS).fill(0), time: 0 });

  useLayoutEffect(() => {
    const mesh = grass.current;
    if (!mesh) return;
    const random = seededRandom(71);
    for (let index = 0; index < bladeCount; index += 1) {
      dummy.position.set((random() - 0.5) * 44, -3.6, 5 - random() * 26);
      dummy.rotation.set(0, random() * Math.PI, 0);
      dummy.scale.set(1 + random(), 0.7 + random() * 1.1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [bladeCount]);

  useFrame((_, delta) => {
    if (!active) return;
    const data = state.current;
    data.time += delta;
    if (grassMaterial.current) grassMaterial.current.uniforms.uTime.value = data.time;

    const chapters = getWorld(pathname).chapters;
    const stepsIndex = chapters.findIndex((chapter) => chapter.id === 'steps');
    const { worldFocus, tierLevel } = ui.get();
    const { from } = segment(master.chapter, chapters.length);
    const litCount =
      tierLevel >= 0 ? (tierLevel + 1) * 2 : master.chapter < stepsIndex - 0.2 ? 1 : from === stepsIndex ? worldFocus + 1 : VEINS;

    veinMaterials.current.forEach((material, index) => {
      if (!material) return;
      data.glow[index] += ((index < litCount ? 1 : 0) - data.glow[index]) * (1 - Math.exp(-4 * delta));
      material.color.copy(shade.copy(VEIN_OFF).lerp(VEIN_ON, data.glow[index]));
    });
  });

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, 0.2, 0]}>
        <icosahedronGeometry args={[ORB_RADIUS, 12]} />
        <shaderMaterial
          vertexShader={orbVertex}
          fragmentShader={orbFragment}
          uniforms={orbUniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <group position={[0, 0.2, 0]}>
        {veins.map((geometry, index) => (
          <mesh key={index} geometry={geometry}>
            <meshBasicMaterial
              ref={(material) => {
                veinMaterials.current[index] = material;
              }}
              toneMapped={false}
              fog={false}
            />
          </mesh>
        ))}
      </group>
      <instancedMesh ref={grass} args={[blade, undefined, bladeCount]} frustumCulled={false}>
        <shaderMaterial
          ref={grassMaterial}
          vertexShader={grassVertex}
          fragmentShader={grassFragment}
          uniforms={grassUniforms}
          side={2}
          toneMapped={false}
        />
      </instancedMesh>
      <mesh position={[2.8, -2.45, 1.5]}>
        <coneGeometry args={[0.16, 0.5, 16]} />
        <meshBasicMaterial color={[4, 2.6, 0.6]} toneMapped={false} />
      </mesh>
    </group>
  );
}
