'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { initQuality } from '@/lib/qualityState';
import { hydrateSound } from '@/ui/SoundToggle';
import { useMasterTimeline } from '@/timeline/useMasterTimeline';

/** Starts the background systems. Renders nothing. */
export function AppRuntime() {
  useMasterTimeline(usePathname());

  useEffect(() => {
    hydrateSound();
    void initQuality();
  }, []);

  return null;
}
