#!/usr/bin/env powershell
<#
.SYNOPSIS
  Visitor Tracker - Complete Docker Setup & Launch
  
.DESCRIPTION
  Single-command setup for local development:
  1. Checks Docker availability
  2. Builds backend (PHP + Postgres support)
  3. Starts Postgres + Laravel containers
  4. Runs migrations & seeds automatically
  5. Starts frontend development server
  6. Displays access URLs and test credentials
  
.EXAMPLE
  .\run-local-docker.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  VISITOR TRACKER - LOCAL DOCKER SETUP" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check Docker
Write-Host "[1/5] Checking Docker installation..." -ForegroundColor Yellow
$dockerCheck = docker --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker not found!" -ForegroundColor Red
    Write-Host "  Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
}
Write-Host "✓ Docker found: $dockerCheck" -ForegroundColor Green

# Step 2: Check Docker daemon
Write-Host "`n[2/5] Checking Docker daemon..." -ForegroundColor Yellow
docker ps -q >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker daemon not running!" -ForegroundColor Red
    Write-Host "  Please start Docker Desktop and try again."
    exit 1
}
Write-Host "✓ Docker daemon is running" -ForegroundColor Green

# Step 3: Build and start containers
Write-Host "`n[3/5] Building containers (backend + postgres)..." -ForegroundColor Yellow
Write-Host "  This may take 2-3 minutes on first run..." -ForegroundColor Gray

$composeFile = Join-Path (Get-Location) "docker-compose.yml"
if (-not (Test-Path $composeFile)) {
    Write-Host "✗ docker-compose.yml not found in current directory!" -ForegroundColor Red
    exit 1
}

docker compose -f $composeFile build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed" -ForegroundColor Green

Write-Host "`n[4/5] Starting containers..." -ForegroundColor Yellow
docker compose -f $composeFile up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start containers!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Containers started" -ForegroundColor Green

# Wait for backend to be ready
Write-Host "  Waiting for backend API to be ready..." -ForegroundColor Gray
$maxWait = 60
$elapsed = 0
while ($elapsed -lt $maxWait) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/users" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Backend API is ready!" -ForegroundColor Green
            break
        }
    } catch {
        # Still waiting
    }
    Start-Sleep -Seconds 2
    $elapsed += 2
}

if ($elapsed -ge $maxWait) {
    Write-Host "⚠ Backend taking longer than expected, but containers are running." -ForegroundColor Yellow
}

# Step 5: Start frontend
Write-Host "`n[5/5] Starting frontend development server..." -ForegroundColor Yellow
$frontendDir = Join-Path (Get-Location) "frontend"

if ((Test-Path (Join-Path $frontendDir "node_modules")) -eq $false) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Gray
    Push-Location $frontendDir
    npm install --silent
    Pop-Location
}

# Start dev server in background (new window)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev" -WindowStyle Normal
Write-Host "✓ Frontend server starting in new window..." -ForegroundColor Green

# Display summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE ✓" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "🌐 ACCESS POINTS:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "  API:       http://localhost:8000/api/users" -ForegroundColor White

Write-Host "`n👤 TEST CREDENTIALS:" -ForegroundColor Cyan
Write-Host "  Admin User:" -ForegroundColor White
Write-Host "    Email: admin@rachana.org" -ForegroundColor Gray
Write-Host "    Password: admin123" -ForegroundColor Gray
Write-Host "  Security Guard:" -ForegroundColor White
Write-Host "    Email: guard1@rachana.org" -ForegroundColor Gray
Write-Host "    Password: guard123" -ForegroundColor Gray

Write-Host "`n📊 DATABASE:" -ForegroundColor Cyan
Write-Host "  Type:     PostgreSQL 15" -ForegroundColor White
Write-Host "  Name:     rachana" -ForegroundColor Gray
Write-Host "  User:     rachana_user" -ForegroundColor Gray
Write-Host "  Host:     localhost (via Docker)" -ForegroundColor Gray

Write-Host "`n🛠 USEFUL COMMANDS:" -ForegroundColor Cyan
Write-Host "  View logs:        docker compose logs -f backend" -ForegroundColor Gray
Write-Host "  Stop containers:  docker compose down" -ForegroundColor Gray
Write-Host "  Restart backend:  docker compose restart backend" -ForegroundColor Gray
Write-Host "  Reset database:   docker compose down -v && docker compose up -d" -ForegroundColor Gray

Write-Host "`n========================================`n" -ForegroundColor Cyan
Write-Host "Frontend window should open in a moment." -ForegroundColor Gray
Write-Host "Press Ctrl+C in this window to stop Docker containers." -ForegroundColor Gray
Write-Host "`n"

# Keep containers running (optional - user can Ctrl+C)
Write-Host "Monitoring containers (press Ctrl+C to stop)..." -ForegroundColor Gray
docker compose -f $composeFile logs -f backend --tail 20 2>$null
