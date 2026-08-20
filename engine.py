import socket
import struct
import time
import threading
import multiprocessing
import hashlib
import base64
import math
import json
import http.server
import socketserver
import os
import urllib.request
import urllib.parse
import datetime

# ── yfinance fundamental data cache ──────────────────────────────────────────
# Format: { y_symbol: {'data': {...}, 'fetched_at': float} }
_fundamentals_cache: dict = {}
_fundamentals_lock = threading.Lock()
_FUNDAMENTALS_TTL = 900  # 15 minutes

def _fetch_fundamentals_bg(y_symbol: str):
    """Background worker: fetches yfinance .info for y_symbol and caches it."""
    try:
        import yfinance as yf
        ticker_obj = yf.Ticker(y_symbol)
        info = ticker_obj.info or {}
        fundamentals = {
            'trailingPE':    info.get('trailingPE'),
            'debtToEquity':  info.get('debtToEquity'),
            'freeCashflow':  info.get('freeCashflow'),
            'revenueGrowth': info.get('revenueGrowth'),
            'returnOnEquity': info.get('returnOnEquity'),
            'marketCap':     info.get('marketCap'),
            'longName':      info.get('longName') or info.get('shortName'),
        }
        with _fundamentals_lock:
            _fundamentals_cache[y_symbol] = {
                'data': fundamentals,
                'fetched_at': time.time()
            }
        print(f"[Fundamentals] Cached {y_symbol}: PE={fundamentals.get('trailingPE')}, MCap={fundamentals.get('marketCap')}")
    except Exception as exc:
        print(f"[Fundamentals] Failed for {y_symbol}: {exc}")

def get_fundamentals(y_symbol: str) -> dict:
    """Returns cached fundamentals for y_symbol; triggers a background refresh if stale/missing."""
    with _fundamentals_lock:
        cached = _fundamentals_cache.get(y_symbol)
    now = time.time()
    if cached is None or (now - cached['fetched_at']) > _FUNDAMENTALS_TTL:
        # Fire-and-forget refresh thread
        t = threading.Thread(target=_fetch_fundamentals_bg, args=(y_symbol,), daemon=True)
        t.start()
    if cached:
        return cached['data']
    return {}


# Helper converter from simulated ticker to Yahoo Finance Symbol
def get_yahoo_symbol(ticker_str):
    ticker_str = ticker_str.strip()
    if '_' not in ticker_str:
        return None
    base, exch = ticker_str.split('_', 1)
    
    # Custom mapping exceptions
    if base == 'RELI':
        base = 'RELIANCE'
    elif base == 'HDFC':
        base = 'HDFCBANK'
    elif base == 'TATAMOTORS':
        base = 'TMCV'
        
    suffix = '.NS' if exch == 'NSE' else '.BO'
    return f"{base}{suffix}"

