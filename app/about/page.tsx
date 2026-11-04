import Link from 'next/link';
import { story, team, values } from '@/content/team';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema } from '@/lib/schema';
import { getWorld } from '@/timeline/chapters';
import { ChapterSection } from '@/ui/ChapterSection';
import { JsonLd } from '@/ui/JsonLd';
import { GlassCard } from '@/ui/GlassCard';
import { SiteFooter } from '@/ui/SiteFooter';
import { StepList } from '@/ui/StepList';

export const metadata = pageMetadata('/about');

const NODE_POINTS = ['-4.4,3,0.6', '4.4,3,0.6', '-4.4,-3,0.6', '4.4,-3,0.6'];

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('');
}

export default function AboutPage() {
  const [hero, ourStory, people, ourValues] = getWorld('/about').chapters;

  return (
    <>
      <JsonLd data={breadcrumbSchema('/about', 'About')} />
      <ChapterSection chapter={hero} index={0} heading="h1" showLabel={false} large />
      <ChapterSection chapter={ourStory} index={1}>
        <div className="story">
          {story.map((paragraph) => (
            <div key={paragraph} className="reveal">
              <p>{paragraph}</p>
            </div>
          ))}
        </div>
      </ChapterSection>
      <ChapterSection
        chapter={people}
        index={2}
        bodyAbove
        after={
          <div aria-hidden="true">
            {team.map((member, index) => (
              <span key={member.name} className="anchored scene-label node-label" data-point={NODE_POINTS[index]}>
                {member.name}
              </span>
            ))}
          </div>
        }
      >
        <ul className="team-grid reveal">
          {team.map((member) => (
            <GlassCard as="li" key={member.name}>
              <span aria-hidden="true" className="team-avatar">
                {initials(member.name)}
              </span>
              <h3 className="mt-3 text-lg font-light tracking-tight">{member.name}</h3>
              <p className="hud-text mt-1 text-gold">{member.role}</p>
              <p className="mt-2 text-sm text-white/85">{member.bio}</p>
            </GlassCard>
          ))}
        </ul>
      </ChapterSection>
      <ChapterSection chapter={ourValues} index={3} after={<SiteFooter top="hero" />}>
        <StepList items={values} chapterIndex={3} />
        <div className="reveal mt-5">
          <div>
            <Link href="/contact" className="btn-gold">
              Book a Free Call →
            </Link>
          </div>
        </div>
      </ChapterSection>
    </>
  );
}
