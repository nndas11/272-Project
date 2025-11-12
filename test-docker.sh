#!/bin/bash
# Test script for Docker setup

echo "Testing Docker Compose configuration..."
docker compose config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Docker Compose config is valid"
else
    echo "❌ Docker Compose config has errors"
    docker compose config
    exit 1
fi

echo ""
echo "Building backend image..."
docker compose build backend 2>&1 | tail -20

echo ""
echo "Starting backend service..."
docker compose up backend -d

echo ""
echo "Waiting for backend to start..."
sleep 10

echo ""
echo "Checking backend logs..."
docker compose logs backend | tail -20

echo ""
echo "Checking backend health..."
docker compose ps

echo ""
echo "Testing backend health endpoint..."
curl -f http://localhost:8080/health 2>/dev/null && echo "✅ Backend health check passed" || echo "❌ Backend health check failed"

echo ""
echo "Stopping services..."
docker compose down


