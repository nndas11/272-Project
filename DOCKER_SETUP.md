# Docker Setup Guide

## Prerequisites
- Docker Desktop installed and running
- Docker Compose installed (usually comes with Docker Desktop)

## Environment Setup

1. **Create a `.env` file** in the project root directory by copying `.env.example`:
   ```
   cp .env.example .env
   ```

2. **Update `.env` with your actual values:**
   ```
   DB_USER=postgres
   DB_PASS=your_secure_password
   DB_NAME=stocks_db
   DB_PORT=5432
   FINNHUB_TOKEN=your_finnhub_api_token
   SECRET_KEY=your_secure_secret_key
   SYMBOLS=AAPL,MSFT,GOOGL,TSLA
   ```

## Running the Application

### Start both PostgreSQL and Backend
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Stop the application
```bash
docker-compose down
```

### Stop and remove volumes (reset database)
```bash
docker-compose down -v
```

## Accessing the Application

- **Backend API**: http://localhost:5050
- **Health Check**: http://localhost:5050/health
- **Database**: `postgres://postgres:password@localhost:5432/stocks_db`

## Database Initialization

The database schema is automatically initialized from `db_create_script.txt` when the PostgreSQL container starts for the first time.

## Useful Commands

### Check container status
```bash
docker-compose ps
```

### Access PostgreSQL shell
```bash
docker-compose exec postgres psql -U postgres -d stocks_db
```

### Rebuild images
```bash
docker-compose build --no-cache
```

### Run specific service
```bash
docker-compose up postgres  # or backend
```

## Troubleshooting

### Port already in use
If port 5050 or 5432 is already in use, modify `docker-compose.yml` or `.env` to use different ports.

### Database connection failed
- Ensure PostgreSQL is fully initialized (check logs: `docker-compose logs postgres`)
- Verify all environment variables are set correctly in `.env`
- Wait a few seconds for the service to be healthy before accessing the backend

### Image build issues
```bash
docker-compose down
docker-compose up -d --build
```

## Development Workflow

1. Make changes to the code
2. Rebuild the image: `docker-compose build`
3. Restart the service: `docker-compose up -d`

Or for automatic reloading (with volume mount), the backend will reflect changes automatically if you have Flask in debug mode.
