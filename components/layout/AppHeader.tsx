'use client';
import React, { useState, useEffect } from 'react';
import DrawerMenu from './DrawerMenu';
import { LiveBadge } from '../ui/Badges';

interface AppHeaderProps {
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  activeTicker?: string;
  latency?: number;
  currentPath?: string;
}

export default function AppHeader({ wsStatus, activeTicker, latency, currentPath = '/' }: AppHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Live clock — updates every second
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const tick = () => setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sticky top-0 z-[9999] w-full mb-6">
      <DrawerMenu
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        wsStatus={wsStatus}
        activeTicker={activeTicker}
        currentPath={currentPath}
      />

      {/* Top Header Bar Container */}
      <header className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-between h-16 px-6 w-full">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setDrawerOpen(true)}
            className="glass-pill text-matrix cursor-pointer flex-shrink-0"
          >
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M1 1.5H15M1 7H15M1 12.5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="leading-none">MENU</span>
          </button>

          <div className="flex flex-col justify-center">
            <h1 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)] leading-none">VORTEX-HF</h1>
            <p className="font-mono text-[9px] font-semibold tracking-widest mt-1.5 leading-none text-[var(--text-muted)]">REAL-TIME TELEMETRY INTERFACE</p>
          </div>
        </div>

        {/* Right: Status chips */}
        <div className="flex items-center gap-3">
          <div className="bg-[#00170c] border border-[rgba(80,200,120,0.15)] rounded-xl px-4 py-1.5 flex flex-col items-center justify-center min-w-[90px] overflow-hidden">
            <span className="font-mono text-[9px] font-semibold tracking-wider leading-tight mb-0.5 text-[var(--text-muted)]">GATEWAY</span>
            <LiveBadge
              label={wsStatus === 'connected' ? 'LIVE' : wsStatus === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
              color={wsStatus === 'connected' ? 'green' : wsStatus === 'connecting' ? 'yellow' : 'red'}
            />
          </div>

          {latency !== undefined && (
            <div className="bg-[#00170c] border border-[rgba(80,200,120,0.15)] rounded-xl px-4 py-1.5 flex flex-col items-center justify-center hidden md:flex min-w-[90px] overflow-hidden">
              <span className="font-mono text-[9px] font-semibold tracking-wider leading-tight mb-0.5 text-[var(--text-muted)]">LATENCY</span>
              <span className="font-mono text-xs font-semibold leading-tight text-[var(--matrix)]">{latency.toFixed(1)}μs</span>
            </div>
          )}

          {activeTicker && (
            <div className="bg-[#00170c] border border-[rgba(80,200,120,0.15)] rounded-xl px-4 py-1.5 flex flex-col items-center justify-center hidden lg:flex min-w-[90px] overflow-hidden">
              <span className="font-mono text-[9px] font-semibold tracking-wider leading-tight mb-0.5 text-[var(--text-muted)]">ACTIVE</span>
              <span className="font-mono text-xs font-semibold leading-tight text-[var(--matrix-bright)]">{activeTicker.split('_')[0]}</span>
            </div>
          )}

          <div className="bg-[#00170c] border border-[rgba(80,200,120,0.15)] rounded-xl px-4 py-1.5 flex flex-col items-center justify-center hidden md:flex min-w-[90px] overflow-hidden">
            <span className="font-mono text-[9px] font-semibold tracking-wider leading-tight mb-0.5 text-[var(--text-muted)]">TIME</span>
            <span className="font-mono text-xs font-semibold leading-tight text-[var(--text-primary)]">{timeStr}</span>
          </div>
        </div>
      </header>
    </div>
  );
}