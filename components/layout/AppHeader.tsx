'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/ui/Badges';
import { DrawerMenu } from './DrawerMenu';
import { useToast } from '@/components/ui/Toast';
import { Search, Menu, Volume2, VolumeX } from 'lucide-react';
import { toggleAudio, isAudioEnabled } from '@/lib/audio';

interface AppHeaderProps {
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  activeTicker?: string;
  currentPath?: string;
  onTickerSelect?: (ticker: string) => void;
}

export default function AppHeader({
  wsStatus,
  activeTicker = 'TCS_NSE',
  currentPath = '/',
  onTickerSelect,
}: AppHeaderProps) {
  const router = useRouter();
  const { info, success } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setAudioActive(isAudioEnabled());
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAudioToggle = () => {
    const next = toggleAudio();
    setAudioActive(next);
    info(next ? 'Acoustic Telemetry Activated' : 'Acoustic Telemetry Muted');
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
      <header className="sticky top-0 z-40 h-16 w-full flex-shrink-0 bg-[#080b11]/90 border-b border-white/10 backdrop-blur-md flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: ORION Logo with O Monogram & 4.0 Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 no-underline group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#00ff87] to-[#006b3a] flex items-center justify-center font-black text-black text-sm sm:text-base shadow-[0_0_20px_rgba(0,255,135,0.4)] group-hover:scale-105 transition-transform">
                O
              </div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-black text-base sm:text-lg tracking-[2.5px] sm:tracking-[3px] uppercase text-white group-hover:text-[#00ff87] transition-colors">
                  ORION
                </span>
                <span className="w-fit max-w-full inline-flex shrink-0 items-center justify-center px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  4.0
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Search Input (⌘K), Audio, Stream Status & Hamburger Menu Button */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Search Input Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:inline-flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-full bg-[#0e131d]/90 border border-white/10 hover:border-[#50C878] text-xs font-mono text-[var(--text-muted)] transition-all cursor-pointer shadow-sm group w-fit"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[var(--matrix)] group-hover:text-[#00ff87]" />
                <span>Search ticker...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[10px] text-[#00ff87] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Search Icon button (Mobile only) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="sm:hidden p-2 rounded-full bg-[#0e131d] border border-white/10 text-[var(--text-secondary)] hover:text-white cursor-pointer"
              title="Search ticker"
            >
              <Search className="w-4 h-4" />
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

            {/* Status Pill Badge */}
            <StatusBadge status={wsStatus} />

            {/* Sliding Drawer Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="p-2 sm:px-3.5 sm:py-1.5 rounded-full bg-[#0e131d] hover:bg-[#141b29] border border-white/10 hover:border-[#50C878] text-[var(--text-primary)] hover:text-[#00ff87] transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm w-fit"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 sm:w-4 sm:h-4 text-[#00ff87]" />
              <span className="hidden sm:inline font-mono font-bold text-xs tracking-wider uppercase">
                Menu
              </span>
            </button>
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

      {/* Sliding Slide-over Navigation Drawer */}
      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentPath={currentPath}
        activeTicker={activeTicker}
        onTickerSelect={onTickerSelect}
      />
    </>
  );
}