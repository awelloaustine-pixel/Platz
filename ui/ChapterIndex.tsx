'use client';

import { usePathname } from 'next/navigation';
import { formatChapter, getWorld } from '@/timeline/chapters';
import { useUi } from '@/timeline/store';
import { scrollToSection } from '@/timeline/useMasterTimeline';

export function ChapterIndex() {
  const pathname = usePathname();
  const active = useUi((state) => state.chapterIndex);
  const { chapters } = getWorld(pathname);

  if (chapters.length < 2) return null;

  return (
    <nav aria-label="Chapters" className="hidden lg:block">
      <ol className="flex flex-col items-end gap-1">
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              aria-current={index === active ? 'true' : undefined}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(chapter.id);
              }}
              className={`hud-text flex gap-3 py-0.5 transition-colors duration-300 hover:text-white ${
                index === active ? 'text-white' : 'text-white/60'
              }`}
            >
              <span>{formatChapter(index)}</span>
              <span>{chapter.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
