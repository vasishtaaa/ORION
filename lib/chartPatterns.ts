import { Candle } from '@/lib/types';

export interface DetectedPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0 to 100
  startIndex: number;
  endIndex: number;
  description: string;
  targetPrice?: number;
}

export function detectChartPatterns(candles: Candle[]): DetectedPattern[] {
  if (!candles || candles.length < 5) return [];

  const patterns: DetectedPattern[] = [];
  const n = candles.length;
  const recent = candles.slice(-30);
  const offset = n - recent.length;

  // 1. Check for Bullish / Bearish Engulfing on the last 2 candles
  if (candles.length >= 2) {
    const prev = candles[n - 2];
    const curr = candles[n - 1];

    const prevBody = Math.abs(prev.c - prev.o);
    const currBody = Math.abs(curr.c - curr.o);

    // Bullish Engulfing: prev is red, curr is green, curr completely engulfs prev body
    if (prev.c < prev.o && curr.c > curr.o && curr.o <= prev.c && curr.c >= prev.o && currBody > prevBody) {
      patterns.push({
        name: 'Bullish Engulfing',
        type: 'bullish',
        confidence: 88,
        startIndex: n - 2,
        endIndex: n - 1,
        description: 'Strong bullish reversal signal; buying pressure overpowered previous selling.',
        targetPrice: curr.c + (curr.c - curr.l) * 1.5,
      });
    }

    // Bearish Engulfing: prev is green, curr is red, curr completely engulfs prev body
    if (prev.c > prev.o && curr.c < curr.o && curr.o >= prev.c && curr.c <= prev.o && currBody > prevBody) {
      patterns.push({
        name: 'Bearish Engulfing',
        type: 'bearish',
        confidence: 85,
        startIndex: n - 2,
        endIndex: n - 1,
        description: 'Bearish reversal signal; aggressive sellers overwhelmed prior advance.',
        targetPrice: curr.c - (curr.h - curr.c) * 1.5,
      });
    }
  }

  // 2. Check for Hammer / Shooting Star on the latest candle
  const latest = candles[n - 1];
  const body = Math.abs(latest.c - latest.o);
  const totalRange = latest.h - latest.l;
  if (totalRange > 0) {
    const lowerWick = Math.min(latest.o, latest.c) - latest.l;
    const upperWick = latest.h - Math.max(latest.o, latest.c);

    // Hammer: long lower shadow (>= 2x body), tiny upper shadow
    if (lowerWick >= 2 * body && upperWick <= body * 0.5 && body / totalRange < 0.35) {
      patterns.push({
        name: 'Bullish Hammer',
        type: 'bullish',
        confidence: 82,
        startIndex: n - 1,
        endIndex: n - 1,
        description: 'Price rejected lower levels sharply; buyers pushed price back up.',
        targetPrice: latest.c + lowerWick,
      });
    }

    // Shooting Star: long upper shadow (>= 2x body), tiny lower shadow
    if (upperWick >= 2 * body && lowerWick <= body * 0.5 && body / totalRange < 0.35) {
      patterns.push({
        name: 'Shooting Star',
        type: 'bearish',
        confidence: 80,
        startIndex: n - 1,
        endIndex: n - 1,
        description: 'Overhead supply rejected high prices; sellers stepped in forcefully.',
        targetPrice: latest.c - upperWick,
      });
    }
  }

  // 3. Check for Swing Lows & Highs for Double Bottom / Top in recent candles
  if (recent.length >= 15) {
    // Identify swing lows
    const swingLows: { index: number; price: number }[] = [];
    const swingHighs: { index: number; price: number }[] = [];

    for (let i = 2; i < recent.length - 2; i++) {
      const c = recent[i];
      if (
        c.l < recent[i - 1].l &&
        c.l < recent[i - 2].l &&
        c.l < recent[i + 1].l &&
        c.l < recent[i + 2].l
      ) {
        swingLows.push({ index: offset + i, price: c.l });
      }
      if (
        c.h > recent[i - 1].h &&
        c.h > recent[i - 2].h &&
        c.h > recent[i + 1].h &&
        c.h > recent[i + 2].h
      ) {
        swingHighs.push({ index: offset + i, price: c.h });
      }
    }

    // Double bottom: 2 swing lows with <= 0.8% difference
    if (swingLows.length >= 2) {
      const l1 = swingLows[swingLows.length - 2];
      const l2 = swingLows[swingLows.length - 1];
      const diffPct = Math.abs(l1.price - l2.price) / l1.price;
      if (diffPct <= 0.008 && l2.index - l1.index >= 4) {
        patterns.push({
          name: 'Double Bottom (W-Base)',
          type: 'bullish',
          confidence: 90,
          startIndex: l1.index,
          endIndex: l2.index,
          description: 'Accumulation base forming with tested support floor.',
          targetPrice: l2.price * 1.04,
        });
      }
    }

    // Double top: 2 swing highs with <= 0.8% difference
    if (swingHighs.length >= 2) {
      const h1 = swingHighs[swingHighs.length - 2];
      const h2 = swingHighs[swingHighs.length - 1];
      const diffPct = Math.abs(h1.price - h2.price) / h1.price;
      if (diffPct <= 0.008 && h2.index - h1.index >= 4) {
        patterns.push({
          name: 'Double Top (M-Ceiling)',
          type: 'bearish',
          confidence: 87,
          startIndex: h1.index,
          endIndex: h2.index,
          description: 'Overhead resistance retested and rejected twice.',
          targetPrice: h2.price * 0.96,
        });
      }
    }
  }

  // 4. Fallback Breakout Check
  if (patterns.length === 0 && recent.length >= 10) {
    const priorHighs = recent.slice(0, -1).map((c) => c.h);
    const maxPrior = Math.max(...priorHighs);
    if (latest.c > maxPrior) {
      patterns.push({
        name: 'Resistance Breakout',
        type: 'bullish',
        confidence: 84,
        startIndex: n - 10,
        endIndex: n - 1,
        description: 'Price penetrated multi-period ceiling with expansion momentum.',
        targetPrice: latest.c * 1.025,
      });
    }
  }

  return patterns;
}
