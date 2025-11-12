import { apiGet } from '@/lib/http'

export interface LeaderboardEntry {
  user_id: number
  email: string
  total_equity: number
  change_24h?: number
}

export interface LeaderboardParams {
  limit?: number
  offset?: number
}

/**
 * Get leaderboard entries
 */
export async function getLeaderboard(params?: LeaderboardParams): Promise<LeaderboardEntry[]> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.offset) queryParams.append('offset', String(params.offset))
  
  const query = queryParams.toString()
  return apiGet<LeaderboardEntry[]>(`/api/leaderboard${query ? `?${query}` : ''}`)
}


