'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { MetricCard } from '@/components/ui/MetricCard';
import { SignalBadge } from '@/components/ui/Badges';
import { Button } from '@/components/ui/Button';
import CandlestickChart from '@/components/charts/CandlestickChart';
import OrderBookDepth from '@/components/charts/OrderBookDepth';
import { PresetSelector } from '@/components/terminal/PresetSelector';
import { Activity, Brain, LineChart, ShieldCheck, Zap, Sparkles, ArrowRight, Layers } from 'lucide-react';

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6 text-[#00ff87]" />,
    title: 'Sub-Millisecond Ingestion',
    desc: 'Real-time order flow engine streaming Level 2 market depth, tick latency metrics, and order book imbalance detection.',
    stat: '< 1ms',
    statLabel: 'Packet Latency',
  },
  {
    icon: <Brain className="w-6 h-6 text-[#00ff87]" />,
    title: 'Gemini Quantitative AI',
    desc: 'On-device quantitative neural reasoning fusing RSI, MACD, Bollinger Bands, and live news sentiment into trade signals.',
    stat: '88.4%',
    statLabel: 'Confidence Score',
  },
  {
    icon: <LineChart className="w-6 h-6 text-[#00ff87]" />,
    title: 'Multi-Indicator Visuals',
    desc: 'Volumetric candlestick charting, dynamic VWAP anchoring, institutional moving averages, and crosshair HUD tracking.',
    stat: '20+',
    statLabel: 'Bluechip Equities',
  },
];

export default function LandingPage() {
  const { status, snapshot, activeTicker, selectTicker, timeframe, subscribe } = useVortexSocket();

  return (
    <div className="min-h-screen relative flex flex-col gap-10 w-full" style={{ background: '#000e07' }}>
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-16 pb-16">
        {/* Hero Section */}
        <section className="pt-6 sm:pt-12 text-center flex flex-col items-center gap-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(80,200,120,0.12)] border border-[rgba(80,200,120,0.3)] text-xs font-mono text-[#00ff87] font-bold shadow-[0_0_20px_rgba(0,255,135,0.15)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VORTEX HIGH-FREQUENCY TELEMETRY ENGINE 4.0</span>
          </div>

          <h1
            className="font-sans font-black tracking-tight uppercase text-white"
            style={{
              fontSize: 'clamp(36px, 6vw, 76px)',
              lineHeight: 1.05,
              textShadow: '0 0 50px rgba(0,255,135,0.3)',
            }}
          >
            Real-Time Market <br />
            <span className="bg-gradient-to-r from-[#00ff87] via-[#50C878] to-emerald-400 bg-clip-text text-transparent">
              Telemetry & AI Edge
            </span>
          </h1>

          <p className="font-mono text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Institutional-grade order book analytics, multi-layer volumetric charting, and quantitative market reasoning powered by Gemini 3.6 Flash. Built for quantitative traders and market analysts.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link href="/terminal">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Terminal
              </Button>
            </Link>
            <Link href="/analyst">
              <Button variant="secondary" size="lg" leftIcon={<Brain className="w-4 h-4" />}>
                AI Market Analyst
              </Button>
            </Link>
            <Link href="/screener">
              <Button variant="ghost" size="lg">
                View Screener
              </Button>
            </Link>
          </div>
        </section>

        {/* Live Interactive Product Sandbox Preview */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
                <h3 className="text-sm font-mono font-bold text-[var(--matrix-bright)] uppercase tracking-wider">
                  Live Interactive Terminal Sandbox
                </h3>
              </div>
              <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                Real-time telemetry for <span className="text-[#00ff87] font-bold">{activeTicker}</span>. Test tickers and timeframes.
              </p>
            </div>
            <SignalBadge signal={snapshot?.signal || 'BUY'} />
          </div>

          {/* KPI Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              title={`${activeTicker} Price`}
              value={`₹${(snapshot?.mid || 2500).toFixed(2)}`}
              change={snapshot?.change}
              changePct={snapshot?.change_pct}
              icon={<Activity className="w-4 h-4" />}
            />
            <MetricCard
              title="Target Price"
              value={`₹${(snapshot?.target || snapshot?.mid * 1.035 || 2580).toFixed(2)}`}
              subValue="Model Est."
              badge={<SignalBadge signal={snapshot?.signal || 'BUY'} />}
            />
            <MetricCard
              title="Throughput"
              value={`${(snapshot?.throughput || 1850).toFixed(0)}`}
              subValue="packets/sec"
              icon={<Zap className="w-4 h-4" />}
            />
            <MetricCard
              title="Query Latency"
              value={`${(snapshot?.latency_p50 || 640).toFixed(0)} μs`}
              subValue="p50 percentile"
              icon={<ShieldCheck className="w-4 h-4" />}
            />
          </div>

          {/* Main Chart + Order Book Depth Sandbox */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl bg-[#001008]/90 border border-[rgba(80,200,120,0.18)] p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <CandlestickChart
                candles={snapshot?.candles || []}
                activeTicker={activeTicker}
                currentTimeframe={timeframe}
                onTimeframeChange={(tf) => subscribe(activeTicker, tf)}
              />
            </div>

            <div className="rounded-2xl bg-[#001008]/90 border border-[rgba(80,200,120,0.18)] p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div>
                <h4 className="text-xs font-mono font-bold text-[var(--matrix-bright)] uppercase mb-3">
                  Level 2 Order Book Depth
                </h4>
                <OrderBookDepth
                  bids={snapshot?.bids_l2 || []}
                  asks={snapshot?.asks_l2 || []}
                  midPrice={snapshot?.mid || 0}
                />
              </div>

              <div className="pt-3 border-t border-[rgba(80,200,120,0.12)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-muted)]">Spread</span>
                <span className="text-white font-bold">
                  ₹{((snapshot?.ask || 0) - (snapshot?.bid || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#001008]/80 border border-[rgba(80,200,120,0.15)]">
            <PresetSelector
              activeTicker={activeTicker}
              onSelectTicker={(t) => selectTicker(t)}
            />
          </div>
        </section>

        {/* Core Capabilities Features Grid */}
        <section className="flex flex-col gap-6 pt-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-[3px] text-[var(--matrix)] uppercase">
              Core Platform Modules
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mt-1">
              Built for Institutional Precision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#001008]/85 border border-[rgba(80,200,120,0.15)] hover:border-[#50C878] transition-all flex flex-col justify-between gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)] group"
              >
                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-xl bg-[rgba(80,200,120,0.1)] w-fit group-hover:scale-105 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-mono font-bold uppercase text-[#f0fff8] tracking-wider">
                    {f.title}
                  </h3>
                  <p className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[rgba(80,200,120,0.12)] flex items-baseline justify-between">
                  <span className="text-2xl font-mono font-extrabold text-[#00ff87]">
                    {f.stat}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider uppercase">
                    {f.statLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}