'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MarketStatusBadge } from '@/components/ui/MarketStatusBadge';
import { DataDisclaimer } from '@/components/ui/DataDisclaimer';
import { ArrowRight } from 'lucide-react';

const T = { emerald: '#10b981', cyan: '#06b6d4', purple: '#818cf8', amber: '#fbbf24', red: '#ef4444', orange: '#f97316' } as const;
const glass = { background: 'rgba(14,19,29,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' } as const;

/* ── NSE Sector definitions — maps known tickers to sectors ──────────────── */
const SECTOR_MAP: Record<string, { label: string; color: string; desc: string }> = {
  'Information Technology': { label: 'IT & Software',   color: T.cyan,    desc: 'TCS, Infosys, Wipro, HCL Tech, Tech Mahindra' },
  'Banking':                { label: 'Banking & Finance',color: T.emerald, desc: 'HDFC Bank, ICICI Bank, SBI, Axis Bank, Kotak' },
  'Pharmaceuticals':        { label: 'Pharmaceuticals',  color: T.purple,  desc: 'Sun Pharma, Dr Reddys, Cipla, Divi Labs' },
  'Automobile':             { label: 'Automobile',        color: T.amber,   desc: 'Tata Motors, M&M, Maruti Suzuki, Bajaj Auto' },
  'Energy & Oil':           { label: 'Energy & Oil',      color: T.orange,  desc: 'Reliance, ONGC, IOC, BPCL, Adani Green' },
  'FMCG':                   { label: 'FMCG',              color: '#22d3ee', desc: 'HUL, ITC, Nestle, Britannia, Dabur' },
  'Metals & Mining':        { label: 'Metals & Mining',   color: '#94a3b8', desc: 'JSW Steel, Tata Steel, Hindalco, SAIL' },
  'Realty':                 { label: 'Realty',            color: '#f59e0b', desc: 'DLF, Godrej Properties, Prestige Estates' },
};

/* ── Ticker → Sector lookup (based on known ORION instrument universe) ── */
const TICKER_SECTOR: Record<string, string> = {
  TCS: 'Information Technology', INFY: 'Information Technology', WIPRO: 'Information Technology',
  HCLTECH: 'Information Technology', TECHM: 'Information Technology',
  HDFC: 'Banking', ICICIBANK: 'Banking', SBIN: 'Banking', AXISBANK: 'Banking', KOTAKBANK: 'Banking',
  SUNPHARMA: 'Pharmaceuticals', DRREDDY: 'Pharmaceuticals', CIPLA: 'Pharmaceuticals',
  TATAMOTORS: 'Automobile', MM: 'Automobile', MARUTI: 'Automobile', BAJAJFINSV: 'Automobile',
  RELIANCE: 'Energy & Oil', ONGC: 'Energy & Oil', IOC: 'Energy & Oil',
  HINDUNILVR: 'FMCG', ITC: 'FMCG', NESTLEIND: 'FMCG', BRITANNIA: 'FMCG',
  JSWSTEEL: 'Metals & Mining', TATASTEEL: 'Metals & Mining', HINDALCO: 'Metals & Mining',
  DLF: 'Realty', GODREJPROP: 'Realty',
};

function getSectorFromTicker(ticker: string): string {
  const base = ticker.replace(/_NSE$|_BSE$/, '').toUpperCase();
  for (const key of Object.keys(TICKER_SECTOR)) {
    if (base.includes(key) || key.includes(base)) return TICKER_SECTOR[key];
  }
  return 'Other';
}

