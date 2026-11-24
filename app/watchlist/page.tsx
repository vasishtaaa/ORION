'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MarketStatusBadge } from '@/components/ui/MarketStatusBadge';
import { DataDisclaimer } from '@/components/ui/DataDisclaimer';
import { SignalBadge, ChangeBadge } from '@/components/ui/Badges';
import { useToast } from '@/components/ui/Toast';
import {
  BookOpen, Plus, Trash2, ExternalLink, Search, Star,
  Info,
} from 'lucide-react';

const T = { emerald: '#10b981', cyan: '#06b6d4', amber: '#fbbf24', red: '#ef4444' } as const;
const glass = { background: 'rgba(14,19,29,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' } as const;

const STORAGE_KEY = 'orion_watchlist_v2';
const DEFAULT_TICKERS = ['TCS_NSE', 'RELI_NSE', 'HDFC_NSE', 'INFY_NSE', 'SBIN_NSE'];

function loadWatchlist(): string[] {
  if (typeof window === 'undefined') return DEFAULT_TICKERS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_TICKERS;
  } catch {
    return DEFAULT_TICKERS;
  }
}

function saveWatchlist(tickers: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
  } catch {
    // storage unavailable
  }
}

export default function WatchlistPage() {
  const router = useRouter();
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();
  const { success, info } = useToast();

  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [addInput, setAddInput] = useState('');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setWatchlist(loadWatchlist());
    setMounted(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (mounted) saveWatchlist(watchlist);
  }, [watchlist, mounted]);

  const screener = useMemo(() => snapshot?.screener || [], [snapshot?.screener]);

  // Match watchlist tickers to live screener data
  const watchlistData = useMemo(() => {
    return watchlist.map((ticker) => {
      const match = screener.find(
        (s) => s.ticker.toLowerCase() === ticker.toLowerCase() ||
               s.ticker.toLowerCase() === ticker.toLowerCase().replace(/_nse$|_bse$/, '')
      );
      return { ticker, liveData: match || null };
    });
  }, [watchlist, screener]);

  const addTicker = () => {
    const t = addInput.trim().toUpperCase();
    if (!t) return;
    const formatted = t.includes('_') ? t : `${t}_NSE`;
    if (watchlist.includes(formatted)) {
      info(`${formatted} is already in your watchlist`);
      setAddInput('');
      return;
    }
    setWatchlist((prev) => [...prev, formatted]);
    success(`Added ${formatted} to watchlist`);
    setAddInput('');
  };

  const removeTicker = (ticker: string) => {
    setWatchlist((prev) => prev.filter((t) => t !== ticker));
    info(`Removed ${ticker} from watchlist`);
  };

  const handleViewInTerminal = (ticker: string) => {
    selectTicker(ticker);
    router.push('/terminal');
  };

  return (
    <div className="min-h-screen flex flex-col text-white w-full" style={{ background: '#030712' }}>
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/watchlist" onTickerSelect={selectTicker} />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        <div className="flex flex-col gap-3">
          <Breadcrumb items={[{ label: 'Watchlist' }]} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight flex items-center gap-2.5">
                <Star className="w-6 h-6" style={{ color: T.amber }} aria-hidden="true" />
                My Watchlist
              </h1>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {watchlist.length} instrument{watchlist.length !== 1 ? 's' : ''} tracked · Saved locally in your browser
              </p>
            </div>
            <MarketStatusBadge showTime />
          </div>
        </div>

        {/* Info note */}
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs font-mono"
          style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', color: 'var(--text-muted)' }}
          role="note"
        >
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: T.cyan }} aria-hidden="true" />
          <span>
            Watchlists are saved to your browser&apos;s local storage — no account required. Live prices update via ORION WebSocket when the engine is connected.
          </span>
        </div>

        {/* Add ticker input */}
        <div className="flex flex-col gap-3 p-5" style={glass}>
          <h2 className="text-sm font-mono font-bold text-white">Add Instrument</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
              <input
                type="text"
                value={addInput}
                onChange={(e) => setAddInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTicker()}
                placeholder="e.g. TCS or TCS_NSE"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-mono text-white placeholder-[var(--text-muted)] focus:outline-none transition-colors"
                style={{
                  background: 'rgba(10,13,20,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                aria-label="Add ticker to watchlist"
              />
            </div>
            <button
              type="button"
              onClick={addTicker}
              disabled={!addInput.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-mono font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: T.emerald, color: '#030712' }}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add to Watchlist
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Quick add:</span>
            {['INFY_NSE', 'ADANIENT_NSE', 'BAJFINANCE_NSE', 'HDFCLIFE_NSE', 'DRREDDY_NSE'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setWatchlist((prev) => prev.includes(t) ? prev : [...prev, t]);
                  if (!watchlist.includes(t)) success(`Added ${t} to watchlist`);
                }}
                className="text-[10px] font-mono px-2.5 py-1 rounded-full transition-all cursor-pointer"
                style={{
                  background: watchlist.includes(t) ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                  border: watchlist.includes(t) ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: watchlist.includes(t) ? T.emerald : 'var(--text-secondary)',
                }}
              >
                {t.replace('_NSE', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Watchlist table */}
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center" style={glass}>
            <BookOpen className="w-10 h-10" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
            <p className="text-sm font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>Your watchlist is empty</p>
            <p className="text-xs font-mono max-w-xs" style={{ color: 'var(--text-muted)' }}>
              Add instruments using the field above. Prices update in real time when the ORION engine is connected.
            </p>
          </div>
        ) : (
          <div className="flex flex-col" style={glass}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-mono font-bold text-white">{watchlist.length} Tracked Instruments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono min-w-[600px]">
                <thead className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                  <tr>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider">Instrument</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider">Price</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider">Change</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider">RSI</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider">Signal</th>
                    <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistData.map(({ ticker, liveData }) => (
                    <tr
                      key={ticker}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-white">{ticker}</span>
                          {liveData?.name && (
                            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{liveData.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {liveData ? (
                          <span className="font-bold text-white tabular-nums">₹{liveData.price.toFixed(2)}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {liveData ? <ChangeBadge changePct={liveData.change_pct} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {liveData ? (
                          <span className="tabular-nums font-semibold" style={{
                            color: liveData.rsi >= 70 ? T.red : liveData.rsi <= 30 ? T.emerald : 'var(--text-secondary)',
                          }}>
                            {liveData.rsi.toFixed(1)}
                          </span>
                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {liveData ? (
                          <SignalBadge signal={liveData.recommendation || liveData.signal || 'HOLD'} />
                        ) : (
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Awaiting data</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewInTerminal(ticker)}
                            className="p-1.5 rounded-lg transition-all cursor-pointer"
                            style={{ background: 'rgba(16,185,129,0.08)', color: T.emerald, border: '1px solid rgba(16,185,129,0.2)' }}
                            title={`View ${ticker} in terminal`}
                            aria-label={`View ${ticker} in terminal`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTicker(ticker)}
                            className="p-1.5 rounded-lg transition-all cursor-pointer"
                            style={{ background: 'rgba(239,68,68,0.08)', color: T.red, border: '1px solid rgba(239,68,68,0.2)' }}
                            title={`Remove ${ticker} from watchlist`}
                            aria-label={`Remove ${ticker} from watchlist`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {watchlistData.every(({ liveData }) => !liveData) && status === 'connected' && (
              <div className="px-5 py-4 text-xs font-mono" style={{ color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                ⚠ None of your watchlist tickers matched the ORION screener universe. Tickers must be in the ORION instrument list to show live data.
              </div>
            )}
          </div>
        )}

        <DataDisclaimer />
      </main>
    </div>
  );
}
