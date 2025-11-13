import json, os, time, threading, queue, atexit, signal
from datetime import datetime, timedelta
from typing import Dict, Set
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import websocket  # from websocket-client
import psycopg2
import bcrypt
import jwt

load_dotenv()

FINNHUB_TOKEN = os.environ.get("FINNHUB_TOKEN", "")
SYMBOLS = os.environ.get("SYMBOLS", "AAPL,MSFT,GOOGL,TSLA").split(",")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT")) if os.getenv("DB_PORT") else None
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")

if not FINNHUB_TOKEN:
    raise RuntimeError("Set FINNHUB_TOKEN in .env")

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

ws_thread = FinnhubThread(FINNHUB_TOKEN, SYMBOLS)
ws_thread.start()

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

def _db_conn():
    return psycopg2.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME)

def _make_token(user_id: int, email: str):
    payload = {"sub": user_id, "email": email, "exp": datetime.utcnow() + timedelta(hours=12)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def _parse_token(auth_header: str):
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except Exception:
        return None

@app.post("/auth/signup")
def auth_signup():
    data = request.get_json(silent=True) or {}
    full_name = data.get("full_name") or data.get("name")
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    if not email or not password or not full_name:
        return jsonify({"error": "missing_fields"}), 400
    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    conn = _db_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT user_id FROM users WHERE email=%s", (email,))
                if cur.fetchone():
                    return jsonify({"error": "email_exists"}), 409
                cur.execute(
                    """
                    INSERT INTO users (full_name, email, password_hash)
                    VALUES (%s, %s, %s)
                    RETURNING user_id
                    """,
                    (full_name, email, pw_hash)
                )
                user_id = cur.fetchone()[0]
        token = _make_token(user_id, email)
        return jsonify({"token": token, "user": {"user_id": user_id, "email": email, "full_name": full_name}})
    finally:
        conn.close()

@app.post("/auth/login")
def auth_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "missing_fields"}), 400
    conn = _db_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT user_id, full_name, password_hash FROM users WHERE email=%s", (email,))
                row = cur.fetchone()
                if not row:
                    return jsonify({"error": "invalid_credentials"}), 401
                user_id, full_name, password_hash = row
                ok = False
                try:
                    ok = bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
                except Exception:
                    ok = False
                if not ok:
                    return jsonify({"error": "invalid_credentials"}), 401
        token = _make_token(user_id, email)
        return jsonify({"token": token, "user": {"user_id": user_id, "email": email, "full_name": full_name}})
    finally:
        conn.close()

@app.get("/auth/me")
def auth_me():
    payload = _parse_token(request.headers.get("Authorization"))
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    user_id = payload.get("sub")
    email = payload.get("email")
    conn = _db_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT full_name FROM users WHERE user_id=%s", (user_id,))
                row = cur.fetchone()
                if not row:
                    return jsonify({"error": "unauthorized"}), 401
                full_name = row[0]
        return jsonify({"user": {"user_id": user_id, "email": email, "full_name": full_name}})
    finally:
        conn.close()

# ---- User Profile Management ----
@app.put("/user/profile")
def update_profile():
    payload = _parse_token(request.headers.get("Authorization"))
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    user_id = payload.get("sub")
    data = request.get_json(silent=True) or {}
    full_name = data.get("full_name")
    email = (data.get("email") or "").strip().lower()
    
    if not full_name or not email:
        return jsonify({"error": "missing_fields"}), 400
    
    conn = _db_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                # Check if email is already taken by another user
                cur.execute("SELECT user_id FROM users WHERE email=%s AND user_id!=%s", (email, user_id))
                if cur.fetchone():
                    return jsonify({"error": "email_exists"}), 409
                
                # Update user
                cur.execute(
                    """
                    UPDATE users SET full_name=%s, email=%s
                    WHERE user_id=%s
                    RETURNING user_id, email, full_name
                    """,
                    (full_name, email, user_id)
                )
                row = cur.fetchone()
                if not row:
                    return jsonify({"error": "user_not_found"}), 404
                
                user_id, email, full_name = row
        return jsonify({"user": {"user_id": user_id, "email": email, "full_name": full_name}})
    finally:
        conn.close()

