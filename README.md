# Mock Stock Trading App

A production-quality mock stock trading application with real-time market data, portfolio management, and leaderboard features.

## Tech Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Alembic, Uvicorn
- **Database**: PostgreSQL
- **Real-time Market Data**: Finnhub WebSocket (stocks)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Auth**: Email/password with JWT (HttpOnly cookies)
- **Packaging**: Docker & docker-compose

## Features

- User authentication (sign up, login, logout)
- Live stock quotes via WebSocket
- Real-time portfolio tracking
- Mock trading (Buy/Sell orders)
- Position management with P&L
- Global leaderboard
- Intraday candlestick charts
- Responsive design with dark mode support

## Prerequisites

- Docker and Docker Compose
- Finnhub API key (free tier available at https://finnhub.io)

## Setup

1. **Clone the repository** (if applicable)

2. **Set up environment variables**

   Create a `.env` file in the project root:
   ```env
   FINNHUB_API_KEY=your_finnhub_api_key_here
   JWT_SECRET=your-secret-key-change-in-production
   ```

3. **Start the services**

   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL database on port 5432
   - FastAPI backend on port 8000
   - Next.js frontend on port 3000

4. **Run database migrations**

   ```bash
   docker-compose exec backend alembic upgrade head
   ```

   If this is the first run, create the initial migration:
   ```bash
   docker-compose exec backend alembic revision --autogenerate -m "init"
   docker-compose exec backend alembic upgrade head
   ```

5. **Seed symbols** (optional)

   ```bash
   docker-compose exec backend curl -X POST http://localhost:8000/api/admin/seed-symbols
   ```

## Development

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up .env file
cp .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install

# Set up .env.local
echo "NEXT_PUBLIC_API_BASE=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/quotes" >> .env.local

# Start dev server
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Market Data
- `GET /api/market/symbols?query=` - Search symbols
- `GET /api/market/quote?symbol=` - Get quote for symbol
- `WS /ws/quotes?symbols=AAPL,MSFT` - WebSocket for live quotes

### Portfolio & Trading
- `GET /api/portfolio` - Get user portfolio
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order

### Leaderboard
- `GET /api/leaderboard?limit=10` - Get leaderboard

### Admin
- `POST /api/admin/seed-symbols` - Seed default symbols (dev only)

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend E2E Tests

```bash
cd frontend
npm run test:e2e
```

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py             # Configuration
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routers/             # API routers
│   │   ├── services/            # Business logic
│   │   ├── ws/                  # WebSocket clients
│   │   └── db/                  # Database setup
│   ├── migrations/              # Alembic migrations
│   ├── tests/                   # Backend tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/                     # Next.js App Router
│   │   ├── (protected)/         # Protected routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── leaderboard/
│   ├── components/              # React components
│   ├── lib/                     # Utilities
│   ├── hooks/                   # React hooks
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Security Notes

- JWT tokens are stored in HttpOnly cookies
- Passwords are hashed using Argon2id
- CORS is configured to allow only specified origins
- All user inputs are validated
- This is a mock trading app - no real money or brokerage execution

## License

This is an educational project. See disclaimer in the app footer.

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL is running and accessible
- Check DATABASE_URL in .env matches docker-compose settings

### WebSocket connection issues
- Verify FINNHUB_API_KEY is set correctly
- Check backend logs for WebSocket connection errors
- Ensure CORS_ORIGINS includes your frontend URL

### Frontend build issues
- Clear `.next` directory: `rm -rf frontend/.next`
- Reinstall dependencies: `cd frontend && rm -rf node_modules && npm install`

## Acceptance Criteria Checklist

- ✅ Sign up, log in, and stay logged in (cookie)
- ✅ Dashboard renders live-updating list of symbols with last price & change from WS
- ✅ Clicking a symbol opens a modal with intraday chart and stats
- ✅ Submit Buy/Sell orders; portfolio, positions, orders update immediately
- ✅ Leaderboard shows top users by total equity and includes current user
- ✅ Refresh does not lose auth; protected routes redirect when unauthenticated
- ✅ All services run via docker-compose


