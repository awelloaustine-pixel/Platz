'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { activeChapterIndex, getWorld, posterPath } from '@/timeline/chapters';
import { useUi } from '@/timeline/store';

const PORTRAIT = '(orientation: portrait)';
/** Scrolling quickly past a chapter should not spend the visitor's data on its image. */
const SETTLE_MS = 150;

function subscribePortrait(onChange: () => void): () => void {
  const query = window.matchMedia(PORTRAIT);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** Fades a chapter's still in over the last one, and only once it has fully downloaded. */
function Posters({ src }: { src: string }) {
  const [layers, setLayers] = useState<readonly { id: number; src: string }[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        nextId.current += 1;
        const id = nextId.current;
        setLayers((current) => [...current.slice(-1), { id, src }]);
      };
      image.src = src;
    }, SETTLE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [src]);

  return layers.map((layer) => <div key={layer.id} className="poster" style={{ backgroundImage: `url(${layer.src})` }} />);
}

/**
 * Sits beneath the canvas. Lite, reduced-motion and no-WebGL visitors see a pre-rendered still
 * of each chapter here instead of the live scene, with the same content and calls to action.
 */
export function Backdrop() {
  const pathname = usePathname();
  const chapterValue = useUi((state) => state.chapterIndex);
  const lite = useUi((state) => state.tier === 'lite');
  const portrait = useSyncExternalStore(
    subscribePortrait,
    () => window.matchMedia(PORTRAIT).matches,
    () => false,
  );
  const chapters = getWorld(pathname).chapters;
  const index = activeChapterIndex(chapterValue, chapters.length);
  const { grade } = chapters[index];

  return (
    <div aria-hidden="true" className="backdrop" style={{ backgroundColor: grade.background }}>
      <div
        className="backdrop-glow"
        style={{ background: `radial-gradient(circle at 68% 42%, ${grade.accent}2e, transparent 58%)` }}
      />
      {lite && <Posters src={posterPath(pathname, index, portrait)} />}
    </div>
  );
}
