'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { initQuality } from '@/lib/qualityState';
import { hydrateSound } from '@/ui/SoundToggle';
import { useMasterTimeline } from '@/timeline/useMasterTimeline';

/** Starts the background systems. Renders nothing. */
export function AppRuntime() {
  const pathname = usePathname();
  useMasterTimeline(pathname);

  useEffect(() => {
    hydrateSound();
    void initQuality();
  }, []);

  // Plays each block's reveal the first time it comes on screen.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      },
      // Low, because a long list on a phone may never have much of itself on screen at once.
      { threshold: 0.02 },
    );
    document.querySelectorAll('.reveal:not(.is-in)').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