# Telemetry Manager (thread-safe quotes and connection latency tracker)
class TelemetryManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.total_packets = 0
        self.recent_latencies = []
        self.max_history = 20000

        self.pps_time = time.time()
        self.packet_count_since_reset = 0
        self.current_pps = 0.0

        # AI Agent state variables
        self.ai_agent_status = "VORTEX_AI_ONLINE"
        self.ai_agent_news = "VORTEX AI initializing technical analysis engine..."
        self.ai_agent_sentiment = 0.0
        self.ai_agent_confidence = 70.0
        self.ai_agent_target = 0.0
        self.ai_agent_rec = "HOLD"
        self.ai_agent_loss = 0.05

        # Self-contained AI Agent
        from agent import VortexAgent
        self.vortex_agent = VortexAgent()

        # Quotes dictionary populated dynamically
        self.books = {
            t: {'price': 0.0, 'prev_close': 0.0, 'open': 0.0, 'high': 0.0, 'low': 0.0, 'volume': 0, 'high_52w': 0.0, 'low_52w': 0.0, 'ohlc': [], 'candles': []}
            for t in [
                'RELI_NSE', 'RELI_BSE', 'TCS_NSE', 'TCS_BSE', 'INFY_NSE', 'INFY_BSE', 
                'HDFC_NSE', 'HDFC_BSE', 'ICICIBANK_NSE', 'ICICIBANK_BSE', 'SBIN_NSE', 'SBIN_BSE', 
                'BHARTIARTL_NSE', 'BHARTIARTL_BSE', 'ITC_NSE', 'ITC_BSE', 'LT_NSE', 'LT_BSE', 
                'KOTAKBANK_NSE', 'KOTAKBANK_BSE', 'AXISBANK_NSE', 'AXISBANK_BSE', 'HINDUNILVR_NSE', 'HINDUNILVR_BSE', 
                'TATAMOTORS_NSE', 'TATAMOTORS_BSE', 'MARUTI_NSE', 'MARUTI_BSE', 'SUNPHARMA_NSE', 'SUNPHARMA_BSE', 
                'TITAN_NSE', 'TITAN_BSE', 'ULTRACEMCO_NSE', 'ULTRACEMCO_BSE', 'WIPRO_NSE', 'WIPRO_BSE', 
                'POWERGRID_NSE', 'POWERGRID_BSE', 'NTPC_NSE', 'NTPC_BSE', 'ADANIENT_NSE', 'ADANIENT_BSE'
            ]
        }
        
        self.recent_trades = []
        self.active_ticker = "TCS_NSE"

    def update_stock_quote(self, ticker, quote_data):
        with self.lock:
            self.books[ticker] = quote_data

    def set_recent_trades(self, trades):
        with self.lock:
            self.recent_trades = trades

    def record_query_latency(self, latency_us, data_points_count):
        with self.lock:
            self.total_packets += 1
            self.packet_count_since_reset += data_points_count
            self.recent_latencies.append(latency_us)
            if len(self.recent_latencies) > self.max_history:
                self.recent_latencies = self.recent_latencies[-self.max_history:]

    def calculate_percentile(self, sorted_data, pct):
        if not sorted_data:
            return 0.0
        k = (len(sorted_data) - 1) * pct
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            return sorted_data[int(k)]
        return sorted_data[int(f)] * (c - k) + sorted_data[int(c)] * (k - f)

    def get_screener_data(self) -> list:
        items = []
        with self.lock:
            books = dict(self.books)
        from agent import TechnicalIndicators
        for t, q in books.items():
            if isinstance(q, dict) and q.get('price', 0) > 0:
                price = q.get('price', 0)
                prev = q.get('prev_close', price)
                chg = price - prev
                chg_pct = (chg / prev * 100) if prev else 0
                prices = q.get('ohlc', [])
                rsi = TechnicalIndicators.rsi(prices)
                bids = q.get('bids_l2', [])
                asks = q.get('asks_l2', [])
                qs = TechnicalIndicators.quant_score(prices, price, bids, asks)
                
                sig = "BUY" if qs > 0.25 else "SELL" if qs < -0.25 else "HOLD"
                items.append({
                    'ticker': t,
                    'name': q.get('long_name', t),
                    'price': price,
                    'prev_close': prev,
                    'change_pct': round(chg_pct, 2),
                    'rsi': rsi,
                    'quant_score': qs,
                    'recommendation': sig,
                    'signal': sig,
                    'volume': q.get('volume', 0),
                    'target': round(price * (1 + (qs * 0.08)), 2),
                    'confidence': min(98.0, max(60.0, 70.0 + abs(qs * 25)))
                })
        return items

    def get_snapshot(self):
        screener_data = self.get_screener_data()
        with self.lock:
            lats = list(self.recent_latencies)
            trades = list(self.recent_trades)
            total = self.total_packets
            book_snapshots = dict(self.books)
                
            now = time.time()
            elapsed = now - self.pps_time
            if elapsed >= 3.0:
                self.current_pps = self.packet_count_since_reset / elapsed
                self.packet_count_since_reset = 0
                self.pps_time = now
            pps = self.current_pps

            # Fetch targeted stock news items for the active ticker
            active = getattr(self, 'active_ticker', 'RELI_NSE')
            stock_news_items = self.vortex_agent.news_scraper.get_relevant(active, n=5)
            stock_news = [{
                'headline': item.headline,
                'source': item.source,
                'ts': item.ts
            } for item in stock_news_items]

            all_news_items = self.vortex_agent.news_scraper.all_items()
            if not all_news_items:
                all_news_items = stock_news_items
            all_news = [{
                'headline': item.headline,
                'source': item.source,
                'ts': item.ts,
                'ticker': active
            } for item in all_news_items]

            ai_data = {
                'status': self.ai_agent_status,
                'news_headline': self.ai_agent_news,
                'sentiment': self.ai_agent_sentiment,
                'confidence': self.ai_agent_confidence,
                'target_price': self.ai_agent_target,
                'recommendation': self.ai_agent_rec,
                'training_loss': self.ai_agent_loss
            }

        histogram = [0] * 6
        if lats:
            sorted_lats = sorted(lats)
            p50 = self.calculate_percentile(sorted_lats, 0.50)
            p90 = self.calculate_percentile(sorted_lats, 0.90)
            p99 = self.calculate_percentile(sorted_lats, 0.99)
            avg = sum(sorted_lats) / len(sorted_lats)
            max_lat = sorted_lats[-1]
            min_lat = sorted_lats[0]
            
            for lat in sorted_lats:
                lat_ms = lat / 1000.0
                if lat_ms < 100.0:
                    histogram[0] += 1
                elif lat_ms < 200.0:
                    histogram[1] += 1
                elif lat_ms < 300.0:
                    histogram[2] += 1
                elif lat_ms < 400.0:
                    histogram[3] += 1
                elif lat_ms < 500.0:
                    histogram[4] += 1
                else:
                    histogram[5] += 1
        else:
            p50 = p90 = p99 = avg = max_lat = min_lat = 0.0

        return {
            'total_packets': total,
            'pps': pps,
            'latency': {
                'avg': avg,
                'p50': p50,
                'p90': p90,
                'p99': p99,
                'max': max_lat,
                'min': min_lat
            },
            'histogram': histogram,
            'books': book_snapshots,
            'recent_trades': trades,
            'ai_agent': ai_data,
            'news': all_news,
            'stock_news': stock_news,
            'screener': screener_data
        }

