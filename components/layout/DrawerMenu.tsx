'use client';
import React from 'react';
import Link from 'next/link';
import { X, Activity, Brain, LineChart, Newspaper, Gauge, Home } from 'lucide-react';
import { clsx } from 'clsx';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
  activeTicker?: string;
}

const MENU_ITEMS = [
  { href: '/', label: 'Overview & Story', icon: <Home className="w-4 h-4" /> },
  { href: '/terminal', label: 'HFT Trading Terminal', icon: <Activity className="w-4 h-4" />, badge: 'LIVE' },
  { href: '/analyst', label: 'AI Market Analyst', icon: <Brain className="w-4 h-4" />, badge: 'GEMINI' },
  { href: '/screener', label: 'Quantitative Screener', icon: <LineChart className="w-4 h-4" /> },
  { href: '/news', label: 'News Wire Radar', icon: <Newspaper className="w-4 h-4" /> },
  { href: '/telemetry', label: 'Telemetry Diagnostics', icon: <Gauge className="w-4 h-4" /> },
];

export function DrawerMenu({ isOpen, onClose, currentPath = '/', activeTicker }: DrawerMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#001008] border-l border-[rgba(80,200,120,0.2)] p-6 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in slide-in-from-right duration-200">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-[rgba(80,200,120,0.15)]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00ff87] to-[#006b3a] flex items-center justify-center font-black text-black text-xs">
                V
              </div>
              <span className="font-sans font-black text-sm tracking-[2px] uppercase text-[#f0fff8]">
                VORTEX-HF
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#001f11] text-[var(--text-secondary)] hover:text-white border border-[rgba(80,200,120,0.15)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4">
            <p className="text-[10px] font-mono tracking-widest text-[var(--text-muted)] uppercase mb-3 px-2">
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
                      'flex items-center justify-between px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-[rgba(80,200,120,0.18)] text-[#00ff87] border border-[rgba(80,200,120,0.35)] shadow-[0_0_15px_rgba(0,255,135,0.15)]'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(80,200,120,0.08)]'
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

        <div className="pt-4 border-t border-[rgba(80,200,120,0.15)] flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-muted)]">
            <span>ACTIVE TICKER</span>
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