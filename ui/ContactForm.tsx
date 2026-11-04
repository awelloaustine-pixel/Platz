'use client';

import { type FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import { whatsappUrl } from '@/content/site';
import { track } from '@/lib/analytics';
import { normaliseKenyanPhone } from '@/lib/phone';
import { ui } from '@/timeline/store';

// Listed here rather than imported from lib/lead, which would pull zod into the browser.
const NEEDS = ['Website', 'WhatsApp Automations', 'AI Visibility', 'All of the above', 'Not sure'];

type Status = 'idle' | 'sending' | 'sent' | 'failed';
type Errors = Partial<Record<'name' | 'business' | 'phone' | 'email' | 'need', string>>;

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <label htmlFor={id} className="hud-text text-white/85">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}

const subscribeToNothing = () => () => {};

export function ContactForm() {
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Errors>({});
  const [from, setFrom] = useState<{ trade: string; area: string } | null>(null);

  // Read here, not during server rendering, so the page can stay static.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trade = params.get('trade')?.slice(0, 80);
    const area = params.get('area')?.slice(0, 80);
    if (!trade && !area) return;
    const timer = setTimeout(() => setFrom({ trade: trade ?? '', area: area ?? '' }), 0);
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;

    const found: Errors = {};
    if (!values.name?.trim()) found.name = 'Please enter your name.';
    if (!values.business?.trim()) found.business = 'Please enter your business name.';
    if (!normaliseKenyanPhone(values.phone ?? '')) found.phone = 'Enter a Kenyan number, such as 0712 345 678 or +254 712 345 678.';
    if (!/^\S+@\S+\.\S+$/.test(values.email ?? '')) found.email = 'Please enter a valid email address.';
    if (!values.need) found.need = 'Please choose one.';
    setErrors(found);
    const firstProblem = Object.keys(found)[0];
    if (firstProblem) {
      // By name, because React has not yet marked the fields as invalid at this point.
      (event.currentTarget.elements.namedItem(firstProblem) as HTMLElement | null)?.focus();
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setStatus('sent');
        track('form_submit', { need: values.need });
        ui.set({ leadPulse: ui.get().leadPulse + 1 });
        return;
      }
      const reply = (await response.json().catch(() => null)) as { fields?: Errors } | null;
      if (response.status === 400 && reply?.fields) {
        setErrors(reply.fields);
        setStatus('idle');
        return;
      }
      setStatus('failed');
    } catch {
      setStatus('failed');
    }
  };

  if (status === 'sent') {
    return (
      <div role="status" className="glass glass-card lead-captured">
        <p className="hud-text text-gold">LEAD CAPTURED ✓</p>
        <p className="mt-3 text-xl font-light tracking-tight">Thank you. We&apos;ll be in touch shortly.</p>
      </div>
    );
  }

  const describedBy = (field: keyof Errors) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="glass glass-card contact-form">
      <div className="form-grid">
        <Field id="name" label="Name" error={errors.name}>
          <input id="name" name="name" autoComplete="name" required maxLength={120} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} />
        </Field>
        <Field id="business" label="Business Name" error={errors.business}>
          <input id="business" name="business" autoComplete="organization" required maxLength={160} aria-invalid={Boolean(errors.business)} aria-describedby={describedBy('business')} />
        </Field>
        <Field id="phone" label="Phone" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="+254 7XX XXX XXX" aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy('phone')} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email')} />
        </Field>
        <Field id="need" label="What do you need help with?" error={errors.need}>
          <select id="need" name="need" required defaultValue="" aria-invalid={Boolean(errors.need)} aria-describedby={describedBy('need')}>
            <option value="" disabled>
              Choose one
            </option>
            {NEEDS.map((need) => (
              <option key={need}>{need}</option>
            ))}
          </select>
        </Field>
        {from && (
          <>
            <Field id="trade" label="Your trade">
              <input id="trade" name="trade" defaultValue={from.trade} maxLength={80} />
            </Field>
            <Field id="area" label="Your area">
              <input id="area" name="area" defaultValue={from.area} maxLength={80} />
            </Field>
          </>
        )}
      </div>

      {/* Bots fill in every field. People never see this one. */}
      <div aria-hidden="true" className="form-trap">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'failed' && (
        <p role="alert" className="form-error mt-3">
          Sorry, that didn&apos;t go through and your message was not sent. Please{' '}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">
            message us on WhatsApp
          </a>{' '}
          instead.
        </p>
      )}

      <button type="submit" className="btn-gold mt-4" disabled={!hydrated || status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send →'}
      </button>
      <p className="hud-text mt-3 text-white/80">We only use these details to reply to you.</p>
    </form>
  );
}
