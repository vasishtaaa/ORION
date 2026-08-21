'use client';
import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#06090e] py-12 sm:py-16 text-xs font-mono">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* Top Footer Row */}
        <div className="flex flex-wrap justify-between items-start gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-3 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00ff87] to-[#006b3a] flex items-center justify-center font-black text-black text-xs">
                V
              </div>
              <span className="font-sans font-black text-base tracking-[2px] uppercase text-white">
                VORTEX<span className="text-[#00ff87]">-HF</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(80,200,120,0.15)] text-[#00ff87] font-bold border border-[rgba(80,200,120,0.3)]">
                v4.0
              </span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
              Next-generation high-frequency market telemetry and quantitative neural analytics engine for active traders, hedge funds, and market makers.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] pt-1">
              <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
              <span className="text-emerald-400 font-bold">All Telemetry Systems Operational</span>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div className="flex flex-col gap-2.5">
              <span className="text-white font-bold tracking-wider uppercase text-[11px]">Platform</span>
              <Link href="/terminal" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Trading Terminal</Link>
              <Link href="/analyst" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Gemini AI Analyst</Link>
              <Link href="/screener" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Market Screener</Link>
              <Link href="/news" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">News Wire Radar</Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-white font-bold tracking-wider uppercase text-[11px]">Engine</span>
              <Link href="/telemetry" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Latency Metrics</Link>
              <Link href="/telemetry" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Packet Diagnostics</Link>
              <Link href="/telemetry" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">WebSocket API</Link>
              <Link href="/terminal" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Risk Calculator</Link>
            </div>

            <div className="flex flex-col gap-2.5 col-span-2 sm:col-span-1">
              <span className="text-white font-bold tracking-wider uppercase text-[11px]">Resources</span>
              <a href="https://github.com/vasishtaaa/VORTEX" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">
                GitHub Repository
              </a>
              <Link href="/terminal" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Export Datasets</Link>
              <span className="text-[var(--text-muted)]">Terms & Security</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} VORTEX High-Frequency Telemetry Systems. All rights reserved.</p>
          <p className="max-w-xl text-center sm:text-right">
            Disclaimer: For computational research, analytical modeling, and educational simulation purposes only. Not investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
