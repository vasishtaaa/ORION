'use client';
import React, { Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';

const LiquidBackground = dynamic(() => import('./LiquidBackground'), { ssr: false });

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[rgba(0,255,135,0.06)] rounded-full blur-[140px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-[rgba(80,200,120,0.04)] rounded-full blur-[120px]" />
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ClientBackgroundWrapper() {
  return (
    <ErrorBoundary>
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[rgba(0,255,135,0.05)] rounded-full blur-[160px]" />
        <div className="absolute bottom-[15%] right-[15%] w-[500px] h-[500px] bg-[rgba(80,200,120,0.04)] rounded-full blur-[130px]" />
      </div>
      <LiquidBackground />
    </ErrorBoundary>
  );
}
