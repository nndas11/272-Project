"use client";
import { useEffect, useState } from "react";
import { useTheme } from "../theme/ThemeProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

type MeResponse = {
  user: { user_id: number; email: string; full_name: string };
};

function Card({ title, value, valueColor, colors }: { title: string; value: string; valueColor?: string; colors: any }) {
  return (
    <div style={{ border: `1px solid ${colors.neutralBorder}`, borderRadius: 8, padding: 12, background: colors.backgroundPrimary }}>
      <div style={{ fontSize: 12, color: colors.textSecondary }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: valueColor || colors.textPrimary }}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { colors } = useTheme();
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
    <div style={{ padding: 24, background: colors.backgroundPrimary, color: colors.textPrimary, minHeight: '100vh' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary }}>Dashboard</h1>
      {me ? (
        <div style={{ marginTop: 12, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: colors.textPrimary }}>Welcome, {me.full_name}</div>
              <div style={{ color: colors.textSecondary }}>{me.email}</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="/profile" style={{ padding: 8, borderRadius: 6, border: `1px solid ${colors.primary}`, background: colors.primaryLight, color: colors.primary, textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}>
                👤 Profile
              </a>
              <button onClick={logout} style={{ padding: 8, borderRadius: 6, border: `1px solid ${colors.neutralBorder}`, background: colors.backgroundSecondary, color: colors.textPrimary }}>Logout</button>
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
            <Card colors={colors} title="Total Balance" value={`$${summary.totalBalance.toLocaleString()}`} />
            <Card colors={colors} title="Day P&L" value={`$${summary.dayPnL.toLocaleString()} (${summary.dayPnLPercent.toFixed(2)}%)`} valueColor={summary.dayPnL >= 0 ? colors.success : colors.danger} />
            <Card colors={colors} title="Cash" value={`$${summary.cash.toLocaleString()}`} />
            <Card colors={colors} title="Positions" value={`${positions.length}`} />
          </div>

          {/* Positions table */}
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: colors.textPrimary }}>Positions</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: `1px solid ${colors.neutralBorder}` }}>
                    <th style={{ padding: 8, color: colors.textPrimary }}>Symbol</th>
                    <th style={{ padding: 8, color: colors.textPrimary }}>Qty</th>
                    <th style={{ padding: 8, color: colors.textPrimary }}>Avg Cost</th>
                    <th style={{ padding: 8, color: colors.textPrimary }}>Last</th>
                    <th style={{ padding: 8, color: colors.textPrimary }}>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => (
                    <tr key={p.symbol} style={{ borderBottom: `1px solid ${colors.neutralLight}` }}>
                      <td style={{ padding: 8, fontWeight: 600, color: colors.textPrimary }}>{p.symbol}</td>
                      <td style={{ padding: 8, color: colors.textPrimary }}>{p.qty}</td>
                      <td style={{ padding: 8, color: colors.textPrimary }}>${p.avgCost.toFixed(2)}</td>
                      <td style={{ padding: 8, color: colors.textPrimary }}>${p.last.toFixed(2)}</td>
                      <td style={{ padding: 8, color: p.pnl >= 0 ? colors.success : colors.danger }}>${p.pnl.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Grid: Recent trades + Watchlist */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: colors.textPrimary }}>Recent Trades</h2>
              <div style={{ border: `1px solid ${colors.neutralBorder}`, borderRadius: 8, background: colors.backgroundSecondary }}>
                {trades.map((t) => (
                  <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", padding: 8, borderBottom: `1px solid ${colors.neutralLight}`, color: colors.textPrimary }}>
                    <div>{t.time}</div>
                    <div style={{ color: t.type === "BUY" ? colors.success : colors.danger }}>{t.type}</div>
                    <div style={{ fontWeight: 600 }}>{t.symbol}</div>
                    <div>{t.qty}</div>
                    <div>${t.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: colors.textPrimary }}>Watchlist</h2>
              <div style={{ border: `1px solid ${colors.neutralBorder}`, borderRadius: 8, background: colors.backgroundSecondary }}>
                {watchlist.map((w) => (
                  <div key={w.symbol} style={{ display: "flex", justifyContent: "space-between", padding: 8, borderBottom: `1px solid ${colors.neutralLight}`, color: colors.textPrimary }}>
                    <div style={{ fontWeight: 600 }}>{w.symbol}</div>
                    <div>${w.last.toFixed(2)}</div>
                    <div style={{ color: w.change >= 0 ? colors.success : colors.danger }}>{w.change >= 0 ? "+" : ""}{w.change.toFixed(2)}%</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 12, color: colors.textPrimary }}>{error || "Loading..."}</div>
      )}
      <div style={{ marginTop: 24 }}>
        <a href="/login" style={{ marginRight: 12, color: colors.primary, textDecoration: 'none' }}>Login</a>
        <a href="/signup" style={{ color: colors.primary, textDecoration: 'none' }}>Signup</a>
      </div>
    </div>
  );
}


