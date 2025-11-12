"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

type Quote = { symbol: string; price: number | null; ts?: number }
type QuoteMap = Record<string, Quote>

const QuoteCtx = createContext<{ quotes: QuoteMap; subscribe: (syms: string[]) => void }>({
  quotes: {},
  subscribe: () => {},
})

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<QuoteMap>({})
  const wanted = useRef<Set<string>>(new Set())
  const wsRef = useRef<WebSocket | null>(null)
  
  // Get API base URL - use NEXT_PUBLIC_API_URL or fallback to default
  const getApiBase = () => {
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL
    }
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) {
      return process.env.NEXT_PUBLIC_API_BASE
    }
    return "http://localhost:8080"
  }
  const apiBase = getApiBase()

  const merge = (patch: Quote[]) =>
    setQuotes((prev) => {
      const next = { ...prev }
      for (const q of patch) next[q.symbol] = q
      return next
    })

  const openWS = () => {
    try {
      const syms = [...wanted.current].join(",")
      if (!syms) return

      const ws = new WebSocket(
        `${apiBase.replace("http", "ws")}/ws/quotes?symbols=${encodeURIComponent(syms)}`
      )
      wsRef.current = ws

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data) // allow single or array
          const arr = Array.isArray(data) ? data : [data]
          const patch = arr
            .filter((d) => d?.symbol)
            .map((d) => ({
              symbol: d.symbol,
              price: d.price ?? null,
              ts: d.ts ?? Date.now(),
            }))
          if (patch.length) merge(patch)
        } catch {}
      }

      ws.onclose = () => {
        wsRef.current = null
      }

      ws.onerror = () => {
        try {
          ws.close()
        } catch {}
        wsRef.current = null
      }
    } catch {}
  }

  const pollREST = async () => {
    const syms = [...wanted.current]
    if (!syms.length) return

    try {
      // Use the centralized API client
      const { apiGet } = await import('@/lib/http')
      const arr = await apiGet<any[]>(`/api/market/quotes?symbols=${encodeURIComponent(syms.join(","))}`)
      const patch = (Array.isArray(arr) ? arr : []).map((d: any) => ({
        symbol: d.symbol,
        price: d.price ?? null,
        ts: d.ts ?? Date.now(),
      }))
      if (patch.length) merge(patch)
    } catch {}
  }

  useEffect(() => {
    const id = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== wsRef.current.OPEN) pollREST()
    }, 3_000)

    return () => clearInterval(id)
  }, [])

  const subscribe = (syms: string[]) => {
    syms.forEach((s) => wanted.current.add(s))
    // reopen socket with new symbol list
    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch {}
      wsRef.current = null
    }
    openWS()
    // also fetch immediately for first paint
    pollREST()
  }

  const value = useMemo(() => ({ quotes, subscribe }), [quotes])

  return <QuoteCtx.Provider value={value}>{children}</QuoteCtx.Provider>
}

export const useQuotes = () => useContext(QuoteCtx)

