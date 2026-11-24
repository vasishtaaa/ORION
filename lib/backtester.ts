import { Candle } from '@/lib/types';

export type StrategyType = 'rsi_reversal' | 'ema_crossover' | 'vwap_breakout' | 'bollinger_bounce';

export interface BacktestTrade {
  id: string;
  entryTime: string;
  exitTime: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  shares: number;
  pnl: number;
  pnlPct: number;
  exitReason: 'TARGET' | 'STOP_LOSS' | 'SIGNAL_FLIP';
}

export interface BacktestResult {
  strategyName: string;
  strategyType: StrategyType;
  initialCapital: number;
  finalCapital: number;
  netProfit: number;
  totalReturnPct: number;
  winRate: number;
  profitFactor: number;
  maxDrawdownPct: number;
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  trades: BacktestTrade[];
  equityCurve: { time: string; equity: number }[];
}

// Compute simple EMA
function computeEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prevEma: number | null = null;

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ema.push(prices[i]);
    } else if (i === period - 1) {
      const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
      prevEma = sum / period;
      ema.push(prevEma);
    } else if (prevEma !== null) {
      prevEma = prices[i] * k + prevEma * (1 - k);
      ema.push(prevEma);
    }
  }
  return ema;
}

// Compute RSI
function computeRSI(prices: number[], period = 14): number[] {
  const rsi: number[] = new Array(prices.length).fill(50);
  if (prices.length <= period) return rsi;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - 100 / (1 + rs);
    }
  }

  return rsi;
}

