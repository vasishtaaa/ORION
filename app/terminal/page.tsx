'use client';
import React, { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket, Timeframe } from '@/lib/websocket';
import { MetricCard } from '@/components/ui/MetricCard';
import { SignalBadge } from '@/components/ui/Badges';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import CandlestickChart from '@/components/charts/CandlestickChart';
import OrderBookDepth from '@/components/charts/OrderBookDepth';
import IndicatorSubChart from '@/components/charts/IndicatorSubChart';
import { PresetSelector } from '@/components/terminal/PresetSelector';
import { ParameterControls } from '@/components/terminal/ParameterControls';
import { TradeCalculator } from '@/components/terminal/TradeCalculator';
import { ExportToolbar } from '@/components/terminal/ExportToolbar';
import { Activity, ShieldCheck, Zap, TrendingUp, BarChart3, Clock, DollarSign } from 'lucide-react';

const QUICK_TICKERS = [
  'TCS_NSE', 'RELI_NSE', 'HDFC_NSE', 'INFY_NSE', 'ICICIBANK_NSE', 'SBIN_NSE', 'TATAMOTORS_NSE', 'ADANIENT_NSE'
];

export default function TerminalPage() {
  const { status, snapshot, activeTicker, selectTicker, timeframe, subscribe } = useVortexSocket();
  const [activeTab, setActiveTab] = useState<'chart' | 'orderbook' | 'calculator' | 'params'>('chart');

  const currentPrice = snapshot?.mid || 2500;

  return (
    <div className="min-h-screen relative flex flex-col gap-6 w-full" style={{ background: '#000e07' }}>
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/terminal"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-6 pb-16">
        {/* Terminal Header & Quick Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#001008]/90 border border-[rgba(80,200,120,0.18)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-mono font-bold text-white tracking-wider">
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
                    : 'bg-[#001a0d] text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(80,200,120,0.1)]'
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            title="Last Traded Price"
            value={`₹${currentPrice.toFixed(2)}`}
            change={snapshot?.change}
            changePct={snapshot?.change_pct}
            icon={<DollarSign className="w-4 h-4" />}
          />
          <MetricCard
            title="AI Target Target"
            value={`₹${(snapshot?.target || currentPrice * 1.035).toFixed(2)}`}
            subValue={`+${(((snapshot?.target || currentPrice * 1.035) - currentPrice) / currentPrice * 100).toFixed(1)}%`}
            badge={<span className="text-xs font-mono font-bold text-[#00ff87]">{snapshot?.confidence?.toFixed(0) || 85}% Conf.</span>}
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <MetricCard
            title="Ingestion Throughput"
            value={`${(snapshot?.throughput || 1850).toFixed(0)}`}
            subValue="pkts/s"
            icon={<Zap className="w-4 h-4" />}
          />
          <MetricCard
            title="Order Flow Latency"
            value={`${(snapshot?.latency_p50 || 640).toFixed(0)} μs`}
            subValue="p50 percentile"
            icon={<ShieldCheck className="w-4 h-4" />}
          />
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Column (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <GlassCard className="p-4 sm:p-5">
              <CandlestickChart
                candles={snapshot?.candles || []}
                activeTicker={activeTicker}
                currentTimeframe={timeframe}
                onTimeframeChange={(tf) => subscribe(activeTicker, tf)}
              />
            </GlassCard>

            {/* RSI Sub-Chart Indicator Panel */}
            <GlassCard className="p-4">
              <IndicatorSubChart candles={snapshot?.candles || []} />
            </GlassCard>

            {/* Risk & Position Sizing Calculator */}
            <GlassCard className="p-4 sm:p-5">
              <TradeCalculator currentPrice={currentPrice} activeTicker={activeTicker} />
            </GlassCard>
          </div>

          {/* Right Analytical Column (1 Col) */}
          <div className="flex flex-col gap-6">
            {/* Level 2 Order Book Depth */}
            <GlassCard className="p-4 sm:p-5">
              <h3 className="text-xs font-mono font-bold text-[var(--matrix-bright)] uppercase mb-3 flex items-center justify-between">
                <span>Order Book Imbalance</span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal">Level 2 Quotes</span>
              </h3>
              <OrderBookDepth
                bids={snapshot?.bids_l2 || []}
                asks={snapshot?.asks_l2 || []}
                midPrice={currentPrice}
              />
            </GlassCard>

            {/* Fundamentals Overview Card */}
            <GlassCard className="p-4 sm:p-5 flex flex-col gap-3 font-mono text-xs">
              <h3 className="font-bold text-[var(--matrix-bright)] uppercase border-b border-[rgba(80,200,120,0.12)] pb-2">
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
            </GlassCard>

            {/* Model Hyperparameter Tuners */}
            <GlassCard className="p-4 sm:p-5">
              <ParameterControls />
            </GlassCard>
          </div>
        </div>

        {/* Preset Market Baskets Selector Footer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#001008]/80 border border-[rgba(80,200,120,0.15)]">
          <PresetSelector activeTicker={activeTicker} onSelectTicker={(t) => selectTicker(t)} />
        </div>
      </div>
    </div>
  );
}