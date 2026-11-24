'use client';
import React from 'react';
import { Zap, Brain, ShieldAlert, Cpu } from 'lucide-react';

/**
 * BentoGrid — Asymmetric bento box layout replacing the equal-width 2×2 grid.
 *
 * Layout (12-col grid on desktop):
 *   Row 1: Primary card (col-span-7, taller) + Side card (col-span-5)
 *   Row 2: Two equal cards (col-span-6 each)
 *
 * Glass panel: refined glassmorphism (no thick solid borders).
 *   - gradient-border via pseudo-element trick (border-image doesn't work with border-radius,
 *     so we use box-shadow + outline or the wrapper+padding-1 technique)
 *   - backdrop-filter blur(24px) saturate(180%)
 *   - inset highlight on top edge
 */

/* ── Reusable glass card style object ── */
const glass = {
  background: 'rgba(10, 15, 26, 0.7)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 6px -1px rgba(0,0,0,0.5), 0 20px 50px -12px rgba(0,0,0,0.6)',
  borderRadius: '20px',
  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
};

const glassHover = {
  borderColor: 'rgba(16,185,129,0.3)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 6px -1px rgba(0,0,0,0.5), 0 20px 50px -12px rgba(0,0,0,0.6), 0 0 30px rgba(16,185,129,0.08)',
};

/* ── Individual BentoCard ── */
function BentoCard({
  icon: Icon,
  iconColor = '#10b981',
  iconBg = 'rgba(16,185,129,0.1)',
  accentColor = '#10b981',
  label,
  title,
  desc,
  footer,
  tall = false,
  className = '',
}: {
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  accentColor?: string;
  label?: string;
  title: string;
  desc: string;
  footer: React.ReactNode;
  tall?: boolean;
  className?: string;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={`relative flex flex-col justify-between p-8 sm:p-10 ${tall ? 'min-h-[360px]' : 'min-h-[280px]'} ${className}`}
      style={{ ...glass, ...(hovered ? glassHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Label badge — top-right corner */}
      {label && (
        <span
          className="absolute top-6 right-6 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{
            background: `${accentColor}12`,
            color: accentColor,
            border: `1px solid ${accentColor}25`,
          }}
        >
          {label}
        </span>
      )}

      <div className="flex flex-col items-center text-center gap-4">
        {/* Centered icon */}
        <div
          className="p-3.5 rounded-2xl w-fit transition-transform duration-300"
          style={{
            background: iconBg,
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: iconColor }} />
        </div>

        {/* Title + Description */}
        <div className="flex flex-col items-center gap-2.5 mt-1">
          <h3
            className="text-lg sm:text-xl font-sans font-bold tracking-tight text-white leading-tight text-center"
            style={{ letterSpacing: '-0.02em' }}
          >
            {title}
          </h3>
          <p className="text-sm font-sans leading-relaxed text-center" style={{ color: 'rgba(240,253,244,0.55)', lineHeight: '1.7' }}>
            {desc}
          </p>
        </div>
      </div>

      {/* Footer metric / stat area */}
      <div
        className="mt-8 pt-5 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {footer}
      </div>
    </div>
  );
}

/* ── Metric bar for footer rows ── */
function MetricBar({ label, value, pct, color = '#10b981' }: { label: string; value: string; pct: number; color?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between font-mono text-xs">
        <span style={{ color: 'rgba(240,253,244,0.4)' }}>{label}</span>
        <span className="font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}90, ${color})` }} />
      </div>
    </div>
  );
}

