'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { type Group, MathUtils } from 'three';

/** Grows a world into place when its route opens and shrinks it away when the route leaves. */
export function usePresence(active: boolean) {
  const group = useRef<Group>(null);
  const amount = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    amount.current = MathUtils.damp(amount.current, active ? 1 : 0, active ? 1.8 : 5, Math.min(delta, 1 / 20));
    group.current.visible = amount.current > 0.01;
    group.current.scale.setScalar(0.4 + 0.6 * amount.current);
  });

  return { group, amount };
}
