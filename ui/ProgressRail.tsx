'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { getWorld } from '@/timeline/chapters';
import { master, subscribeMaster } from '@/timeline/store';

/** Fill follows master.chapter directly, so it meets each tick as that chapter arrives. */
export function ProgressRail() {
  const pathname = usePathname();
  const count = getWorld(pathname).chapters.length;
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const value = count > 1 ? master.chapter / (count - 1) : master.progress;
      if (fill.current) fill.current.style.transform = `scaleY(${value})`;
    };
    update();
    return subscribeMaster(update);
  }, [count]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed top-[30vh] right-1.5 z-40 h-[40vh] w-px bg-white/20 lg:right-4">
      <div ref={fill} className="h-full w-full origin-top scale-y-0 bg-gold" />
      {count > 1 &&
        Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className="absolute right-0 h-px w-2 bg-white/50"
            style={{ top: `${(index / (count - 1)) * 100}%` }}
          />
        ))}
    </div>
  );
}
