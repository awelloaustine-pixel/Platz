'use client';

import { useEffect, useState } from 'react';
import { analyticsProvider, startGoogleAnalytics, startPlausible, track } from '@/lib/analytics';
import { readStored, writeStored } from '@/lib/storage';

const CONSENT_KEY = 'platinum.analytics';

/**
 * Starts whichever analytics is configured, and reports the actions that matter. The banner
 * only appears for Google Analytics, and until someone accepts, nothing is loaded at all.
 */
export function Analytics() {
  const provider = analyticsProvider();
  const [askConsent, setAskConsent] = useState(false);

  useEffect(() => {
    if (provider === 'plausible') startPlausible();
    if (provider !== 'ga4') return;
    const choice = readStored(CONSENT_KEY);
    if (choice === 'accepted') startGoogleAnalytics();
    const timer = setTimeout(() => setAskConsent(choice === null), 0);
    return () => clearTimeout(timer);
  }, [provider]);

  useEffect(() => {
    if (!provider) return;
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link) return;
      if (link.href.startsWith('https://wa.me/')) track('whatsapp_click');
      else if (link.matches('.btn-gold, .btn-ghost')) track('cta_click', { label: link.textContent?.trim() ?? '' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [provider]);

  if (!askConsent) return null;

  const decide = (choice: 'accepted' | 'declined') => {
    writeStored(CONSENT_KEY, choice);
    setAskConsent(false);
    if (choice === 'accepted') startGoogleAnalytics();
  };

  return (
    <div role="region" aria-label="Cookie choice" className="glass cookie-banner">
      <p className="text-sm">We use Google Analytics cookies to see which pages help people. It stays off unless you accept.</p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn-gold btn-small" onClick={() => decide('accepted')}>
          Accept
        </button>
        <button type="button" className="btn-ghost btn-small" onClick={() => decide('declined')}>
          Decline
        </button>
      </div>
    </div>
  );
}
