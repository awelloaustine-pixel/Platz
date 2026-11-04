'use client';

import { useState } from 'react';
import type { Tier } from '@/lib/quality';
import { Blueprint } from './Blueprint';
import { Constellation } from './Constellation';
import { Oracle } from './Oracle';
import { SignalNetwork } from './SignalNetwork';

const WITH_OWN_WORLD = new Set(['/websites', '/automations', '/ai-visibility', '/about']);

/**
 * Builds each page's world the first time it is visited, and keeps it so that leaving can
 * animate. /pricing and /contact use only the thread and the Core, so they need nothing here.
 */
export function Worlds({ pathname, tier }: { pathname: string; tier: Tier }) {
  const [visited, setVisited] = useState<readonly string[]>(WITH_OWN_WORLD.has(pathname) ? [pathname] : []);
  if (WITH_OWN_WORLD.has(pathname) && !visited.includes(pathname)) setVisited([...visited, pathname]);

  return (
    <>
      {visited.includes('/websites') && <Blueprint pathname="/websites" active={pathname === '/websites'} />}
      {visited.includes('/automations') && <SignalNetwork pathname="/automations" active={pathname === '/automations'} />}
      {visited.includes('/ai-visibility') && (
        <Oracle pathname="/ai-visibility" active={pathname === '/ai-visibility'} tier={tier} />
      )}
      {visited.includes('/about') && <Constellation active={pathname === '/about'} />}
    </>
  );
}