def choice_excluding(lst, exclude):
    filtered = [x for x in lst if x != exclude]
    if not filtered:
        return None
    import random
    return random.choice(filtered)

def fetch_single_ticker(ticker, telemetry_mgr, active):
    y_symbol = get_yahoo_symbol(ticker)
    if not y_symbol:
        return
        
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{y_symbol}?interval=1m&range=1d"
    start_time = time.time_ns()
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req, timeout=4) as response:
            payload = response.read()
            recv_time = time.time_ns()
            latency_us = (recv_time - start_time) / 1000.0
            
            data = json.loads(payload.decode('utf-8'))
            result = data['chart']['result'][0]
            meta = result['meta']
            
            price = meta.get('regularMarketPrice')
            
            timestamps = result.get('timestamp') or []
            indicators = result.get('indicators', {}).get('quote', [{}])[0]
            closes = indicators.get('close') or []
            volumes = indicators.get('volume') or []
            opens = indicators.get('open') or []
            highs = indicators.get('high') or []
            lows = indicators.get('low') or []
            
            # If price is missing or None, resolve from closes history or previous close
            if not price:
                valid_closes = [c for c in closes if c is not None]
                if valid_closes:
                    price = valid_closes[-1]
            price = price or meta.get('previousClose') or meta.get('chartPreviousClose') or 0.0
            
            prev_close = meta.get('previousClose') or meta.get('chartPreviousClose') or price
            
            valid_trades = []
            candles = []
            for i in range(len(timestamps)):
                if i < len(closes) and closes[i] is not None and i < len(volumes):
                    valid_trades.append((timestamps[i], closes[i], volumes[i]))
                    candles.append({
                        'open': opens[i] if (i < len(opens) and opens[i] is not None) else closes[i],
                        'high': highs[i] if (i < len(highs) and highs[i] is not None) else closes[i],
                        'low': lows[i] if (i < len(lows) and lows[i] is not None) else closes[i],
                        'close': closes[i],
                        'volume': volumes[i] if (i < len(volumes) and volumes[i] is not None) else 0
                    })
            
            # Increment processed packets by number of data points
            telemetry_mgr.record_query_latency(latency_us, len(timestamps) or 1)
            
            # Fetch fundamentals from cache (triggers background refresh if stale)
            fundamentals = get_fundamentals(y_symbol)
            
            # Resolve company long name from fundamentals > chart meta > fallback
            long_name = (
                fundamentals.get('longName') or
                meta.get('longName') or
                meta.get('shortName') or
                ticker
            )
            
            # Generate Level 2 Order Book Depth (top 5 bids/asks) around mid price
            import random
            step = max(0.05, round(price * 0.0005, 2))
            bids_l2 = []
            asks_l2 = []
            for k in range(1, 6):
                bid_p = round(price - (k * step), 2)
                ask_p = round(price + (k * step), 2)
                bid_q = random.randint(150, 2400)
                ask_q = random.randint(150, 2400)
                bids_l2.append((bid_p, bid_q))
                asks_l2.append((ask_p, ask_q))
            
            bid_vol = sum(q for _, q in bids_l2)
            ask_vol = sum(q for _, q in asks_l2)
            tot_vol = bid_vol + ask_vol
            obi = round((bid_vol - ask_vol) / tot_vol, 4) if tot_vol else 0.0
            spread = round(asks_l2[0][0] - bids_l2[0][0], 2)
            
            ohlc_prices = [c for c in closes if c is not None]
            from agent import TechnicalIndicators
            quant_score = TechnicalIndicators.quant_score(ohlc_prices, price, bids_l2, asks_l2)

            # Store in manager state
            telemetry_mgr.update_stock_quote(ticker, {
                'price': price,
                'prev_close': prev_close,
                'open': opens[0] if (opens and opens[0] is not None) else price,
                'high': meta.get('regularMarketDayHigh') or (max(highs) if highs else price),
                'low': meta.get('regularMarketDayLow') or (min(lows) if lows else price),
                'volume': meta.get('regularMarketVolume') or 0,
                'high_52w': meta.get('fiftyTwoWeekHigh') or price,
                'low_52w': meta.get('fiftyTwoWeekLow') or price,
                'long_name': long_name,
                'ohlc': ohlc_prices,
                'candles': candles[-40:],
                'fundamentals': fundamentals,
                'bids_l2': bids_l2,
                'asks_l2': asks_l2,
                'spread': spread,
                'obi': obi,
                'quant_score': quant_score
            })
            
            # Feed prices to AI Agent history immediately
            if price > 0:
                telemetry_mgr.vortex_agent.feed_price(ticker, price)
                for p in closes[-30:]:
                    if p is not None:
                        telemetry_mgr.vortex_agent.feed_price(ticker, p)
            
            # If this is the active ticker, update the recent trades list
            if ticker == active:
                formatted_trades = []
                for idx, (ts, p, qty) in enumerate(valid_trades[-15:]):
                    side = 'Buy'
                    if idx > 0 and p < valid_trades[-15:][idx-1][1]:
                        side = 'Sell'
                        
                    dt = datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).astimezone()
                    time_str = dt.strftime("%H:%M:%S")
                    
                    formatted_trades.append({
                        'time': time_str,
                        'ticker': ticker,
                        'price': p,
                        'qty': int(qty) if qty else 0,
                        'side': side,
                        'latency': latency_us
                    })
                telemetry_mgr.set_recent_trades(formatted_trades)
    except Exception as e:
        print(f"[Poller Error] Exception querying {ticker}: {e}")
        import traceback
        traceback.print_exc()

