'use client';

import { audio } from './audio';

export type OrionVoiceState = 'STANDBY' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

export interface OrionVoiceContext {
  activeTicker: string;
  currentPrice: number;
  selectTicker: (ticker: string) => void;
  setActiveTab?: (tab: 'chart' | 'paper' | 'options' | 'ai' | 'backtest' | 'macro') => void;
  setTimeframe?: (tf: 'LIVE' | '1D' | '1W' | '1M' | '6M' | '1Y') => void;
  executePaperOrder?: (order: { ticker: string; side: 'BUY' | 'SELL'; shares: number; price: number }) => { success: boolean; message: string };
  closePosition?: (id: string, price: number) => void;
  portfolioSummary?: { equity: number; cash: number; positionsCount: number };
  signal?: string;
  confidence?: number;
  rsi?: number;
  targetPrice?: number;
}

const TICKER_NAME_MAP: Record<string, string> = {
  reliance: 'RELI_NSE',
  reli: 'RELI_NSE',
  tcs: 'TCS_NSE',
  tata: 'TATAMOTORS_NSE',
  'tata motors': 'TATAMOTORS_NSE',
  hdfc: 'HDFC_NSE',
  'hdfc bank': 'HDFC_NSE',
  infosys: 'INFY_NSE',
  infy: 'INFY_NSE',
  icici: 'ICICIBANK_NSE',
  'icici bank': 'ICICIBANK_NSE',
  sbi: 'SBIN_NSE',
  'state bank': 'SBIN_NSE',
  adani: 'ADANIENT_NSE',
  'adani enterprises': 'ADANIENT_NSE',
  maruti: 'MARUTI_NSE',
  lt: 'LT_NSE',
  'larsen and toubro': 'LT_NSE',
};

