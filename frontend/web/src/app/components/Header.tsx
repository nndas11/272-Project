"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "../theme/ThemeProvider";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { name, colors, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    // Fetch user info
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserName(data.user.full_name);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem("token");
        }
      } catch (e) {
        console.error("Failed to fetch user:", e);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [API_BASE]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowDropdown(false);
    router.push("/login");
  };

  // Don't show header on login/signup pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <header
      style={{
        background: colors.headerBg,
        color: colors.headerText,
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid ${colors.headerBorder}`,
        boxShadow: `0 2px 8px ${colors.shadowDark}`,
      }}
    >
      {/* Left - Logo/Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link
          href="/dashboard"
          style={{
            fontSize: 20,
            fontWeight: 700,
            textDecoration: "none",
            color: colors.headerText,
            letterSpacing: "-0.5px",
          }}
        >
          📈 Stock Platform
        </Link>
      </div>

      {/* Right - Navigation & Profile */}
      {!loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: colors.headerProfileBg,
              color: colors.headerText,
              border: `1px solid ${colors.headerProfileBorder}`,
              borderRadius: "50%",
              width: 40,
              height: 40,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.headerProfileBorder;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.headerProfileBg;
            }}
            title={`Switch to ${name === "light" ? "dark" : "light"} mode`}
          >
            {name === "light" ? "🌙" : "☀️"}
          </button>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard" style={{ color: colors.headerText, textDecoration: "none", fontSize: 14 }}>
                Dashboard
              </Link>
              {/* Profile Dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    background: colors.headerProfileBg,
                    color: colors.headerText,
                    border: `1px solid ${colors.headerProfileBorder}`,
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.headerProfileBorder;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.headerProfileBg;
                  }}
                  title={userName}
                >
                  👤
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      background: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderRadius: 8,
                      boxShadow: `0 4px 12px ${colors.shadowDark}`,
                      minWidth: 200,
                      zIndex: 1000,
                      marginTop: 8,
                      overflow: "hidden",
                      border: `1px solid ${colors.neutralBorder}`,
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: `1px solid ${colors.neutralBorder}`,
                        fontSize: 14,
                      }}
                    >
                      <div style={{ fontWeight: 600, color: colors.textPrimary }}>{userName}</div>
                      <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>User Profile</div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      style={{
                        display: "block",
                        padding: "10px 16px",
                        textDecoration: "none",
                        color: colors.textPrimary,
                        fontSize: 14,
                        borderBottom: `1px solid ${colors.neutralBorder}`,
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = colors.hoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      👤 View Profile
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      style={{
                        display: "block",
                        padding: "10px 16px",
                        textDecoration: "none",
                        color: colors.textPrimary,
                        fontSize: 14,
                        borderBottom: `1px solid ${colors.neutralBorder}`,
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = colors.hoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      📊 Dashboard
                    </Link>

                    <Link
                      href="/recommendations"
                      onClick={() => setShowDropdown(false)}
                      style={{
                        display: "block",
                        padding: "10px 16px",
                        textDecoration: "none",
                        color: colors.textPrimary,
                        fontSize: 14,
                        borderBottom: `1px solid ${colors.neutralBorder}`,
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = colors.hoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      💡 Recommendations
                    </Link>

                    <button
                      onClick={handleLogout}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        border: "none",
                        background: "transparent",
                        color: colors.danger,
                        fontSize: 14,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = colors.dangerLight)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color: colors.headerText, textDecoration: "none", fontSize: 14 }}>
                Login
              </Link>
              <Link
                href="/signup"
                style={{
                  background: colors.primary,
                  color: colors.textInverse,
                  padding: "8px 16px",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.primaryDark)}
                onMouseLeave={(e) => (e.currentTarget.style.background = colors.primary)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
