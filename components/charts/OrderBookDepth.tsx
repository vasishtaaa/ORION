'use client';
import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { clsx } from 'clsx';

interface OrderBookDepthProps {
  bids: [number, number][];
  asks: [number, number][];
  midPrice: number;
}

export default function OrderBookDepth({ bids = [], asks = [], midPrice = 0 }: OrderBookDepthProps) {
  const maxBidVol = Math.max(...bids.map(([, v]) => v), 1);
  const maxAskVol = Math.max(...asks.map(([, v]) => v), 1);
  const maxTotalVol = Math.max(maxBidVol, maxAskVol);

  const totalBidVol = bids.reduce((acc, [, v]) => acc + v, 0);
  const totalAskVol = asks.reduce((acc, [, v]) => acc + v, 0);
  const totalVol = totalBidVol + totalAskVol;
  const obi = totalVol > 0 ? (totalBidVol - totalAskVol) / totalVol : 0;

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Imbalance Meter */}
      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#00140a]/90 border border-[rgba(80,200,120,0.15)]">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-emerald-400 font-bold">BID {(totalVol > 0 ? (totalBidVol / totalVol) * 100 : 50).toFixed(0)}%</span>
          <span className="text-[var(--text-muted)] tracking-wider uppercase font-semibold">
            OBI: <span className={clsx(obi >= 0 ? 'text-[#00ff87]' : 'text-red-400', 'font-bold')}>{(obi * 100).toFixed(1)}%</span>
          </span>
          <span className="text-red-400 font-bold">ASK {(totalVol > 0 ? (totalAskVol / totalVol) * 100 : 50).toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#001a0d] overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-[#00ff87] transition-all duration-300"
            style={{ width: `${totalVol > 0 ? (totalBidVol / totalVol) * 100 : 50}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-300"
            style={{ width: `${totalVol > 0 ? (totalAskVol / totalVol) * 100 : 50}%` }}
          />
        </div>
      </div>

      {/* Level 2 Depth Ladder */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        {/* Bids Column */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] px-1 pb-1 border-b border-[rgba(80,200,120,0.1)]">
            <span>BID VOL</span>
            <span>PRICE (₹)</span>
          </div>
          {bids.slice(0, 5).map(([price, vol], i) => (
            <div key={i} className="relative flex justify-between items-center px-2 py-1 rounded bg-[#00140a] overflow-hidden">
              <div
                className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none transition-all duration-200"
                style={{ width: `${(vol / maxTotalVol) * 100}%` }}
              />
              <span className="text-[var(--text-secondary)] text-[11px] relative z-10">{vol.toLocaleString()}</span>
              <span className="text-[#00ff87] font-bold relative z-10">{price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Asks Column */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] px-1 pb-1 border-b border-[rgba(80,200,120,0.1)]">
            <span>PRICE (₹)</span>
            <span>ASK VOL</span>
          </div>
          {asks.slice(0, 5).map(([price, vol], i) => (
            <div key={i} className="relative flex justify-between items-center px-2 py-1 rounded bg-[#00140a] overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-red-500/15 pointer-events-none transition-all duration-200"
                style={{ width: `${(vol / maxTotalVol) * 100}%` }}
              />
              <span className="text-red-400 font-bold relative z-10">{price.toFixed(2)}</span>
              <span className="text-[var(--text-secondary)] text-[11px] relative z-10">{vol.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
