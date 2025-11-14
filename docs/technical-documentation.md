# Technical Documentation

## Docker Setup

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed

### Environment Setup
1. Copy `.env.example` to `.env` and update the values.
2. Run `docker-compose up -d` to start the application.
3. The backend will be available at `http://localhost:5050`.

## Schemas

### Database Schemas
The database consists of 8 tables:
- `users`: Stores user account information.
- `companies`: Stores information about publicly traded companies.
- `stock_prices`: Stores historical stock price data.
- `income_statement`: Stores financial income statement data.
- `balance_sheet`: Stores financial position data.
- `cash_flow`: Stores cash flow statement data.
- `user_trades`: Records all buy and sell transactions executed by users.
- `user_balances`: Tracks cash balances and holdings for each user.

### API Schemas
The API documentation includes schemas for:
- Authentication endpoints (`/auth/signup`, `/auth/login`, `/auth/me`)
- Price endpoints (`/prices/now`, `/prices/stream`)
- User dashboard endpoints (`/user/profile`, `/user/balances`, `/user/trades`)

## Components Documentation

### Header Component
- **Location**: `frontend/web/src/app/components/Header.tsx`
- **Purpose**: Navigation header with user profile icon and dropdown menu.
- **Features**: Profile icon with user name, dropdown menu, conditional rendering, responsive design, and theme toggle button.

### Profile Page
- **Location**: `frontend/web/src/app/profile/page.tsx`
- **Purpose**: Complete user profile management interface.
- **Features**: Account information display/edit, balance management, trade history viewing and deletion, error and success notifications, and protected route.
