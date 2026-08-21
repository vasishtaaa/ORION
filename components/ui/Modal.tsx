'use client';
import React, { useEffect, ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
      <GlassCard className="relative z-10 max-w-xl w-full p-6 border-[rgba(80,200,120,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[rgba(80,200,120,0.15)] mb-4">
          <div>
            <h3 className="text-base font-mono font-bold text-[var(--matrix-bright)]">{title}</h3>
            {description && <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[rgba(80,200,120,0.1)] text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>{children}</div>
      </GlassCard>
    </div>
  );
}
