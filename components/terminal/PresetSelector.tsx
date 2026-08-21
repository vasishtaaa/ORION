'use client';
import React from 'react';
import { PRESET_BASKETS } from '@/lib/presets';
import { GlassCard } from '@/components/ui/GlassCard';
import { clsx } from 'clsx';

interface PresetSelectorProps {
  activeTicker: string;
  onSelectTicker: (ticker: string) => void;
}

export function PresetSelector({ activeTicker, onSelectTicker }: PresetSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold tracking-wider text-[var(--matrix)] uppercase">
          Market Presets & Baskets
        </span>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          1-Click Live Feeds
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {PRESET_BASKETS.map((basket) => {
          const isSelected = basket.tickers.includes(activeTicker);
          return (
            <button
              key={basket.id}
              onClick={() => onSelectTicker(basket.tickers[0])}
              className={clsx(
                'p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer group',
                isSelected
                  ? 'bg-[rgba(80,200,120,0.18)] border-[#00ff87] shadow-[0_0_15px_rgba(0,255,135,0.2)]'
                  : 'bg-[#00140a]/80 border-[rgba(80,200,120,0.15)] hover:border-[#50C878] hover:bg-[#001f11]'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{basket.icon}</span>
                {isSelected && <span className="text-[9px] font-mono text-[#00ff87] font-bold">ACTIVE</span>}
              </div>
              <p className="text-xs font-mono font-bold text-[#f0fff8] truncate group-hover:text-[#00ff87]">
                {basket.name}
              </p>
              <p className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                {basket.tickers.slice(0, 2).map((t) => t.split('_')[0]).join(', ')}...
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
