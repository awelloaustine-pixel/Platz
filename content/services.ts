// Copy for the service pages. The demo chats only appear on the 3D phone: they illustrate
// each automation and are not real conversations.

export const websiteFeatures = [
  { title: 'Mobile-friendly design', body: '(most Kenyans browse on phones)' },
  { title: 'Fast loading', body: '(optimised for Kenyan internet speeds)' },
  { title: 'Google-optimised', body: '(shows up when people search)' },
  { title: 'AI-optimised', body: '(shows up when people ask ChatGPT, Gemini, etc.)' },
  { title: 'Contact forms and WhatsApp click-to-chat', body: '' },
  { title: 'Google Maps integration', body: '' },
  { title: 'Professional photos and content', body: '' },
] as const;

export const automationProblem = [
  'Right now, every missed call is a lost customer. Every slow reply is money walking away. Every forgotten follow-up is a deal you should have closed.',
  'What if your WhatsApp could handle all of that — instantly, 24/7, without you or your staff doing anything?',
] as const;

export interface ChatLine {
  from: 'business' | 'customer';
  text: string;
}

export const stations: readonly { title: string; body: string; chat: readonly ChatLine[] }[] = [
  {
    title: 'Missed Call WhatsApp-Back.',
    body: "Customer calls, you can't answer. Within 30 seconds, they get a personalised WhatsApp message: 'Hi, sorry I missed your call. How can I help?' They reply, you don't lose them.",
    chat: [
      { from: 'business', text: 'Hi, sorry I missed your call. How can I help?' },
      { from: 'customer', text: 'Do you have space on Saturday?' },
    ],
  },
  {
    title: 'Instant Lead Response.',
    body: "Someone enquires through your website, Facebook, or Google. Within 60 seconds, they get a WhatsApp message AND an email. Before they've even finished looking at your competitor.",
    chat: [
      { from: 'customer', text: 'I filled in your form. How much is a full service?' },
      { from: 'business', text: 'Thanks for reaching out! Here are our prices. When suits you?' },
    ],
  },
  {
    title: 'Review Collection.',
    body: 'After every job, your customer gets a friendly WhatsApp asking for a Google review. No awkward conversations. Your reviews grow on autopilot.',
    chat: [
      { from: 'business', text: 'Thanks for choosing us! Would you leave us a quick Google review?' },
      { from: 'customer', text: 'Of course, done!' },
    ],
  },
  {
    title: 'Appointment Reminders.',
    body: 'Customer books an appointment. They get a WhatsApp reminder 48 hours before and 2 hours before. They confirm with a simple YES reply. No-shows drop.',
    chat: [
      { from: 'business', text: 'Reminder: your appointment is at 10am on Thursday. Reply YES to confirm.' },
      { from: 'customer', text: 'YES' },
    ],
  },
  {
    title: 'No-Show Recovery.',
    body: "Someone doesn't show up? Within 30 minutes, they get a WhatsApp with a rebooking link. Most rebook on the spot.",
    chat: [
      { from: 'business', text: 'We missed you today! Pick a new time here: [booking link]' },
      { from: 'customer', text: 'Sorry! Booked for Monday.' },
    ],
  },
  {
    title: 'Quote Follow-Up.',
    body: 'You send a quote. On day 3, day 7, and day 14, the customer gets a follow-up WhatsApp — each one different, each one nudging them to say yes. Stops the moment they reply.',
    chat: [
      { from: 'business', text: 'Hi! Any questions about the quote we sent on Monday?' },
      { from: 'customer', text: "Looks good. Let's go ahead." },
    ],
  },
  {
    title: 'Invoice & Payment Chase (with M-Pesa).',
    body: 'Invoice overdue? Day 3: polite WhatsApp reminder. Day 7: firmer follow-up. Day 14: urgent chase. Includes M-Pesa payment link so they can pay right from WhatsApp.',
    chat: [
      { from: 'business', text: 'Your invoice is now 3 days overdue. Pay by M-Pesa here: [payment link]' },
      { from: 'customer', text: 'Paid, thank you.' },
    ],
  },
];

/** How many of the stations each pricing tier includes, in order. */
export const stationsPerTier = [3, 6, 7] as const;

export const aiProblem = [
  "Try it yourself. Open ChatGPT right now and ask: 'Who is the best [your trade] in [your area]?'",
  "If your name doesn't come up — but your competitor's does — you're losing customers to AI every single day. And it's only going to get worse.",
] as const;

export const aiSteps = [
  {
    title: 'AI Visibility Audit.',
    body: 'We test your business across every major AI platform — ChatGPT, Google Gemini, Claude, Perplexity, Siri. We find out if AI recommends you, who it recommends instead, and exactly why.',
  },
  {
    title: 'Google Business Profile Optimisation.',
    body: 'Your Google Business Profile is the #1 thing AI looks at. We complete every field, write a proper description, add photos, and make it easy for AI to read.',
  },
  {
    title: 'Directory Listings.',
    body: 'We list your business on every relevant online directory — with your name, address, and phone number exactly the same everywhere. Consistency = AI trusts you.',
  },
  {
    title: 'Review Generation.',
    body: 'AI heavily favours businesses with lots of recent, positive reviews. Our WhatsApp automation system collects Google reviews from your customers on autopilot.',
  },
  {
    title: 'Website AI Optimisation.',
    body: 'We add FAQ pages to your website that match exactly how people ask AI questions. We add invisible code (schema markup) that helps AI read your site like a menu.',
  },
  {
    title: 'Monthly Monitoring & Reporting.',
    body: "Every month, we re-test your AI visibility. You get a simple report: your score, which AI platforms recommend you, how many new reviews you got, and what we're working on next.",
  },
] as const;

export const demoTrades = [
  'dentist',
  'real estate agent',
  'hotel',
  'auto garage',
  'restaurant',
  'salon',
  'gym',
  'law firm',
  'cleaning service',
  'tutoring centre',
] as const;

export const demoAreas = [
  'Westlands',
  'Kilimani',
  'Karen',
  'CBD',
  'Kileleshwa',
  'Lavington',
  'Mombasa Road',
  'Mombasa',
  'Kisumu',
  'Nakuru',
] as const;

export const driftingQuestions = [
  "Who's the best dentist in Westlands?",
  'Where can I get my car serviced in Kilimani?',
  'Best salon near Lavington?',
] as const;
