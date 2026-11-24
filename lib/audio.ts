'use client';

export type AudioTheme = 'studio' | 'bloomberg' | 'cyberpunk';

export interface PriceAlert {
  id: string;
  ticker: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered?: boolean;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private theme: AudioTheme = 'studio';
  private masterGain: GainNode | null = null;
  private alerts: PriceAlert[] = [];
  private onAlertTriggeredCallbacks: ((alert: PriceAlert, currentPrice: number) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('orion_audio_theme') as AudioTheme;
        if (savedTheme && ['studio', 'bloomberg', 'cyberpunk'].includes(savedTheme)) {
          this.theme = savedTheme;
        }
        const savedMute = localStorage.getItem('orion_audio_muted');
        if (savedMute !== null) {
          this.isMuted = savedMute === 'true';
        }
        const savedAlerts = localStorage.getItem('orion_price_alerts');
        if (savedAlerts) {
          this.alerts = JSON.parse(savedAlerts);
        }
      } catch {}
    }
  }

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setTheme(theme: AudioTheme) {
    this.theme = theme;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('orion_audio_theme', theme);
      } catch {}
    }
  }

  public getTheme(): AudioTheme {
    return this.theme;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('orion_audio_muted', String(muted));
      } catch {}
    }
    if (!muted) {
      this.initCtx();
    }
  }

  public getMute(): boolean {
    return this.isMuted;
  }

  public toggle(): boolean {
    this.setMute(!this.isMuted);
    return !this.isMuted;
  }

  // ─── Price Alerts Management ─────────────────────────────────────────────
  public addAlert(ticker: string, targetPrice: number, condition: 'above' | 'below'): PriceAlert {
    const newAlert: PriceAlert = {
      id: `${ticker}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ticker,
      targetPrice,
      condition,
      createdAt: Date.now(),
      triggered: false,
    };
    this.alerts.push(newAlert);
    this.persistAlerts();
    return newAlert;
  }

  public removeAlert(id: string) {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.persistAlerts();
  }

  public getAlerts(ticker?: string): PriceAlert[] {
    if (ticker) {
      return this.alerts.filter((a) => a.ticker === ticker && !a.triggered);
    }
    return this.alerts;
  }

  public onAlertTriggered(cb: (alert: PriceAlert, currentPrice: number) => void) {
    this.onAlertTriggeredCallbacks.push(cb);
    return () => {
      this.onAlertTriggeredCallbacks = this.onAlertTriggeredCallbacks.filter((c) => c !== cb);
    };
  }

  private persistAlerts() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('orion_price_alerts', JSON.stringify(this.alerts));
      } catch {}
    }
  }

  public checkPriceAlerts(ticker: string, currentPrice: number) {
    if (!currentPrice || currentPrice <= 0) return;
    for (const alert of this.alerts) {
      if (alert.ticker === ticker && !alert.triggered) {
        const hit =
          (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
          (alert.condition === 'below' && currentPrice <= alert.targetPrice);

        if (hit) {
          alert.triggered = true;
          this.persistAlerts();
          this.playPriceAlarm();
          this.onAlertTriggeredCallbacks.forEach((cb) => {
            try {
              cb(alert, currentPrice);
            } catch {}
          });
        }
      }
    }
  }

  // ─── Sound Generators ──────────────────────────────────────────────────
  public playTick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (this.theme === 'cyberpunk') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      } else if (this.theme === 'bloomberg') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, now);
        gain.gain.setValueAtTime(0.012, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      } else {
        // Modern Studio (default)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      }

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  public playAlert(type: 'buy' | 'sell' | 'hold') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (this.theme === 'cyberpunk') {
        osc.type = 'sawtooth';
        if (type === 'buy') {
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(1040, now + 0.15);
        } else if (type === 'sell') {
          osc.frequency.setValueAtTime(780, now);
          osc.frequency.exponentialRampToValueAtTime(260, now + 0.15);
        } else {
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(440, now + 0.1);
        }
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      } else if (this.theme === 'bloomberg') {
        osc.type = 'square';
        if (type === 'buy') {
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.setValueAtTime(900, now + 0.08);
        } else if (type === 'sell') {
          osc.frequency.setValueAtTime(900, now);
          osc.frequency.setValueAtTime(600, now + 0.08);
        } else {
          osc.frequency.setValueAtTime(750, now);
        }
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      } else {
        // Modern Studio (default)
        osc.type = 'triangle';
        if (type === 'buy') {
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(880, now + 0.08);
        } else if (type === 'sell') {
          osc.frequency.setValueAtTime(660, now);
          osc.frequency.setValueAtTime(330, now + 0.08);
        } else {
          osc.frequency.setValueAtTime(523.25, now);
        }
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      }

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  public playPriceAlarm() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // Dual-tone chime (high-low-high)
      const notes = [880, 1174.66, 1760];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.06, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.25);
      });
    } catch {}
  }

  public playOrderFill() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.16); // D6

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch {}
  }

  private pulseActive: boolean = false;
  private pulseTimer: ReturnType<typeof setInterval> | null = null;

  public togglePulse(getThroughput?: () => number): boolean {
    this.pulseActive = !this.pulseActive;
    if (this.pulseActive) {
      this.initCtx();
      this.pulseTimer = setInterval(() => {
        const tp = getThroughput ? getThroughput() : 1800;
        const ratio = Math.min(1.0, Math.max(0.1, tp / 3000));
        this.playHeartbeat(ratio);
      }, 1200);
    } else if (this.pulseTimer) {
      clearInterval(this.pulseTimer);
      this.pulseTimer = null;
    }
    return this.pulseActive;
  }

  public isPulseRunning(): boolean {
    return this.pulseActive;
  }

  public playHeartbeat(volatilityRatio: number = 0.5) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 60 + Math.min(60, volatilityRatio * 40);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }
}

export const audio = new AudioEngine();

export function toggleAudio(): boolean {
  return audio.toggle();
}

export function isAudioEnabled(): boolean {
  return !audio.getMute();
}
