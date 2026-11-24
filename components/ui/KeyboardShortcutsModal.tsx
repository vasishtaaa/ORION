'use client';

import React, { useEffect } from 'react';
import { Command, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Execution & Trading',
      items: [
        { key: 'B', desc: 'Instant Buy Market Order' },
        { key: 'S', desc: 'Instant Sell Market Order' },
        { key: 'P', desc: 'Toggle Paper Trading Drawer' },
      ],
    },
    {
      title: 'Analysis & Telemetry',
      items: [
        { key: 'J', desc: 'Activate O.R.I.O.N. Voice Interface' },
        { key: 'V', desc: 'Trigger AI Voice Market Brief' },
        { key: 'O', desc: 'Toggle NSE Options Chain' },
        { key: 'T', desc: 'Toggle Strategy Backtester' },
        { key: 'F', desc: 'Toggle Institutional FII/DII Flows' },
        { key: 'M', desc: 'Toggle Audio Synthesizer (Mute/Unmute)' },
        { key: 'D', desc: 'Cycle Canvas Drawing Mode' },
      ],
    },
    {
      title: 'Timeframe Navigation',
      items: [
        { key: '1', desc: 'LIVE Tick Stream' },
        { key: '2', desc: '1 Day Intraday Bars' },
        { key: '3', desc: '1 Week Swing Bars' },
        { key: '4 - 6', desc: '1M, 6M, 1Y Macro Candlesticks' },
      ],
    },
    {
      title: 'System & Modals',
      items: [
        { key: '?', desc: 'Open / Close Shortcuts HUD' },
        { key: 'Esc', desc: 'Dismiss active dialog or drawer' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono text-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#0e131d] border border-white/15 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Command className="w-5 h-5 text-[#50C878]" />
            <h3 className="font-bold text-sm tracking-wider uppercase">ORION Command & Hotkeys HUD</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-[var(--matrix-bright)] font-bold tracking-wider uppercase">
                {group.title}
              </span>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-slate-300">
                    <span className="text-[11px] text-slate-400">{item.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-black/80 border border-white/20 text-white font-bold text-[10px] shadow-sm">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">?</kbd> anywhere to reveal this cheat sheet</span>
          <span>ORION Engine v4.0</span>
        </div>
      </div>
    </div>
  );
}
