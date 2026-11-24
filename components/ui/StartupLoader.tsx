'use client';
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useVortexSocket } from '@/lib/websocket';

export function StartupLoader() {
  const { status } = useVortexSocket();
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);
  const [statusText, setStatusText] = useState('INITIALIZING TELEMETRY STREAM');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatusText('CONNECTING RFC 6455 BINARY PIPELINE...');
    }, 600);

    const timer2 = setTimeout(() => {
      setStatusText('SYNCING L2 ORDER BOOKS & QUANT ENGINE...');
    }, 1200);

    const timer3 = setTimeout(() => {
      setStatusText('ORION 4.0 ONLINE · SUB-MILLISECOND ACTIVE');
    }, 1800);

    const finishTimer = setTimeout(() => {
      setSplashFadeOut(true);
      setTimeout(() => {
        setShowSplash(false);
      }, 700);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <>
      {/* ── 1. Full-Screen Breathing Logo Startup Splash (Present in initial HTML) ── */}
      {showSplash && (
        <div
          id="orion-startup-splash"
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#06080d] text-white select-none transition-all duration-700 ${
            splashFadeOut ? 'opacity-0 pointer-events-none scale-105 blur-md' : 'opacity-100'
          }`}
        >
          {/* Ambient Breathing Backdrop Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[180px] pointer-events-none" />

          {/* Background Matrix Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,255,135,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
            
            {/* ── Central Breathing Logo & Dual Ripple Waves ── */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center mb-8">
              {/* Expanding Ripple Wave 1 */}
              <div className="absolute inset-0 rounded-3xl border border-[#00ff87]/40 animate-ripple-wave" />
              
              {/* Expanding Ripple Wave 2 (delayed) */}
              <div className="absolute inset-0 rounded-3xl border border-[#00ff87]/30 animate-ripple-wave-delay" />

              {/* The Iconic Breathing ORION "O" Emblem */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#00ff87] via-[#00e87a] to-[#007a3e] flex items-center justify-center font-black text-black text-4xl sm:text-5xl font-sans animate-logo-breathe shadow-[0_0_50px_rgba(0,255,135,0.6)] cursor-default">
                O
              </div>
            </div>

            {/* ── ORION 4.0 Breathing Wordmark ── */}
            <div className="flex items-center gap-2.5 mb-2 animate-text-breathe">
              <span className="font-sans font-black text-2xl sm:text-3xl tracking-[4px] uppercase text-white">
                ORION
              </span>
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-mono font-black rounded-md bg-[#00ff87]/20 text-[#00ff87] border border-[#00ff87]/40 shadow-[0_0_15px_rgba(0,255,135,0.25)]">
                4.0
              </span>
            </div>

            <p className="text-[11px] font-mono text-slate-400 tracking-[2px] uppercase mb-8 font-light">
              High-Frequency Market Telemetry Engine
            </p>

            {/* ── Minimalist Status Indicator ── */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0b101a]/90 border border-white/10 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#00ff87] shadow-[0_0_10px_#00ff87] animate-ping" />
              <span className="font-mono text-xs font-bold text-slate-300 tracking-wide">
                {statusText}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Live Buffering / Reconnecting Floating HUD Indicator ── */}
      {!showSplash && status !== 'connected' && (
        <div className="fixed top-20 right-3 sm:right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-2xl bg-[#0d131f]/95 border border-amber-500/30 text-amber-300 text-xs font-mono shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            <div className="flex flex-col">
              <span className="font-bold tracking-wide uppercase text-[11px]">
                {status === 'connecting' ? 'CONNECTING TO TELEMETRY' : 'DEMO DATA — RECONNECTING'}
              </span>
              <span className="text-[10px] text-amber-400/70">
                Live data is unavailable; displayed values are simulated.
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
          </div>
        </div>
      )}
    </>
  );
}
export default StartupLoader;
