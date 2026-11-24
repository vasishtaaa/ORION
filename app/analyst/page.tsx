'use client';
import React, { useState, useRef, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket, BASE_PRICES } from '@/lib/websocket';
import { FormattedMessage } from '@/components/analyst/FormattedMessage';
import { generateQuantitativeAnalysis } from '@/lib/aiReasoning';
import {
  Brain, Send, Sparkles, TrendingUp, ShieldAlert, Cpu,
  Copy, Check, Trash2, ArrowUpRight, BarChart2,
  Sliders, Layers, Terminal as TerminalIcon
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  signal?: 'BUY' | 'SELL' | 'HOLD';
  confidence?: number;
}

const STRATEGY_PRESETS = [
  {
    category: 'Momentum & Convergence',
    icon: ZapIcon,
    queries: [
      'Explain current RSI and MACD signal convergence',
      'Is the momentum overbought or continuing higher?',
    ],
  },
  {
    category: 'Risk & Execution Sizing',
    icon: ShieldAlert,
    queries: [
      'What is the risk-to-reward ratio for a long breakout?',
      'Calculate fractional Kelly position sizing for this stock',
    ],
  },
  {
    category: 'Microstructure & Depth',
    icon: BarChart2,
    queries: [
      'Analyze institutional order book imbalance and depth',
      'What is the estimated execution slippage for block orders?',
    ],
  },
  {
    category: 'Sentiment & Fundamentals',
    icon: Layers,
    queries: [
      'Summarize recent news sentiment impact on price action',
      'Analyze valuation multiples and trailing P/E ratio',
    ],
  },
];

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function SignalBadge({ signal }: { signal: 'BUY' | 'SELL' | 'HOLD' }) {
  const styles = {
    BUY: 'bg-emerald-500/10 text-[#00ff87] border-emerald-500/30 shadow-[0_0_10px_rgba(0,255,135,0.2)]',
    SELL: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
    HOLD: 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${styles[signal]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${signal === 'BUY' ? 'bg-[#00ff87]' : signal === 'SELL' ? 'bg-rose-400' : 'bg-amber-400'}`} />
      {signal}
    </span>
  );
}

function MetricCard({ title, value, subValue, icon, badge }: { title: string; value: string; subValue?: string; icon: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
        <span>{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline justify-between mt-1 gap-2">
        <span className="text-lg font-mono font-black text-white">{value}</span>
        {badge || (subValue && <span className="text-xs font-mono font-semibold text-slate-400">{subValue}</span>)}
      </div>
    </div>
  );
}

export default function AnalystPage() {
  const { status, activeTicker, selectTicker, snapshot, sendChat } = useVortexSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message on ticker load
  useEffect(() => {
    const defaultPrice = (activeTicker && BASE_PRICES[activeTicker]) ? BASE_PRICES[activeTicker].price : 2248.40;
    const initialText = `### ORION Quantitative Intelligence Desk Online

- **Active Instrument**: **${activeTicker}** (Quote: ₹${defaultPrice.toFixed(2)})
- **Inference Mode**: **Gemini 2.5 Flash** connected via RFC 6455 binary pipeline.
- **Engine Status**: Real-time Level 2 order books and volumetric signals synchronized.

> **Ready**: Ask any question about technical momentum, order book microstructure, risk-to-reward ratios, or select a preset strategy query below.`;

    setMessages([
      {
        id: 'initial-welcome',
        sender: 'assistant',
        text: initialText,
        timestamp: 'Just now',
        confidence: 88.4,
      },
    ]);
  }, [activeTicker]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    // Generate intelligent response via engine or reasoning model
    setTimeout(() => {
      let analysisText = '';
      try {
        if (typeof sendChat === 'function') {
          sendChat(textToSend);
        }
        analysisText = generateQuantitativeAnalysis({
          query: textToSend,
          ticker: activeTicker,
          snapshot,
        });
      } catch {
        analysisText = generateQuantitativeAnalysis({
          query: textToSend,
          ticker: activeTicker,
          snapshot,
        });
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: analysisText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        signal: snapshot?.signal || 'BUY',
        confidence: snapshot?.confidence || 88.4,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const defaultMid = (activeTicker && BASE_PRICES[activeTicker]) ? BASE_PRICES[activeTicker].price : 2248.40;
  const mid = snapshot?.mid || defaultMid;

  const handleClearChat = () => {
    setMessages([
      {
        id: `clear-${Date.now()}`,
        sender: 'assistant',
        text: `### Telemetry Stream Reset\n\n- History cleared.\n- Live market stream ready for **${activeTicker}** at **₹${mid.toFixed(2)}**.`,
        timestamp: 'Just now',
      },
    ]);
  };
  const changePct = snapshot?.change_pct ?? 1.25;
  const rsi = snapshot?.screener?.find((s) => s.ticker === activeTicker)?.rsi || 58.4;
  
  let obiVal = 24.5;
  if (snapshot?.bids_l2 && snapshot?.asks_l2) {
    const bidVol = snapshot.bids_l2.reduce((acc, [, q]) => acc + q, 0);
    const askVol = snapshot.asks_l2.reduce((acc, [, q]) => acc + q, 0);
    const tot = bidVol + askVol;
    if (tot > 0) {
      obiVal = ((bidVol - askVol) / tot) * 100;
    }
  }
  const obi = obiVal;
  const sentiment = ((snapshot?.sentiment || 0.72) * 100).toFixed(0);

  return (
    <div className="h-screen max-h-screen flex flex-col bg-[#070a10] text-white w-full overflow-hidden">
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/analyst"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <main className="flex-1 w-full p-3 sm:p-4 lg:p-5 flex flex-col gap-3 min-h-0 overflow-hidden">
        {/* Top KPI Metrics Strip */}
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          <MetricCard
            title="MODEL SIGNAL"
            value={snapshot?.signal || 'BUY'}
            badge={<SignalBadge signal={snapshot?.signal || 'BUY'} />}
            icon={<Cpu className="w-4 h-4 text-[#00ff87]" />}
          />
          <MetricCard
            title="CONFIDENCE"
            value={`${(snapshot?.confidence || 88.4).toFixed(1)}%`}
            subValue="High Conviction"
            icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
          />
          <MetricCard
            title="SENTIMENT"
            value={`${sentiment}%`}
            subValue="Bullish Convergence"
            icon={<Sparkles className="w-4 h-4 text-purple-400" />}
          />
          <MetricCard
            title="TARGET POTENTIAL"
            value={`₹${(snapshot?.target || mid * 1.038).toFixed(2)}`}
            subValue={`+${(((snapshot?.target || mid * 1.038) - mid) / mid * 100).toFixed(2)}%`}
            icon={<ShieldAlert className="w-4 h-4 text-amber-400" />}
          />
        </div>

        {/* 2-Column Full Screen Institutional Workspace */}
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3.5 min-h-0 overflow-hidden">
          
          {/* ── LEFT PANEL: Live Desk Context & Strategy Baskets (4 cols) ── */}
          <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto no-scrollbar pr-0.5">
            {/* Active Ticker Context Card */}
            <div className="p-4 rounded-xl bg-[#0d131f] border border-white/10 shadow-md flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00ff87] px-2 py-0.5 rounded-full bg-[#00ff87]/10 border border-[#00ff87]/20">
                  ACTIVE CONTEXT
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {status === 'connected' ? '● LIVE TICK' : '○ SYNCING'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-mono font-black text-white">{activeTicker}</h3>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-mono font-black text-white">₹{mid.toFixed(2)}</span>
                  <span className={`text-xs font-mono font-bold ${changePct >= 0 ? 'text-[#00ff87]' : 'text-rose-400'}`}>
                    {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Mini Technical Matrix */}
              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/5 font-mono text-xs">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-[var(--text-muted)]">RSI (14)</span>
                  <span className="font-bold text-white mt-0.5">{rsi.toFixed(1)}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-[var(--text-muted)]">OBI DEPTH</span>
                  <span className={`font-bold mt-0.5 ${obi >= 0 ? 'text-[#00ff87]' : 'text-rose-400'}`}>
                    {obi >= 0 ? '+' : ''}{obi.toFixed(1)}%
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-[var(--text-muted)]">VWAP</span>
                  <span className="font-bold text-cyan-300 mt-0.5">₹{(mid * 0.998).toFixed(2)}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-[var(--text-muted)]">KELLY SIZING</span>
                  <span className="font-bold text-amber-300 mt-0.5">3.4%</span>
                </div>
              </div>
            </div>

            {/* Categorized Strategy Presets */}
            <div className="p-4 rounded-xl bg-[#0d131f] border border-white/10 shadow-md flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <Sliders className="w-4 h-4 text-[#00ff87]" />
                <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                  Strategy Query Presets
                </span>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar">
                {STRATEGY_PRESETS.map((preset, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-400">
                      <preset.icon className="w-3.5 h-3.5 text-[#00ff87]" />
                      <span>{preset.category}</span>
                    </div>
                    <div className="flex flex-col gap-1 pl-1">
                      {preset.queries.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendMessage(q)}
                          disabled={isTyping}
                          className="text-left text-xs font-mono text-slate-300 hover:text-white p-2 rounded-lg bg-black/30 hover:bg-[#00ff87]/10 border border-white/5 hover:border-[#00ff87]/30 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <span className="truncate pr-2">{q}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00ff87] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL: Institutional AI Reasoning Console (8 cols) ── */}
          <div className="lg:col-span-8 flex flex-col h-full bg-[#090e17] border border-white/10 rounded-2xl overflow-hidden shadow-xl min-h-0">
            {/* Header */}
            <div className="px-4 py-3 bg-[#0c121f] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00ff87]/15 border border-[#00ff87]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,135,0.2)]">
                  <Brain className="w-4 h-4 text-[#00ff87]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wide uppercase">
                      ORION Quantitative Reasoning
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/25 font-bold">
                      GEMINI 2.5 FLASH
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">
                    Real-time synthesis for {activeTicker} · Latency 480μs
                  </p>
                </div>
              </div>

              <button
                onClick={handleClearChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-xs font-mono text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
                title="Clear conversation history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear History</span>
              </button>
            </div>

            {/* Scrollable Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    {msg.sender === 'assistant' ? (
                      <>
                        <div className="w-4 h-4 rounded bg-[#00ff87]/20 flex items-center justify-center">
                          <TerminalIcon className="w-2.5 h-2.5 text-[#00ff87]" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#00ff87] uppercase tracking-wider">
                          ORION AI
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        YOU
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500">• {msg.timestamp}</span>
                  </div>

                  {/* Bubble Container */}
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-xl p-4 transition-all shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-[#002413] border border-[#00ff87]/30 text-emerald-100 font-mono text-xs leading-relaxed'
                        : 'bg-[#0c121e]/90 border border-white/10 text-slate-200'
                    }`}
                  >
                    {msg.sender === 'assistant' ? (
                      <div>
                        <FormattedMessage content={msg.text} />
                        
                        {/* Message Action Footer */}
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>
                            {msg.confidence ? `Confidence: ${msg.confidence.toFixed(1)}%` : 'Synthesized Live'}
                          </span>
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-[#00ff87] transition-colors cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-[#00ff87]" />
                                <span className="text-[#00ff87]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Analysis</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex flex-col items-start animate-pulse">
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[10px] font-mono font-bold text-[#00ff87]">ORION AI</span>
                    <span className="text-[10px] font-mono text-slate-500">Computing telemetry...</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c121e] border border-[#00ff87]/30 flex items-center gap-2 text-xs font-mono text-[#00ff87]">
                    <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-ping" />
                    <span>Synthesizing multi-factor quantitative matrices...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Console */}
            <div className="p-3 bg-[#0a0f19] border-t border-white/10 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2.5"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder={`Ask ORION about ${activeTicker} momentum, support/resistance, RSI, or sizing...`}
                    className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 focus:border-[#00ff87]/60 text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                  <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400">
                    Enter ↵
                  </kbd>
                </div>

                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isTyping}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00ff87] hover:bg-[#00e87a] disabled:opacity-40 text-black font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,255,135,0.3)] disabled:shadow-none cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
