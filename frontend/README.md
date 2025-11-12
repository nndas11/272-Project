# Mock Stock Trading Frontend

React/Next.js frontend for the mock stock trading application.

## Features

- **Centralized API Client**: Axios-based HTTP client with interceptors for auth and error handling
- **Type-Safe Services**: Typed service wrappers for all API endpoints
- **React Query Integration**: Data fetching and caching with React Query hooks
- **Health Check**: Backend connectivity monitoring
- **Testing**: Unit tests with Vitest + React Testing Library, E2E tests with Playwright

## Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Backend service running (see backend README)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# WebSocket URL (optional, auto-constructed from API URL)
# NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws/quotes
```

### Docker Compose

When running in Docker Compose, the backend service is accessible at `http://backend:8080`. 
For client-side code, use `http://localhost:8080` (mapped via Docker network).

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# The app will be available at http://localhost:3000
```

### With Docker Compose

```bash
# From project root
docker-compose up frontend

# Or build and run
docker-compose build frontend
docker-compose up frontend
```

The frontend will be available at `http://localhost:3000` (or the port configured in docker-compose.yml).

## Building for Production

```bash
# Build
npm run build

# Start production server
npm start

# Or preview
npm run preview
```

### Docker Production Build

```bash
# Build Docker image
docker build -t mock-stock-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:8080 \
  mock-stock-frontend
```

## Testing

### Unit Tests

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# UI mode
npm run test:ui

# Coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# UI mode
npm run test:e2e:ui
```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── (protected)/        # Protected routes
│   ├── leaderboard/       # Leaderboard page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── providers.tsx      # React Query provider
├── components/            # React components
│   ├── ui/                # UI components
│   ├── HealthCheck.tsx    # Health check component
│   ├── OrdersTable.tsx    # Orders table
│   ├── PortfolioCard.tsx  # Portfolio display
│   ├── StockDialog.tsx    # Stock trading dialog
│   └── StockList.tsx       # Stock list
├── hooks/                 # Custom hooks
│   ├── api/               # API hooks (React Query)
│   │   ├── useHealth.ts
│   ├── useLeaderboard.ts
│   ├── useMarket.ts
│   ├── useOrders.ts
│   └── usePortfolio.ts
│   └── useQuotes.ts       # WebSocket quotes hook
├── lib/                   # Utilities
│   ├── api.ts             # Legacy API exports (re-exports from http.ts)
│   ├── auth.ts            # Authentication functions
│   ├── http.ts            # Centralized Axios client
│   └── utils.ts           # Utility functions
├── services/              # API service wrappers
│   ├── health.ts
│   ├── leaderboard.ts
│   ├── market.ts
│   ├── orders.ts
│   └── portfolio.ts
└── tests/                 # Tests
    ├── components/        # Component tests
    ├── lib/              # Library tests
    └── *.spec.ts         # E2E tests
```

## API Integration

### HTTP Client

All API calls use the centralized client in `lib/http.ts`:

```typescript
import { apiGet, apiPost } from '@/lib/http'

// GET request
const data = await apiGet<ResponseType>('/api/endpoint')

// POST request
const result = await apiPost<ResponseType>('/api/endpoint', { data })
```

### Service Wrappers

Use typed service functions:

```typescript
import { getSymbols, getQuote } from '@/services/market'

const symbols = await getSymbols()
const quote = await getQuote('AAPL')
```

### React Query Hooks

Use hooks for data fetching with caching:

```typescript
import { useSymbols, useQuote } from '@/hooks/api/useMarket'

function MyComponent() {
  const { data: symbols, isLoading } = useSymbols()
  const { data: quote } = useQuote('AAPL')
  
  // ...
}
```

## Backend Integration

### API Base URL

The frontend connects to the backend using `NEXT_PUBLIC_API_URL`. 

- **Local dev**: `http://localhost:8080`
- **Docker Compose**: `http://backend:8080` (server-side) or `http://localhost:8080` (client-side, via port mapping)

### CORS

Ensure the backend has CORS enabled for:
- `http://localhost:3000` (dev)
- `http://localhost:5173` (if using Vite)
- Your production domain

### Health Check

The `HealthCheck` component monitors backend connectivity. Add it to any page:

```tsx
import { HealthCheck } from '@/components/HealthCheck'

<HealthCheck />
```

## Troubleshooting

### API Connection Issues

1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend is running and accessible
3. Check browser console for CORS errors
4. Use the HealthCheck component to diagnose

### WebSocket Issues

1. Verify `NEXT_PUBLIC_WS_URL` or ensure API URL is correct (WS URL is auto-constructed)
2. Check backend WebSocket endpoint is available
3. Review browser console for connection errors

### Build Issues

1. Clear `.next` directory: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run lint`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:ui` - Run tests in UI mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run E2E tests in UI mode

## License

See project root LICENSE file.


