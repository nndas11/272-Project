"use client"

import { useEffect, useRef, useState } from "react"

export interface Quote {
  symbol: string
  last: number
  ts: string
}

export function useQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectDelayRef = useRef(1000)

  useEffect(() => {
    const connect = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/quotes"
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log("WebSocket connected")
        reconnectDelayRef.current = 1000
        // Subscribe to symbols
        if (symbols.length > 0) {
          ws.send(
            JSON.stringify({
              type: "subscribe",
              symbols: symbols,
            })
          )
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.symbol && data.last) {
            setQuotes((prev) => ({
              ...prev,
              [data.symbol]: {
                symbol: data.symbol,
                last: data.last,
                ts: data.ts || new Date().toISOString(),
              },
            }))
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      ws.onclose = () => {
        console.log("WebSocket disconnected, reconnecting...")
        wsRef.current = null
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(
            reconnectDelayRef.current * 2,
            30000
          )
          connect()
        }, reconnectDelayRef.current)
      }

      wsRef.current = ws
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [])

  // Update subscriptions when symbols change
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && symbols.length > 0) {
      wsRef.current.send(
        JSON.stringify({
          type: "subscribe",
          symbols: symbols,
        })
      )
    }
  }, [symbols])

  return quotes
}


