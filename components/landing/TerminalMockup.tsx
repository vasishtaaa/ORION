'use client';
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { SignalBadge } from '@/components/ui/Badges';

/**
 * TerminalMockup — Redesigned as a native glass application window.
 *
 * Changes from original:
 *  - Full macOS-accurate window chrome (real red/yellow/green traffic lights)
 *  - Frosted glass backdrop with ambient emerald + cyan glow layers
 *  - Gradient-border technique (no thick solid border)
 *  - Richer L2 order book with color-coded depth bars
 *  - JetBrains Mono enforced on all numeric content
 *  - No layout changes to the slot structure (8-col chart, 4-col book)
 */
export function TerminalMockup() {
  return (
    /* Outer frame — gradient border trick via background + p-px */
    <div
      className="relative w-full shadow-[0_32px_80px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden"
      style={{ borderRadius: '20px' }}
    >
      {/* Multi-layer ambient glow behind the window */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.18) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.12) 0%, transparent 70%)' }} />

      {/* Glass window body */}
      <div
        className="relative z-10 w-full flex flex-col overflow-hidden"
        style={{
          background: 'rgba(10, 15, 26, 0.88)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* ── Window Title Bar ── */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{
            background: 'rgba(6, 10, 20, 0.6)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          {/* Traffic lights — accurate macOS colors */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_6px_rgba(255,95,86,0.6)]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_6px_rgba(255,189,46,0.5)]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_6px_rgba(39,201,63,0.5)]" />
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-white font-bold tracking-wide">RELI_NSE</span>
              <span className="text-[#10b981] font-semibold">₹1,288.50</span>
              <span className="text-red-400 font-semibold text-[11px]">-0.73%</span>
              <SignalBadge signal="BUY" />
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-[rgba(240,253,244,0.4)]">
              Latency: <span className="text-[#10b981] font-bold">480 μs</span>
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider"
              style={{
                background: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              LIVE FEED
            </span>
          </div>
        </div>

        {/* ── Terminal Content ── */}
        <div className="relative p-5 sm:p-6 flex flex-col gap-5">
          {/* Ambient inner glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(16,185,129,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.04) 0%, transparent 50%)' }} />

          {/* Metric cards row */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'LAST PRICE',  val: '₹1,288.50', sub: '-0.73%',   icon: <DollarSign className="w-3.5 h-3.5" style={{ color: '#10b981' }} />, subColor: '#f87171' },
              { label: 'TARGET',      val: '₹1,335.00', sub: '88% Conf.', icon: <TrendingUp  className="w-3.5 h-3.5" style={{ color: '#10b981' }} />, subColor: '#10b981' },
              { label: 'THROUGHPUT',  val: '12,450 p/s', sub: 'Real-time', icon: <Zap         className="w-3.5 h-3.5" style={{ color: '#06b6d4' }} />, subColor: '#06b6d4' },
              { label: 'P50 LATENCY', val: '520 μs',    sub: 'p50 Index', icon: <ShieldCheck  className="w-3.5 h-3.5" style={{ color: '#10b981' }} />, subColor: 'rgba(240,253,244,0.4)' },
            ].map((m, i) => (
              <div
                key={i}
                className="p-4 flex flex-col justify-between gap-2 rounded-xl"
                style={{
                  background: 'rgba(15,23,42,0.5)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      color: 'rgba(240,253,244,0.35)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {m.label}
                  </span>
                  {m.icon}
                </div>
                <div className="flex items-baseline justify-between gap-1 mt-1">
                  <span className="text-base sm:text-lg font-mono font-bold text-white">{m.val}</span>
                  <span className="text-[10px] font-mono font-bold" style={{ color: m.subColor }}>{m.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Order Book */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Candlestick Chart */}
            <div
              className="lg:col-span-8 p-5 rounded-xl flex flex-col gap-4 h-64 sm:h-72 relative overflow-hidden"
              style={{
                background: 'rgba(3,7,18,0.5)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {/* Chart header */}
              <div className="flex justify-between items-center font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">Volumetric Candlesticks</span>
                  <span className="text-[11px] font-bold" style={{ color: '#06b6d4' }}>VWAP 1,280.40</span>
                  <span className="text-[11px] font-bold text-yellow-400">SMA(20) 1,278.50</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(16,185,129,0.18)', color: '#10b981' }}>LIVE</span>
                  <span className="px-2 py-0.5 text-[rgba(240,253,244,0.35)]">1D</span>
                  <span className="px-2 py-0.5 text-[rgba(240,253,244,0.35)]">1W</span>
                </div>
              </div>

              {/* VWAP line */}
              <div className="absolute inset-x-5 top-[40%] h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.7), transparent)', boxShadow: '0 0 10px rgba(6,182,212,0.5)' }} />

              {/* Candlesticks */}
              <div className="flex-1 flex items-end justify-between gap-1 px-2 pb-2">
                {[
                  { h: 45, up: true }, { h: 55, up: true }, { h: 48, up: false }, { h: 62, up: true },
                  { h: 58, up: false }, { h: 72, up: true }, { h: 68, up: false }, { h: 80, up: true },
                  { h: 75, up: false }, { h: 88, up: true }, { h: 84, up: false }, { h: 95, up: true },
                  { h: 90, up: false }, { h: 100, up: true }, { h: 96, up: false }, { h: 105, up: true },
                ].map((c, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: `${c.h * 0.65}%`,
                        background: c.up ? '#10b981' : '#f87171',
                        boxShadow: c.up ? '0 0 6px rgba(16,185,129,0.35)' : '0 0 6px rgba(248,113,113,0.25)',
                      }}
                    />
                  </div>
                ))}
              </div>

              <div
                className="flex justify-between font-mono text-[10px] pt-2 border-t"
                style={{ color: 'rgba(240,253,244,0.3)', borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <span>09:15</span><span>11:30</span><span>13:45</span><span>15:30</span>
              </div>
            </div>

            {/* L2 Order Book */}
            <div
              className="lg:col-span-4 p-5 rounded-xl flex flex-col gap-3 h-64 sm:h-72"
              style={{
                background: 'rgba(3,7,18,0.5)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex justify-between items-center font-mono text-xs font-bold pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#10b981' }}>
                <span>L2 Order Book</span>
                <span className="text-[10px]">OBI: +24.5%</span>
              </div>

              {/* Imbalance gauge */}
              <div className="w-full h-1.5 rounded-full overflow-hidden flex" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div className="h-full" style={{ width: '62%', background: 'linear-gradient(90deg, #059669, #10b981)' }} />
                <div className="h-full" style={{ width: '38%', background: '#f87171' }} />
              </div>

              {/* Ask rows */}
              <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                {[
                  { p: '1,290.00', v: '1,450', pct: 45 },
                  { p: '1,289.75', v: '2,800', pct: 62 },
                  { p: '1,289.50', v: '3,900', pct: 80 },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between items-center py-1 px-2 rounded relative overflow-hidden" style={{ background: 'rgba(248,113,113,0.04)' }}>
                    <div className="absolute right-0 top-0 bottom-0 rounded" style={{ width: `${r.pct}%`, background: 'rgba(248,113,113,0.12)' }} />
                    <span className="relative text-[rgba(240,253,244,0.5)]">{r.v}</span>
                    <span className="relative font-bold" style={{ color: '#f87171' }}>₹{r.p}</span>
                  </div>
                ))}
                <div className="text-center py-1.5 font-bold text-[10px]" style={{ color: 'rgba(240,253,244,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  SPREAD 0.25
                </div>
                {/* Bid rows */}
                {[
                  { p: '1,289.25', v: '4,100', pct: 70 },
                  { p: '1,289.00', v: '1,800', pct: 30 },
                  { p: '1,288.75', v: '6,500', pct: 90 },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between items-center py-1 px-2 rounded relative overflow-hidden" style={{ background: 'rgba(16,185,129,0.04)' }}>
                    <div className="absolute right-0 top-0 bottom-0 rounded" style={{ width: `${r.pct}%`, background: 'rgba(16,185,129,0.1)' }} />
                    <span className="relative text-[rgba(240,253,244,0.5)]">{r.v}</span>
                    <span className="relative font-bold text-[#10b981]">₹{r.p}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/terminal"
                className="mt-auto w-full py-2 rounded-full text-center font-mono text-xs font-semibold transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(240,253,244,0.7)',
                }}
              >
                Open Full Desk →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
