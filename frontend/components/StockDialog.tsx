"use client"

import React, { useState, useEffect } from "react"
import { apiGet, apiPost } from "@/lib/api"
import { useQuotes } from "@/app/providers/QuoteProvider"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface StockDialogProps {
  symbol: string
  onClose: () => void
}

interface Quote {
  symbol: string
  last: number
  ts: string
  high?: number
  low?: number
  volume?: number
}

export function StockDialog({ symbol, onClose }: StockDialogProps) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [qty, setQty] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { quotes, subscribe } = useQuotes()

  // Subscribe to this symbol's quotes
  useEffect(() => {
    subscribe([symbol])
  }, [symbol, subscribe])

  // Fetch initial quote
  useEffect(() => {
    apiGet<{ symbol: string; price: number | null; ts?: number }>(
      `/api/market/quote?symbol=${symbol}`
    )
      .then((data) => {
        setQuote({
          symbol: data.symbol,
          last: data.price ?? 0,
          ts: new Date(data.ts || Date.now()).toISOString(),
        })
      })
      .catch(console.error)
  }, [symbol])

  // Update quote from WebSocket/REST
  useEffect(() => {
    const wsQuote = quotes[symbol]
    if (wsQuote && wsQuote.price !== null) {
      setQuote((prev) => ({
        ...prev,
        last: wsQuote.price ?? prev?.last ?? 0,
        ts: new Date(wsQuote.ts || Date.now()).toISOString(),
      }))
    }
  }, [quotes, symbol])

  const handleOrder = async (side: "BUY" | "SELL") => {
    const quantity = parseFloat(qty)
    if (!quantity || quantity <= 0) {
      setError("Invalid quantity")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await apiPost("/api/orders", {
        symbol,
        side,
        qty: quantity,
      })
      setSuccess(`Order ${side} ${quantity} ${symbol} submitted successfully`)
      setQty("")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message || "Order failed")
    } finally {
      setLoading(false)
    }
  }

  // Mock chart data (would need real historical data)
  const chartData = React.useMemo(() => {
    if (!quote) return []
    // Generate mock intraday data
    const data = []
    const now = new Date()
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      const basePrice = quote.last || 100
      const variation = (Math.random() - 0.5) * 2
      data.push({
        time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        price: basePrice + variation,
      })
    }
    return data
  }, [quote])

  if (!quote) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {symbol} - {quote.last ? `$${quote.last.toFixed(2)}` : "N/A"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Quote Details</h3>
            <div className="space-y-2 text-sm">
              <div>Last Price: ${quote.last?.toFixed(2)}</div>
              {quote.high && <div>Day High: ${quote.high.toFixed(2)}</div>}
              {quote.low && <div>Day Low: ${quote.low.toFixed(2)}</div>}
              {quote.volume && <div>Volume: {quote.volume.toLocaleString()}</div>}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Intraday Chart (1D)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Place Order</h3>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-2 rounded mb-4">
              {success}
            </div>
          )}
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Quantity"
              className="flex-1 px-3 py-2 border rounded-md"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <button
              onClick={() => handleOrder("BUY")}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Buy
            </button>
            <button
              onClick={() => handleOrder("SELL")}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