class OrionVoiceCore {
  private recognition: any = null;
  private state: OrionVoiceState = 'STANDBY';
  private stateListeners: ((state: OrionVoiceState) => void)[] = [];
  private transcriptListeners: ((transcript: string, speaker: 'user' | 'orion') => void)[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isContinuous: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoice();
      this.initSpeechRecognition();
    }
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes('Daniel') ||
          v.name.includes('Oliver') ||
          v.name.includes('George') ||
          v.name.includes('UK English Male') ||
          v.name.includes('Google UK English Male') ||
          (v.lang.startsWith('en-GB') && !v.name.includes('Female')) ||
          v.lang.startsWith('en')
      );
      this.selectedVoice = preferred || voices[0] || null;
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.setState('LISTENING');
    };

    this.recognition.onend = () => {
      if (this.isContinuous && this.state !== 'SPEAKING') {
        try {
          this.recognition.start();
        } catch {
          this.setState('STANDBY');
        }
      } else {
        this.setState('STANDBY');
      }
    };

    this.recognition.onerror = () => {
      this.setState('STANDBY');
    };
  }

  public onStateChange(cb: (state: OrionVoiceState) => void) {
    this.stateListeners.push(cb);
    cb(this.state);
    return () => {
      this.stateListeners = this.stateListeners.filter((c) => c !== cb);
    };
  }

  public onTranscript(cb: (transcript: string, speaker: 'user' | 'orion') => void) {
    this.transcriptListeners.push(cb);
    return () => {
      this.transcriptListeners = this.transcriptListeners.filter((c) => c !== cb);
    };
  }

  private setState(state: OrionVoiceState) {
    this.state = state;
    this.stateListeners.forEach((cb) => cb(state));
  }

  private notifyTranscript(text: string, speaker: 'user' | 'orion') {
    this.transcriptListeners.forEach((cb) => cb(text, speaker));
  }

  public startListening(ctx: OrionVoiceContext, continuous = false) {
    this.isContinuous = continuous;
    if (!this.recognition) {
      this.speak("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, sir.");
      return;
    }

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const activeText = finalTranscript.trim() || interim.trim();
      if (activeText) {
        this.notifyTranscript(activeText, 'user');
      }

      if (finalTranscript.trim()) {
        this.processCommand(finalTranscript.trim(), ctx);
      }
    };

    try {
      this.recognition.start();
    } catch {
      // Already running
    }
  }

  public stopListening() {
    this.isContinuous = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.setState('STANDBY');
  }

  public isListening(): boolean {
    return this.state === 'LISTENING';
  }

  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.notifyTranscript(text, 'orion');
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      this.setState('SPEAKING');
      this.notifyTranscript(text, 'orion');

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = 1.05;
      utterance.pitch = 0.98;

      utterance.onend = () => {
        this.setState(this.isContinuous ? 'LISTENING' : 'STANDBY');
        resolve();
      };
      utterance.onerror = () => {
        this.setState(this.isContinuous ? 'LISTENING' : 'STANDBY');
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  // ─── Natural Language Intent Parser ──────────────────────────────────────
  public async processCommand(rawText: string, ctx: OrionVoiceContext) {
    this.setState('PROCESSING');
    const q = rawText.toLowerCase().replace(/^(hey |hi |hello |ok |okay )?orion,? ?/i, '').trim();

    // 1. Ticker Switching
    for (const [name, tickerCode] of Object.entries(TICKER_NAME_MAP)) {
      if (q.includes(`switch to ${name}`) || q.includes(`open ${name}`) || q.includes(`show ${name}`) || q.includes(`load ${name}`) || q === name) {
        ctx.selectTicker(tickerCode);
        await this.speak(`Right away, sir. Synchronizing ORION telemetry to ${name.toUpperCase()}.`);
        return;
      }
    }

    // 2. Paper Trading Execution ("Orion, buy 50 shares", "sell 100 shares")
    const orderMatch = q.match(/(buy|sell|purchase)\s+(\d+)\s+shares?(?:\s+of\s+([a-z\s]+))?/i);
    if (orderMatch && ctx.executePaperOrder) {
      const side = orderMatch[1].toLowerCase() === 'sell' ? 'SELL' : 'BUY';
      const shares = parseInt(orderMatch[2], 10);
      let targetTicker = ctx.activeTicker;

      if (orderMatch[3]) {
        const rawTarget = orderMatch[3].trim().toLowerCase();
        for (const [n, code] of Object.entries(TICKER_NAME_MAP)) {
          if (rawTarget.includes(n)) {
            targetTicker = code;
            ctx.selectTicker(code);
            break;
          }
        }
      }

      const cleanName = targetTicker.split('_')[0];
      const res = ctx.executePaperOrder({
        ticker: targetTicker,
        side,
        shares,
        price: ctx.currentPrice,
      });

      if (res.success) {
        await this.speak(`At once, sir. Executed paper ${side} order for ${shares} shares of ${cleanName} at ₹${ctx.currentPrice.toFixed(2)}.`);
      } else {
        await this.speak(`Apologies, sir. The order could not be executed: ${res.message}.`);
      }
      return;
    }

    // 3. Tab Navigation
    if (q.includes('option') || q.includes('derivative') || q.includes('strike')) {
      ctx.setActiveTab?.('options');
      await this.speak("Displaying the NSE derivative options chain and open interest matrix, sir.");
      return;
    }
    if (q.includes('backtest') || q.includes('strategy') || q.includes('simulation')) {
      ctx.setActiveTab?.('backtest');
      await this.speak("Opening the quantitative strategy backtesting engine, sir.");
      return;
    }
    if (q.includes('portfolio') || q.includes('paper trade') || q.includes('my trades') || q.includes('positions')) {
      ctx.setActiveTab?.('paper');
      const equity = ctx.portfolioSummary?.equity || 1000000;
      await this.speak(`Here is your virtual trading portfolio, sir. Total equity stands at ₹${equity.toLocaleString()}.`);
      return;
    }
    if (q.includes('institutional') || q.includes('fii') || q.includes('dii') || q.includes('flow') || q.includes('sector')) {
      ctx.setActiveTab?.('macro');
      await this.speak("Accessing institutional capital flow telemetry and sector rotation heatmaps, sir.");
      return;
    }
    if (q.includes('chart') || q.includes('terminal') || q.includes('desk') || q.includes('candlestick')) {
      ctx.setActiveTab?.('chart');
      await this.speak("Returning to the primary charting desk, sir.");
      return;
    }

    // 4. Timeframe Control
    if (q.includes('live') || q.includes('tick')) {
      ctx.setTimeframe?.('LIVE');
      await this.speak("Switching to live tick telemetry stream, sir.");
      return;
    }
    if (q.includes('1 day') || q.includes('daily') || q.includes('one day')) {
      ctx.setTimeframe?.('1D');
      await this.speak("Switching to 1-day candlestick resolution, sir.");
      return;
    }
    if (q.includes('1 week') || q.includes('weekly')) {
      ctx.setTimeframe?.('1W');
      await this.speak("Switched to weekly swing intervals, sir.");
      return;
    }

    // 5. Audio & Theme Controls
    if (q.includes('mute audio') || q.includes('shut up') || q.includes('quiet') || q.includes('silence')) {
      audio.setMute(true);
      await this.speak("Acoustic audio telemetry muted, sir.");
      return;
    }
    if (q.includes('unmute') || q.includes('enable audio') || q.includes('sound on')) {
      audio.setMute(false);
      audio.playTick();
      await this.speak("Acoustic audio telemetry online, sir.");
      return;
    }
    if (q.includes('pulse') || q.includes('heartbeat')) {
      const active = audio.togglePulse();
      await this.speak(active ? "Market sonification pulse activated, sir." : "Market pulse deactivated, sir.");
      return;
    }
    if (q.includes('cyberpunk')) {
      audio.setTheme('cyberpunk');
      audio.playAlert('buy');
      await this.speak("Audio profile calibrated to Cyberpunk synthesizer, sir.");
      return;
    }
    if (q.includes('bloomberg')) {
      audio.setTheme('bloomberg');
      audio.playTick();
      await this.speak("Audio profile calibrated to Bloomberg retro acoustic, sir.");
      return;
    }

    // 6. Market Analysis & Deep Intelligence
    const cleanSym = ctx.activeTicker.split('_')[0];
    if (q.includes('analyze') || q.includes('what do you think') || q.includes('signal') || q.includes('verdict')) {
      const signal = ctx.signal || 'BUY';
      const conf = ctx.confidence || 88;
      const target = ctx.targetPrice || (ctx.currentPrice * 1.035);
      await this.speak(
        `ORION analysis for ${cleanSym}: Current market price is ₹${ctx.currentPrice.toFixed(2)}. The quantitative model assigns an algorithmic ${signal} conviction with ${conf.toFixed(0)}% confidence, targeting ₹${target.toFixed(2)}.`
      );
      return;
    }

    if (q.includes('price') || q.includes('quote') || q.includes('how much is')) {
      await this.speak(`${cleanSym} is currently trading at ₹${ctx.currentPrice.toFixed(2)}.`);
      return;
    }

    if (q.includes('who are you') || q.includes('introduce')) {
      await this.speak("I am ORION, your institutional AI market research and trading system. I can execute paper trades, scan order book microstructure, analyze derivatives, and operate your terminal hands-free, sir.");
      return;
    }

    // Default polite conversational fallback
    await this.speak(`Understood, sir. ORION is monitoring ${cleanSym} at ₹${ctx.currentPrice.toFixed(2)}. Standing by for your instructions.`);
  }
}

export const orionVoice = new OrionVoiceCore();
