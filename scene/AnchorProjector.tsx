'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { activeChapterIndex, getWorld } from '@/timeline/chapters';
import { master } from '@/timeline/store';
import { BEAMS } from './thread/threadPath';

const MIN_WIDTH = 1024;
const splinterPoints = BEAMS.filter((beam) => beam.group === 'splinter').map(
  ({ points: [, , [x, y, z]] }) => new Vector3(x, y, z),
);
const CENTRE = new Vector3(0, 0, 0);
const projected = new Vector3();
const GAP = 12;
const SCAN_MS = 800;

interface Tracked {
  element: HTMLElement;
  chapter: number;
  splinter: number | null;
  orbit: { index: number; total: number } | null;
  x: number;
  y: number;
}

function clearAnchors(items: readonly Tracked[]): void {
  items.forEach(({ element }) => {
    element.style.transform = '';
    element.removeAttribute('data-live');
  });
}

function scan(): Tracked[] {
  const found = document.querySelectorAll<HTMLElement>('[data-anchor], [data-orbit]');
  return Array.from(found).map((element) => {
    const [index, total] = (element.dataset.orbit ?? '').split('/').map(Number);
    const splinter = element.dataset.anchor?.match(/^splinter-(\d)$/)?.[1];
    return {
      element,
      chapter: Number(element.closest<HTMLElement>('[data-chapter]')?.dataset.chapter ?? -1),
      splinter: splinter === undefined ? null : Number(splinter),
      orbit: element.dataset.orbit ? { index, total } : null,
      x: 0,
      y: 0,
    };
  });
}

/**
 * Pins DOM cards to the 3D scene by projecting world points to the screen every frame.
 * The cards stay real DOM text. Below 1024px, in Lite and with no JS they keep their normal
 * place in the page, which is why all of this is switched on by a single attribute.
 */
export function AnchorProjector({ pathname }: { pathname: string }) {
  const items = useRef<Tracked[]>([]);
  const lastScan = useRef(0);
  const active = useRef(false);
  const orbitTime = useRef(0);
  const hovered = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const onOver = (event: PointerEvent) => {
      hovered.current = event.target instanceof Element && Boolean(event.target.closest('[data-orbit]'));
    };
    window.addEventListener('pointerover', onOver, { passive: true });
    lastScan.current = 0;
    return () => {
      window.removeEventListener('pointerover', onOver);
      delete root.dataset.anchors;
      clearAnchors(items.current);
      active.current = false;
    };
  }, [pathname]);

  useFrame(({ camera, size, clock }, delta) => {
    const root = document.documentElement;
    const wide = size.width >= MIN_WIDTH;

    if (wide !== active.current) {
      active.current = wide;
      if (wide) root.dataset.anchors = 'on';
      else {
        delete root.dataset.anchors;
        clearAnchors(items.current);
      }
    }
    if (!wide) return;

    const now = clock.elapsedTime * 1000;
    if (lastScan.current === 0 || now - lastScan.current > SCAN_MS) {
      lastScan.current = now || 1;
      items.current = scan();
    }

    const chapters = getWorld(pathname).chapters;
    const current = activeChapterIndex(master.chapter, chapters.length);
    if (!hovered.current) orbitTime.current += delta * 0.045;

    const { width, height } = size;
    const toScreen = (point: Vector3) => {
      projected.copy(point).project(camera);
      return { x: (projected.x * 0.5 + 0.5) * width, y: (-projected.y * 0.5 + 0.5) * height };
    };

    const centre = toScreen(CENTRE);
    const radiusX = Math.min(width * 0.27, 400);
    const radiusY = Math.min(height * 0.3, 270);
    const orbitX = Math.min(Math.max(centre.x, radiusX + 110), width - radiusX - 230);
    const orbitY = Math.min(Math.max(centre.y, radiusY + 70), height - radiusY - 190);

    const cards: Tracked[] = [];
    items.current.forEach((item) => {
      const live = item.chapter === current;
      if (live !== (item.element.dataset.live === '1')) item.element.dataset.live = live ? '1' : '0';
      if (!live) return;

      if (item.orbit) {
        const angle = (item.orbit.index / item.orbit.total) * Math.PI * 2 + orbitTime.current;
        const depth = 0.9 + Math.sin(angle) * 0.1;
        const box = item.element.offsetWidth;
        const x = orbitX + Math.cos(angle) * radiusX - box / 2;
        const y = orbitY + Math.sin(angle) * radiusY - item.element.offsetHeight / 2;
        item.element.style.transform = `translate(${x}px, ${y}px) scale(${depth})`;
      } else if (item.splinter !== null) {
        const point = toScreen(splinterPoints[item.splinter]);
        item.x = Math.min(Math.max(point.x + 16, width * 0.46), width - item.element.offsetWidth - 200);
        item.y = point.y - item.element.offsetHeight / 2;
        cards.push(item);
      }
    });

    // Keep the cards next to their beams, without letting them overlap or leave the safe area.
    cards.sort((a, b) => a.y - b.y);
    let cursor = 92;
    cards.forEach((card) => {
      card.y = Math.max(card.y, cursor);
      cursor = card.y + card.element.offsetHeight + GAP;
    });
    let limit = height - 240;
    for (let i = cards.length - 1; i >= 0; i -= 1) {
      const bottom = cards[i].y + cards[i].element.offsetHeight;
      if (bottom > limit) cards[i].y -= bottom - limit;
      limit = cards[i].y - GAP;
    }
    cards.forEach((card) => {
      card.element.style.transform = `translate(${card.x}px, ${card.y}px)`;
    });
  });

  return null;
}
