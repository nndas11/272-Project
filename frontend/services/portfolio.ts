import { apiGet } from '@/lib/http'

export interface Position {
  symbol: string
  qty: number
  avg_cost: number
  mkt_price?: number
  mkt_value?: number
  pnl?: number
}

export interface Portfolio {
  cash: number
  positions: Position[]
  total_equity?: number
}

/**
 * Get current user's portfolio
 */
export async function getPortfolio(): Promise<Portfolio> {
  return apiGet<Portfolio>('/api/portfolio')
}


