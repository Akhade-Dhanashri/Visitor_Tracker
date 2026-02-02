@echo off
REM Visitor Tracker - One-Click Docker Setup for Windows

setlocal enabledelayedexpansion

cls
echo.
echo ========================================
echo   VISITOR TRACKER - LOCAL DOCKER SETUP
echo ========================================
echo.

REM Check Docker
echo [1/5] Checking Docker installation...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo X Docker not found!
    echo   Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
echo + %DOCKER_VERSION%

REM Check Docker daemon
echo.
echo [2/5] Checking Docker daemon...
docker ps -q >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo X Docker daemon not running!
    echo   Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo + Docker daemon is running

REM Build containers
echo.
echo [3/5] Building containers (this may take 2-3 minutes)...
docker compose build --no-cache
if %ERRORLEVEL% NEQ 0 (
    echo X Docker build failed!
    pause
    exit /b 1
)
echo + Build completed

REM Start containers
echo.
echo [4/5] Starting containers...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo X Failed to start containers!
    pause
    exit /b 1
)
echo + Containers started

REM Wait for backend
echo   Waiting for backend API to be ready (max 60 seconds)...
set /a count=0
:wait_loop
if %count% GEQ 60 goto wait_timeout
timeout /t 1 /nobreak >nul
curl -s http://localhost:8000/api/users >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo + Backend API is ready!
    goto start_frontend
)
set /a count=%count%+1
goto wait_loop

:wait_timeout
echo ! Backend taking longer than expected, but containers are running.

:start_frontend
echo.
echo [5/5] Starting frontend development server...
if not exist "frontend\node_modules\" (
    echo   Installing frontend dependencies...
    cd frontend
    call npm install --silent
    cd ..
)

cd frontend
start "Visitor Tracker Frontend" cmd /k npm run dev
cd ..
echo + Frontend server starting in new window

REM Display summary
echo.
echo ========================================
echo   SETUP COMPLETE (Ctrl+C to stop)
echo ========================================
echo.
echo WEB INTERFACES:
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000
echo   API:       http://localhost:8000/api/users
echo.
echo TEST CREDENTIALS:
echo   Admin Email:    admin@rachana.org (password: admin123)
echo   Guard Email:    guard1@rachana.org (password: guard123)
echo.
echo DATABASE: PostgreSQL 15 (rachana)
echo.
echo USEFUL COMMANDS:
echo   docker compose logs -f backend     (view logs)
echo   docker compose down                (stop containers)
echo   docker compose restart backend     (restart backend)
echo.

REM Keep containers running
docker compose logs -f backend
