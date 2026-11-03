'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useUi } from '@/timeline/store';

// Three.js only downloads once a tier that uses it has been chosen. Lite visitors never fetch it.
const CanvasRoot = dynamic(() => import('./CanvasRoot'), { ssr: false });

/** Lives in the root layout, so route changes never unmount the canvas. */
export function SceneMount() {
  const tier = useUi((state) => state.tier);
  const pathname = usePathname();

  if (tier === null || tier === 'lite') return null;
  return <CanvasRoot tier={tier} pathname={pathname} />;
}
