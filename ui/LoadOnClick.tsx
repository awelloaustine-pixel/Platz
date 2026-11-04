'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';

interface LoadOnClickProps {
  src: string;
  title: string;
  buttonLabel: string;
  className: string;
  /** Reports a booking when the embed is Calendly. */
  calendly?: boolean;
}

/** Calendly's own embed script sends these, and they ask it to report bookings to the page. */
function withCalendlyEmbedDetails(src: string): string {
  const url = new URL(src);
  url.searchParams.set('embed_type', 'Inline');
  url.searchParams.set('embed_domain', window.location.hostname);
  return url.toString();
}

/**
 * A third-party embed that only loads when asked for. Each one brings megabytes of script and
 * its own cookies, which would otherwise be charged to every visitor on mobile data.
 */
export function LoadOnClick({ src, title, buttonLabel, className, calendly = false }: LoadOnClickProps) {
  const [frameSrc, setFrameSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!calendly || !frameSrc) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://calendly.com') return;
      if ((event.data as { event?: string } | null)?.event === 'calendly.event_scheduled') track('calendly_booked');
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [calendly, frameSrc]);

  if (!frameSrc) {
    return (
      <button type="button" className="btn-ghost" onClick={() => setFrameSrc(calendly ? withCalendlyEmbedDetails(src) : src)}>
        {buttonLabel}
      </button>
    );
  }
  return <iframe src={frameSrc} title={title} className={className} referrerPolicy="no-referrer-when-downgrade" />;
}
