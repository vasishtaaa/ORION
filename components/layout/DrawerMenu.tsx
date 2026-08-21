'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Activity, Brain, LineChart, Newspaper, Gauge, Home, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '@/components/ui/Toast';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
  activeTicker?: string;
  onTickerSelect?: (ticker: string) => void;
}

const MENU_ITEMS = [
  { href: '/', label: 'Overview', icon: <Home className="w-5 h-5" /> },
  { href: '/terminal', label: 'Terminal', icon: <Activity className="w-5 h-5" />, badge: 'LIVE' },
  { href: '/analyst', label: 'AI Analyst', icon: <Brain className="w-5 h-5" />, badge: 'GEMINI' },
  { href: '/screener', label: 'Screener', icon: <LineChart className="w-5 h-5" /> },
  { href: '/news', label: 'News', icon: <Newspaper className="w-5 h-5" /> },
  { href: '/telemetry', label: 'Wire Telemetry', icon: <Gauge className="w-5 h-5" /> },
];

export function DrawerMenu({ isOpen, onClose, currentPath = '/', activeTicker, onTickerSelect }: DrawerMenuProps) {
  const router = useRouter();
  const { success } = useToast();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    const clean = search.trim().toUpperCase();
    const formatted = clean.includes('_') ? clean : `${clean}_NSE`;
    if (onTickerSelect) onTickerSelect(formatted);
    if (typeof window !== 'undefined') localStorage.setItem('vortex_active_ticker', formatted);
    setSearch('');
    onClose();
    success(`Switched active ticker to ${formatted}`);
    if (currentPath !== '/terminal') {
      router.push('/terminal');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop with fade animation */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Body - Universal on Desktop & Mobile */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md h-full bg-[#0a0d14] border-l border-white/10 p-6 flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.95)] animate-in slide-in-from-right duration-250 overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00ff87] to-[#006b3a] flex items-center justify-center font-black text-black text-sm">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-black text-sm tracking-[2px] uppercase text-[#f0fff8]">
                  VORTEX<span className="text-[#00ff87]">-HF</span>
                </span>
                <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-wider">
                  TELEMETRY ENGINE 4.0
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#0e131d] text-[var(--text-secondary)] hover:text-white border border-white/10 hover:border-[#50C878] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Ticker Search in Drawer */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticker (e.g. TCS, RELIANCE)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0e131d] border border-white/10 text-xs font-mono text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[#00ff87]"
            />
          </form>

          {/* Navigation Links with Full-Width Touch Targets */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-mono tracking-widest text-[var(--text-muted)] uppercase px-2">
              Platform Navigation
            </p>
            <nav className="flex flex-col gap-1.5">
              {MENU_ITEMS.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      'flex items-center justify-between px-4 py-3.5 rounded-xl font-mono text-xs font-semibold transition-all min-h-[48px]',
                      isActive
                        ? 'bg-[rgba(80,200,120,0.18)] text-[#00ff87] border border-[rgba(80,200,120,0.35)] shadow-[0_0_15px_rgba(0,255,135,0.15)]'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(80,200,120,0.08)] bg-[#0e131d]/60 border border-white/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-[#00ff87]' : 'text-[var(--matrix)]'}>{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-[#00ff87]/20 text-[#00ff87] font-bold border border-[#00ff87]/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Drawer Footer with Quick CTA & Telemetry State */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-3 mt-6">
          <Link
            href="/terminal"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#50C878] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#00ff87] transition-all shadow-[0_0_20px_rgba(80,200,120,0.35)] cursor-pointer"
          >
            <span>Launch Live Trading Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex justify-between items-center text-xs font-mono px-1">
            <span className="text-[var(--text-muted)]">ACTIVE TICKER</span>
            <span className="text-[#00ff87] font-bold">{activeTicker || 'TCS_NSE'}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
              <span className="text-emerald-400 font-semibold">Binary Telemetry Stream Active</span>
            </div>
            <span>v4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}