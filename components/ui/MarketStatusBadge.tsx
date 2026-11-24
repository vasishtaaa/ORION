'use client';
import React from 'react';
import { Clock } from 'lucide-react';

type MarketPhase = 'pre-market' | 'open' | 'after-hours' | 'closed' | 'weekend';

function getMarketPhase(): MarketPhase {
  // NSE/BSE trading hours: Mon–Fri 09:15–15:30 IST (UTC+5:30)
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 6=Sat
  const hIST = now.getUTCHours() + 5;
  const mIST = now.getUTCMinutes() + 30;
  // Normalise overflow
  const totalMinIST = hIST * 60 + mIST;
  const normalised = ((totalMinIST % (24 * 60)) + 24 * 60) % (24 * 60);

  if (day === 0 || day === 6) return 'weekend';
  if (normalised < 9 * 60)            return 'closed';       // before 09:00
  if (normalised < 9 * 60 + 15)       return 'pre-market';   // 09:00–09:15
  if (normalised <= 15 * 60 + 30)     return 'open';         // 09:15–15:30
  if (normalised <= 16 * 60)          return 'after-hours';  // 15:30–16:00
  return 'closed';
}

const PHASE_CONFIG: Record<MarketPhase, {
  label: string; dot: string; text: string; bg: string; border: string;
}> = {
  open:        { label: 'Market Open',     dot: '#10b981', text: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)' },
  'pre-market':{ label: 'Pre-Market',      dot: '#fbbf24', text: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.3)' },
  'after-hours':{ label: 'After-Hours',   dot: '#818cf8', text: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.3)' },
  closed:      { label: 'Market Closed',   dot: '#ef4444', text: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.3)'  },
  weekend:     { label: 'Weekend — Closed',dot: '#6b7280', text: '#6b7280', bg: 'rgba(107,114,128,0.08)',border: 'rgba(107,114,128,0.3)'},
};

interface MarketStatusBadgeProps {
  /** Size variant */
  size?: 'sm' | 'md';
  /** Optionally show IST time alongside */
  showTime?: boolean;
}

export function MarketStatusBadge({ size = 'md', showTime = false }: MarketStatusBadgeProps) {
  const [phase, setPhase] = React.useState<MarketPhase>(getMarketPhase());
  const [time, setTime] = React.useState('');

  React.useEffect(() => {
    const update = () => {
      setPhase(getMarketPhase());
      if (showTime) {
        const now = new Date();
        setTime(
          now.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }) + ' IST'
        );
      }
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [showTime]);

  const cfg = PHASE_CONFIG[phase];
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';
  const px = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold uppercase tracking-widest ${textSize} ${px}`}
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}
      role="status"
      aria-label={`NSE/BSE ${cfg.label}`}
    >
      <span
        className={`rounded-full shrink-0 ${phase === 'open' ? 'animate-pulse' : ''}`}
        style={{ width: 6, height: 6, background: cfg.dot, display: 'inline-block' }}
        aria-hidden="true"
      />
      {cfg.label}
      {showTime && time && (
        <span className="flex items-center gap-0.5 opacity-70">
          <Clock className="w-2.5 h-2.5" aria-hidden="true" />
          {time}
        </span>
      )}
    </span>
  );
}
