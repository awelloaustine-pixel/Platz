import type { Metadata } from 'next';
import { pageSubs } from '@/content/copy';
import { site, whatsappUrl } from '@/content/site';
import { getWorld } from '@/timeline/chapters';
import { ChapterSection } from '@/ui/ChapterSection';
import { GlassCard } from '@/ui/GlassCard';
import { SiteFooter } from '@/ui/SiteFooter';

export const metadata: Metadata = { title: 'Contact' };

/** The booking calendar, form and map are wired up in step 6. */
export default function ContactPage() {
  const [hero] = getWorld('/contact').chapters;

  return (
    <ChapterSection chapter={hero} index={0} heading="h1" showLabel={false} large after={<SiteFooter top="hero" />}>
      <div className="reveal reveal-now">
        <p className="lede">{pageSubs['/contact']}</p>
        <div className="mt-6">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
            Chat on WhatsApp →
          </a>
        </div>
        <GlassCard className="contact-details">
          <p>
            <a className="text-link" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
          <p>
            <a className="text-link" href={`tel:${site.phone.replace(/\s/g, '')}`}>
              {site.phone}
            </a>
          </p>
          <p className="text-sm text-white/85">Nairobi, Kenya — we work remotely</p>
        </GlassCard>
      </div>
    </ChapterSection>
  );
}
