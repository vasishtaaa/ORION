'use client';
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Candle } from '@/lib/types';
import StockGraphTransitionOverlay from '@/components/charts/StockGraphTransitionOverlay';
import { detectChartPatterns, DetectedPattern } from '@/lib/chartPatterns';
import { PaperPosition } from '@/lib/usePaperTrading';

export type Timeframe = 'LIVE' | '1D' | '1W' | '1M' | '6M' | '1Y';
export type DrawingMode = 'none' | 'trendline' | 'horizontal' | 'fibonacci';

export interface ChartDrawing {
  id: string;
  type: 'trendline' | 'horizontal' | 'fibonacci';
  price1: number;
  idx1: number;
  price2?: number;
  idx2?: number;
  color?: string;
}

interface CandlestickChartProps {
  candles: Candle[];
  activeTicker: string;
  onTimeframeChange?: (tf: Timeframe) => void;
  currentTimeframe?: Timeframe;
  prevClose?: number;
  isTransitioning?: boolean;
  pendingTicker?: string | null;
  positions?: PaperPosition[];
}

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: 'LIVE', value: 'LIVE' },
  { label: '1D',   value: '1D'   },
  { label: '1W',   value: '1W'   },
  { label: '1M',   value: '1M'   },
  { label: '6M',   value: '6M'   },
  { label: '1Y',   value: '1Y'   },
];

function fmtVol(v: number | undefined): string {
  if (!v) return '—';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

// Calculate EMA series
function calculateEMA(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let ema: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
      ema = sum / period;
      result.push(ema);
    } else if (ema !== null) {
      ema = data[i] * k + ema * (1 - k);
      result.push(ema);
    }
  }
  return result;
}

