'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  glow?: boolean;
  float?: boolean;
  floatDelay?: number;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, glow, float, floatDelay = 0, className = '', onClick }: GlassCardProps) {
  return (
    <motion.div
      className={`glass p-5 cursor-default ${glow ? 'glow-md' : ''} ${className}`}
      // Entry animation: fade+slide up once
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: floatDelay * 0.3 }}
      // Float: separate from entry — use animate only after visible
      {...(float ? {
        animate: { y: [0, -10, 0] },
        // Override transition for float animation
      } : {})}
      // Hover: scale up (no background color to avoid Framer Motion color-not-animatable warning)
      whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(80,200,120,0.28)' }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      style={{ transformOrigin: 'center' }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
