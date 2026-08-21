'use client';
import React from 'react';
import { Zap, Brain, ShieldAlert, Cpu } from 'lucide-react';

export function BentoGrid() {
  return (
    <section className="w-full flex flex-col gap-12 sm:gap-16">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="w-fit inline-flex shrink-0 items-center justify-center gap-2 px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-mono text-[#00ff87] font-bold rounded-full bg-[rgba(80,200,120,0.12)] border border-[rgba(80,200,120,0.3)] shadow-[0_0_20px_rgba(0,255,135,0.15)] mx-auto">
          <span>PLATFORM CAPABILITIES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold uppercase text-white tracking-tight text-center leading-tight">
          Engineered for Quantitative Dominance
        </h2>
        <p className="text-base sm:text-lg text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
          Four interconnected algorithmic engines combining high-throughput telemetry with deep generative AI synthesis.
        </p>
      </div>

      {/* Bento Grid: 2 columns on tablet/desktop, min-h-[280px] with dedicated bottom stats */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Card 1: Ultra-Low Latency Ingestion */}
        <div className="rounded-3xl bg-[#0e131d]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between h-auto min-h-[280px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] group hover:border-[#50C878]/50 transition-all">
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-2xl bg-[rgba(80,200,120,0.1)] w-fit group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-[#00ff87]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-mono font-bold uppercase text-white">
              Ultra-Low Latency Ingestion
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
              Sub-millisecond binary packet processing over high-speed WebSocket channels. Direct aggregation of Level 2 market depth, tick-by-tick order flow imbalance, and dynamic spread compression.
            </p>
          </div>

          {/* Dedicated Bottom-Row Container */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[var(--text-muted)]">PACKET INGESTION</span>
              <span className="text-[#00ff87] font-bold">12,480 pkts/s</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-[#00ff87] w-[88%]" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] pt-0.5">
              <span>p50: 480 μs</span>
              <span>p99: 1,240 μs</span>
            </div>
          </div>
        </div>

        {/* Card 2: Gemini Quantitative Reasoning */}
        <div className="rounded-3xl bg-[#0e131d]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between h-auto min-h-[280px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] group hover:border-[#50C878]/50 transition-all">
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-2xl bg-[rgba(80,200,120,0.1)] w-fit group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6 text-[#00ff87]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-mono font-bold uppercase text-white">
              Gemini Quantitative AI
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
              Continuous on-device neural synthesis fusing RSI momentum, MACD histograms, and live financial news sentiment into directional trade confidence scores.
            </p>
          </div>

          {/* Dedicated Bottom-Row Container */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-[var(--text-muted)]">NEURAL ENGINE</span>
              <span className="text-white font-bold">Gemini 3.6 Flash</span>
            </div>
            <span className="w-fit px-3.5 py-1 rounded-full bg-emerald-950/80 text-[#00ff87] font-bold text-xs border border-emerald-500/30">
              88.4% CONFIDENCE
            </span>
          </div>
        </div>

        {/* Card 3: Institutional Risk Engine */}
        <div className="rounded-3xl bg-[#0e131d]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between h-auto min-h-[280px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] group hover:border-[#50C878]/50 transition-all">
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-2xl bg-[rgba(80,200,120,0.1)] w-fit group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-[#00ff87]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-mono font-bold uppercase text-white">
              Institutional Risk Engine
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
              Automated position sizing based on fractional Kelly criterion, volatility stop-loss calculation, and dynamic risk-to-reward ratio boundaries.
            </p>
          </div>

          {/* Dedicated Bottom-Row Container */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-xs">
            <span className="text-[var(--text-muted)]">DEFAULT R:R RATIO</span>
            <span className="text-[#00ff87] font-bold text-sm">1 : 2.5 Bounds</span>
          </div>
        </div>

        {/* Card 4: Enterprise API & WebSocket Streams */}
        <div className="rounded-3xl bg-[#0e131d]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between h-auto min-h-[280px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] group hover:border-[#50C878]/50 transition-all">
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-2xl bg-[rgba(80,200,120,0.1)] w-fit group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6 text-[#00ff87]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-mono font-bold uppercase text-white">
              Enterprise Streaming APIs
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
              Standardized REST & RFC 6455 WebSocket endpoints streaming JSON & binary data for programmatic algorithmic trading desks, Python clients, and quant backtesting suites.
            </p>
          </div>

          {/* Dedicated Bottom-Row Container */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-xs">
            <span className="text-[var(--text-muted)]">PROTOCOL</span>
            <span className="text-[#00ff87] font-bold">WSS Binary Stream (RFC 6455)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