/* ── Main BentoGrid Export ── */
export function BentoGrid() {
  return (
    <section className="w-full flex flex-col gap-10 sm:gap-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-5">
        <span
          className="text-xs font-mono font-bold uppercase tracking-[3px] px-4 py-1.5 rounded-full"
          style={{
            color: '#10b981',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          Platform Capabilities
        </span>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black text-white leading-tight"
          style={{ letterSpacing: '-0.03em' }}
        >
          Engineered for<br />
          <span style={{
            backgroundImage: 'linear-gradient(135deg, #10b981, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Quantitative Dominance
          </span>
        </h2>
        <p className="text-base font-sans leading-relaxed max-w-2xl" style={{ color: 'rgba(240,253,244,0.5)', lineHeight: '1.75' }}>
          Four interconnected algorithmic engines combining high-throughput telemetry with deep generative AI synthesis.
        </p>
      </div>

      {/* Bento Grid — Row 1: 7 + 5 asymmetric */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* PRIMARY card — wider + taller */}
        <div className="lg:col-span-7">
          <BentoCard
            icon={Zap}
            iconColor="#10b981"
            iconBg="rgba(16,185,129,0.1)"
            accentColor="#10b981"
            label="Core Engine"
            title="Ultra-Low Latency Ingestion"
            desc="Sub-millisecond binary packet processing over high-speed WebSocket channels. Direct aggregation of Level 2 market depth, tick-by-tick order flow imbalance, and dynamic spread compression in real-time."
            tall
            footer={
              <div className="flex flex-col gap-3">
                <MetricBar label="PACKET INGESTION" value="12,480 pkts/s" pct={88} color="#10b981" />
                <div className="flex justify-between font-mono text-[11px]" style={{ color: 'rgba(240,253,244,0.35)' }}>
                  <span>p50: 480 μs</span>
                  <span>p99: 1,240 μs</span>
                  <span>p999: 2,800 μs</span>
                </div>
              </div>
            }
          />
        </div>

        {/* Secondary card — narrower */}
        <div className="lg:col-span-5">
          <BentoCard
            icon={Brain}
            iconColor="#818cf8"
            iconBg="rgba(129,140,248,0.1)"
            accentColor="#818cf8"
            label="Neural AI"
            title="Gemini Quantitative AI"
            desc="Continuous on-device neural synthesis fusing RSI momentum, MACD histograms, and live financial news sentiment into directional trade confidence scores."
            tall
            footer={
              <div className="flex items-center justify-between font-mono text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(240,253,244,0.35)' }}>NEURAL ENGINE</span>
                  <span className="font-bold text-white">Gemini 3.6 Flash</span>
                </div>
                <span
                  className="px-4 py-1.5 rounded-full font-bold text-sm"
                  style={{
                    background: 'rgba(129,140,248,0.12)',
                    color: '#818cf8',
                    border: '1px solid rgba(129,140,248,0.25)',
                    boxShadow: '0 0 16px rgba(129,140,248,0.15)',
                  }}
                >
                  88.4%
                </span>
              </div>
            }
          />
        </div>
      </div>

      {/* Bento Grid — Row 2: equal 6 + 6 */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
        <BentoCard
          icon={ShieldAlert}
          iconColor="#fbbf24"
          iconBg="rgba(251,191,36,0.08)"
          accentColor="#fbbf24"
          label="Risk Engine"
          title="Institutional Risk Engine"
          desc="Automated position sizing based on fractional Kelly criterion, volatility stop-loss calculation, and dynamic risk-to-reward ratio boundaries — protecting capital at every signal."
          footer={
            <div className="flex items-center justify-between font-mono text-sm">
              <span style={{ color: 'rgba(240,253,244,0.4)', fontSize: '11px' }}>DEFAULT R:R RATIO</span>
              <span className="font-black" style={{ color: '#fbbf24', textShadow: '0 0 12px rgba(251,191,36,0.4)' }}>1 : 2.5 Bounds</span>
            </div>
          }
        />
        <BentoCard
          icon={Cpu}
          iconColor="#06b6d4"
          iconBg="rgba(6,182,212,0.08)"
          accentColor="#06b6d4"
          label="API Layer"
          title="Enterprise Streaming APIs"
          desc="Standardized REST & RFC 6455 WebSocket endpoints streaming JSON & binary data for programmatic algorithmic trading desks, Python clients, and quant backtesting suites."
          footer={
            <div className="flex items-center justify-between font-mono text-sm">
              <span style={{ color: 'rgba(240,253,244,0.4)', fontSize: '11px' }}>PROTOCOL</span>
              <span className="font-bold" style={{ color: '#06b6d4' }}>WSS Binary (RFC 6455)</span>
            </div>
          }
        />
      </div>
    </section>
  );
}
