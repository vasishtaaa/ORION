'use client';
import React from 'react';

interface RadarChartProps {
  rsi?: number;
  confidence?: number;
  sentiment?: number; // -1 to +1
  imbalance?: number; // 0 to 1
  quantScore?: number; // 0 to 1
}

export default function RadarChart({
  rsi = 50,
  confidence = 50,
  sentiment = 0.0,
  imbalance = 0.5,
  quantScore = 0.5,
}: RadarChartProps) {
  // Normalize parameters to 0..100 range
  const valRsi = Math.min(Math.max(rsi, 0), 100);
  const valConf = Math.min(Math.max(confidence, 0), 100);
  const valSent = Math.min(Math.max((sentiment + 1) * 50, 0), 100);
  const valImb = Math.min(Math.max(imbalance * 100, 0), 100);
  const valQuant = Math.min(Math.max(quantScore * 100, 0), 100);

  const values = [valRsi, valConf, valSent, valImb, valQuant];
  const labels = ['RSI', 'CONFIDENCE', 'SENTIMENT', 'IMBALANCE', 'QUANT SCORE'];

  const size = 260;
  const center = size / 2;
  const rMax = 90;

  // Compute angles for pentagon (5 vertices)
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / 5) * index - Math.PI / 2;
    const r = (value / 100) * rMax;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate background pentagon concentric rings
  const rings = [0.25, 0.5, 0.75, 1.0];
  const ringPolygons = rings.map(ringRatio => {
    const points = Array.from({ length: 5 }).map((_, i) => {
      const coords = getCoordinates(i, ringRatio * 100);
      return `${coords.x},${coords.y}`;
    }).join(' ');
    return points;
  });

  // Calculate user data polygon path
  const dataPoints = values.map((val, i) => {
    const coords = getCoordinates(i, val);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  // Calculate axis lines and text label positions
  const axes = labels.map((label, i) => {
    const outerCoords = getCoordinates(i, 100);
    // Push labels slightly outwards from vertices
    const textAngle = (Math.PI * 2 / 5) * i - Math.PI / 2;
    const textDistance = rMax + 18;
    const tx = center + textDistance * Math.cos(textAngle);
    const ty = center + textDistance * Math.sin(textAngle) + 4; // slight vertical adjust

    return {
      x2: outerCoords.x,
      y2: outerCoords.y,
      tx,
      ty,
      label,
      val: values[i],
    };
  });

  return (
    <div className="flex flex-col items-center justify-center p-2 relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grids Rings */}
        {ringPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="rgba(80, 200, 120, 0.12)"
            strokeWidth="1"
            strokeDasharray={idx === 3 ? "none" : "2,3"}
          />
        ))}

        {/* Diagonal Axis Lines */}
        {axes.map((ax, idx) => (
          <line
            key={idx}
            x1={center}
            y1={center}
            x2={ax.x2}
            y2={ax.y2}
            stroke="rgba(80, 200, 120, 0.12)"
            strokeWidth="1"
          />
        ))}

        {/* Filled Data Polygon Area */}
        <polygon
          points={dataPoints}
          fill="rgba(80, 200, 120, 0.18)"
          stroke="var(--matrix)"
          strokeWidth="2"
          className="transition-all duration-500 ease-out"
          style={{ filter: 'drop-shadow(0 0 4px rgba(80, 200, 120, 0.3))' }}
        />

        {/* Vertices indicator dots */}
        {values.map((val, i) => {
          const coords = getCoordinates(i, val);
          return (
            <circle
              key={i}
              cx={coords.x}
              cy={coords.y}
              r="4"
              fill="var(--matrix-bright)"
              stroke="var(--brg-darkest)"
              strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 0 3px var(--matrix-bright))' }}
            />
          );
        })}

        {/* Text Labels */}
        {axes.map((ax, idx) => (
          <g key={idx} className="select-none">
            <text
              x={ax.tx}
              y={ax.ty}
              textAnchor="middle"
              className="mono font-bold text-[8px] tracking-wider fill-text-secondary"
              style={{ fill: 'rgba(240, 255, 248, 0.75)' }}
            >
              {ax.label}
            </text>
            <text
              x={ax.tx}
              y={ax.ty + 8}
              textAnchor="middle"
              className="mono text-[8px] font-black"
              style={{ fill: 'var(--matrix)' }}
            >
              {idx === 2 ? `${(sentiment >= 0 ? '+' : '') + sentiment.toFixed(2)}` :
               idx === 3 ? `${(ax.val.toFixed(0))}%` :
               idx === 4 ? `${quantScore.toFixed(2)}` :
               `${ax.val.toFixed(0)}`}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
