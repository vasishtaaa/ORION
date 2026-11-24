'use client';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MarketStatusBadge } from '@/components/ui/MarketStatusBadge';
import { DataDisclaimer } from '@/components/ui/DataDisclaimer';
import { TrendingUp, TrendingDown, Activity, Flame, RefreshCw } from 'lucide-react';

const T = { emerald: '#10b981', cyan: '#06b6d4', amber: '#fbbf24', red: '#ef4444' } as const;
const glass = { background: 'rgba(14,19,29,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' } as const;

type Tab = 'gainers' | 'losers' | 'active';

function MoverRow({
  ticker, price, changePct, volume, rank, onClick,
}: { ticker: string; price: string; changePct: number; volume: string; rank: number; onClick: () => void }) {
  const isPos = changePct >= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-3.5 transition-all text-left hover:bg-white/[0.03] cursor-pointer border-b"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <span className="w-5 text-[10px] font-mono font-bold shrink-0" style={{ color: 'var(--text-muted)' }}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-mono font-bold text-sm text-white">{ticker}</p>
        <p className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>Vol: {parseInt(volume).toLocaleString()}</p>
      </div>
      <span className="font-mono font-bold text-sm text-white tabular-nums shrink-0">
        ${parseFloat(price).toFixed(2)}
      </span>
      <span
        className="font-mono font-bold text-xs tabular-nums shrink-0 min-w-[60px] text-right"
        style={{ color: isPos ? T.emerald : T.red }}
      >
        {isPos ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
      </span>
    </button>
  );
}

export default function MoversPage() {
  const router = useRouter();
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();
  const [tab, setTab] = React.useState<Tab>('gainers');

  const movers = snapshot?.market_movers;
  const isLoading = status === 'connecting';
  const hasData = !!movers;

  const displayedMovers = useMemo(() => {
    if (!movers) return [];
    if (tab === 'gainers') return movers.top_gainers || [];
    if (tab === 'losers') return movers.top_losers || [];
    return movers.most_actively_traded || [];
  }, [movers, tab]);

  const TABS: { id: Tab; label: string; Icon: React.ElementType; color: string }[] = [
    { id: 'gainers', label: 'Top Gainers',  Icon: TrendingUp,   color: T.emerald },
    { id: 'losers',  label: 'Top Losers',   Icon: TrendingDown, color: T.red    },
    { id: 'active',  label: 'Most Active',  Icon: Activity,     color: T.cyan   },
  ];

  return (
    <div className="min-h-screen flex flex-col text-white w-full" style={{ background: '#030712' }}>
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/movers" onTickerSelect={selectTicker} />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        <div className="flex flex-col gap-3">
          <Breadcrumb items={[{ label: 'Market Movers' }]} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight flex items-center gap-3">
                <Flame className="w-6 h-6" style={{ color: T.amber }} aria-hidden="true" />
                Market Movers
              </h1>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Live NSE & BSE top gainers, losers, and most active · via Alpha Vantage
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MarketStatusBadge showTime />
              {status === 'connected' && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: T.emerald }}>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Live
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Data source note */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono"
          style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', color: 'var(--text-muted)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: T.emerald }} />
          Data source: Alpha Vantage institutional feed · Updates with each WebSocket tick
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 rounded-xl w-fit" style={{ background: 'rgba(10,13,20,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(({ id, label, Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                tab === id ? 'text-black font-bold' : 'hover:text-white'
              }`}
              style={tab === id ? { background: color, color: id === 'gainers' ? '#030712' : '#030712' } : { color: 'var(--text-muted)' }}
              aria-pressed={tab === id}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Movers list */}
        <div className="flex flex-col" style={glass}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-mono font-bold text-white">
              {TABS.find(t => t.id === tab)?.label}
              {hasData && displayedMovers.length > 0 && (
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full" style={{
                  background: 'rgba(16,185,129,0.1)', color: T.emerald, border: '1px solid rgba(16,185,129,0.2)',
                }}>
                  {displayedMovers.length} instruments
                </span>
              )}
            </h2>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {movers?.updated_at ? `Updated: ${movers.updated_at}` : 'Awaiting data…'}
            </span>
          </div>

          {/* Table header */}
          <div
            className="grid grid-cols-[1.5rem_1fr_auto_auto] items-center gap-3 px-5 py-2.5 text-[10px] font-mono uppercase tracking-wider"
            style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span>#</span>
            <span>Ticker</span>
            <span className="text-right">Price</span>
            <span className="text-right">Change</span>
          </div>

          {/* Skeleton state */}
          {isLoading && (
            <div className="flex flex-col">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <div className="w-5 h-3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="flex-1 h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="w-20 h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="w-16 h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              ))}
            </div>
          )}

          {/* Data */}
          {!isLoading && displayedMovers.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-3 text-center">
              <Flame className="w-8 h-8" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
              <p className="text-sm font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>No mover data yet</p>
              <p className="text-xs font-mono max-w-xs" style={{ color: 'var(--text-muted)' }}>
                Alpha Vantage movers populate within 30 seconds of engine startup. Ensure the Python engine is running.
              </p>
            </div>
          )}

          {!isLoading && displayedMovers.map((m, idx) => {
            const chgPct = parseFloat(m.change_percentage.replace('%', '')) || 0;
            return (
              <MoverRow
                key={`${m.ticker}-${idx}`}
                ticker={m.ticker}
                price={m.price}
                changePct={chgPct}
                volume={m.volume}
                rank={idx + 1}
                onClick={() => {
                  selectTicker(m.ticker);
                  router.push('/terminal');
                }}
              />
            );
          })}
        </div>

        <DataDisclaimer note="Alpha Vantage movers data may lag by several minutes." />
      </main>
    </div>
  );
}
