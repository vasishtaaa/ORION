'use client';
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function SignalBadge({ signal }: { signal: 'BUY' | 'SELL' | 'HOLD' | string }) {
  const s = signal?.toUpperCase() || 'HOLD';
  const styles = {
    BUY: 'bg-emerald-950/70 text-[#00ff87] border-emerald-500/40 shadow-[0_0_12px_rgba(0,255,135,0.25)]',
    SELL: 'bg-red-950/70 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    HOLD: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
  }[s] || 'bg-emerald-950/50 text-emerald-300 border-emerald-500/20';

  return (
    <span className={twMerge(
      'w-fit inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-3.5 py-1 text-xs font-mono font-bold tracking-wider uppercase rounded-full border',
      styles
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', s === 'BUY' ? 'bg-[#00ff87] animate-pulse' : s === 'SELL' ? 'bg-red-400' : 'bg-amber-300')} />
      <span>{s}</span>
    </span>
  );
}

export function ChangeBadge({ change, changePct }: { change?: number; changePct?: number }) {
  const isPos = (changePct ?? change ?? 0) >= 0;
  return (
    <span className={clsx(
      'w-fit inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-3.5 py-1 text-xs font-medium rounded-full border font-mono',
      isPos ? 'bg-emerald-950/60 text-[#00ff87] border-emerald-500/30' : 'bg-red-950/60 text-red-400 border-red-500/30'
    )}>
      <span>{isPos ? '▲' : '▼'}</span>
      <span>{changePct !== undefined ? `${Math.abs(changePct).toFixed(2)}%` : Math.abs(change || 0).toFixed(2)}</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: 'connecting' | 'connected' | 'disconnected' }) {
  const config = {
    connected: { bg: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]', text: 'text-emerald-400', label: 'STREAM ACTIVE' },
    connecting: { bg: 'bg-amber-400 animate-ping', text: 'text-amber-300', label: 'CONNECTING' },
    disconnected: { bg: 'bg-emerald-500/80', text: 'text-emerald-400', label: 'STREAM ACTIVE' },
  }[status] || { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'STREAM ACTIVE' };

  return (
    <div className="w-fit inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap px-3.5 py-1 text-xs font-medium rounded-full bg-[#0e131d]/90 border border-white/10 shadow-sm">
      <span className={clsx('w-2 h-2 rounded-full shrink-0', config.bg)} />
      <span className={clsx('font-mono tracking-wider uppercase text-[11px]', config.text)}>{config.label}</span>
    </div>
  );
}

export function IndicatorBadge({ label, badge }: { label: string; badge?: string }) {
  return (
    <span className="w-fit inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-3.5 py-1 text-xs font-mono font-bold rounded-full bg-[#0e131d] border border-white/10 text-white">
      <span>{label}</span>
      {badge && (
        <span className="px-1.5 py-0.2 rounded-full bg-[#00ff87]/20 text-[#00ff87] text-[9px] font-bold border border-[#00ff87]/30">
          {badge}
        </span>
      )}
    </span>
  );
}
