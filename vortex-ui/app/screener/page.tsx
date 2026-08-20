'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useVortexSocket } from '@/lib/websocket';
import { SignalBadge } from '@/components/ui/Badges';
import { ScreenerItem } from '@/lib/types';

const AppHeader = dynamic(() => import('@/components/layout/AppHeader'), { ssr: false });

export default function ScreenerPage() {
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();
  const [screener, setScreener] = useState<ScreenerItem[]>([]);
  const [sortBy, setSortBy] = useState<'change_pct' | 'confidence' | 'volume' | 'rsi'>('change_pct');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'HOLD'>('ALL');

  useEffect(() => {
    fetch('http://localhost:8000/api/screener')
      .then(r => r.json())
      .then(d => setScreener(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (snapshot?.screener?.length) setScreener(snapshot.screener);
  }, [snapshot?.screener]);

  const sorted = [...screener]
    .filter(s => filter === 'ALL' || s.signal === filter)
    .sort((a, b) => ((a as any)[sortBy] - (b as any)[sortBy]) * sortDir);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 1 ? -1 : 1);
    else { setSortBy(col); setSortDir(-1); }
  };

  const TH = ({ col, label }: { col: typeof sortBy; label: string }) => (
    <th
      className="px-4 py-3 text-left cursor-pointer select-none font-mono text-[10px] tracking-widest font-bold transition-colors"
      style={{ color: sortBy === col ? 'var(--matrix-bright)' : 'var(--text-muted)' }}
      onClick={() => toggleSort(col)}
    >
      {label} {sortBy === col ? (sortDir === -1 ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden gap-6">
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/screener" />

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid rgba(80,200,120,0.15)' }}>
            <div>
              <h2 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">AI MARKET SCREENER</h2>
              <p className="font-mono text-xs font-semibold mt-1 text-[var(--text-muted)]">{sorted.length} SECURITIES · LIVE SIGNALS</p>
            </div>
            <div className="flex gap-2">
              {(['ALL', 'BUY', 'SELL', 'HOLD'] as const).map(f => {
                const isActive = filter === f;
                const colors: Record<string, { bg: string; color: string; border: string }> = {
                  BUY:  { bg: 'rgba(16,185,129,0.25)',  color: '#10b981', border: 'rgba(16,185,129,0.5)' },
                  SELL: { bg: 'rgba(239,68,68,0.25)',   color: '#ef4444', border: 'rgba(239,68,68,0.5)' },
                  HOLD: { bg: 'rgba(234,179,8,0.25)',   color: '#eab308', border: 'rgba(234,179,8,0.5)' },
                  ALL:  { bg: 'rgba(80,200,120,0.2)',   color: 'var(--matrix)', border: 'rgba(80,200,120,0.45)' },
                };
                const c = colors[f];
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="font-mono text-xs font-bold px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer"
                    style={isActive
                      ? { background: c.bg, color: c.color, border: `1px solid ${c.border}` }
                      : { color: 'var(--text-muted)', border: '1px solid rgba(80,200,120,0.15)', background: 'transparent' }
                    }
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto pt-4">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(0,14,7,0.6)', borderBottom: '1px solid rgba(80,200,120,0.12)' }}>
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest font-bold text-[var(--text-muted)]">TICKER</th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] tracking-widest font-bold text-[var(--text-muted)]">PRICE</th>
                  <TH col="change_pct" label="CHANGE %" />
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest font-bold text-[var(--text-muted)]">SIGNAL</th>
                  <TH col="confidence" label="CONFIDENCE" />
                  <TH col="volume" label="VOLUME" />
                  <TH col="rsi" label="RSI" />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((item) => {
                  const pos = item.change_pct >= 0;
                  return (
                    <tr
                      key={item.ticker}
                      className="cursor-pointer transition-all duration-150 rounded-xl overflow-hidden"
                      style={{ borderBottom: '1px solid rgba(80,200,120,0.06)' }}
                      onClick={() => selectTicker(item.ticker)}
                    >
                      <td className="px-4 py-3.5" style={{ paddingLeft: '24px' }}>
                        <div>
                          <p className="font-mono text-xs font-black text-[var(--matrix-bright)]">{item.ticker.split('_')[0]}</p>
                          <p className="font-mono text-[9px] text-[var(--text-muted)]">{item.ticker.includes('NSE') ? 'NSE' : 'BSE'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-[var(--text-primary)]">
                        ₹{item.price?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold" style={{ color: pos ? '#10b981' : '#ef4444' }}>
                        {pos ? '+' : ''}{item.change_pct?.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3.5">
                        <SignalBadge signal={item.signal} confidence={item.confidence} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(80,200,120,0.1)', maxWidth: 80 }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${item.confidence ?? 0}%`, background: 'var(--matrix)' }} />
                          </div>
                          <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">{item.confidence?.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[var(--text-secondary)]">
                        {item.volume ? (item.volume / 1e5).toFixed(1) + 'L' : '—'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold" style={{ color: (item.rsi ?? 50) > 70 ? '#ef4444' : (item.rsi ?? 50) < 30 ? '#10b981' : 'var(--text-secondary)' }}>
                        {item.rsi?.toFixed(1) ?? '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <button className="font-mono text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer" style={{ background: 'rgba(80,200,120,0.15)', color: 'var(--matrix)', border: '1px solid rgba(80,200,120,0.3)' }}>
                          SELECT →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sorted.length === 0 && (
              <div className="flex items-center justify-center py-16 font-mono text-xs font-semibold text-[var(--text-muted)]">
                Awaiting live screener data...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
