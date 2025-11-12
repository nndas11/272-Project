# Docker Setup Guide

Complete Docker setup for the Mock Stock Trading application with support for both development and production environments.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Docker Compose v3.8+
- Environment variables (see below)

## Quick Start

### Development Mode

Start both frontend and backend in development mode with hot reload:

```bash
docker compose up --build
```

This will start:
- **Backend**: `http://localhost:8080` (Python/Flask)
- **Frontend**: `http://localhost:3000` (Next.js dev server)

### Production Mode

Start production builds:

```bash
# Start backend in production mode
docker compose up backend --build

# Start frontend production build (separate command)
docker compose --profile production up frontend_prod --build
```

Or start both together:

```bash
docker compose --profile production up --build
```

Production services:
- **Backend**: `http://localhost:8080` (Gunicorn)
- **Frontend**: `http://localhost:8081` (Nginx/Next.js standalone)

## Environment Variables

Create a `.env` file in the project root (optional, defaults provided):

```env
# Backend
FINNHUB_TOKEN=your_finnhub_token_here
SYMBOLS=AAPL,MSFT,GOOGL,TSLA

# Frontend (set in docker-compose.yml)
NEXT_PUBLIC_API_URL=http://backend:8080
VITE_API_URL=http://backend:8080
```

## Services

### Backend Service

- **Image**: Built from `backend/Dockerfile`
- **Port**: 8080 (mapped from container)
- **Health Check**: `/health` endpoint
- **Hot Reload**: Enabled in dev mode via volume mounts

**Development**:
```bash
docker compose up backend
```

**Production**:
```bash
docker compose up backend
# Uses gunicorn with 4 workers
```

### Frontend Service (Development)

- **Image**: Built from `frontend/Dockerfile.dev`
- **Port**: 3000
- **Hot Reload**: Enabled via volume mounts
- **API Proxy**: Configured to route `/api/*` to backend

```bash
docker compose up frontend
```

### Frontend Service (Production)

- **Image**: Built from `frontend/Dockerfile.prod`
- **Port**: 8081
- **Server**: Next.js standalone mode
- **Optimized**: Production build with static assets

```bash
docker compose --profile production up frontend_prod
```

## Common Commands

### Start Services

```bash
# Start all services (dev mode)
docker compose up

# Start in background
docker compose up -d

# Rebuild and start
docker compose up --build

# Start specific service
docker compose up frontend
docker compose up backend
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs frontend
docker compose logs backend

# Follow logs
docker compose logs -f frontend
```

### Rebuild Services

```bash
# Rebuild all
docker compose build

# Rebuild specific service
docker compose build frontend
docker compose build backend

# Rebuild without cache
docker compose build --no-cache
```

### Execute Commands in Containers

```bash
# Run command in frontend container
docker compose exec frontend npm run lint

# Run command in backend container
docker compose exec backend python -m pytest

# Open shell
docker compose exec frontend sh
docker compose exec backend bash
```

## Development Workflow

### Hot Reload

Both frontend and backend support hot reload in development:

1. **Frontend**: Changes to files in `frontend/` are automatically reflected
2. **Backend**: Changes to Python files in `backend/` trigger auto-reload (Flask dev server)

### Making Changes

1. Edit files in your local filesystem
2. Changes are automatically synced to containers via volume mounts
3. Frontend/backend will automatically reload

### Debugging

**Frontend**:
- Access dev tools at `http://localhost:3000`
- Check logs: `docker compose logs frontend`

**Backend**:
- Check logs: `docker compose logs backend`
- Health check: `curl http://localhost:8080/health`

## Production Deployment

### Building Production Images

```bash
# Build all production images
docker compose --profile production build

# Build specific service
docker compose build frontend_prod
docker compose build backend
```

### Running Production

```bash
# Start production stack
docker compose --profile production up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Production Considerations

1. **Environment Variables**: Set production values in `.env` or via Docker secrets
2. **Database**: Configure production database connection
3. **SSL/TLS**: Use reverse proxy (nginx/traefik) for HTTPS
4. **Monitoring**: Add health checks and monitoring
5. **Scaling**: Use `docker compose scale` or Kubernetes for multiple instances

## Troubleshooting

### Port Already in Use

If ports 3000, 8080, or 8081 are already in use:

1. Stop the conflicting service
2. Or modify ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Change host port
   ```

### Container Won't Start

1. Check logs: `docker compose logs <service>`
2. Verify environment variables are set
3. Rebuild: `docker compose build --no-cache <service>`

### Hot Reload Not Working

1. Verify volume mounts in `docker-compose.yml`
2. Check file permissions
3. Restart service: `docker compose restart <service>`

### Backend Health Check Failing

1. Check backend logs: `docker compose logs backend`
2. Verify FINNHUB_TOKEN is set
3. Test manually: `curl http://localhost:8080/health`

### Frontend Can't Reach Backend

1. Verify both services are on same network (`app-network`)
2. Check `NEXT_PUBLIC_API_URL` is set to `http://backend:8080`
3. Check backend is healthy: `docker compose ps`

## Network Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
│  Port: 3000     │
└────────┬────────┘
         │
         │ HTTP
         │
┌────────▼────────┐
│   Backend       │
│  (Flask)        │
│  Port: 8080     │
└─────────────────┘
```

Services communicate via Docker network `app-network`. Frontend uses service name `backend` to reach the backend API.

## File Structure

```
.
├── docker-compose.yml          # Main compose file
├── frontend/
│   ├── Dockerfile.dev          # Development Dockerfile
│   ├── Dockerfile.prod         # Production Dockerfile
│   └── .dockerignore           # Docker ignore rules
├── backend/
│   ├── Dockerfile              # Development Dockerfile
│   ├── Dockerfile.prod         # Production Dockerfile
│   └── .dockerignore           # Docker ignore rules
└── .env                        # Environment variables (create this)
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Flask Production Deployment](https://flask.palletsprojects.com/en/2.3.x/deploying/)

## Support

For issues or questions:
1. Check logs: `docker compose logs`
2. Verify environment variables
3. Review service health: `docker compose ps`
4. Check network connectivity: `docker network inspect <network>`


