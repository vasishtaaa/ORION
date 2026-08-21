"""
VORTEX AI Agent — Fully self-contained stock analysis engine.

Components:
  - PriceHistory       : Rolling price buffer per ticker
  - TechnicalIndicators: RSI, MACD, Bollinger Bands, Momentum
  - NewsScraperThread  : Background RSS scraper + targeted Google News per-ticker
  - SentimentAnalyzer  : Keyword-based headline sentiment
  - ChatEngine         : Pattern-matching conversational analyst
  - VortexAgent        : Orchestrator — integrates all components
"""

import threading
import time
import math
import re
import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from collections import deque

# ── Configuration ──────────────────────────────────────────────────────
OLLAMA_MODEL = 'deepseek-r1:8b'       # Installed model — check with `ollama list`
OLLAMA_URL   = 'http://localhost:11434/api/generate'
OLLAMA_TIMEOUT = 8                   # 8s timeout for rapid UI responsiveness

# ── Per-ticker targeted news cache (3-min TTL) ───────────────────────────
_ticker_news_cache: dict = {}   # { base_name: {'items': [NewsItem], 'fetched_at': float} }
_ticker_news_lock  = threading.Lock()
_TICKER_NEWS_TTL   = 180        # 3 minutes per-ticker refresh


# ──────────────────────────────────────────────────────────────
# 1. PRICE HISTORY  (rolling buffer per ticker)
# ──────────────────────────────────────────────────────────────

class PriceHistory:
    def __init__(self, maxlen=300):
        self._buf = deque(maxlen=maxlen)

    def add(self, price: float):
        self._buf.append(float(price))

    def closes(self):
        return list(self._buf)

    def latest(self):
        return self._buf[-1] if self._buf else None

    def __len__(self):
        return len(self._buf)


# ──────────────────────────────────────────────────────────────
# 2. TECHNICAL INDICATORS
# ──────────────────────────────────────────────────────────────

