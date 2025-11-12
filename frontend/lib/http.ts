import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

export interface ApiError {
  code?: string
  message: string
  details?: any
}

// Get API base URL from environment variables
// Support both VITE_API_URL (for Vite) and NEXT_PUBLIC_API_URL (for Next.js)
// In Docker Compose, backend service is 'backend' on port 8080
const getApiBaseUrl = (): string => {
  // // For Next.js, check NEXT_PUBLIC_API_URL first
  // if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
  //   return process.env.NEXT_PUBLIC_API_URL
  // }
  
  // // Also check for VITE_API_URL (for Vite projects or compatibility)
  // // In Next.js, we can't use import.meta.env directly, so we check process.env
  // if (typeof process !== 'undefined' && process.env.VITE_API_URL) {
  //   return process.env.VITE_API_URL
  // }
  
  // // Check for legacy NEXT_PUBLIC_API_BASE
  // if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) {
  //   return process.env.NEXT_PUBLIC_API_BASE
  // }
  
  // // Default: localhost for dev, or 'http://backend:8080' if in Docker
  // // In Docker Compose, the backend service name is 'backend'
  // // For browser-side code, we can't detect Docker, so default to localhost:8080
  // // The backend should be accessible at http://localhost:8080 in dev
  // // or http://backend:8080 when running in Docker Compose (server-side only)
  // if (typeof window === 'undefined') {
  //   // Server-side: could be in Docker
  //   const isDocker = typeof process !== 'undefined' && process.env.DOCKER_ENV === 'true'
  //   return isDocker ? 'http://backend:8080' : 'http://localhost:8080'
  // }
  
  // // Client-side: always use localhost or the configured URL
  // return 'http://localhost:8080'
    // Use NEXT_PUBLIC_API_URL for Next.js, which is available on both server and client.
  // Fallback to VITE_API_URL for compatibility.
  // Default to localhost:8080 for local development if nothing is set.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:8080';
  return apiUrl;

}

// Create Axios instance
export const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for auth
  timeout: 30000,
})

// Request interceptor: Add auth token if available
// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     // Try to get token from localStorage (if using bearer tokens)
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
//       if (token && config.headers) {
//         config.headers.Authorization = `Bearer ${token}`
//       }
//     }
//     return config
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error)
//   }
// )

// Response interceptor: Handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token if refresh endpoint exists
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken && typeof window !== 'undefined') {
          const response = await axios.post(`${getApiBaseUrl()}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token } = response.data
          localStorage.setItem('auth_token', access_token)

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`
          }
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          sessionStorage.removeItem('auth_token')
          // Redirect to login will be handled by the app
        }
        return Promise.reject(refreshError)
      }
    }

    // Transform error to ApiError format
    const apiError: ApiError = {
      message: 'An error occurred',
      details: error.response?.data,
    }

    if (error.response) {
      // Server responded with error
      const data = error.response.data as any
      apiError.message = data?.message || data?.detail || error.response.statusText || 'Request failed'
      apiError.code = data?.code || String(error.response.status)
    } else if (error.request) {
      // Request made but no response
      apiError.message = 'Network error - please check your connection'
    } else {
      // Error setting up request
      apiError.message = error.message || 'Request setup failed'
    }

    return Promise.reject(apiError)
  }
)

// Typed wrapper functions for convenience
export const apiGet = <T = any>(url: string, config?: any) => {
  return api.get<T>(url, config).then((res) => res.data)
}

export const apiPost = <T = any>(url: string, data?: any, config?: any) => {
  return api.post<T>(url, data, config).then((res) => res.data)
}

export const apiPut = <T = any>(url: string, data?: any, config?: any) => {
  return api.put<T>(url, data, config).then((res) => res.data)
}

export const apiPatch = <T = any>(url: string, data?: any, config?: any) => {
  return api.patch<T>(url, data, config).then((res) => res.data)
}

export const apiDelete = <T = any>(url: string, config?: any) => {
  return api.delete<T>(url, config).then((res) => res.data)
}

