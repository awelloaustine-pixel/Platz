'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  type InstancedMesh,
  type LineSegments,
  type Mesh,
  Object3D,
} from 'three';
import { getWorld, segment } from '@/timeline/chapters';
import { master, ui } from '@/timeline/store';
import { usePresence } from './usePresence';

type Rect = readonly [x: number, y: number, width: number, height: number];

/** The wireframe's outlines. Only drawn, never filled. */
const FRAMES: readonly Rect[] = [
  [0, 0, 8.4, 5.4], // browser
  [0, 2.35, 8.4, 0.7], // browser bar
  [5.6, -0.7, 1.9, 3.8], // phone
  [5.6, -2.3, 0.7, 0.14], // phone home bar
];

/** One lit block per item on the What You Get list, in the same order. */
const BLOCKS: readonly Rect[] = [
  [5.6, -0.4, 1.5, 2.7], // mobile-friendly design
  [2.9, 2.35, 2, 0.26], // fast loading: the speed bar
  [-1.4, 2.35, 4.2, 0.36], // Google-optimised: the search bar
  [-2.4, 0.95, 3, 1.4], // AI-optimised: the headline block
  [1.2, 0.5, 1.5, 0.48], // contact form and WhatsApp: the button
  [2.5, -1.3, 2.6, 1.7], // Google Maps
  [-1.7, -1.3, 4.3, 1.7], // photos and content
];
const BUTTON_BLOCK = BLOCKS[4];

const OFF = new Color('#2b230d');
const ON = new Color(1.5, 0.78, 0.06);
const dummy = new Object3D();
const shade = new Color();

function outline([x, y, width, height]: Rect): number[] {
  const l = x - width / 2;
  const r = x + width / 2;
  const b = y - height / 2;
  const t = y + height / 2;
  return [l, b, 0, r, b, 0, r, b, 0, r, t, 0, r, t, 0, l, t, 0, l, t, 0, l, b, 0];
}

const ASSEMBLE_SECONDS = 2.4;

/** A browser and phone that draw themselves in gold, then fill in as you scroll the list. */
export function Blueprint({ pathname, active }: { pathname: string; active: boolean }) {
  const { group } = usePresence(active);
  const lines = useRef<LineSegments>(null);
  const blocks = useRef<InstancedMesh>(null);
  const cursor = useRef<Mesh>(null);
  const state = useRef({ age: 0, glow: BLOCKS.map(() => 0) });

  const geometry = useMemo(() => {
    const positions = [...FRAMES, ...BLOCKS].flatMap(outline);
    const shape = new BufferGeometry();
    shape.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return shape;
  }, []);

  useLayoutEffect(() => {
    const mesh = blocks.current;
    if (!mesh) return;
    BLOCKS.forEach(([x, y, width, height], index) => {
      dummy.position.set(x, y, -0.02);
      dummy.scale.set(width, height, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, OFF);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_, delta) => {
    const data = state.current;
    if (!active || !blocks.current || !lines.current) return;
    data.age += delta;

    const total = lines.current.geometry.getAttribute('position').count;
    lines.current.geometry.setDrawRange(0, Math.floor(total * Math.min(data.age / ASSEMBLE_SECONDS, 1)));

    const chapters = getWorld(pathname).chapters;
    const featuresIndex = chapters.findIndex((chapter) => chapter.id === 'features');
    const { worldFocus } = ui.get();
    // Blocks light in list order, then stay lit for the rest of the page.
    const litThrough = master.chapter < featuresIndex - 0.2 ? -1 : master.chapter >= featuresIndex + 1 ? BLOCKS.length : worldFocus;

    BLOCKS.forEach((_block, index) => {
      data.glow[index] += ((index <= litThrough ? 1 : 0) - data.glow[index]) * (1 - Math.exp(-5 * delta));
      blocks.current?.setColorAt(index, shade.copy(OFF).lerp(ON, data.glow[index]));
    });
    if (blocks.current.instanceColor) blocks.current.instanceColor.needsUpdate = true;

    // On the last section the thread becomes a cursor, clicking the contact button.
    if (cursor.current) {
      const { from } = segment(master.chapter, chapters.length);
      const show = from >= chapters.length - 2;
      cursor.current.visible = show;
      cursor.current.scale.setScalar(0.9 + ((data.age * 1.1) % 1) * 1.3);
    }
  });

  return (
    <group ref={group} visible={false} position={[1.6, 0.1, 0]} rotation={[0.06, -0.24, 0]}>
      <lineSegments ref={lines} geometry={geometry}>
        <lineBasicMaterial color={[2.4, 1.5, 0.35]} toneMapped={false} fog={false} />
      </lineSegments>
      <instancedMesh ref={blocks} args={[undefined, undefined, BLOCKS.length]} frustumCulled={false}>
        <planeGeometry />
        <meshBasicMaterial transparent opacity={0.3} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
      <mesh ref={cursor} position={[BUTTON_BLOCK[0], BUTTON_BLOCK[1], 0.05]} visible={false}>
        <ringGeometry args={[0.3, 0.33, 48]} />
        <meshBasicMaterial color={[3, 1.9, 0.5]} toneMapped={false} transparent />
      </mesh>
    </group>
  );
}
