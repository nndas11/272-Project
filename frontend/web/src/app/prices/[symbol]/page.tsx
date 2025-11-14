"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

export default function SymbolPricePage() {
  const params = useParams();
  const symbol = params?.symbol ? (Array.isArray(params.symbol) ? params.symbol[0] : params.symbol) : null;
  
  const [data, setData] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [days, setDays] = useState(90);
  
  // Buy/Sell state
  const [quantity, setQuantity] = useState(1);
  const [transactionMessage, setTransactionMessage] = useState("");
  const [transactionError, setTransactionError] = useState("");

  async function fetchPrices() {
    if (!symbol) return;
    setLoading(true);
    setError("");
    try {
      const url = `${API_BASE}/stocks/prices/${symbol}?days=${days}&limit=500`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch prices for ${symbol}`);
      const json = await res.json();
      
      // Sort by timestamp ascending and format for chart
      const prices = (json.prices || [])
        .sort((a: any, b: any) => new Date(a.trade_timestamp).getTime() - new Date(b.trade_timestamp).getTime())
        .map((p: any) => ({
          time: new Date(p.trade_timestamp).toLocaleDateString(),
          close: Number(p.close),
          high: Number(p.high),
          low: Number(p.low),
          open: Number(p.open),
          volume: p.volume,
        }));
      
      setData(prices);
    } catch (e: any) {
      setError(e?.message || "Error fetching prices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrices();
  }, [symbol, days]);

  async function executeTrade(tradeType: "BUY" | "SELL") {
    // Get token directly from localStorage instead of from state
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setTransactionError("Not authenticated. Please login.");
      return;
    }
    
    const latestPrice = data.length > 0 ? data[data.length - 1].close : 0;
    if (latestPrice === 0) {
      setTransactionError("Price data not available");
      return;
    }
    
    setTransactionError("");
    setTransactionMessage("");
    
    try {
      const endpoint = tradeType === "BUY" ? "/stocks/buy" : "/stocks/sell";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: symbol?.toUpperCase(),
          quantity: parseInt(String(quantity)),
          price: latestPrice,
        }),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        setTransactionError(result.error || `${tradeType} failed`);
        return;
      }
      
      setTransactionMessage(`✅ ${tradeType} successful! Qty: ${quantity} @ $${latestPrice.toFixed(2)} = $${(quantity * latestPrice).toFixed(2)}`);
      setQuantity(1);
    } catch (e: any) {
      setTransactionError(e?.message || "Transaction failed");
    }
  }

  const periods = [
    { label: "1M", days: 30 },
    { label: "3M", days: 90 },
    { label: "6M", days: 180 },
    { label: "1Y", days: 365 },
  ];

  // Live quote state
  const [liveMode, setLiveMode] = useState(false);
  const [liveQuote, setLiveQuote] = useState<any | null>(null);
  const [liveError, setLiveError] = useState("");

  // Poll live quote when in live mode
  useEffect(() => {
    if (!liveMode) return;
    let cancelled = false;
    async function fetchLive() {
      if (!symbol) return;
      try {
        const res = await fetch(`${API_BASE}/stocks/quote/${symbol}`);
        const json = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setLiveQuote(json);
          setLiveError("");
        } else {
          setLiveError(json.error || "Live quote unavailable");
        }
      } catch (e) {
        if (!cancelled) setLiveError("Live fetch failed");
      }
    }
    fetchLive();
    const interval = setInterval(fetchLive, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [liveMode, symbol]);

  const currentPrice = data.length > 0 ? data[data.length - 1].close : 0;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>{symbol?.toUpperCase() || "Stock"} - Price Chart</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {periods.map((p) => (
            <button
              key={p.days}
              onClick={() => { setLiveMode(false); setDays(p.days); }}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: `2px solid ${!liveMode && days === p.days ? "#2563eb" : "#ddd"}`,
                background: !liveMode && days === p.days ? "#2563eb" : "#fff",
                color: !liveMode && days === p.days ? "#fff" : "#000",
                fontWeight: !liveMode && days === p.days ? 700 : 400,
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setLiveMode((v) => !v)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: `2px solid ${liveMode ? "#16a34a" : "#ddd"}`,
              background: liveMode ? "#16a34a" : "#fff",
              color: liveMode ? "#fff" : "#000",
              fontWeight: liveMode ? 700 : 400,
              cursor: "pointer",
            }}
          >
            Live
          </button>
        </div>
      </div>

      {loading && <div>Loading chart data...</div>}
      {error && <div style={{ color: "#b00020" }}>❌ {error}</div>}

      {/* Live Mode Display */}
      {liveMode && (
        <div style={{ marginBottom: 24, border: "2px solid #16a34a", background: "#ecfdf5", padding: 16, borderRadius: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#16a34a" }}>Live Price</h3>
          {liveError && <div style={{ color: "#b00020", marginTop: 8 }}>❌ {liveError}</div>}
          {!liveError && liveQuote && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14 }}>Symbol: <strong>{liveQuote.symbol}</strong></div>
              <div style={{ fontSize: 32, fontWeight: 700, margin: "4px 0" }}>${Number(liveQuote.price).toFixed(2)}</div>
              <div style={{ fontSize: 12, color: "#555" }}>Updated: {new Date(liveQuote.ts).toLocaleTimeString()}</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>Polling every 2s</div>
            </div>
          )}
          {!liveError && !liveQuote && <div style={{ marginTop: 8 }}>No live quote yet. Waiting for stream...</div>}
        </div>
      )}

      {!liveMode && !loading && !error && data.length > 0 && (
        <div style={{ width: "100%", height: 500, marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: "Price ($)", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value}
                labelFormatter={(label: any) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#2563eb" 
                dot={false}
                strokeWidth={2}
                name="Close Price"
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#10b981" 
                dot={false}
                strokeWidth={1}
                strokeDasharray="5 5"
                name="High"
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="#ef4444" 
                dot={false}
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Low"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <div>No data available for this symbol.</div>
      )}

      {/* Price Stats */}
      {data.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Latest Close</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>${data[data.length - 1].close.toFixed(4)}</div>
          </div>
          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>High</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>
              ${Math.max(...data.map(d => d.high)).toFixed(4)}
            </div>
          </div>
          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Low</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#ef4444" }}>
              ${Math.min(...data.map(d => d.low)).toFixed(4)}
            </div>
          </div>
          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Avg Volume</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {(data.reduce((sum, d) => sum + (d.volume || 0), 0) / data.length).toLocaleString().split('.')[0]}
            </div>
          </div>
        </div>
      )}

      {/* Buy/Sell Trading Forms */}
      {data.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          {/* Buy Form */}
          <div style={{ border: "2px solid #10b981", padding: 16, borderRadius: 8, backgroundColor: "#f0fdf4" }}>
            <h3 style={{ marginTop: 0, color: "#10b981", fontSize: 16, fontWeight: 700 }}>Buy Stock</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  boxSizing: "border-box",
                  fontSize: 14,
                }}
                min="1"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Price per share: ${currentPrice.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: "#666" }}>Total cost: ${(quantity * currentPrice).toFixed(2)}</div>
            </div>
            <button
              onClick={() => executeTrade("BUY")}
              style={{
                width: "100%",
                padding: "10px 16px",
                backgroundColor: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Buy
            </button>
          </div>

          {/* Sell Form */}
          <div style={{ border: "2px solid #ef4444", padding: 16, borderRadius: 8, backgroundColor: "#fef2f2" }}>
            <h3 style={{ marginTop: 0, color: "#ef4444", fontSize: 16, fontWeight: 700 }}>Sell Stock</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  boxSizing: "border-box",
                  fontSize: 14,
                }}
                min="1"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Price per share: ${currentPrice.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: "#666" }}>Total proceeds: ${(quantity * currentPrice).toFixed(2)}</div>
            </div>
            <button
              onClick={() => executeTrade("SELL")}
              style={{
                width: "100%",
                padding: "10px 16px",
                backgroundColor: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Sell
            </button>
          </div>
        </div>
      )}

      {/* Transaction Messages */}
      {transactionMessage && (
        <div style={{ padding: 12, backgroundColor: "#d1fae5", color: "#065f46", borderRadius: 4, marginBottom: 24, fontSize: 14 }}>
          {transactionMessage}
        </div>
      )}
      {transactionError && (
        <div style={{ padding: 12, backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: 4, marginBottom: 24, fontSize: 14 }}>
          ❌ Error: {transactionError}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <a href="/prices" style={{ color: "#2563eb", textDecoration: "none" }}>← Back to all prices</a>
      </div>
    </div>
  );
}
