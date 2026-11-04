import type { Metadata } from 'next';
import Link from 'next/link';
import { pageSubs } from '@/content/copy';
import { aiPricing } from '@/content/pricing';
import { aiProblem, aiSteps, driftingQuestions } from '@/content/services';
import { getWorld } from '@/timeline/chapters';
import { ChapterSection } from '@/ui/ChapterSection';
import { OracleDemo } from '@/ui/OracleDemo';
import { OracleOrbLabel } from '@/ui/OracleOrbLabel';
import { PricingTable } from '@/ui/PricingTable';
import { SiteFooter } from '@/ui/SiteFooter';
import { SplitReveal } from '@/ui/SplitReveal';
import { StepList } from '@/ui/StepList';

export const metadata: Metadata = { title: 'AI Visibility' };

const QUESTION_POINTS = ['-3.4,2.6,1', '0.2,3.5,0', '-5.4,1.2,0'];

export default function AiVisibilityPage() {
  const [hero, problem, demo, steps, pricing] = getWorld('/ai-visibility').chapters;

  return (
    <>
      <ChapterSection
        chapter={hero}
        index={0}
        heading="h1"
        showLabel={false}
        large
        after={
          <div aria-hidden="true">
            {driftingQuestions.map((question, index) => (
              <span key={question} className="anchored scene-label drifting-question" data-point={QUESTION_POINTS[index]}>
                <span>{question}</span>
              </span>
            ))}
            <span className="anchored scene-label pin-label" data-point="2.8,-1.75,1.5">
              Your Business
            </span>
          </div>
        }
      >
        <div className="reveal reveal-now">
          <p className="lede">{pageSubs['/ai-visibility']}</p>
        </div>
      </ChapterSection>
      <ChapterSection chapter={problem} index={1} statement>
        <div className="reveal">
          <p className="statement-follow">
            <SplitReveal text={aiProblem[1]} />
          </p>
        </div>
      </ChapterSection>
      <ChapterSection chapter={demo} index={2} after={<OracleOrbLabel />}>
        <OracleDemo />
      </ChapterSection>
      <ChapterSection chapter={steps} index={3} bodyAbove>
        <StepList items={aiSteps} chapterIndex={3} />
      </ChapterSection>
      <ChapterSection chapter={pricing} index={4} bodyAbove after={<SiteFooter top="hero" />}>
        <PricingTable group={aiPricing} />
        <div className="reveal mt-5">
          <div>
            <Link href="/contact" className="btn-gold">
              Get Your Free AI Visibility Check →
            </Link>
          </div>
        </div>
      </ChapterSection>
    </>
  );
}
