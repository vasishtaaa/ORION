'use client';
import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#06090e] py-16 sm:py-20 text-xs font-mono flex justify-center">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center text-center gap-12">
        {/* Brand Info — Centered */}
        <div className="flex flex-col items-center text-center gap-3 max-w-lg">
          <div className="flex items-center justify-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00ff87] to-[#006b3a] flex items-center justify-center font-black text-black text-xs">
              O
            </div>
            <span className="font-sans font-black text-base tracking-[2px] uppercase text-white">
              ORION
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              4.0
            </span>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
            Next-generation high-frequency market telemetry and quantitative neural analytics engine for active traders, hedge funds, and market makers.
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--text-muted)] pt-1">
            <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
            <span className="text-emerald-400 font-bold">All Telemetry Systems Operational</span>
          </div>
        </div>

        {/* Navigation Links Grid — Centered */}
        <div className="flex flex-wrap justify-center gap-10 sm:gap-16 text-xs text-center">
          <div className="flex flex-col items-center gap-2.5">
            <span className="text-white font-bold tracking-wider uppercase text-[11px]">Platform</span>
            <Link href="/terminal" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Trading Terminal</Link>
            <Link href="/analyst" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Gemini AI Analyst</Link>
            <Link href="/screener" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Market Screener</Link>
            <Link href="/news" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">News Wire Radar</Link>
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <span className="text-white font-bold tracking-wider uppercase text-[11px]">Engine</span>
            <Link href="/telemetry" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Latency Metrics</Link>
            <Link href="/telemetry" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Packet Diagnostics</Link>
            <Link href="/telemetry" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">WebSocket API</Link>
            <Link href="/terminal" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Risk Calculator</Link>
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <span className="text-white font-bold tracking-wider uppercase text-[11px]">Resources</span>
            <a href="https://github.com/vasishtaaa/VORTEX" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">
              GitHub Repository
            </a>
            <Link href="/terminal" className="text-[var(--text-secondary)] hover:text-[#00ff87] transition-colors">Export Datasets</Link>
            <span className="text-[var(--text-muted)]">Terms & Security</span>
          </div>
        </div>

        {/* Bottom Disclaimer — Centered */}
        <div className="pt-6 border-t border-white/10 w-full flex flex-col items-center text-center gap-2 text-[10px] text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} ORION High-Frequency Telemetry Systems. All rights reserved.</p>
          <p className="max-w-xl">
            Disclaimer: For computational research, analytical modeling, and educational simulation purposes only. Not investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
