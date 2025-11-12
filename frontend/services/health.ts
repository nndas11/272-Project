import { apiGet } from '@/lib/http'

export interface HealthResponse {
  status: string
  symbols?: string[]
  timestamp?: string
}

/**
 * Check backend health status
 */
export async function checkHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/health')
}


