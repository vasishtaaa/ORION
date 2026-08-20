'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const LiquidBackground = dynamic(() => import('./LiquidBackground'), { ssr: false });

export default function ClientBackgroundWrapper() {
  return <LiquidBackground />;
}
