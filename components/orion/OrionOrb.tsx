'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { orionVoice, OrionVoiceState, OrionVoiceContext } from '@/lib/orionVoice';
import { Mic, Volume2, Sparkles, X } from 'lucide-react';
import { clsx } from 'clsx';

interface OrionOrbProps {
  context: OrionVoiceContext;
}

export function OrionOrb({ context }: OrionOrbProps) {
  const [state, setState] = useState<OrionVoiceState>('STANDBY');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [handsFree, setHandsFree] = useState<boolean>(false);
  const [transcriptLog, setTranscriptLog] = useState<{ text: string; speaker: 'user' | 'orion'; time: string }[]>([
    {
      text: "ORION neural voice interface online, sir. Standing by for voice commands.",
      speaker: 'orion',
      time: 'Ready',
    },
  ]);

  const toggleListening = useCallback(() => {
    if (state === 'LISTENING') {
      orionVoice.stopListening();
    } else {
      orionVoice.startListening(context, handsFree);
      setIsExpanded(true);
    }
  }, [state, context, handsFree]);

  useEffect(() => {
    const unsubState = orionVoice.onStateChange((newState) => {
      setState(newState);
    });

    const unsubTranscript = orionVoice.onTranscript((text, speaker) => {
      setTranscriptLog((prev) => [
        ...prev.slice(-8),
        { text, speaker, time: new Date().toLocaleTimeString() },
      ]);
    });

    // Global 'J' hotkey to activate ORION
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubState();
      unsubTranscript();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleListening]);

  const handleCommandChip = (cmdText: string) => {
    orionVoice.processCommand(cmdText, context);
  };

  const isListening = state === 'LISTENING';
  const isSpeaking = state === 'SPEAKING';
  const isProcessing = state === 'PROCESSING';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-mono text-xs select-none pointer-events-auto">
      {/* Expanded Holographic HUD Drawer */}
      {isExpanded && (
        <div className="w-80 sm:w-96 rounded-2xl bg-[#080d17]/95 border border-[#50C878]/30 shadow-[0_20px_60px_rgba(80,200,120,0.25)] p-4 backdrop-blur-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00ff87] animate-ping" />
              <span className="font-bold text-[#00ff87] uppercase tracking-widest text-xs flex items-center gap-1.5">
                <span>O.R.I.O.N. Voice Core</span>
                <span className="text-[10px] text-slate-400 font-normal">v4.0</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setHandsFree(!handsFree)}
                className={clsx(
                  'px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer',
                  handsFree
                    ? 'bg-emerald-500/20 text-[#00ff87] border-emerald-500/50'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                )}
                title="Continuous Listening Mode"
              >
                {handsFree ? 'Hands-Free: ON' : 'Hands-Free: OFF'}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Holographic Status Indicator */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-950/20 border border-emerald-500/15 text-[11px]">
            <span className="text-slate-400">Status:</span>
            <span
              className={clsx(
                'font-bold tracking-wider',
                isListening
                  ? 'text-cyan-300 animate-pulse'
                  : isSpeaking
                  ? 'text-emerald-400 animate-pulse'
                  : isProcessing
                  ? 'text-amber-400 animate-pulse'
                  : 'text-slate-400'
              )}
            >
              {state === 'LISTENING'
                ? 'ORION IS LISTENING…'
                : state === 'SPEAKING'
                ? 'ORION IS SPEAKING…'
                : state === 'PROCESSING'
                ? 'NEURAL REASONING…'
                : 'STANDBY (PRESS J OR CLICK ORB)'}
            </span>
          </div>

          {/* Transcript Dialogue Box */}
          <div className="h-44 overflow-y-auto space-y-2 pr-1 text-[11px]">
            {transcriptLog.map((log, idx) => (
              <div
                key={idx}
                className={clsx(
                  'p-2 rounded-xl flex flex-col gap-0.5 leading-relaxed',
                  log.speaker === 'user'
                    ? 'bg-white/[0.04] border border-white/10 text-white ml-6'
                    : 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 mr-4'
                )}
              >
                <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase font-semibold">
                  <span className={log.speaker === 'orion' ? 'text-[#00ff87] font-bold' : 'text-slate-300'}>
                    {log.speaker === 'orion' ? 'ORION' : 'You'}
                  </span>
                  <span>{log.time}</span>
                </div>
                <p className="break-words">{log.text}</p>
              </div>
            ))}
          </div>

          {/* Quick Vocal Commands Chips */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Example Voice Commands:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Analyze this stock',
                'Buy 50 shares',
                'Switch to Reliance',
                'Show options chain',
                'Run a backtest',
                'Activate pulse',
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleCommandChip(cmd)}
                  className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-[10px] text-slate-300 hover:text-[#00ff87] transition-colors cursor-pointer"
                >
                  &ldquo;{cmd}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Glowing Arc-Reactor AI Orb */}
      <div className="flex items-center gap-3">
        {!isExpanded && (
          <div
            onClick={() => setIsExpanded(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a0f1d]/90 border border-[#50C878]/30 shadow-lg text-[#00ff87] text-xs backdrop-blur-md cursor-pointer hover:border-[#50C878] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00ff87]" />
            <span>ORION Ready</span>
            <kbd className="px-1.5 py-0.2 bg-black/60 rounded border border-[#50C878]/20 text-[10px] font-bold text-white">
              J
            </kbd>
          </div>
        )}

        <button
          onClick={toggleListening}
          className={clsx(
            'relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl group',
            isListening
              ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] scale-110'
              : isSpeaking
              ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)] scale-105'
              : isProcessing
              ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
              : 'bg-[#080d17] border border-[#50C878]/40 hover:border-[#00ff87] hover:shadow-[0_0_20px_rgba(0,255,135,0.4)]'
          )}
          title={isListening ? 'Click to stop listening' : 'Talk to ORION (Press J)'}
        >
          {/* Animated SVG Gyroscope Rings */}
          <svg className="absolute inset-0 w-full h-full p-1 overflow-visible" viewBox="0 0 100 100">
            {/* Outer Ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={isListening ? '#06b6d4' : isSpeaking ? '#10b981' : '#50C878'}
              strokeWidth="1.5"
              strokeDasharray={isListening ? '6 4' : '12 8'}
              className={clsx(
                'origin-center',
                isListening
                  ? 'animate-[spin_4s_linear_infinite]'
                  : isProcessing
                  ? 'animate-[spin_1.5s_linear_infinite]'
                  : 'animate-[spin_12s_linear_infinite]'
              )}
            />
            {/* Inner Counter Ring */}
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="none"
              stroke={isSpeaking ? '#00ff87' : '#047857'}
              strokeWidth="1.2"
              strokeDasharray="4 6"
              className={clsx(
                'origin-center',
                isListening
                  ? 'animate-[spin_3s_linear_infinite_reverse]'
                  : 'animate-[spin_16s_linear_infinite_reverse]'
              )}
            />
          </svg>

          {/* Center Glowing Core Icon */}
          <div className="relative z-10 text-white">
            {isListening ? (
              <Mic className="w-6 h-6 text-cyan-300 animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="w-6 h-6 text-emerald-300 animate-pulse" />
            ) : (
              <Sparkles className="w-6 h-6 text-[#00ff87] group-hover:scale-110 transition-transform" />
            )}
          </div>

          {/* Soundwave Ripple rings when active */}
          {isListening && (
            <span className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-75" />
          )}
        </button>
      </div>
    </div>
  );
}
