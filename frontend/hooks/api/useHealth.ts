import { useQuery } from '@tanstack/react-query'
import { checkHealth, type HealthResponse } from '@/services/health'

/**
 * Hook to check backend health status
 */
export function useHealth(refetchInterval = 30000) {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: checkHealth,
    refetchInterval,
    retry: 1,
  })
}


