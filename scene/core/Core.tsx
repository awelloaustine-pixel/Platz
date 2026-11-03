'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  Color,
  type Group,
  InstancedBufferAttribute,
  type InstancedMesh,
  MathUtils,
  Object3D,
  type PointLight,
  Vector3,
} from 'three';
import type { Tier } from '@/lib/quality';
import { seededRandom } from '@/lib/random';
import { getWorld, sampleChapter, segment } from '@/timeline/chapters';
import { master } from '@/timeline/store';
import { createRockGeometry } from './rockGeometry';
import { createRockMaterial } from './rockMaterial';

const TOTAL_STONES = 12;
const VARIANTS = 4;
const RING_RADIUS = 5.2;
const SPRING = 26;
const DAMPING = 7.5;
const dummy = new Object3D();
const accentA = new Color();
const accentB = new Color();

interface Stone {
  variant: number;
  slot: number;
  closed: Vector3;
  angle: number;
  depth: number;
  scale: number;
  axis: Vector3;
  phase: number;
  spin: number;
  away: Vector3;
}

function buildStones(count: number): Stone[] {
  const random = seededRandom(19);
  const slots = new Array<number>(VARIANTS).fill(0);
  return Array.from({ length: count }, (_, index) => {
    const variant = index % VARIANTS;
    // Evenly spread over a small sphere: the tight boulder the ring pulls in to.
    const y = 1 - ((index + 0.5) / count) * 2;
    const around = index * Math.PI * (3 - Math.sqrt(5));
    const shell = Math.sqrt(1 - y * y);
    const stone: Stone = {
      variant,
      slot: slots[variant],
      closed: new Vector3(Math.cos(around) * shell, y, Math.sin(around) * shell).multiplyScalar(1.7),
      angle: (index / count) * Math.PI * 2 + Math.PI / 2,
      depth: Math.sin(index * 2.4) * 0.9,
      scale: (count === TOTAL_STONES ? 1.02 : 1.35) * (0.82 + random() * 0.42),
      axis: new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
      phase: random() * Math.PI * 2,
      spin: 0.05 + random() * 0.1,
      away: new Vector3(random() - 0.5, random() - 0.5, (random() - 0.5) * 1.6).normalize(),
    };
    slots[variant] += 1;
    return stone;
  });
}

