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
} as const;

export const whatsappUrl = `https://wa.me/${site.whatsappNumber}`;

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
