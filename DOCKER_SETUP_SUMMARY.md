# Docker Setup - Summary of Changes

This document summarizes all Docker-related files created and modified for the monorepo.

## ✅ Created Files

### Dockerfiles

1. **`frontend/Dockerfile.dev`**
   - Development Dockerfile for Next.js
   - Node 20 Alpine base image
   - Hot reload support via volume mounts
   - Exposes port 3000

2. **`frontend/Dockerfile.prod`**
   - Production Dockerfile for Next.js
   - Multi-stage build (builder + runner)
   - Uses Next.js standalone output
   - Runs as non-root user (nextjs)
   - Exposes port 8081

3. **`backend/Dockerfile`**
   - Development Dockerfile for Python/Flask
   - Python 3.11 slim base image
   - Installs dependencies from requirements.txt
   - Includes gunicorn for production option
   - Exposes port 8080
   - Configurable via PORT/FLASK_PORT env vars

4. **`backend/Dockerfile.prod`**
   - Production Dockerfile for Python/Flask
   - Uses gunicorn WSGI server
   - 4 workers, 2 threads per worker
   - Runs as non-root user (appuser)
   - Exposes port 8080

### Docker Compose

5. **`docker-compose.yml`** (root)
   - Defines 3 services: `backend`, `frontend`, `frontend_prod`
   - Development services with hot reload
   - Production profile for `frontend_prod`
   - Network: `app-network` (bridge driver)
   - Health checks for backend
   - Volume mounts for code hot reload

### Docker Ignore Files

6. **`frontend/.dockerignore`**
   - Excludes node_modules, .next, dist, cache files
   - Excludes environment files and logs
   - Excludes test artifacts and IDE files

7. **`backend/.dockerignore`**
   - Excludes Python cache files (__pycache__, *.pyc)
   - Excludes virtual environments
   - Excludes test artifacts and IDE files
   - Excludes migrations cache

### Documentation

8. **`DOCKER_README.md`** (root)
   - Complete Docker setup guide
   - Quick start instructions
   - Common commands reference
   - Troubleshooting guide
   - Production deployment guide

9. **`DOCKER_SETUP_SUMMARY.md`** (this file)
   - Summary of all changes

## 📝 Modified Files

1. **`backend/app.py`**
   - Added PORT/FLASK_PORT environment variable support
   - Defaults to 5050 for local dev, 8080 for Docker
   - Allows port configuration via environment

2. **`frontend/next.config.js`**
   - Added API proxy configuration
   - Routes `/api/*` to backend service in Docker
   - Supports both NEXT_PUBLIC_API_URL and VITE_API_URL
   - Smart proxy detection (only when using Docker service names)

3. **`README.md`** (root)
   - Added Docker quick start section
   - Added links to Docker documentation
   - Updated project structure

## 🏗️ Architecture

### Development Mode

```
┌─────────────────────────────────────┐
│  Docker Compose (Development)       │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌─────────────┐│
│  │  Frontend    │  │  Backend     ││
│  │  (Next.js)   │  │  (Flask)     ││
│  │  Port: 3000  │  │  Port: 8080  ││
│  │              │  │              ││
│  │  Hot Reload  │  │  Hot Reload  ││
│  │  ✅          │  │  ✅          ││
│  └──────┬───────┘  └──────┬───────┘│
│         │                 │        │
│         └────────┬─────────┘        │
│                  │                   │
│         app-network (bridge)         │
└──────────────────┼──────────────────┘
                   │
         ┌──────────▼──────────┐
         │  Host Machine       │
         │  localhost:3000     │
         │  localhost:8080     │
         └─────────────────────┘
```

### Production Mode

```
┌─────────────────────────────────────┐
│  Docker Compose (Production)         │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌─────────────┐│
│  │  Frontend     │  │  Backend     ││
│  │  (Next.js)    │  │  (Gunicorn)  ││
│  │  Port: 8081   │  │  Port: 8080  ││
│  │              │  │              ││
│  │  Optimized   │  │  4 Workers   ││
│  │  Build       │  │              ││
│  └──────┬───────┘  └──────┬───────┘│
│         │                 │        │
│         └────────┬─────────┘        │
│                  │                   │
│         app-network (bridge)         │
└──────────────────┼──────────────────┘
                   │
         ┌──────────▼──────────┐
         │  Host Machine       │
         │  localhost:8081     │
         │  localhost:8080      │
         └─────────────────────┘
```

## 🔧 Configuration Details

### Ports

- **Frontend Dev**: 3000 (Next.js dev server)
- **Frontend Prod**: 8081 (Next.js standalone)
- **Backend**: 8080 (Flask/Gunicorn)

### Environment Variables

**Backend**:
- `PORT` / `FLASK_PORT`: Server port (default: 8080 in Docker, 5050 locally)
- `FINNHUB_TOKEN`: API token for stock data
- `SYMBOLS`: Comma-separated stock symbols
- `NODE_ENV`: development/production
- `FLASK_ENV`: development/production

**Frontend**:
- `NEXT_PUBLIC_API_URL`: Backend API URL (http://backend:8080)
- `VITE_API_URL`: Alternative API URL (for Vite compatibility)
- `BACKEND_URL`: Backend service URL for proxy
- `NODE_ENV`: development/production

### Volume Mounts (Development)

**Frontend**:
- `./frontend:/app` - Source code
- `/app/node_modules` - Anonymous volume (prevents overwrite)
- `/app/.next` - Anonymous volume (build cache)

**Backend**:
- `./backend:/app` - Source code
- `/app/__pycache__` - Anonymous volume (Python cache)

### Networks

- **app-network**: Bridge network connecting all services
- Services communicate using service names (e.g., `http://backend:8080`)

## 🚀 Usage Examples

### Start Development

```bash
docker compose up --build
```

### Start Production

```bash
docker compose --profile production up --build
```

### Rebuild Specific Service

```bash
docker compose build frontend
docker compose build backend
```

### View Logs

```bash
docker compose logs -f frontend
docker compose logs -f backend
```

### Stop Services

```bash
docker compose down
```

## ✅ Verification Checklist

- [x] Frontend dev Dockerfile with hot reload
- [x] Frontend prod Dockerfile with optimized build
- [x] Backend Dockerfile for dev and prod
- [x] Docker Compose with all services
- [x] Volume mounts for hot reload
- [x] Network configuration
- [x] Environment variables
- [x] Health checks
- [x] .dockerignore files
- [x] API proxy configuration
- [x] Health endpoint verified
- [x] Documentation complete

## 📊 File Statistics

- **Dockerfiles Created**: 4
- **Docker Compose Files**: 1
- **.dockerignore Files**: 2
- **Documentation Files**: 2
- **Modified Files**: 3
- **Total Files**: 12

## 🎯 Next Steps

1. **Test the setup**:
   ```bash
   docker compose up --build
   ```

2. **Verify connectivity**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080/health

3. **Test production build**:
   ```bash
   docker compose --profile production up --build
   ```

4. **Set environment variables**:
   - Create `.env` file with `FINNHUB_TOKEN`

5. **Customize as needed**:
   - Adjust worker count in `backend/Dockerfile.prod`
   - Modify ports in `docker-compose.yml`
   - Add additional services (database, redis, etc.)

## 🔍 Notes

- Backend health check uses Python's urllib (no curl dependency)
- Frontend uses Next.js standalone output for production (includes Node.js server)
- Production frontend runs on port 8081 to avoid conflicts
- All services run as non-root users in production
- Development mode supports hot reload for both frontend and backend