def market_data_poller(telemetry_mgr):
    """
    Queries Yahoo Finance for market data in parallel threads, updates rolling price logs and trades list.
    """
    import concurrent.futures
    monitored_tickers = [
        'RELI_NSE', 'RELI_BSE', 'TCS_NSE', 'TCS_BSE', 'INFY_NSE', 'INFY_BSE', 
        'HDFC_NSE', 'HDFC_BSE', 'ICICIBANK_NSE', 'ICICIBANK_BSE', 'SBIN_NSE', 'SBIN_BSE', 
        'BHARTIARTL_NSE', 'BHARTIARTL_BSE', 'ITC_NSE', 'ITC_BSE', 'LT_NSE', 'LT_BSE', 
        'KOTAKBANK_NSE', 'KOTAKBANK_BSE', 'AXISBANK_NSE', 'AXISBANK_BSE', 'HINDUNILVR_NSE', 'HINDUNILVR_BSE', 
        'TATAMOTORS_NSE', 'TATAMOTORS_BSE', 'MARUTI_NSE', 'MARUTI_BSE', 'SUNPHARMA_NSE', 'SUNPHARMA_BSE', 
        'TITAN_NSE', 'TITAN_BSE', 'ULTRACEMCO_NSE', 'ULTRACEMCO_BSE', 'WIPRO_NSE', 'WIPRO_BSE', 
        'POWERGRID_NSE', 'POWERGRID_BSE', 'NTPC_NSE', 'NTPC_BSE', 'ADANIENT_NSE', 'ADANIENT_BSE'
    ]
    
    last_query_time = {t: 0.0 for t in monitored_tickers}
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=5)
    
    while True:
        try:
            active = getattr(telemetry_mgr, 'active_ticker', 'RELI_NSE')
            
            if active not in monitored_tickers:
                monitored_tickers.append(active)
                last_query_time[active] = 0.0
                base = active.split('_')[0]
                counterpart = f"{base}_BSE" if active.endswith('_NSE') else f"{base}_NSE"
                if counterpart not in monitored_tickers:
                    monitored_tickers.append(counterpart)
                    last_query_time[counterpart] = 0.0
            
            # Put active ticker first
            tickers_to_query = [active]
            
            # Find up to 4 background tickers that haven't been queried for the longest time
            bg_candidates = [t for t in monitored_tickers if t != active]
            bg_candidates.sort(key=lambda t: last_query_time.get(t, 0.0))
            tickers_to_query.extend(bg_candidates[:4])
            
            # Query selected tickers in parallel worker threads
            futures = [executor.submit(fetch_single_ticker, t, telemetry_mgr, active) for t in tickers_to_query]
            
            for future in concurrent.futures.as_completed(futures):
                pass
                
            for t in tickers_to_query:
                last_query_time[t] = time.time()
                
            time.sleep(2.0)
        except Exception as e:
            print(f"[Market Poller] Exception in poller loop: {e}")
            time.sleep(2.0)

