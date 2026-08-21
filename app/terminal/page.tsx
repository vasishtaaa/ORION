'use client';
import React, { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { MetricCard } from '@/components/ui/MetricCard';
import { SignalBadge } from '@/components/ui/Badges';
import { GlassCard } from '@/components/ui/GlassCard';
import CandlestickChart from '@/components/charts/CandlestickChart';
import OrderBookDepth from '@/components/charts/OrderBookDepth';
import IndicatorSubChart from '@/components/charts/IndicatorSubChart';
import { PresetSelector } from '@/components/terminal/PresetSelector';
import { ParameterControls } from '@/components/terminal/ParameterControls';
import { TradeCalculator } from '@/components/terminal/TradeCalculator';
import { ExportToolbar } from '@/components/terminal/ExportToolbar';
import { ShieldCheck, Zap, TrendingUp, DollarSign } from 'lucide-react';

const QUICK_TICKERS = [
  'TCS_NSE', 'RELI_NSE', 'HDFC_NSE', 'INFY_NSE', 'ICICIBANK_NSE', 'SBIN_NSE', 'TATAMOTORS_NSE', 'ADANIENT_NSE'
];

export default function TerminalPage() {
  const { status, snapshot, activeTicker, selectTicker, timeframe, subscribe } = useVortexSocket();
  const currentPrice = snapshot?.mid || 2500;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-[#0a0d14] text-white flex flex-col">
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/terminal"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <main className="w-full flex-1 pt-20 sm:pt-24 flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 pb-16">
          {/* Terminal Header & Quick Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 p-4 rounded-2xl bg-[#0e131d]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-xl font-mono font-bold text-white tracking-wider">
                    {activeTicker}
                  </h1>
                  <SignalBadge signal={snapshot?.signal || 'BUY'} />
                </div>
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  ₹{currentPrice.toFixed(2)} • {snapshot?.change_pct !== undefined ? `${snapshot.change_pct >= 0 ? '+' : ''}${snapshot.change_pct.toFixed(2)}%` : '0.00%'}
                </span>
              </div>
            </div>

            {/* Quick Ticker Switcher Buttons */}
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-md">
              {QUICK_TICKERS.map((t) => (
                <button
                  key={t}
                  onClick={() => selectTicker(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    activeTicker === t
                      ? 'bg-[#50C878] text-black font-bold shadow-[0_0_12px_rgba(80,200,120,0.4)]'
                      : 'bg-[#0a0d14] text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(80,200,120,0.1)] border border-white/5'
                  }`}
                >
                  {t.split('_')[0]}
                </button>
              ))}
            </div>

            {/* Export & Reporting Toolbar */}
            <ExportToolbar snapshot={snapshot} />
          </div>

          {/* Primary KPI Metric Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              title="Last Price"
              value={`₹${currentPrice.toFixed(2)}`}
              change={snapshot?.change}
              changePct={snapshot?.change_pct}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <MetricCard
              title="Target Price"
              value={`₹${(snapshot?.target || currentPrice * 1.035).toFixed(2)}`}
              subValue={`+${(((snapshot?.target || currentPrice * 1.035) - currentPrice) / currentPrice * 100).toFixed(1)}%`}
              badge={<span className="text-[10px] sm:text-xs font-mono font-bold text-[#00ff87]">{snapshot?.confidence?.toFixed(0) || 85}% Conf.</span>}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <MetricCard
              title="Throughput"
              value={`${(snapshot?.throughput || 1850).toFixed(0)}`}
              subValue="pkts/s"
              icon={<Zap className="w-4 h-4" />}
            />
            <MetricCard
              title="Latency"
              value={`${(snapshot?.latency_p50 || 640).toFixed(0)} μs`}
              subValue="p50 latency"
              icon={<ShieldCheck className="w-4 h-4" />}
            />
          </div>

          {/* Main Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Chart Column (8 cols on Desktop) */}
            <div className="lg:col-span-8 flex flex-col gap-6 w-full min-w-0">
              <div className="rounded-2xl bg-[#0e131d]/90 border border-white/10 p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <CandlestickChart
                  candles={snapshot?.candles || []}
                  activeTicker={activeTicker}
                  currentTimeframe={timeframe}
                  onTimeframeChange={(tf) => subscribe(activeTicker, tf)}
                />
              </div>

              {/* RSI Sub-Chart Indicator Panel */}
              <div className="rounded-2xl bg-[#0e131d]/90 border border-white/10 p-4">
                <IndicatorSubChart candles={snapshot?.candles || []} />
              </div>

              {/* Risk & Position Sizing Calculator */}
              <div className="rounded-2xl bg-[#0e131d]/90 border border-white/10 p-4 sm:p-5">
                <TradeCalculator currentPrice={currentPrice} activeTicker={activeTicker} />
              </div>
            </div>

            {/* Right Analytical Column (4 cols on Desktop) */}
            <div className="lg:col-span-4 flex flex-col gap-6 w-full min-w-0">
              {/* Level 2 Order Book Depth */}
              <div className="rounded-2xl bg-[#0e131d]/90 border border-white/10 p-4 sm:p-5">
                <h3 className="text-xs font-mono font-bold text-[var(--matrix-bright)] uppercase mb-3 flex items-center justify-between">
                  <span>Order Book Imbalance</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-normal">Level 2 Quotes</span>
                </h3>
                <OrderBookDepth
                  bids={snapshot?.bids_l2 || []}
                  asks={snapshot?.asks_l2 || []}
                  midPrice={currentPrice}
                />
              </div>

              {/* Fundamentals Overview Card */}
              <div className="rounded-2xl bg-[#0e131d]/90 border border-white/10 p-4 sm:p-5 flex flex-col gap-3 font-mono text-xs">
                <h3 className="font-bold text-[var(--matrix-bright)] uppercase border-b border-white/10 pb-2">
                  Fundamental Intelligence
                </h3>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">P/E Ratio</span>
                  <span className="text-white font-bold">{snapshot?.fundamental?.pe?.toFixed(2) || '28.40'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Market Cap</span>
                  <span className="text-white font-bold">₹{((snapshot?.fundamental?.market_cap || 1420000000000) / 1e9).toFixed(1)}B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Return on Equity</span>
                  <span className="text-[#00ff87] font-bold">{((snapshot?.fundamental?.roe || 0.48) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Debt to Equity</span>
                  <span className="text-white font-bold">{snapshot?.fundamental?.debt_to_equity?.toFixed(2) || '0.08'}</span>
                </div>
              </div>

              {/* Model Hyperparameter Tuners */}
              <div className="rounded-2xl bg-[#0e131d]/90 border border-white/10 p-4 sm:p-5">
                <ParameterControls />
              </div>
            </div>
          </div>

          {/* Preset Market Baskets Selector Footer */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e131d]/80 border border-white/10">
            <PresetSelector activeTicker={activeTicker} onSelectTicker={(t) => selectTicker(t)} />
          </div>
        </div>
      </main>
    </div>
  );
}