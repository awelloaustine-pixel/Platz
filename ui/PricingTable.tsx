'use client';

import type { PriceGroup } from '@/content/pricing';
import { ui } from '@/timeline/store';

interface PricingTableProps {
  group: PriceGroup;
  /** Stack the tiers in a column, for the three-lane pricing page. */
  stacked?: boolean;
}

/** Hovering a tier tells the current world how much of itself to light. */
export function PricingTable({ group, stacked = false }: PricingTableProps) {
  const clear = () => ui.set({ tierLevel: -1 });

  return (
    <div className="reveal">
      <ul className={stacked ? 'tier-stack' : 'card-row'} onPointerLeave={clear} onBlur={clear}>
        {group.tiers.map((tier, index) => (
          <li
            key={tier.name}
            className="glass glass-card tier-card"
            tabIndex={0}
            onPointerEnter={() => ui.set({ tierLevel: index })}
            onFocus={() => ui.set({ tierLevel: index })}
          >
            <h3 className="hud-text text-gold">{tier.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/85">{tier.included}</p>
            <dl className="tier-prices">
              <div>
                <dt className="hud-text text-white/80">{group.oneOffLabel}</dt>
                <dd className="text-xl font-light tracking-tight">{tier.oneOff}</dd>
              </div>
              <div>
                <dt className="hud-text text-white/80">Monthly</dt>
                <dd className="text-xl font-light tracking-tight">{tier.monthly}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      {group.note && <p className="price-note">{group.note}</p>}
    </div>
  );
}
