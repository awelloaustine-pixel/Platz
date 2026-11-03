'use client';

import Link from 'next/link';
import { services } from '@/content/copy';
import { ui } from '@/timeline/store';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';

/** Hovering, focusing or tapping a card flies the camera toward that card's lane of thread. */
export function ServiceCards() {
  const clear = () => ui.set({ laneFocus: -1 });

  return (
    <ul className="card-row reveal" onPointerLeave={clear} onBlur={clear}>
      {services.map((service, index) => (
        <GlassCard
          as="li"
          key={service.href}
          onPointerEnter={() => ui.set({ laneFocus: index })}
          onFocus={() => ui.set({ laneFocus: index })}
          onClick={() => ui.set({ laneFocus: index })}
        >
          <div className="flex items-center gap-2.5 text-gold">
            <Icon name={service.icon} />
            <h3 className="hud-text">{service.name}</h3>
          </div>
          <p className="mt-3 text-lg leading-snug font-light tracking-tight">{service.line}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/85">{service.body}</p>
          <Link href={service.href} className="text-link mt-3 inline-block" aria-label={`Learn more about ${service.name}`}>
            Learn More →
          </Link>
        </GlassCard>
      ))}
    </ul>
  );
}
