"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

export default function PricesPage() {
  const [data, setData] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/stocks/prices`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setData(json || []);
    } catch (e: any) {
      setError(e?.message || "Error fetching prices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Live Stock Prices</h1>
      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <button onClick={load} style={{ padding: 8, borderRadius: 6 }}>Refresh</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#b00020' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: 8 }}>Symbol</th>
                <th style={{ padding: 8 }}>Name</th>
                <th style={{ padding: 8 }}>Last</th>
                <th style={{ padding: 8 }}>Timestamp</th>
                <th style={{ padding: 8 }}>Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r: any) => (
                <tr key={r.symbol} style={{ borderBottom: '1px solid #f6f6f6' }}>
                  <td style={{ padding: 8, fontWeight: 700 }}>
                    <Link href={`/prices/${r.symbol}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{r.symbol}</Link>
                  </td>
                  <td style={{ padding: 8 }}>{r.longname || r.longName || ''}</td>
                  <td style={{ padding: 8 }}>{r.close != null ? `$${Number(r.close).toFixed(4)}` : '—'}</td>
                  <td style={{ padding: 8 }}>{r.trade_timestamp ? new Date(r.trade_timestamp).toLocaleString() : ''}</td>
                  <td style={{ padding: 8 }}>{r.volume ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
