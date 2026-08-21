'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, description?: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => addToast(title, description, 'success'), [addToast]);
  const error = useCallback((title: string, description?: string) => addToast(title, description, 'error'), [addToast]);
  const info = useCallback((title: string, description?: string) => addToast(title, description, 'info'), [addToast]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#00ff87] flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-[#00ff87]/30 bg-[#00140a]/95 text-[#f0fff8]',
    error: 'border-red-500/30 bg-[#160404]/95 text-[#fff0f0]',
    warning: 'border-amber-500/30 bg-[#170e02]/95 text-[#fffbf0]',
    info: 'border-cyan-500/30 bg-[#001018]/95 text-[#f0faff]',
  };

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'pointer-events-auto p-4 rounded-xl border shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200',
              borders[t.type]
            )}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5">{icons[t.type]}</span>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-mono font-bold">{t.title}</p>
                {t.description && <p className="text-[11px] font-mono text-[var(--text-secondary)]">{t.description}</p>}
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: (title: string, description?: string) => console.log(`[Toast] ${title}: ${description}`),
      success: (title: string, description?: string) => console.log(`[Toast Success] ${title}: ${description}`),
      error: (title: string, description?: string) => console.error(`[Toast Error] ${title}: ${description}`),
      info: (title: string, description?: string) => console.log(`[Toast Info] ${title}: ${description}`),
    };
  }
  return context;
}
