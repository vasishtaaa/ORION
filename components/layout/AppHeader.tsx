'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/ui/Badges';
import { useToast } from '@/components/ui/Toast';
import {
  Search, Volume2, VolumeX, BarChart2, Activity, Brain, Newspaper, Cpu,
  HelpCircle, ChevronDown, Compass, TrendingUp, Calendar, Clock, Star, LayoutDashboard, Radio
} from 'lucide-react';
import { toggleAudio, isAudioEnabled, audio } from '@/lib/audio';
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal';
import { NotificationCenter } from '@/components/ui/NotificationCenter';

const PRIMARY_LINKS = [
  { label: 'Terminal', href: '/terminal', icon: BarChart2 },
  { label: 'Screener', href: '/screener', icon: Activity },
  { label: 'Analyst', href: '/analyst', icon: Brain },
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'Telemetry', href: '/telemetry', icon: Cpu },
];

const MARKET_LINKS = [
  { label: 'Overview Dashboard', href: '/dashboard', icon: LayoutDashboard, desc: 'Macro market snapshot' },
  { label: 'Market Movers', href: '/movers', icon: TrendingUp, desc: 'Gainers, losers & volume surges' },
  { label: 'Sector Analysis', href: '/sectors', icon: Compass, desc: 'Industry rotation & heatmap' },
  { label: 'Corporate Earnings', href: '/earnings', icon: Calendar, desc: 'Quarterly financial reports' },
  { label: 'Economic Events', href: '/economic-events', icon: Clock, desc: 'RBI & macro calendar' },
  { label: 'My Watchlist', href: '/watchlist', icon: Star, desc: 'Custom monitored portfolios' },
];

interface AppHeaderProps {
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  activeTicker?: string;
  currentPath?: string;
  onTickerSelect?: (ticker: string) => void;
}

