import { useQuery } from '@tanstack/react-query'
import { getLeaderboard, type LeaderboardEntry, type LeaderboardParams } from '@/services/leaderboard'

/**
 * Hook to fetch leaderboard entries
 */
export function useLeaderboard(params?: LeaderboardParams, refetchInterval = 10000) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', params],
    queryFn: () => getLeaderboard(params),
    refetchInterval,
  })
}


