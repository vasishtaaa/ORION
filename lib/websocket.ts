'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { VortexSnapshot, Candle, ScreenerItem, NewsItem } from './types';

const getWsUrl = () => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_VORTEX_WS_URL) {
    return process.env.NEXT_PUBLIC_VORTEX_WS_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return process.env.NEXT_PUBLIC_VORTEX_WS_URL || 'ws://localhost:8001';
  }
  return 'ws://localhost:8001';
};

const RECONNECT_DELAY = 3000;

export type Timeframe = 'LIVE' | '1D' | '1W' | '1M' | '6M' | '1Y';

// Realistic sample base prices for fallback mode
const BASE_PRICES: Record<string, { price: number; name: string }> = {
  'TCS_NSE': { price: 3942.50, name: 'Tata Consultancy Services' },
  'RELI_NSE': { price: 2985.20, name: 'Reliance Industries' },
  'HDFC_NSE': { price: 1648.75, name: 'HDFC Bank' },
  'INFY_NSE': { price: 1782.30, name: 'Infosys Limited' },
  'ICICIBANK_NSE': { price: 1195.40, name: 'ICICI Bank' },
  'SBIN_NSE': { price: 812.60, name: 'State Bank of India' },
  'TATAMOTORS_NSE': { price: 968.15, name: 'Tata Motors Limited' },
  'MARUTI_NSE': { price: 12450.00, name: 'Maruti Suzuki India' },
  'ADANIENT_NSE': { price: 3120.00, name: 'Adani Enterprises' },
  'LT_NSE': { price: 3580.00, name: 'Larsen & Toubro' },
  'NTPC_NSE': { price: 412.50, name: 'NTPC Limited' },
  'POWERGRID_NSE': { price: 328.90, name: 'Power Grid Corporation' },
};