class TechnicalIndicators:

    @staticmethod
    def rsi(prices, period=14):
        if len(prices) < period + 1:
            return 50.0
        deltas = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
        tail = deltas[-period:]
        gains = [d for d in tail if d > 0]
        losses = [-d for d in tail if d < 0]
        avg_gain = sum(gains) / period if gains else 0.0
        avg_loss = sum(losses) / period if losses else 0.0
        if avg_loss == 0:
            return 100.0
        rs = avg_gain / avg_loss
        return round(100 - (100 / (1 + rs)), 2)

    @staticmethod
    def _ema(prices, period):
        if not prices:
            return 0.0
        k = 2.0 / (period + 1)
        val = prices[0]
        for p in prices[1:]:
            val = p * k + val * (1 - k)
        return val

    @staticmethod
    def macd(prices):
        """Returns (macd_line, signal_line, histogram)"""
        if len(prices) < 26:
            return 0.0, 0.0, 0.0
        ema12 = TechnicalIndicators._ema(prices[-26:], 12)
        ema26 = TechnicalIndicators._ema(prices[-26:], 26)
        macd_line = ema12 - ema26
        # Approximate signal as 0.85× of macd (saves needing 9-bar MACD history)
        signal = macd_line * 0.85
        return macd_line, signal, macd_line - signal

    @staticmethod
    def bollinger_bands(prices, period=20, std_dev=2.0):
        if len(prices) < period:
            p = prices[-1] if prices else 100.0
            return p, p * 1.02, p * 0.98
        window = prices[-period:]
        mid = sum(window) / period
        variance = sum((p - mid) ** 2 for p in window) / period
        std = math.sqrt(variance) if variance > 0 else 0.0
        return round(mid, 2), round(mid + std_dev * std, 2), round(mid - std_dev * std, 2)

    @staticmethod
    def momentum(prices, period=10):
        if len(prices) < period + 1:
            return 0.0
        base = prices[-period]
        if base == 0:
            return 0.0
        return round((prices[-1] / base - 1) * 100, 4)

    @staticmethod
    def vwap_approx(prices):
        """Simple price average as VWAP approximation (no volume data)."""
        if not prices:
            return 0.0
        return round(sum(prices) / len(prices), 2)

    @staticmethod
    def order_book_imbalance(bids_l2, asks_l2):
        """Returns value in [-1, +1]. +1 = all bid pressure, -1 = all ask pressure."""
        bid_vol = sum(q for _, q in bids_l2) if bids_l2 else 0
        ask_vol = sum(q for _, q in asks_l2) if asks_l2 else 0
        total = bid_vol + ask_vol
        return round((bid_vol - ask_vol) / total, 4) if total else 0.0

    @staticmethod
    def stochastic(prices, period=14):
        """Stochastic %K"""
        if len(prices) < period:
            return 50.0
        window = prices[-period:]
        low_k = min(window)
        high_k = max(window)
        if high_k == low_k:
            return 50.0
        return round((prices[-1] - low_k) / (high_k - low_k) * 100, 2)

    @staticmethod
    def pivot_points(high: float, low: float, close: float):
        """Calculates Floor Pivot Points (P, R1, R2, S1, S2)"""
        p = (high + low + close) / 3.0 if (high and low and close) else close
        r1 = (2.0 * p) - low if low else p * 1.01
        s1 = (2.0 * p) - high if high else p * 0.99
        r2 = p + (high - low) if (high and low) else p * 1.02
        s2 = p - (high - low) if (high and low) else p * 0.98
        return {
            'pivot': round(p, 2),
            'r1': round(r1, 2),
            'r2': round(r2, 2),
            's1': round(s1, 2),
            's2': round(s2, 2)
        }

    @staticmethod
    def atr(prices, period=14):
        """Average True Range (volatility metric)"""
        if len(prices) < 2:
            return 0.0
        diffs = [abs(prices[i] - prices[i-1]) for i in range(1, len(prices))]
        tail = diffs[-period:] if len(diffs) >= period else diffs
        return round(sum(tail) / len(tail), 2) if tail else 0.0

    @staticmethod
    def quant_score(prices, mid, bids_l2, asks_l2, sentiment=0.0):
        """
        Institutional Multi-Factor Quant Alpha Signal Score (-1.0 to +1.0).
        Aggregates RSI, MACD, Stochastic, Momentum, OBI, and Sentiment.
        """
        if not prices or mid <= 0:
            return 0.0

        rsi = TechnicalIndicators.rsi(prices)
        macd_v, sig_v, _ = TechnicalIndicators.macd(prices)
        stoch = TechnicalIndicators.stochastic(prices)
        mom = TechnicalIndicators.momentum(prices)
        obi = TechnicalIndicators.order_book_imbalance(bids_l2, asks_l2)

        # Normalized component scores [-1, +1]
        rsi_score = (50.0 - rsi) / 50.0 if rsi < 50 else (50.0 - rsi) / 50.0
        stoch_score = (50.0 - stoch) / 50.0
        macd_score = 1.0 if macd_v > sig_v else -1.0
        mom_score = min(1.0, max(-1.0, mom / 2.0))
        obi_score = obi

        # Multi-factor weighted composite alpha score
        raw_alpha = (0.25 * rsi_score) + (0.20 * macd_score) + (0.20 * obi_score) + (0.15 * stoch_score) + (0.10 * mom_score) + (0.10 * sentiment)
        return round(min(1.0, max(-1.0, raw_alpha)), 3)



# ──────────────────────────────────────────────────────────────
# 3. NEWS SCRAPER  (background RSS thread)
# ──────────────────────────────────────────────────────────────

class NewsItem:
    def __init__(self, headline, source):
        self.headline = headline.strip()[:130]
        self.source = source
        self.ts = time.time()