export function runBacktest(
  candles: Candle[],
  strategy: StrategyType = 'rsi_reversal',
  initialCapital = 500000,
  riskPerTrade = 0.02
): BacktestResult {
  if (!candles || candles.length < 25) {
    return {
      strategyName: 'Insufficient Data',
      strategyType: strategy,
      initialCapital,
      finalCapital: initialCapital,
      netProfit: 0,
      totalReturnPct: 0,
      winRate: 0,
      profitFactor: 1,
      maxDrawdownPct: 0,
      totalTrades: 0,
      winTrades: 0,
      lossTrades: 0,
      trades: [],
      equityCurve: [{ time: 'Start', equity: initialCapital }],
    };
  }

  const closes = candles.map((c) => c.c);
  const ema20 = computeEMA(closes, 20);
  const ema50 = computeEMA(closes, 50);
  const rsi = computeRSI(closes, 14);

  // Cumulative VWAP
  const vwap: number[] = [];
  let cumPV = 0;
  let cumV = 0;
  candles.forEach((c) => {
    const vol = c.v || 1000;
    cumPV += ((c.h + c.l + c.c) / 3) * vol;
    cumV += vol;
    vwap.push(cumPV / cumV);
  });

  let capital = initialCapital;
  let peakCapital = initialCapital;
  let maxDrawdown = 0;

  const trades: BacktestTrade[] = [];
  const equityCurve: { time: string; equity: number }[] = [{ time: candles[0].t, equity: capital }];

  let openPosition: {
    entryPrice: number;
    entryTime: string;
    shares: number;
    stopLoss: number;
    target: number;
  } | null = null;

  for (let i = 25; i < candles.length; i++) {
    const c = candles[i];
    const prevC = candles[i - 1];

    // Check exit conditions if in trade
    if (openPosition) {
      let exitReason: 'TARGET' | 'STOP_LOSS' | 'SIGNAL_FLIP' | null = null;
      let exitPrice = c.c;

      if (c.l <= openPosition.stopLoss) {
        exitReason = 'STOP_LOSS';
        exitPrice = openPosition.stopLoss;
      } else if (c.h >= openPosition.target) {
        exitReason = 'TARGET';
        exitPrice = openPosition.target;
      } else {
        // Signal flip exit
        if (strategy === 'rsi_reversal' && rsi[i] > 72) {
          exitReason = 'SIGNAL_FLIP';
        } else if (strategy === 'ema_crossover' && ema20[i] < ema50[i]) {
          exitReason = 'SIGNAL_FLIP';
        } else if (strategy === 'vwap_breakout' && c.c < vwap[i]) {
          exitReason = 'SIGNAL_FLIP';
        }
      }

      if (exitReason) {
        const pnl = (exitPrice - openPosition.entryPrice) * openPosition.shares;
        const pnlPct = ((exitPrice - openPosition.entryPrice) / openPosition.entryPrice) * 100;
        capital += openPosition.shares * exitPrice;

        trades.push({
          id: `bt-${trades.length + 1}`,
          entryTime: openPosition.entryTime,
          exitTime: c.t,
          side: 'BUY',
          entryPrice: openPosition.entryPrice,
          exitPrice,
          shares: openPosition.shares,
          pnl,
          pnlPct,
          exitReason,
        });

        openPosition = null;
      }
    }

    // Check entry conditions if flat
    if (!openPosition && i < candles.length - 1) {
      let shouldEnter = false;

      if (strategy === 'rsi_reversal') {
        // RSI was below 35 and crosses up
        if (rsi[i - 1] < 35 && rsi[i] >= 35) {
          shouldEnter = true;
        }
      } else if (strategy === 'ema_crossover') {
        // EMA 20 crosses above EMA 50
        if (ema20[i - 1] <= ema50[i - 1] && ema20[i] > ema50[i]) {
          shouldEnter = true;
        }
      } else if (strategy === 'vwap_breakout') {
        // Price crosses above VWAP with above-average candle body
        if (prevC.c <= vwap[i - 1] && c.c > vwap[i] && c.c > c.o) {
          shouldEnter = true;
        }
      } else if (strategy === 'bollinger_bounce') {
        // Price bounced off recent low
        if (c.l < prevC.l && c.c > c.o) {
          shouldEnter = true;
        }
      }

      if (shouldEnter) {
        const riskAmount = capital * riskPerTrade;
        const stopDistance = c.c * 0.018; // 1.8% stop loss
        const shares = Math.max(1, Math.floor(riskAmount / stopDistance));
        const totalCost = shares * c.c;

        if (totalCost <= capital) {
          capital -= totalCost;
          openPosition = {
            entryPrice: c.c,
            entryTime: c.t,
            shares,
            stopLoss: c.c * 0.982,
            target: c.c * 1.045, // 4.5% target (2.5:1 RR)
          };
        }
      }
    }

    // Mark to market equity
    const currentEquity = capital + (openPosition ? openPosition.shares * c.c : 0);
    peakCapital = Math.max(peakCapital, currentEquity);
    const dd = ((peakCapital - currentEquity) / peakCapital) * 100;
    maxDrawdown = Math.max(maxDrawdown, dd);

    equityCurve.push({ time: c.t, equity: currentEquity });
  }

  // Close lingering position at end
  if (openPosition) {
    const lastC = candles[candles.length - 1];
    const pnl = (lastC.c - openPosition.entryPrice) * openPosition.shares;
    capital += openPosition.shares * lastC.c;
    trades.push({
      id: `bt-${trades.length + 1}`,
      entryTime: openPosition.entryTime,
      exitTime: lastC.t,
      side: 'BUY',
      entryPrice: openPosition.entryPrice,
      exitPrice: lastC.c,
      shares: openPosition.shares,
      pnl,
      pnlPct: ((lastC.c - openPosition.entryPrice) / openPosition.entryPrice) * 100,
      exitReason: 'SIGNAL_FLIP',
    });
  }

  const netProfit = capital - initialCapital;
  const totalReturnPct = (netProfit / initialCapital) * 100;
  const winTrades = trades.filter((t) => t.pnl > 0).length;
  const lossTrades = trades.filter((t) => t.pnl <= 0).length;
  const winRate = trades.length > 0 ? (winTrades / trades.length) * 100 : 0;

  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 9.99 : 1.0;

  const strategyNames: Record<StrategyType, string> = {
    rsi_reversal: 'RSI Mean Reversion (14/35/70)',
    ema_crossover: 'Golden Cross (EMA 20/50)',
    vwap_breakout: 'VWAP Intraday Momentum',
    bollinger_bounce: 'Bollinger Band Squeeze Reversal',
  };

  return {
    strategyName: strategyNames[strategy],
    strategyType: strategy,
    initialCapital,
    finalCapital: capital,
    netProfit,
    totalReturnPct,
    winRate,
    profitFactor: Math.min(99.9, Math.round(profitFactor * 100) / 100),
    maxDrawdownPct: Math.round(maxDrawdown * 100) / 100,
    totalTrades: trades.length,
    winTrades,
    lossTrades,
    trades: trades.reverse(),
    equityCurve,
  };
}
