'use client';
import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000e07] flex flex-col items-center justify-center gap-6 animate-out fade-out duration-500">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ff87] to-[#006b3a] flex items-center justify-center font-black text-black text-3xl shadow-[0_0_50px_rgba(0,255,135,0.6)] animate-pulse">
          V
        </div>
        <div className="absolute -inset-2 rounded-2xl border border-[#00ff87]/30 animate-ping opacity-30" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-sans font-black text-xl tracking-[6px] uppercase text-[#f0fff8]">
          VORTEX<span className="text-[#00ff87]">-HF</span>
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--matrix)]">
          <Activity className="w-3.5 h-3.5 animate-spin" />
          <span>Synchronizing telemetry stream...</span>
        </div>
      </div>
    </div>
  );
}
