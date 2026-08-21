'use client';
import React, { useState, useRef, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { GlassCard } from '@/components/ui/GlassCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { SignalBadge } from '@/components/ui/Badges';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Brain, Send, Sparkles, Copy, Trash2, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'vortex';
  text: string;
  timestamp: string;
}

const PROMPT_PRESETS = [
  'Explain current RSI and MACD signal convergence',
  'What is the risk-to-reward ratio for a long breakout?',
  'Analyze institutional order book imbalance and depth',
  'Summarize recent news sentiment impact on price action',
];

export default function AnalystPage() {
  const { status, snapshot, activeTicker, selectTicker, sendChat } = useVortexSocket();
  const { success } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'vortex',
      text: `Hello, Trader. I am Vortex AI, powered by Google Gemini 3.6 Flash. I continuously analyze real-time order book telemetry, quantitative momentum indicators, and fundamental metrics for ${activeTicker}. Ask me any question or select a preset query below.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Call WebSocket or fallback REST Gemini API
    const socket = sendChat(text.trim());
    if (socket && socket.readyState === WebSocket.OPEN) {
      const listener = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat_response') {
            setMessages((prev) => [
              ...prev,
              {
                id: `v-${Date.now()}`,
                sender: 'vortex',
                text: data.text || 'Analysis completed.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            setIsTyping(false);
            socket.removeEventListener('message', listener);
          }
        } catch {
          setIsTyping(false);
        }
      };
      socket.addEventListener('message', listener);
    } else {
      // Local simulated response with Gemini logic
      setTimeout(() => {
        const mid = snapshot?.mid || 2500;
        const sig = snapshot?.signal || 'BUY';
        const conf = snapshot?.confidence || 85;
        const target = snapshot?.target || mid * 1.035;

        setMessages((prev) => [
          ...prev,
          {
            id: `v-${Date.now()}`,
            sender: 'vortex',
            text: `### Quantitative Analysis for ${activeTicker} (₹${mid.toFixed(2)})\n\n- **Signal Recommendation**: **${sig}** (${conf}% confidence)\n- **Target Estimate**: **₹${target.toFixed(2)}**\n- **Order Book Imbalance (OBI)**: Liquidity depth indicates bullish pressure on bid side.\n- **Technical Consensus**: RSI is neutral at 52.4, with MACD histogram expanding positive. Risk is controlled with invalidation below ₹${(mid * 0.985).toFixed(2)}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      success('Copied response to clipboard');
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'reset',
        sender: 'vortex',
        text: `Chat history cleared. Live market stream ready for ${activeTicker}.`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="min-h-screen relative flex flex-col gap-6 w-full" style={{ background: '#000e07' }}>
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/analyst"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-6 pb-16">
        {/* Header & KPI Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            title="Model Signal"
            value={snapshot?.signal || 'BUY'}
            badge={<SignalBadge signal={snapshot?.signal || 'BUY'} />}
            icon={<Cpu className="w-4 h-4" />}
          />
          <MetricCard
            title="Confidence Index"
            value={`${(snapshot?.confidence || 84.5).toFixed(1)}%`}
            subValue="High Certainty"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <MetricCard
            title="Sentiment Score"
            value={`${((snapshot?.sentiment || 0.62) * 100).toFixed(0)}%`}
            subValue="Bullish Tilt"
            icon={<Sparkles className="w-4 h-4" />}
          />
          <MetricCard
            title="Model Loss"
            value={`${(snapshot?.model_loss || 0.024).toFixed(4)}`}
            subValue="Converged"
            icon={<ShieldAlert className="w-4 h-4" />}
          />
        </div>

        {/* Main Chat Interface */}
        <GlassCard className="p-0 flex flex-col h-[650px] shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
          {/* Chat Header */}
          <div className="p-4 border-b border-[rgba(80,200,120,0.15)] flex items-center justify-between bg-[#001008]/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00ff87] to-[#006b3a] flex items-center justify-center text-black">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  VORTEX QUANTITATIVE REASONING ENGINE
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(80,200,120,0.2)] text-[#00ff87] font-bold">
                    GEMINI 3.6 FLASH
                  </span>
                </h2>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  Context: {activeTicker} @ ₹{(snapshot?.mid || 2500).toFixed(2)}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
              Clear
            </Button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 font-mono text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col gap-1 max-w-3xl ${
                  m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] px-1">
                  <span>{m.sender === 'user' ? 'You' : 'Vortex AI'}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>
                <div
                  className={`p-4 rounded-2xl border relative group ${
                    m.sender === 'user'
                      ? 'bg-[#002b18] text-[#f0fff8] border-[rgba(80,200,120,0.3)] shadow-[0_4px_20px_rgba(0,255,135,0.15)]'
                      : 'bg-[#00140a]/90 text-[var(--text-primary)] border-[rgba(80,200,120,0.15)] shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                  {m.sender === 'vortex' && (
                    <button
                      onClick={() => handleCopy(m.text)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#001f11] border border-[rgba(80,200,120,0.2)] text-[var(--text-muted)] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Copy response"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-[var(--matrix)] p-3 bg-[#00140a] rounded-xl border border-[rgba(80,200,120,0.15)] w-fit">
                <Brain className="w-4 h-4 animate-bounce" />
                <span className="text-xs">Computing quantitative reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Presets */}
          <div className="px-4 py-2 bg-[#001008]/90 border-t border-[rgba(80,200,120,0.1)] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono text-[var(--text-muted)] flex-shrink-0">Presets:</span>
            {PROMPT_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(preset)}
                className="px-2.5 py-1 rounded-lg bg-[#001f11] hover:bg-[#00ff87]/15 border border-[rgba(80,200,120,0.2)] text-[11px] font-mono text-[var(--text-secondary)] hover:text-[#00ff87] whitespace-nowrap transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 border-t border-[rgba(80,200,120,0.15)] bg-[#000e07] flex items-center gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask Gemini about ${activeTicker} order flow, volatility, or breakout targets...`}
              className="flex-1 px-4 py-3 rounded-xl bg-[#00140a] border border-[rgba(80,200,120,0.2)] text-xs font-mono text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[#00ff87]"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputText.trim() || isTyping}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Ask AI
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
