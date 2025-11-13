"use client";
import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

export default function SignupPage() {
  const { colors } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Signup failed");
        return;
      }
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: colors.backgroundPrimary, color: colors.textPrimary }}>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, width: 320 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: colors.textPrimary }}>Create account</h1>
        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={{ padding: 8, border: `1px solid ${colors.formInputBorder}`, borderRadius: 6, background: colors.formInputBg, color: colors.formInputText }}
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 8, border: `1px solid ${colors.formInputBorder}`, borderRadius: 6, background: colors.formInputBg, color: colors.formInputText }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 8, border: `1px solid ${colors.formInputBorder}`, borderRadius: 6, background: colors.formInputBg, color: colors.formInputText }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: 10, borderRadius: 6, background: colors.primary, color: colors.textInverse, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Creating..." : "Create account"}
        </button>
        {error && <div style={{ color: colors.danger, padding: 8, background: colors.dangerLight, borderRadius: 4, fontSize: 14 }}>{error}</div>}
        <a href="/login" style={{ color: colors.primary, textDecoration: 'none', textAlign: 'center', fontSize: 14 }}>Already have an account? Sign in</a>
      </form>
    </div>
  );
}
