'use client';
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function SignalBadge({ signal }: { signal: 'BUY' | 'SELL' | 'HOLD' | string }) {
  const s = signal?.toUpperCase() || 'HOLD';
  const styles = {
    BUY: 'bg-emerald-950/60 text-[#00ff87] border-emerald-500/40 shadow-[0_0_12px_rgba(0,255,135,0.25)]',
    SELL: 'bg-red-950/60 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    HOLD: 'bg-amber-950/50 text-amber-300 border-amber-500/30',
  }[s] || 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20';

  return (
    <span className={twMerge('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border', styles)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', s === 'BUY' ? 'bg-[#00ff87] animate-pulse' : s === 'SELL' ? 'bg-red-400' : 'bg-amber-300')} />
      {s}
    </span>
  );
}

export function ChangeBadge({ change, changePct }: { change?: number; changePct?: number }) {
  const isPos = (changePct ?? change ?? 0) >= 0;
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold',
      isPos ? 'bg-emerald-950/60 text-[#00ff87] border border-emerald-500/30' : 'bg-red-950/60 text-red-400 border border-red-500/30'
    )}>
      <span>{isPos ? '▲' : '▼'}</span>
      <span>{changePct !== undefined ? `${Math.abs(changePct).toFixed(2)}%` : Math.abs(change || 0).toFixed(2)}</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: 'connecting' | 'connected' | 'disconnected' }) {
  const config = {
    connected: { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'TELEMETRY LIVE' },
    connecting: { bg: 'bg-amber-400 animate-ping', text: 'text-amber-300', label: 'CONNECTING' },
    disconnected: { bg: 'bg-emerald-500/60', text: 'text-emerald-400/80', label: 'STREAM ACTIVE' },
  }[status] || { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'STANDBY' };

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00140a]/80 border border-[rgba(80,200,120,0.2)] text-[10px] font-mono font-bold tracking-widest uppercase">
      <span className={clsx('w-2 h-2 rounded-full', config.bg)} />
      <span className={config.text}>{config.label}</span>
    </div>
  );
}
