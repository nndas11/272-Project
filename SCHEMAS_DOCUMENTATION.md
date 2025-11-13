# Schemas Documentation

## Overview
This document provides comprehensive documentation of all data schemas used in the 272-Project stock trading platform. The schemas are organized into database tables, API request/response schemas, and in-memory data structures.

---

## Database Schemas

### 1. Users Table
**Purpose**: Stores user account information and authentication credentials.

```sql
CREATE TABLE users (
  user_id       SERIAL PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user_id` | SERIAL | PRIMARY KEY | Unique user identifier |
| `full_name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | User's email address (must be unique) |
| `password_hash` | TEXT | NOT NULL | Bcrypt hashed password |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Example Record**:
```json
{
  "user_id": 1,
  "full_name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "password_hash": "$2b$12$...",
  "created_at": "2025-11-01T10:15:30"
}
```

---

### 2. Companies Table
**Purpose**: Stores information about publicly traded companies.

```sql
CREATE TABLE companies (
    companies_id SERIAL PRIMARY KEY,
    longName VARCHAR(255) NOT NULL,
    Symbol VARCHAR(300),
    sector VARCHAR(100),
    industry VARCHAR(150),
    country VARCHAR(100),
    marketCap NUMERIC(20,2),
    dividendYield NUMERIC(10,6),
    trailingPE NUMERIC(10,2),
    beta NUMERIC(10,3),
    website TEXT
)
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `companies_id` | SERIAL | PRIMARY KEY | Unique company identifier |
| `longName` | VARCHAR(255) | NOT NULL | Full company name |
| `Symbol` | VARCHAR(300) | - | Stock ticker symbol (e.g., "AAPL") |
| `sector` | VARCHAR(100) | - | Business sector (e.g., "Technology") |
| `industry` | VARCHAR(150) | - | Specific industry classification |
| `country` | VARCHAR(100) | - | Country of headquarters |
| `marketCap` | NUMERIC(20,2) | - | Market capitalization in USD |
| `dividendYield` | NUMERIC(10,6) | - | Annual dividend yield percentage |
| `trailingPE` | NUMERIC(10,2) | - | Price-to-earnings ratio |
| `beta` | NUMERIC(10,3) | - | Stock volatility measure |
| `website` | TEXT | - | Company website URL |

**Example Record**:
```json
{
  "companies_id": 1,
  "longName": "Apple Inc.",
  "Symbol": "AAPL",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "country": "United States",
  "marketCap": 2800000000000.00,
  "dividendYield": 0.004500,
  "trailingPE": 28.50,
  "beta": 1.237,
  "website": "https://www.apple.com"
}
```

---

### 3. Stock Prices Table
**Purpose**: Stores historical stock price data at various time intervals.

```sql
CREATE TABLE stock_prices (
    id SERIAL PRIMARY KEY,
    companies_id INT NOT NULL REFERENCES companies(companies_id) ON DELETE CASCADE,
    trade_timestamp TIMESTAMP NOT NULL,
    open NUMERIC(12,4),
    high NUMERIC(12,4),
    low NUMERIC(12,4),
    close NUMERIC(12,4),
    adj_close NUMERIC(12,4),
    volume BIGINT
)
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique price record identifier |
| `companies_id` | INT | FOREIGN KEY | Reference to companies table |
| `trade_timestamp` | TIMESTAMP | NOT NULL | Date/time of price data |
| `open` | NUMERIC(12,4) | - | Opening price |
| `high` | NUMERIC(12,4) | - | Highest price during period |
| `low` | NUMERIC(12,4) | - | Lowest price during period |
| `close` | NUMERIC(12,4) | - | Closing price |
| `adj_close` | NUMERIC(12,4) | - | Adjusted closing price (dividend/split adjusted) |
| `volume` | BIGINT | - | Number of shares traded |

**Example Record**:
```json
{
  "id": 100,
  "companies_id": 1,
  "trade_timestamp": "2025-11-10T16:00:00",
  "open": 180.50,
  "high": 182.75,
  "low": 179.80,
  "close": 182.30,
  "adj_close": 182.30,
  "volume": 52350000
}
```

---

### 4. Income Statement Table
**Purpose**: Stores financial income statement data for companies (annual and quarterly).

```sql
CREATE TABLE income_statement (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(companies_id),
    period_end_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL,  -- 'annual' or 'quarterly'
    total_revenue NUMERIC(20,2),
    cost_of_revenue NUMERIC(20,2),
    gross_profit NUMERIC(20,2),
    research_and_development NUMERIC(20,2),
    selling_general_admin NUMERIC(20,2),
    operating_income NUMERIC(20,2),
    interest_expense NUMERIC(20,2),
    income_before_tax NUMERIC(20,2),
    income_tax_expense NUMERIC(20,2),
    net_income NUMERIC(20,2),
    diluted_eps NUMERIC(10,4)
)
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Unique record identifier |
| `company_id` | INT | Reference to companies table |
| `period_end_date` | DATE | End date of the reporting period |
| `period_type` | VARCHAR(20) | "annual" or "quarterly" |
| `total_revenue` | NUMERIC(20,2) | Total revenue generated |
| `cost_of_revenue` | NUMERIC(20,2) | Direct costs to produce goods |
| `gross_profit` | NUMERIC(20,2) | Revenue minus cost of revenue |
| `research_and_development` | NUMERIC(20,2) | R&D expenses |
| `selling_general_admin` | NUMERIC(20,2) | SG&A expenses |
| `operating_income` | NUMERIC(20,2) | Income from operations |
| `interest_expense` | NUMERIC(20,2) | Interest paid on debt |
| `income_before_tax` | NUMERIC(20,2) | Pre-tax income |
| `income_tax_expense` | NUMERIC(20,2) | Taxes owed/paid |
| `net_income` | NUMERIC(20,2) | Bottom line profit |
| `diluted_eps` | NUMERIC(10,4) | Earnings per share (diluted) |

