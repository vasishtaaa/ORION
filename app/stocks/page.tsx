'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MarketStatusBadge } from '@/components/ui/MarketStatusBadge';
import { DataDisclaimer } from '@/components/ui/DataDisclaimer';
import { SignalBadge, ChangeBadge } from '@/components/ui/Badges';
import { Search, TrendingUp, ArrowRight, BarChart2, Activity } from 'lucide-react';

const T = { emerald: '#10b981', cyan: '#06b6d4', amber: '#fbbf24', red: '#ef4444' } as const;
const glass = { background: 'rgba(14,19,29,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' } as const;

export default function StocksPage() {
  const router = useRouter();
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'quant_score' | 'change_pct' | 'price' | 'rsi'>('quant_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const screener = useMemo(() => snapshot?.screener || [], [snapshot?.screener]);
  const isLoading = status === 'connecting';

  const filtered = useMemo(() => {
    let items = screener;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (s) => s.ticker.toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q)
      );
    }
    return [...items].sort((a, b) => {
      const getVal = (item: typeof a) => {
        if (sortBy === 'quant_score') return item.quant_score ?? 0;
        if (sortBy === 'change_pct') return item.change_pct ?? 0;
        if (sortBy === 'price') return item.price ?? 0;
        if (sortBy === 'rsi') return item.rsi ?? 0;
        return 0;
      };
      const aVal = getVal(a);
      const bVal = getVal(b);
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [screener, search, sortBy, sortDir]);

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir((d) => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
    if (sortBy !== col) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>⇅</span>;
    return <span style={{ color: T.emerald }}>{sortDir === 'desc' ? '↓' : '↑'}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col text-white w-full" style={{ background: '#030712' }}>
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/stocks" onTickerSelect={selectTicker} />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        <div className="flex flex-col gap-3">
          <Breadcrumb items={[{ label: 'Stocks' }]} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight flex items-center gap-2.5">
                <TrendingUp className="w-6 h-6" style={{ color: T.emerald }} aria-hidden="true" />
                Stock Universe
              </h1>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {screener.length > 0 ? `${screener.length} instruments tracked by ORION` : 'Connecting to live data…'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MarketStatusBadge showTime />
            </div>
          </div>
        </div>

        {/* Search + Sort controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticker or company name…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-mono text-white placeholder-[var(--text-muted)] focus:outline-none transition-colors"
              style={{ background: 'rgba(14,19,29,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}
              aria-label="Search stocks"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Sort:</span>
            {(['quant_score', 'change_pct', 'price', 'rsi'] as const).map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => handleSort(col)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold transition-all cursor-pointer"
                style={sortBy === col ? {
                  background: 'rgba(16,185,129,0.15)', color: T.emerald, border: '1px solid rgba(16,185,129,0.3)',
                } : {
                  background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {col.replace('_', ' ').replace('pct', '%')}
                {' '}<SortIcon col={col} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Activity className="w-4 h-4" style={{ color: T.emerald }} aria-hidden="true" />
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} {search ? 'matches' : 'instruments'}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/screener', label: 'Advanced Screener', Icon: Activity, desc: 'Multi-factor filtering & sorting', color: T.cyan },
            { href: '/movers',   label: 'Market Movers',    Icon: TrendingUp, desc: 'Top gainers, losers & most active', color: T.emerald },
            { href: '/terminal', label: 'Live Terminal',    Icon: BarChart2, desc: 'Full chart, L2 order book & AI signal', color: T.amber },
          ].map(({ href, label, Icon, desc, color }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all group"
              style={{ background: 'rgba(14,19,29,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${color}12`, color }}>
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-mono font-bold text-sm text-white group-hover:text-[#10b981] transition-colors">{label}</p>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color }} />
            </a>
          ))}
        </div>

        {/* Stocks table */}
        <div className="flex flex-col" style={glass}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-mono font-bold text-white">
              {search ? `Search Results for "${search}"` : 'All Tracked Instruments'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono min-w-[700px]">
              <thead className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                <tr>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider">Ticker</th>
                  <th
                    className="text-right px-4 py-3 text-[10px] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    Price <SortIcon col="price" />
                  </th>
                  <th
                    className="text-right px-4 py-3 text-[10px] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('change_pct')}
                  >
                    Change % <SortIcon col="change_pct" />
                  </th>
                  <th
                    className="text-right px-4 py-3 text-[10px] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('rsi')}
                  >
                    RSI <SortIcon col="rsi" />
                  </th>
                  <th
                    className="text-right px-4 py-3 text-[10px] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('quant_score')}
                  >
                    Quant Score <SortIcon col="quant_score" />
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider">Signal</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Skeleton */}
                {isLoading && [...Array(12)].map((_, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', width: j === 0 ? 80 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Data */}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                        {search ? `No instruments matched "${search}"` : 'Waiting for live market data from ORION engine…'}
                      </p>
                    </td>
                  </tr>
                )}

                {!isLoading && filtered.map((item) => (
                  <tr
                    key={item.ticker}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer border-b"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                    onClick={() => {
                      selectTicker(item.ticker);
                      router.push('/terminal');
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-white">{item.ticker}</span>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-white tabular-nums">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ChangeBadge changePct={item.change_pct} />
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold" style={{
                      color: item.rsi >= 70 ? T.red : item.rsi <= 30 ? T.emerald : 'var(--text-secondary)',
                    }}>
                      {item.rsi.toFixed(1)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-bold" style={{
                      color: item.quant_score >= 70 ? T.emerald : item.quant_score <= 30 ? T.red : 'var(--text-secondary)',
                    }}>
                      {item.quant_score.toFixed(1)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <SignalBadge signal={item.recommendation || item.signal || 'HOLD'} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[10px] font-mono" style={{ color: T.emerald }}>
                        Open →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DataDisclaimer />
      </main>
    </div>
  );
}
