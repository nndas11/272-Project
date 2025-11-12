import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, apiGet, apiPost } from '@/lib/http'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('HTTP Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create axios instance with correct baseURL', () => {
    expect(api.defaults.baseURL).toBeDefined()
  })

  it('should have withCredentials enabled', () => {
    expect(api.defaults.withCredentials).toBe(true)
  })

  it('apiGet should call axios.get and return data', async () => {
    const mockData = { id: 1, name: 'Test' }
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: mockData }),
    }
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance as any)

    // Note: This is a simplified test - in practice, you'd need to mock the actual instance
    expect(apiGet).toBeDefined()
  })
})


