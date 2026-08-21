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
  name: string;
  price: number;
  prev_close: number;
  change_pct: number;
  rsi: number;
  quant_score: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  signal?: 'BUY' | 'SELL' | 'HOLD';
  volume: number;
  target?: number;
  confidence?: number;
}

export interface NewsItem {
  headline: string;
  source: string;
  ts: string;
  ticker?: string;
  sentiment?: number;
}

export interface Fundamentals {
  pe?: number | null;
  eps?: number | null;
  market_cap?: number | null;
  dividend_yield?: number | null;
  beta?: number | null;
  debt_to_equity?: number | null;
  roe?: number | null;
  revenue_growth?: number | null;
}

export interface VortexSnapshot {
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
  stock_news: NewsItem[];
  throughput: number;
  latency_avg: number;
  latency_p50: number;
  latency_p99: number;
  fundamental?: Fundamentals;
}

export interface PresetBasket {
  id: string;
  name: string;
  description: string;
  icon: string;
  tickers: string[];
}

export interface QuantParameters {
  rsiPeriod: number;
  rsiOversold: number;
  rsiOverbought: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  volatilityBandMultiplier: number;
  riskMultiplier: number;
  targetProfitPct: number;
}

export interface TradeCalculation {
  accountSize: number;
  riskPercentage: number;
  entryPrice: number;
  stopLossPrice: number;
  targetPrice: number;
  positionSize: number;
  shares: number;
  totalCost: number;
  potentialLoss: number;
  potentialProfit: number;
  riskRewardRatio: number;
}
