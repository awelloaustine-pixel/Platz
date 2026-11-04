import type { Metadata } from 'next';
import Link from 'next/link';
import { pageSubs } from '@/content/copy';
import { websiteFaqs } from '@/content/faqs';
import { websitePricing } from '@/content/pricing';
import { websiteFeatures } from '@/content/services';
import { getWorld } from '@/timeline/chapters';
import { ChapterSection } from '@/ui/ChapterSection';
import { Faq } from '@/ui/Faq';
import { PricingTable } from '@/ui/PricingTable';
import { SiteFooter } from '@/ui/SiteFooter';
import { StepList } from '@/ui/StepList';

export const metadata: Metadata = { title: 'Websites' };

export default function WebsitesPage() {
  const [hero, features, pricing, faq] = getWorld('/websites').chapters;

  return (
    <>
      <ChapterSection chapter={hero} index={0} heading="h1" showLabel={false} large>
        <div className="reveal reveal-now">
          <p className="lede">{pageSubs['/websites']}</p>
        </div>
      </ChapterSection>
      <ChapterSection chapter={features} index={1}>
        <StepList items={websiteFeatures} chapterIndex={1} showAll />
      </ChapterSection>
      <ChapterSection chapter={pricing} index={2} bodyAbove>
        <PricingTable group={websitePricing} />
      </ChapterSection>
      <ChapterSection chapter={faq} index={3} after={<SiteFooter top="hero" />}>
        <Faq items={websiteFaqs} />
        <div className="reveal mt-5">
          <div>
            <Link href="/contact" className="btn-gold">
              Get Started →
            </Link>
          </div>
        </div>
      </ChapterSection>
    </>
  );
}
