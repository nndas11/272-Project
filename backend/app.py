import json, os, time, threading, queue, atexit, signal
from datetime import datetime
from typing import Dict, Set
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import websocket  # from websocket-client

load_dotenv()

FINNHUB_TOKEN = os.environ.get("FINNHUB_TOKEN", "")
SYMBOLS = os.environ.get("SYMBOLS", "AAPL,MSFT,GOOGL,TSLA").split(",")

# Only require FINNHUB_TOKEN if we're actually using Finnhub features
# For development/testing, allow empty token (will fail gracefully)
if not FINNHUB_TOKEN:
    import warnings
    warnings.warn("FINNHUB_TOKEN not set. Some features may not work.", UserWarning)

app = Flask(__name__, static_folder='../frontend/static')
CORS(app)

# ---- In-memory state ----
latest_quotes: Dict[str, dict] = {}        # { "AAPL": {"symbol":"AAPL","price":182.31,"ts":1697040000000} }
_subscribers: Set[queue.Queue] = set()     # each client gets its own Queue

_sub_lock = threading.Lock()
def _broadcast(obj):
    dead = []
    with _sub_lock:
        for q in list(_subscribers):
            try:
                q.put_nowait(obj)
            except Exception:
                dead.append(q)
        for q in dead:
            _subscribers.discard(q)

def _subscribe():
    q = queue.Queue(maxsize=1024)
    with _sub_lock:
        _subscribers.add(q)
    return q

def _unsubscribe(q):
    with _sub_lock:
        _subscribers.discard(q)

# ---- Finnhub WS client (runs in a thread, reconnects on failure) ----
class FinnhubThread(threading.Thread):
    def __init__(self, token: str, symbols):
        super().__init__(daemon=True)
        self.token = token
        self.symbols = [s.strip() for s in symbols if s.strip()]
        self._stop = threading.Event()
        self.ws = None

    def run(self):
        if not self.token:
            print("FinnhubThread: No token provided, thread will not start")
            return
        while not self._stop.is_set():
            try:
                ws_url = f"wss://ws.finnhub.io?token={self.token}"
                self.ws = websocket.WebSocketApp(
                    ws_url,
                    on_open=self.on_open,
                    on_message=self.on_message,
                    on_error=self.on_error,
                    on_close=self.on_close
                )
                self.ws.run_forever(ping_interval=20, ping_timeout=10)  # keepalive
            except Exception as e:
                # backoff before reconnect
                print(f"FinnhubThread error: {e}, retrying in 2 seconds...")
                time.sleep(2)
            time.sleep(2)

    def stop(self):
        self._stop.set()
        try:
            if self.ws:
                self.ws.close()
        except Exception:
            pass

    # ---- WS callbacks ----
    def on_open(self, ws):
        for s in self.symbols:
            ws.send(json.dumps({"type":"subscribe", "symbol": s}))
        # optional: send a status event
        _broadcast({"type":"status","msg":"connected","at":int(time.time()*1000)})

    def on_message(self, ws, message):
        try:
            obj = json.loads(message)
            if obj.get("type") == "trade":
                for t in obj.get("data", []):
                    sym = t.get("s")
                    price = t.get("p")
                    ts = t.get("t")
                    if sym and price is not None:
                        latest_quotes[sym] = {"symbol": sym, "price": price, "ts": ts}
                        _broadcast({"type":"quote","symbol": sym, "price": price, "ts": ts})
        except Exception:
            pass

    def on_error(self, ws, error):
        _broadcast({"type":"status","msg":"ws_error","detail":str(error), "at":int(time.time()*1000)})

    def on_close(self, ws, code, reason):
        _broadcast({"type":"status","msg":"disconnected","code":code,"reason":str(reason),"at":int(time.time()*1000)})

# Only start Finnhub thread if token is provided
if FINNHUB_TOKEN:
    ws_thread = FinnhubThread(FINNHUB_TOKEN, SYMBOLS)
    ws_thread.start()
else:
    ws_thread = None
    print("Warning: FINNHUB_TOKEN not set. WebSocket quotes will not be available.")

# ---- Flask routes ----
@app.route('/')
def index():
    return app.send_static_file('ticker.html')

@app.get("/prices/now")
def prices_now():
    # snapshot for initial render
    return jsonify(sorted(list(latest_quotes.values()), key=lambda x: x["symbol"]))

@app.get("/prices/stream")
def prices_stream():
    client_q = _subscribe()

    def gen():
        # send an initial snapshot
        snap = {"type":"snapshot","data": sorted(list(latest_quotes.values()), key=lambda x: x["symbol"])}
        yield f"data: {json.dumps(snap)}\n\n"

        # now stream updates; also send keepalives to keep proxies happy
        last_heartbeat = time.time()
        try:
            while True:
                try:
                    item = client_q.get(timeout=15)
                    yield f"data: {json.dumps(item)}\n\n"
                except queue.Empty:
                    # heartbeat comment (SSE allows comments that clients ignore)
                    yield ": keepalive\n\n"
                # periodic heartbeat to avoid idle disconnects
                if time.time() - last_heartbeat > 30:
                    last_heartbeat = time.time()
        except GeneratorExit:
            pass
        finally:
            _unsubscribe(client_q)

    return Response(gen(), mimetype="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",  # for nginx
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*"
    })

@app.get("/health")
def health():
    return jsonify({"status": "ok", "symbols": SYMBOLS})

@app.route('/ticker')
@app.route('/ticker.html')
def serve_ticker():
    return app.send_static_file('ticker.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return app.send_static_file(path)

# graceful shutdown
def _shutdown(*_):
    if ws_thread:
        ws_thread.stop()
    os._exit(0)
if ws_thread:
    atexit.register(ws_thread.stop)
signal.signal(signal.SIGINT, _shutdown)
signal.signal(signal.SIGTERM, _shutdown)

if __name__ == "__main__":
    # For local dev. For prod, run via gunicorn (see notes below).
    # Port can be overridden via environment variable (default: 5050 for local, 8080 for Docker)
    port = int(os.environ.get("PORT", os.environ.get("FLASK_PORT", 5050)))
    app.run(host="0.0.0.0", port=port, threaded=True)