export default function SectorsPage() {
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();
  const screener = useMemo(() => snapshot?.screener || [], [snapshot?.screener]);
  const isLoading = status === 'connecting';

  // Group screener items by sector
  const sectorData = useMemo(() => {
    const groups: Record<string, typeof screener> = {};
    screener.forEach((item) => {
      const sec = getSectorFromTicker(item.ticker);
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(item);
    });
    return Object.entries(groups)
      .map(([sector, items]) => {
        const avgChg = items.reduce((s, x) => s + x.change_pct, 0) / items.length;
        const avgRsi = items.reduce((s, x) => s + x.rsi, 0) / items.length;
        const buys = items.filter(x => (x.recommendation || x.signal) === 'BUY').length;
        return { sector, items, avgChg, avgRsi, buys };
      })
      .sort((a, b) => b.avgChg - a.avgChg);
  }, [screener]);

  const knownSectors = Object.keys(SECTOR_MAP);

  return (
    <div className="min-h-screen flex flex-col text-white w-full" style={{ background: '#030712' }}>
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/sectors" onTickerSelect={selectTicker} />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        <div className="flex flex-col gap-3">
          <Breadcrumb items={[{ label: 'Sectors' }]} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight">
                Sector & Industry Performance
              </h1>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                NSE sector breakdown · Derived from ORION screener universe
              </p>
            </div>
            <MarketStatusBadge showTime />
          </div>
        </div>

        {/* Sector Heatmap — show if we have live data */}
        {!isLoading && sectorData.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-mono font-bold text-white">Sector Performance Heatmap</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sectorData.map(({ sector, items, avgChg, avgRsi, buys }) => {
                const cfg = SECTOR_MAP[sector];
                const color = cfg?.color || '#6b7280';
                const isPos = avgChg >= 0;
                const intensity = Math.min(Math.abs(avgChg) / 3, 1);
                return (
                  <div
                    key={sector}
                    className="flex flex-col gap-3 p-5 rounded-2xl transition-all"
                    style={{
                      background: `rgba(${isPos ? '16,185,129' : '239,68,68'}, ${intensity * 0.1})`,
                      border: `1px solid rgba(${isPos ? '16,185,129' : '239,68,68'}, ${0.1 + intensity * 0.2})`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-mono font-bold text-white leading-tight">
                          {cfg?.label || sector}
                        </h3>
                        <p className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {items.length} instruments
                        </p>
                      </div>
                      <span
                        className="text-base font-mono font-black tabular-nums shrink-0"
                        style={{ color: isPos ? T.emerald : T.red }}
                      >
                        {isPos ? '+' : ''}{avgChg.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span style={{ color: 'var(--text-muted)' }}>Avg RSI: <span className="text-white font-bold">{avgRsi.toFixed(1)}</span></span>
                      <span style={{ color: T.emerald }}>{buys} BUY signals</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {items.slice(0, 4).map((item) => (
                        <button
                          key={item.ticker}
                          type="button"
                          onClick={() => selectTicker(item.ticker)}
                          className="text-[9px] font-mono px-2 py-0.5 rounded-full transition-all cursor-pointer"
                          style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}
                        >
                          {item.ticker.replace(/_NSE$|_BSE$/, '')}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        )}

        {/* Static sector directory — shown always */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-mono font-bold text-white">NSE Sector Directory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {knownSectors.map((sector) => {
              const cfg = SECTOR_MAP[sector];
              const liveData = sectorData.find(s => s.sector === sector);
              return (
                <div
                  key={sector}
                  className="flex flex-col gap-3 p-5"
                  style={glass}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cfg.color }} aria-hidden="true" />
                      <h3 className="text-sm font-mono font-bold text-white">{cfg.label}</h3>
                    </div>
                    {liveData && (
                      <span className="text-sm font-mono font-black tabular-nums" style={{ color: liveData.avgChg >= 0 ? T.emerald : T.red }}>
                        {liveData.avgChg >= 0 ? '+' : ''}{liveData.avgChg.toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{cfg.desc}</p>
                  {liveData && (
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span style={{ color: 'var(--text-muted)' }}>
                        {liveData.items.length} tracked · RSI {liveData.avgRsi.toFixed(1)} avg
                      </span>
                      <span style={{ color: T.emerald }}>{liveData.buys} BUY</span>
                    </div>
                  )}
                  <Link
                    href="/screener"
                    className="flex items-center gap-1 text-[10px] font-mono transition-colors hover:text-white"
                    style={{ color: cfg.color }}
                  >
                    Screen this sector <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <DataDisclaimer note="Sector groupings are derived from the ORION ticker universe and may not reflect official NSE/BSE sector classifications." />
      </main>
    </div>
  );
}
