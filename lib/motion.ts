/**
 * lib/motion.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * ORION Non-Destructive Motion Utilities
 *
 * Provides Framer Motion spring variants and a GSAP number-ticker hook that
 * layer motion on top of the existing design system without touching any CSS,
 * color, glassmorphism, typography, or layout tokens.
 *
 * Glassmorphism glitch prevention is baked in:
 *   • will-change: transform, opacity   — promotes layer to compositor
 *   • backface-visibility: hidden        — prevents flicker on repaint
 *   • transform-style: preserve-3d      — keeps the stacking context stable
 *   • GSAP force3D: true                — forces GPU matrix path in GSAP
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useRef } from 'react';
import type { Variants } from 'framer-motion';

/* ── Glassmorphism-Safe Inline Style ────────────────────────────────────────
   Inject this into any <motion.div> that wraps a panel using backdrop-filter.
   It ensures the browser promotes the element to its own compositor layer
   before any CSS transform is applied, preventing backdrop-filter teardown.
────────────────────────────────────────────────────────────────────────────── */
export const GLASS_SAFE: React.CSSProperties = {
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  transformStyle: 'preserve-3d',
};

/* ── Spring Config ───────────────────────────────────────────────────────────
   Professional, snappy spring — tight enough to feel responsive, soft enough
   to feel premium. No bounce overshoot on glass panels.
────────────────────────────────────────────────────────────────────────────── */
export const SPRING_SNAPPY = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};

export const SPRING_GENTLE = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
  mass: 1,
};

/* ── Page Container Variant ─────────────────────────────────────────────────
   Wraps an entire page's <main>. Staggers children automatically.
────────────────────────────────────────────────────────────────────────────── */
export const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

/* ── Panel Variant ───────────────────────────────────────────────────────────
   For large glass panels (diagnostics, histogram, etc.).
   Uses y: 20 offset — subtle enough not to disturb layout, visible enough
   to feel deliberate. No scale transform to avoid backdrop-filter issues.
────────────────────────────────────────────────────────────────────────────── */
export const panelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SNAPPY,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

/* ── KPI Card Item Variant ───────────────────────────────────────────────────
   For individual metric cards inside a stagger container.
────────────────────────────────────────────────────────────────────────────── */
export const cardItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SNAPPY,
  },
};

/* ── Row Fade Variant ────────────────────────────────────────────────────────
   For individual data rows inside panels (used with AnimatePresence).
────────────────────────────────────────────────────────────────────────────── */
export const rowVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: 6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/* ── useGsapNumberTicker ─────────────────────────────────────────────────────
   Smoothly rolls/ticks a displayed number from its previous value to a new
   target using GSAP — completely decoupled from the WebSocket data loop.

   Usage:
     const ref = useGsapNumberTicker(p50, (v) => `${v.toFixed(0)} μs`);
     <span ref={ref}>...</span>

   The tween uses requestAnimationFrame via GSAP's own ticker, meaning it
   never blocks the React render or WebSocket message handler.
────────────────────────────────────────────────────────────────────────────── */
export function useGsapNumberTicker(
  targetValue: number,
  formatter: (v: number) => string = (v) => v.toFixed(0)
) {
  const ref = useRef<HTMLSpanElement>(null);
  const tweenObj = useRef<{ val: number }>({ val: targetValue });
  const gsapRef = useRef<ReturnType<typeof import('gsap')['default']['to']> | null>(null);
  // Track whether GSAP has been dynamically loaded
  const gsapLoaded = useRef(false);

  // Initialise display immediately so there's no blank flash
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatter(targetValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function animateTick() {
      // Lazy-load GSAP to avoid SSR issues and keep bundle splitting clean
      const { gsap } = await import('gsap');
      if (cancelled) return;
      gsapLoaded.current = true;

      // Kill any in-progress tween for this element
      if (gsapRef.current) {
        gsapRef.current.kill();
      }

      const startVal = tweenObj.current.val;

      gsapRef.current = gsap.to(tweenObj.current, {
        val: targetValue,
        duration: 0.65,
        ease: 'power2.out',
        // force3D prevents the compositor from demoting the layer during paint
        force3D: true,
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = formatter(tweenObj.current.val);
          }
        },
        onComplete: () => {
          // Snap to exact target to avoid floating-point drift
          if (ref.current) {
            ref.current.textContent = formatter(targetValue);
          }
          tweenObj.current.val = targetValue;
        },
      });

      // Suppress unused variable warning
      void startVal;
    }

    animateTick();

    return () => {
      cancelled = true;
      if (gsapRef.current) {
        gsapRef.current.kill();
      }
    };
  // Re-run only when the target number changes, not on formatter identity changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue]);

  return ref;
}
