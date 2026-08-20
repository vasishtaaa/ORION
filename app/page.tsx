'use client';
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
    <div className="min-h-screen relative flex flex-col gap-6" style={{ background: '#000e07' }}>
      <AppHeader wsStatus={status} activeTicker={snapshot?.ticker} currentPath="/" />

      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgba(0,255,135,0.06)] rounded-full blur-[140px]" />
        <div className="absolute top-[50%] left-[20%] w-[400px] h-[400px] bg-[rgba(80,200,120,0.04)] rounded-full blur-[120px]" />
      </div>

      {/* Story Scroll Sections */}
      <div className="relative z-10 flex flex-col gap-12">
        {STORY_SECTIONS.map((section, i) => (
          <section
            key={i}
            className="relative min-h-[75vh] flex items-center justify-center p-6"
            style={{ scrollSnapAlign: 'start' }}
          >
            <motion.div
              className="p-6 md:p-10 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden max-w-4xl w-full text-center flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 48, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.p
                className="font-mono text-xs font-bold tracking-[4px] text-[var(--matrix)]"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {section.tag}
              </motion.p>

              {section.isHero ? (
                <>
                  <motion.h1
                    className="font-sans font-black tracking-[8px] uppercase text-[var(--matrix-bright)]"
                    style={{ fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 1, textShadow: '0 0 60px rgba(0,255,135,0.4)' }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {section.heading}
                  </motion.h1>
                  <motion.p
                    className="font-mono text-xs font-semibold tracking-widest text-[var(--matrix)] text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {section.sub}
                  </motion.p>
                </>
              ) : (
                <motion.h2
                  className="font-sans font-black tracking-wider uppercase text-center"
                  style={{ fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: 1.1, background: 'linear-gradient(135deg, #e8fff4 0%, #50C878 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {section.heading}
                </motion.h2>
              )}

              <motion.p
                className="font-mono text-xs font-semibold leading-relaxed max-w-2xl mx-auto text-[var(--text-secondary)] text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                {section.desc}
              </motion.p>

              {/* CTA buttons on hero */}
              {section.isHero && (
                <motion.div
                  className="flex flex-wrap gap-6 justify-center items-center pt-4"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
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
                </motion.div>
              )}

              {/* Scroll prompt on hero */}
              {i === 0 && (
                <motion.div
                  className="pt-6 flex flex-col items-center gap-2"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">SCROLL TO EXPLORE</p>
                  <span className="text-[var(--matrix)] text-sm">↓</span>
                </motion.div>
              )}
            </motion.div>
          </section>
        ))}

        {/* Features Grid with Animated Viewports */}
        <section className="relative flex flex-col items-center justify-center p-6 gap-6">
          <motion.div
            className="p-6 md:p-10 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden max-w-6xl w-full flex flex-col items-center gap-8 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
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
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
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
            <motion.div
              className="pt-8 border-t border-[rgba(80,200,120,0.15)] w-full flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
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
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}