def run_ai_predictor_agent(telemetry_mgr):
    """
    Background loop: feeds live prices into VortexAgent and publishes
    LLM-generated signals (via Ollama deepseek-r1) + live news headlines
    to the predictor panel every 5 seconds.
    Falls back to technical scoring if Ollama is unavailable.
    """
    import time
    import random

    while True:
        try:
            agent = telemetry_mgr.vortex_agent

            # 1. Feed all live prices into the agent's rolling history
            with telemetry_mgr.lock:
                books_snapshot = dict(telemetry_mgr.books)

            for ticker, quote_data in books_snapshot.items():
                if not isinstance(quote_data, dict):
                    continue
                # Feed the price list
                prices = quote_data.get('ohlc', [])
                if prices:
                    hist = agent.get_history(ticker)
                    if not hist:
                        agent.feed_price(ticker, prices[0])
                        hist = agent.get_history(ticker)
                    if hist:
                        with agent._lock:
                            hist._buf.clear()
                            for p in prices[-300:]:
                                if p is not None:
                                    hist._buf.append(p)
                else:
                    mid = quote_data.get('price', 0)
                    if mid > 0:
                        agent.feed_price(ticker, mid)

            # 2. Pick the active/primary ticker for the panel snapshot
            with telemetry_mgr.lock:
                active = getattr(telemetry_mgr, 'active_ticker', 'RELI_NSE')

            quote_data = books_snapshot.get(active)
            if quote_data and isinstance(quote_data, dict):
                mid = quote_data.get('price', 0)
                fundamentals = quote_data.get('fundamentals', {})
                # Pass fundamentals to the LLM-powered predictor snapshot
                snap = agent.get_predictor_snapshot(active, mid, [], [], fundamentals=fundamentals)

                
                # 3. Update training loss (simulated convergence)
                loss_drift = (random.random() - 0.5) * 0.001
                with telemetry_mgr.lock:
                    telemetry_mgr.ai_agent_loss = max(0.003, min(0.12, telemetry_mgr.ai_agent_loss + loss_drift))
                    telemetry_mgr.ai_agent_status     = snap['status']
                    telemetry_mgr.ai_agent_news       = snap['headline']
                    telemetry_mgr.ai_agent_sentiment  = snap['sentiment']
                    telemetry_mgr.ai_agent_confidence = snap['confidence']
                    telemetry_mgr.ai_agent_rec        = snap['signal']
                    telemetry_mgr.ai_agent_target     = snap['target']

        except Exception as exc:
            print(f'[VORTEX Predictor] Error: {exc}')

        time.sleep(5)

def perform_ws_handshake(sock):
    request = sock.recv(4096).decode('utf-8', errors='ignore')
    if "Upgrade: websocket" not in request:
        return False
    ws_key = None
    for line in request.split("\r\n"):
        if line.startswith("Sec-WebSocket-Key:"):
            ws_key = line.split(":", 1)[1].strip()
            break
    if not ws_key:
        return False
    guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    accept_hash = base64.b64encode(hashlib.sha1((ws_key + guid).encode('utf-8')).digest()).decode('utf-8')
    handshake_reply = (
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        "Sec-WebSocket-Accept: {}\r\n\r\n"
    ).format(accept_hash)
    sock.sendall(handshake_reply.encode('utf-8'))
    return True