# ---- User Balances Management ----
@app.get("/user/balances")
def get_balances():
    payload = _parse_token(request.headers.get("Authorization"))
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    user_id = payload.get("sub")
    
    conn = _db_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, user_id, currency, available_balance, total_balance, updated_at
                    FROM user_balances
                    WHERE user_id=%s
                    ORDER BY updated_at DESC
                    """,
                    (user_id,)
                )
                rows = cur.fetchall()
                balances = [
                    {
                        "id": row[0],
                        "user_id": row[1],
                        "currency": row[2],
                        "available_balance": float(row[3]),
                        "total_balance": float(row[4]),
                        "updated_at": row[5].isoformat() if row[5] else None,
                    }
                    for row in rows
                ]
        return jsonify(balances)
    finally:
        conn.close()

@app.post("/user/balances")
def create_balance():
    payload = _parse_token(request.headers.get("Authorization"))
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    user_id = payload.get("sub")
    data = request.get_json(silent=True) or {}
    
    currency = (data.get("currency") or "USD").upper()
    available_balance = float(data.get("available_balance", 0))
    total_balance = float(data.get("total_balance", available_balance))
    
    if not currency or len(currency) != 3:
        return jsonify({"error": "invalid_currency"}), 400
    
    conn = _db_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_balances (user_id, currency, available_balance, total_balance)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (user_id, currency) DO UPDATE
                    SET available_balance = EXCLUDED.available_balance,
                        total_balance = EXCLUDED.total_balance,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id, user_id, currency, available_balance, total_balance, updated_at
                    """,
                    (user_id, currency, available_balance, total_balance)
                )
                row = cur.fetchone()
                balance_id, user_id, currency, avail, total, updated = row
        
        return jsonify({
            "id": balance_id,
            "user_id": user_id,
            "currency": currency,
            "available_balance": float(avail),
            "total_balance": float(total),
            "updated_at": updated.isoformat() if updated else None,
        }), 201
    finally:
        conn.close()

@app.delete("/user/balances/<int:balance_id>")
def delete_balance(balance_id):
    payload = _parse_token(request.headers.get("Authorization"))
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    user_id = payload.get("sub")
    
    conn = _db_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                # Verify ownership
                cur.execute("SELECT user_id FROM user_balances WHERE id=%s", (balance_id,))
                row = cur.fetchone()
                if not row or row[0] != user_id:
                    return jsonify({"error": "not_found"}), 404
                
                # Delete
                cur.execute("DELETE FROM user_balances WHERE id=%s", (balance_id,))
        
        return jsonify({"message": "deleted"}), 200
    finally:
        conn.close()

# ---- User Trades Management ----
@app.get("/user/trades")
def get_trades():
    payload = _parse_token(request.headers.get("Authorization"))
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    user_id = payload.get("sub")
    
    conn = _db_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT ut.id, ut.user_id, ut.company_id, ut.trade_type, ut.quantity, 
                           ut.price, ut.total_price, ut.trade_timestamp, c.symbol
                    FROM user_trades ut
                    LEFT JOIN companies c ON ut.company_id = c.companies_id
                    WHERE ut.user_id=%s
                    ORDER BY ut.trade_timestamp DESC
                    """,
                    (user_id,)
                )
                rows = cur.fetchall()
                trades = [
                    {
                        "id": row[0],
                        "user_id": row[1],
                        "company_id": row[2],
                        "trade_type": row[3],
                        "quantity": float(row[4]),
                        "price": float(row[5]),
                        "total_price": float(row[6]),
                        "trade_timestamp": row[7].isoformat() if row[7] else None,
                        "symbol": row[8],
                    }
                    for row in rows
                ]
        return jsonify(trades)
    finally:
        conn.close()

@app.delete("/user/trades/<int:trade_id>")
def delete_trade(trade_id):
    payload = _parse_token(request.headers.get("Authorization"))
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    user_id = payload.get("sub")
    
    conn = _db_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                # Verify ownership
                cur.execute("SELECT user_id FROM user_trades WHERE id=%s", (trade_id,))
                row = cur.fetchone()
                if not row or row[0] != user_id:
                    return jsonify({"error": "not_found"}), 404
                
                # Delete
                cur.execute("DELETE FROM user_trades WHERE id=%s", (trade_id,))
        
        return jsonify({"message": "deleted"}), 200
    finally:
        conn.close()

# graceful shutdown
def _shutdown(*_):
    ws_thread.stop()
    os._exit(0)
atexit.register(ws_thread.stop)
signal.signal(signal.SIGINT, _shutdown)
signal.signal(signal.SIGTERM, _shutdown)

if __name__ == "__main__":
    # For local dev. For prod, run via gunicorn (see notes below).
    app.run(host="0.0.0.0", port=5050, threaded=True)
