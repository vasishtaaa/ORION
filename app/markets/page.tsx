'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MarketStatusBadge } from '@/components/ui/MarketStatusBadge';
import { DataDisclaimer } from '@/components/ui/DataDisclaimer';
import { ChangeBadge } from '@/components/ui/Badges';
import {
  Activity, ArrowRight, Globe, BarChart3,
} from 'lucide-react';

const T = {
  emerald: '#10b981', cyan: '#06b6d4', purple: '#818cf8',
  amber: '#fbbf24', red: '#ef4444',
} as const;

const glass = {
  background: 'rgba(14,19,29,0.85)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
} as const;

/* ── NSE index definitions (values from WebSocket where available) ── */
const NSE_INDICES = [
  { name: 'NIFTY 50',    symbol: 'NIFTY50',   desc: 'NSE top 50 large-cap index',         color: '#10b981' },
  { name: 'SENSEX',      symbol: 'SENSEX',    desc: 'BSE 30-stock benchmark index',        color: '#06b6d4' },
  { name: 'BANK NIFTY',  symbol: 'BANKNIFTY', desc: 'NSE banking sector index',            color: '#818cf8' },
  { name: 'NIFTY IT',    symbol: 'NIFTYIT',   desc: 'NSE information technology index',    color: '#fbbf24' },
  { name: 'NIFTY MIDCAP',symbol: 'NIFTYMID',  desc: 'NSE mid-cap 100 index',               color: '#f97316' },
  { name: 'NIFTY AUTO',  symbol: 'NIFTYAUTO', desc: 'NSE automobile sector index',         color: '#a78bfa' },
];

/* ── Global Markets (reference, clearly labeled as indicative) ── */
const GLOBAL_MARKETS = [
  { name: 'Dow Jones',    region: 'US',     note: 'Reference only' },
  { name: 'NASDAQ',       region: 'US',     note: 'Reference only' },
  { name: 'S&P 500',      region: 'US',     note: 'Reference only' },
  { name: 'Nikkei 225',   region: 'Japan',  note: 'Reference only' },
  { name: 'Hang Seng',    region: 'HK',     note: 'Reference only' },
  { name: 'FTSE 100',     region: 'UK',     note: 'Reference only' },
];

/* ── Advance / Decline derived from screener data ── */
function useMarketBreadth(screener: ReturnType<typeof useVortexSocket>['snapshot'] extends null | undefined ? [] : NonNullable<ReturnType<typeof useVortexSocket>['snapshot']>['screener']) {
  return useMemo(() => {
    const advances = screener.filter((s) => s.change_pct > 0).length;
    const declines = screener.filter((s) => s.change_pct < 0).length;
    const unchanged = screener.length - advances - declines;
    return { advances, declines, unchanged, total: screener.length };
  }, [screener]);
}