**Example Record**:
```json
{
  "id": 1,
  "company_id": 1,
  "period_end_date": "2025-09-30",
  "period_type": "quarterly",
  "total_revenue": 89500000000.00,
  "cost_of_revenue": 46200000000.00,
  "gross_profit": 43300000000.00,
  "research_and_development": 8500000000.00,
  "selling_general_admin": 6800000000.00,
  "operating_income": 28000000000.00,
  "interest_expense": 125000000.00,
  "income_before_tax": 27875000000.00,
  "income_tax_expense": 4200000000.00,
  "net_income": 23675000000.00,
  "diluted_eps": 1.50
}
```

---

### 5. Balance Sheet Table
**Purpose**: Stores financial position data (assets, liabilities, equity) at period end.

```sql
CREATE TABLE balance_sheet (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(companies_id),
    period_end_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL,  -- 'annual' or 'quarterly'
    cash_and_cash_equivalents NUMERIC(20,2),
    short_term_investments NUMERIC(20,2),
    accounts_receivable NUMERIC(20,2),
    inventory NUMERIC(20,2),
    total_current_assets NUMERIC(20,2),
    property_plant_equipment_net NUMERIC(20,2),
    goodwill NUMERIC(20,2),
    total_assets NUMERIC(20,2),
    accounts_payable NUMERIC(20,2),
    short_long_term_debt_total NUMERIC(20,2),
    total_current_liabilities NUMERIC(20,2),
    total_liabilities NUMERIC(20,2),
    total_shareholder_equity NUMERIC(20,2),
    retained_earnings NUMERIC(20,2)
)
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Unique record identifier |
| `company_id` | INT | Reference to companies table |
| `period_end_date` | DATE | Balance sheet date |
| `period_type` | VARCHAR(20) | "annual" or "quarterly" |
| `cash_and_cash_equivalents` | NUMERIC(20,2) | Cash on hand and equivalents |
| `short_term_investments` | NUMERIC(20,2) | Investments due < 1 year |
| `accounts_receivable` | NUMERIC(20,2) | Money owed by customers |
| `inventory` | NUMERIC(20,2) | Goods held for sale |
| `total_current_assets` | NUMERIC(20,2) | Assets due within 1 year |
| `property_plant_equipment_net` | NUMERIC(20,2) | Net fixed assets |
| `goodwill` | NUMERIC(20,2) | Acquisition premium |
| `total_assets` | NUMERIC(20,2) | Total company assets |
| `accounts_payable` | NUMERIC(20,2) | Money owed to suppliers |
| `short_long_term_debt_total` | NUMERIC(20,2) | Total debt |
| `total_current_liabilities` | NUMERIC(20,2) | Liabilities due within 1 year |
| `total_liabilities` | NUMERIC(20,2) | All company liabilities |
| `total_shareholder_equity` | NUMERIC(20,2) | Owner's equity |
| `retained_earnings` | NUMERIC(20,2) | Cumulative undistributed profits |

**Example Record**:
```json
{
  "id": 1,
  "company_id": 1,
  "period_end_date": "2025-09-30",
  "period_type": "quarterly",
  "cash_and_cash_equivalents": 29200000000.00,
  "short_term_investments": 13500000000.00,
  "accounts_receivable": 25800000000.00,
  "inventory": 4800000000.00,
  "total_current_assets": 73300000000.00,
  "property_plant_equipment_net": 42100000000.00,
  "goodwill": 15600000000.00,
  "total_assets": 352900000000.00,
  "accounts_payable": 62300000000.00,
  "short_long_term_debt_total": 108400000000.00,
  "total_current_liabilities": 123200000000.00,
  "total_liabilities": 231500000000.00,
  "total_shareholder_equity": 121400000000.00,
  "retained_earnings": 94800000000.00
}
```

---

### 6. Cash Flow Table
**Purpose**: Stores cash flow statement data for companies.

```sql
CREATE TABLE cash_flow (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(companies_id),
    period_end_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL,  -- 'annual' or 'quarterly'
    net_cash_from_operating_activities NUMERIC(20,2),
    capital_expenditures NUMERIC(20,2),
    net_cash_from_investing_activities NUMERIC(20,2),
    net_cash_from_financing_activities NUMERIC(20,2),
    dividends_paid NUMERIC(20,2),
    repurchase_of_stock NUMERIC(20,2),
    free_cash_flow NUMERIC(20,2)
)
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Unique record identifier |
| `company_id` | INT | Reference to companies table |
| `period_end_date` | DATE | Period end date |
| `period_type` | VARCHAR(20) | "annual" or "quarterly" |
| `net_cash_from_operating_activities` | NUMERIC(20,2) | Cash from operations |
| `capital_expenditures` | NUMERIC(20,2) | Spending on fixed assets |
| `net_cash_from_investing_activities` | NUMERIC(20,2) | Cash from investments |
| `net_cash_from_financing_activities` | NUMERIC(20,2) | Cash from financing |
| `dividends_paid` | NUMERIC(20,2) | Dividends distributed |
| `repurchase_of_stock` | NUMERIC(20,2) | Share buyback spending |
| `free_cash_flow` | NUMERIC(20,2) | CFO - CapEx (computed) |

