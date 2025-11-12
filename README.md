# 272-Project - Mock Stock Trading Application

A full-stack mock stock trading application with React/Next.js frontend and Python/Flask backend.

## Quick Start with Docker

### Development

```bash
# Start all services with hot reload
docker compose up --build

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8080
```

### Production

```bash
# Start production build
docker compose --profile production up --build

# Access:
# - Frontend: http://localhost:8081
# - Backend: http://localhost:8080
```

See [DOCKER_README.md](./DOCKER_README.md) for detailed Docker instructions.

## Local Development (Without Docker)

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5050
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## Project Structure

- `frontend/` - Next.js React application
- `backend/` - Python Flask API server
- `docker-compose.yml` - Docker orchestration
- `DOCKER_README.md` - Complete Docker guide

## Documentation

- [Frontend README](./frontend/README.md) - Frontend setup and API integration
- [DOCKER_README.md](./DOCKER_README.md) - Docker setup and deployment
- [Backend TODO](./frontend/TODO_BACKEND.md) - Backend integration checklist
