'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LiveBadge } from '../ui/Badges';

const NAV_LINKS = [
  { href: '/', label: 'Overview', icon: '⚡', key: 'F0' },
  { href: '/terminal', label: 'Dashboard', icon: '📊', key: 'F1' },
  { href: '/analyst', label: 'AI Analyst', icon: '🧠', key: 'F3' },
  { href: '/screener', label: 'Screener', icon: '🎯', key: 'F4' },
  { href: '/news', label: 'News Hub', icon: '📰', key: 'F2' },
  { href: '/telemetry', label: 'Telemetry', icon: '📈', key: 'F6' },
];

interface DrawerMenuProps {
  open: boolean;
  onClose: () => void;
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  activeTicker?: string;
  currentPath?: string;
}

export default function DrawerMenu({ open, onClose, wsStatus, activeTicker = 'TCS_NSE', currentPath = '/' }: DrawerMenuProps) {
  const statusColor = wsStatus === 'connected' ? 'green' : wsStatus === 'connecting' ? 'yellow' : 'red';
  const statusLabel = wsStatus.toUpperCase();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[9998]"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            className="fixed top-0 left-0 h-full z-[9999] flex flex-col p-6 rounded-r-2xl border-r bg-[#000e07]/95 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden"
            style={{
              width: 320,
              padding: '24px',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-6 mb-6" style={{ borderBottom: '1px solid rgba(80,200,120,0.15)' }}>
              <div>
                <h2 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">VORTEX-HF</h2>
                <p className="font-mono text-[10px] font-semibold tracking-widest mt-1 text-[var(--text-muted)]">NAVIGATION PANEL</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-200 cursor-pointer"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
                }}
              >✕</button>
            </div>

            {/* Status Box (Inner Padding 16px 20px) */}
            <div
              className="rounded-xl flex items-center justify-between mb-6 shadow-lg overflow-hidden"
              style={{
                padding: '16px 20px',
                background: 'rgba(0, 20, 10, 0.65)',
                border: '1px solid rgba(80,200,120,0.15)',
              }}
            >
              <LiveBadge label={statusLabel} color={statusColor} />
              <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">{activeTicker}</span>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {NAV_LINKS.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-4 rounded-xl text-sm font-semibold transition-all duration-200 overflow-hidden ${isActive ? '' : 'hover:translate-x-1'
                      }`}
                    style={{
                      padding: '16px 20px',
                      background: isActive ? 'linear-gradient(90deg, rgba(80,200,120,0.18) 0%, rgba(0,135,81,0.08) 100%)' : 'transparent',
                      border: isActive ? '1px solid rgba(80,200,120,0.35)' : '1px solid transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: isActive ? '0 0 20px rgba(80,200,120,0.15)' : 'none',
                    }}
                  >
                    <span className="text-lg flex items-center justify-center w-6">{link.icon}</span>
                    <span className="flex-1 tracking-wide font-sans text-sm font-bold">{link.label}</span>
                    <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">{link.key}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="pt-6 mt-6 overflow-hidden" style={{ borderTop: '1px solid rgba(80,200,120,0.15)' }}>
              <p className="font-mono text-xs font-semibold text-[var(--text-muted)]">VORTEX Engine v4.0.0</p>
              <p className="font-mono text-xs font-semibold mt-1.5 text-[var(--text-muted)]">LLM: Gemini 3.6 Flash · AI</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}