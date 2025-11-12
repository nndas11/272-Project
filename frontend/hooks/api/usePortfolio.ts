import { useQuery } from '@tanstack/react-query'
import { getPortfolio, type Portfolio } from '@/services/portfolio'

/**
 * Hook to fetch user's portfolio
 */
export function usePortfolio(refetchInterval = 5000) {
  return useQuery<Portfolio>({
    queryKey: ['portfolio'],
    queryFn: getPortfolio,
    refetchInterval,
  })
}


