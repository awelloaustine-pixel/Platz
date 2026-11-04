import Link from 'next/link';
import { pageSubs } from '@/content/copy';
import { allPricing, bundleOffer } from '@/content/pricing';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema } from '@/lib/schema';
import { getWorld } from '@/timeline/chapters';
import { ChapterSection } from '@/ui/ChapterSection';
import { JsonLd } from '@/ui/JsonLd';
import { GlassCard } from '@/ui/GlassCard';
import { PricingTable } from '@/ui/PricingTable';
import { SiteFooter } from '@/ui/SiteFooter';

export const metadata = pageMetadata('/pricing');

export default function PricingPage() {
  const [hero, lanes, bundle] = getWorld('/pricing').chapters;

  return (
    <>
      <JsonLd data={breadcrumbSchema('/pricing', 'Pricing')} />
      <ChapterSection chapter={hero} index={0} heading="h1" showLabel={false} large>
        <div className="reveal reveal-now">
          <p className="lede">{pageSubs['/pricing']}</p>
        </div>
      </ChapterSection>
      <ChapterSection chapter={lanes} index={1} bodyAbove>
        <div className="lane-columns">
          {allPricing.map((group) => (
            <section key={group.id} className="lane-column" aria-label={group.lane}>
              <h3 className="hud-text mb-2 text-white">{group.lane}</h3>
              <PricingTable group={group} stacked />
            </section>
          ))}
        </div>
      </ChapterSection>
      <ChapterSection chapter={bundle} index={2} after={<SiteFooter top="hero" />}>
        <div className="reveal">
          <div>
            <GlassCard className="bundle-banner">
              <p className="text-xl font-light tracking-tight">{bundleOffer}</p>
            </GlassCard>
            <p className="lede">Not sure which package? Book a free call and we&apos;ll help you figure it out.</p>
            <div className="mt-5">
              <Link href="/contact" className="btn-gold">
                Book a Free Call →
              </Link>
            </div>
          </div>
        </div>
      </ChapterSection>
    </>
  );
}