**Example Record**:
```json
{
  "id": 1,
  "company_id": 1,
  "period_end_date": "2025-09-30",
  "period_type": "quarterly",
  "net_cash_from_operating_activities": 28500000000.00,
  "capital_expenditures": 2800000000.00,
  "net_cash_from_investing_activities": -1200000000.00,
  "net_cash_from_financing_activities": -8500000000.00,
  "dividends_paid": 3200000000.00,
  "repurchase_of_stock": 4500000000.00,
  "free_cash_flow": 25700000000.00
}
```

---

### 7. User Trades Table
**Purpose**: Records all buy and sell transactions executed by users.

```sql
CREATE TABLE user_trades (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  company_id       INT NOT NULL REFERENCES companies(companies_id) ON DELETE RESTRICT,
  trade_type       VARCHAR(4) NOT NULL CHECK (trade_type IN ('BUY','SELL')),
  quantity         NUMERIC(18,6) NOT NULL CHECK (quantity > 0),
  price            NUMERIC(12,4) NOT NULL,
  total_price      NUMERIC(20,4) NOT NULL,
  trade_timestamp  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique trade identifier |
| `user_id` | INT | FOREIGN KEY, NOT NULL | Reference to users table |
| `company_id` | INT | FOREIGN KEY, NOT NULL | Reference to companies table |
| `trade_type` | VARCHAR(4) | CHECK('BUY','SELL'), NOT NULL | Type of trade |
| `quantity` | NUMERIC(18,6) | CHECK > 0, NOT NULL | Number of shares traded |
| `price` | NUMERIC(12,4) | NOT NULL | Price per share |
| `total_price` | NUMERIC(20,4) | NOT NULL | quantity × price |
| `trade_timestamp` | TIMESTAMP | NOT NULL, DEFAULT NOW | When the trade executed |

**Example Record**:
```json
{
  "id": 1,
  "user_id": 1,
  "company_id": 1,
  "trade_type": "BUY",
  "quantity": 50.000000,
  "price": 180.1000,
  "total_price": 9005.0000,
  "trade_timestamp": "2025-11-10T10:22:00"
}
```

---

### 8. User Balances Table
**Purpose**: Tracks cash balances and holdings for each user.

```sql
CREATE TABLE user_balances (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  currency         CHAR(3) NOT NULL DEFAULT 'USD',
  available_balance NUMERIC(20,2) NOT NULL DEFAULT 0,
  total_balance     NUMERIC(20,2) NOT NULL DEFAULT 0,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, currency)
)
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique balance record ID |
| `user_id` | INT | FOREIGN KEY, NOT NULL | Reference to users table |
| `currency` | CHAR(3) | NOT NULL, DEFAULT 'USD' | Currency code (ISO 4217) |
| `available_balance` | NUMERIC(20,2) | NOT NULL, DEFAULT 0 | Cash available to trade |
| `total_balance` | NUMERIC(20,2) | NOT NULL, DEFAULT 0 | Cash + pending funds |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Unique Constraint**: Only one record per user per currency

