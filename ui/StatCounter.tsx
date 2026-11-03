'use client';

import { useEffect, useRef } from 'react';

const DURATION_MS = 1600;

/** Shows X until a real number is supplied in content/stats.ts, then counts up to it. */
export function StatCounter({ value }: { value: number | null }) {
  const output = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = output.current;
    if (!element || value === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(value * eased).toLocaleString('en-KE');
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={output} className="tabular-nums">
      {value === null ? 'X' : value.toLocaleString('en-KE')}
    </span>
  );
}
