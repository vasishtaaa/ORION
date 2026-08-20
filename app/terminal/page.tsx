'use client';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useVortexSocket, Timeframe } from '@/lib/websocket';
import { SignalBadge } from '@/components/ui/Badges';
import CandlestickChart from '@/components/canvas/CandlestickChart';
import { audio } from '@/lib/audio';
import RadarChart from '@/components/ui/RadarChart';
import ImbalanceVisualizer from '@/components/canvas/ImbalanceVisualizer';

const AppHeader = dynamic(() => import('@/components/layout/AppHeader'), { ssr: false });

const TICKERS = [
  { id: 'TCS_NSE', label: 'TCS' }, { id: 'INFY_NSE', label: 'INFY' },
  { id: 'HDFC_NSE', label: 'HDFC' }, { id: 'ICICIBANK_NSE', label: 'ICICI' },
  { id: 'SBIN_NSE', label: 'SBIN' }, { id: 'TATAMOTORS_NSE', label: 'TATAMOTORS' },
  { id: 'RELI_NSE', label: 'RELIANCE' }, { id: 'ITC_NSE', label: 'ITC' },
];

const AVAILABLE_STOCKS = [
  { ticker: 'RELI_NSE', name: 'Reliance Industries (NSE)' }, { ticker: 'TCS_NSE', name: 'Tata Consultancy Services (NSE)' },
  { ticker: 'INFY_NSE', name: 'Infosys Ltd (NSE)' }, { ticker: 'HDFC_NSE', name: 'HDFC Bank Ltd (NSE)' },
  { ticker: 'ICICIBANK_NSE', name: 'ICICI Bank Ltd (NSE)' }, { ticker: 'SBIN_NSE', name: 'State Bank of India (NSE)' },
  { ticker: 'BHARTIARTL_NSE', name: 'Bharti Airtel (NSE)' }, { ticker: 'ITC_NSE', name: 'ITC Ltd (NSE)' },
  { ticker: 'LT_NSE', name: 'Larsen & Toubro (NSE)' }, { ticker: 'KOTAKBANK_NSE', name: 'Kotak Mahindra Bank (NSE)' },
  { ticker: 'TATAMOTORS_NSE', name: 'Tata Motors (NSE)' }, { ticker: 'MARUTI_NSE', name: 'Maruti Suzuki (NSE)' },
  { ticker: 'SUNPHARMA_NSE', name: 'Sun Pharmaceutical (NSE)' }, { ticker: 'WIPRO_NSE', name: 'Wipro Ltd (NSE)' },
  { ticker: 'NTPC_NSE', name: 'NTPC Ltd (NSE)' }, { ticker: 'ADANIENT_NSE', name: 'Adani Enterprises (NSE)' },
];

function CircularHUDDial({ label, value, max = 100, unit = '%' }: { label: string; value: number; max?: number; unit?: string }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(value, 0), max) / max) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-2 overflow-hidden">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 overflow-visible">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="transparent"
            stroke="rgba(80, 200, 120, 0.07)"
            strokeWidth="3.5"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="transparent"
            stroke="var(--matrix)"
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="square"
            style={{
              transition: 'stroke-dashoffset 0.6s ease-out',
              filter: 'drop-shadow(0 0 3px var(--matrix))'
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono text-[10px] font-bold text-[var(--matrix-bright)]">
            {value.toFixed(0)}{unit}
          </span>
        </div>
      </div>
      <span className="font-mono text-[9px] font-semibold tracking-wider mt-1.5 opacity-70 text-center uppercase text-[var(--text-primary)]">{label}</span>
    </div>
  );
}

