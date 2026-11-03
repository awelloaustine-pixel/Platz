'use client';

import type { ReactNode } from 'react';
import { scrollToSection } from '@/timeline/useMasterTimeline';

/** A real anchor, so it still works before the scroll runtime has loaded. */
export function SectionLink({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${id}`}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        scrollToSection(id);
      }}
    >
      {children}
    </a>
  );
}
