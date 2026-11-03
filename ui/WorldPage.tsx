import Link from 'next/link';
import { pageSubs } from '@/content/copy';
import { getWorld } from '@/timeline/chapters';
import { ChapterSection } from './ChapterSection';

/** Inner-page hero. Step 5 adds each page's scroll-driven sections beneath it. */
export function WorldPage({ path }: { path: string }) {
  const { chapters } = getWorld(path);
  const sub = pageSubs[path];

  return (
    <>
      {chapters.map((chapter, index) => (
        <ChapterSection key={chapter.id} chapter={chapter} index={index} heading={index === 0 ? 'h1' : 'h2'} showLabel={index > 0}>
          {index === 0 && sub && <p className="lede">{sub}</p>}
          {index === 0 && path !== '/contact' && (
            <div className="mt-8">
              <Link href="/contact" className="btn-gold">
                Get Started →
              </Link>
            </div>
          )}
        </ChapterSection>
      ))}
    </>
  );
}
