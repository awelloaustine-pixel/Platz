'use client';

import { useEffect, useRef } from 'react';
import { activeChapterIndex, chapterAtScroll, getWorld, segment } from './chapters';
import { emitMaster, master, ui, useUi } from './store';

interface Runtime {
  rebuild(resetChapter: boolean): void;
  syncToNativeScroll(): void;
  scrollTo(target: HTMLElement): void;
  dispose(): void;
}

let runtime: Runtime | null = null;

/** How close to a chapter's rest point, in viewport heights, before scrolling settles onto it. */
const SNAP_REACH = 0.12;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  });
  emitMaster();
}

function canSnap(): boolean {
  return window.innerWidth >= 1024 && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion();
}

function whenIdle(callback: () => void): () => void {
  if ('requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(callback, { timeout: 1500 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = setTimeout(callback, 200);
  return () => clearTimeout(handle);
}

/** Measured section tops, so a section that grows on a narrow phone cannot desync the scene. */
function measure(): { tops: number[]; max: number } {
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
  const tops = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]')).map((section) =>
    Math.min(section.getBoundingClientRect().top + window.scrollY, max),
  );
  return { tops, max };
}

/** Fonts, images and later content all change section positions. */
function watchLayout(onChange: () => void): () => void {
  let signature = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const check = () => {
    const { tops, max } = measure();
    const next = `${tops.join()}|${max}`;
    if (next !== signature) {
      signature = next;
      onChange();
    }
  };
  check();
  const observer = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(check, 150);
  });
  observer.observe(document.body);
  return () => {
    clearTimeout(timer);
    observer.disconnect();
  };
}

/**
 * Lite and reduced motion: plain native scrolling with a passive listener. No smoothing and
 * no scrubbing, so GSAP and Lenis never need to be downloaded on the slowest connections.
 */
function startNative(getPath: () => string): Runtime {
  let tops: number[] = [];
  let frame = 0;

  const update = () => {
    frame = 0;
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    master.chapter = chapterAtScroll(window.scrollY, tops);
    master.progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    publish(getPath());
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const rebuild = () => {
    tops = measure().tops;
    update();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  const stopWatching = watchLayout(rebuild);
  rebuild();

  return {
    rebuild,
    syncToNativeScroll() {},
    scrollTo(target) {
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    dispose() {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      stopWatching();
    },
  };
}

/** The 3D tiers: Lenis smooth scroll and the scrubbed GSAP master timeline. */
async function startEnhanced(getPath: () => string): Promise<(() => Runtime) | null> {
  const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('lenis'),
  ]);

  return () => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    let timeline: gsap.core.Timeline | null = null;

    const rebuild = (resetChapter: boolean) => {
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
      timeline = null;
      if (resetChapter) {
        master.chapter = 0;
        master.progress = 0;
      }

      const { tops, max } = measure();

      if (max > 0) {
        timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            start: 0,
            end: 'max',
            scrub: 1.2,
            // Desktop only, and only when already close: it should settle, never fight the visitor.
            snap: canSnap()
              ? {
                  snapTo: (value: number) => {
                    const position = value * max;
                    const nearest = tops.reduce((best, top) =>
                      Math.abs(top - position) < Math.abs(best - position) ? top : best,
                    );
                    return Math.abs(nearest - position) < window.innerHeight * SNAP_REACH ? nearest / max : value;
                  },
                  delay: 0.2,
                  duration: { min: 0.25, max: 0.6 },
                  ease: 'power2.inOut',
                  inertia: false,
                }
              : undefined,
          },
          onUpdate: () => publish(getPath()),
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
      publish(getPath());
    };

    const stopWatching = watchLayout(() => rebuild(false));
    rebuild(false);

    return {
      rebuild,
      syncToNativeScroll() {
        // Next.js has already moved the page; stop Lenis easing back to the old position.
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      },
      scrollTo(target) {
        lenis.scrollTo(target, { duration: 1.6 });
      },
      dispose() {
        stopWatching();
        timeline?.scrollTrigger?.kill();
        timeline?.kill();
        gsap.ticker.remove(raf);
        lenis.destroy();
      },
    };
  };
}

/**
 * Drives master.chapter and master.progress from scroll. The native tracker runs from the
 * start, so the HUD works at once; the 3D tiers then upgrade it to the GSAP timeline.
 */
export function useMasterTimeline(pathname: string): void {
  const pathRef = useRef(pathname);
  const enhanced = useUi((state) => state.tier === 'high' || state.tier === 'medium');

  useEffect(() => {
    const getPath = () => pathRef.current;
    let disposed = false;
    runtime = startNative(getPath);

    const cancelIdle = enhanced
      ? whenIdle(async () => {
          const create = await startEnhanced(getPath);
          if (disposed || !create) return;
          runtime?.dispose();
          runtime = create();
        })
      : () => {};

    return () => {
      disposed = true;
      cancelIdle();
      runtime?.dispose();
      runtime = null;
    };
  }, [enhanced]);

  useEffect(() => {
    if (pathRef.current === pathname) return;
    pathRef.current = pathname;
    runtime?.syncToNativeScroll();
    runtime?.rebuild(true);
  }, [pathname]);
}
