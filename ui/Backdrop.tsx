'use client';

import { usePathname } from 'next/navigation';
import { activeChapterIndex, getWorld } from '@/timeline/chapters';
import { useUi } from '@/timeline/store';

/**
 * What every visitor sees before the canvas fades in, and all that Lite visitors see.
 * Step 7 adds the pre-rendered posters of the Core on top of this grade.
 */
export function Backdrop() {
  const pathname = usePathname();
  const chapterIndex = useUi((state) => state.chapterIndex);
  const chapters = getWorld(pathname).chapters;
  const { grade } = chapters[activeChapterIndex(chapterIndex, chapters.length)];

  return (
    <div aria-hidden="true" className="backdrop" style={{ backgroundColor: grade.background }}>
      <div
        className="backdrop-glow"
        style={{ background: `radial-gradient(circle at 68% 42%, ${grade.accent}2e, transparent 58%)` }}
      />
    </div>
  );
}