export default function AppHeader({
  wsStatus,
  currentPath = '/',
  onTickerSelect,
}: AppHeaderProps) {
  const router = useRouter();
  const { info, success } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [marketsMenuOpen, setMarketsMenuOpen] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setAudioActive(isAudioEnabled());
    setPulseActive(audio.isPulseRunning());
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === '?' && !searchOpen) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const handleAudioToggle = () => {
    const next = toggleAudio();
    setAudioActive(next);
    info(next ? 'Acoustic Audio Active' : 'Acoustic Audio Muted');
  };

  const handlePulseToggle = () => {
    const next = audio.togglePulse();
    setPulseActive(next);
    info(next ? 'Market Sonification Pulse Activated' : 'Market Pulse Deactivated');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const clean = searchQuery.trim().toUpperCase();
    const formatted = clean.includes('_') ? clean : `${clean}_NSE`;
    if (onTickerSelect) {
      onTickerSelect(formatted);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('orion_active_ticker', formatted);
    }
    setSearchOpen(false);
    setSearchQuery('');
    success(`Switched active ticker to ${formatted}`);
    if (currentPath !== '/terminal') {
      router.push('/terminal');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 w-full flex-shrink-0 bg-[#080b11]/95 border-b border-white/10 backdrop-blur-md flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Left: ORION Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 no-underline group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#00ff87] to-[#006b3a] flex items-center justify-center font-black text-black text-sm sm:text-base shadow-[0_0_20px_rgba(0,255,135,0.4)] group-hover:scale-105 transition-transform">
                O
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="font-sans font-black text-base sm:text-lg tracking-[2px] uppercase text-white group-hover:text-[#00ff87] transition-colors">
                  ORION
                </span>
                <span className="w-fit inline-flex shrink-0 items-center justify-center px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  4.0
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Inline Navigation Tabs & Markets Mega-Menu */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-2">
            {PRIMARY_LINKS.map(({ label, href, icon: Icon }) => {
              const isActive = currentPath === href || (href !== '/' && currentPath?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all group ${
                    isActive
                      ? 'text-[#00ff87] bg-[#00ff87]/10 shadow-[0_0_15px_rgba(0,255,135,0.15)] border border-[#00ff87]/20'
                      : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00ff87]' : 'text-[var(--text-muted)] group-hover:text-white'}`} />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#00ff87] rounded-full shadow-[0_0_8px_#00ff87]" />
                  )}
                </Link>
              );
            })}

            {/* Markets Mega-Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMarketsMenuOpen(!marketsMenuOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  marketsMenuOpen
                    ? 'text-white bg-white/10'
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Markets</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${marketsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {marketsMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMarketsMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 z-40 w-72 rounded-2xl bg-[#0a0d14] border border-white/15 p-2 shadow-2xl backdrop-blur-2xl grid grid-cols-1 gap-1">
                    {MARKET_LINKS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMarketsMenuOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 group-hover:text-[#50C878] group-hover:border-[#50C878]/30 transition-colors shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-mono text-xs font-bold text-white group-hover:text-[#50C878] transition-colors">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight">
                              {item.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right: Search, Audio, Pulse, Alerts, Hotkeys, Status */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Input Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:inline-flex items-center justify-between gap-3 px-3 py-1.5 rounded-full bg-[#0e131d]/90 border border-white/10 hover:border-[#50C878] text-xs font-mono text-[var(--text-muted)] transition-all cursor-pointer shadow-sm group w-fit"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[var(--matrix)] group-hover:text-[#00ff87]" />
                <span>Search ticker...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[10px] text-[#00ff87] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Pulse Sonification Toggle */}
            <button
              type="button"
              onClick={handlePulseToggle}
              className={`p-2 rounded-full border transition-all cursor-pointer hidden md:inline-flex ${
                pulseActive
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse'
                  : 'bg-[#0e131d] text-slate-400 border-white/10 hover:text-white'
              }`}
              title={pulseActive ? 'Stop Market Pulse Sonification' : 'Start Acoustic Market Pulse'}
            >
              <Radio className="w-4 h-4" />
            </button>

            {/* Audio Telemetry Toggle */}
            <button
              type="button"
              onClick={handleAudioToggle}
              className={`p-2 rounded-full border transition-all cursor-pointer hidden md:inline-flex ${
                audioActive
                  ? 'bg-[#002413] text-[#00ff87] border-[#00ff87]/40 shadow-[0_0_12px_rgba(0,255,135,0.2)]'
                  : 'bg-[#0e131d] text-[var(--text-muted)] border-white/10 hover:text-white'
              }`}
              title={audioActive ? 'Mute acoustic audio' : 'Enable acoustic audio'}
            >
              {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Global Notification Center */}
            <NotificationCenter />

            {/* Keyboard Shortcuts Trigger */}
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="p-2 rounded-full bg-[#0e131d] border border-white/10 text-slate-400 hover:text-[#50C878] hover:border-[#50C878]/30 transition-all cursor-pointer hidden sm:inline-flex"
              title="Keyboard shortcuts (?)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Status Pill Badge */}
            <StatusBadge status={wsStatus} />
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSearchOpen(false)} />
          <form
            onSubmit={handleSearchSubmit}
            className="relative z-10 max-w-lg w-full bg-[#0a0d14] border border-[rgba(80,200,120,0.35)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 backdrop-blur-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <Search className="w-5 h-5 text-[#00ff87]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticker (e.g. TCS, RELIANCE, HDFC)..."
                className="w-full bg-transparent text-sm font-mono text-white placeholder-[var(--text-muted)] focus:outline-none"
                autoFocus
              />
              <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-[10px] text-[#00ff87] font-mono">
                ESC
              </kbd>
            </div>
            <div className="pt-3 flex flex-wrap gap-2">
              <span className="text-[10px] font-mono text-[var(--text-muted)] w-full">Quick Baskets:</span>
              {['TCS_NSE', 'RELI_NSE', 'HDFC_NSE', 'INFY_NSE', 'SBIN_NSE', 'ADANIENT_NSE'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    if (onTickerSelect) onTickerSelect(t);
                    if (typeof window !== 'undefined') localStorage.setItem('orion_active_ticker', t);
                    setSearchOpen(false);
                    success(`Switched to ${t}`);
                    router.push('/terminal');
                  }}
                  className="px-3 py-1 rounded-full bg-[#0e131d] hover:bg-[#00ff87]/20 border border-white/10 text-xs font-mono text-[#f0fff8] hover:text-[#00ff87] transition-all cursor-pointer"
                >
                  {t}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
}