// Calculate Bollinger Bands
function calculateBollingerBands(candles: Candle[], period = 20, multiplier = 2) {
  const result: { upper: number; middle: number; lower: number }[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push({ upper: 0, middle: 0, lower: 0 });
      continue;
    }
    const slice = candles.slice(i - period + 1, i + 1);
    const mean = slice.reduce((acc, c) => acc + c.c, 0) / period;
    const variance = slice.reduce((acc, c) => acc + Math.pow(c.c - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    result.push({
      upper: mean + multiplier * stdDev,
      middle: mean,
      lower: mean - multiplier * stdDev,
    });
  }
  return result;
}

export default function CandlestickChart({
  candles,
  activeTicker,
  onTimeframeChange,
  currentTimeframe = 'LIVE',
  prevClose,
  isTransitioning = false,
  pendingTicker = null,
  positions = [],
}: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 700, height: 340 });
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Technical Overlay Toggles
  const [showVolume, setShowVolume] = useState(true);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(false);

  // Drawing Tools State
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [drawings, setDrawings] = useState<ChartDrawing[]>([]);
  const [activeDrawing, setActiveDrawing] = useState<Partial<ChartDrawing> | null>(null);

  // AI Pattern Recognition
  const detectedPatterns: DetectedPattern[] = useMemo(() => {
    return detectChartPatterns(candles);
  }, [candles]);

  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null);

  // Auto-select latest detected pattern
  useEffect(() => {
    if (detectedPatterns.length > 0) {
      setSelectedPattern(detectedPatterns[0]);
    } else {
      setSelectedPattern(null);
    }
  }, [detectedPatterns]);

  // Local transition state
  const [localTransitioning, setLocalTransitioning] = useState(false);
  const prevTickerRef = useRef(activeTicker);

  useEffect(() => {
    if (prevTickerRef.current !== activeTicker) {
      prevTickerRef.current = activeTicker;
      setLocalTransitioning(true);
      const timer = setTimeout(() => {
        setLocalTransitioning(false);
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [activeTicker]);

  const isSwitching = isTransitioning || localTransitioning;
  const target = pendingTicker || activeTicker;

  // Responsive resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width > 50 && rect.height > 50) {
      setDimensions({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        const h = Math.floor(entry.contentRect.height);
        if (w > 50 && h > 50) {
          setDimensions((prev) =>
            Math.abs(prev.width - w) > 2 || Math.abs(prev.height - h) > 2 ? { width: w, height: h } : prev
          );
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Timeframe slice
  const displayCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    switch (currentTimeframe) {
      case 'LIVE': return candles.slice(-50);
      case '1D':   return candles.slice(-78);
      case '1W':   return candles.slice(-100);
      case '1M':   return candles.slice(-150);
      case '6M':   return candles.slice(-250);
      case '1Y':   return candles;
      default:     return candles;
    }
  }, [candles, currentTimeframe]);

  // Canvas drawing render loop
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (displayCandles.length === 0) {
      ctx.fillStyle = 'rgba(80, 200, 120, 0.4)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting live tick telemetry…', width / 2, height / 2);
      return;
    }

    const VOL_ZONE = showVolume ? 0.20 : 0;
    const padding = { top: 20, right: 72, bottom: 32, left: 14 };
    const chartW = Math.max(10, width - padding.left - padding.right);
    const chartH = Math.max(10, height - padding.top - padding.bottom);
    const priceH = chartH * (1 - VOL_ZONE);

    // Range calculation
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    displayCandles.forEach((c) => {
      minPrice = Math.min(minPrice, c.l);
      maxPrice = Math.max(maxPrice, c.h);
      if (c.v) maxVol = Math.max(maxVol, c.v);
    });

    const priceSpan = maxPrice - minPrice || 1;
    minPrice -= priceSpan * 0.05;
    maxPrice += priceSpan * 0.05;
    const fullRange = maxPrice - minPrice;

    const getY = (price: number) => padding.top + priceH * (1 - (price - minPrice) / fullRange);
    const getPriceFromY = (y: number) => maxPrice - ((y - padding.top) / priceH) * fullRange;

    const n = displayCandles.length;
    const stepX = chartW / n;
    const candleW = Math.max(2, stepX * 0.65);
    const getX = (idx: number) => padding.left + idx * stepX + stepX / 2;

    // ─── Grid Lines ──────────────────────────────────────────────────────────
    const numGrid = 5;
    for (let i = 0; i <= numGrid; i++) {
      const y = padding.top + (priceH / numGrid) * i;
      const price = maxPrice - (fullRange / numGrid) * i;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148,163,184,0.55)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), width - padding.right + 6, y + 3);
    }

    // ─── Bollinger Bands ─────────────────────────────────────────────────────
    if (showBB && n >= 20) {
      const bb = calculateBollingerBands(displayCandles, 20, 2);
      ctx.beginPath();
      // Upper band
      for (let i = 19; i < n; i++) {
        const x = getX(i);
        const y = getY(bb[i].upper);
        if (i === 19) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // Lower band back
      for (let i = n - 1; i >= 19; i--) {
        const x = getX(i);
        const y = getY(bb[i].lower);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.fill();

      // Draw upper & lower lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ─── Volume Histogram ────────────────────────────────────────────────────
    if (showVolume && maxVol > 0) {
      const volH = chartH * VOL_ZONE;
      const volY0 = padding.top + priceH;
      displayCandles.forEach((c, idx) => {
        const x = getX(idx);
        const barH = ((c.v || 0) / maxVol) * (volH * 0.9);
        const isUp = c.c >= c.o;
        ctx.fillStyle = isUp ? 'rgba(16,185,129,0.22)' : 'rgba(251,113,133,0.22)';
        ctx.fillRect(x - candleW / 2, volY0 + (volH * 0.9) - barH, candleW, barH);
      });

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, padding.top + priceH);
      ctx.lineTo(width - padding.right, padding.top + priceH);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148,163,184,0.5)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('VOL', padding.left + 2, padding.top + priceH + 10);
    }

    // ─── Previous Close Line ──────────────────────────────────────────────────
    const pc = prevClose ?? (displayCandles[0]?.o ?? 0);
    if (pc > 0 && pc >= minPrice && pc <= maxPrice) {
      const pcY = getY(pc);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148,163,184,0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.moveTo(padding.left, pcY);
      ctx.lineTo(width - padding.right, pcY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(148,163,184,0.7)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Prev. close ₹${pc.toFixed(2)}`, width - padding.right - 2, pcY - 3);
    }

    // ─── VWAP Line ────────────────────────────────────────────────────────────
    if (showVWAP) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6,182,212,0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      let cumPV = 0;
      let cumV = 0;
      displayCandles.forEach((c, idx) => {
        const x = getX(idx);
        const vol = c.v || 1000;
        const typ = (c.h + c.l + c.c) / 3;
        cumPV += typ * vol;
        cumV += vol;
        const y = getY(cumPV / cumV);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ─── EMA 20 & EMA 50 ──────────────────────────────────────────────────────
    if (showEMA && n >= 10) {
      const closes = displayCandles.map((c) => c.c);
      const ema20 = calculateEMA(closes, 20);
      const ema50 = calculateEMA(closes, 50);

      // Draw EMA 20 (Cyan)
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      let started = false;
      ema20.forEach((val, idx) => {
        if (val !== null) {
          const x = getX(idx);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw EMA 50 (Orange)
      ctx.beginPath();
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 1.2;
      started = false;
      ema50.forEach((val, idx) => {
        if (val !== null) {
          const x = getX(idx);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // ─── SMA Overlay ──────────────────────────────────────────────────────────
    if (showSMA && n >= 5) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(250,204,21,0.85)';
      ctx.lineWidth = 1.5;
      const period = Math.min(10, Math.floor(n / 2));
      let started = false;
      for (let i = period - 1; i < n; i++) {
        const subset = displayCandles.slice(i - period + 1, i + 1);
        const avg = subset.reduce((a, c) => a + c.c, 0) / period;
        const x = getX(i);
        const y = getY(avg);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // ─── Candlesticks ─────────────────────────────────────────────────────────
    displayCandles.forEach((c, idx) => {
      const x = getX(idx);
      const isUp = c.c >= c.o;
      const wickColor = isUp ? '#10b981' : '#f87171';
      const bodyColor = isUp ? 'rgba(16,185,129,0.88)' : 'rgba(248,113,113,0.88)';

      // Wick
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, getY(c.h));
      ctx.lineTo(x, getY(c.l));
      ctx.stroke();

      // Body
      const yO = getY(c.o);
      const yC = getY(c.c);
      const topY = Math.min(yO, yC);
      const bH = Math.max(2, Math.abs(yC - yO));
      ctx.fillStyle = bodyColor;
      ctx.fillRect(x - candleW / 2, topY, candleW, bH);
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x - candleW / 2, topY, candleW, bH);
    });

    // ─── Trade Markers from Paper Trading ─────────────────────────────────────
    positions
      .filter((pos) => pos.ticker === activeTicker)
      .forEach((pos) => {
        const y = getY(pos.entryPrice);
        ctx.beginPath();
        ctx.strokeStyle = pos.side === 'BUY' ? '#10b981' : '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Marker label
        ctx.fillStyle = pos.side === 'BUY' ? '#047857' : '#be123c';
        ctx.beginPath();
        (ctx as CanvasRenderingContext2D & { roundRect: (...a: unknown[]) => void }).roundRect(
          padding.left + 4,
          y - 8,
          64,
          16,
          4
        );
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${pos.side} @ ₹${pos.entryPrice.toFixed(1)}`, padding.left + 36, y + 4);
      });

    // ─── User Drawings (Trendlines, Horizontal, Fibonacci) ────────────────────
    const allDrawings = [...drawings];
    if (activeDrawing && activeDrawing.idx1 !== undefined && activeDrawing.price1 !== undefined) {
      allDrawings.push(activeDrawing as ChartDrawing);
    }

    allDrawings.forEach((d) => {
      const col = d.color || '#38bdf8';
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.6;

      if (d.type === 'horizontal') {
        const y = getY(d.price1);
        ctx.beginPath();
        ctx.setLineDash([5, 4]);
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = col;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`Lvl ₹${d.price1.toFixed(2)}`, width - padding.right - 4, y - 4);
      } else if (d.type === 'trendline' && d.idx2 !== undefined && d.price2 !== undefined) {
        const x1 = getX(d.idx1);
        const y1 = getY(d.price1);
        const x2 = getX(d.idx2);
        const y2 = getY(d.price2);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // End nodes
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x1, y1, 3, 0, Math.PI * 2);
        ctx.arc(x2, y2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'fibonacci' && d.idx2 !== undefined && d.price2 !== undefined) {
        const highPrice = Math.max(d.price1, d.price2);
        const lowPrice = Math.min(d.price1, d.price2);
        const fibDiff = highPrice - lowPrice;
        const levels = [
          { ratio: 0, label: '0.0%' },
          { ratio: 0.236, label: '23.6%' },
          { ratio: 0.382, label: '38.2%' },
          { ratio: 0.5, label: '50.0%' },
          { ratio: 0.618, label: '61.8%' },
          { ratio: 1.0, label: '100.0%' },
        ];

        levels.forEach((lvl) => {
          const lvlPrice = highPrice - fibDiff * lvl.ratio;
          const y = getY(lvlPrice);

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(216, 180, 254, 0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.moveTo(padding.left, y);
          ctx.lineTo(width - padding.right, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#c084fc';
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`Fib ${lvl.label} (₹${lvlPrice.toFixed(1)})`, padding.left + 4, y - 3);
        });
      }
    });

    // ─── Latest Price Beacon ──────────────────────────────────────────────────
    const latest = displayCandles[displayCandles.length - 1];
    if (latest) {
      const ly = getY(latest.c);
      const isUp = latest.c >= latest.o;
      const col = isUp ? '#10b981' : '#f87171';

      ctx.beginPath();
      ctx.strokeStyle = `${col}55`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.moveTo(padding.left, ly);
      ctx.lineTo(width - padding.right, ly);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = col;
      ctx.beginPath();
      (ctx as CanvasRenderingContext2D & { roundRect: (...a: unknown[]) => void }).roundRect(
        width - padding.right + 2,
        ly - 9,
        64,
        18,
        5
      );
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(latest.c.toFixed(2), width - padding.right + 34, ly + 4);
    }

    // ─── Crosshair ────────────────────────────────────────────────────────────
    if (
      mousePos &&
      mousePos.x >= padding.left &&
      mousePos.x <= width - padding.right &&
      mousePos.y >= padding.top &&
      mousePos.y <= padding.top + priceH
    ) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(mousePos.x, padding.top);
      ctx.lineTo(mousePos.x, padding.top + priceH);
      ctx.moveTo(padding.left, mousePos.y);
      ctx.lineTo(width - padding.right, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const hoverPrice = getPriceFromY(mousePos.y);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(width - padding.right + 2, mousePos.y - 9, 64, 18);
      ctx.strokeStyle = 'rgba(16,185,129,0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width - padding.right + 2, mousePos.y - 9, 64, 18);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hoverPrice.toFixed(2), width - padding.right + 34, mousePos.y + 4);
    }
  }, [
    dimensions,
    displayCandles,
    showVolume,
    showVWAP,
    showSMA,
    showEMA,
    showBB,
    mousePos,
    prevClose,
    drawings,
    activeDrawing,
    positions,
    activeTicker,
  ]);

  useEffect(() => {
    const id = requestAnimationFrame(renderChart);
    return () => cancelAnimationFrame(id);
  }, [renderChart]);

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || displayCandles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const padding = { top: 20, right: 72, bottom: 32, left: 14 };
    const chartW = Math.max(10, rect.width - padding.left - padding.right);
    const stepX = chartW / displayCandles.length;
    const idx = Math.floor((x - padding.left) / stepX);
    setHoveredCandle(idx >= 0 && idx < displayCandles.length ? displayCandles[idx] : null);

    // If currently drawing multi-point tool
    if (activeDrawing && (drawingMode === 'trendline' || drawingMode === 'fibonacci')) {
      const priceSpan = (displayCandles[displayCandles.length - 1]?.h || 100) - (displayCandles[0]?.l || 50);
      const minPrice = (displayCandles[0]?.l || 50) - priceSpan * 0.05;
      const maxPrice = (displayCandles[displayCandles.length - 1]?.h || 100) + priceSpan * 0.05;
      const priceH = (rect.height - padding.top - padding.bottom) * (showVolume ? 0.8 : 1);
      const currPrice = maxPrice - ((y - padding.top) / priceH) * (maxPrice - minPrice);

      setActiveDrawing((prev) => ({
        ...prev,
        idx2: Math.max(0, Math.min(displayCandles.length - 1, idx)),
        price2: currPrice,
      }));
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  // Handle canvas clicks for drawing tools
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingMode === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas || displayCandles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = { top: 20, right: 72, bottom: 32, left: 14 };
    const chartW = Math.max(10, rect.width - padding.left - padding.right);
    const stepX = chartW / displayCandles.length;
    const idx = Math.max(0, Math.min(displayCandles.length - 1, Math.floor((x - padding.left) / stepX)));

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    displayCandles.forEach((c) => {
      minPrice = Math.min(minPrice, c.l);
      maxPrice = Math.max(maxPrice, c.h);
    });
    const priceSpan = maxPrice - minPrice || 1;
    minPrice -= priceSpan * 0.05;
    maxPrice += priceSpan * 0.05;
    const priceH = (rect.height - padding.top - padding.bottom) * (showVolume ? 0.8 : 1);
    const clickedPrice = maxPrice - ((y - padding.top) / priceH) * (maxPrice - minPrice);

    if (drawingMode === 'horizontal') {
      const newD: ChartDrawing = {
        id: `draw-${Date.now()}`,
        type: 'horizontal',
        idx1: idx,
        price1: clickedPrice,
        color: '#38bdf8',
      };
      setDrawings((prev) => [...prev, newD]);
      setDrawingMode('none');
    } else if (drawingMode === 'trendline' || drawingMode === 'fibonacci') {
      if (!activeDrawing) {
        // First point
        setActiveDrawing({
          id: `draw-${Date.now()}`,
          type: drawingMode,
          idx1: idx,
          price1: clickedPrice,
          idx2: idx,
          price2: clickedPrice,
          color: drawingMode === 'trendline' ? '#38bdf8' : '#c084fc',
        });
      } else {
        // Second point: complete drawing
        const completed: ChartDrawing = {
          id: activeDrawing.id || `draw-${Date.now()}`,
          type: drawingMode,
          idx1: activeDrawing.idx1 ?? idx,
          price1: activeDrawing.price1 ?? clickedPrice,
          idx2: idx,
          price2: clickedPrice,
          color: activeDrawing.color,
        };
        setDrawings((prev) => [...prev, completed]);
        setActiveDrawing(null);
        setDrawingMode('none');
      }
    }
  };

  const clearDrawings = () => {
    setDrawings([]);
    setActiveDrawing(null);
    setDrawingMode('none');
  };

  const activeCandle = hoveredCandle ?? displayCandles[displayCandles.length - 1];
  const changePct = activeCandle
    ? ((activeCandle.c - activeCandle.o) / (activeCandle.o || 1)) * 100
    : 0;

  return (
    <div className="flex flex-col w-full h-[390px] sm:h-[450px] relative">
      {/* ── Toolbar Row ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/[0.07] px-1 shrink-0">
        {/* Floating OHLC HUD */}
        {activeCandle ? (
          <div className="inline-flex items-center gap-2 bg-black/75 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 tabular-nums flex-wrap">
            <span className="text-slate-400 font-semibold">{activeTicker}</span>
            <span className="w-px h-3 bg-white/10" />
            <span>
              <span className="text-slate-500">O </span>
              <span className="text-slate-200">{activeCandle.o.toFixed(2)}</span>
            </span>
            <span>
              <span className="text-slate-500">C </span>
              <span className="text-slate-100 font-semibold">{activeCandle.c.toFixed(2)}</span>
            </span>
            <span>
              <span className="text-slate-500">H </span>
              <span className="text-emerald-400">{activeCandle.h.toFixed(2)}</span>
            </span>
            <span>
              <span className="text-slate-500">L </span>
              <span className="text-rose-400">{activeCandle.l.toFixed(2)}</span>
            </span>
            <span className={`font-semibold ${changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
            {activeCandle.v !== undefined && (
              <>
                <span className="w-px h-3 bg-white/10" />
                <span>
                  <span className="text-slate-500">Vol </span>
                  <span className="text-cyan-300">{fmtVol(activeCandle.v)}</span>
                </span>
              </>
            )}

            {/* AI Pattern Pill Badge */}
            {selectedPattern && (
              <span
                className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider flex items-center gap-1 ${
                  selectedPattern.type === 'bullish'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                }`}
                title={selectedPattern.description}
              >
                <span>⚡ {selectedPattern.name}</span>
                <span className="opacity-75">{selectedPattern.confidence}%</span>
              </span>
            )}
          </div>
        ) : isSwitching ? (
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-ping" />
            <span>
              SWITCHING TELEMETRY → <span className="font-bold text-white">{target}</span>
            </span>
          </div>
        ) : (
          <div className="text-xs font-mono text-slate-500">Live Order Flow Chart</div>
        )}

        {/* Right Controls: Drawing Tools & Indicator Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Drawing Tools Palette */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.08] p-0.5 rounded-lg text-[10px] font-mono">
            <button
              onClick={() => setDrawingMode(drawingMode === 'trendline' ? 'none' : 'trendline')}
              title="Draw Trendline (Click 2 points)"
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                drawingMode === 'trendline' ? 'bg-[#38bdf8] text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ╱ Trend
            </button>
            <button
              onClick={() => setDrawingMode(drawingMode === 'horizontal' ? 'none' : 'horizontal')}
              title="Drop Horizontal Support/Resistance Ray"
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                drawingMode === 'horizontal' ? 'bg-[#38bdf8] text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              — H-Ray
            </button>
            <button
              onClick={() => setDrawingMode(drawingMode === 'fibonacci' ? 'none' : 'fibonacci')}
              title="Fibonacci Retracement (Swing High to Low)"
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                drawingMode === 'fibonacci' ? 'bg-[#c084fc] text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ☰ Fib
            </button>
            {drawings.length > 0 && (
              <button
                onClick={clearDrawings}
                title="Clear all drawings"
                className="px-1.5 py-0.5 rounded text-rose-400 hover:bg-rose-950/50 cursor-pointer"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Indicator Toggles */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] px-1.5 py-1 rounded-lg text-[10px] font-mono">
            <button
              onClick={() => setShowVWAP(!showVWAP)}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                showVWAP ? 'bg-cyan-950/80 text-cyan-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              VWAP
            </button>
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                showEMA ? 'bg-sky-950/80 text-sky-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EMA 20/50
            </button>
            <button
              onClick={() => setShowBB(!showBB)}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                showBB ? 'bg-purple-950/80 text-purple-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              BB
            </button>
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                showSMA ? 'bg-yellow-950/80 text-yellow-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              SMA
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                showVolume ? 'bg-emerald-950/80 text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              VOL
            </button>
          </div>
        </div>
      </div>

      {/* ── Canvas Area ─────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full mt-2 overflow-hidden rounded-xl"
        style={{ minHeight: 260 }}
      >
        <AnimatePresence>
          {isSwitching && (
            <StockGraphTransitionOverlay
              key={`overlay-${target}`}
              targetTicker={target}
            />
          )}
        </AnimatePresence>

        <motion.div
          key={`${activeTicker}-${currentTimeframe}`}
          initial={{ opacity: 0.1, scale: 0.992, filter: 'blur(3px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full absolute inset-0"
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={isSwitching ? undefined : handleMouseMove}
            onMouseLeave={isSwitching ? undefined : handleMouseLeave}
            style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }}
            className={
              isSwitching
                ? 'cursor-wait'
                : drawingMode !== 'none'
                ? 'cursor-crosshair'
                : 'cursor-crosshair'
            }
          />
        </motion.div>
      </div>

      {/* ── Segmented Timeframe Pill Bar ──────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 pt-3 shrink-0 border-t border-white/[0.06]">
        {TIMEFRAMES.map(({ label, value }) => {
          const active = currentTimeframe === value;
          return (
            <button
              key={value}
              onClick={() => onTimeframeChange?.(value)}
              className={`px-5 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all duration-150 cursor-pointer tracking-widest ${
                active
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.07]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
