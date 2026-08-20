export interface VortexSnapshot {
  type?: string;
  ticker: string;
  mid: number;
  bid: number;
  ask: number;
  change: number;
  change_pct: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  prev_close: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  sentiment: number;
  model_loss: number;
  target: number;
  bids_l2: [number, number][];
  asks_l2: [number, number][];
  candles: Candle[];
  screener: ScreenerItem[];
  news: NewsItem[];
  stock_news?: NewsItem[];
  throughput: number;
  latency_avg: number;
  latency_p50: number;
  latency_p99: number;
  fundamental?: FundamentalData;
  profit_gain?: number;
  risk_level?: string;
  stop_loss?: number;
  basis_breakdown?: string;
  rsi?: number;
  quant_score?: number;
  last_update?: number;
}

export interface Candle {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}

export interface ScreenerItem {
  ticker: string;
  name?: string;
  price: number;
  change: number;
  change_pct: number;
  signal: string;
  confidence: number;
  volume?: number;
  rsi?: number;
}

export interface NewsItem {
  headline: string;
  source: string;
  url?: string;
  ts?: number;
  sentiment?: number;
}

export interface FundamentalData {
  pe?: number;
  eps?: number;
  market_cap?: number;
  dividend_yield?: number;
  beta?: number;
  sector?: string;
  industry?: string;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  avg_volume?: number;
}
