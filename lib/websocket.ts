'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { VortexSnapshot, Candle } from './types';

const WS_URL = 'ws://localhost:8001';
const RECONNECT_DELAY = 2000;

export type Timeframe = 'LIVE' | '1D' | '1W' | '1M' | '6M' | '1Y';

export function useVortexSocket() {
  const [snapshot, setSnapshot] = useState<VortexSnapshot | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [activeTicker, setActiveTickerState] = useState<string>('TCS_NSE');
  const [timeframe, setTimeframeState] = useState<Timeframe>('LIVE');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync activeTicker from localStorage after mount to prevent SSR hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vortex_active_ticker');
      if (saved) {
        setActiveTickerState(saved);
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

    // Transform candle format if necessary
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
      candles: candles,
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
      },
    };
  }, []);

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
      const payload = { action: 'subscribe', ticker: targetTicker, timeframe: targetTf };
      socketRef.current.send(JSON.stringify(payload));
      socketRef.current.send(JSON.stringify({ cmd: 'select_ticker', ticker: targetTicker, timeframe: targetTf }));
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const ws = new WebSocket(WS_URL);
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
    } catch {}
  }, [parseRawBackendSnapshot]);

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
      socketRef.current.send(JSON.stringify({ cmd: 'chat', text: message }));
    }
    return socketRef.current;
  }, []);

  return { snapshot, status, activeTicker, selectTicker, subscribe, timeframe, sendChat, socket: socketRef.current };
}
