import type { CSSProperties, ReactNode } from 'react';
import { formatChapter, type ChapterConfig } from '@/timeline/chapters';
import { SplitReveal } from './SplitReveal';

interface ChapterSectionProps {
  chapter: ChapterConfig;
  index: number;
  heading?: 'h1' | 'h2';
  showLabel?: boolean;
  eyebrow?: string;
  /** Hero sizing. Other chapters use a smaller headline to leave room for their content. */
  large?: boolean;
  /** For a long sentence used as the section's headline. */
  statement?: boolean;
  /** On large screens, shows children above the headline rather than below it. */
  bodyAbove?: boolean;
  /** Rendered after the pinned stage, in normal flow. */
  after?: ReactNode;
  children?: ReactNode;
}

/** One camera shot of DOM. The text stays pinned while the shot plays out behind it. */
export function ChapterSection({
  chapter,
  index,
  heading: Heading = 'h2',
  showLabel = true,
  eyebrow,
  large = false,
  statement = false,
  bodyAbove = false,
  after,
  children,
}: ChapterSectionProps) {
  const headingId = `${chapter.id}-title`;

  return (
    <section
      id={chapter.id}
      data-chapter={index}
      aria-labelledby={headingId}
      className="chapter"
    >
      <div className="chapter-track" style={{ '--span': chapter.span } as CSSProperties}>
        <div className="chapter-stage">
          <div className={index === 0 ? 'reveal reveal-now' : 'reveal'}>
            {eyebrow && <p className="hud-text mb-4 text-white lg:text-gold">{eyebrow}</p>}
            {showLabel && (
              <p className="hud-text mb-4 text-white/85">
                {formatChapter(index)} —— {chapter.label}
              </p>
            )}
            <Heading id={headingId} className={large ? 'headline' : statement ? 'headline headline-statement' : 'headline headline-md'}>
              <SplitReveal text={chapter.title} />
            </Heading>
          </div>
          {children && <div className={bodyAbove ? 'stage-body stage-body-above' : 'stage-body'}>{children}</div>}
        </div>
      </div>
      {after}
    </section>
  );
}