function generateFallbackSnapshot(ticker: string): VortexSnapshot {
  const base = BASE_PRICES[ticker] || { price: 2500.0, name: ticker };
  const price = base.price;
  const prev_close = price * 0.992;
  const change = price - prev_close;
  const change_pct = (change / prev_close) * 100;

  // Generate 40 initial candles
  const candles: Candle[] = [];
  let curr = price * 0.985;
  const now = Date.now();
  for (let i = 40; i >= 0; i--) {
    const t = new Date(now - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const drift = (Math.random() - 0.48) * (price * 0.004);
    const o = curr;
    const c = curr + drift;
    const h = Math.max(o, c) + Math.random() * (price * 0.002);
    const l = Math.min(o, c) - Math.random() * (price * 0.002);
    const v = Math.floor(Math.random() * 50000 + 10000);
    candles.push({ t, o, h, l, c, v });
    curr = c;
  }

  const bids_l2: [number, number][] = [
    [Number((price - 0.25).toFixed(2)), 1420],
    [Number((price - 0.50).toFixed(2)), 2890],
    [Number((price - 0.75).toFixed(2)), 4500],
    [Number((price - 1.00).toFixed(2)), 6100],
    [Number((price - 1.25).toFixed(2)), 8200],
  ];

  const asks_l2: [number, number][] = [
    [Number((price + 0.25).toFixed(2)), 1150],
    [Number((price + 0.50).toFixed(2)), 2400],
    [Number((price + 0.75).toFixed(2)), 3900],
    [Number((price + 1.00).toFixed(2)), 5800],
    [Number((price + 1.25).toFixed(2)), 7400],
  ];

  const screener: ScreenerItem[] = Object.entries(BASE_PRICES).map(([t, info]) => {
    const p = info.price;
    const prev = p * (1 - (Math.random() * 0.03 - 0.015));
    const chg = p - prev;
    const rsi = Math.floor(Math.random() * 40 + 35);
    const qs = Number(((Math.random() - 0.45) * 0.8).toFixed(3));
    const sig = qs > 0.2 ? 'BUY' : qs < -0.2 ? 'SELL' : 'HOLD';
    return {
      ticker: t,
      name: info.name,
      price: p,
      prev_close: Number(prev.toFixed(2)),
      change_pct: Number(((chg / prev) * 100).toFixed(2)),
      rsi,
      quant_score: qs,
      recommendation: sig,
      signal: sig,
      volume: Math.floor(Math.random() * 800000 + 200000),
      confidence: Math.floor(Math.random() * 25 + 72),
      target: Number((p * (1 + qs * 0.05)).toFixed(2)),
    };
  });

  const news: NewsItem[] = [
    { headline: 'RBI maintains benchmark policy repo rate, keeps liquidity framework adaptive', source: 'Reuters', ts: '10m ago', sentiment: 0.4 },
    { headline: 'Indian IT sector expects accelerating client cloud transformation deals in Q3', source: 'Bloomberg', ts: '25m ago', sentiment: 0.6 },
    { headline: 'Foreign Institutional Investors record net equity inflows across private lenders', source: 'Economic Times', ts: '45m ago', sentiment: 0.5 },
  ];

  return {
    ticker,
    mid: price,
    bid: price - 0.25,
    ask: price + 0.25,
    change: Number(change.toFixed(2)),
    change_pct: Number(change_pct.toFixed(2)),
    volume: 1450000,
    open: price * 0.996,
    high: price * 1.008,
    low: price * 0.991,
    prev_close,
    signal: 'BUY',
    confidence: 84.5,
    sentiment: 0.62,
    model_loss: 0.024,
    target: Number((price * 1.035).toFixed(2)),
    bids_l2,
    asks_l2,
    candles,
    screener,
    news,
    stock_news: news,
    throughput: 1840,
    latency_avg: 820,
    latency_p50: 640,
    latency_p99: 1450,
    fundamental: {
      pe: 28.4,
      eps: 138.8,
      market_cap: 1420000000000,
      dividend_yield: 1.85,
      beta: 0.82,
      debt_to_equity: 0.08,
      roe: 0.48,
      revenue_growth: 0.082,
    },
  };
}

export function useVortexSocket() {
  const [activeTicker, setActiveTickerState] = useState<string>('TCS_NSE');
  const [snapshot, setSnapshot] = useState<VortexSnapshot>(() => generateFallbackSnapshot('TCS_NSE'));
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [timeframe, setTimeframeState] = useState<Timeframe>('LIVE');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const simInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync activeTicker from localStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vortex_active_ticker');
      if (saved) {
        setActiveTickerState(saved);
        setSnapshot(generateFallbackSnapshot(saved));
      }
    }
  }, []);

  const activeTickerRef = useRef(activeTicker);
  activeTickerRef.current = activeTicker;
  const timeframeRef = useRef<Timeframe>(timeframe);
  timeframeRef.current = timeframe;

  const parseRawBackendSnapshot = useCallback((raw: any, currentActiveTicker: string): VortexSnapshot => {
    const activeKey = currentActiveTicker || raw.active_ticker || 'TCS_NSE';
    const books = raw.books || {};
    const book = books[activeKey] || {};

    const price = book.price || 0.0;
    const prevClose = book.prev_close || price || 0.0;
    const change = price - prevClose;
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0.0;

    const rawCandles = book.candles || [];
    const candles: Candle[] = rawCandles.map((c: any) => {
      if (typeof c === 'object' && c !== null && 'c' in c) return c as Candle;
      if (Array.isArray(c)) {
        return {
          t: String(c[0] || ''),
          o: Number(c[1] || 0),
          h: Number(c[2] || 0),
          l: Number(c[3] || 0),
          c: Number(c[4] || 0),
          v: Number(c[5] || 0),
        };
      }
      return { t: '', o: price, h: price, l: price, c: price };
    });

    const aiAgent = raw.ai_agent || {};
    const latency = raw.latency || {};
    const fundamentals = book.fundamentals || {};

    return {
      ticker: activeKey,
      mid: price,
      bid: book.bid || price,
      ask: book.ask || price,
      change: change,
      change_pct: changePct,
      volume: book.volume || 0,
      open: book.open || price,
      high: book.high || price,
      low: book.low || price,
      prev_close: prevClose,
      signal: (aiAgent.recommendation || 'HOLD') as 'BUY' | 'SELL' | 'HOLD',
      confidence: aiAgent.confidence || 70.0,
      sentiment: aiAgent.sentiment || 0.0,
      model_loss: aiAgent.training_loss || 0.05,
      target: aiAgent.target_price || price,
      bids_l2: book.bids_l2 || [],
      asks_l2: book.asks_l2 || [],
      candles: candles.length > 0 ? candles : snapshot?.candles || [],
      screener: raw.screener || [],
      news: raw.news || [],
      stock_news: raw.stock_news || [],
      throughput: raw.pps || 0,
      latency_avg: latency.avg || 0,
      latency_p50: latency.p50 || 0,
      latency_p99: latency.p99 || 0,
      fundamental: {
        pe: fundamentals.trailingPE,
        eps: fundamentals.eps,
        market_cap: fundamentals.marketCap,
        dividend_yield: fundamentals.dividendYield,
        beta: fundamentals.beta,
        debt_to_equity: fundamentals.debtToEquity,
        roe: fundamentals.returnOnEquity,
        revenue_growth: fundamentals.revenueGrowth,
      },
    };
  }, [snapshot?.candles]);

  const subscribe = useCallback((ticker?: string, tf?: Timeframe) => {
    const targetTicker = ticker || activeTickerRef.current;
    const targetTf = tf || timeframeRef.current || 'LIVE';

    setActiveTickerState(targetTicker);
    activeTickerRef.current = targetTicker;
    setTimeframeState(targetTf);
    timeframeRef.current = targetTf;

    if (typeof window !== 'undefined') {
      localStorage.setItem('vortex_active_ticker', targetTicker);
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'subscribe', ticker: targetTicker, timeframe: targetTf }));
      socketRef.current.send(JSON.stringify({ cmd: 'select_ticker', ticker: targetTicker, timeframe: targetTf }));
    } else {
      setSnapshot(generateFallbackSnapshot(targetTicker));
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        const ticker = localStorage.getItem('vortex_active_ticker') || 'TCS_NSE';
        const tf = timeframeRef.current || 'LIVE';
        ws.send(JSON.stringify({ action: 'subscribe', ticker, timeframe: tf }));
        ws.send(JSON.stringify({ cmd: 'select_ticker', ticker, timeframe: tf }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'chat_response') {
            const normalized = parseRawBackendSnapshot(data, activeTickerRef.current);
            setSnapshot(normalized);
          }
        } catch (e) {
          console.error('[WebSocket] Parsing error:', e);
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        socketRef.current = null;
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => {
        setStatus('disconnected');
        ws.close();
      };
    } catch {
      setStatus('disconnected');
    }
  }, [parseRawBackendSnapshot]);

  // Start live tick drift simulation if disconnected so charts stay alive
  useEffect(() => {
    if (status !== 'connected') {
      simInterval.current = setInterval(() => {
        setSnapshot(prev => {
          if (!prev) return generateFallbackSnapshot(activeTickerRef.current);
          const drift = (Math.random() - 0.49) * (prev.mid * 0.0015);
          const newMid = Number((prev.mid + drift).toFixed(2));
          const newCandles = [...prev.candles];
          if (newCandles.length > 0) {
            const last = { ...newCandles[newCandles.length - 1] };
            last.c = newMid;
            last.h = Math.max(last.h, newMid);
            last.l = Math.min(last.l, newMid);
            last.v = (last.v || 1000) + Math.floor(Math.random() * 500);
            newCandles[newCandles.length - 1] = last;
          }
          return {
            ...prev,
            mid: newMid,
            bid: Number((newMid - 0.25).toFixed(2)),
            ask: Number((newMid + 0.25).toFixed(2)),
            change: Number((newMid - prev.prev_close).toFixed(2)),
            change_pct: Number((((newMid - prev.prev_close) / prev.prev_close) * 100).toFixed(2)),
            candles: newCandles,
          };
        });
      }, 1500);
    } else {
      if (simInterval.current) clearInterval(simInterval.current);
    }
    return () => {
      if (simInterval.current) clearInterval(simInterval.current);
    };
  }, [status]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
    };
  }, [connect]);

  const selectTicker = useCallback((ticker: string) => {
    subscribe(ticker, timeframeRef.current);
  }, [subscribe]);

  const sendChat = useCallback((message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ cmd: 'chat', text: message, activeTicker: activeTickerRef.current }));
    }
    return socketRef.current;
  }, []);

  return { snapshot, status, activeTicker, selectTicker, subscribe, timeframe, sendChat, socket: socketRef.current };
}
