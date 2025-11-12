/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Proxy API requests to backend in development (Docker Compose)
  async rewrites() {
    // Check if we're in Docker (backend service name indicates Docker)
    const isDocker = process.env.BACKEND_URL && process.env.BACKEND_URL.includes('backend')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL
    
    // If API URL is explicitly set and not using Docker service name, skip proxy
    if (apiUrl && !isDocker && !apiUrl.includes('backend')) {
      return []
    }
    
    // Default: proxy /api/* to backend service in Docker
    // In Docker, use service name; otherwise use configured URL
    const backendUrl = isDocker 
      ? 'http://backend:8080'
      : (apiUrl || process.env.BACKEND_URL || 'http://localhost:8080')
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig

