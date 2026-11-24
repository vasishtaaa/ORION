'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MarketStatusBadge } from '@/components/ui/MarketStatusBadge';
import { DataDisclaimer } from '@/components/ui/DataDisclaimer';
import { SignalBadge, ChangeBadge } from '@/components/ui/Badges';
import {
  TrendingUp, TrendingDown, Activity, Newspaper, BarChart2, ArrowRight,
  Cpu, Brain, Loader2,
} from 'lucide-react';

/* ── Design tokens ───────────────────────────────────────────────────────── */
const T = {
  emerald: '#10b981',
  cyan: '#06b6d4',
  purple: '#818cf8',
  amber: '#fbbf24',
  red: '#ef4444',
} as const;

const glass = {
  background: 'rgba(14,19,29,0.85)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
} as const;

/* ── Metric summary card ─────────────────────────────────────────────────── */
function KpiCard({
  label, value, sub, color = T.emerald, loading = false,
}: { label: string; value: string | number; sub?: string; color?: string; loading?: boolean }) {
  return (
    <div
      className="flex flex-col gap-2 p-5"
      style={glass}
    >
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      {loading ? (
        <div className="h-7 w-24 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
      ) : (
        <span className="text-xl sm:text-2xl font-mono font-black tabular-nums" style={{ color }}>
          {value}
        </span>
      )}
      {sub && <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
    </div>
  );
}

/* ── Section Header ─────────────────────────────────────────────────────── */
function SectionHeader({
  title, subtitle, href, linkLabel, icon: Icon, accent = T.emerald,
}: {
  title: string; subtitle?: string; href?: string; linkLabel?: string;
  icon?: React.ElementType; accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className="p-2 rounded-xl"
            style={{ background: `${accent}12`, color: accent }}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h2 className="text-sm sm:text-base font-mono font-bold text-white">{title}</h2>
          {subtitle && (
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-mono font-semibold transition-colors hover:text-white"
          style={{ color: accent }}
        >
          {linkLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

/* ── Mover mini-card ────────────────────────────────────────────────────── */
function MoverCard({
  ticker, price, changePct, volume, onClick,
}: {
  ticker: string; price: string; changePct: number; volume?: string; onClick?: () => void;
}) {
  const isPos = changePct >= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer"
      style={{
        background: 'rgba(10,13,20,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-mono font-bold text-xs text-white">{ticker}</span>
        {volume && <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>Vol: {volume}</span>}
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-mono font-bold text-xs text-white tabular-nums">${parseFloat(price).toFixed(2)}</span>
        <span
          className="text-[10px] font-mono font-bold"
          style={{ color: isPos ? T.emerald : T.red }}
        >
          {isPos ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
        </span>
      </div>
    </button>
  );
}

/* ── Main Dashboard Page ─────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();

  const isLoading = status === 'connecting';
  const screenerItems = useMemo(() => snapshot?.screener || [], [snapshot?.screener]);
  const movers = snapshot?.market_movers;
  const news = (snapshot?.news || []).slice(0, 6);
  const fxRates = snapshot?.fx_rates || [];

  // Top 5 screener items by quant score
  const topStocks = useMemo(
    () => [...screenerItems].sort((a, b) => b.quant_score - a.quant_score).slice(0, 5),
    [screenerItems],
  );

  // AI signal distribution
  const signalCounts = useMemo(() => {
    const counts = { BUY: 0, SELL: 0, HOLD: 0 };
    screenerItems.forEach((s) => {
      const sig = s.recommendation || s.signal || 'HOLD';
      counts[sig] = (counts[sig] || 0) + 1;
    });
    return counts;
  }, [screenerItems]);

  return (
    <div className="min-h-screen flex flex-col text-white w-full" style={{ background: '#030712' }}>
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/dashboard"
        onTickerSelect={selectTicker}
      />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <Breadcrumb items={[{ label: 'Dashboard' }]} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight">
                Market Dashboard
              </h1>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                Live market command center · NSE & BSE
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MarketStatusBadge showTime />
              {status === 'connecting' && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: T.emerald }} />
                  Connecting…
                </span>
              )}
              {status === 'connected' && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: T.emerald }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.emerald }} />
                  Live
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── KPI row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard
            label="Instruments Tracked"
            value={screenerItems.length || '—'}
            sub="NSE & BSE equities"
            color={T.emerald}
            loading={isLoading}
          />
          <KpiCard
            label="BUY Signals"
            value={screenerItems.length ? signalCounts.BUY : '—'}
            sub="AI-generated signals"
            color={T.emerald}
            loading={isLoading}
          />
          <KpiCard
            label="SELL Signals"
            value={screenerItems.length ? signalCounts.SELL : '—'}
            sub="AI-generated signals"
            color={T.red}
            loading={isLoading}
          />
          <KpiCard
            label="WS Latency"
            value={snapshot?.latency_p50 ? `${snapshot.latency_p50.toFixed(0)} μs` : '—'}
            sub="P50 engine latency"
            color={T.cyan}
            loading={isLoading}
          />
        </div>

        {/* ── FX Rates ────────────────────────────────────────────────── */}
        {fxRates.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(14,19,29,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              FX Rates
            </span>
            {fxRates.map((fx, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-mono">
                <span style={{ color: 'var(--text-secondary)' }}>{fx.pair}:</span>
                <span className="font-bold" style={{ color: T.emerald }}>
                  ₹{fx.rate.toFixed(2)}
                </span>
              </div>
            ))}
            <span className="ml-auto text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
              Via Alpha Vantage · May be delayed
            </span>
          </div>
        )}

        {/* ── Two-column grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Top AI Signals — 2/3 width */}
          <div className="lg:col-span-2 flex flex-col" style={glass}>
            <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <SectionHeader
                title="Top AI Signals"
                subtitle="Highest quant-score instruments"
                href="/screener"
                linkLabel="Full Screener"
                icon={Brain}
                accent={T.emerald}
              />
            </div>
            <div className="p-5 flex flex-col gap-0">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="py-3 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-3 w-16 rounded animate-pulse ml-auto" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                ))
              ) : topStocks.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    Waiting for live market data…
                  </p>
                  <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                    Engine polls within 15–30 seconds of startup
                  </p>
                </div>
              ) : (
                topStocks.map((item) => (
                  <button
                    key={item.ticker}
                    type="button"
                    onClick={() => { selectTicker(item.ticker); }}
                    className="py-3 flex items-center justify-between gap-3 text-left hover:bg-white/[0.02] transition-colors w-full cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono font-bold text-sm text-white">{item.ticker}</span>
                      <span className="text-[10px] font-mono truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-sm text-white tabular-nums">
                        ₹{item.price.toFixed(2)}
                      </span>
                      <ChangeBadge changePct={item.change_pct} />
                      <SignalBadge signal={item.recommendation || item.signal || 'HOLD'} />
                    </div>
                  </button>
                ))
              )}
            </div>
            {topStocks.length > 0 && (
              <div className="px-5 pb-4">
                <Link
                  href="/screener"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-mono font-semibold transition-all"
                  style={{
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    color: T.emerald,
                  }}
                >
                  View All {screenerItems.length} Instruments
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Market Movers sidebar — 1/3 width */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col" style={glass}>
              <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <SectionHeader
                  title="Top Gainers"
                  href="/movers"
                  linkLabel="All Movers"
                  icon={TrendingUp}
                  accent={T.emerald}
                />
              </div>
              <div className="p-4 flex flex-col gap-2">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  ))
                ) : (movers?.top_gainers || []).slice(0, 5).map((m, i) => (
                  <MoverCard
                    key={i}
                    ticker={m.ticker}
                    price={m.price}
                    changePct={parseFloat(m.change_percentage.replace('%', ''))}
                    volume={parseInt(m.volume).toLocaleString()}
                  />
                ))}
                {!isLoading && !movers?.top_gainers?.length && (
                  <p className="text-[10px] font-mono text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    Awaiting data…
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col" style={glass}>
              <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <SectionHeader
                  title="Top Losers"
                  href="/movers"
                  linkLabel="View All"
                  icon={TrendingDown}
                  accent={T.red}
                />
              </div>
              <div className="p-4 flex flex-col gap-2">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  ))
                ) : (movers?.top_losers || []).slice(0, 4).map((m, i) => (
                  <MoverCard
                    key={i}
                    ticker={m.ticker}
                    price={m.price}
                    changePct={parseFloat(m.change_percentage.replace('%', ''))}
                  />
                ))}
                {!isLoading && !movers?.top_losers?.length && (
                  <p className="text-[10px] font-mono text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    Awaiting data…
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Latest News ───────────────────────────────────────────────── */}
        <div className="flex flex-col" style={glass}>
          <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <SectionHeader
              title="Financial News Wire"
              subtitle="Real-time market intelligence"
              href="/news"
              linkLabel="Full News Feed"
              icon={Newspaper}
              accent={T.amber}
            />
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 rounded-xl" style={{ background: 'rgba(10,13,20,0.6)' }}>
                  <div className="h-2 w-16 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="h-10 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
              ))
            ) : news.length === 0 ? (
              <div className="col-span-3 py-8 text-center">
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  News feed connecting…
                </p>
              </div>
            ) : (
              news.map((item, i) => {
                const isBull = (item.sentiment || 0) > 0.1;
                const isBear = (item.sentiment || 0) < -0.1;
                return (
                  <div
                    key={i}
                    className="flex flex-col gap-2 p-4 rounded-xl transition-colors"
                    style={{ background: 'rgba(10,13,20,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full" style={{
                        background: 'rgba(16,185,129,0.1)', color: T.emerald, border: '1px solid rgba(16,185,129,0.2)',
                      }}>
                        {item.source}
                      </span>
                      <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{item.ts}</span>
                    </div>
                    <p className="text-xs font-sans font-semibold text-white leading-snug line-clamp-3">
                      {item.headline}
                    </p>
                    <span className={`self-start text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isBull ? 'text-emerald-400' : isBear ? 'text-red-400' : 'text-gray-500'
                    }`} style={{
                      background: isBull ? 'rgba(16,185,129,0.08)' : isBear ? 'rgba(239,68,68,0.08)' : 'rgba(107,114,128,0.08)',
                    }}>
                      {isBull ? '▲ BULLISH' : isBear ? '▼ BEARISH' : '• NEUTRAL'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          {news.length > 0 && (
            <div className="px-5 pb-5">
              <Link
                href="/news"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-mono font-semibold transition-all"
                style={{
                  background: 'rgba(251,191,36,0.06)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  color: T.amber,
                }}
              >
                <Newspaper className="w-3.5 h-3.5" />
                Open Full News Wire
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* ── Quick Access Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/terminal',   label: 'Live Terminal',  Icon: BarChart2, accent: T.emerald, desc: 'Real-time order flow & charts' },
            { href: '/screener',   label: 'Stock Screener', Icon: Activity,  accent: T.cyan,    desc: 'Multi-factor equity screening' },
            { href: '/analyst',    label: 'AI Analyst',     Icon: Brain,     accent: T.purple,  desc: 'Gemini-powered trade analysis' },
            { href: '/telemetry',  label: 'Telemetry',      Icon: Cpu,       accent: T.amber,   desc: 'Engine health & latency' },
          ].map(({ href, label, Icon, accent, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col gap-3 p-4 rounded-2xl transition-all group"
              style={{ background: 'rgba(14,19,29,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="p-2.5 rounded-xl w-fit transition-transform group-hover:scale-110" style={{ background: `${accent}12`, color: accent }}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-mono font-bold text-white group-hover:text-[#10b981] transition-colors">{label}</p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 mt-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
            </Link>
          ))}
        </div>

        {/* ── Data Disclaimer ──────────────────────────────────────────── */}
        <DataDisclaimer />

      </main>
    </div>
  );
}