**Example Record**:
```json
{
  "id": 1,
  "user_id": 1,
  "currency": "USD",
  "available_balance": 25000.00,
  "total_balance": 125000.23,
  "updated_at": "2025-11-10T14:30:00"
}
```

---

## API Request/Response Schemas

### Authentication Endpoints

#### POST /auth/signup
**Request Schema**:
```json
{
  "full_name": "string (required)",
  "email": "string (required, email format)",
  "password": "string (required, min 8 chars recommended)"
}
```

**Response Schema (201 Created)**:
```json
{
  "token": "string (JWT token)",
  "user": {
    "user_id": "integer",
    "email": "string",
    "full_name": "string"
  }
}
```

**Error Response (400)**:
```json
{
  "error": "missing_fields"
}
```

**Error Response (409 Conflict)**:
```json
{
  "error": "email_exists"
}
```

---

#### POST /auth/login
**Request Schema**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response Schema (200 OK)**:
```json
{
  "token": "string (JWT token)",
  "user": {
    "user_id": "integer",
    "email": "string",
    "full_name": "string"
  }
}
```

**Error Response (401)**:
```json
{
  "error": "invalid_credentials"
}
```

**Error Response (400)**:
```json
{
  "error": "missing_fields"
}
```

---

#### GET /auth/me
**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response Schema (200 OK)**:
```json
{
  "user": {
    "user_id": "integer",
    "email": "string",
    "full_name": "string"
  }
}
```

**Error Response (401)**:
```json
{
  "error": "unauthorized"
}
```

---

### Price Endpoints

#### GET /prices/now
**Response Schema (200 OK)** - Array of price objects:
```json
[
  {
    "symbol": "string",
    "price": "number",
    "ts": "integer (milliseconds)"
  }
]
```

**Example**:
```json
[
  {
    "symbol": "AAPL",
    "price": 182.31,
    "ts": 1697040000000
  },
  {
    "symbol": "MSFT",
    "price": 371.50,
    "ts": 1697040000000
  }
]
```

---

#### GET /prices/stream
**Content-Type**: `text/event-stream` (Server-Sent Events)

**Message Types**:

**1. Initial Snapshot**:
```json
{
  "type": "snapshot",
  "data": [
    {
      "symbol": "AAPL",
      "price": 182.31,
      "ts": 1697040000000
    }
  ]
}
```

**2. Quote Update**:
```json
{
  "type": "quote",
  "symbol": "AAPL",
  "price": 182.50,
  "ts": 1697040060000
}
```

**3. Status Message**:
```json
{
  "type": "status",
  "msg": "connected|disconnected|ws_error",
  "detail": "optional error details",
  "at": "integer (milliseconds)"
}
```

---

#### GET /health
**Response Schema (200 OK)**:
```json
{
  "status": "ok|error",
  "symbols": ["AAPL", "MSFT", "GOOGL", "TSLA"]
}
```

---

## In-Memory Data Structures

### Latest Quotes Cache
**Type**: Dictionary (Python) / Map (conceptual)

```python
latest_quotes = {
    "AAPL": {
        "symbol": "AAPL",
        "price": 182.31,
        "ts": 1697040000000
    },
    "MSFT": {
        "symbol": "MSFT",
        "price": 371.50,
        "ts": 1697040000000
    }
}
```

**Purpose**: Stores the most recent quote for each subscribed symbol for fast snapshots.

---

### WebSocket Message Queue
**Type**: Python `queue.Queue` (per subscriber)

**Message Format** (JSON serialized):
```json
{
  "type": "quote|snapshot|status",
  "symbol": "string (only for quote)",
  "price": "number (only for quote)",
  "ts": "integer (only for quote)",
  "data": "array (only for snapshot)",
  "msg": "string (only for status)",
  "detail": "string (optional, status only)",
  "at": "integer (optional, status only)"
}
```

