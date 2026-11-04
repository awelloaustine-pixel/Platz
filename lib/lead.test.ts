import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deliverLead, escapeHtml, leadSchema, safeForSheet } from './lead.ts';
import { normaliseKenyanPhone } from './phone.ts';

const valid = {
  name: 'Wanjiru',
  business: 'Smile Dental',
  phone: '0712 345 678',
  email: 'hello@example.co.ke',
  need: 'Website',
};
const lead = leadSchema.parse(valid);

test('every common way of writing a Kenyan number is accepted', () => {
  for (const input of ['0712345678', '0712 345 678', '+254712345678', '254712345678', '+254 712 345 678', '0110-123-456']) {
    assert.match(normaliseKenyanPhone(input) ?? '', /^\+254[17]\d{8}$/, input);
  }
});

test('numbers that are not Kenyan or the wrong length are rejected', () => {
  for (const input of ['712345678', '+255712345678', '071234567', '07123456789', '0212345678', 'call me', '']) {
    assert.equal(normaliseKenyanPhone(input), null, input);
  }
});

test('a valid lead parses with the phone normalised', () => {
  assert.equal(lead.phone, '+254712345678');
});

test('invalid leads are rejected on the right field', () => {
  const fieldOf = (input: object) => leadSchema.safeParse({ ...valid, ...input }).error?.issues[0].path[0];
  assert.equal(fieldOf({ phone: '12345' }), 'phone');
  assert.equal(fieldOf({ email: 'not-an-email' }), 'email');
  assert.equal(fieldOf({ name: '   ' }), 'name');
  assert.equal(fieldOf({ need: 'Something else' }), 'need');
  assert.equal(fieldOf({ business: 'x'.repeat(161) }), 'business');
});

test('spreadsheet formulas are neutralised', () => {
  assert.equal(safeForSheet('=HYPERLINK("http://evil")'), `'=HYPERLINK("http://evil")`);
  assert.equal(safeForSheet('+254712345678'), `'+254712345678`);
  assert.equal(safeForSheet('@cmd'), `'@cmd`);
  assert.equal(safeForSheet('Smile Dental'), 'Smile Dental');
});

test('HTML in a lead is escaped for email', () => {
  assert.equal(escapeHtml('<img src=x onerror="a">'), '&lt;img src=x onerror=&quot;a&quot;&gt;');
});

const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

test('with nothing configured it reports that and sends nothing', async () => {
  let called = false;
  const send = (async () => {
    called = true;
    return reply({ ok: true });
  }) as typeof fetch;
  assert.equal(await deliverLead(lead, {}, send), 'not_configured');
  assert.equal(await deliverLead(lead, { LEAD_DESTINATION: 'resend' }, send), 'not_configured');
  assert.equal(called, false);
});

test('Sheets is the default and carries the secret and the lead', async () => {
  let sent: { url: string; body: Record<string, string> } | undefined;
  const send = (async (url: string, init: RequestInit) => {
    sent = { url, body: JSON.parse(String(init.body)) };
    return reply({ ok: true });
  }) as unknown as typeof fetch;
  const result = await deliverLead(lead, { SHEETS_WEBHOOK_URL: 'https://hook.test', SHEETS_WEBHOOK_SECRET: 's3' }, send);
  assert.equal(result, 'sent');
  assert.equal(sent?.url, 'https://hook.test');
  assert.equal(sent?.body.secret, 's3');
  assert.equal(sent?.body.business, 'Smile Dental');
});

test('a sheet that answers 200 but rejects the lead counts as failed', async () => {
  const env = { SHEETS_WEBHOOK_URL: 'https://hook.test' };
  assert.equal(await deliverLead(lead, env, (async () => reply({ ok: false })) as typeof fetch), 'failed');
  assert.equal(await deliverLead(lead, env, (async () => new Response('<html>')) as typeof fetch), 'failed');
  assert.equal(await deliverLead(lead, env, (async () => reply({}, 500)) as typeof fetch), 'failed');
});

test('a network failure counts as failed rather than throwing', async () => {
  const send = (async () => {
    throw new Error('offline');
  }) as typeof fetch;
  assert.equal(await deliverLead(lead, { SHEETS_WEBHOOK_URL: 'https://hook.test' }, send), 'failed');
});

test('Resend is used when chosen, with the key and a clean subject line', async () => {
  let init: RequestInit | undefined;
  const send = (async (_url: string, options: RequestInit) => {
    init = options;
    return reply({ id: '1' });
  }) as unknown as typeof fetch;
  const env = { LEAD_DESTINATION: 'resend', RESEND_API_KEY: 'k', LEAD_EMAIL_TO: 'a@b.ke', LEAD_EMAIL_FROM: 'c@d.ke' };
  const injected = leadSchema.parse({ ...valid, business: 'Smile\r\nBcc: x@y.z' });
  assert.equal(await deliverLead(injected, env, send), 'sent');
  assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer k');
  assert.doesNotMatch(JSON.parse(String(init?.body)).subject, /[\r\n]/);
});
