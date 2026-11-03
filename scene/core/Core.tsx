'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { type Group, type InstancedMesh, MathUtils, Matrix4, type PointLight, Vector2 } from 'three';
import type { Tier } from '@/lib/quality';
import { seededRandom } from '@/lib/random';
import { getWorld, sampleChapter } from '@/timeline/chapters';
import { master } from '@/timeline/store';
import { createPanelMaterial } from './petalMaterial';

const TOTAL_PETALS = 12;
const HINGE_RADIUS = 0.95;
const PETAL_LENGTH = 3.45;
const CLOSED_FOLD = 1.28;
const SPRING = 34;
const DAMPING = 8.5;

interface Panel {
  petal: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** 0 at the hub, 1 at the tip. Ignition travels along this. */
  along: number;
  seed: number;
}

function buildPanels(petals: number, rows: number): Panel[] {
  const random = seededRandom(7);
  const panels: Panel[] = [];
  const height = PETAL_LENGTH / rows;

  for (let petal = 0; petal < petals; petal += 1) {
    for (let row = 0; row < rows; row += 1) {
      const along = rows > 1 ? row / (rows - 1) : 0;
      // A leaf outline: narrow at the hinge, widest past the middle, tapering to the tip.
      const span = 0.48 + 1.12 * Math.sin(Math.PI * (0.1 + 0.8 * Math.pow(along, 0.85)));
      const columns = Math.max(1, Math.round(span / 0.4));
      const width = span / columns;
      for (let column = 0; column < columns; column += 1) {
        panels.push({
          petal,
          x: (column - (columns - 1) / 2) * width,
          y: (row + 0.5) * height,
          width: width * 0.9,
          height: height * 0.88,
          along,
          seed: random(),
        });
      }
    }
  }
  return panels;
}

const petalMatrix = new Matrix4();
const panelMatrix = new Matrix4();
const rotation = new Matrix4();
const translation = new Matrix4();
const scale = new Matrix4();

