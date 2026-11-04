'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { activeChapterIndex, formatChapter, getWorld } from '@/timeline/chapters';
import { master, subscribeMaster, ui } from '@/timeline/store';

interface StepListProps {
  items: readonly { title: string; body: string }[];
  /** The chapter whose scroll progress moves through the items. */
  chapterIndex: number;
  /** Show every item with the current one highlighted, rather than one at a time. */
  showAll?: boolean;
}

/**
 * A list that scrolling walks through, with the matching part of the 3D lighting up.
 * With the 3D off or on a phone, every item is simply shown in full.
 */
export function StepList({ items, chapterIndex, showAll = false }: StepListProps) {
  const pathname = usePathname();
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const count = getWorld(pathname).chapters.length;
    const update = () => {
      const progress = (master.chapter - chapterIndex) * items.length;
      const current = Math.min(Math.max(Math.floor(progress), 0), items.length - 1);
      list.current?.querySelectorAll(':scope > li').forEach((item, index) => {
        if (index === current) item.setAttribute('data-current', '');
        else item.removeAttribute('data-current');
      });
      if (activeChapterIndex(master.chapter, count) === chapterIndex) ui.set({ worldFocus: current });
    };
    update();
    return subscribeMaster(update);
  }, [chapterIndex, items.length, pathname]);

  return (
    <ol ref={list} className={`reveal ${showAll ? 'step-list-all' : 'how-steps'}`}>
      {items.map((item, index) => (
        <li key={item.title} className={`glass glass-card ${showAll ? 'step-all' : 'how-step'}`}>
          <p className="hud-text text-gold">{formatChapter(index + 1)}</p>
          <div>
            <h3 className={showAll ? 'font-light' : 'mt-2 text-xl font-light tracking-tight'}>{item.title}</h3>
            {item.body && <p className={showAll ? 'text-sm text-white/85' : 'mt-2 text-sm leading-relaxed text-white/85'}>{item.body}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
