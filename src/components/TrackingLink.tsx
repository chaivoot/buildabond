'use client';

import { useState } from 'react';
import { trackingLink } from '../lib/carriers';

/**
 * Tracking number with a button that copies it and opens the carrier's tracking page
 * (with the number in the link where the carrier supports it).
 */
export function TrackingLink({ carrier, tracking, labels }: {
  carrier: string;
  tracking: string;
  labels: { check: (carrier: string) => string; copied: string; copy: string };
}) {
  const [copied, setCopied] = useState(false);
  const link = trackingLink(carrier, tracking);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tracking);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked: the number is still shown to copy by hand */
    }
  };
  return (
    <span className="tracking-link">
      <span>{carrier} · <strong className="tracking-link__no">{tracking}</strong></span>
      <span className="tracking-link__actions">
        {link ? (
          <a className="btn btn--primary btn--sm" href={link.url} target="_blank" rel="noopener noreferrer" onClick={copy}>
            {labels.check(carrier)} ↗
          </a>
        ) : null}
        <button type="button" className="text-btn text-btn--link" onClick={copy}>{copied ? labels.copied : labels.copy}</button>
      </span>
    </span>
  );
}