function smoothstep(from: number, to: number, value: number): number {
  const t = MathUtils.clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Writes the hinge transform of one petal. Everything on the petal is built from this. */
function composePetal(out: Matrix4, angle: number, fold: number, lift: number, spin: number): void {
  out.makeRotationZ(angle);
  out.multiply(translation.makeTranslation(0, HINGE_RADIUS, lift));
  out.multiply(rotation.makeRotationX(fold));
  out.multiply(rotation.makeRotationY(spin));
}

export function Core({ pathname, tier }: { pathname: string; tier: Tier }) {
  const petals = tier === 'high' ? TOTAL_PETALS : 8;
  const rows = tier === 'high' ? 8 : 6;
  const panelData = useMemo(() => buildPanels(petals, rows), [petals, rows]);
  const emissive = useMemo(() => new Float32Array(panelData.length * 3), [panelData]);
  const material = useMemo(() => createPanelMaterial(), []);
  const hubProfile = useMemo(
    () =>
      [
        [0.01, -0.34],
        [0.5, -0.34],
        [0.72, -0.24],
        [0.84, -0.05],
        [0.84, 0.08],
        [0.72, 0.16],
        [0.66, 0.16],
        [0.62, 0.24],
        [0.42, 0.28],
        [0.38, 0.2],
        [0.3, 0.2],
      ].map(([x, y]) => new Vector2(x, y)),
    [],
  );

  const root = useRef<Group>(null);
  const hub = useRef<Group>(null);
  const panels = useRef<InstancedMesh>(null);
  const spines = useRef<InstancedMesh>(null);
  const light = useRef<PointLight>(null);
  const eye = useRef<InstancedMesh>(null);

  const sim = useRef({
    fold: new Float32Array(petals).fill(CLOSED_FOLD),
    velocity: new Float32Array(petals),
    ignition: new Float32Array(petals),
    damage: 0,
    time: 0,
  });

  useLayoutEffect(() => {
    const mesh = eye.current;
    if (!mesh) return;
    const bolts = mesh.count;
    for (let i = 0; i < bolts; i += 1) {
      const angle = (i / bolts) * Math.PI * 2;
      panelMatrix.makeTranslation(Math.cos(angle) * 0.56, Math.sin(angle) * 0.56, 0.27);
      mesh.setMatrixAt(i, panelMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_, rawDelta) => {
    const panelMesh = panels.current;
    const spineMesh = spines.current;
    if (!panelMesh || !spineMesh) return;

    const delta = Math.min(rawDelta, 1 / 30);
    const state = sim.current;
    state.time += delta;
    const { time } = state;

    const chapters = getWorld(pathname).chapters;
    const unfold = sampleChapter(chapters, master.chapter, (chapter) => chapter.unfold);
    const lit = sampleChapter(chapters, master.chapter, (chapter) => chapter.petalsLit);
    const damageTarget = sampleChapter(chapters, master.chapter, (chapter) => chapter.damage);
    state.damage = MathUtils.damp(state.damage, damageTarget, 4, delta);
    const { damage } = state;

    const litPetals = (lit / TOTAL_PETALS) * petals;
    for (let petal = 0; petal < petals; petal += 1) {
      const order = petal / petals;
      // Petals open in a wave around the hub rather than all at once.
      const opening = MathUtils.clamp(unfold * 1.35 - order * 0.35, 0, 1);
      const breathe = Math.sin(time * 0.6 + petal * 0.9) * 0.012;
      const target = (1 - opening) * CLOSED_FOLD + 0.07 + breathe;
      state.velocity[petal] += (target - state.fold[petal]) * SPRING * delta - state.velocity[petal] * DAMPING * delta;
      state.fold[petal] += state.velocity[petal] * delta;

      const ignitionTarget = MathUtils.clamp(litPetals - petal, 0, 1);
      state.ignition[petal] = MathUtils.damp(state.ignition[petal], ignitionTarget, 2.2, delta);
    }

    const glowAttribute = panelMesh.geometry.getAttribute('aEmissive');
    const glowValues = glowAttribute.array as Float32Array;
    const count = panelData.length;
    let currentPetal = -1;
    let ignition = 0;
    for (let i = 0; i < count; i += 1) {
      const panel = panelData[i];
      if (panel.petal !== currentPetal) {
        currentPetal = panel.petal;
        ignition = state.ignition[currentPetal];
        const angle = (currentPetal / petals) * Math.PI * 2;
        const shatter = damage * (Math.sin(currentPetal * 12.9) * 0.5 + 0.5);
        composePetal(
          petalMatrix,
          angle,
          state.fold[currentPetal] + shatter * 0.34 * (currentPetal % 2 === 0 ? 1 : -1),
          shatter * (currentPetal % 2 === 0 ? 0.5 : -0.5),
          0.16 + shatter * 0.4,
        );
        spineMesh.setMatrixAt(
          currentPetal,
          panelMatrix
            .copy(petalMatrix)
            .multiply(translation.makeTranslation(0, PETAL_LENGTH / 2, -0.05))
            .multiply(scale.makeScale(0.05, PETAL_LENGTH * 1.01, 0.05)),
        );
      }

      const crack = damage * panel.seed * 0.5;
      panelMatrix
        .copy(petalMatrix)
        .multiply(
          translation.makeTranslation(
            panel.x * (1 + crack * 0.5),
            panel.y + crack * 0.2,
            Math.sin(panel.along * Math.PI) * 0.05 + crack * (panel.seed - 0.5),
          ),
        )
        .multiply(scale.makeScale(panel.width, panel.height, 1));
      panelMesh.setMatrixAt(i, panelMatrix);

      // Gold ignition front: starts at the hub and runs out along the petal.
      const front = ignition * 1.3;
      // The gate keeps hub-end panels dark until their petal has actually started igniting.
      const glow = smoothstep(panel.along - 0.25, panel.along, front) * Math.min(ignition * 10, 1);
      const shimmer = 0.75 + 0.25 * Math.sin(time * 1.7 + panel.seed * 40);
      // Kept just past the bloom threshold: any hotter and gold burns out to white.
      const gold = glow * (0.9 + panel.seed * 0.9) * shimmer;
      const flicker = Math.sin(time * (7 + panel.seed * 23) + panel.seed * 60) > 0.72 ? 1 : 0;
      const failing = damage * flicker * panel.seed * 1.5;

      const offset = i * 3;
      glowValues[offset] = gold * 1.5 + failing + 0.006;
      glowValues[offset + 1] = gold * 0.6 + failing * 0.05 + 0.004;
      glowValues[offset + 2] = gold * 0.035 + failing * 0.03 + 0.002;
    }

    panelMesh.instanceMatrix.needsUpdate = true;
    spineMesh.instanceMatrix.needsUpdate = true;
    glowAttribute.needsUpdate = true;

    const litAmount = lit / TOTAL_PETALS;
    if (root.current) root.current.rotation.z = master.progress * Math.PI * 1.2 + time * 0.02;
    if (hub.current) hub.current.rotation.z = -time * 0.25 - master.progress * Math.PI * 3;
    if (light.current) light.current.intensity = 1 + litAmount * 7;
  });

  return (
    <group ref={root}>
      <pointLight ref={light} position={[0, 0, 2.4]} color="#ffb84d" distance={16} decay={1.6} />

      <instancedMesh ref={panels} args={[undefined, material, panelData.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 0.05]}>
          <instancedBufferAttribute attach="attributes-aEmissive" args={[emissive, 3]} />
        </boxGeometry>
      </instancedMesh>

      <instancedMesh ref={spines} args={[undefined, undefined, petals]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#c9ccd1" metalness={1} roughness={0.28} />
      </instancedMesh>

      <group ref={hub} rotation-x={0}>
        <mesh rotation-x={Math.PI / 2} scale={1.12}>
          <latheGeometry args={[hubProfile, tier === 'high' ? 96 : 48]} />
          <meshStandardMaterial color="#c9ccd1" metalness={1} roughness={0.24} side={2} />
        </mesh>
        <mesh position-z={0.12}>
          <torusGeometry args={[0.98, 0.035, 12, tier === 'high' ? 128 : 64]} />
          <meshStandardMaterial color="#d4a62a" metalness={1} roughness={0.22} />
        </mesh>
        <instancedMesh ref={eye} args={[undefined, undefined, 24]} frustumCulled={false}>
          <cylinderGeometry args={[0.026, 0.026, 0.05, 8]} />
          <meshStandardMaterial color="#3a3f4a" metalness={1} roughness={0.3} />
        </instancedMesh>
      </group>
    </group>
  );
}
