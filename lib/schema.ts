// JSON-LD builders: the structured data that lets Google and AI assistants read the site.
// Relative imports keep this runnable by the unit tests. There is deliberately no rating or
// review markup: that may only describe real reviews, and there are none on the site yet.
import type { Faq } from '../content/faqs.ts';
import type { PriceGroup } from '../content/pricing.ts';
import { site } from '../content/site.ts';

const absolute = (path: string) => new URL(path, site.url).toString();

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absolute('/#organization'),
    name: site.name,
    url: site.url,
    logo: absolute('/logo.svg'),
    sameAs: site.sameAs,
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': absolute('/#business'),
    name: site.name,
    url: site.url,
    image: absolute('/og/home.jpg'),
    telephone: site.phone.replace(/\s/g, ''),
    email: site.email,
    address: { '@type': 'PostalAddress', addressLocality: 'Nairobi', addressCountry: 'KE' },
    areaServed: { '@type': 'Country', name: 'Kenya' },
    priceRange: 'KSh',
  };
}

/** "KSh 250,000+" becomes 250000. */
export function priceValue(price: string): number {
  return Number(price.replace(/[^\d]/g, ''));
}

function offerFor(group: PriceGroup, tier: PriceGroup['tiers'][number], path: string) {
  const oneOff = priceValue(tier.oneOff);
  return {
    '@type': 'Offer',
    name: tier.name,
    description: tier.included,
    url: absolute(path),
    priceCurrency: 'KES',
    priceSpecification: [
      {
        '@type': 'PriceSpecification',
        name: group.oneOffLabel,
        priceCurrency: 'KES',
        // A "+" price is a starting point, not an exact amount.
        ...(tier.oneOff.includes('+') ? { minPrice: oneOff } : { price: oneOff }),
      },
      {
        '@type': 'UnitPriceSpecification',
        name: 'Monthly',
        priceCurrency: 'KES',
        price: priceValue(tier.monthly),
        unitCode: 'MON',
      },
    ],
  };
}

export function serviceSchema(name: string, description: string, group: PriceGroup, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: absolute(path),
    provider: { '@id': absolute('/#business') },
    areaServed: { '@type': 'Country', name: 'Kenya' },
    offers: group.tiers.map((tier) => offerFor(group, tier, path)),
  };
}

export function faqSchema(items: readonly Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

export function breadcrumbSchema(path: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absolute('/') },
      { '@type': 'ListItem', position: 2, name, item: absolute(path) },
    ],
  };
}

/** Escapes "<" so that no value can ever close the script tag it sits in. */
export function serialiseJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
