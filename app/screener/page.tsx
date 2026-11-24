'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { SignalBadge, ChangeBadge } from '@/components/ui/Badges';
import { Button } from '@/components/ui/Button';
import { exportScreenerToCSV } from '@/lib/export';
import { useToast } from '@/components/ui/Toast';
import {
  Search, Download, ArrowUpDown, Filter, Flame, TrendingUp, TrendingDown,
  Activity, Loader2, BarChart3, RefreshCw
} from 'lucide-react';
import { ScreenerItem, MarketMoverItem } from '@/lib/types';

/* ── Skeleton row component ─────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className={`h-3 rounded-full bg-white/5 animate-pulse ${i === 0 ? 'w-24' : i === 7 ? 'w-16 ml-auto' : 'w-16'}`} />
          {i === 0 && <div className="h-2 rounded-full bg-white/5 animate-pulse w-32 mt-1.5" />}
        </td>
      ))}
    </tr>
  );
}

/* ── Empty state component ───────────────────────────────────────────────── */
function EmptyState({ search, filterType }: { search: string; filterType: string }) {
  const hasFilter = search || filterType !== 'ALL';
  return (
    <tr>
      <td colSpan={8}>
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0a0d14] border border-white/10 flex items-center justify-center">
            {hasFilter
              ? <Filter className="w-7 h-7 text-[var(--text-muted)]" />
              : <BarChart3 className="w-7 h-7 text-[var(--text-muted)]" />
            }
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-mono font-bold text-sm text-[var(--text-secondary)]">
              {hasFilter ? 'No equities match your filter' : 'Loading market data…'}
            </p>
            <p className="font-mono text-xs text-[var(--text-muted)] max-w-xs">
              {hasFilter
                ? 'Try clearing the search or selecting a different signal filter'
                : 'The engine is polling Google Finance & Alpha Vantage. Screener populates within 15–30 seconds of startup.'}
            </p>
          </div>
          {!hasFilter && (
            <div className="flex items-center gap-2 text-[#00ff87] font-mono text-xs animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Collecting live data…</span>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function ScreenerPage() {
  const router = useRouter();
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();
  const { success } = useToast();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL' | 'OVERSOLD' | 'OVERBOUGHT'>('ALL');
  const [sortField, setSortField] = useState<keyof ScreenerItem>('quant_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [moverTab, setMoverTab] = useState<'gainers' | 'losers' | 'active'>('gainers');

  const rawItems: ScreenerItem[] = useMemo(() => snapshot?.screener || [], [snapshot?.screener]);
  const marketMovers = snapshot?.market_movers;
  const fxRates = snapshot?.fx_rates || [{ pair: 'USD/INR', rate: 95.74, bid: 95.73, ask: 95.75 }];

  /* Is data still loading? */
  const isLoading = status === 'connected' && rawItems.length === 0;
  const isDisconnected = status !== 'connected' && rawItems.length === 0;

  const filteredItems = useMemo(() => {
    return rawItems
      .filter((item) => {
        const matchesSearch =
          item.ticker.toLowerCase().includes(search.toLowerCase()) ||
          item.name.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        const sig = item.recommendation || item.signal || 'HOLD';
        if (filterType === 'BUY') return sig === 'BUY';
        if (filterType === 'SELL') return sig === 'SELL';
        if (filterType === 'OVERSOLD') return item.rsi <= 40;
        if (filterType === 'OVERBOUGHT') return item.rsi >= 60;
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField] ?? 0;
        const valB = b[sortField] ?? 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      });
  }, [rawItems, search, filterType, sortField, sortAsc]);

  const handleSort = (field: keyof ScreenerItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExport = () => {
    exportScreenerToCSV(filteredItems);
    success(`Exported ${filteredItems.length} screener equities to CSV`);
  };

  const displayedMovers: MarketMoverItem[] = useMemo(() => {
    if (!marketMovers) return [];
    if (moverTab === 'gainers') return marketMovers.top_gainers || [];
    if (moverTab === 'losers') return marketMovers.top_losers || [];
    return marketMovers.most_actively_traded || [];
  }, [marketMovers, moverTab]);

  const showSkeletons = isLoading || isDisconnected;

  const thClass = 'px-4 py-4 cursor-pointer hover:text-white select-none whitespace-nowrap';
  const thFirst = 'pl-5 sm:pl-6 pr-4 py-4 cursor-pointer hover:text-white select-none whitespace-nowrap';

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white w-full overflow-x-hidden">
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/screener"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <main className="flex-1 w-full px-6 sm:px-8 lg:px-12 py-8 flex flex-col gap-6">

        {/* ── FX Telemetry Ribbon ─────────────────────────────────────────── */}
        <div className="w-full px-4 py-3 rounded-xl bg-[#0e131d]/90 border border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              ALPHA VANTAGE TELEMETRY
            </span>
            <span className="text-[var(--text-muted)] text-[11px] hidden sm:inline">Institutional FX &amp; Movers Feed</span>
          </div>
          <div className="flex items-center gap-5 flex-wrap text-xs">
            {fxRates.map((fx, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-[var(--text-secondary)]">{fx.pair}:</span>
                <span className="text-[#00ff87] font-bold">₹{fx.rate.toFixed(2)}</span>
                {fx.bid && fx.ask && (
                  <span className="text-[10px] text-[var(--text-muted)] hidden md:inline">
                    (B: {fx.bid.toFixed(2)} / A: {fx.ask.toFixed(2)})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Market Movers Card ──────────────────────────────────────────── */}
        {displayedMovers.length > 0 && (
          <div className="w-full p-5 sm:p-6 rounded-2xl bg-[#0e131d]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-4">
            {/* Card header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm sm:text-base font-mono font-bold text-white uppercase tracking-wider">
                  Alpha Vantage Market Movers
                </h2>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0a0d14] p-1 rounded-lg border border-white/10 text-xs font-mono">
                <button
                  onClick={() => setMoverTab('gainers')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    moverTab === 'gainers' ? 'bg-emerald-950/80 text-[#00ff87] font-bold' : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" /> Gainers
                </button>
                <button
                  onClick={() => setMoverTab('losers')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    moverTab === 'losers' ? 'bg-red-950/80 text-red-400 font-bold' : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-3 h-3" /> Losers
                </button>
                <button
                  onClick={() => setMoverTab('active')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    moverTab === 'active' ? 'bg-cyan-950/80 text-cyan-300 font-bold' : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  <Activity className="w-3 h-3" /> Most Active
                </button>
              </div>
            </div>

            {/* Mover cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {displayedMovers.slice(0, 12).map((m, idx) => {
                const chgPct = parseFloat(m.change_percentage.replace('%', '')) || 0;
                const isPos = chgPct >= 0;
                return (
                  <div
                    key={idx}
                    onClick={() => { selectTicker(m.ticker); router.push('/terminal'); }}
                    className="p-3 rounded-xl bg-[#0a0d14] border border-white/10 hover:border-[#00ff87]/50 hover:bg-[#00ff87]/5 transition-all cursor-pointer flex flex-col gap-1.5 shadow-sm group"
                  >
                    <div className="flex justify-between items-center gap-1">
                      <span className="font-mono font-bold text-xs text-white truncate group-hover:text-[#00ff87]">{m.ticker}</span>
                      <span className={`text-[10px] font-mono font-bold shrink-0 ${isPos ? 'text-[#00ff87]' : 'text-red-400'}`}>
                        {isPos ? '▲' : '▼'} {Math.abs(chgPct).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm font-mono font-bold text-white">${parseFloat(m.price).toFixed(2)}</div>
                    <div className="text-[9px] font-mono text-[var(--text-muted)] truncate">Vol: {parseInt(m.volume).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Screener Header & Controls Toolbar ─────────────────────────── */}
        <div className="w-full p-5 sm:p-6 rounded-2xl bg-[#0e131d]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg sm:text-2xl font-mono font-bold text-white tracking-wider flex items-center gap-2.5">
              QUANTITATIVE TECHNICAL SCREENER
              <span className="px-3 py-0.5 rounded-full bg-[#00ff87]/20 text-[#00ff87] text-xs font-bold border border-[#00ff87]/30">
                {filteredItems.length} EQUITIES
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)]">
              Multi-factor technical ranking powered by Alpha Vantage &amp; institutional tick feeds
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter stocks..."
                className="pl-9 pr-4 py-2 rounded-full bg-[#0a0d14] border border-white/10 text-xs font-mono text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[#00ff87] transition-colors w-48"
              />
            </div>

            {/* Status indicator */}
            {showSkeletons && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)]">
                <RefreshCw className="w-3 h-3 animate-spin text-[#00ff87]" />
                <span>Loading data…</span>
              </div>
            )}

            {/* CSV Export */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* ── Filter Pill Switcher ────────────────────────────────────────── */}
        <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <Filter className="w-3.5 h-3.5 text-[var(--matrix)] shrink-0" />
          {[
            { label: 'All Equities', val: 'ALL' },
            { label: '🟢 Buy Signals', val: 'BUY' },
            { label: '🔴 Sell Signals', val: 'SELL' },
            { label: '⚡ Oversold RSI < 40', val: 'OVERSOLD' },
            { label: '🔥 Overbought RSI > 60', val: 'OVERBOUGHT' },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFilterType(f.val as typeof filterType)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === f.val
                  ? 'bg-[#50C878] text-black font-bold shadow-[0_0_12px_rgba(80,200,120,0.4)]'
                  : 'bg-[#0e131d] text-[var(--text-secondary)] hover:text-white border border-white/10 hover:border-white/25'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Screener Data Table ─────────────────────────────────────────── */}
        <div className="w-full rounded-2xl bg-[#0e131d]/90 border border-white/10 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs min-w-[700px]">
              <thead className="bg-black/40 border-b border-white/10 text-[var(--text-muted)] uppercase text-[10px] tracking-wider sticky top-0 z-10">
                <tr>
                  <th className={thFirst} onClick={() => handleSort('ticker')}>
                    <div className="flex items-center gap-1.5"><span>TICKER</span><ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className={thClass} onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1.5"><span>LTP (₹)</span><ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className={thClass} onClick={() => handleSort('change_pct')}>
                    <div className="flex items-center gap-1.5"><span>24H CHG</span><ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className={thClass} onClick={() => handleSort('rsi')}>
                    <div className="flex items-center gap-1.5"><span>RSI(14)</span><ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className={thClass} onClick={() => handleSort('quant_score')}>
                    <div className="flex items-center gap-1.5"><span>QUANT SCORE</span><ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className={thClass}>AI SIGNAL</th>
                  <th className={thClass} onClick={() => handleSort('volume')}>
                    <div className="flex items-center gap-1.5"><span>VOLUME</span><ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-4 text-right pr-5 sm:pr-6">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {showSkeletons
                  ? [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                  : filteredItems.length === 0
                  ? <EmptyState search={search} filterType={filterType} />
                  : filteredItems.map((item) => (
                    <tr
                      key={item.ticker}
                      className="hover:bg-[rgba(80,200,120,0.05)] transition-colors group cursor-pointer"
                      onClick={() => { selectTicker(item.ticker); router.push('/terminal'); }}
                    >
                      <td className="pl-5 sm:pl-6 pr-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-[#00ff87] transition-colors">
                            {item.ticker}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[160px]">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-white tabular-nums">₹{item.price.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <ChangeBadge changePct={item.change_pct} />
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        <span
                          className={`font-semibold ${
                            item.rsi >= 70 ? 'text-red-400 font-bold' : item.rsi <= 30 ? 'text-[#00ff87] font-bold' : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {item.rsi.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        <span className={item.quant_score >= 0 ? 'text-[#00ff87] font-bold' : 'text-red-400 font-bold'}>
                          {item.quant_score >= 0 ? `+${item.quant_score.toFixed(3)}` : item.quant_score.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <SignalBadge signal={item.recommendation || item.signal || 'HOLD'} />
                      </td>
                      <td className="px-4 py-4 text-[var(--text-muted)] tabular-nums">{item.volume.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right pr-5 sm:pr-6">
                        <Button variant="ghost" size="sm">Trade →</Button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
