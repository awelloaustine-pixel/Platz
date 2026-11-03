'use client';

import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, select, [role="button"], label';
const TEXT_ENTRY = 'input, textarea';
const MAGNET_REACH = 0.28;

/** Mouse-only ring cursor, plus the magnetic pull on buttons. Touch screens never run this. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const element = ring.current;
    if (!canHover || reduced || !element) return;

    const root = document.documentElement;
    let targetX = -100;
    let targetY = -100;
    let x = targetX;
    let y = targetY;
    let size = 1;
    let targetSize = 1;
    let frame = 0;
    let visible = false;
    let magnet: HTMLElement | null = null;

    const releaseMagnet = () => {
      if (magnet) magnet.style.transform = '';
      magnet = null;
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        visible = true;
        x = targetX;
        y = targetY;
        root.classList.add('ring-cursor');
        element.style.opacity = '1';
      }

      const under = event.target instanceof Element ? event.target : null;
      targetSize = under?.closest(INTERACTIVE) ? 2.3 : 1;
      element.style.visibility = under?.closest(TEXT_ENTRY) ? 'hidden' : 'visible';

      const nextMagnet = under?.closest<HTMLElement>('.btn-gold, .btn-ghost') ?? null;
      if (nextMagnet !== magnet) releaseMagnet();
      magnet = nextMagnet;
      if (magnet) {
        const box = magnet.getBoundingClientRect();
        const pullX = (event.clientX - (box.left + box.width / 2)) * MAGNET_REACH;
        const pullY = (event.clientY - (box.top + box.height / 2)) * MAGNET_REACH;
        magnet.style.transform = `translate(${pullX}px, ${pullY}px)`;
      }
    };

    const tick = () => {
      const dx = targetX - x;
      const dy = targetY - y;
      x += dx * 0.22;
      y += dy * 0.22;
      size += (targetSize - size) * 0.18;
      // Stretches along the direction of travel, like the thread.
      const speed = Math.min(Math.hypot(dx, dy) / 240, 0.7);
      const angle = Math.atan2(dy, dx);
      element.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad) scale(${size * (1 + speed)}, ${size * (1 - speed * 0.5)})`;
      frame = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      element.style.opacity = '0';
      visible = false;
      root.classList.remove('ring-cursor');
      releaseMagnet();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
      root.classList.remove('ring-cursor');
      releaseMagnet();
    };
  }, []);

  return <div ref={ring} aria-hidden="true" className="cursor-ring" />;
}
