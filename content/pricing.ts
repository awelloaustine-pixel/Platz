// The one source of truth for every price on the site. All amounts are in Kenyan Shillings.

export interface PriceTier {
  name: string;
  included: string;
  /** The one-off amount, labelled by the group's oneOffLabel. */
  oneOff: string;
  monthly: string;
}

export interface PriceGroup {
  id: 'websites' | 'automations' | 'ai';
  lane: string;
  oneOffLabel: 'One-off' | 'Setup';
  tiers: readonly [PriceTier, PriceTier, PriceTier];
  note?: string;
}

export const websitePricing: PriceGroup = {
  id: 'websites',
  lane: 'Websites',
  oneOffLabel: 'One-off',
  tiers: [
    {
      name: 'Starter',
      included: '5-page website, mobile-ready, contact form, Google Maps, basic SEO',
      oneOff: 'KSh 80,000',
      monthly: 'KSh 5,000/month',
    },
    {
      name: 'Growth',
      included: '8–12 pages, blog, advanced SEO, WhatsApp integration, Google Business Profile setup',
      oneOff: 'KSh 150,000',
      monthly: 'KSh 10,000/month',
    },
    {
      name: 'Premium',
      included: '15+ pages, custom design, animations, multilingual (English/Swahili), booking system, M-Pesa integration',
      oneOff: 'KSh 250,000+',
      monthly: 'KSh 15,000/month',
    },
  ],
  note: 'All prices are in Kenyan Shillings. Setup is a one-off payment. Monthly maintenance covers hosting, security updates, content changes, and ongoing support.',
};

export const automationPricing: PriceGroup = {
  id: 'automations',
  lane: 'WhatsApp Automations',
  oneOffLabel: 'Setup',
  tiers: [
    {
      name: 'Starter',
      included: 'Missed Call WhatsApp-Back, Instant Lead Response, Review Collection',
      oneOff: 'KSh 30,000',
      monthly: 'KSh 15,000/month',
    },
    {
      name: 'Growth',
      included: 'Everything in Starter + Appointment Reminders, No-Show Recovery, Quote Follow-Up, Repeat Business Follow-Up',
      oneOff: 'KSh 50,000',
      monthly: 'KSh 25,000/month',
    },
    {
      name: 'Full System',
      included: 'Everything in Growth + Invoice/Payment Chase with M-Pesa + GEO + Monthly Reporting',
      oneOff: 'KSh 80,000',
      monthly: 'KSh 40,000/month',
    },
  ],
  note: 'Tool costs (WhatsApp Business API, automation platform) are approximately KSh 6,000–7,000/month on top — paid by you directly, we set it all up.',
};

export const aiPricing: PriceGroup = {
  id: 'ai',
  lane: 'AI Visibility',
  oneOffLabel: 'Setup',
  tiers: [
    {
      name: 'AI Starter',
      included: 'AI Audit + Google Business Profile Optimisation + 10 Directory Listings + Monthly Monitoring',
      oneOff: 'KSh 25,000',
      monthly: 'KSh 10,000/month',
    },
    {
      name: 'AI Growth',
      included: 'Everything in Starter + Full Directory Blitz + Automated Review Collection + FAQ Pages',
      oneOff: 'KSh 40,000',
      monthly: 'KSh 18,000/month',
    },
    {
      name: 'AI Full System',
      included: 'Everything in Growth + Schema Markup + Full Website AI Optimisation + Competitor Tracking',
      oneOff: 'KSh 60,000',
      monthly: 'KSh 28,000/month',
    },
  ],
};

export const allPricing = [websitePricing, automationPricing, aiPricing] as const;

export const bundleOffer = 'Get a website + any automation package together and save KSh 10,000–20,000 on setup.';
