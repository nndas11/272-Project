"use client";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

export default function LoginPage() {
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
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, width: 320 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Login</h1>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <input
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
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
          style={{ padding: 10, borderRadius: 6, background: "#111", color: "#fff" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error && <div style={{ color: "#b00020" }}>{error}</div>}
        <a href="/signup" style={{ color: "#06c" }}>Create an account</a>
      </form>
    </div>
  );
}
