"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme/ThemeProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

type User = {
  user_id: number;
  email: string;
  full_name: string;
};

type UserBalance = {
  id: number;
  user_id: number;
  currency: string;
  available_balance: number;
  total_balance: number;
  updated_at: string;
};

type Trade = {
  id: number;
  user_id: number;
  company_id: number;
  trade_type: "BUY" | "SELL";
  quantity: number;
  price: number;
  total_price: number;
  trade_timestamp: string;
  symbol?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { colors, componentColors } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Add balance modal
  const [isAddingBalance, setIsAddingBalance] = useState(false);
  const [newCurrency, setNewCurrency] = useState("USD");
  const [newAmount, setNewAmount] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch user data
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setUser(data.user);
        setEditName(data.user.full_name);
        setEditEmail(data.user.email);

        // Fetch balances
        try {
          const balRes = await fetch(`${API_BASE}/user/balances`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (balRes.ok) {
            const balData = await balRes.json();
            setBalances(Array.isArray(balData) ? balData : balData.balances || []);
          }
        } catch (e) {
          console.log("Balances endpoint not available yet");
        }

        // Fetch trades
        try {
          const tradeRes = await fetch(`${API_BASE}/user/trades`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (tradeRes.ok) {
            const tradeData = await tradeRes.json();
            setTrades(Array.isArray(tradeData) ? tradeData : tradeData.trades || []);
          }
        } catch (e) {
          console.log("Trades endpoint not available yet");
        }

        setError("");
      } catch (e) {
        setError("Failed to load user data");
        setTimeout(() => router.push("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, router]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: editName,
          email: editEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const updated = await res.json();
      setUser(updated.user);
      setIsEditingProfile(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  };

  // Handle add balance
  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newAmount) return;

    try {
      const res = await fetch(`${API_BASE}/user/balances`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currency: newCurrency,
          available_balance: parseFloat(newAmount),
          total_balance: parseFloat(newAmount),
        }),
      });

      if (!res.ok) throw new Error("Failed to add balance");

      const newBalance = await res.json();
      setBalances([...balances, newBalance]);
      setIsAddingBalance(false);
      setNewAmount("");
      setSuccess("Balance added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add balance");
    }
  };

  // Handle delete balance
  const handleDeleteBalance = async (balanceId: number) => {
    if (!token || !confirm("Are you sure?")) return;

    try {
      const res = await fetch(`${API_BASE}/user/balances/${balanceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete balance");

      setBalances(balances.filter((b) => b.id !== balanceId));
      setSuccess("Balance deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  // Handle delete trade
  const handleDeleteTrade = async (tradeId: number) => {
    if (!token || !confirm("Are you sure?")) return;

    try {
      const res = await fetch(`${API_BASE}/user/trades/${tradeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete trade");

      setTrades(trades.filter((t) => t.id !== tradeId));
      setSuccess("Trade deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#b00020" }}>
        <div>{error || "Failed to load profile"}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", background: colors.backgroundPrimary }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: `2px solid ${colors.neutralBorder}`, paddingBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: colors.textPrimary }}>User Profile</h1>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: `1px solid ${colors.neutralBorder}`,
            background: colors.neutralLight,
            cursor: "pointer",
            color: colors.textPrimary,
            fontWeight: 500,
          }}
        >
          Logout
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ background: componentColors.alert.error.bg, color: componentColors.alert.error.text, padding: 12, borderRadius: 6, marginBottom: 16, border: `1px solid ${componentColors.alert.error.border}` }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: componentColors.alert.success.bg, color: componentColors.alert.success.text, padding: 12, borderRadius: 6, marginBottom: 16, border: `1px solid ${componentColors.alert.success.border}` }}>
          {success}
        </div>
      )}

      {/* Profile Section */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: colors.textPrimary }}>Account Information</h2>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: `1px solid ${colors.primary}`,
              background: colors.primaryLight,
              color: colors.primary,
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primary;
              e.currentTarget.style.color = colors.textInverse;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primaryLight;
              e.currentTarget.style.color = colors.primary;
            }}
          >
            {isEditingProfile ? "Cancel" : "Edit"}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleUpdateProfile} style={{ display: "grid", gap: 12, maxWidth: 500 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: colors.textPrimary }}>Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  border: `1px solid ${colors.formInputBorder}`,
                  borderRadius: 6,
                  boxSizing: "border-box",
                  background: colors.formInputBg,
                  color: colors.formInputText,
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: colors.textPrimary }}>Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  border: `1px solid ${colors.formInputBorder}`,
                  borderRadius: 6,
                  boxSizing: "border-box",
                  background: colors.formInputBg,
                  color: colors.formInputText,
                  fontFamily: "inherit",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: 10,
                borderRadius: 6,
                background: colors.secondary,
                color: colors.textInverse,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.secondaryDark)}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.secondary)}
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div style={{ background: colors.backgroundSecondary, padding: 16, borderRadius: 8, border: `1px solid ${colors.neutralBorder}` }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: colors.textSecondary, fontSize: 14 }}>Full Name</span>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4, color: colors.textPrimary }}>{user.full_name}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: colors.textSecondary, fontSize: 14 }}>Email</span>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4, color: colors.textPrimary }}>{user.email}</div>
            </div>
            <div>
              <span style={{ color: colors.textSecondary, fontSize: 14 }}>User ID</span>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4, color: colors.textPrimary }}>{user.user_id}</div>
            </div>
          </div>
        )}
      </section>

      {/* Balances Section */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: colors.textPrimary }}>Account Balances</h2>
          <button
            onClick={() => setIsAddingBalance(!isAddingBalance)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: `1px solid ${colors.secondary}`,
              background: colors.secondaryLight,
              color: colors.secondary,
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.secondary;
              e.currentTarget.style.color = colors.textInverse;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.secondaryLight;
              e.currentTarget.style.color = colors.secondary;
            }}
          >
            {isAddingBalance ? "Cancel" : "+ Add Balance"}
          </button>
        </div>

        {isAddingBalance && (
          <form onSubmit={handleAddBalance} style={{ display: "grid", gap: 12, maxWidth: 500, marginBottom: 16, padding: 16, background: colors.backgroundSecondary, borderRadius: 8, border: `1px solid ${colors.neutralBorder}` }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: colors.textPrimary }}>Currency</label>
              <select
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  border: `1px solid ${colors.formInputBorder}`,
                  borderRadius: 6,
                  boxSizing: "border-box",
                  background: colors.formInputBg,
                  color: colors.formInputText,
                  fontFamily: "inherit",
                }}
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>JPY</option>
                <option>CAD</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: colors.textPrimary }}>Amount</label>
              <input
                type="number"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: "100%",
                  padding: 10,
                  border: `1px solid ${colors.formInputBorder}`,
                  borderRadius: 6,
                  boxSizing: "border-box",
                  background: colors.formInputBg,
                  color: colors.formInputText,
                  fontFamily: "inherit",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: 10,
                borderRadius: 6,
                background: colors.secondary,
                color: colors.textInverse,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.secondaryDark)}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.secondary)}
            >
              Add Balance
            </button>
          </form>
        )}

        {balances.length === 0 ? (
          <div style={{ background: colors.backgroundSecondary, padding: 24, borderRadius: 8, textAlign: "center", color: colors.textTertiary, border: `1px solid ${colors.neutralBorder}` }}>
            No balances yet. Add one to get started!
          </div>
        ) : (
          <div style={{ overflowX: "auto", border: `1px solid ${colors.tableBorder}`, borderRadius: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: colors.tableHeaderBg, borderBottom: `2px solid ${colors.tableBorder}` }}>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600, color: colors.tableHeaderText }}>Currency</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600, color: colors.tableHeaderText }}>Available Balance</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600, color: colors.tableHeaderText }}>Total Balance</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600, color: colors.tableHeaderText }}>Last Updated</th>
                  <th style={{ padding: 12, textAlign: "center", fontWeight: 600, color: colors.tableHeaderText }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((balance, index) => (
                  <tr key={balance.id} style={{ borderBottom: `1px solid ${colors.tableBorder}`, background: index % 2 === 0 ? colors.backgroundPrimary : colors.tableRowAlt }}>
                    <td style={{ padding: 12, fontWeight: 600, color: colors.textPrimary }}>{balance.currency}</td>
                    <td style={{ padding: 12, color: colors.textPrimary }}>${balance.available_balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: 12, color: colors.textPrimary }}>${balance.total_balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: 12, fontSize: 14, color: colors.textSecondary }}>{new Date(balance.updated_at).toLocaleDateString()}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteBalance(balance.id)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 4,
                          border: `1px solid ${colors.danger}`,
                          background: colors.dangerLight,
                          color: colors.danger,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 500,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.danger;
                          e.currentTarget.style.color = colors.textInverse;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = colors.dangerLight;
                          e.currentTarget.style.color = colors.danger;
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Trades Section */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: colors.textPrimary }}>Trade History</h2>

        {trades.length === 0 ? (
          <div style={{ background: colors.backgroundSecondary, padding: 24, borderRadius: 8, textAlign: "center", color: colors.textTertiary, border: `1px solid ${colors.neutralBorder}` }}>
            No trades yet. Start trading to see history here!
          </div>
        ) : (
          <div style={{ overflowX: "auto", border: `1px solid ${colors.tableBorder}`, borderRadius: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: colors.tableHeaderBg, borderBottom: `2px solid ${colors.tableBorder}` }}>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600, color: colors.tableHeaderText }}>Date/Time</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600, color: colors.tableHeaderText }}>Type</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600, color: colors.tableHeaderText }}>Symbol</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600, color: colors.tableHeaderText }}>Quantity</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600, color: colors.tableHeaderText }}>Price</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600, color: colors.tableHeaderText }}>Total</th>
                  <th style={{ padding: 12, textAlign: "center", fontWeight: 600, color: colors.tableHeaderText }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, index) => (
                  <tr key={trade.id} style={{ borderBottom: `1px solid ${colors.tableBorder}`, background: index % 2 === 0 ? colors.backgroundPrimary : colors.tableRowAlt }}>
                    <td style={{ padding: 12, fontSize: 14, color: colors.textPrimary }}>{new Date(trade.trade_timestamp).toLocaleString()}</td>
                    <td
                      style={{
                        padding: 12,
                        fontWeight: 600,
                        color: trade.trade_type === "BUY" ? colors.tradeBuy : colors.tradeSell,
                      }}
                    >
                      {trade.trade_type}
                    </td>
                    <td style={{ padding: 12, fontWeight: 600, color: colors.textPrimary }}>{trade.symbol || "N/A"}</td>
                    <td style={{ padding: 12, color: colors.textPrimary }}>{trade.quantity.toFixed(6)}</td>
                    <td style={{ padding: 12, color: colors.textPrimary }}>${trade.price.toFixed(4)}</td>
                    <td style={{ padding: 12, fontWeight: 500, color: colors.textPrimary }}>${trade.total_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteTrade(trade.id)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 4,
                          border: `1px solid ${colors.danger}`,
                          background: colors.dangerLight,
                          color: colors.danger,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 500,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.danger;
                          e.currentTarget.style.color = colors.textInverse;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = colors.dangerLight;
                          e.currentTarget.style.color = colors.danger;
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Back button */}
      <div style={{ paddingTop: 16, borderTop: `1px solid ${colors.neutralBorder}` }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: `1px solid ${colors.primary}`,
            background: colors.primaryLight,
            color: colors.primary,
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.primary;
            e.currentTarget.style.color = colors.textInverse;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.primaryLight;
            e.currentTarget.style.color = colors.primary;
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