export default function TerminalPage() {
  const { snapshot, status, activeTicker, selectTicker, subscribe } = useVortexSocket();
  const [chartMode, setChartMode] = useState<'candle' | 'line'>('candle');
  const [timeframe, setTimeframe] = useState<Timeframe>('LIVE');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<typeof AVAILABLE_STOCKS>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audio.setMute(isMuted);
  }, [isMuted]);

  const lastTsRef = useRef<number>(0);
  const lastSignalRef = useRef<string>('');
  useEffect(() => {
    if (!snapshot) return;
    if (snapshot.last_update && snapshot.last_update !== lastTsRef.current) {
      audio.playTick();
      lastTsRef.current = snapshot.last_update;
    }
    if (snapshot.signal && snapshot.signal !== lastSignalRef.current) {
      audio.playAlert(snapshot.signal.toLowerCase() as any);
      lastSignalRef.current = snapshot.signal;
    }
  }, [snapshot]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const q = search.toUpperCase();
    setSearchResults(AVAILABLE_STOCKS.filter(s => s.ticker.includes(q) || s.name.toUpperCase().includes(q)).slice(0, 8));
  }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const s = snapshot;
  const changePos = (s?.change_pct ?? 0) >= 0;

  const bidsTotal = s?.bids_l2?.reduce((acc: number, curr: number[]) => acc + curr[1], 0) ?? 0;
  const asksTotal = s?.asks_l2?.reduce((acc: number, curr: number[]) => acc + curr[1], 0) ?? 0;
  const totalBook = bidsTotal + asksTotal;
  const imbalanceVal = totalBook > 0 ? bidsTotal / totalBook : 0.5;

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full select-none overflow-hidden gap-6">
      <AppHeader wsStatus={status} activeTicker={activeTicker} latency={s?.latency_avg} currentPath="/terminal" />

      {/* Brand Banner */}
      <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-nowrap items-center gap-6">
        {/* Active Ticker Box (Padding 28px Left, 24px Right to prevent border clipping) */}
        <div
          className="flex flex-col justify-center flex-shrink-0 border-r min-w-[180px]"
          style={{ paddingLeft: '28px', paddingRight: '24px', borderColor: 'rgba(80,200,120,0.2)' }}
        >
          <h2 className="font-sans text-sm font-black tracking-widest uppercase leading-tight truncate mb-1 text-[var(--matrix-bright)]">
            {s?.ticker ? s.ticker.split('_')[0] : '...'}
          </h2>
          <p className="font-mono text-xs font-semibold tracking-widest leading-none truncate text-[var(--matrix)]">{activeTicker}</p>
        </div>

        {/* Ticker Tape */}
        <div
          className="flex-1 overflow-x-auto whitespace-nowrap flex items-center gap-2 px-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {TICKERS.map(t => {
            const isActive = activeTicker === t.id;
            return (
              <button
                key={t.id}
                onClick={() => selectTicker(t.id)}
                className="flex-shrink-0 px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive ? 'rgba(80,200,120,0.18)' : 'transparent',
                  color: isActive ? 'var(--matrix-bright)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(80,200,120,0.35)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 15px rgba(80,200,120,0.1)' : 'none'
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Price Block */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto border-r pr-6" style={{ borderColor: 'rgba(80,200,120,0.2)' }}>
          <span className="font-mono text-xs font-semibold text-[var(--matrix-bright)]">
            ₹{s?.mid?.toFixed(2) ?? '0.00'}
          </span>
          <span
            className="font-mono text-xs font-semibold px-3 py-1 rounded-lg"
            style={{
              background: changePos ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: changePos ? '#10b981' : '#ef4444',
              border: `1px solid ${changePos ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            }}
          >
            {changePos ? '+' : ''}{s?.change?.toFixed(2) ?? '0.00'} ({changePos ? '+' : ''}{s?.change_pct?.toFixed(2) ?? '0.00'}%)
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative flex-shrink-0" ref={searchRef} style={{ width: 220 }}>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(0,25,14,0.6)',
              border: showSearch ? '1px solid var(--matrix)' : '1px solid rgba(80,200,120,0.2)',
              boxShadow: showSearch ? '0 0 20px rgba(80,200,120,0.3)' : undefined
            }}
          >
            <span className="font-mono text-xs font-semibold text-[var(--matrix)] whitespace-nowrap">SEARCH:</span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              placeholder="TYPE TICKER..."
              className="flex-1 bg-transparent border-none outline-none font-mono text-xs font-semibold uppercase w-full text-[var(--matrix)]"
            />
          </div>
          <AnimatePresence>
            {showSearch && searchResults.length > 0 && (
              <motion.div className="search-dropdown" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                {searchResults.map(r => (
                  <div key={r.ticker} className="search-item" onClick={() => { selectTicker(r.ticker); setSearch(''); setShowSearch(false); }}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(80,200,120,0.2)', color: 'var(--matrix)', border: '1px solid rgba(80,200,120,0.3)' }}>
                        {r.ticker.split('_')[0]}
                      </span>
                      <span className="truncate font-mono text-xs font-semibold">{r.name}</span>
                    </div>
                    <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(80,200,120,0.15)', color: 'var(--matrix)', border: '1px solid rgba(80,200,120,0.2)' }}>
                      {r.ticker.endsWith('_BSE') ? 'BSE' : 'NSE'}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Audio Synthesizer Control */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="glass-pill flex-shrink-0 cursor-pointer transition-all"
          style={{
            background: isMuted ? 'rgba(239, 68, 68, 0.08)' : 'rgba(80, 200, 120, 0.12)',
            borderColor: isMuted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(80, 200, 120, 0.4)',
            color: isMuted ? '#ef4444' : 'var(--matrix)',
          }}
        >
          <span className="font-mono text-xs font-semibold">{isMuted ? '🔇 MUTED' : '🔊 AUDIO'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden pb-6">
        {/* Left Column (8 cols) - Chart & News Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-6 flex-1 min-w-0 overflow-hidden">

          {/* Static Market Price Flow Panel */}
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex-1 flex flex-col min-h-[360px]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[rgba(80,200,120,0.15)]">
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">MARKET PRICE FLOW</h3>
              </div>

              {/* Timeframe Switcher & Chart Mode Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-[rgba(80,200,120,0.15)]">
                  {(['LIVE', '1D', '1W', '1M', '6M', '1Y'] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => {
                        setTimeframe(tf);
                        subscribe(activeTicker, tf);
                      }}
                      className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                      style={timeframe === tf
                        ? { background: 'var(--matrix)', color: '#000', boxShadow: '0 0 10px rgba(80,200,120,0.4)' }
                        : { color: 'var(--text-muted)' }}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5">
                  {(['candle', 'line'] as const).map(m => (
                    <button key={m} onClick={() => setChartMode(m)}
                      className="font-mono text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer"
                      style={chartMode === m ? { background: 'var(--matrix)', color: '#000' } : { color: 'var(--text-muted)', border: '1px solid rgba(80,200,120,0.2)' }}>
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 pt-4 overflow-hidden" style={{ minHeight: 280 }}>
              <CandlestickChart candles={s?.candles ?? []} mode={chartMode} timeframe={timeframe} height={280} />
            </div>
          </div>

          {/* Static Stock News Timeline Panel */}
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden max-h-[240px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-4 border-b border-[rgba(80,200,120,0.15)] pb-3">
              <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">STOCK INTELLIGENCE WIRE</h3>
            </div>
            <div className="flex flex-col gap-3">
              {(s?.stock_news ?? s?.news?.slice(0, 4) ?? []).map((item: any, i: number) => (
                <div key={i} className="glass-sm rounded-xl overflow-hidden" style={{ padding: '18px 22px' }}>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-[var(--matrix)]">[{item.source?.toUpperCase()}]</span>
                    {item.ts && <span className="font-mono text-[10px] text-[var(--text-muted)]">{new Date(item.ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <p className="font-mono text-xs font-semibold leading-relaxed text-[var(--text-primary)]">{item.headline}</p>
                </div>
              ))}
              {!s?.news?.length && <p className="font-mono text-xs font-semibold text-[var(--text-muted)]">Fetching news wire...</p>}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) - HUD & Control Modules */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">

          {/* Static Predictive HUD Dials Panel */}
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-[rgba(80,200,120,0.15)] pb-3">
              <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">VORTEX PREDICTIVE HUD</h3>
              <span className="font-mono text-[9px] font-bold px-2.5 py-1 rounded-md bg-[rgba(80,200,120,0.15)] text-[var(--matrix)] border border-[rgba(80,200,120,0.25)]">AI ENGINE</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <SignalBadge signal={s?.signal ?? 'HOLD'} />
              <span className="font-mono text-xs font-semibold text-[var(--matrix)]">₹{s?.target?.toFixed(2) ?? '0.00'}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <CircularHUDDial label="CONFIDENCE" value={s?.confidence ?? 0} />
              <CircularHUDDial label="SENTIMENT" value={s?.sentiment ? (s.sentiment + 1) * 50 : 50} max={100} unit="%" />
              <CircularHUDDial label="QUANT SCORE" value={s?.quant_score ? s.quant_score * 100 : 50} max={100} unit="" />
            </div>
          </div>

          {/* Static Quant Radar Signature Panel */}
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-3 border-b border-[rgba(80,200,120,0.15)] pb-3">
              <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">QUANT RADAR SIGNATURE</h3>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <RadarChart
                rsi={s?.rsi ?? 50}
                confidence={s?.confidence ?? 50}
                sentiment={s?.sentiment ?? 0.0}
                imbalance={imbalanceVal}
                quantScore={s?.quant_score ?? 0.5}
              />
            </div>
          </div>

          {/* Static Order Book & Flow Mesh Panel */}
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[rgba(80,200,120,0.15)] pb-3">
              <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">ORDER BOOK & FLOW MESH</h3>
              <span className="font-mono text-[9px] font-semibold text-[var(--text-muted)]">L2 DATA</span>
            </div>

            <div className="glass-sm overflow-hidden" style={{ height: 60, position: 'relative' }}>
              <ImbalanceVisualizer imbalance={imbalanceVal} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[10px] font-bold mb-2 text-[#10b981]">BID DEPTH</p>
                {(s?.bids_l2 ?? []).slice(0, 3).map(([p, q]: number[], i: number) => (
                  <div key={i} className="flex justify-between font-mono text-xs font-semibold py-0.5" style={{ color: i === 0 ? '#10b981' : 'var(--text-secondary)' }}>
                    <span>₹{p.toFixed(2)}</span><span>{q.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold mb-2 text-[#ef4444]">ASK DEPTH</p>
                {(s?.asks_l2 ?? []).slice(0, 3).map(([p, q]: number[], i: number) => (
                  <div key={i} className="flex justify-between font-mono text-xs font-semibold py-0.5" style={{ color: i === 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                    <span>₹{p.toFixed(2)}</span><span>{q.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command Line HUD Console Bar */}
      <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.35)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex items-center gap-3 py-4">
        <span className="font-mono text-xs font-bold text-[var(--matrix)] text-shadow-[0_0_4px_var(--matrix)]">VORTEX_SYS_CMD&gt;</span>
        <input
          type="text"
          placeholder="TYPE /TICKER [NAME] (e.g. /ticker TCS) OR /HELP TO COMMENCE COMMAND SYSTEM..."
          className="flex-1 bg-transparent border-none outline-none font-mono text-xs font-semibold uppercase text-[var(--matrix-bright)] caret-[var(--matrix-bright)]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = e.currentTarget.value.trim();
              if (val.startsWith('/ticker ')) {
                const target = val.slice(8).toUpperCase() + '_NSE';
                selectTicker(target);
              } else if (val === '/help') {
                alert('VORTEX HUD COMMANDS:\n/ticker [SYMBOL] - Switch symbol (e.g. /ticker TCS)\n/chart candle - Switch chart to Candlestick\n/chart line - Switch chart to Line\n/sound - Toggle audio synthesizer feedback');
              } else if (val === '/sound') {
                setIsMuted(!isMuted);
              } else if (val === '/chart candle') {
                setChartMode('candle');
              } else if (val === '/chart line') {
                setChartMode('line');
              }
              e.currentTarget.value = '';
            }
          }}
        />
        <span className="font-mono text-[9px] font-semibold text-[var(--text-muted)]">PRESS ENTER TO EXECUTE</span>
      </div>
    </div>
  );
}