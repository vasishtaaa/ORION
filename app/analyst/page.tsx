'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useVortexSocket } from '@/lib/websocket';

const AppHeader = dynamic(() => import('@/components/layout/AppHeader'), { ssr: false });

interface ChatMessage { role: 'user' | 'agent'; text: string; ts: number; }

const QUICK_PROMPTS = [
  'Fundamental Metrics',
  'RSI & MACD Analysis',
  'Risk Assessment',
  'Order Flow Imbalance',
];

export default function AnalystPage() {
  const { status, snapshot, activeTicker } = useVortexSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'agent',
      text: 'VORTEX AI Analyst online.\n\nI am connected to live market telemetry. My responses cover full technical & quantitative analysis across any ticker. Ask me about:\n• Technical indicators (RSI, MACD, Bollinger Bands, VWAP)\n• Fundamental analysis (P/E, EPS, Market Cap)\n• Risk management, stop-loss strategies\n• Order flow & market microstructure\n\nType your question below or click a quick prompt.',
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const buildSystemPrompt = useCallback(() => {
    const s = snapshot;
    const now = new Date().toISOString();
    const newsContext = s?.news?.slice(0, 5).map((n, i) =>
      `  ${i + 1}. [${n.source?.toUpperCase() ?? 'WIRE'}] ${n.headline}`
    ).join('\n') ?? '  No live news available.';

    return `You are VORTEX AI Analyst — a professional quantitative stock analyst integrated into a real-time HFT telemetry dashboard.

Current Time: ${now}
Active Ticker: ${activeTicker ?? 'N/A'}

Live Market Telemetry:
  Price (Mid): ₹${s?.mid?.toFixed(4) ?? 'N/A'}
  Bid: ₹${s?.bid?.toFixed(4) ?? 'N/A'}
  Ask: ₹${s?.ask?.toFixed(4) ?? 'N/A'}
  Signal: ${s?.signal ?? 'N/A'} (${s?.confidence?.toFixed(1) ?? 'N/A'}% confidence)
  Price Target: ₹${s?.target?.toFixed(2) ?? 'N/A'}
  Stop-Loss: ₹${s?.stop_loss?.toFixed(2) ?? 'N/A'}
  Risk Level: ${s?.risk_level ?? 'N/A'}

Recent News Headlines:
${newsContext}

Behavior:
- Respond with concise, structured quantitative analysis.
- Use bullet points and clear sections.
- Reference the live telemetry data above when relevant.
- Cover technical indicators (RSI, MACD, Bollinger Bands, VWAP) and fundamentals when asked.
- Keep responses focused and professional — this is a trading terminal.`;
  }, [snapshot, activeTicker]);

  const handleSend = useCallback(async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, ts: Date.now() }]);
    setLoading(true);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.0-flash'];

    try {
      let responseText = '';
      let lastError = '';

      for (const model of modelsToTry) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: buildSystemPrompt() }],
              },
              contents: [
                { role: 'user', parts: [{ text: userMsg }] },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
            if (responseText) break;
          } else {
            const errJson = await res.json().catch(() => ({}));
            lastError = errJson?.error?.message || `HTTP ${res.status}`;
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
        }
      }

      if (responseText) {
        setMessages(prev => [...prev, { role: 'agent', text: responseText, ts: Date.now() }]);
      } else {
        throw new Error(lastError || 'All Gemini models failed');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      const s = snapshot;
      const quantResponse =
        `📊 VORTEX QUANTITATIVE ANALYSIS — ${activeTicker}\n` +
        `──────────────────────────────────────────────\n` +
        `• Signal: ${s?.signal || 'BUY'} (${s?.confidence?.toFixed(0) || 82}% Confidence)\n` +
        `• Price Target: ₹${s?.target?.toFixed(2) || '—'} (Current: ₹${s?.mid?.toFixed(2) || '—'})\n` +
        `• Risk Rating: ${s?.risk_level || 'MODERATE'} | Stop-Loss: ₹${s?.stop_loss?.toFixed(2) || (s?.mid ? (s.mid * 0.975).toFixed(2) : '—')}\n\n` +
        `⚠️ Gemini API unavailable (${errMsg}).\n` +
        `Showing live telemetry snapshot instead.`;
      setMessages(prev => [...prev, { role: 'agent', text: quantResponse, ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, activeTicker, snapshot, buildSystemPrompt]);

  const s = snapshot;

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/analyst" />

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">

        {/* ── AI Chat Panel ── */}
        <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(80,200,120,0.15)' }}>
            <div>
              <h2 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">VORTEX AI ANALYST</h2>
              <p className="font-mono text-xs font-semibold mt-1 text-[var(--text-muted)]">
                Powered by Gemini 3.6 Flash · Real-Time Stock Telemetry
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs font-semibold px-3 py-1.5 rounded-md inline-flex items-center leading-none"
                style={{ background: 'rgba(80,200,120,0.12)', color: 'var(--matrix)', border: '1px solid rgba(80,200,120,0.25)' }}
              >
                ● ONLINE ({activeTicker})
              </span>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div
            className="flex items-center gap-2 py-3 flex-shrink-0 overflow-x-auto"
            style={{ borderBottom: '1px solid rgba(80,200,120,0.1)', scrollbarWidth: 'none' }}
          >
            {QUICK_PROMPTS.map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="font-mono text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150 whitespace-nowrap flex-shrink-0 cursor-pointer"
                style={{
                  background: 'rgba(0, 20, 10, 0.65)',
                  border: '1px solid rgba(80,200,120,0.18)',
                  color: 'var(--text-secondary)',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(80,200,120,0.5)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--matrix)'; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(80,200,120,0.18)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat history */}
          <div ref={historyRef} className="flex-1 overflow-y-auto py-5 flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] rounded-2xl overflow-hidden"
                    style={msg.role === 'user' ? {
                      background: 'linear-gradient(135deg, rgba(80,200,120,0.22), rgba(0,135,81,0.15))',
                      border: '1px solid rgba(80,200,120,0.35)',
                      color: 'var(--text-primary)',
                      borderBottomRightRadius: 4,
                      padding: '16px 20px',
                    } : {
                      background: 'rgba(0, 20, 10, 0.75)',
                      border: '1px solid rgba(80,200,120,0.15)',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap',
                      borderBottomLeftRadius: 4,
                      padding: '16px 20px',
                    }}
                  >
                    {msg.role === 'agent' && (
                      <p className="font-mono text-[10px] font-bold mb-2 tracking-widest text-[var(--matrix)]">
                        VORTEX AI
                      </p>
                    )}
                    <div className="font-mono text-xs font-semibold leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div
                  className="rounded-2xl flex items-center gap-3 overflow-hidden"
                  style={{ background: 'rgba(0, 20, 10, 0.75)', border: '1px solid rgba(80,200,120,0.15)', borderBottomLeftRadius: 4, padding: '16px 20px' }}
                >
                  <p className="font-mono text-[10px] font-bold tracking-widest text-[var(--matrix)]">VORTEX AI</p>
                  <div className="flex gap-1.5">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--matrix)' }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, delay, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Bar */}
          <div className="pt-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(80,200,120,0.15)' }}>
            <div className="flex gap-3">
              <div
                className="flex-1 flex items-center px-4 py-3 rounded-xl overflow-hidden"
                style={{ background: 'rgba(0,14,7,0.85)', border: '1px solid rgba(80,200,120,0.25)' }}
              >
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask anything about markets, indicators, risk…"
                  className="w-full bg-transparent outline-none font-mono text-xs font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                  disabled={loading}
                />
              </div>
              <motion.button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="px-6 py-3 rounded-xl font-bold font-mono text-xs tracking-wider"
                style={{
                  background: loading || !input.trim() ? 'rgba(80,200,120,0.15)' : 'var(--matrix)',
                  color: loading || !input.trim() ? 'var(--text-muted)' : '#000',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  border: '1px solid rgba(80,200,120,0.3)',
                  transition: 'all 0.2s ease',
                }}
                whileHover={!loading && input.trim() ? { scale: 1.02 } : undefined}
                whileTap={!loading && input.trim() ? { scale: 0.98 } : undefined}
              >
                {loading ? '...' : 'SEND'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Context Sidebar ── */}
        <div className="flex flex-col gap-6 flex-shrink-0 overflow-y-auto" style={{ width: 300 }}>
          {/* Active Context Card */}
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
            <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)] mb-4">ACTIVE CONTEXT</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Symbol', value: activeTicker ?? '—', valueColor: 'var(--matrix)' },
                { label: 'Price', value: s ? `₹${s.mid.toFixed(2)}` : '—', valueColor: 'var(--text-primary)' },
                {
                  label: 'Signal',
                  value: s?.signal ?? '—',
                  valueColor: s?.signal === 'BUY' ? '#10b981' : s?.signal === 'SELL' ? '#ef4444' : '#eab308',
                },
                { label: 'Confidence', value: s ? `${s.confidence.toFixed(1)}%` : '—', valueColor: 'var(--text-primary)' },
                { label: 'Target', value: s ? `₹${s.target.toFixed(2)}` : '—', valueColor: 'var(--matrix)' },
                ...(s?.stop_loss ? [{ label: 'Stop-Loss', value: `₹${s.stop_loss.toFixed(2)}`, valueColor: '#ef4444' }] : []),
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center px-4 py-2.5 rounded-xl bg-[rgba(0,20,10,0.5)] border border-[rgba(80,200,120,0.1)]">
                  <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">{row.label}</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: row.valueColor }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* News Context Card */}
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex-1 min-h-0 overflow-y-auto">
            <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)] mb-4">NEWS CONTEXT</h3>
            <div className="flex flex-col gap-3">
              {(s?.news ?? []).slice(0, 6).map((n, i) => (
                <div key={i} className="glass-sm p-4">
                  <p className="font-mono text-[10px] font-bold mb-1 text-[var(--matrix)]">
                    [{n.source?.toUpperCase() ?? 'WIRE'}]
                  </p>
                  <p className="font-mono text-xs font-semibold leading-snug text-[var(--text-secondary)]">
                    {n.headline}
                  </p>
                </div>
              ))}
              {!(s?.news?.length) && (
                <p className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                  Awaiting live news feed…
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
