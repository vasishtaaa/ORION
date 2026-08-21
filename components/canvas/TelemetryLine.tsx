'use client';
import React, { useId } from 'react';

interface TelemetryLineProps {
  data: number[];
  color?: string;
  height?: number;
  label?: string;
}

export default function TelemetryLine({ data, color = '#50C878', height = 60, label }: TelemetryLineProps) {
  const gradId = useId();

  if (!data || data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 200;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 4 - ((d - min) / range) * (height - 8);
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  const lastPoint = points[points.length - 1].split(',');

  return (
    <div className="w-full">
      {label && <p className="text-[9px] font-mono tracking-widest mb-1 text-[var(--text-muted)]">{label}</p>}
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={Number(lastPoint[0])} cy={Number(lastPoint[1])} r={3} fill={color} />
      </svg>
    </div>
  );
}
