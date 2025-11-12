import { useQuery } from '@tanstack/react-query'
import { getSymbols, getQuote, type Symbol, type QuoteResponse } from '@/services/market'

/**
 * Hook to fetch available trading symbols
 */
export function useSymbols() {
  return useQuery<Symbol[]>({
    queryKey: ['market', 'symbols'],
    queryFn: getSymbols,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch quote for a single symbol
 */
export function useQuote(symbol: string | undefined, enabled = true) {
  return useQuery<QuoteResponse>({
    queryKey: ['market', 'quote', symbol],
    queryFn: () => getQuote(symbol!),
    enabled: enabled && !!symbol,
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}


