'use client';

import { useUi } from '@/timeline/store';

/** The demo's question floating inside the orb. A visual echo: the form holds the real text. */
export function OracleOrbLabel() {
  const question = useUi((state) => state.oracleQuestion);

  return (
    <span aria-hidden="true" className="anchored scene-label orb-question" data-point="-0.2,-1,2.6">
      {question}
    </span>
  );
}
