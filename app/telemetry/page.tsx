'use client';
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/Badges';
import { ShieldCheck, Activity, Zap, Network } from 'lucide-react';
import {
  GLASS_SAFE,
  pageContainerVariants,
  panelVariants,
  cardItemVariants,
  rowVariants,
} from '@/lib/motion';

/* ── Histogram Bar with GSAP ScrollTrigger width reveal ─────────────────────
   Uses a ref so GSAP can animate the bar's scaleX from 0 → 1 (transform-origin
   left) as it scrolls into the viewport.  The existing DOM structure and all
   classNames are preserved exactly — GSAP only drives the inline transform.
────────────────────────────────────────────────────────────────────────────── */
function AnimatedHistogramBar({
  pct,
  col,
  triggerRef,
  index,
}: {
  pct: number;
  col: string;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  index: number;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let st: { kill: () => void } | null = null;
    let killed = false;

    async function init() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (killed) return;

      gsap.registerPlugin(ScrollTrigger);

      // Start bar at scaleX 0 (transform-origin: left)
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left center', force3D: true });

      st = ScrollTrigger.create({
        trigger: triggerRef.current,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(barRef.current, {
            scaleX: 1,
            duration: 0.7,
            delay: index * 0.1,
            ease: 'power2.out',
            force3D: true,
          });
        },
      });
    }

    init();

    return () => {
      killed = true;
      st?.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    /* The outer track preserves the exact original className and inline style.
       Only the inner fill div gets a ref for GSAP to animate. */
    <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
      <div
        ref={barRef}
        className={`h-full ${col}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ── Telemetry Status Rows — AnimatePresence-aware ──────────────────────────
   Each row fades/slides in with rowVariants.  The key includes the status so
   AnimatePresence re-mounts the list when the WS connection state changes,
   providing clean enter/exit transitions without touching layout.
────────────────────────────────────────────────────────────────────────────── */
const STATUS_ROWS = [
  { label: 'Engine Cluster',      render: () => <span className="text-white font-bold">ORION-HF-PROD-01</span> },
  { label: 'Transport Protocol',  render: () => <span className="text-[#00ff87] font-bold">WebSocket Binary Frame (RFC 6455)</span> },
  { label: 'AI Model Reasoning',  render: () => <span className="text-cyan-300 font-bold">Google Gemini 3.6 Flash</span> },
  { label: 'Uptime Availability', render: () => <span className="text-[#00ff87] font-bold">99.98% High Availability</span> },
];

export default function TelemetryPage() {
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();

  /* ── Raw numeric values (no string formatting here — GSAP handles display) */
  const p50        = snapshot?.latency_p50   || 640;
  const p99        = snapshot?.latency_p99   || 1450;
  const avg        = snapshot?.latency_avg   || 820;
  const throughput = snapshot?.throughput    || 1850;

  /* ── Histogram section ref — used by ScrollTrigger as trigger element ── */
  const histogramRef = useRef<HTMLDivElement>(null);

  const HISTOGRAM_ROWS = [
    { range: '< 100 μs',         pct: 45, col: 'bg-emerald-400' },
    { range: '100 - 500 μs',     pct: 35, col: 'bg-[#00ff87]'   },
    { range: '500 - 1000 μs',    pct: 14, col: 'bg-cyan-400'    },
    { range: '> 1000 μs (Tail)', pct: 6,  col: 'bg-amber-400'   },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] text-white w-full overflow-x-hidden">
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/telemetry"
        onTickerSelect={(t) => selectTicker(t)}
      />

      {/* ── Page Container — Framer Motion staggers all direct children ── */}
      <motion.main
        className="flex-1 w-full px-6 sm:px-8 lg:px-12 py-8 flex flex-col gap-6"
        variants={pageContainerVariants}
        initial="hidden"
        animate="visible"
        /* Glass-safe styles applied to the wrapper, not the glass panels,
           so backdrop-filter on children is never composited under a
           mis-promoted layer. */
        style={GLASS_SAFE}
      >
        {/* ── KPI Metric Cards ─────────────────────────────────────────── */}
        {/* The grid className is identical to the original — motion.div
            wraps each card individually so the grid layout is untouched. */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          <motion.div variants={cardItemVariants} style={GLASS_SAFE}>
            <MetricCard
              title="P50 LATENCY"
              value={`${p50.toFixed(0)} μs`}
              animatedValue={p50}
              animatedFormatter={(v) => `${v.toFixed(0)} μs`}
              subValue="Median"
              icon={<ShieldCheck className="w-4 h-4 text-[#00ff87]" />}
            />
          </motion.div>

          <motion.div variants={cardItemVariants} style={GLASS_SAFE}>
            <MetricCard
              title="P99 LATENCY"
              value={`${p99.toFixed(0)} μs`}
              animatedValue={p99}
              animatedFormatter={(v) => `${v.toFixed(0)} μs`}
              subValue="Tail Jitter"
              icon={<Activity className="w-4 h-4 text-cyan-300" />}
            />
          </motion.div>

          <motion.div variants={cardItemVariants} style={GLASS_SAFE}>
            <MetricCard
              title="AVG LATENCY"
              value={`${avg.toFixed(0)} μs`}
              animatedValue={avg}
              animatedFormatter={(v) => `${v.toFixed(0)} μs`}
              subValue="Network Mean"
              icon={<Network className="w-4 h-4 text-yellow-300" />}
            />
          </motion.div>

          <motion.div variants={cardItemVariants} style={GLASS_SAFE}>
            <MetricCard
              title="THROUGHPUT"
              value={`${throughput.toFixed(0)}`}
              animatedValue={throughput}
              animatedFormatter={(v) => `${v.toFixed(0)}`}
              subValue="pkts/s"
              icon={<Zap className="w-4 h-4 text-[#00ff87]" />}
            />
          </motion.div>
        </div>

        {/* ── Diagnostics & Server Health ───────────────────────────────── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* ── Node Status Panel ── */}
          <motion.div
            variants={panelVariants}
            /* glass-safe applied to the motion wrapper, NOT the panel itself,
               so the panel's bg-[#0e131d]/90 + border/shadow are untouched */
            style={GLASS_SAFE}
            className="w-full rounded-3xl bg-[#0e131d]/90 border border-white/10 p-6 sm:p-8 flex flex-col gap-4 font-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <h3 className="text-sm sm:text-base font-bold text-[var(--matrix-bright)] uppercase border-b border-white/10 pb-3 flex items-center justify-between">
              <span>Telemetry Node Status</span>
              <StatusBadge status={status} />
            </h3>

            {/* AnimatePresence re-animates rows whenever the WS status changes.
                mode="wait" ensures exit completes before new rows enter. */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`status-rows-${status}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-0"
              >
                {STATUS_ROWS.map((row, idx) => (
                  <motion.div
                    key={row.label}
                    variants={rowVariants}
                    transition={{ delay: idx * 0.045 }}
                    className="flex justify-between py-2 border-b border-white/5"
                  >
                    <span className="text-[var(--text-muted)]">{row.label}</span>
                    {row.render()}
                  </motion.div>
                ))}

                {/* Active Channel row — value changes with ticker, not WS status */}
                <motion.div
                  key="active-channel"
                  variants={rowVariants}
                  transition={{ delay: STATUS_ROWS.length * 0.045 }}
                  className="flex justify-between py-2"
                >
                  <span className="text-[var(--text-muted)]">Active Channel</span>
                  <span className="text-white font-bold">{activeTicker}</span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ── Packet Latency Histogram Panel ── */}
          <motion.div
            ref={histogramRef as React.RefObject<HTMLDivElement>}
            variants={panelVariants}
            style={GLASS_SAFE}
            className="w-full rounded-3xl bg-[#0e131d]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between gap-4 font-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <h3 className="text-sm sm:text-base font-bold text-[var(--matrix-bright)] uppercase border-b border-white/10 pb-3">
              Packet Latency Histogram
            </h3>

            <div className="flex flex-col gap-3 py-2">
              {HISTOGRAM_ROWS.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">{item.range}</span>
                    <span className="text-white font-bold">{item.pct}%</span>
                  </div>
                  {/* GSAP ScrollTrigger animates the bar width from 0 → pct% */}
                  <AnimatedHistogramBar
                    pct={item.pct}
                    col={item.col}
                    triggerRef={histogramRef as React.RefObject<HTMLDivElement>}
                    index={idx}
                  />
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Sampling: 20,000 Rolling Ticks</span>
              <span className="text-[#00ff87] font-bold">Normal Distribution</span>
            </div>
          </motion.div>

        </div>
      </motion.main>
    </div>
  );
}
