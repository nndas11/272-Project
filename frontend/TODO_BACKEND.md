# Backend Integration TODOs

This document lists items that need to be coordinated with the backend team.

## OpenAPI/Swagger Specification

**Status**: Not found

The backend is currently using Flask (not FastAPI), so there's no OpenAPI specification available. 

**Recommendation**: 
- Consider adding Flask-RESTX or similar to generate OpenAPI docs
- Or manually create an OpenAPI spec at `/openapi.json` or `/swagger.json`
- Once available, we can generate TypeScript types using `openapi-typescript`

**Current approach**: Types are manually defined in `services/*.ts` based on API usage. These should be reconciled with the actual backend schema.

## CORS Configuration

**Status**: Needs verification

The backend has `CORS(app)` enabled, but should verify:

1. **Allowed Origins**: Ensure these origins are whitelisted:
   - `http://localhost:3000` (Next.js dev)
   - `http://localhost:5173` (Vite dev, if used)
   - Production frontend domain(s)

2. **Credentials**: Frontend uses `withCredentials: true`, so backend must allow:
   ```python
   CORS(app, supports_credentials=True)
   ```

3. **Headers**: Ensure these headers are allowed:
   - `Content-Type`
   - `Authorization` (if using bearer tokens)

## API Endpoints

**Status**: Partially implemented

The frontend expects these endpoints. Please verify they exist and match the expected request/response formats:

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Signup
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token (optional, for token refresh flow)

### Market Data
- `GET /api/market/symbols` - Get list of trading symbols
- `GET /api/market/quote?symbol={symbol}` - Get quote for single symbol
- `GET /api/market/quotes?symbols={symbols}` - Get quotes for multiple symbols

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `DELETE /api/orders/{id}` - Cancel order

### Portfolio
- `GET /api/portfolio` - Get user's portfolio

### Leaderboard
- `GET /api/leaderboard?limit={limit}&offset={offset}` - Get leaderboard entries

### Health
- `GET /health` - Health check (already exists ✅)

## WebSocket Endpoints

**Status**: Needs verification

The frontend expects:
- `ws://{host}/ws/quotes?symbols={symbols}` - WebSocket for real-time quotes

Current backend has `/prices/stream` (SSE) but frontend expects WebSocket. Please verify:
1. WebSocket endpoint exists at `/ws/quotes`
2. Accepts `symbols` query parameter
3. Sends messages in format: `{ symbol: string, price: number | null, ts?: number }`

## Port Configuration

**Status**: Mismatch detected

- Backend runs on port **5050** (from `app.py`)
- Frontend expects port **8080** (as per requirements)

**Action needed**: Either:
1. Update backend to run on port 8080, OR
2. Update frontend `.env.example` and default to port 5050

## Error Response Format

**Status**: Needs standardization

Frontend expects errors in this format:
```typescript
{
  message: string
  code?: string
  details?: any
}
```

Please ensure all error responses follow this format.

## Authentication

**Status**: Needs clarification

Current implementation supports:
1. **Cookie-based auth** (using `withCredentials: true`)
2. **Bearer token** (via localStorage, if refresh endpoint exists)

**Questions for backend team**:
- Which method is preferred?
- If bearer tokens, what's the refresh token flow?
- Token expiration time?
- Should tokens be stored in httpOnly cookies (more secure)?

## Response Types

**Status**: Types defined, need backend confirmation

See `services/*.ts` for expected response types. Please verify:
- Field names match (snake_case vs camelCase)
- Required vs optional fields
- Data types (numbers, strings, dates)

## Rate Limiting

**Status**: Unknown

Frontend polls some endpoints every 5-10 seconds. Please confirm:
- Rate limits on endpoints
- Recommended polling intervals
- WebSocket vs polling preference

## Testing

**Status**: Frontend tests ready

Frontend has:
- Unit tests with Vitest
- E2E tests with Playwright

**Recommendation**: 
- Provide a test/staging backend instance for E2E tests
- Or mock backend responses in tests (MSW is already set up)


