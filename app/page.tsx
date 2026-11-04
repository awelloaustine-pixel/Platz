import Link from 'next/link';
import { beginCopy, heroCopy, howSteps, industries, problemPoints, TAGLINES, taglineVariant } from '@/content/copy';
import { whatsappUrl } from '@/content/site';
import { stats } from '@/content/stats';
import { testimonials } from '@/content/testimonials';
import { getWorld } from '@/timeline/chapters';
import { ChapterSection } from '@/ui/ChapterSection';
import { GlassCard } from '@/ui/GlassCard';
import { Icon } from '@/ui/Icon';
import { SectionLink } from '@/ui/SectionLink';
import { ServiceCards } from '@/ui/ServiceCards';
import { SiteFooter } from '@/ui/SiteFooter';
import { StatCounter } from '@/ui/StatCounter';
import { StepList } from '@/ui/StepList';

export default function HomePage() {
  const [arrival, problem, system, how, who, proof, begin] = getWorld('/').chapters;

  return (
    <>
      <ChapterSection chapter={arrival} index={0} heading="h1" showLabel={false} eyebrow={heroCopy.eyebrow} large>
        <div className="reveal reveal-now">
          <p className="lede">{heroCopy.sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={heroCopy.primaryCta.href} className="btn-gold">
              {heroCopy.primaryCta.label}
            </Link>
            <SectionLink id="system" className="btn-ghost">
              {heroCopy.secondaryCta.label}
            </SectionLink>
          </div>
          <p className="hud-text mt-6 text-white/85">{TAGLINES[taglineVariant]}</p>
        </div>
      </ChapterSection>

      <ChapterSection chapter={problem} index={1}>
        <ul className="card-row reveal">
          {problemPoints.map((point, index) => (
            <GlassCard as="li" key={point.title} data-anchor={`splinter-${index}`} className="anchored">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-[#ff8a80]">
                  <Icon name={point.icon} />
                </span>
                <div>
                  <h3 className="leading-snug font-medium">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/85">{point.body}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </ul>
      </ChapterSection>

      <ChapterSection chapter={system} index={2} bodyAbove>
        <ServiceCards />
      </ChapterSection>

      <ChapterSection chapter={how} index={3} bodyAbove>
        <StepList items={howSteps} chapterIndex={3} />
      </ChapterSection>

      <ChapterSection chapter={who} index={4}>
        <ul className="industry-tiles reveal">
          {industries.map((industry, index) => (
            <li key={industry.name} className="glass industry-tile anchored" data-orbit={`${index}/${industries.length}`}>
              <span className="text-gold">
                <Icon name={industry.icon} className="size-4.5" />
              </span>
              {industry.name}
            </li>
          ))}
        </ul>
      </ChapterSection>

      <ChapterSection chapter={proof} index={5} bodyAbove>
        <div className="reveal">
          <dl className="stats-bar">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="hud-text mt-1 text-white/85">{stat.label}</dt>
                <dd className="text-4xl font-light tracking-tight">
                  <StatCounter value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
          <ul className="card-row mt-3">
            {testimonials.map((item, index) => (
              <GlassCard as="li" key={index}>
                <p aria-label={`Rated ${item.rating} out of 5`} className="tracking-widest text-gold">
                  {'★'.repeat(item.rating)}
                </p>
                <blockquote className="mt-2 leading-snug font-light">{item.quote}</blockquote>
                <p className="mt-3 text-sm">{item.name}</p>
                <p className="hud-text text-white/80">{item.business}</p>
              </GlassCard>
            ))}
          </ul>
        </div>
      </ChapterSection>

      <ChapterSection chapter={begin} index={6} after={<SiteFooter />}>
        <div className="reveal">
          <p className="lede">{beginCopy.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={beginCopy.primaryCta.href} className="btn-gold">
              {beginCopy.primaryCta.label}
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              {beginCopy.whatsappLabel}
            </a>
          </div>
        </div>
      </ChapterSection>
    </>
  );
}
