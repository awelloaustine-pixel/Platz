import { pageSubs } from '@/content/copy';
import { calendlyEmbedUrl, mapEmbedUrl, site, whatsappUrl } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema } from '@/lib/schema';
import { getWorld } from '@/timeline/chapters';
import { ChapterSection } from '@/ui/ChapterSection';
import { ContactForm } from '@/ui/ContactForm';
import { GlassCard } from '@/ui/GlassCard';
import { JsonLd } from '@/ui/JsonLd';
import { LoadOnClick } from '@/ui/LoadOnClick';
import { SiteFooter } from '@/ui/SiteFooter';

export const metadata = pageMetadata('/contact');

export default function ContactPage() {
  const [hero, enquire] = getWorld('/contact').chapters;

  return (
    <>
      <JsonLd data={breadcrumbSchema('/contact', 'Contact')} />
      <ChapterSection chapter={hero} index={0} heading="h1" showLabel={false} large>
        <div className="reveal reveal-now">
          <p className="lede">{pageSubs['/contact']}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
              Chat on WhatsApp →
            </a>
          </div>
        </div>
      </ChapterSection>
      <ChapterSection chapter={enquire} index={1} after={<SiteFooter top="hero" />}>
        <div className="contact-grid">
          <ContactForm />
          <div className="contact-side">
            <GlassCard>
              <h3 className="hud-text text-gold">Book a free 10-minute check</h3>
              <div className="mt-3">
                {calendlyEmbedUrl ? (
                  <LoadOnClick calendly src={calendlyEmbedUrl} title="Book a call on Calendly" buttonLabel="Choose a time" className="calendly-frame" />
                ) : (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    Book on WhatsApp
                  </a>
                )}
              </div>
            </GlassCard>
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
              <div className="mt-2">
                <LoadOnClick src={mapEmbedUrl} title="Map of Nairobi, Kenya" buttonLabel="Show map" className="map-frame" />
              </div>
            </GlassCard>
          </div>
        </div>
      </ChapterSection>
    </>
  );
}
