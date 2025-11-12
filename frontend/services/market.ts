import { apiGet } from '@/lib/http'

export interface Symbol {
  symbol: string
  name: string
  exchange?: string
}

export interface Quote {
  symbol: string
  price: number | null
  ts?: number
}

export interface QuoteResponse {
  symbol: string
  price: number | null
  ts?: number
}

/**
 * Get list of available trading symbols
 */
export async function getSymbols(): Promise<Symbol[]> {
  return apiGet<Symbol[]>('/api/market/symbols')
}

/**
 * Get quote for a single symbol
 */
export async function getQuote(symbol: string): Promise<QuoteResponse> {
  return apiGet<QuoteResponse>(`/api/market/quote?symbol=${encodeURIComponent(symbol)}`)
}

/**
 * Get quotes for multiple symbols
 */
export async function getQuotes(symbols: string[]): Promise<QuoteResponse[]> {
  const symbolsParam = symbols.join(',')
  return apiGet<QuoteResponse[]>(`/api/market/quotes?symbols=${encodeURIComponent(symbolsParam)}`)
}