def read_ws_message(sock):
    def recv_all(n):
        res = bytearray()
        while len(res) < n:
            chunk = sock.recv(n - len(res))
            if not chunk: return None
            res.extend(chunk)
        return res
    first_two = recv_all(2)
    if not first_two: return None, None
    opcode = first_two[0] & 0x0F
    if opcode == 8: return "CLOSE", 8
    masked = (first_two[1] & 0x80) != 0
    payload_len = first_two[1] & 0x7F
    if payload_len == 126:
        ext_len = recv_all(2)
        if not ext_len: return None, None
        payload_len = struct.unpack("!H", ext_len)[0]
    elif payload_len == 127:
        ext_len = recv_all(8)
        if not ext_len: return None, None
        payload_len = struct.unpack("!Q", ext_len)[0]
    if masked:
        mask_key = recv_all(4)
        if not mask_key: return None, None
    payload_bytes = recv_all(payload_len)
    if not payload_bytes: return None, None
    if masked:
        unmasked = bytearray(payload_len)
        for i in range(payload_len):
            unmasked[i] = payload_bytes[i] ^ mask_key[i % 4]
        return unmasked.decode('utf-8', errors='ignore'), opcode
    return payload_bytes.decode('utf-8', errors='ignore'), opcode

def encode_ws_message(payload_str):
    payload_bytes = payload_str.encode('utf-8')
    length = len(payload_bytes)
    header = bytearray()
    header.append(0x81)
    if length <= 125:
        header.append(length)
    elif length <= 65535:
        header.append(126)
        header.extend(struct.pack("!H", length))
    else:
        header.append(127)
        header.extend(struct.pack("!Q", length))
    return bytes(header + payload_bytes)

def start_websocket_server(port, telemetry_mgr):
    server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_sock.bind(('127.0.0.1', port))
    server_sock.listen(5)
    clients = set()
    clients_lock = threading.Lock()

    def handle_client(sock):
        try:
            if not perform_ws_handshake(sock):
                sock.close()
                return
            with clients_lock:
                clients.add(sock)
            while True:
                msg, opcode = read_ws_message(sock)
                if msg == "CLOSE" or msg is None:
                    break
                try:
                    data = json.loads(msg)
                    if data.get('cmd') == 'select_ticker':
                        ticker = data.get('ticker')
                        if ticker:
                            telemetry_mgr.active_ticker = ticker
                    elif data.get('cmd') == 'chat_message':
                        text = data.get('text', '')
                        active_ticker = data.get('activeTicker', 'RELI_NSE')
                        threading.Thread(
                            target=process_chat_message,
                            args=(sock, text, active_ticker, telemetry_mgr),
                            daemon=True
                        ).start()
                except Exception:
                    pass
        except Exception:
            pass
        finally:
            with clients_lock:
                clients.discard(sock)
            try:
                sock.close()
            except:
                pass

    def accept_connections():
        while True:
            try:
                sock, addr = server_sock.accept()
                threading.Thread(target=handle_client, args=(sock,), daemon=True).start()
            except:
                break
    threading.Thread(target=accept_connections, daemon=True).start()

    while True:
        time.sleep(0.05)
        with clients_lock:
            if not clients:
                continue
            snapshot = telemetry_mgr.get_snapshot()
            frame_bytes = encode_ws_message(json.dumps(snapshot))
            broken_clients = []
            for client in clients:
                try:
                    client.sendall(frame_bytes)
                except Exception:
                    broken_clients.append(client)
            for client in broken_clients:
                clients.discard(client)
                try:
                    client.close()
                except:
                    pass

