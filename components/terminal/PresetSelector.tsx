'use client';
import React from 'react';
import { PRESET_BASKETS } from '@/lib/presets';
import { clsx } from 'clsx';

interface PresetSelectorProps {
  activeTicker: string;
  onSelectTicker: (ticker: string) => void;
}

export function PresetSelector({ activeTicker, onSelectTicker }: PresetSelectorProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold tracking-wider text-[var(--matrix)] uppercase">
          Market Presets & Baskets
        </span>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          1-Click Live Feeds
        </span>
      </div>

      {/* Adaptive Grid: 2 cols on mobile (<640px), 3 cols on tablet (640px-1024px), 5 cols on desktop (>=1024px) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PRESET_BASKETS.map((basket) => {
          const isSelected = basket.tickers.includes(activeTicker);
          return (
            <button
              key={basket.id}
              onClick={() => onSelectTicker(basket.tickers[0])}
              className={clsx(
                'p-3 sm:p-3.5 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer group min-w-0',
                isSelected
                  ? 'bg-[rgba(80,200,120,0.18)] border-[#00ff87] shadow-[0_0_15px_rgba(0,255,135,0.2)]'
                  : 'bg-[#0e131d]/80 border-white/10 hover:border-[#50C878] hover:bg-[#0e131d]'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{basket.icon}</span>
                {isSelected && <span className="text-[9px] font-mono text-[#00ff87] font-bold">ACTIVE</span>}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-mono font-bold text-[#f0fff8] truncate group-hover:text-[#00ff87]">
                  {basket.name}
                </p>
                <p className="text-[10px] font-mono text-[var(--text-muted)] truncate mt-0.5">
                  {basket.tickers.slice(0, 2).map((t) => t.split('_')[0]).join(', ')}...
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
