'use client';
import React from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { MarketRibbon } from '@/components/landing/MarketRibbon';
import { TerminalMockup } from '@/components/landing/TerminalMockup';
import { BentoGrid } from '@/components/landing/BentoGrid';
import { StatsBar } from '@/components/landing/StatsBar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, Brain, Activity } from 'lucide-react';

export default function LandingPage() {
  const { status, activeTicker, selectTicker } = useVortexSocket();

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] text-white w-full overflow-x-hidden">
      {/* Sticky Header with In-Flow Height (64px) */}
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 flex flex-col items-center text-center">
          {/* Centered Hero Badge */}
          <div className="inline-flex w-fit mx-auto mb-6 items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full bg-[rgba(80,200,120,0.12)] border border-[rgba(80,200,120,0.3)] text-xs sm:text-sm font-mono text-[#00ff87] font-bold shadow-[0_0_20px_rgba(0,255,135,0.2)]">
            <Sparkles className="w-4 h-4 text-[#00ff87]" />
            <span>VORTEX 4.0 TELEMETRY ENGINE · SUB-MILLISECOND PRECISION</span>
          </div>

          {/* Centered H1 */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-center max-w-4xl mx-auto leading-tight text-white">
            Institutional-Grade Market <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              TELEMETRY & AI EDGE
            </span>
          </h1>

          {/* Centered Sub-headline */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-400 text-center max-w-2xl mx-auto mt-6 leading-relaxed">
            High-frequency order book analytics, multi-layer volumetric charting, and real-time neural market reasoning powered by Gemini AI. Built for quantitative funds and active traders.
          </p>

          {/* Centered CTA Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link href="/terminal">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Terminal
              </Button>
            </Link>
            <Link href="/analyst">
              <Button variant="secondary" size="lg" leftIcon={<Brain className="w-4 h-4" />}>
                Explore AI Analyst
              </Button>
            </Link>
            <Link href="/telemetry">
              <Button variant="ghost" size="lg">
                API Documentation
              </Button>
            </Link>
          </div>

          {/* Refined 3D-Styled UI Mockup Frame */}
          <div className="w-full mt-14 sm:mt-20">
            <TerminalMockup />
          </div>
        </section>

        {/* Live Market Ribbon (Marquee Ticker Tape) */}
        <MarketRibbon />

        {/* Core Pillars Bento Grid Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <BentoGrid />
        </section>

        {/* Proven Benchmarks & Performance Metrics (Stats Bar) */}
        <StatsBar />

        {/* Bottom CTA Banner */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="relative w-full rounded-3xl p-8 sm:p-16 lg:p-20 bg-gradient-to-b from-[#0e1724] to-[#080b11] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center text-center gap-6">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 inline-flex w-fit items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(80,200,120,0.1)] border border-[rgba(80,200,120,0.25)] text-xs font-mono text-[#00ff87] font-bold">
              <Activity className="w-4 h-4" />
              <span>ENTERPRISE-GRADE EXECUTION</span>
            </div>

            <h2 className="relative z-10 text-3xl sm:text-5xl lg:text-6xl font-bold uppercase text-white tracking-tight max-w-3xl leading-tight">
              Ready to Deploy Institutional Telemetry?
            </h2>

            <p className="relative z-10 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
              Connect to sub-millisecond binary packet streams, inspect Level 2 order books, and leverage Gemini 3.6 Flash quantitative reasoning on live NSE / BSE equity markets.
            </p>

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/terminal">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Launch Interactive Terminal
                </Button>
              </Link>
              <Link href="/screener">
                <Button variant="secondary" size="lg">
                  View Stock Screener
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Institutional SaaS Footer */}
        <Footer />
      </main>
    </div>
  );
}