"use client";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

type MeResponse = {
  user: { user_id: number; email: string; full_name: string };
};

function Card({ title, value, valueColor }: { title: string; value: string; valueColor?: string }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: valueColor || "inherit" }}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [error, setError] = useState("");

  // --- Mock data for demo ---
  const summary = {
    totalBalance: 125000.23,
    dayPnL: 1350.5,
    dayPnLPercent: 1.09,
    cash: 25000.0,
  };

  const positions = [
    { symbol: "AAPL", qty: 50, avgCost: 165.2, last: 182.3, pnl: 855.0 },
    { symbol: "MSFT", qty: 20, avgCost: 350.0, last: 371.5, pnl: 430.0 },
    { symbol: "NVDA", qty: 10, avgCost: 880.0, last: 895.4, pnl: 154.0 },
  ];

  const trades = [
    { id: 1, time: "2025-11-10 10:22", type: "BUY", symbol: "AAPL", qty: 20, price: 180.1 },
    { id: 2, time: "2025-11-09 14:03", type: "SELL", symbol: "MSFT", qty: 5, price: 369.8 },
    { id: 3, time: "2025-11-08 11:47", type: "BUY", symbol: "NVDA", qty: 3, price: 892.2 },
  ];

  const watchlist = [
    { symbol: "GOOGL", last: 165.7, change: +1.12 },
    { symbol: "AMZN", last: 179.3, change: -0.45 },
    { symbol: "TSLA", last: 233.9, change: +2.34 },
  ];

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      window.location.href = "/login";
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError("Unauthorized");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        const data: MeResponse = await res.json();
        setMe(data.user);
      } catch (e) {
        setError("Network error");
      }
    })();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
      {me ? (
        <div style={{ marginTop: 12, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div>Welcome, {me.full_name}</div>
              <div style={{ color: "#666" }}>{me.email}</div>
            </div>
            <button onClick={logout} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}>Logout</button>
          </div>

          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
            <Card title="Total Balance" value={`$${summary.totalBalance.toLocaleString()}`} />
            <Card title="Day P&L" value={`$${summary.dayPnL.toLocaleString()} (${summary.dayPnLPercent.toFixed(2)}%)`} valueColor={summary.dayPnL >= 0 ? "#087443" : "#b00020"} />
            <Card title="Cash" value={`$${summary.cash.toLocaleString()}`} />
            <Card title="Positions" value={`${positions.length}`} />
          </div>

          {/* Positions table */}
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Positions</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                    <th style={{ padding: 8 }}>Symbol</th>
                    <th style={{ padding: 8 }}>Qty</th>
                    <th style={{ padding: 8 }}>Avg Cost</th>
                    <th style={{ padding: 8 }}>Last</th>
                    <th style={{ padding: 8 }}>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => (
                    <tr key={p.symbol} style={{ borderBottom: "1px solid #f2f2f2" }}>
                      <td style={{ padding: 8, fontWeight: 600 }}>
                        <a href={`/prices/${p.symbol}`} style={{ color: "inherit", textDecoration: "none" }}>{p.symbol}</a>
                      </td>
                      <td style={{ padding: 8 }}>{p.qty}</td>
                      <td style={{ padding: 8 }}>${p.avgCost.toFixed(2)}</td>
                      <td style={{ padding: 8 }}>${p.last.toFixed(2)}</td>
                      <td style={{ padding: 8, color: p.pnl >= 0 ? "#087443" : "#b00020" }}>${p.pnl.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Grid: Recent trades + Watchlist */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Recent Trades</h2>
              <div style={{ border: "1px solid #eee", borderRadius: 8 }}>
                {trades.map((t) => (
                  <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", padding: 8, borderBottom: "1px solid #f6f6f6" }}>
                    <div>{t.time}</div>
                    <div style={{ color: t.type === "BUY" ? "#087443" : "#b00020" }}>{t.type}</div>
                    <div style={{ fontWeight: 600 }}>
                      <a href={`/prices/${t.symbol}`} style={{ color: "inherit", textDecoration: "none" }}>{t.symbol}</a>
                    </div>
                    <div>{t.qty}</div>
                    <div>${t.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Watchlist</h2>
              <div style={{ border: "1px solid #eee", borderRadius: 8 }}>
                {watchlist.map((w) => (
                  <div key={w.symbol} style={{ display: "flex", justifyContent: "space-between", padding: 8, borderBottom: "1px solid #f6f6f6" }}>
                    <div style={{ fontWeight: 600 }}>
                      <a href={`/prices/${w.symbol}`} style={{ color: "inherit", textDecoration: "none" }}>{w.symbol}</a>
                    </div>
                    <div>${w.last.toFixed(2)}</div>
                    <div style={{ color: w.change >= 0 ? "#087443" : "#b00020" }}>{w.change >= 0 ? "+" : ""}{w.change.toFixed(2)}%</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>{error || "Loading..."}</div>
      )}
      <div style={{ marginTop: 24 }}>
        <a href="/login" style={{ marginRight: 12 }}>Login</a>
        <a href="/signup">Signup</a>
      </div>
    </div>
  );
}
