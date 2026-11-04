import type { Metadata } from 'next';
import { site } from '@/content/site';

const PAGES: Record<string, { title: string; description: string; image: string }> = {
  '/': {
    title: `${site.name} | Websites, WhatsApp Automation & AI Visibility in Kenya`,
    description:
      'We build websites, automate your WhatsApp, and make sure AI recommends you — so customers find you first. For Kenyan service businesses.',
    image: 'home',
  },
  '/websites': {
    title: 'Websites for Kenyan Businesses',
    description:
      'Fast, mobile-friendly websites built to show up on Google and AI search, with WhatsApp click-to-chat. Packages from KSh 80,000.',
    image: 'websites',
  },
  '/automations': {
    title: 'WhatsApp Automations for Kenyan Businesses',
    description:
      'Missed calls answered, leads followed up, reviews collected, appointments confirmed and invoices chased with M-Pesa. All through WhatsApp.',
    image: 'automations',
  },
  '/ai-visibility': {
    title: 'AI Visibility (GEO) in Kenya',
    description:
      "When customers ask ChatGPT, Google AI or Siri who's best near them, we make sure they hear your name. Get a free AI Visibility Check.",
    image: 'ai-visibility',
  },
  '/pricing': {
    title: 'Pricing',
    description:
      'Simple, transparent pricing in Kenyan Shillings for websites, WhatsApp automations and AI visibility. No hidden fees. No long contracts.',
    image: 'pricing',
  },
  '/about': {
    title: 'About',
    description:
      'Platinum Marketing Agency helps Kenyan service businesses win online: websites that get found, WhatsApp automations and AI visibility.',
    image: 'about',
  },
  '/contact': {
    title: 'Contact',
    description:
      'Book a free 10-minute AI Visibility Check. See exactly how your business shows up on AI and what you are missing. No charge, no commitment.',
    image: 'contact',
  },
};

export function pageMetadata(path: string): Metadata {
  const { title, description, image } = PAGES[path];
  const images = [{ url: `/og/${image}.jpg`, width: 1200, height: 630, alt: `${site.name}: ${title}` }];

  return {
    // The home title is complete already, so it skips the "| Platinum" template.
    title: path === '/' ? { absolute: title } : title,
    description,
    alternates: { canonical: path, languages: { 'en-KE': path } },
    openGraph: { title, description, url: path, siteName: site.name, locale: 'en_KE', type: 'website', images },
    twitter: { card: 'summary_large_image', title, description, images: images.map(({ url }) => url) },
  };
}

export const SITEMAP_PATHS = Object.keys(PAGES);