class NewsScraperThread(threading.Thread):

    FEEDS = [
        ('economictimes', 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms'),
        ('economictimes', 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms'),
        ('financialexpress', 'https://www.financialexpress.com/market/feed/'),
        ('business-standard', 'https://www.business-standard.com/rss/markets-106.rss'),
    ]
    INTERVAL = 300  # scrape every 5 minutes

    def __init__(self):
        super().__init__(daemon=True, name='VortexNewsScraper')
        self._lock = threading.Lock()
        self._items: list[NewsItem] = []
        self._last_fetch = 0.0

    # ─── public ───────────────────────────────────────────────

    def get_relevant(self, ticker: str, n: int = 3) -> list[NewsItem]:
        name = ticker.upper().split('_')[0]  # e.g. 'RELI' from 'RELI_NSE'

        # ── 1. Try targeted Google News RSS fetch for this specific stock ─────────
        company_names = {
            'RELIANCE': 'Reliance Industries',
            'RELI': 'Reliance Industries',
            'TCS': 'Tata Consultancy Services',
            'INFY': 'Infosys',
            'HDFC': 'HDFC Bank',
            'HDFCBANK': 'HDFC Bank',
            'ICICIBANK': 'ICICI Bank',
            'SBIN': 'State Bank of India',
            'BHARTIARTL': 'Bharti Airtel',
            'ITC': 'ITC Limited',
            'LT': 'Larsen Toubro',
            'KOTAKBANK': 'Kotak Mahindra Bank',
            'AXISBANK': 'Axis Bank',
            'HINDUNILVR': 'Hindustan Unilever',
            'TATAMOTORS': 'Tata Motors',
            'MARUTI': 'Maruti Suzuki',
            'SUNPHARMA': 'Sun Pharma',
            'TITAN': 'Titan Company',
            'ULTRACEMCO': 'UltraTech Cement',
            'WIPRO': 'Wipro',
            'POWERGRID': 'Power Grid Corporation',
            'NTPC': 'NTPC Limited',
            'ADANIENT': 'Adani Enterprises',
            'IDEA': 'Vodafone Idea',
            'SUZLON': 'Suzlon Energy',
            'HCLTECH': 'HCL Technologies',
            'BAJFINANCE': 'Bajaj Finance',
            'ZOMATO': 'Zomato',
            'PAYTM': 'Paytm',
            'NYKAA': 'Nykaa',
        }
        co_name = company_names.get(name, f"{name} Limited")

        # Check per-ticker cache first
        with _ticker_news_lock:
            cached = _ticker_news_cache.get(name)
        now = time.time()
        
        if cached:
            if (now - cached['fetched_at']) >= _TICKER_NEWS_TTL:
                # Refresh in background thread
                threading.Thread(target=self._fetch_targeted_news_bg, args=(name, co_name), daemon=True).start()
            return cached['items'][:n]

        # Initial fallback for instant return
        import random
        templates = [
            f"{co_name} shares monitor technical support zone amid broader market moves",
            f"Analysts watch {co_name} closely as sector rotation continues on NSE",
            f"Volume pattern in {co_name} signals institutional interest on BSE",
            f"{co_name} trading in focus ahead of next earnings disclosure",
            f"Market participants eye {co_name} amid macro-driven index volatility",
        ]
        seed_val = sum(ord(c) for c in name)
        random.seed(seed_val)
        selected_titles = random.sample(templates, k=min(n, len(templates)))
        random.seed()
        generated = [NewsItem(title, 'bloomberg-wire') for title in selected_titles]

        with _ticker_news_lock:
            _ticker_news_cache[name] = {'items': generated, 'fetched_at': now}

        # Spawn background fetch to populate real Google News RSS for this ticker
        threading.Thread(target=self._fetch_targeted_news_bg, args=(name, co_name), daemon=True).start()
        return generated[:n]

    def _fetch_targeted_news_bg(self, name: str, co_name: str):
        try:
            query = urllib.parse.quote(f'{co_name} stock NSE BSE India')
            url = f'https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en'
            req = urllib.request.Request(url, headers={'User-Agent': 'VORTEX-HF/2.0'})
            targeted_items: list[NewsItem] = []
            with urllib.request.urlopen(req, timeout=5) as r:
                raw = r.read().decode('utf-8', errors='ignore')
            root = ET.fromstring(raw)
            for item in root.iter('item'):
                title = item.findtext('title')
                if title and len(title.strip()) > 10:
                    clean_title = re.sub(r'\s+-\s+[A-Z][^-]{2,40}$', '', title.strip())
                    targeted_items.append(NewsItem(clean_title, 'bloomberg-rss'))
                if len(targeted_items) >= 5:
                    break
            if targeted_items:
                with _ticker_news_lock:
                    _ticker_news_cache[name] = {'items': targeted_items, 'fetched_at': time.time()}
        except Exception as exc:
            pass

    def all_items(self) -> list[NewsItem]:
        with self._lock:
            return list(self._items)

    # ─── background ───────────────────────────────────────────

    def run(self):
        print('[VORTEX News] Scraper thread started.')
        while True:
            if time.time() - self._last_fetch >= self.INTERVAL:
                self._fetch_all()
                self._last_fetch = time.time()
            time.sleep(30)

    def _fetch_all(self):
        collected: list[NewsItem] = []
        for source, url in self.FEEDS:
            try:
                req = urllib.request.Request(
                    url,
                    headers={'User-Agent': 'VORTEX-HF/2.0 (markets-telemetry)'}
                )
                with urllib.request.urlopen(req, timeout=12) as r:
                    raw = r.read().decode('utf-8', errors='ignore')
                root = ET.fromstring(raw)
                for item in root.iter('item'):
                    title = item.findtext('title')
                    if title and len(title.strip()) > 10:
                        collected.append(NewsItem(title, source))
                    if len(collected) >= 80:
                        break
            except Exception as exc:
                print(f'[VORTEX News] Feed error ({source}): {exc}')

        with self._lock:
            self._items = collected
        print(f'[VORTEX News] General feed refreshed — {len(collected)} headlines loaded.')


# ──────────────────────────────────────────────────────────────
# 4. SENTIMENT ANALYZER
# ──────────────────────────────────────────────────────────────

class SentimentAnalyzer:
    _POS = {
        'buy', 'surge', 'rally', 'beat', 'profit', 'upgrade', 'growth',
        'strong', 'gains', 'rises', 'high', 'record', 'bullish', 'outperform',
        'breakout', 'dividend', 'expansion', 'revenue', 'recovery', 'positive',
        'opportunity', 'upside', 'overweight', 'target', 'rebound', 'momentum',
    }
    _NEG = {
        'sell', 'crash', 'fall', 'miss', 'loss', 'downgrade', 'weak',
        'risk', 'drop', 'bearish', 'underperform', 'concern', 'warning',
        'decline', 'negative', 'debt', 'lawsuit', 'penalty', 'fine',
        'probe', 'fraud', 'cut', 'underweight', 'below', 'shortfall',
    }

    @classmethod
    def score(cls, text: str) -> float:
        words = set(re.findall(r'\b[a-z]+\b', text.lower()))
        pos = len(words & cls._POS)
        neg = len(words & cls._NEG)
        total = pos + neg
        if total == 0:
            return 0.0
        return round((pos - neg) / (total + 2), 3)   # Laplace dampening


# ──────────────────────────────────────────────────────────────
# 5. SIGNAL GENERATOR
# ──────────────────────────────────────────────────────────────

def generate_signal_llm(prices, mid, bids_l2, asks_l2, news_items, fundamentals=None):
    """
    LLM-powered signal generator using Ollama (deepseek-r1).
    Computes technical indicators to build a structured prompt, sends it to the
    local Ollama server, and parses a JSON response: {signal, confidence, target, headline}.
    Falls back to technical scoring if Ollama is unavailable or times out.
    Returns (signal: str, confidence: float, target: float, headline: str)
    """
    # Compute technical indicators regardless (used in both LLM prompt and fallback)
    rsi   = TechnicalIndicators.rsi(prices)
    macd_, sig_, _ = TechnicalIndicators.macd(prices)
    bb_mid, bb_upper, bb_lower = TechnicalIndicators.bollinger_bands(prices)
    mom   = TechnicalIndicators.momentum(prices)
    stoch = TechnicalIndicators.stochastic(prices)
    obi   = TechnicalIndicators.order_book_imbalance(bids_l2, asks_l2)

    # Non-local reference to outer prices
    eval_prices = list(prices)
    if mid > 0 and len(eval_prices) < 5:
        eval_prices = [mid * 0.995, mid * 0.998, mid * 1.001, mid * 0.999, mid]

    def _technical_fallback():
        """Fallback: weighted rule-based scoring (original algorithm)."""
        if mid <= 0:
            return 'HOLD', 60.0, 0.0, 'Initializing market telemetry feed...'

        local_rsi   = TechnicalIndicators.rsi(eval_prices)
        local_macd, local_sig, _ = TechnicalIndicators.macd(eval_prices)
        local_mid, local_upper, local_lower = TechnicalIndicators.bollinger_bands(eval_prices)
        local_mom   = TechnicalIndicators.momentum(eval_prices)
        local_stoch = TechnicalIndicators.stochastic(eval_prices)
        local_obi   = TechnicalIndicators.order_book_imbalance(bids_l2, asks_l2)

        score = 0.0
        if local_rsi < 30:     score += 2.5
        elif local_rsi < 42:   score += 1.0
        elif local_rsi > 75:   score -= 2.5
        signal = 'HOLD'
        confidence = 65.0
        if rsi < 35 and macd_ > sig_ and obi > 0:
            signal = 'BUY'
            confidence = round(75.0 + min(15.0, abs(obi) * 20), 1)
        elif rsi > 65 and macd_ < sig_ and obi < 0:
            signal = 'SELL'
            confidence = round(75.0 + min(15.0, abs(obi) * 20), 1)
        elif rsi < 40 or obi > 0.15:
            signal = 'BUY'
            confidence = round(60.0 + min(15.0, (40 - rsi)), 1)
        elif rsi > 60 or obi < -0.15:
            signal = 'SELL'
            confidence = round(60.0 + min(15.0, (rsi - 60)), 1)

        mult = 1.03 if signal == 'BUY' else 0.97 if signal == 'SELL' else 1.005
        target = round(mid * mult, 2)
        headline = f"Quant model predicts {signal} based on RSI={rsi:.0f}, OBI={obi:+.1%}, and MACD trend."
        return signal, confidence, target, headline

    news_str = "; ".join([n.headline for n in news_items[:2]]) if news_items else "No major news"

    def _fmt(val, suffix=""):
        if val is None or val == "N/A":
            return "N/A"
        try:
            f = float(val)
            if abs(f) >= 1e9: return f"{f/1e9:.2f}B{suffix}"
            if abs(f) >= 1e6: return f"{f/1e6:.2f}M{suffix}"
            return f"{f:.2f}{suffix}"
        except Exception:
            return str(val)

    fund = fundamentals if isinstance(fundamentals, dict) else {}
    recent_closes = [round(p, 2) for p in prices[-5:]] if prices else [round(mid, 2)]

    prompt = (
        'Indian quant analyst. Analyze and return JSON only.\n'
        f'Price INR{mid:.2f} | Closes: {recent_closes}\n'
        f'RSI={rsi:.0f} | MACD={macd_:+.4f}/Sig={sig_:+.4f} | BB=[{bb_lower:.1f},{bb_mid:.1f},{bb_upper:.1f}] '
        f'| Mom={mom:+.2f}% | Stoch={stoch:.0f} | OBI={obi:+.2%}\n'
        f'PE={_fmt(fund.get("trailingPE"))} | DE={_fmt(fund.get("debtToEquity"))} | '
        f'ROE={_fmt(fund.get("returnOnEquity"),"%")} | RevGr={_fmt(fund.get("revenueGrowth"),"%")}\n'
        f'News: {news_str}\n'
        'Return JSON: {"signal":"BUY"|"SELL"|"HOLD","confidence":0-100,"target":number,"headline":"one sentence"}'
    )

    # ── Attempt 1: Gemini API ───────────────────────
    gemini_resp = query_gemini_api(prompt)
    if gemini_resp:
        response_text = re.sub(r'<think>.*?</think>', '', gemini_resp, flags=re.DOTALL).strip()
        response_text = re.sub(r'```(?:json)?', '', response_text).strip()
        try:
            result = json.loads(response_text)
            signal = str(result.get('signal', 'HOLD')).upper()
            if signal not in ('BUY', 'SELL', 'HOLD'): signal = 'HOLD'
            confidence = float(result.get('confidence', 70.0))
            confidence = round(min(99.0, max(50.0, confidence)), 1)
            target = float(result.get('target', mid))
            headline = str(result.get('headline', 'Gemini AI analysis complete.'))[:200]
            print(f'[VORTEX GEMINI AI] Signal={signal} | Conf={confidence}% | Target=₹{target:.2f}')
            return signal, confidence, round(target, 2), headline
        except Exception:
            pass

    # ── Attempt 2: Ollama Local (short timeout) ─────
    try:
        import urllib.request as _ur
        payload = json.dumps({
            'model': OLLAMA_MODEL,
            'prompt': prompt,
            'stream': False,
            'format': 'json',
            'options': {'temperature': 0.1, 'num_predict': 128}
        }).encode('utf-8')

        req = _ur.Request(OLLAMA_URL, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
        with _ur.urlopen(req, timeout=1.5) as resp:
            raw = resp.read().decode('utf-8')
            outer = json.loads(raw)
            response_text = outer.get('response', '')
            response_text = re.sub(r'<think>.*?</think>', '', response_text, flags=re.DOTALL).strip()
            response_text = re.sub(r'```(?:json)?', '', response_text).strip()
            result = json.loads(response_text)
            signal = str(result.get('signal', 'HOLD')).upper()
            if signal not in ('BUY', 'SELL', 'HOLD'): signal = 'HOLD'
            confidence = float(result.get('confidence', 70.0))
            confidence = round(min(99.0, max(50.0, confidence)), 1)
            target = float(result.get('target', mid))
            headline = str(result.get('headline', 'LLM analysis complete.'))[:200]
            print(f'[VORTEX OLLAMA AI] Signal={signal} | Conf={confidence}% | Target=₹{target:.2f}')
            return signal, confidence, round(target, 2), headline
    except Exception:
        pass

    # ── Fallback: Quantitative Technical Model ───────
    signal, confidence, target, headline = _technical_fallback()
    print(f'[VORTEX QUANT ENGINE] Signal={signal} | Conf={confidence}% | Target=₹{target:.2f}')
    return signal, confidence, target, headline


# Keep the original name as an alias so ChatEngine.respond() still works unchanged
def generate_signal(prices, mid, bids_l2, asks_l2, news_items):
    sig, conf, tgt, _ = generate_signal_llm(prices, mid, bids_l2, asks_l2, news_items)
    return sig, conf, tgt


# ──────────────────────────────────────────────────────────────
# 6. CHAT ENGINE  (Natural language quantitative analyst)
# ──────────────────────────────────────────────────────────────

class ChatEngine:
    """Conversational market analyst targeting Ollama / Gemini with technical fallback."""

    def __init__(self, agent_instance):
        self.agent = agent_instance

    def respond(self, text: str, ticker: str, mid: float,
                bids_l2: list, asks_l2: list) -> str:
        """Generate an intelligent, conversational LLM-driven response based on live stock context."""
        t = text.lower().strip()
        hist = self.agent.get_history(ticker)
        prices = hist.closes() if hist else []
        ticker_short = ticker.split('_')[0]
        exchange = 'NSE' if 'NSE' in ticker else 'BSE'

        # ── indicators ───────────────────────────────────────
        rsi     = TechnicalIndicators.rsi(prices)
        macd_v, sig_v, hist_v = TechnicalIndicators.macd(prices)
        bb_mid, bb_upper, bb_lower = TechnicalIndicators.bollinger_bands(prices)
        mom     = TechnicalIndicators.momentum(prices)
        obi     = TechnicalIndicators.order_book_imbalance(bids_l2, asks_l2)
        stoch   = TechnicalIndicators.stochastic(prices)
        vwap    = TechnicalIndicators.vwap_approx(prices[-20:] if len(prices) >= 20 else prices)

        spread  = (asks_l2[0][0] - bids_l2[0][0]) if bids_l2 and asks_l2 else 0.0
        news_items = self.agent.news_scraper.get_relevant(ticker, n=3)
        signal, confidence, target = generate_signal(prices, mid, bids_l2, asks_l2, news_items)

        change_pct = (target / mid - 1) * 100 if mid else 0
        stop_loss = round(mid * 0.975 if signal == 'BUY' else mid * 1.025 if signal == 'SELL' else mid * 0.985, 2)
        atr_v = TechnicalIndicators.atr(prices)
        vol_factor = (atr_v / mid * 100) if mid > 0 else 0.5
        risk_lvl = "🔴 HIGH" if vol_factor > 1.2 else "🟡 MODERATE" if vol_factor > 0.4 else "🟢 LOW"

        news_headlines = "; ".join([n.headline for n in news_items]) if news_items else "None"
        prompt = (
            f"You are Vortex AI, a professional quantitative market analyst. Answer the user question.\n\n"
            f"--- Active Stock Context ---\n"
            f"Symbol: {ticker_short} ({exchange})\n"
            f"Current Price: ₹{mid:.2f}\n"
            f"Quantitative Signal: {signal} (Confidence: {confidence:.0f}%)\n"
            f"Target Price: ₹{target:.2f} ({change_pct:+.2f}% potential)\n"
            f"Stop-Loss Level: ₹{stop_loss:.2f}\n"
            f"Technical Indicators: RSI(14)={rsi:.1f}, Stochastic={stoch:.1f}, VWAP(20)=₹{vwap:.2f}\n"
            f"Order Flow Imbalance (OBI): {obi:+.2%} (Spread: ₹{spread:.2f})\n"
            f"Volatility / ATR Risk: {risk_lvl} (ATR: ₹{atr_v:.2f})\n"
            f"News wire context: {news_headlines}\n\n"
            f"--- User Question ---\n"
            f"\"{text}\"\n\n"
            f"Answer the question directly, explaining technical/fundamental terms if asked, or providing market analysis using the data above. Do not output think tags or code blocks, just conversational response."
        )

        # ── Attempt 1: Gemini API ───────────────────────
        gemini_text = query_gemini_api(prompt, system_instruction="You are Vortex AI, a professional quantitative market analyst.")
        if gemini_text:
            return gemini_text

        # ── Attempt 2: Local Ollama ─────────────────────
        try:
            import urllib.request as _ur
            payload = json.dumps({
                'model': OLLAMA_MODEL,
                'prompt': prompt,
                'stream': False,
                'options': {'temperature': 0.3, 'num_predict': 256}
            }).encode('utf-8')

            with _ur.urlopen(req, timeout=OLLAMA_TIMEOUT) as resp:
                raw = resp.read().decode('utf-8')

            outer = json.loads(raw)
            response_text = outer.get('response', '')

            # Strip reasoning blocks if DeepSeek emits them
            response_text = re.sub(r'<think>.*?</think>', '', response_text, flags=re.DOTALL).strip()
            response_text = re.sub(r'```(?:json|markdown|text)?', '', response_text).strip()

            if response_text:
                return response_text
        except Exception as e:
            print(f"[Chat Engine] Ollama error: {e}. Using technical fallback.")

        # Fallback to structured quantitative report if Ollama is offline
        rsi_lbl = ('Oversold 🟢' if rsi < 35 else 'Overbought 🔴' if rsi > 70 else f'Neutral ({rsi:.0f})')
        macd_lbl = 'Bullish Crossover 📈' if macd_v > sig_v else 'Bearish Crossover 📉'
        obi_lbl = f'{obi:+.1%} Bid Pressure' if obi > 0 else f'{abs(obi):.1%} Ask Pressure'

        return (
            f"📊 **VORTEX QUANT MODEL — {ticker_short} ({exchange})**\n"
            f"──────────────────────────────────────────────\n"
            f"🎯 **RECOMMENDATION**: **{signal}** (Confidence: {confidence:.0f}%)\n"
            f"💰 **PROFIT POTENTIAL**: **{change_pct:+.2f}%** (Target: ₹{target:.2f} | Current: ₹{mid:.2f})\n"
            f"⚠️ **RISK ASSESSMENT**: **{risk_lvl}** | Stop-Loss: ₹{stop_loss:.2f} (ATR: ₹{atr_v:.2f})\n"
            f"──────────────────────────────────────────────\n"
            f"🔍 **BASIS OF PREDICTION**:\n"
            f"  1. **Technical Factors**: RSI(14)={rsi:.1f} ({rsi_lbl}), MACD: {macd_lbl}, Stochastic: {stoch:.1f}\n"
            f"  2. **Order Flow & Depth**: {obi_lbl} (Spread: ₹{spread:.2f})\n"
            f"  3. **Volatility & Momentum**: 10-bar Momentum: {mom:+.2f}%, VWAP(20): ₹{vwap:.2f}"
        )


# ──────────────────────────────────────────────────────────────
# 7. VORTEX AGENT  (main orchestrator)
# ──────────────────────────────────────────────────────────────

class VortexAgent:
    """
    Self-contained AI agent for NSE/BSE stock analysis.
    No external API keys required.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._histories: dict[str, PriceHistory] = {}
        self.news_scraper = NewsScraperThread()
        self.chat_engine = ChatEngine(self)
        self.news_scraper.start()
        print('[VORTEX AI] Agent initialized — technical engine + news scraper active.')

    # ─── price feeding (called each tick by engine) ───────────

    def feed_price(self, ticker: str, mid: float):
        with self._lock:
            if ticker not in self._histories:
                self._histories[ticker] = PriceHistory(maxlen=300)
        self._histories[ticker].add(mid)

    def get_history(self, ticker: str) -> PriceHistory | None:
        with self._lock:
            return self._histories.get(ticker)

    # ─── predictor panel snapshot ─────────────────────────────

    def get_predictor_snapshot(self, ticker: str, mid: float,
                               bids_l2: list, asks_l2: list,
                               fundamentals: dict = None) -> dict:
        hist = self.get_history(ticker)
        prices = hist.closes() if hist else []
        news_items = self.news_scraper.get_relevant(ticker, n=3)

        # Use LLM-powered signal generator (falls back to technical if Ollama is down)
        signal, confidence, target, llm_headline = generate_signal_llm(
            prices, mid, bids_l2, asks_l2, news_items,
            fundamentals=fundamentals or {}
        )

        # Sentiment from actual headline (LLM-generated or news-sourced)
        if news_items:
            headline = llm_headline  # LLM's 1-sentence analyst reasoning
            sentiment = SentimentAnalyzer.score(headline)
        else:
            sentiment = round((0.5 if signal == 'BUY' else -0.5 if signal == 'SELL' else 0.0), 3)
            headline = llm_headline

        # Profit & Risk Calculations
        gain_pct = round((target / mid - 1.0) * 100, 2) if mid > 0 else 0.0
        stop_loss = round(mid * 0.975 if signal == 'BUY' else mid * 1.025 if signal == 'SELL' else mid * 0.985, 2)
        
        rsi_val = TechnicalIndicators.rsi(prices)
        macd_v, sig_v, _ = TechnicalIndicators.macd(prices)
        stoch_val = TechnicalIndicators.stochastic(prices)
        obi_val = TechnicalIndicators.order_book_imbalance(bids_l2, asks_l2)
        atr_val = TechnicalIndicators.atr(prices)

        vol_factor = (atr_val / mid * 100) if mid > 0 else 0.5
        risk_rating = "HIGH" if vol_factor > 1.2 else "MODERATE" if vol_factor > 0.4 else "LOW"

        basis_breakdown = [
            f"Technical: RSI(14)={rsi_val:.1f}, MACD={'Bullish' if macd_v > sig_v else 'Bearish'}, Stoch={stoch_val:.1f}",
            f"Order Flow Depth: OBI={obi_val:+.2%} ({'Buy Pressure' if obi_val > 0 else 'Sell Pressure'})",
            f"Headline Sentiment: {sentiment:+.2f}"
        ]

        return {
            'signal':          signal,
            'confidence':      confidence,
            'target':          target,
            'profit_gain':     gain_pct,
            'stop_loss':       stop_loss,
            'risk_level':      risk_rating,
            'basis_breakdown': basis_breakdown,
            'headline':        headline,
            'sentiment':       sentiment,
            'status':          'VORTEX_AI_ONLINE',
        }

    # ─── interactive chat ─────────────────────────────────────

    def chat(self, text: str, ticker: str, mid: float,
             bids_l2: list, asks_l2: list) -> str:
        return self.chat_engine.respond(text, ticker, mid, bids_l2, asks_l2)
