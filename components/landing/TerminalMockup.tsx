'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { SignalBadge } from '@/components/ui/Badges';

export function TerminalMockup() {
  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-[0_20px_80px_rgba(0,0,0,0.9)] overflow-hidden group">
      {/* Ambient neon backdrop glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Frame Container */}
      <div className="relative z-10 w-full rounded-[14px] sm:rounded-[22px] bg-[#0b0f17] border border-white/10 p-5 sm:p-8 flex flex-col gap-6 overflow-hidden">
        {/* Mockup Window Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-white font-bold">RELI_NSE</span>
              <span className="text-[#00ff87] font-semibold">₹2,980.50 (+1.20%)</span>
              <SignalBadge signal="BUY" />
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-[var(--text-muted)] hidden sm:inline">Telemetry: <span className="text-[#00ff87]">480 μs</span></span>
            <Link
              href="/terminal"
              className="w-fit inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#50C878] text-black font-bold text-xs hover:bg-[#00ff87] transition-all shadow-[0_0_15px_rgba(80,200,120,0.4)]"
            >
              <span>Launch Live Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Mockup Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'LAST PRICE', val: '₹2,980.50', chg: '+1.20%', icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: 'MODEL TARGET', val: '₹3,085.00', chg: '88% Conf.', icon: <TrendingUp className="w-3.5 h-3.5 text-[#00ff87]" /> },
            { label: 'THROUGHPUT', val: '12,450 p/s', chg: 'Real-time', icon: <Zap className="w-3.5 h-3.5 text-cyan-400" /> },
            { label: 'ORDER FLOW LATENCY', val: '520 μs', chg: 'p50 Index', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> },
          ].map((m, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-xl bg-[#0e131d]/90 border border-white/5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                <span className="w-fit px-2 py-0.5 rounded-md bg-black/30 border border-white/5">{m.label}</span>
                {m.icon}
              </div>
              <div className="flex items-baseline justify-between gap-1 mt-1">
                <span className="text-base sm:text-lg font-mono font-bold text-white">{m.val}</span>
                <span className="text-[10px] font-mono text-[#00ff87]">{m.chg}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mockup Chart & Level 2 Depth Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart Preview Area */}
          <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0e131d]/90 border border-white/5 flex flex-col justify-between gap-4 h-64 sm:h-72 relative overflow-hidden">
            <div className="flex justify-between items-center text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold">Volumetric Candlesticks</span>
                <span className="text-[10px] text-cyan-400 font-semibold hidden sm:inline">VWAP: 2,974.20</span>
                <span className="text-[10px] text-yellow-400 font-semibold hidden sm:inline">SMA(20): 2,968.50</span>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span className="px-2.5 py-0.5 rounded-full bg-[#50C878]/20 text-[#00ff87] font-bold">LIVE</span>
                <span className="px-2.5 py-0.5 text-[var(--text-muted)]">1D</span>
                <span className="px-2.5 py-0.5 text-[var(--text-muted)]">1W</span>
              </div>
            </div>

            {/* Simulated Candlestick Graphic */}
            <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 px-2 pb-2 relative">
              {/* Cyan VWAP curve simulation */}
              <div className="absolute inset-0 pointer-events-none flex items-center">
                <div className="w-full h-[2px] bg-gradient-to-r from-cyan-500/40 via-cyan-400 to-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              </div>

              {[
                { h: 45, up: true }, { h: 55, up: true }, { h: 48, up: false }, { h: 62, up: true },
                { h: 58, up: false }, { h: 72, up: true }, { h: 68, up: false }, { h: 80, up: true },
                { h: 75, up: false }, { h: 88, up: true }, { h: 84, up: false }, { h: 95, up: true },
                { h: 90, up: false }, { h: 100, up: true }, { h: 96, up: false }, { h: 105, up: true },
              ].map((c, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className={`w-full rounded-sm ${c.up ? 'bg-[#00ff87] shadow-[0_0_8px_rgba(0,255,135,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}
                    style={{ height: `${c.h * 0.7}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-muted)] pt-2 border-t border-white/5">
              <span>09:15</span>
              <span>11:30</span>
              <span>13:45</span>
              <span>15:30 (Market Close)</span>
            </div>
          </div>

          {/* Order Book Preview Area */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0e131d]/90 border border-white/5 flex flex-col justify-between gap-3 h-64 sm:h-72">
            <div>
              <div className="flex justify-between items-center text-xs font-mono font-bold text-[var(--matrix-bright)] pb-2 border-b border-white/5">
                <span>L2 Order Book</span>
                <span className="text-[10px] text-[#00ff87]">OBI: +24.5%</span>
              </div>

              {/* Order Book Imbalance Gauge */}
              <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden flex my-2">
                <div className="h-full bg-[#00ff87]" style={{ width: '62%' }} />
                <div className="h-full bg-red-500" style={{ width: '38%' }} />
              </div>

              {/* Sample Ladder */}
              <div className="flex flex-col gap-1 text-[11px] font-mono mt-2">
                {[
                  { bidV: '4,250', p: '2,980.25', askV: '1,450' },
                  { bidV: '6,100', p: '2,980.00', askV: '2,800' },
                  { bidV: '8,400', p: '2,979.75', askV: '3,900' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-1 px-1.5 rounded bg-[#0a0d14]">
                    <span className="text-[var(--text-secondary)]">{row.bidV}</span>
                    <span className="text-[#00ff87] font-bold">₹{row.p}</span>
                    <span className="text-[var(--text-secondary)]">{row.askV}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/terminal"
              className="w-full py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-center font-mono text-xs font-semibold text-[var(--text-primary)] hover:text-white transition-colors"
            >
              Open Full Interactive Desk →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
