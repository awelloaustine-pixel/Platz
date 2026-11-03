'use client';

import { useEffect, useRef } from 'react';
import { howSteps } from '@/content/copy';
import { master, subscribeMaster } from '@/timeline/store';
import { formatChapter } from '@/timeline/chapters';
import { GlassCard } from './GlassCard';

const HOW_CHAPTER = 3;

/** Each step belongs to one gate. With the 3D on, only the step being passed is shown. */
export function HowSteps() {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const update = () => {
      const current = Math.min(Math.max(Math.floor((master.chapter - HOW_CHAPTER) * howSteps.length), 0), howSteps.length - 1);
      list.current?.querySelectorAll('li').forEach((item, index) => {
        if (index === current) item.setAttribute('data-current', '');
        else item.removeAttribute('data-current');
      });
    };
    update();
    return subscribeMaster(update);
  }, []);

  return (
    <ol ref={list} className="how-steps reveal">
      {howSteps.map((step, index) => (
        <GlassCard as="li" key={step.title} className="how-step">
          <p className="hud-text text-gold">{formatChapter(index + 1)}</p>
          <h3 className="mt-2 text-xl font-light tracking-tight">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/85">{step.body}</p>
        </GlassCard>
      ))}
    </ol>
  );
}
