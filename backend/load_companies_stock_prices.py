# pip install yfinance pandas psycopg2-binary python-dotenv
import os
import psycopg2
import pandas as pd
import yfinance as yf
from dotenv import load_dotenv

load_dotenv()

# ---------- DB CONFIG ----------
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT"))
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

# ---------- FIXED MAPPING: companies_id -> symbol ----------
COMPANY_MAP = {
    1: "AAPL",
    2: "MSFT",
    3: "GOOGL",
    4: "TSLA",
    5: "AMZN",
    6: "NVDA",
    7: "NFLX",
}

# ---------- HELPERS ----------
def _flatten_cols(cols):
    """Return a list of simple column names from (possibly) a MultiIndex."""
    simple = []
    for c in cols:
        if isinstance(c, tuple):
            # pick the element that looks like an OHLCV name
            for part in c:
                s = str(part).strip().lower()
                if s in {"open", "high", "low", "close", "adj close", "adjclose", "volume"}:
                    simple.append(part)
                    break
            else:
                simple.append(c[-1])  # fallback to last item
        else:
            simple.append(c)
    return [str(x).strip() for x in simple]

def load_1y_daily(symbol: str) -> pd.DataFrame:
    """Download 1y of 1D bars; return DF with columns: open, high, low, close, adj_close, volume."""
    df = yf.download(
        symbol,
        period="1y",
        interval="1d",
        progress=False,
        auto_adjust=False,   # keep Adj Close separate
        actions=False,
    )
    if df.empty:
        return df

    # If columns are MultiIndex, flatten them
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = _flatten_cols(df.columns)
    else:
        df.columns = [str(c).strip() for c in df.columns]

    # Normalize index to tz-naive (TIMESTAMP without TZ)
    idx = pd.to_datetime(df.index)
    if getattr(idx, "tz", None) is not None:
        idx = idx.tz_convert("UTC").tz_localize(None)
    df.index = idx

    cols = set(x.lower() for x in df.columns)

    def find(name, alts=()):
        cand = [name.lower(), *[a.lower() for a in alts]]
        for c in df.columns:
            if str(c).strip().lower() in cand:
                return c
        return None

    open_col  = find("Open")
    high_col  = find("High")
    low_col   = find("Low")
    close_col = find("Close")
    adj_col   = find("Adj Close", alts=("AdjClose",)) or close_col
    vol_col   = find("Volume")

    needed = [open_col, high_col, low_col, close_col, adj_col, vol_col]
    if any(c is None for c in needed):
        raise ValueError(f"Unexpected columns for {symbol}: {list(df.columns)}")

    df = df[[open_col, high_col, low_col, close_col, adj_col, vol_col]].rename(
        columns={
            open_col: "open",
            high_col: "high",
            low_col: "low",
            close_col: "close",
            adj_col: "adj_close",
            vol_col: "volume",
        }
    )
    return df

def delete_existing_range(cur, companies_id: int, start_dt: pd.Timestamp, end_dt: pd.Timestamp):
    cur.execute(
        """
        DELETE FROM stock_prices
        WHERE companies_id = %s
          AND trade_timestamp >= %s
          AND trade_timestamp <= %s
        """,
        (companies_id, start_dt.to_pydatetime(), end_dt.to_pydatetime()),
    )

def insert_prices(cur, companies_id: int, df: pd.DataFrame):
    sql = """
        INSERT INTO stock_prices
            (companies_id, trade_timestamp, open, high, low, close, adj_close, volume)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """
    payload = [
        (
            companies_id,
            ts.to_pydatetime(),
            None if pd.isna(r.open)      else float(r.open),
            None if pd.isna(r.high)      else float(r.high),
            None if pd.isna(r.low)       else float(r.low),
            None if pd.isna(r.close)     else float(r.close),
            None if pd.isna(r.adj_close) else float(r.adj_close),
            None if pd.isna(r.volume)    else int(r.volume),
        )
        for ts, r in df.iterrows()
    ]
    cur.executemany(sql, payload)

# ---------- MAIN ----------
def main():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME
    )
    try:
        with conn:
            with conn.cursor() as cur:
                for companies_id, symbol in COMPANY_MAP.items():
                    try:
                        print(f"\nFetching {symbol} (companies_id={companies_id}) …")
                        df = load_1y_daily(symbol)
                        if df.empty:
                            print(f"  ⚠️ No data returned for {symbol}")
                            continue

                        delete_existing_range(cur, companies_id, df.index.min(), df.index.max())
                        insert_prices(cur, companies_id, df)
                        print(f"  ✅ Inserted {len(df)} rows for {symbol}")
                    except Exception as e:
                        print(f"  ❌ Skipped {symbol} due to error: {e}")

        print("\nAll done.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
