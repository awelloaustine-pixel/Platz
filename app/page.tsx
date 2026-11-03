import Link from 'next/link';
import { heroCopy } from '@/content/copy';
import { getWorld } from '@/timeline/chapters';
import { ChapterSection } from '@/ui/ChapterSection';
import { SectionLink } from '@/ui/SectionLink';

export default function HomePage() {
  const [arrival, ...rest] = getWorld('/').chapters;

  return (
    <>
      <ChapterSection chapter={arrival} index={0} heading="h1" showLabel={false} eyebrow={heroCopy.eyebrow}>
        <p className="lede">{heroCopy.sub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={heroCopy.primaryCta.href} className="btn-gold">
            {heroCopy.primaryCta.label}
          </Link>
          <SectionLink id="system" className="btn-ghost">
            {heroCopy.secondaryCta.label}
          </SectionLink>
        </div>
      </ChapterSection>
      {rest.map((chapter, index) => (
        <ChapterSection key={chapter.id} chapter={chapter} index={index + 1} />
      ))}
    </>
  );
}
