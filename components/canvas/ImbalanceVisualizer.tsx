'use client';
import React, { useEffect, useRef } from 'react';

interface ImbalanceVisualizerProps {
  imbalance?: number; // 0.0 (all ask) to 1.0 (all bid)
  active?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export default function ImbalanceVisualizer({ imbalance = 0.5, active = true }: ImbalanceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const maxParticles = 80;

    // Handle canvas sizing
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight || 150;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create a new particle
    const createParticle = (isInit = false): Particle => {
      const w = canvas.width;
      const h = canvas.height;

      // Color selection based on imbalance (imbalance > 0.5 favors green/bids, < 0.5 favors red/asks)
      const bidProbability = imbalance;
      const isBid = Math.random() < bidProbability;
      const color = isBid ? '0, 255, 135' : '239, 68, 68'; // Matrix Green vs Crimson Red

      // Direction of flow based on imbalance:
      // If bids dominant, flow downwards. If asks dominant, flow upwards.
      const flowDirection = imbalance > 0.5 ? 1 : -1;
      const baseVy = (0.4 + Math.random() * 0.8) * flowDirection * (1 + Math.abs(imbalance - 0.5) * 2);

      const maxL = 100 + Math.random() * 150;

      return {
        x: Math.random() * w,
        y: flowDirection > 0 ? (isInit ? Math.random() * h : 0) : (isInit ? Math.random() * h : h),
        vx: (Math.random() - 0.5) * 0.4,
        vy: baseVy,
        size: 1 + Math.random() * 2.5,
        color,
        alpha: 0.1 + Math.random() * 0.6,
        life: 0,
        maxLife: maxL,
      };
    };

    // Initialize particle pool
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    // Main animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Update and draw particles
      particles.forEach((p, idx) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Apply slight float drift
        p.vx += (Math.random() - 0.5) * 0.05;

        // Wrap horizontal edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        // Check if out of vertical bounds or dead
        const outOfBounds = p.vy > 0 ? p.y > h : p.y < 0;
        if (p.life >= p.maxLife || outOfBounds) {
          particles[idx] = createParticle(false);
          return;
        }

        // Draw particle glow
        const lifeRatio = 1 - p.life / p.maxLife;
        const currentAlpha = p.alpha * lifeRatio;

        ctx.beginPath();
        const radGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        radGrd.addColorStop(0, `rgba(${p.color}, ${currentAlpha})`);
        radGrd.addColorStop(0.3, `rgba(${p.color}, ${currentAlpha * 0.4})`);
        radGrd.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = radGrd;
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw core particle point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${currentAlpha * 0.9})`;
        ctx.fill();
      });

      // Draw constellation links (connect nearby particles with faint lines)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];

          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 50 && pi.color === pj.color) {
            const linkAlpha = (1 - dist / 50) * 0.15 * Math.min(pi.alpha, pj.alpha);
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = `rgba(${pi.color}, ${linkAlpha})`;
            ctx.stroke();
          }
        }
      }

      // Draw center visual divider/hud graphic
      ctx.strokeStyle = 'rgba(80, 200, 120, 0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Show small real-time indicator texts
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = 'rgba(80, 200, 120, 0.4)';
      ctx.textAlign = 'left';
      ctx.fillText('FLOW PRESSURE INDICATOR', 12, 16);
      
      ctx.textAlign = 'right';
      const pctBids = Math.round(imbalance * 100);
      ctx.fillText(`BIDS: ${pctBids}% / ASKS: ${100 - pctBids}%`, w - 12, 16);

      if (active) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (active) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imbalance, active]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: 140 }}>
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />
    </div>
  );
}
