'use client';
import React from 'react';

interface LiveBadgeProps { label?: string; color?: 'green' | 'red' | 'yellow'; }

export function LiveBadge({ label = 'LIVE', color = 'green' }: LiveBadgeProps) {
  const colorMap = {
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold mono tracking-wider leading-none" style={{ color: 'var(--matrix)' }}>
      <span className={`w-2 h-2 rounded-full ${colorMap[color]} animate-pulse-glow flex-shrink-0`} />
      <span>{label}</span>
    </span>
  );
}

interface StatChipProps { label: string; value: string | number; positive?: boolean; negative?: boolean; mono?: boolean; }
export function StatChip({ label, value, positive, negative, mono }: StatChipProps) {
  const color = positive ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-matrix';
  return (
    <div className="glass-sm px-4.5 py-3 flex flex-col gap-1.5 rounded-lg">
      <span className="text-[10px] tracking-wider uppercase leading-none" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className={`text-base font-extrabold ${color} ${mono ? 'mono' : ''} leading-none`}>{value}</span>
    </div>
  );
}

interface SignalBadgeProps { signal: string; confidence?: number; }
export function SignalBadge({ signal, confidence }: SignalBadgeProps) {
  const cfg: Record<string, { bg: string; text: string; border: string }> = {
    BUY:  { bg: 'rgba(16,185,129,0.2)',  text: '#10b981', border: 'rgba(16,185,129,0.5)' },
    SELL: { bg: 'rgba(239,68,68,0.2)',   text: '#ef4444', border: 'rgba(239,68,68,0.5)' },
    HOLD: { bg: 'rgba(234,179,8,0.2)',   text: '#eab308', border: 'rgba(234,179,8,0.5)' },
  };
  const c = cfg[signal] ?? cfg.HOLD;
  return (
    <span
      className="mono text-xs font-black px-4.5 py-2 rounded-lg inline-flex items-center justify-center leading-none"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, letterSpacing: 1 }}
    >
      {signal}{confidence !== undefined ? ` ${confidence.toFixed(0)}%` : ''}
    </span>
  );
}

interface TickerBadgeProps { ticker: string; active?: boolean; onClick?: () => void; }
export function TickerBadge({ ticker, active, onClick }: TickerBadgeProps) {
  const base = ticker.split('_')[0];
  return (
    <button
      onClick={onClick}
      className={`mono text-xs font-bold px-4 py-2.5 rounded-lg transition-all duration-200 inline-flex items-center justify-center leading-none flex-shrink-0 ${
        active
          ? 'text-black font-extrabold shadow-lg'
          : 'border border-[rgba(80,200,120,0.25)] text-matrix hover:border-matrix hover:text-white'
      }`}
      style={active ? { background: 'var(--matrix)', boxShadow: '0 0 16px rgba(80,200,120,0.6)' } : {}}
    >
      {base}
    </button>
  );
}
