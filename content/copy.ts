// Page copy. Headlines live in timeline/chapters.ts next to the shot they belong to;
// everything else on a page is added here as each build step reaches it.

export const heroCopy = {
  eyebrow: 'PLATINUM MARKETING AGENCY / NAIROBI',
  sub: 'We build websites, automate your WhatsApp, and make sure AI recommends you — so customers find you first.',
  primaryCta: { label: 'Get a Free AI Visibility Check →', href: '/contact' },
  secondaryCta: { label: 'See Our Services ↓', href: '#system' },
} as const;

export const pageSubs: Record<string, string> = {
  '/websites': 'Not just something that looks nice — a website that gets found, captures leads, and pays for itself.',
  '/automations':
    'Missed calls answered. Leads followed up. Reviews collected. Appointments confirmed. Invoices chased. All through WhatsApp. All automatic.',
  '/ai-visibility':
    "More people are asking ChatGPT, Google AI, and Siri 'Who's the best [business] near me?' We make sure they hear your name.",
  '/pricing': 'No hidden fees. No long contracts. Cancel anytime.',
  '/contact':
    "Book a free 10-minute AI Visibility Check. We'll show you exactly how your business shows up on AI — and what you're missing. No charge, no commitment.",
};
