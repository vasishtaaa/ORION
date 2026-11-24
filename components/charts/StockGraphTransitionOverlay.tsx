'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Radio } from 'lucide-react';
import { BASE_PRICES } from '@/lib/websocket';

interface StockGraphTransitionOverlayProps {
  targetTicker: string;
  onComplete?: () => void;
}

const STEPS = [
  { label: 'CALIBRATING FEED', desc: 'Connecting to institutional WebSocket stream' },
  { label: 'RESOLVING DEPTH', desc: 'Ingesting L2 order book bids & asks' },
  { label: 'SYNCHRONIZING OHLC', desc: 'Compiling high-frequency tick candlesticks' },
  { label: 'ONLINE', desc: 'Telemetry stream locked' },
];

export default function StockGraphTransitionOverlay({
  targetTicker,
}: StockGraphTransitionOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const baseSymbol = targetTicker.split('_')[0] || targetTicker;
  const exchange = targetTicker.split('_')[1] || 'NSE';
  const companyInfo = BASE_PRICES[targetTicker] || {
    name: baseSymbol,
    price: 0,
  };

  useEffect(() => {
    const t1 = setTimeout(() => setStepIndex(1), 120);
    const t2 = setTimeout(() => setStepIndex(2), 260);
    const t3 = setTimeout(() => setStepIndex(3), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [targetTicker]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden rounded-2xl pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(10, 16, 28, 0.94) 0%, rgba(5, 8, 15, 0.98) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* ── Background Quantum Grid & Ambient Glow ────────────────────────── */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div
        className="absolute w-[460px] h-[260px] rounded-full blur-[100px] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(6, 182, 212, 0.2) 50%, transparent 80%)',
        }}
      />

      {/* ── Holographic Laser Scanning Line ─────────────────────────────── */}
      <motion.div
        animate={{ y: ['-140%', '320%'] }}
        transition={{
          repeat: Infinity,
          duration: 1.4,
          ease: 'linear',
        }}
        className="absolute left-0 right-0 h-1 pointer-events-none opacity-70"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.8) 25%, rgba(6, 182, 212, 1) 50%, rgba(16, 185, 129, 0.8) 75%, transparent 100%)',
          boxShadow: '0 0 16px rgba(6, 182, 212, 0.9), 0 0 32px rgba(16, 185, 129, 0.6)',
        }}
      />

      {/* ── Central HUD Hologram ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-5 max-w-sm w-full mx-4">
        {/* Animated Radar Reticle */}
        <div className="relative flex items-center justify-center w-16 h-16">
          {/* Outer rotating dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-[#10b981]/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          />
          {/* Inner counter-rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute inset-2 rounded-full border border-cyan-400/40 border-t-transparent"
          />
          {/* Center glowing core icon */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#0e1626] border border-white/20 shadow-inner">
            <Activity className="w-4 h-4 text-[#00ff87] animate-pulse" />
          </div>
        </div>

        {/* Target Ticker & Name */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-[#10b981]/20 text-[#00ff87] border border-[#10b981]/40 tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              {targetTicker}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/5 text-slate-400 border border-white/10 uppercase">
              {exchange}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-white tracking-wide mt-1 truncate max-w-[280px]">
            {companyInfo.name}
          </h4>

          {companyInfo.price > 0 && (
            <span className="text-xs font-mono text-cyan-300 font-bold">
              Base Ref ₹{companyInfo.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Animated Status Step */}
        <div className="w-full flex flex-col gap-2 font-mono">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Radio className="w-3 h-3 text-[#00ff87] animate-ping" />
              {STEPS[stepIndex]?.label || 'SYNCHRONIZING'}
            </span>
            <span className="text-cyan-300 font-bold tabular-nums">
              {Math.min(99, Math.floor((stepIndex + 1) * 25))}%
            </span>
          </div>

          {/* Futuristic Gradient Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
            <motion.div
              initial={{ width: '15%' }}
              animate={{ width: `${(stepIndex + 1) * 25}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#10b981] via-cyan-400 to-[#00ff87] shadow-[0_0_12px_rgba(0,255,135,0.8)]"
            />
          </div>

          <p className="text-[10px] text-slate-400 text-center truncate">
            {STEPS[stepIndex]?.desc || 'Calibrating order flow telemetry...'}
          </p>
        </div>

        {/* High-frequency equalizer telemetry bars */}
        <div className="flex items-center gap-1 pt-1">
          {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3].map((initialScale, idx) => (
            <motion.div
              key={idx}
              animate={{
                scaleY: [initialScale, 1.1 - initialScale * 0.5, initialScale],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.6 + idx * 0.1,
                ease: 'easeInOut',
              }}
              className="w-1 h-3 rounded-full bg-gradient-to-t from-[#10b981] to-cyan-400"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