export function Core({ pathname, tier }: { pathname: string; tier: Tier }) {
  const stoneCount = tier === 'high' ? TOTAL_STONES : 8;
  const stones = useMemo(() => buildStones(stoneCount), [stoneCount]);

  const variants = useMemo(() => {
    const detail = tier === 'high' ? 36 : 18;
    return Array.from({ length: VARIANTS }, (_, variant) => {
      const count = stones.filter((stone) => stone.variant === variant).length;
      const geometry = createRockGeometry(101 + variant * 37, detail);
      geometry.setAttribute('aEmissive', new InstancedBufferAttribute(new Float32Array(count * 3), 3));
      geometry.setAttribute('aFront', new InstancedBufferAttribute(new Float32Array(count), 1));
      return { geometry, count };
    });
  }, [stones, tier]);
  const material = useMemo(() => createRockMaterial(tier === 'high' ? 3 : 2), [tier]);

  const meshes = useRef<(InstancedMesh | null)[]>([]);
  const root = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const sim = useRef({
    spread: new Float32Array(stoneCount),
    velocity: new Float32Array(stoneCount),
    ignition: new Float32Array(stoneCount),
    damage: 0,
    time: 0,
    color: new Color('#FFB52E'),
  });

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    const state = sim.current;
    state.time += delta;
    const { time } = state;

    const chapters = getWorld(pathname).chapters;
    const spread = sampleChapter(chapters, master.chapter, (chapter) => chapter.spread);
    const lit = sampleChapter(chapters, master.chapter, (chapter) => chapter.lit);
    const damageTarget = sampleChapter(chapters, master.chapter, (chapter) => chapter.damage);
    state.damage = MathUtils.damp(state.damage, damageTarget, 3, delta);
    const { damage } = state;

    const { from, to, blend } = segment(master.chapter, chapters.length);
    accentA.set(chapters[from].grade.accent).lerp(accentB.set(chapters[to].grade.accent), blend);
    state.color.lerp(accentA, 1 - Math.exp(-3 * delta));

    const litStones = (lit / TOTAL_STONES) * stoneCount;

    stones.forEach((stone, index) => {
      const order = index / stoneCount;
      // Stones move in a wave around the ring rather than all at once.
      const target = MathUtils.clamp(spread * 1.25 - order * 0.25, 0, 1);
      state.velocity[index] +=
        (target - state.spread[index]) * SPRING * delta - state.velocity[index] * DAMPING * delta;
      state.spread[index] += state.velocity[index] * delta;
      state.ignition[index] = MathUtils.damp(state.ignition[index], MathUtils.clamp(litStones - index, 0, 1), 1.8, delta);

      const open = state.spread[index];
      const ringX = Math.cos(stone.angle) * RING_RADIUS;
      const ringY = Math.sin(stone.angle) * RING_RADIUS;
      const scatter = damage * (1.4 + (Math.sin(stone.phase * 3) * 0.5 + 0.5) * 2.6);
      dummy.position.set(
        MathUtils.lerp(stone.closed.x, ringX, open) + stone.away.x * scatter,
        MathUtils.lerp(stone.closed.y, ringY, open) + stone.away.y * scatter + Math.sin(time * 0.5 + stone.phase) * 0.14,
        MathUtils.lerp(stone.closed.z, stone.depth, open) + stone.away.z * scatter,
      );
      dummy.quaternion.setFromAxisAngle(stone.axis, stone.phase + time * (stone.spin + damage * 0.35));
      dummy.scale.setScalar(stone.scale);
      dummy.updateMatrix();

      const mesh = meshes.current[stone.variant];
      if (!mesh) return;
      mesh.setMatrixAt(stone.slot, dummy.matrix);

      const ignition = state.ignition[index];
      const flicker = Math.sin(time * (6 + stone.phase * 4) + stone.phase * 9) > 0.35 ? 1 : 0.1;
      const failing = damage * flicker * 1.15;
      const shimmer = 0.82 + 0.18 * Math.sin(time * 1.6 + stone.phase);
      const gold = Math.min(ignition * 8, 1) * shimmer;

      const glow = mesh.geometry.getAttribute('aEmissive') as InstancedBufferAttribute;
      const front = mesh.geometry.getAttribute('aFront') as InstancedBufferAttribute;
      glow.setXYZ(stone.slot, gold * 2.5 + failing * 2.4, gold * 1 + failing * 0.1, gold * 0.06 + failing * 0.05);
      const reach = dummy.position.length();
      front.setX(stone.slot, damage > 0.05 ? 99 : reach - stone.scale - 0.5 + ignition * (stone.scale * 2 + 1));
    });

    meshes.current.forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.geometry.getAttribute('aEmissive').needsUpdate = true;
      mesh.geometry.getAttribute('aFront').needsUpdate = true;
    });

    if (root.current) root.current.rotation.z = master.progress * Math.PI * 0.9 + time * 0.015;
    if (light.current) {
      // The light at the crossing is what carves the rocks out of the dark.
      light.current.color.copy(state.color);
      light.current.intensity = 70 + (lit / TOTAL_STONES) * 90;
    }
  });

  return (
    <group ref={root}>
      <pointLight ref={light} position={[0, 0, 0.8]} distance={32} decay={1.7} />
      {variants.map((variant, index) => (
        <instancedMesh
          key={index}
          ref={(mesh) => {
            meshes.current[index] = mesh;
          }}
          args={[variant.geometry, material, variant.count]}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}
