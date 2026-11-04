import { NextResponse } from 'next/server';
import { deliverLead, leadSchema } from '@/lib/lead';

const MAX_BODY_BYTES = 10_000;

export async function POST(request: Request) {
  const raw = await request.text().catch(() => '');
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
    return NextResponse.json({ ok: false, error: 'invalid', fields }, { status: 400 });
  }

  // A filled honeypot is a bot. Look successful so that it does not try again.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const result = await deliverLead(parsed.data, process.env);
  if (result === 'sent') return NextResponse.json({ ok: true });

  // Never tell a visitor they got through when they did not: the form offers WhatsApp instead.
  console.error(`Lead not delivered: ${result}`);
  return NextResponse.json({ ok: false, error: result }, { status: result === 'not_configured' ? 503 : 502 });
}
