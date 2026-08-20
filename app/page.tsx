'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useVortexSocket } from '@/lib/websocket';

const AppHeader = dynamic(() => import('@/components/layout/AppHeader'), { ssr: false });

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-Time Order Flow',
    desc: 'Sub-millisecond market data ingestion with Level 2 bid/ask depth, toxicity scoring, and live order book imbalance detection.',
    stat: '< 1ms',
    statLabel: 'Latency',
  },
  {
    icon: '🧠',
    title: 'Quantitative AI Engine',
    desc: 'On-device Gemini 3.6 Flash integration with live technical indicators — RSI, MACD, Bollinger Bands, VWAP — for natural language market analysis.',
    stat: '88%',
    statLabel: 'Signal Accuracy',
  },
  {
    icon: '📰',
    title: 'Intelligence Feed',
    desc: 'Real-time RSS news scraping across 12 financial wire sources with keyword-based sentiment scoring and per-ticker context filtering.',
    stat: '12',
    statLabel: 'News Sources',
  },
];

const STORY_SECTIONS = [
  {
    tag: '01 / BRAND IDENTITY',
    heading: 'VORTEX-HF',
    sub: 'High-Frequency Telemetry & Quantitative AI Engine',
    desc: 'The professional-grade market intelligence terminal. Built for quantitative traders, analysts, and algo engineers who demand edge.',
    isHero: true,
  },
  {
    tag: '02 / MARKET DATA',
    heading: 'Tick-Level Precision',
    desc: 'Every trade, every quote, every price movement — captured and processed in real-time. Candlestick charts, Level 2 depth, VWAP anchoring.',
  },
  {
    tag: '03 / AI ENGINE',
    heading: 'Intelligence, Not Just Data',
    desc: 'Ask anything about any stock in plain English. The Vortex AI analyst uses live market context to explain, predict, and advise.',
  },
  {
    tag: '04 / NEWS WIRE',
    heading: 'Market Intelligence Radar',
    desc: '12 financial wire sources scraped in real-time. Headlines tagged, scored, and filtered by sentiment and ticker relevance.',
  },
];

