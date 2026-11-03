'use client';

import { useEffect, useRef } from 'react';
import { activeChapterIndex, getWorld, segment } from './chapters';
import { emitMaster, master, ui } from './store';

interface Runtime {
  rebuild(resetChapter: boolean): void;
  syncToNativeScroll(): void;
  scrollTo(target: HTMLElement): void;
  dispose(): void;
}

let runtime: Runtime | null = null;

/** Smooth-scrolls to a section once the runtime has loaded; falls back to the browser. */
export function scrollToSection(id: string): void {
  const element = document.getElementById(id);
  if (!element) return;
  if (runtime) runtime.scrollTo(element);
  else element.scrollIntoView();
}

function publish(pathname: string): void {
  const chapters = getWorld(pathname).chapters;
  const { from, to, blend } = segment(master.chapter, chapters.length);
  const a = chapters[from];
  const b = chapters[to];
  ui.set({
    chapterIndex: activeChapterIndex(master.chapter, chapters.length),
    litCount: Math.round(a.lit + (b.lit - a.lit) * blend),
    leadsCaptured: Math.floor(a.leads + (b.leads - a.leads) * blend),
  });
  emitMaster();
}

function whenIdle(callback: () => void): () => void {
  if ('requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(callback, { timeout: 1500 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = setTimeout(callback, 200);
  return () => clearTimeout(handle);
}

/**
 * Drives master.chapter and master.progress from scroll. GSAP and Lenis are imported
 * after first paint so they do not count against the initial JS budget.
 *
 * Chapter boundaries come from measured section positions rather than fixed fractions,
 * so a section that grows on a narrow phone cannot pull the scene out of step with its text.
 */
export function useMasterTimeline(pathname: string): void {
  const pathRef = useRef(pathname);

  useEffect(() => {
    let disposed = false;

    const cancelIdle = whenIdle(async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
      ]);
      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lenis = reducedMotion ? null : new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
      const raf = (time: number) => lenis?.raf(time * 1000);
      if (lenis) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
      }

      let timeline: gsap.core.Timeline | null = null;
      let signature = '';

      const measure = () => {
        const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'));
        const max = ScrollTrigger.maxScroll(window);
        const tops = sections.map((section) =>
          Math.min(section.getBoundingClientRect().top + window.scrollY, max),
        );
        return { tops, max };
      };

      const rebuild = (resetChapter: boolean) => {
        timeline?.scrollTrigger?.kill();
        timeline?.kill();
        timeline = null;
        if (resetChapter) {
          master.chapter = 0;
          master.progress = 0;
        }

        const { tops, max } = measure();
        signature = `${tops.join()}|${max}`;

        if (max > 0) {
          timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { start: 0, end: 'max', scrub: reducedMotion ? true : 1.2 },
            onUpdate: () => publish(pathRef.current),
          });
          // Timeline time is measured in scrolled pixels, so each tween spans its section.
          timeline.fromTo(master, { progress: 0 }, { progress: 1, duration: max, immediateRender: false }, 0);
          tops.forEach((top, index) => {
            const next = tops[index + 1];
            if (next === undefined || next <= top) return;
            timeline?.fromTo(
              master,
              { chapter: index },
              { chapter: index + 1, duration: next - top, immediateRender: false },
              top,
            );
          });
          ScrollTrigger.refresh();
          // Jump to the current scroll position so a rebuild never replays the page.
          const trigger = timeline.scrollTrigger;
          if (trigger) timeline.progress(trigger.progress);
        }
        publish(pathRef.current);
      };

      // Fonts, images and later content all change section positions.
      let resizeTimer: ReturnType<typeof setTimeout> | undefined;
      const observer = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const { tops, max } = measure();
          if (`${tops.join()}|${max}` !== signature) rebuild(false);
        }, 150);
      });
      observer.observe(document.body);

      runtime = {
        rebuild,
        syncToNativeScroll() {
          // Next.js has already moved the page; stop Lenis easing back to the old position.
          lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
        },
        scrollTo(target) {
          if (lenis) lenis.scrollTo(target, { duration: 1.6 });
          else target.scrollIntoView();
        },
        dispose() {
          clearTimeout(resizeTimer);
          observer.disconnect();
          timeline?.scrollTrigger?.kill();
          timeline?.kill();
          gsap.ticker.remove(raf);
          lenis?.destroy();
        },
      };
      rebuild(false);
    });

    return () => {
      disposed = true;
      cancelIdle();
      runtime?.dispose();
      runtime = null;
    };
  }, []);

  useEffect(() => {
    if (pathRef.current === pathname) return;
    pathRef.current = pathname;
    runtime?.syncToNativeScroll();
    runtime?.rebuild(true);
    if (!runtime) publish(pathname);
  }, [pathname]);
}
