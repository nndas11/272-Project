# PowerShell test script for Docker setup

Write-Host "Testing Docker Compose configuration..." -ForegroundColor Cyan
docker compose config 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker Compose config is valid" -ForegroundColor Green
} else {
    Write-Host "❌ Docker Compose config has errors" -ForegroundColor Red
    docker compose config
    exit 1
}

Write-Host ""
Write-Host "Building backend image..." -ForegroundColor Cyan
docker compose build backend 2>&1 | Select-Object -Last 20

Write-Host ""
Write-Host "Starting backend service..." -ForegroundColor Cyan
docker compose up backend -d

Write-Host ""
Write-Host "Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Checking backend logs..." -ForegroundColor Cyan
docker compose logs backend 2>&1 | Select-Object -Last 20

Write-Host ""
Write-Host "Checking backend status..." -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "Testing backend health endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend health check passed" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Backend health check failed with status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Stopping services..." -ForegroundColor Cyan
docker compose down


