'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Activity, Brain, LineChart, Newspaper, Gauge, Home, Search } from 'lucide-react';
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
  { href: '/', label: 'Overview & Story', icon: <Home className="w-5 h-5" /> },
  { href: '/terminal', label: 'HFT Trading Terminal', icon: <Activity className="w-5 h-5" />, badge: 'LIVE' },
  { href: '/analyst', label: 'AI Market Analyst', icon: <Brain className="w-5 h-5" />, badge: 'GEMINI' },
  { href: '/screener', label: 'Quantitative Screener', icon: <LineChart className="w-5 h-5" /> },
  { href: '/news', label: 'News Wire Radar', icon: <Newspaper className="w-5 h-5" /> },
  { href: '/telemetry', label: 'Telemetry Diagnostics', icon: <Gauge className="w-5 h-5" /> },
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
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />

      {/* Drawer Body */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm h-full bg-[#0a0d14] border-l border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.95)] animate-in slide-in-from-right duration-200 overflow-y-auto">
        <div className="flex flex-col gap-5">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff87] to-[#006b3a] flex items-center justify-center font-black text-black text-xs">
                V
              </div>
              <span className="font-sans font-black text-sm tracking-[2px] uppercase text-[#f0fff8]">
                VORTEX<span className="text-[#00ff87]">-HF</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#0e131d] text-[var(--text-secondary)] hover:text-white border border-white/10 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input in Drawer */}
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

          {/* Navigation Links with >= 48px Touch Targets */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-mono tracking-widest text-[var(--text-muted)] uppercase px-2">
              Navigation Modules
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
                      'flex items-center justify-between px-4 py-3 rounded-xl font-mono text-xs font-semibold transition-all min-h-[48px]',
                      isActive
                        ? 'bg-[rgba(80,200,120,0.18)] text-[#00ff87] border border-[rgba(80,200,120,0.35)] shadow-[0_0_15px_rgba(0,255,135,0.15)]'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(80,200,120,0.08)] bg-[#0e131d]/60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-[#00ff87]' : 'text-[var(--matrix)]'}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00ff87]/20 text-[#00ff87] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-2 mt-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[var(--text-muted)]">ACTIVE TICKER</span>
            <span className="text-[#00ff87] font-bold">{activeTicker || 'TCS_NSE'}</span>
          </div>
          <p className="text-[10px] font-mono text-[var(--text-muted)] text-center">
            VORTEX High-Frequency Engine v4.0
          </p>
        </div>
      </div>
    </div>
  );
}