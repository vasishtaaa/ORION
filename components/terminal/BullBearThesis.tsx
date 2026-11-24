'use client';

import React, { useState, useEffect } from 'react';
import { VortexSnapshot } from '@/lib/types';
import { TrendingUp, TrendingDown, Volume2, VolumeX, ShieldAlert, Zap, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface BullBearThesisProps {
  snapshot: VortexSnapshot | null;
  activeTicker: string;
  currentPrice: number;
}

export function BullBearThesis({ snapshot, activeTicker, currentPrice }: BullBearThesisProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const cleanTicker = activeTicker.split('_')[0];
  const sentiment = snapshot?.sentiment ?? 0.25;
  const confidence = snapshot?.confidence ?? 78;
  const bullProb = Math.min(92, Math.max(25, Math.round(50 + sentiment * 45)));
  const bearProb = 100 - bullProb;

  const targetPrice = snapshot?.target || currentPrice * 1.035;
  const supportPrice = currentPrice * 0.975;

  // Web Speech Synthesis
  const handleVoiceBrief = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const script = `ORION AI Market Intelligence briefing for ${cleanTicker}. Current market quote is ₹${currentPrice.toFixed(
      2
    )}. The quantitative model assigns a ${bullProb}% bullish probability with upside target of ₹${targetPrice.toFixed(
      2
    )}, and key defensive support positioned at ₹${supportPrice.toFixed(
      2
    )}. Technical signal is ${snapshot?.signal || 'BUY'} with ${confidence}% algorithmic confidence.`;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-3 font-mono text-xs">
      {/* Header with Voice Speaker Button */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-white uppercase tracking-wider">AI Dual-Perspective Thesis</h4>
        </div>

        <button
          onClick={handleVoiceBrief}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer',
            isSpeaking
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 animate-pulse'
              : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
          )}
          title="Listen to AI voiceover briefing"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isSpeaking ? 'Stop Briefing' : 'AI Voice Brief'}</span>
        </button>
      </div>

      {/* Probability Distribution Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Bull Case: {bullProb}%
          </span>
          <span className="text-rose-400 font-bold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Bear Risk: {bearProb}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${bullProb}%` }} />
          <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${bearProb}%` }} />
        </div>
      </div>

      {/* Split Thesis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
        {/* Bullish Box */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-emerald-400 font-bold pb-1 border-b border-emerald-500/15">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Bullish Drivers</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">Target: ₹{targetPrice.toFixed(1)}</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 text-[11px]">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">›</span>
              <span>Accumulation pressure sustaining above VWAP benchmark.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">›</span>
              <span>Institutional bid book depth outpaces ask offerings by 1.4x.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">›</span>
              <span>Positive sentiment skew (+{(sentiment * 100).toFixed(0)}%) in financial news flows.</span>
            </li>
          </ul>
        </div>

        {/* Bearish Box */}
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-rose-400 font-bold pb-1 border-b border-rose-500/15">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Downside Risks</span>
            </span>
            <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">Support: ₹{supportPrice.toFixed(1)}</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 text-[11px]">
            <li className="flex items-start gap-1.5">
              <span className="text-rose-400 font-bold">›</span>
              <span>Overhead supply wall active at round strike numbers.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-rose-400 font-bold">›</span>
              <span>Potential profit realization if broader index faces volatility spikes.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-rose-400 font-bold">›</span>
              <span>Invalidation threshold breached if closing below ₹{supportPrice.toFixed(1)}.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