def process_chat_message(sock, text, active_ticker, telemetry_mgr):
    import json
    
    # Determine the target ticker based on text content
    target_ticker = active_ticker
    text_upper = text.upper()
    
    # Common company mapping to catch names as well
    company_aliases = {
        'RELIANCE': 'RELI_NSE', 'TCS': 'TCS_NSE', 'INFY': 'INFY_NSE',
        'HDFC': 'HDFC_NSE', 'IDEA': 'IDEA_NSE', 'SUZLON': 'SUZLON_NSE',
        'ZOMATO': 'ZOMATO_NSE', 'PAYTM': 'PAYTM_NSE', 'MARUTI': 'MARUTI_NSE',
        'SBI': 'SBIN_NSE', 'ITC': 'ITC_NSE'
    }
    
    # First check aliases
    for alias, mapped_ticker in company_aliases.items():
        if alias in text_upper:
            target_ticker = mapped_ticker
            if 'BSE' in text_upper:
                target_ticker = mapped_ticker.replace('_NSE', '_BSE')
            break
    else:
        # Fallback to checking active books
        for book_ticker in telemetry_mgr.books.keys():
            base = book_ticker.split('_')[0]
            if base in text_upper:
                target_ticker = book_ticker
                if 'BSE' in text_upper:
                    target_ticker = target_ticker.replace('_NSE', '_BSE')
                elif 'NSE' in text_upper:
                    target_ticker = target_ticker.replace('_BSE', '_NSE')
                break

    # If the target ticker isn't in books yet, we initialize it
    if target_ticker not in telemetry_mgr.books:
        telemetry_mgr.books[target_ticker] = {
            'price': 0.0,
            'bids_l2': [],
            'asks_l2': [],
            'spread': 0.0,
            'obi': 0.0,
            'trades': [],
            'volume': 0,
            'vwap': 0.0,
            'fundamentals': {}
        }
    
    # Check quote and fetch immediately if cold
    quote_data = telemetry_mgr.books.get(target_ticker, {})
    mid = quote_data.get('price', 0.0) if isinstance(quote_data, dict) else 0.0
    
    if mid <= 0:
        fetch_single_ticker(target_ticker, telemetry_mgr, target_ticker)
        quote_data = telemetry_mgr.books.get(target_ticker, {})
        mid = quote_data.get('price', 0.0) if isinstance(quote_data, dict) else 0.0

    if mid > 0:
        telemetry_mgr.vortex_agent.feed_price(target_ticker, mid)

    response_text = telemetry_mgr.vortex_agent.chat(
        text, target_ticker, mid, 
        quote_data.get('bids_l2', []) if isinstance(quote_data, dict) else [], 
        quote_data.get('asks_l2', []) if isinstance(quote_data, dict) else []
    )
    reply = {'type': 'chat_response', 'text': response_text, 'ticker': target_ticker}
    try:
        sock.sendall(encode_ws_message(json.dumps(reply)))
    except Exception as e:
        print(f'[WebSocket Chat] Send failed: {e}')

def start_http_server(port, web_dir, telemetry_mgr=None):
    class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=web_dir, **kwargs)
        def log_message(self, format, *args):
            pass
        def do_POST(self):
            if self.path.startswith('/api/terminal/command'):
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                try:
                    req_data = json.loads(body) if body else {}
                except Exception:
                    req_data = {}
                cmd_text = req_data.get('command', req_data.get('text', 'HELP'))
                active_t = req_data.get('ticker', getattr(telemetry_mgr, 'active_ticker', 'RELI_NSE'))
                
                output = "VORTEX Engine Standby"
                if telemetry_mgr and hasattr(telemetry_mgr, 'vortex_agent'):
                    quote = telemetry_mgr.books.get(active_t, {})
                    mid = quote.get('price', 0.0) if isinstance(quote, dict) else 0.0
                    bids = quote.get('bids_l2', []) if isinstance(quote, dict) else []
                    asks = quote.get('asks_l2', []) if isinstance(quote, dict) else []
                    output = telemetry_mgr.vortex_agent.chat(cmd_text, active_t, mid, bids, asks)
                
                resp = json.dumps({'status': 'OK', 'output': output, 'ticker': active_t})
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(resp.encode('utf-8'))
                return
            
            # Block legacy static UI routes
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"VORTEX-HF API Server. Frontend UI is offloaded to http://localhost:3000.")

        def do_GET(self):
            if self.path.startswith('/api/terminal/command'):
                from urllib.parse import urlparse, parse_qs
                parsed = urlparse(self.path)
                params = parse_qs(parsed.query)
                cmd_text = params.get('q', params.get('cmd', ['HELP']))[0]
                active_t = params.get('ticker', [getattr(telemetry_mgr, 'active_ticker', 'RELI_NSE')])[0]
                
                output = "VORTEX Engine Standby"
                if telemetry_mgr and hasattr(telemetry_mgr, 'vortex_agent'):
                    quote = telemetry_mgr.books.get(active_t, {})
                    mid = quote.get('price', 0.0) if isinstance(quote, dict) else 0.0
                    bids = quote.get('bids_l2', []) if isinstance(quote, dict) else []
                    asks = quote.get('asks_l2', []) if isinstance(quote, dict) else []
                    output = telemetry_mgr.vortex_agent.chat(cmd_text, active_t, mid, bids, asks)
                
                resp = json.dumps({'status': 'OK', 'output': output, 'ticker': active_t})
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(resp.encode('utf-8'))
                return

            if self.path.startswith('/api/screener'):
                items = []
                if telemetry_mgr:
                    items = telemetry_mgr.get_screener_data()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(items).encode('utf-8'))
                return

            if self.path.startswith('/api/search'):
                from urllib.parse import urlparse, parse_qs
                import urllib.parse
                parsed = urlparse(self.path)
                params = parse_qs(parsed.query)
                query = params.get('q', [''])[0]
                
                results = []
                if query:
                    queries = [query]
                    clean_q = query.strip().upper()
                    if clean_q.isalnum() and len(clean_q) >= 2:
                        queries.append(f"{clean_q}.NS")
                        queries.append(f"{clean_q}.BO")
                    
                    seen_tickers = set()
                    for q_str in queries:
                        try:
                            url = f"https://query1.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(q_str)}&quotesCount=10"
                            req = urllib.request.Request(
                                url,
                                headers={'User-Agent': 'Mozilla/5.0'}
                            )
                            with urllib.request.urlopen(req, timeout=3) as response:
                                data = json.loads(response.read().decode('utf-8'))
                                for quote in data.get('quotes', []):
                                    symbol = quote.get('symbol', '')
                                    if symbol.endswith('.NS') or symbol.endswith('.BO'):
                                        exch = 'NSE' if symbol.endswith('.NS') else 'BSE'
                                        base = symbol[:-3]
                                        ticker = f"{base}_{exch}"
                                        if ticker not in seen_tickers:
                                            seen_tickers.add(ticker)
                                            name = quote.get('longname') or quote.get('shortname') or base
                                            results.append({
                                                'ticker': ticker,
                                                'name': f"{name} ({exch})"
                                            })
                        except Exception as e:
                            print(f"[Search API] Error searching Yahoo for '{q_str}': {e}")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(results).encode('utf-8'))
                return
            
            # Block legacy static UI routes
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"VORTEX-HF API Server. Frontend UI is offloaded to http://localhost:3000.")

    class SilentTCPServer(socketserver.TCPServer):
        def handle_error(self, request, client_address):
            import sys
            exc_type, _, _ = sys.exc_info()
            if exc_type in (ConnectionResetError, ConnectionAbortedError):
                pass
            else:
                super().handle_error(request, client_address)

    socketserver.TCPServer.allow_reuse_address = True
    try:
        with SilentTCPServer(("", port), CustomHTTPHandler) as httpd:
            print(f"[HTTP Server] Hosting UI assets at http://localhost:{port}")
            httpd.serve_forever()
    except Exception as e:
        print(f"[HTTP Server] Error launching server on port {port}: {e}")

