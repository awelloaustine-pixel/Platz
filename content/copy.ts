// Page copy. Headlines live in timeline/chapters.ts next to the shot they belong to.

export const TAGLINES = {
  a: 'More Customers. Less Stress. All Automated.',
  b: 'We Bring You Customers While You Run Your Business.',
} as const;

/** The A/B switch for the hero tagline: set to 'a' or 'b'. */
export const taglineVariant: keyof typeof TAGLINES = 'a';

export const heroCopy = {
  eyebrow: 'PLATINUM MARKETING AGENCY / NAIROBI',
  sub: 'We build websites, automate your WhatsApp, and make sure AI recommends you — so customers find you first.',
  primaryCta: { label: 'Get a Free AI Visibility Check →', href: '/contact' },
  secondaryCta: { label: 'See Our Services ↓', href: '#system' },
} as const;

export const problemPoints = [
  {
    icon: 'search',
    title: "Customers can't find you online.",
    body: "No website, or a website that doesn't show up anywhere.",
  },
  {
    icon: 'phone',
    title: "You're missing calls and enquiries.",
    body: 'Leads come in, nobody responds fast enough, they go to someone else.',
  },
  {
    icon: 'spark',
    title: "AI doesn't know you exist.",
    body: "When customers ask ChatGPT or Google AI for recommendations, your name doesn't come up.",
  },
] as const;

export const services = [
  {
    icon: 'monitor',
    name: 'WEBSITES',
    line: 'Professional websites that actually bring you customers.',
    body: 'We build fast, mobile-friendly websites designed to show up on Google and AI search. Not just a digital business card — a lead-generating machine.',
    href: '/websites',
  },
  {
    icon: 'message',
    name: 'WHATSAPP AUTOMATIONS',
    line: 'Never miss a customer again.',
    body: 'Automated WhatsApp replies to missed calls, instant responses to enquiries, appointment reminders, review collection, quote follow-ups, and payment chasing — all running 24/7 without you lifting a finger.',
    href: '/automations',
  },
  {
    icon: 'spark',
    name: 'AI VISIBILITY (GEO)',
    line: 'Get recommended by AI.',
    body: "When customers ask ChatGPT, Google AI, or Siri 'Who's the best [your trade] in [your area]?' — we make sure your business is the answer.",
    href: '/ai-visibility',
  },
] as const;

export const howSteps = [
  {
    title: 'We audit your business.',
    body: 'Free AI visibility check. We test how your business shows up across AI platforms and online.',
  },
  {
    title: 'We build your systems.',
    body: 'Website, automations, AI visibility — whatever you need, we set it up and get it running.',
  },
  {
    title: 'You get more customers.',
    body: 'Leads come in automatically. Enquiries get answered instantly. You focus on doing your work.',
  },
] as const;

export const industries = [
  { icon: 'tooth', name: 'Clinics & Dentists' },
  { icon: 'key', name: 'Real Estate Agents' },
  { icon: 'bed', name: 'Hotels & Airbnbs' },
  { icon: 'wrench', name: 'Auto Garages' },
  { icon: 'plate', name: 'Restaurants' },
  { icon: 'scissors', name: 'Salons & Barbershops' },
  { icon: 'dumbbell', name: 'Gyms & Fitness Studios' },
  { icon: 'scale', name: 'Law Firms' },
  { icon: 'sparkle', name: 'Cleaning Services' },
  { icon: 'book', name: 'Tutoring Centres' },
] as const;

export const beginCopy = {
  body: "Book a free 10-minute AI Visibility Check. We'll show you exactly how your business shows up on AI — and what you're missing.",
  primaryCta: { label: 'Book Your Free Check →', href: '/contact' },
  whatsappLabel: 'Chat on WhatsApp',
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
