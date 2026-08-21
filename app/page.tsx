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
import { Sparkles, ArrowRight, Brain, Terminal, ShieldCheck, Activity, LineChart, Cpu } from 'lucide-react';

export default function LandingPage() {
  const { status, activeTicker, selectTicker } = useVortexSocket();

  return (
    <div className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-[#080b11] text-white flex flex-col items-center">
      {/* Sticky Institutional Header */}
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <main className="w-full flex-1 pt-20 sm:pt-24 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 pb-12 sm:pb-16 flex flex-col items-center text-center gap-6 sm:gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(80,200,120,0.12)] border border-[rgba(80,200,120,0.3)] text-xs font-mono text-[#00ff87] font-bold shadow-[0_0_20px_rgba(0,255,135,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#00ff87]" />
            <span>VORTEX 4.0 TELEMETRY ENGINE · SUB-MILLISECOND PRECISION</span>
          </div>

          {/* Headline */}
          <h1
            className="font-sans font-black tracking-tight uppercase text-white max-w-5xl"
            style={{
              fontSize: 'clamp(32px, 5.5vw, 70px)',
              lineHeight: 1.06,
              textShadow: '0 0 50px rgba(0,255,135,0.25)',
            }}
          >
            Institutional-Grade Market Telemetry & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#00ff87] via-[#50C878] to-emerald-400 bg-clip-text text-transparent">
              Quantitative AI
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="font-mono text-xs sm:text-sm md:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed mx-auto">
            High-frequency order book analytics, multi-layer volumetric charting, and real-time neural market reasoning powered by Gemini AI. Built for quantitative funds and active traders.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 w-full max-w-lg mx-auto">
            <Link href="/terminal" className="flex-1 min-w-[160px]">
              <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Terminal
              </Button>
            </Link>
            <Link href="/analyst" className="flex-1 min-w-[160px]">
              <Button variant="secondary" size="lg" className="w-full" leftIcon={<Brain className="w-4 h-4" />}>
                Explore AI Analyst
              </Button>
            </Link>
            <Link href="/telemetry" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full">
                API Documentation
              </Button>
            </Link>
          </div>

          {/* Refined 3D-Styled UI Mockup Frame */}
          <div className="w-full mt-6 sm:mt-10">
            <TerminalMockup />
          </div>
        </section>

        {/* Live Market Ribbon (Marquee Ticker) */}
        <MarketRibbon />

        {/* Core Pillars Bento Grid Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <BentoGrid />
        </section>

        {/* Proven Benchmarks & Performance Metrics (Stats Bar) */}
        <StatsBar />

        {/* Bottom CTA Banner */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="relative w-full rounded-2xl sm:rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-[#0e1724] to-[#080b11] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center text-center gap-6">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(80,200,120,0.1)] border border-[rgba(80,200,120,0.25)] text-xs font-mono text-[#00ff87] font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>ENTERPRISE-GRADE EXECUTION</span>
            </div>

            <h2 className="relative z-10 text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight max-w-3xl">
              Ready to Deploy Institutional Telemetry?
            </h2>

            <p className="relative z-10 font-mono text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Connect to sub-millisecond binary packet streams, inspect Level 2 order books, and leverage Gemini 3.6 Flash quantitative reasoning on live NSE / BSE equity markets.
            </p>

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
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