export default function MarketsPage() {
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();
  const screener = useMemo(() => snapshot?.screener || [], [snapshot?.screener]);
  const breadth = useMarketBreadth(screener);
  const isLoading = status === 'connecting';

  // Avg change of screener universe
  const avgChange = useMemo(() => {
    if (!screener.length) return null;
    return screener.reduce((s, x) => s + x.change_pct, 0) / screener.length;
  }, [screener]);

  return (
    <div className="min-h-screen flex flex-col text-white w-full" style={{ background: '#030712' }}>
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/markets" onTickerSelect={selectTicker} />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* Page Header */}
        <div className="flex flex-col gap-3">
          <Breadcrumb items={[{ label: 'Market Overview' }]} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight">
                Market Overview
              </h1>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                NSE & BSE equity market status · Advance/Decline · Breadth
              </p>
            </div>
            <MarketStatusBadge showTime />
          </div>
        </div>

        {/* Market Breadth KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col gap-2 p-5" style={glass}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Advances</span>
            <span className="text-2xl font-mono font-black" style={{ color: T.emerald }}>
              {isLoading ? '—' : breadth.advances}
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Stocks up today</span>
          </div>
          <div className="flex flex-col gap-2 p-5" style={glass}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Declines</span>
            <span className="text-2xl font-mono font-black" style={{ color: T.red }}>
              {isLoading ? '—' : breadth.declines}
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Stocks down today</span>
          </div>
          <div className="flex flex-col gap-2 p-5" style={glass}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Unchanged</span>
            <span className="text-2xl font-mono font-black" style={{ color: T.amber }}>
              {isLoading ? '—' : breadth.unchanged}
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Flat stocks</span>
          </div>
          <div className="flex flex-col gap-2 p-5" style={glass}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Avg Change</span>
            <span className="text-2xl font-mono font-black" style={{ color: avgChange == null ? 'var(--text-muted)' : avgChange >= 0 ? T.emerald : T.red }}>
              {avgChange == null ? '—' : `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`}
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Universe average</span>
          </div>
        </div>

        {/* A/D Ratio Bar */}
        {breadth.total > 0 && (
          <div className="flex flex-col gap-2 p-5" style={glass}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span style={{ color: T.emerald }}>▲ Advances: {breadth.advances}</span>
              <span className="font-bold text-white">Advance / Decline Ratio</span>
              <span style={{ color: T.red }}>Declines: {breadth.declines} ▼</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(239,68,68,0.2)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round((breadth.advances / breadth.total) * 100)}%`,
                  background: `linear-gradient(90deg, ${T.emerald}, #06b6d4)`,
                }}
                role="progressbar"
                aria-valuenow={breadth.advances}
                aria-valuemin={0}
                aria-valuemax={breadth.total}
                aria-label={`${breadth.advances} advancing out of ${breadth.total}`}
              />
            </div>
            <p className="text-[10px] font-mono text-center" style={{ color: 'var(--text-muted)' }}>
              Based on {breadth.total} instruments tracked by ORION · Data may be delayed
            </p>
          </div>
        )}

        {/* NSE Indices (reference section) */}
        <div className="flex flex-col" style={glass}>
          <div className="flex items-center gap-2.5 p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <BarChart3 className="w-4 h-4" style={{ color: T.emerald }} />
            <h2 className="text-sm font-mono font-bold text-white">Indian Indices</h2>
            <span className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded-full" style={{
              background: 'rgba(251,191,36,0.1)', color: T.amber, border: '1px solid rgba(251,191,36,0.2)',
            }}>
              ⚠ Not live — link to terminal for real-time data
            </span>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {NSE_INDICES.map((idx) => (
              <Link
                key={idx.symbol}
                href="/terminal"
                onClick={() => selectTicker(`${idx.symbol}_NSE`)}
                className="flex flex-col gap-2 p-4 rounded-xl transition-all group"
                style={{ background: 'rgba(10,13,20,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-white group-hover:text-[#10b981] transition-colors">{idx.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: idx.color }} />
                </div>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{idx.desc}</p>
                <p className="text-[10px] font-mono" style={{ color: idx.color }}>View in terminal →</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Global Markets — clearly labeled as reference */}
        <div className="flex flex-col" style={glass}>
          <div className="flex items-center gap-2.5 p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Globe className="w-4 h-4" style={{ color: T.cyan }} />
            <h2 className="text-sm font-mono font-bold text-white">Global Markets</h2>
            <span className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded-full" style={{
              background: 'rgba(251,191,36,0.1)', color: T.amber, border: '1px solid rgba(251,191,36,0.2)',
            }}>
              ⚠ Global feed not connected — reference only
            </span>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GLOBAL_MARKETS.map((mkt) => (
              <div
                key={mkt.name}
                className="flex flex-col gap-1 p-4 rounded-xl"
                style={{ background: 'rgba(10,13,20,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-white">{mkt.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(107,114,128,0.2)', color: '#6b7280' }}>
                    {mkt.region}
                  </span>
                </div>
                <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  Live feed not connected
                </span>
                <span className="text-[9px] font-mono" style={{ color: '#6b7280' }}>{mkt.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Screener Universe */}
        {screener.length > 0 && (
          <div className="flex flex-col" style={glass}>
            <div className="flex items-center gap-2.5 p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <Activity className="w-4 h-4" style={{ color: T.emerald }} />
              <h2 className="text-sm font-mono font-bold text-white">ORION Universe — {screener.length} Instruments</h2>
              <Link href="/screener" className="ml-auto flex items-center gap-1 text-xs font-mono" style={{ color: T.emerald }}>
                Full Screener <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono min-w-[500px]">
                <thead className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                  <tr>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider">Ticker</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider">Price</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider">Change</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider">RSI</th>
                    <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {screener.slice(0, 10).map((item) => (
                    <tr
                      key={item.ticker}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => selectTicker(item.ticker)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{item.ticker}</span>
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white tabular-nums">₹{item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <ChangeBadge changePct={item.change_pct} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{
                        color: item.rsi >= 70 ? T.red : item.rsi <= 30 ? T.emerald : 'var(--text-secondary)',
                        fontWeight: (item.rsi >= 70 || item.rsi <= 30) ? 700 : 400,
                      }}>
                        {item.rsi.toFixed(1)}
                      </td>
                      <td className="px-5 py-3 text-right" style={{ color: 'var(--text-muted)' }}>
                        {item.volume.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4">
              <Link href="/screener" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-mono font-semibold transition-all" style={{
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: T.emerald,
              }}>
                View Full Screener with Filters <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        <DataDisclaimer />
      </main>
    </div>
  );
}
