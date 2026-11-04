import type { Metadata } from 'next';
import Link from 'next/link';
import { pageSubs } from '@/content/copy';
import { automationFaqs } from '@/content/faqs';
import { automationPricing } from '@/content/pricing';
import { automationProblem, stations } from '@/content/services';
import { getWorld } from '@/timeline/chapters';
import { ChapterSection } from '@/ui/ChapterSection';
import { Faq } from '@/ui/Faq';
import { PricingTable } from '@/ui/PricingTable';
import { SiteFooter } from '@/ui/SiteFooter';
import { SplitReveal } from '@/ui/SplitReveal';
import { StepList } from '@/ui/StepList';

export const metadata: Metadata = { title: 'WhatsApp Automations' };

export default function AutomationsPage() {
  const [hero, problem, network, pricing, faq] = getWorld('/automations').chapters;

  return (
    <>
      <ChapterSection chapter={hero} index={0} heading="h1" showLabel={false} large>
        <div className="reveal reveal-now">
          <p className="lede">{pageSubs['/automations']}</p>
        </div>
      </ChapterSection>
      <ChapterSection chapter={problem} index={1} statement>
        <div className="reveal">
          <p className="statement-follow">
            <SplitReveal text={automationProblem[1]} />
          </p>
        </div>
      </ChapterSection>
      <ChapterSection chapter={network} index={2} bodyAbove>
        <StepList items={stations} chapterIndex={2} />
      </ChapterSection>
      <ChapterSection chapter={pricing} index={3} bodyAbove>
        <PricingTable group={automationPricing} />
      </ChapterSection>
      <ChapterSection chapter={faq} index={4} after={<SiteFooter top="hero" />}>
        <Faq items={automationFaqs} />
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
