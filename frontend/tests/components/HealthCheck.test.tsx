import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HealthCheck } from '@/components/HealthCheck'
import * as useHealthHook from '@/hooks/api/useHealth'

// Mock the useHealth hook
vi.mock('@/hooks/api/useHealth')

describe('HealthCheck', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  it('should show loading state', () => {
    vi.mocked(useHealthHook.useHealth).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
    } as any)

    render(<HealthCheck />, { wrapper: createWrapper() })
    expect(screen.getByText(/Checking backend health/i)).toBeInTheDocument()
  })

  it('should show error state', () => {
    vi.mocked(useHealthHook.useHealth).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Connection failed'),
      isError: true,
    } as any)

    render(<HealthCheck />, { wrapper: createWrapper() })
    expect(screen.getByText(/Backend Unavailable/i)).toBeInTheDocument()
  })

  it('should show healthy state', () => {
    vi.mocked(useHealthHook.useHealth).mockReturnValue({
      data: { status: 'ok', symbols: ['AAPL', 'MSFT'] },
      isLoading: false,
      error: null,
      isError: false,
    } as any)

    render(<HealthCheck />, { wrapper: createWrapper() })
    expect(screen.getByText(/Healthy/i)).toBeInTheDocument()
    expect(screen.getByText(/2 symbols/i)).toBeInTheDocument()
  })
})


