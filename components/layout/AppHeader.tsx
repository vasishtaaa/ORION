'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/ui/Badges';
import { Button } from '@/components/ui/Button';
import { DrawerMenu } from './DrawerMenu';
import { useToast } from '@/components/ui/Toast';
import { Search, Menu, Download, Volume2, VolumeX, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { toggleAudio, isAudioEnabled } from '@/lib/audio';

interface AppHeaderProps {
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  activeTicker?: string;
  currentPath?: string;
  onTickerSelect?: (ticker: string) => void;
}

const NAV_LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/terminal', label: 'Terminal', badge: 'LIVE' },
  { href: '/analyst', label: 'AI Analyst', badge: 'GEMINI' },
  { href: '/screener', label: 'Screener' },
  { href: '/news', label: 'News Wire' },
  { href: '/telemetry', label: 'Telemetry' },
];

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
      localStorage.setItem('vortex_active_ticker', formatted);
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
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#000e07]/85 border-b border-[rgba(80,200,120,0.18)] shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        <div className="w-full max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 no-underline group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ff87] to-[#006b3a] flex items-center justify-center font-black text-black text-base shadow-[0_0_20px_rgba(0,255,135,0.4)] group-hover:scale-105 transition-transform">
                V
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-black text-lg tracking-[3px] uppercase text-[#f0fff8] group-hover:text-[#00ff87] transition-colors">
                    VORTEX
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(80,200,120,0.15)] text-[#00ff87] font-bold border border-[rgba(80,200,120,0.3)]">
                    HF-4.0
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider">
                  TELEMETRY ENGINE
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 pl-4 border-l border-[rgba(80,200,120,0.15)]">
              {NAV_LINKS.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[rgba(80,200,120,0.18)] text-[#00ff87] border border-[rgba(80,200,120,0.35)] shadow-[0_0_12px_rgba(0,255,135,0.15)]'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(80,200,120,0.06)]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#00ff87]/20 text-[#00ff87] font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Search Combobox Trigger */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#00140a]/90 border border-[rgba(80,200,120,0.18)] hover:border-[#50C878] text-xs font-mono text-[var(--text-muted)] transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-[var(--matrix)] group-hover:text-[#00ff87]" />
                <span className="truncate">Search ticker (e.g. TCS, RELIANCE)...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[#002413] border border-[rgba(80,200,120,0.3)] text-[10px] text-[#00ff87] font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleAudioToggle}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                audioActive
                  ? 'bg-[#002413] text-[#00ff87] border-[#00ff87]/40 shadow-[0_0_12px_rgba(0,255,135,0.2)]'
                  : 'bg-[#00140a] text-[var(--text-muted)] border-[rgba(80,200,120,0.15)] hover:text-white'
              }`}
              title={audioActive ? 'Mute acoustic audio' : 'Enable acoustic audio'}
            >
              {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Status Badge */}
            <StatusBadge status={wsStatus} />

            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#00140a] border border-[rgba(80,200,120,0.2)] text-[var(--text-primary)] hover:text-[#00ff87] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSearchOpen(false)} />
          <form
            onSubmit={handleSearchSubmit}
            className="relative z-10 max-w-lg w-full bg-[#001208] border border-[rgba(80,200,120,0.35)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 backdrop-blur-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-[rgba(80,200,120,0.15)]">
              <Search className="w-5 h-5 text-[#00ff87]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type stock ticker (e.g. INFY, TCS, HDFC) and press Enter..."
                className="w-full bg-transparent text-sm font-mono text-white placeholder-[var(--text-muted)] focus:outline-none"
                autoFocus
              />
              <kbd className="px-1.5 py-0.5 rounded bg-[#002413] border border-[rgba(80,200,120,0.3)] text-[10px] text-[#00ff87] font-mono">
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
                    if (typeof window !== 'undefined') localStorage.setItem('vortex_active_ticker', t);
                    setSearchOpen(false);
                    success(`Switched to ${t}`);
                    router.push('/terminal');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#001f11] hover:bg-[#00ff87]/20 border border-[rgba(80,200,120,0.2)] text-xs font-mono text-[#f0fff8] hover:text-[#00ff87] transition-all cursor-pointer"
                >
                  {t}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}

      {/* Slide-out Mobile Drawer Menu */}
      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentPath={currentPath}
        activeTicker={activeTicker}
      />
    </>
  );
}