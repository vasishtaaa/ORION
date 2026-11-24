'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VortexSnapshot } from '@/lib/types';
import { SignalBadge } from '@/components/ui/Badges';
import { TrendingUp, TrendingDown, Radio, Bell, BellRing, Volume2 } from 'lucide-react';
import { audio, AudioTheme, PriceAlert } from '@/lib/audio';

interface StockHeaderProps {
  activeTicker: string;
  snapshot: VortexSnapshot | null;
  currentPrice: number;
  isTransitioning?: boolean;
}

function getTickerInitials(ticker: string) {
  const base = ticker.split('_')[0];
  return base.slice(0, 2).toUpperCase();
}

function getTickerBrandColor(ticker: string): { bg: string; text: string; border: string } {
  const base = ticker.split('_')[0];
  const palettes: Record<string, { bg: string; text: string; border: string }> = {
    TCS:        { bg: 'bg-violet-500/20',  text: 'text-violet-300',  border: 'border-violet-500/30' },
    RELI:       { bg: 'bg-amber-500/20',   text: 'text-amber-300',   border: 'border-amber-500/30'  },
    HDFC:       { bg: 'bg-sky-500/20',     text: 'text-sky-300',     border: 'border-sky-500/30'    },
    INFY:       { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30'},
    ICICIBANK:  { bg: 'bg-orange-500/20',  text: 'text-orange-300',  border: 'border-orange-500/30' },
    SBIN:       { bg: 'bg-blue-500/20',    text: 'text-blue-300',    border: 'border-blue-500/30'   },
    TATAMOTORS: { bg: 'bg-rose-500/20',    text: 'text-rose-300',    border: 'border-rose-500/30'   },
    ADANIENT:   { bg: 'bg-teal-500/20',    text: 'text-teal-300',    border: 'border-teal-500/30'   },
    MARUTI:     { bg: 'bg-cyan-500/20',    text: 'text-cyan-300',    border: 'border-cyan-500/30'   },
    LT:         { bg: 'bg-indigo-500/20',  text: 'text-indigo-300',  border: 'border-indigo-500/30' },
  };
  return palettes[base] ?? { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' };
}

function formatVolume(v: number | undefined): string {
  if (!v) return '—';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toString();
}

export function StockHeader({ activeTicker, snapshot, currentPrice, isTransitioning = false }: StockHeaderProps) {
  const brand = getTickerBrandColor(activeTicker);
  const changePct = snapshot?.change_pct ?? 0;
  const change = snapshot?.change ?? 0;
  const isPositive = changePct >= 0;
  const prevClose = snapshot?.prev_close ?? 0;
  const open = snapshot?.open ?? 0;
  const high = snapshot?.high ?? 0;
  const low = snapshot?.low ?? 0;
  const volume = snapshot?.volume ?? 0;

  // Price Alert & Audio State
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTarget, setAlertTarget] = useState<number>(() => Math.round(currentPrice * 1.02 * 10) / 10);
  const [activeAlerts, setActiveAlerts] = useState<PriceAlert[]>([]);
  const [currentTheme, setCurrentTheme] = useState<AudioTheme>('studio');

  useEffect(() => {
    setCurrentTheme(audio.getTheme());
    setActiveAlerts(audio.getAlerts(activeTicker));
  }, [activeTicker]);

  // Check price alerts whenever price updates
  useEffect(() => {
    if (currentPrice > 0) {
      audio.checkPriceAlerts(activeTicker, currentPrice);
      setActiveAlerts(audio.getAlerts(activeTicker));
    }
  }, [currentPrice, activeTicker]);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertTarget <= 0) return;
    const cond = alertTarget >= currentPrice ? 'above' : 'below';
    audio.addAlert(activeTicker, alertTarget, cond);
    setActiveAlerts(audio.getAlerts(activeTicker));
    setShowAlertModal(false);
  };

  const handleCycleTheme = () => {
    const themes: AudioTheme[] = ['studio', 'bloomberg', 'cyberpunk'];
    const nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    audio.setTheme(nextTheme);
    setCurrentTheme(nextTheme);
    audio.playTick();
  };

  // Company display name from ticker
  const nameMap: Record<string, string> = {
    TCS_NSE: 'Tata Consultancy Services',
    TCS_BSE: 'Tata Consultancy Services',
    RELI_NSE: 'Reliance Industries Ltd.',
    RELI_BSE: 'Reliance Industries Ltd.',
    HDFC_NSE: 'HDFC Bank Ltd.',
    HDFC_BSE: 'HDFC Bank Ltd.',
    INFY_NSE: 'Infosys Limited',
    INFY_BSE: 'Infosys Limited',
    ICICIBANK_NSE: 'ICICI Bank Limited',
    ICICIBANK_BSE: 'ICICI Bank Limited',
    SBIN_NSE: 'State Bank of India',
    SBIN_BSE: 'State Bank of India',
    TATAMOTORS_NSE: 'Tata Motors Passenger Vhcls.',
    TATAMOTORS_BSE: 'Tata Motors Passenger Vhcls.',
    ADANIENT_NSE: 'Adani Enterprises Ltd.',
    MARUTI_NSE: 'Maruti Suzuki India Ltd.',
    LT_NSE: 'Larsen & Toubro Ltd.',
  };
  const displayName = nameMap[activeTicker] ?? activeTicker.split('_')[0];
  const exchange = activeTicker.split('_')[1] ?? 'NSE';

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Primary Price Row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: Brand + Name + Price */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTicker}
            initial={{ opacity: 0.2, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.2, y: -4 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="flex items-center gap-3.5"
          >
            {/* Brand Avatar */}
            <div
              className={`w-10 h-10 rounded-full ${brand.bg} border ${brand.border} flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,255,255,0.05)]`}
            >
              <span className={`text-sm font-black ${brand.text} tracking-tight`}>
                {getTickerInitials(activeTicker)}
              </span>
            </div>

            {/* Name + Hero Price */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[15px] font-semibold text-white/90 tracking-wide">{displayName}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 tracking-widest uppercase">
                  {exchange}
                </span>
                <SignalBadge signal={snapshot?.signal || 'HOLD'} />
                {isTransitioning && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10b981]/20 text-[#00ff87] border border-[#10b981]/40 animate-pulse">
                    <Radio className="w-2.5 h-2.5 text-[#00ff87] animate-ping" />
                    SYNCING
                  </span>
                )}
              </div>

              {/* Hero Price + Delta Badge + Audio & Alert Controls */}
              <div className="flex items-baseline gap-3 mt-0.5 flex-wrap">
                <span className="text-3xl font-bold tracking-tight text-white font-mono tabular-nums">
                  ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>

                {/* Delta Pill Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap tabular-nums ${
                    isPositive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}
                  {change.toFixed(2)} ({isPositive ? '+' : ''}
                  {changePct.toFixed(2)}%)
                </span>

                {/* Price Alarm Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setAlertTarget(Math.round(currentPrice * 1.02 * 10) / 10);
                      setShowAlertModal(!showAlertModal);
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      activeAlerts.length > 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                    title="Set target price audio alert"
                  >
                    {activeAlerts.length > 0 ? <BellRing className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                    <span>{activeAlerts.length > 0 ? `${activeAlerts.length} Alert` : 'Alert'}</span>
                  </button>

                  {/* Popover Form */}
                  {showAlertModal && (
                    <div className="absolute top-full left-0 mt-2 z-30 p-3 rounded-xl bg-[#0e131d] border border-white/15 shadow-2xl flex flex-col gap-2 w-52 font-mono text-xs">
                      <div className="text-[10px] font-bold text-slate-300 uppercase">Set Price Alert</div>
                      <form onSubmit={handleAddAlert} className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">₹</span>
                          <input
                            type="number"
                            step="0.1"
                            value={alertTarget}
                            onChange={(e) => setAlertTarget(parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 rounded bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#50C878]"
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="submit"
                            className="flex-1 py-1 rounded bg-[#50C878] text-black font-bold text-[10px] cursor-pointer"
                          >
                            Set Chime
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAlertModal(false)}
                            className="px-2 py-1 rounded bg-white/10 text-slate-300 text-[10px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* Sound Theme Badge Switcher */}
                <button
                  onClick={handleCycleTheme}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/40 transition-colors cursor-pointer"
                  title="Cycle Audio Theme (Studio / Bloomberg / Cyberpunk)"
                >
                  <Volume2 className="w-3 h-3" />
                  <span className="uppercase">{currentTheme} Audio</span>
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right: Metadata Row */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-slate-400 font-mono tracking-tight">
            {dateStr} · {timeStr} IST
          </span>
          <span className="text-[10px] text-slate-500 font-mono tracking-wide">
            NSE · Market {isPositive ? 'Advancing' : 'Declining'}
          </span>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 border-t border-white/[0.06]">
        {[
          { label: 'Open', value: `₹${open.toFixed(2)}`, mono: true },
          { label: 'High', value: `₹${high.toFixed(2)}`, mono: true, color: 'text-emerald-400' },
          { label: 'Low', value: `₹${low.toFixed(2)}`, mono: true, color: 'text-rose-400' },
          { label: 'Prev. Close', value: `₹${prevClose.toFixed(2)}`, mono: true },
          { label: 'Volume', value: formatVolume(volume), mono: true, color: 'text-cyan-400' },
          {
            label: 'Bid',
            value: `₹${(snapshot?.bid || currentPrice - 0.5).toFixed(2)}`,
            mono: true,
            color: 'text-emerald-400',
          },
          {
            label: 'Ask',
            value: `₹${(snapshot?.ask || currentPrice + 0.5).toFixed(2)}`,
            mono: true,
            color: 'text-rose-400',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{label}</span>
            <span className={`text-xs font-mono font-semibold tabular-nums ${color ?? 'text-slate-200'}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
