import { z } from 'zod';
import { normaliseKenyanPhone } from './phone.ts';

export const NEEDS = ['Website', 'WhatsApp Automations', 'AI Visibility', 'All of the above', 'Not sure'] as const;

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const leadSchema = z.object({
  name: text(120),
  business: text(160),
  phone: z
    .string()
    .transform((value, context) => {
      const phone = normaliseKenyanPhone(value);
      if (!phone) {
        context.addIssue({ code: 'custom', message: 'Enter a Kenyan number, such as 0712 345 678 or +254 712 345 678.' });
        return z.NEVER;
      }
      return phone;
    }),
  email: z.string().trim().max(200).pipe(z.email()),
  need: z.enum(NEEDS),
  trade: optionalText(80),
  area: optionalText(80),
  /** Hidden from people. Only bots fill it in. */
  website: z.string().optional(),
});

export type Lead = z.infer<typeof leadSchema>;

export type DeliveryResult = 'sent' | 'not_configured' | 'failed';

type Env = Record<string, string | undefined>;

const TIMEOUT_MS = 10_000;

/** Stops a spreadsheet treating text a visitor typed as a formula, such as =HYPERLINK(...). */
export function safeForSheet(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function rows(lead: Lead): [string, string][] {
  return [
    ['Name', lead.name],
    ['Business', lead.business],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Needs help with', lead.need],
    ['Trade', lead.trade ?? ''],
    ['Area', lead.area ?? ''],
  ];
}

async function sendToSheet(lead: Lead, env: Env, send: typeof fetch): Promise<DeliveryResult> {
  const url = env.SHEETS_WEBHOOK_URL;
  if (!url) return 'not_configured';

  const response = await send(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      secret: env.SHEETS_WEBHOOK_SECRET ?? '',
      name: safeForSheet(lead.name),
      business: safeForSheet(lead.business),
      phone: safeForSheet(lead.phone),
      email: safeForSheet(lead.email),
      need: lead.need,
      trade: safeForSheet(lead.trade ?? ''),
      area: safeForSheet(lead.area ?? ''),
    }),
  });
  if (!response.ok) return 'failed';

  // Apps Script answers 200 even when its own code rejects a request, so read the answer.
  const reply = (await response.json().catch(() => null)) as { ok?: boolean } | null;
  return reply?.ok === true ? 'sent' : 'failed';
}

async function sendEmail(lead: Lead, env: Env, send: typeof fetch): Promise<DeliveryResult> {
  const { RESEND_API_KEY: key, LEAD_EMAIL_TO: to, LEAD_EMAIL_FROM: from } = env;
  if (!key || !to || !from) return 'not_configured';

  const response = await send('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      from,
      to,
      reply_to: lead.email,
      subject: `New lead: ${lead.business.replace(/[\r\n]+/g, ' ')}`,
      text: rows(lead).map(([label, value]) => `${label}: ${value}`).join('\n'),
      html: `<table>${rows(lead)
        .map(([label, value]) => `<tr><th align="left">${label}</th><td>${escapeHtml(value)}</td></tr>`)
        .join('')}</table>`,
    }),
  });
  return response.ok ? 'sent' : 'failed';
}

/** Delivers a lead to wherever LEAD_DESTINATION points. Google Sheets unless told otherwise. */
export async function deliverLead(lead: Lead, env: Env, send: typeof fetch = fetch): Promise<DeliveryResult> {
  try {
    return env.LEAD_DESTINATION === 'resend' ? await sendEmail(lead, env, send) : await sendToSheet(lead, env, send);
  } catch {
    return 'failed';
  }
}
