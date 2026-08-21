'use client';
import React from 'react';
import { Zap, Brain, ShieldAlert, Cpu, Activity, LineChart, Layers, Terminal } from 'lucide-react';

export function BentoGrid() {
  return (
    <section className="w-full flex flex-col gap-8 py-8">
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(80,200,120,0.12)] border border-[rgba(80,200,120,0.3)] text-[11px] font-mono text-[#00ff87] font-bold mx-auto">
          <span>PLATFORM CAPABILITIES</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight">
          Engineered for Quantitative Dominance
        </h2>
        <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
          Four interconnected algorithmic engines combining high-throughput telemetry with deep generative AI synthesis.
        </p>
      </div>

      {/* 4-Card Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Card 1: Ultra-Low Latency Ingestion (Spans 7 cols) */}
        <div className="md:col-span-7 rounded-2xl bg-[#0e131d]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group hover:border-[#50C878]/50 transition-all">
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-[rgba(80,200,120,0.1)] w-fit group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-[#00ff87]" />
            </div>
            <h3 className="text-lg sm:text-xl font-mono font-bold uppercase text-white">
              Ultra-Low Latency Ingestion
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
              Sub-millisecond binary packet processing over high-speed WebSocket channels. Direct aggregation of Level 2 market depth, tick-by-tick order flow imbalance, and dynamic spread compression.
            </p>
          </div>

          {/* Micro Visual */}
          <div className="p-4 rounded-xl bg-[#06090e] border border-white/5 font-mono text-xs flex flex-col gap-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-[var(--text-muted)]">PACKET INGESTION BUFFER</span>
              <span className="text-[#00ff87] font-bold">12,480 pkts/s</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-[#00ff87] w-[88%]" />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] pt-1">
              <span>p50: 480 μs</span>
              <span>p90: 780 μs</span>
              <span>p99: 1,240 μs</span>
            </div>
          </div>
        </div>

        {/* Card 2: Gemini Quantitative Reasoning (Spans 5 cols) */}
        <div className="md:col-span-5 rounded-2xl bg-[#0e131d]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group hover:border-[#50C878]/50 transition-all">
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-[rgba(80,200,120,0.1)] w-fit group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6 text-[#00ff87]" />
            </div>
            <h3 className="text-lg sm:text-xl font-mono font-bold uppercase text-white">
              Gemini Quantitative AI
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
              Continuous on-device neural synthesis fusing RSI momentum, MACD histograms, and live financial news sentiment into directional trade confidence scores.
            </p>
          </div>

          {/* Micro Visual */}
          <div className="p-4 rounded-xl bg-[#06090e] border border-white/5 font-mono text-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-[var(--text-muted)]">MODEL INFERENCE</span>
              <span className="text-white font-bold">Gemini 3.6 Flash</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-[#00ff87] font-bold text-xs border border-emerald-500/30">
              88.4% CONFIDENCE
            </span>
          </div>
        </div>

        {/* Card 3: Institutional Risk Engine (Spans 5 cols) */}
        <div className="md:col-span-5 rounded-2xl bg-[#0e131d]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group hover:border-[#50C878]/50 transition-all">
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-[rgba(80,200,120,0.1)] w-fit group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-[#00ff87]" />
            </div>
            <h3 className="text-lg sm:text-xl font-mono font-bold uppercase text-white">
              Institutional Risk Engine
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
              Automated position sizing based on fractional Kelly criterion, volatility stop-loss calculation, and dynamic risk-to-reward ratio boundaries.
            </p>
          </div>

          {/* Micro Visual */}
          <div className="p-4 rounded-xl bg-[#06090e] border border-white/5 font-mono text-xs flex justify-between items-center">
            <span className="text-[var(--text-muted)]">DEFAULT R:R BOUND</span>
            <span className="text-[#00ff87] font-bold text-sm">1 : 2.5 Ratio</span>
          </div>
        </div>

        {/* Card 4: Enterprise API & WebSocket Streams (Spans 7 cols) */}
        <div className="md:col-span-7 rounded-2xl bg-[#0e131d]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group hover:border-[#50C878]/50 transition-all">
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-[rgba(80,200,120,0.1)] w-fit group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6 text-[#00ff87]" />
            </div>
            <h3 className="text-lg sm:text-xl font-mono font-bold uppercase text-white">
              Enterprise Streaming APIs
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
              Standardized REST & RFC 6455 WebSocket endpoints streaming JSON & binary data for programmatic algorithmic trading desks, Python clients, and quant backtesting suites.
            </p>
          </div>

          {/* Micro Visual */}
          <div className="p-3 rounded-xl bg-[#06090e] border border-white/5 font-mono text-xs text-[#00ff87] truncate">
            <code>wss://vortex-backend-1pf6.onrender.com (Binary Stream Active)</code>
          </div>
        </div>
      </div>
    </section>
  );
}
