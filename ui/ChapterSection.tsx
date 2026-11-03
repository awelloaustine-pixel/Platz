import type { CSSProperties, ReactNode } from 'react';
import { formatChapter, type ChapterConfig } from '@/timeline/chapters';

interface ChapterSectionProps {
  chapter: ChapterConfig;
  index: number;
  heading?: 'h1' | 'h2';
  showLabel?: boolean;
  eyebrow?: string;
  children?: ReactNode;
}

/** One camera shot of DOM. The text stays pinned while the shot plays out behind it. */
export function ChapterSection({
  chapter,
  index,
  heading: Heading = 'h2',
  showLabel = true,
  eyebrow,
  children,
}: ChapterSectionProps) {
  const headingId = `${chapter.id}-title`;

  return (
    <section
      id={chapter.id}
      data-chapter={index}
      aria-labelledby={headingId}
      className="chapter"
      style={{ '--span': chapter.span } as CSSProperties}
    >
      <div className="chapter-stage">
        {eyebrow && <p className="hud-text mb-4 text-gold">{eyebrow}</p>}
        {showLabel && (
          <p className="hud-text mb-4 text-white/80">
            {formatChapter(index)} —— {chapter.label}
          </p>
        )}
        <Heading id={headingId} className="headline">
          {chapter.title}
        </Heading>
        {children}
      </div>
    </section>
  );
}
