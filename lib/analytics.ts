'use client';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props: Record<string, string> }) => void;
  }
}

export type AnalyticsProvider = 'ga4' | 'plausible' | null;

export function analyticsProvider(): AnalyticsProvider {
  const chosen = process.env.NEXT_PUBLIC_ANALYTICS;
  if (chosen === 'plausible' && process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) return 'plausible';
  if (chosen === 'ga4' && /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_ID ?? '')) return 'ga4';
  return null;
}

/** Sends an event if analytics is running. Doing nothing otherwise is the expected case. */
export function track(event: string, props: Record<string, string> = {}): void {
  window.plausible?.(event, { props });
  window.gtag?.('event', event, props);
}

function addScript(src: string, attributes: Record<string, string> = {}): void {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  Object.entries(attributes).forEach(([name, value]) => script.setAttribute(name, value));
  document.head.append(script);
}

/** Plausible sets no cookies, so it needs no consent and may start straight away. */
export function startPlausible(): void {
  window.plausible ??= (...args) => {
    ((window.plausible as unknown as { q: unknown[] }).q ??= []).push(args);
  };
  addScript('https://plausible.io/js/script.js', { 'data-domain': process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? '' });
}

/** Only ever called after the visitor accepts, so nothing reaches Google before that. */
export function startGoogleAnalytics(): void {
  if (window.gtag) return;
  const id = process.env.NEXT_PUBLIC_GA_ID ?? '';
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params -- gtag.js requires the arguments object itself.
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
  addScript(`https://www.googletagmanager.com/gtag/js?id=${id}`);
}
