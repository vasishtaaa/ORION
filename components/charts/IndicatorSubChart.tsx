'use client';
import React, { useMemo } from 'react';
import { Candle } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';

interface IndicatorSubChartProps {
  candles: Candle[];
  type?: 'RSI' | 'MACD';
}

export default function IndicatorSubChart({ candles = [], type = 'RSI' }: IndicatorSubChartProps) {
  // Simple rolling RSI calculation for visualization
  const rsiValues = useMemo(() => {
    if (!candles || candles.length < 5) return [50];
    const prices = candles.map((c) => c.c);
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      gains.push(diff >= 0 ? diff : 0);
      losses.push(diff < 0 ? Math.abs(diff) : 0);
    }

    const period = 14;
    const rsiArr: number[] = [];

    for (let i = period; i <= prices.length; i++) {
      const gSubset = gains.slice(i - period, i);
      const lSubset = losses.slice(i - period, i);
      const avgGain = gSubset.reduce((a, b) => a + b, 0) / period;
      const avgLoss = lSubset.reduce((a, b) => a + b, 0) / period;

      if (avgLoss === 0) {
        rsiArr.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsiArr.push(100 - 100 / (1 + rs));
      }
    }
    return rsiArr.length > 0 ? rsiArr : [52.4];
  }, [candles]);

  const latestRsi = rsiValues[rsiValues.length - 1] || 50;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-[var(--text-secondary)] font-bold">RSI (14)</span>
        <span
          className={`px-2 py-0.5 rounded font-bold ${
            latestRsi >= 70 ? 'bg-red-950/60 text-red-400 border border-red-500/30' : latestRsi <= 30 ? 'bg-emerald-950/60 text-[#00ff87] border border-emerald-500/30' : 'bg-[#001f11] text-cyan-300'
          }`}
        >
          {latestRsi.toFixed(1)} {latestRsi >= 70 ? '• OVERBOUGHT' : latestRsi <= 30 ? '• OVERSOLD' : '• NEUTRAL'}
        </span>
      </div>

      <div className="h-16 w-full bg-[#00140a] rounded-xl border border-[rgba(80,200,120,0.12)] p-2 relative flex items-center overflow-hidden">
        {/* 70/30 Threshold Guidelines */}
        <div className="absolute top-[30%] left-0 right-0 border-t border-dashed border-red-500/30" />
        <div className="absolute bottom-[30%] left-0 right-0 border-t border-dashed border-emerald-500/30" />

        {/* SVG Sparkline Curve */}
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${rsiValues.length - 1 || 1} 100`}>
          <polyline
            fill="none"
            stroke="#00ff87"
            strokeWidth="2"
            points={rsiValues.map((v, i) => `${i},${100 - v}`).join(' ')}
          />
        </svg>
      </div>
    </div>
  );
}
