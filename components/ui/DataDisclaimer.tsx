import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DataDisclaimerProps {
  /** Optional additional note to append */
  note?: string;
  /** Show as compact inline version */
  compact?: boolean;
}

/**
 * Renders a persistent data responsibility disclaimer.
 * Always shown on pages with market data — never fabricates information.
 */
export function DataDisclaimer({ note, compact = false }: DataDisclaimerProps) {
  if (compact) {
    return (
      <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
        <span style={{ color: '#fbbf24' }}>⚠</span>{' '}
        Data may be delayed or simulated when offline. Not financial advice.
        {note && ` ${note}`}
      </p>
    );
  }

  return (
    <div
      className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs font-mono"
      style={{
        background: 'rgba(251,191,36,0.04)',
        border: '1px solid rgba(251,191,36,0.15)',
        color: 'var(--text-muted)',
      }}
      role="note"
      aria-label="Data disclaimer"
    >
      <AlertTriangle
        className="w-3.5 h-3.5 shrink-0 mt-0.5"
        style={{ color: '#fbbf24' }}
        aria-hidden="true"
      />
      <span style={{ lineHeight: '1.6' }}>
        Market data is supplied by the ORION engine and third-party sources. It may be delayed;
        when the live connection is unavailable, the interface displays clearly labelled simulated data.
        {note && ` ${note}`}{' '}
        <strong className="text-white font-bold">
          Nothing on this platform constitutes financial advice.
        </strong>{' '}
        Always consult a qualified financial professional before making investment decisions.
      </span>
    </div>
  );
}
