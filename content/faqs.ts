export interface Faq {
  question: string;
  answer: string;
}

export const websiteFaqs: readonly Faq[] = [
  { question: 'How long does it take to build?', answer: 'Starter: 1–2 weeks. Growth: 2–3 weeks. Premium: 3–5 weeks.' },
  {
    question: 'Do I need to provide content?',
    answer: "We handle everything. We'll ask you some questions about your business and take it from there. If you have photos, great. If not, we'll sort it.",
  },
  { question: 'Can I update it myself?', answer: "Yes, we'll show you how. Or we handle it for you on the monthly plan." },
  {
    question: 'What if I already have a website?',
    answer: "We'll audit it for free and tell you honestly if it needs rebuilding or just optimising.",
  },
];

export const automationFaqs: readonly Faq[] = [
  {
    question: 'Do I need a special WhatsApp number?',
    answer: 'We set you up with the WhatsApp Business API. You can use your existing business number.',
  },
  {
    question: 'Will it sound robotic?',
    answer: "No. Every message is written by AI to sound natural and personal. Customers won't know it's automated.",
  },
  {
    question: 'What if a customer needs a real person?',
    answer: 'The system hands over to you or your staff the moment a customer needs human help. You see everything in one inbox.',
  },
  {
    question: "Can I see what's being sent?",
    answer: 'Yes. Every message is logged. You get a dashboard showing every lead, every reply, every follow-up.',
  },
];
