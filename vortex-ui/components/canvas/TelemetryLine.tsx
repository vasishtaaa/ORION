'use client';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TelemetryLineProps {
  data: number[];
  color?: string;
  height?: number;
  label?: string;
}

export default function TelemetryLine({ data, color = '#50C878', height = 60, label }: TelemetryLineProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length < 2) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const W = svgRef.current.clientWidth || 200;
    const H = height;
    const x = d3.scaleLinear().domain([0, data.length - 1]).range([0, W]);
    const y = d3.scaleLinear().domain([d3.min(data) ?? 0, d3.max(data) ?? 1]).range([H - 2, 2]);

    const area = d3.area<number>()
      .x((_, i) => x(i)).y0(H).y1(d => y(d))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const line = d3.line<number>()
      .x((_, i) => x(i)).y(d => y(d))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const gradId = `tg-${Math.random().toString(36).slice(2)}`;
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0').attr('x2', '0').attr('y1', '0').attr('y2', '1');
    grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.25);
    grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.0);

    svg.append('path').datum(data).attr('d', area).attr('fill', `url(#${gradId})`);
    svg.append('path').datum(data).attr('d', line).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.5);

    const last = data[data.length - 1];
    svg.append('circle').attr('cx', x(data.length - 1)).attr('cy', y(last)).attr('r', 2.5).attr('fill', color);

  }, [data, color, height]);

  return (
    <div>
      {label && <p className="text-[9px] mono tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>}
      <svg ref={svgRef} width="100%" height={height} style={{ overflow: 'visible' }} />
    </div>
  );
}