export default function LandingPage() {
  const { status, snapshot } = useVortexSocket();

  return (
    <div className="min-h-screen relative flex flex-col gap-8 w-full" style={{ background: '#000e07' }}>
      <AppHeader wsStatus={status} activeTicker={snapshot?.ticker} currentPath="/" />

      {/* Story Scroll Sections */}
      <div className="relative z-10 flex flex-col gap-12 w-full">
        {STORY_SECTIONS.map((section, i) => (
          <section
            key={i}
            className="relative min-h-[70vh] flex items-center justify-center py-8 w-full"
          >
            <motion.div
              className="p-6 md:p-10 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden max-w-4xl w-full text-center flex flex-col items-center gap-6"
              initial={{ opacity: 0.85, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-mono text-xs font-bold tracking-[4px] text-[var(--matrix)]">
                {section.tag}
              </p>

              {section.isHero ? (
                <>
                  <h1
                    className="font-sans font-black tracking-[8px] uppercase text-[var(--matrix-bright)]"
                    style={{ fontSize: 'clamp(44px, 7vw, 92px)', lineHeight: 1.05, textShadow: '0 0 50px rgba(0,255,135,0.4)' }}
                  >
                    {section.heading}
                  </h1>
                  <p className="font-mono text-xs font-semibold tracking-widest text-[var(--matrix)] text-center">
                    {section.sub}
                  </p>
                </>
              ) : (
                <h2
                  className="font-sans font-black tracking-wider uppercase text-center"
                  style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', lineHeight: 1.15, background: 'linear-gradient(135deg, #e8fff4 0%, #50C878 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {section.heading}
                </h2>
              )}

              <p className="font-mono text-xs font-semibold leading-relaxed max-w-2xl mx-auto text-[var(--text-secondary)] text-center">
                {section.desc}
              </p>

              {/* CTA buttons on hero */}
              {section.isHero && (
                <div className="flex flex-wrap gap-4 md:gap-6 justify-center items-center pt-4">
                  <Link href="/terminal" className="no-underline inline-flex flex-shrink-0">
                    <motion.button
                      className="glass-pill cursor-pointer font-bold text-xs tracking-wider"
                      style={{ background: 'var(--matrix)', color: '#000', borderColor: 'var(--matrix)', boxShadow: '0 0 24px rgba(80,200,120,0.4)' }}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(80,200,120,0.7)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🚀 ENTER TERMINAL
                    </motion.button>
                  </Link>
                  <Link href="/analyst" className="no-underline inline-flex flex-shrink-0">
                    <motion.button
                      className="glass-pill text-matrix cursor-pointer font-bold text-xs tracking-wider"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🧠 AI ANALYST
                    </motion.button>
                  </Link>
                  <Link href="/screener" className="no-underline inline-flex flex-shrink-0">
                    <motion.button
                      className="glass-pill cursor-pointer font-bold text-xs tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🎯 SCREENER
                    </motion.button>
                  </Link>
                </div>
              )}

              {/* Scroll prompt on hero */}
              {i === 0 && (
                <div className="pt-4 flex flex-col items-center gap-2 animate-bounce">
                  <p className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">SCROLL TO EXPLORE</p>
                  <span className="text-[var(--matrix)] text-sm">↓</span>
                </div>
              )}
            </motion.div>
          </section>
        ))}

        {/* Features Grid */}
        <section className="relative flex flex-col items-center justify-center py-8 gap-6 w-full">
          <div className="p-6 md:p-10 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden max-w-6xl w-full flex flex-col items-center gap-8 text-center">
            <div>
              <p className="font-mono text-xs font-bold tracking-[4px] text-[var(--matrix)]">05 / CORE CAPABILITIES</p>
              <h2 className="font-sans text-3xl font-black tracking-wider uppercase mt-2" style={{ background: 'linear-gradient(135deg, #e8fff4, #50C878)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Unfair Advantage. Real-Time Alpha.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-2">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  className="glass-sm rounded-xl p-6 overflow-hidden flex flex-col gap-4 text-left border border-[rgba(80,200,120,0.15)]"
                  whileHover={{ y: -6, borderColor: 'rgba(80,200,120,0.4)', boxShadow: '0 12px 30px rgba(0,255,135,0.15)' }}
                >
                  <div className="text-4xl">{f.icon}</div>
                  <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">{f.title}</h3>
                  <p className="font-mono text-xs font-semibold leading-relaxed flex-1 text-[var(--text-secondary)]">{f.desc}</p>
                  <div className="pt-3 border-t border-[rgba(80,200,120,0.15)]">
                    <span className="font-mono text-2xl font-black text-[var(--matrix)]">{f.stat}</span>
                    <p className="font-mono text-[9px] font-semibold tracking-widest mt-0.5 text-[var(--text-muted)]">{f.statLabel}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Launch CTA */}
            <div className="pt-8 border-t border-[rgba(80,200,120,0.15)] w-full flex flex-col items-center gap-4">
              <p className="font-mono text-xs font-bold tracking-[4px] text-[var(--matrix)]">06 / LAUNCH SYSTEM</p>
              <h2 className="font-sans text-2xl font-black tracking-wider uppercase text-[var(--text-primary)]">Ready For Market Execution</h2>
              <p className="font-mono text-xs font-semibold text-[var(--text-secondary)]">Access the real-time command desk, market screener, or quantitative analyst.</p>
              <div className="flex flex-wrap gap-6 justify-center pt-2">
                <Link href="/terminal" className="no-underline inline-flex flex-shrink-0">
                  <motion.button
                    className="glass-pill cursor-pointer font-bold text-xs tracking-wider"
                    style={{ background: 'var(--matrix)', color: '#000', boxShadow: '0 0 30px rgba(80,200,120,0.4)', borderColor: 'var(--matrix)' }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(80,200,120,0.7)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🚀 Enter Market Dashboard
                  </motion.button>
                </Link>
                <Link href="/analyst" className="no-underline inline-flex flex-shrink-0">
                  <motion.button
                    className="glass-pill text-matrix cursor-pointer font-bold text-xs tracking-wider"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🧠 Open AI Analyst
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}