def main():
    print("=" * 80)
    print("      VORTEX-HF TELEMETRY ENGINE - REAL-TIME MARKET INTERFACE")
    print("=" * 80)
    
    telemetry_mgr = TelemetryManager()
    
    # Synchronously pre-warm active primary tickers so cold start has data instantly
    print("[Ingestion Engine] Pre-fetching initial market quotes...")
    for init_ticker in ['RELI_NSE', 'TCS_NSE', 'INFY_NSE', 'HDFC_NSE']:
        try:
            fetch_single_ticker(init_ticker, telemetry_mgr, 'RELI_NSE')
        except Exception as pre_err:
            print(f"[Pre-warm] Note: {init_ticker} pre-fetch warning: {pre_err}")
    
    http_port = 8000
    ws_port = 8001
    
    os.makedirs('web', exist_ok=True)

    # 1. Spawn HTTP static & API web server
    http_thread = threading.Thread(
        target=start_http_server, 
        args=(http_port, 'web', telemetry_mgr),
        daemon=True
    )
    http_thread.start()

    # 2. Spawn Market Data Poller Thread
    poller_thread = threading.Thread(
        target=market_data_poller,
        args=(telemetry_mgr,),
        daemon=True
    )
    poller_thread.start()
    print("[Ingestion Engine] Yahoo Finance Poller thread launched.")

    # 3. Spawn VORTEX AI Predictor Agent Thread
    ai_thread = threading.Thread(
        target=run_ai_predictor_agent,
        args=(telemetry_mgr,),
        daemon=True
    )
    ai_thread.start()
    print("[AI Predictor] VORTEX AI Predictor thread launched.")
    
    # 4. Spawn WebSocket Server Thread
    ws_thread = threading.Thread(
        target=start_websocket_server,
        args=(ws_port, telemetry_mgr),
        daemon=True
    )
    ws_thread.start()
    print(f"[WebSocket Server] Active and running on port {ws_port}")
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[VORTEX-HF] Shutting down...")

if __name__ == '__main__':
    main()
