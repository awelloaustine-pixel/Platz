'use client';

import { useEffect, useState } from 'react';
import { toggleSimpleView } from '@/lib/qualityState';
import { useUi } from '@/timeline/store';

const nairobiTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Nairobi',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function NairobiClock() {
  // Empty until mount: the server's time would not match the visitor's at hydration.
  const [time, setTime] = useState('--:--');

  useEffect(() => {
    const update = () => setTime(nairobiTime.format(new Date()));
    const first = setTimeout(update, 0);
    const interval = setInterval(update, 15000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  return <>{time}</>;
}

export function HudReadouts() {
  const petalsLit = useUi((state) => state.petalsLit);
  const leads = useUi((state) => state.leadsCaptured);
  const tier = useUi((state) => state.tier);
  const canToggle = useUi((state) => state.webgl && !state.reducedMotion);

  return (
    <aside
      aria-label="Live status"
      className="glass fixed inset-x-0 bottom-0 z-40 flex min-h-12 items-center justify-between gap-3 px-4 lg:inset-x-auto lg:right-10 lg:bottom-8 lg:flex-col lg:items-end lg:gap-1 lg:rounded-xl lg:p-4"
    >
      <dl className="hud-text flex gap-3 text-white/80 lg:flex-col lg:items-end lg:gap-1">
        <div className="flex gap-1.5">
          <dt>EAT</dt>
          <dd className="text-white">
            <NairobiClock />
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>
            PETALS<span className="hidden lg:inline"> LIT</span>
          </dt>
          <dd className="text-white tabular-nums">{petalsLit}/12</dd>
        </div>
        <div className="hidden gap-1.5 sm:flex">
          <dt>LEADS CAPTURED</dt>
          <dd className="text-white tabular-nums">{String(leads).padStart(3, '0')}</dd>
        </div>
      </dl>
      {canToggle && (
        <button
          type="button"
          onClick={() => void toggleSimpleView()}
          aria-pressed={tier === 'lite'}
          className="hud-text min-h-11 shrink-0 text-gold transition-colors hover:text-white lg:mt-1 lg:min-h-6"
        >
          {tier === 'lite' ? '3D view ↗' : 'Simple view ↗'}
        </button>
      )}
    </aside>
  );
}
