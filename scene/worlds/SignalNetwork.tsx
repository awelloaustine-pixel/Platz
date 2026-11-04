'use client';

import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { CanvasTexture, Color, type InstancedMesh, MathUtils, type MeshBasicMaterial, Object3D, SRGBColorSpace } from 'three';
import { stations, stationsPerTier, type ChatLine } from '@/content/services';
import { getWorld, segment } from '@/timeline/chapters';
import { master, ui } from '@/timeline/store';
import { usePresence } from './usePresence';

const RING_RADIUS = 5.9;
const FLOW_COUNT = 26;
const SCREEN = { width: 512, height: 1024 };
const OFF = new Color('#0d3a22');
const ON = new Color(0.5, 3.2, 1.3);
const dummy = new Object3D();
const shade = new Color();

function stationAngle(index: number): number {
  return (index / stations.length) * Math.PI * 2 + Math.PI / 2;
}

/** Wraps text to the bubble width and returns the lines. */
function wrap(context: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Paints a WhatsApp-style conversation for the phone's screen. Decorative: the DOM has the real copy. */
function paintChat(context: CanvasRenderingContext2D, chat: readonly ChatLine[], title: string): void {
  const { width, height } = SCREEN;
  context.fillStyle = '#0b141a';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#1f2c34';
  context.fillRect(0, 0, width, 130);
  context.fillStyle = '#25D366';
  context.beginPath();
  context.arc(62, 78, 30, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#ffffff';
  context.font = '500 30px system-ui, sans-serif';
  context.fillText('Your Business', 110, 72);
  context.font = '22px system-ui, sans-serif';
  context.fillStyle = '#8696a0';
  context.fillText('online', 110, 104);

  context.font = '33px system-ui, sans-serif';
  let y = 180;
  chat.forEach(({ from, text }) => {
    const lines = wrap(context, text, 360);
    const bubbleWidth = Math.max(...lines.map((line) => context.measureText(line).width)) + 44;
    const bubbleHeight = lines.length * 44 + 30;
    const x = from === 'business' ? width - bubbleWidth - 26 : 26;
    context.fillStyle = from === 'business' ? '#005c4b' : '#202c33';
    context.beginPath();
    context.roundRect(x, y, bubbleWidth, bubbleHeight, 18);
    context.fill();
    context.fillStyle = '#e9edef';
    lines.forEach((line, index) => context.fillText(line, x + 22, y + 46 + index * 44));
    y += bubbleHeight + 22;
  });

  context.fillStyle = '#25D366';
  context.font = '500 22px ui-monospace, monospace';
  context.fillText(title.replace(/\.$/, '').toUpperCase().slice(0, 30), 28, height - 60);
}

/** A phone at the centre, with one station per automation on a ring of glowing messages. */
export function SignalNetwork({ pathname, active }: { pathname: string; active: boolean }) {
  const { group } = usePresence(active);
  const screenTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SCREEN.width;
    canvas.height = SCREEN.height;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);
  const screen = useRef<MeshBasicMaterial>(null);
  const stops = useRef<InstancedMesh>(null);
  const flow = useRef<InstancedMesh>(null);
  const state = useRef({ painted: -1, angle: stationAngle(0), time: 0, glow: stations.map(() => 0) });

  useLayoutEffect(() => {
    const mesh = stops.current;
    if (!mesh) return;
    stations.forEach((_, index) => {
      const angle = stationAngle(index);
      dummy.position.set(Math.cos(angle) * RING_RADIUS, Math.sin(angle) * RING_RADIUS, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, OFF);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_, delta) => {
    if (!active || !stops.current || !flow.current || !screen.current?.map) return;
    const data = state.current;
    data.time += delta;

    const chapters = getWorld(pathname).chapters;
    const networkIndex = chapters.findIndex((chapter) => chapter.id === 'network');
    const { worldFocus, tierLevel } = ui.get();
    const { from } = segment(master.chapter, chapters.length);
    const onNetwork = from === networkIndex;
    const current = onNetwork ? Math.min(worldFocus, stations.length - 1) : 0;

    if (current !== data.painted) {
      data.painted = current;
      const texture = screen.current.map as CanvasTexture;
      const context = (texture.image as HTMLCanvasElement).getContext('2d');
      if (context) paintChat(context, stations[current].chat, stations[current].title);
      texture.needsUpdate = true;
    }

    // Hovering a pricing tier lights what that tier includes; otherwise the list drives it.
    const litCount =
      tierLevel >= 0 ? stationsPerTier[tierLevel] : master.chapter < networkIndex ? 0 : onNetwork ? current + 1 : stations.length;
    stations.forEach((_, index) => {
      data.glow[index] += ((index < litCount ? 1 : 0) - data.glow[index]) * (1 - Math.exp(-6 * delta));
      stops.current?.setColorAt(index, shade.copy(OFF).lerp(ON, data.glow[index]));
    });
    if (stops.current.instanceColor) stops.current.instanceColor.needsUpdate = true;

    // Bubbles stream round the ring, slowing and gathering at the current station.
    data.angle = MathUtils.damp(data.angle, stationAngle(current), 3, delta);
    for (let index = 0; index < FLOW_COUNT; index += 1) {
      const lag = index / FLOW_COUNT;
      const angle = data.angle - lag * lag * 3.4;
      const wobble = Math.sin(data.time * 1.4 + index) * 0.07;
      dummy.position.set(Math.cos(angle) * (RING_RADIUS + wobble), Math.sin(angle) * (RING_RADIUS + wobble), wobble);
      dummy.scale.setScalar(0.17 * (1 - lag * 0.8));
      dummy.updateMatrix();
      flow.current.setMatrixAt(index, dummy.matrix);
    }
    flow.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} visible={false} rotation={[-0.08, -0.28, 0]}>
      <group scale={1.42}>
        <RoundedBox args={[2.5, 5, 0.22]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#14181f" metalness={0.8} roughness={0.32} />
        </RoundedBox>
        <mesh position={[0, 0, 0.115]}>
          <planeGeometry args={[2.26, 4.6]} />
          <meshBasicMaterial ref={screen} map={screenTexture} toneMapped={false} />
        </mesh>
      </group>
      <mesh>
        <torusGeometry args={[RING_RADIUS, 0.012, 8, 160]} />
        <meshBasicMaterial color={[0.3, 1.5, 0.7]} toneMapped={false} />
      </mesh>
      <instancedMesh ref={stops} args={[undefined, undefined, stations.length]} frustumCulled={false}>
        <sphereGeometry args={[0.26, 24, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={flow} args={[undefined, undefined, FLOW_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshBasicMaterial color={[0.7, 3.4, 1.5]} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
