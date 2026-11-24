'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Trash2, X } from 'lucide-react';
import { audio, PriceAlert } from '@/lib/audio';
import { clsx } from 'clsx';

export interface OrionNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'price_alert' | 'order_fill' | 'signal_flip' | 'system';
}

const STORAGE_KEY = 'orion_notifications_v1';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<OrionNotification[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'init-1',
        title: 'Telemetry Connected',
        message: 'Connected to ORION ThreadingTCPServer WebSocket tick engine.',
        time: 'Just now',
        read: false,
        type: 'system',
      },
    ];
  });

  const [desktopEnabled, setDesktopEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Hook into AudioEngine price alerts
  useEffect(() => {
    const unsub = audio.onAlertTriggered((alert: PriceAlert, currentPrice: number) => {
      const newNotif: OrionNotification = {
        id: `notif-${Date.now()}`,
        title: `Price Alert Pierced: ${alert.ticker.split('_')[0]}`,
        message: `${alert.ticker.split('_')[0]} traded at ₹${currentPrice.toFixed(2)}, crossing your ₹${alert.targetPrice} target level.`,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: 'price_alert',
      };

      setNotifications((prev) => [newNotif, ...prev]);

      // Fire desktop browser notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(newNotif.title, {
            body: newNotif.message,
            icon: '/favicon.ico',
          });
        } catch {}
      }
    });

    return () => unsub();
  }, []);

  const requestDesktopPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setDesktopEnabled(perm === 'granted');
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative font-mono text-xs">
      {/* Trigger Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllRead();
          }
        }}
        className={clsx(
          'relative p-2 rounded-full border transition-all cursor-pointer',
          unreadCount > 0
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
            : 'bg-[#0e131d] text-slate-400 border-white/10 hover:text-white'
        )}
        title="Alerts and Notifications"
      >
        {unreadCount > 0 ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl bg-[#0a0d14] border border-white/15 p-4 shadow-2xl backdrop-blur-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#50C878]" />
                <span className="font-bold text-white uppercase tracking-wider">Alert Center</span>
              </div>
              <div className="flex items-center gap-1.5">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    title="Clear All Notifications"
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Browser Permission Banner */}
            {!desktopEnabled && (
              <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between text-[11px]">
                <span className="text-cyan-300">Enable OS desktop notifications</span>
                <button
                  onClick={requestDesktopPermission}
                  className="px-2 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] cursor-pointer"
                >
                  Enable
                </button>
              </div>
            )}

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto space-y-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No notifications logged yet.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={clsx(
                      'p-2.5 rounded-xl border flex flex-col gap-1 transition-colors',
                      n.read ? 'bg-white/[0.02] border-white/5' : 'bg-emerald-950/20 border-emerald-500/20'
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-[11px]">{n.title}</span>
                      <span className="text-[9px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-slate-300 text-[10px] leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
