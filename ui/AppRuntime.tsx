'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { initQuality } from '@/lib/qualityState';
import { hydrateSound } from '@/ui/SoundToggle';
import { ui } from '@/timeline/store';
import { useMasterTimeline } from '@/timeline/useMasterTimeline';

/** Matches the fade on .route-leaving in globals.css. */
const LEAVE_MS = 200;

/** Starts the background systems. Renders nothing. */
export function AppRuntime() {
  const pathname = usePathname();
  const router = useRouter();
  useMasterTimeline(pathname);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="/"]') : null;
      if (!link || link.target === '_blank') return;
      const url = new URL(link.href);
      if (url.pathname === window.location.pathname) return;
      // Runs before Next's own handler, which stands down once the event is prevented.
      event.preventDefault();
      document.documentElement.classList.add('route-leaving');
      timer = setTimeout(() => router.push(url.pathname + url.search), LEAVE_MS);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      clearTimeout(timer);
    };
  }, [router]);

  useEffect(() => {
    document.documentElement.classList.remove('route-leaving');
    ui.set({ worldFocus: 0, tierLevel: -1, laneFocus: -1 });
  }, [pathname]);

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
