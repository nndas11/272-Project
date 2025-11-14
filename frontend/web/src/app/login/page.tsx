"use client";
import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

export default function LoginPage() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed");
        return;
      }
      // Store token in localStorage for client-side access
      localStorage.setItem("token", data.token);
      // Backend should set HttpOnly cookie (more secure)
      // Frontend just redirects
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
        <h1 style={{ fontSize: 20, fontWeight: 600, color: colors.textPrimary }}>Login</h1>
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
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 8, border: `1px solid ${colors.formInputBorder}`, borderRadius: 6, background: colors.formInputBg, color: colors.formInputText }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: colors.textSecondary }}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          <span style={{ fontSize: 14 }}>Show password</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: 10, borderRadius: 6, background: colors.primary, color: colors.textInverse, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error && <div style={{ color: colors.danger, padding: 8, background: colors.dangerLight, borderRadius: 4, fontSize: 14 }}>{error}</div>}
        <a href="/signup" style={{ color: colors.primary, textDecoration: 'none', textAlign: 'center', fontSize: 14 }}>Create an account</a>
      </form>
    </div>
  );
}
