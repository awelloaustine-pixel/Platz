// Site-wide facts. Everything a non-developer may need to change lives in content/.

export const site = {
  name: 'Platinum Marketing Agency',
  shortName: 'Platinum',
  location: 'Nairobi, Kenya',
  // PLACEHOLDER — Victor to supply: final domain (.co.ke vs .com)
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://platinummarketingagency.co.ke',
  // PLACEHOLDER — Victor to supply: WhatsApp Business number, digits only with country code
  whatsappNumber: '254700000000',
  // PLACEHOLDER — Victor to supply: business email and Kenya phone number
  email: 'hello@platinummarketingagency.co.ke',
  phone: '+254 700 000 000',
  // PLACEHOLDER — Victor to supply: links to the business's real social profiles
  sameAs: [] as string[],
};

export const whatsappUrl = `https://wa.me/${site.whatsappNumber}`;

// PLACEHOLDER — Victor to supply: NEXT_PUBLIC_CALENDLY_URL
function calendlyUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_CALENDLY_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'calendly.com') return null;
    url.searchParams.set('hide_gdpr_banner', '1');
    return url.toString();
  } catch {
    return null;
  }
}

export const calendlyEmbedUrl = calendlyUrl();
export const mapEmbedUrl = 'https://www.google.com/maps?q=Nairobi%2C%20Kenya&output=embed';

export const footerLinks = {
  Services: [
    { href: '/websites', label: 'Websites' },
    { href: '/automations', label: 'WhatsApp Automations' },
    { href: '/ai-visibility', label: 'AI Visibility' },
    { href: '/pricing', label: 'Pricing' },
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
} as const;

export const nav = [
  { href: '/websites', label: 'Websites' },
  { href: '/automations', label: 'Automations' },
  { href: '/ai-visibility', label: 'AI Visibility' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;