---

## Frontend Data Schemas

### Dashboard Summary Card
```json
{
  "title": "string",
  "value": "string (formatted)",
  "valueColor": "string (optional, hex color)"
}
```

---

### Position Record
```json
{
  "symbol": "string",
  "qty": "integer",
  "avgCost": "number",
  "last": "number",
  "pnl": "number"
}
```

---

### Trade Record
```json
{
  "id": "integer",
  "time": "string (ISO format or display format)",
  "type": "BUY|SELL",
  "symbol": "string",
  "qty": "integer",
  "price": "number"
}
```

---

### Watchlist Item
```json
{
  "symbol": "string",
  "last": "number",
  "change": "number (percentage)"
}
```

---

### User Dashboard Response
```json
{
  "user": {
    "user_id": "integer",
    "email": "string",
    "full_name": "string"
  }
}
```

---

## JWT Token Schema

**Token Type**: JWT (JSON Web Token)

**Algorithm**: HS256

**Payload Structure**:
```json
{
  "sub": "integer (user_id)",
  "email": "string",
  "exp": "integer (unix timestamp)",
  "iat": "integer (unix timestamp, added by jwt library)"
}
```

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Example Token**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJleHAiOjE2OTcwNDM2MDB9.xyz...
```

**Expiration**: 12 hours from issuance

---

## Data Type Mappings

| Database Type | Python Type | JSON Type | Description |
|---|---|---|---|
| SERIAL | int | integer | Auto-incrementing integer |
| VARCHAR(n) | str | string | Variable-length string |
| TEXT | str | string | Long text |
| NUMERIC(p,s) | Decimal / float | number | Decimal number with precision/scale |
| BIGINT | int | integer | Large integer (8 bytes) |
| DATE | date | string (ISO) | Date without time |
| TIMESTAMP | datetime | string (ISO) | Date and time |
| BOOLEAN | bool | boolean | True/False |
| CHAR(n) | str | string | Fixed-length string |

---

## Validation Rules

### User
- `full_name`: 1-100 characters, non-empty
- `email`: Valid email format, unique
- `password_hash`: Non-empty, bcrypt hash format

### Company
- `longName`: 1-255 characters
- `Symbol`: Valid stock ticker format
- Numeric fields: Non-negative

### Stock Prices
- `volume`: Non-negative integer
- Price fields (`open`, `high`, `low`, `close`, `adj_close`): Positive numbers
- `high` ≥ `low`
- `trade_timestamp`: Valid timestamp

### User Trades
- `trade_type`: Either "BUY" or "SELL"
- `quantity`: > 0, up to 6 decimal places
- `price`: Valid price per share
- `total_price`: ≥ 0

### User Balances
- `currency`: Valid ISO 4217 code (e.g., "USD")
- Balances: ≥ 0

---

## Relationships and Constraints

```
users (1) ──→ (many) user_trades
users (1) ──→ (many) user_balances

companies (1) ──→ (many) stock_prices
companies (1) ──→ (many) user_trades
companies (1) ──→ (many) income_statement
companies (1) ──→ (many) balance_sheet
companies (1) ──→ (many) cash_flow
```

**Cascade Rules**:
- `user_trades` & `user_balances`: ON DELETE CASCADE (delete trades/balances when user deleted)
- `stock_prices`: ON DELETE CASCADE (delete prices when company deleted)
- `user_trades`: ON DELETE RESTRICT for company_id (prevent company deletion if trades exist)

---

## Key Indexes (Recommended)

For optimal query performance, the following indexes are recommended:

```sql
CREATE INDEX idx_stock_prices_company_timestamp 
  ON stock_prices(companies_id, trade_timestamp);

CREATE INDEX idx_user_trades_user_timestamp 
  ON user_trades(user_id, trade_timestamp);

CREATE INDEX idx_companies_symbol 
  ON companies(Symbol);

CREATE INDEX idx_users_email 
  ON users(email);
```

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-12 | 1.0 | Initial schema documentation |

---

## Notes

- All timestamps in the database use PostgreSQL TIMESTAMP (timezone-naive)
- All monetary amounts use NUMERIC type for precision (not FLOAT)
- Passwords are hashed using bcrypt with salt
- JWT tokens are signed with a secret key and should be transmitted over HTTPS
- The system supports multiple currencies via the `user_balances` table design

