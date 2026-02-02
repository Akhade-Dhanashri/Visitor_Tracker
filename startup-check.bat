@echo off
REM Visitor Tracker Application Startup Script
REM This script checks all configuration and helps run the application

echo.
echo ========================================
echo  VISITOR TRACKER - SYSTEM CHECK
echo ========================================
echo.

REM Check database
echo [1] Checking Database...
if exist "backend\database\database.sqlite" (
    echo     ✓ Database file found
) else (
    echo     ✗ Database file not found!
    exit /b 1
)

REM Check if Node.js is installed
echo.
echo [2] Checking Node.js Installation...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo     ✓ Node.js found: !NODE_VERSION!
) else (
    echo     ✗ Node.js not found! Please install Node.js
    exit /b 1
)

REM Check if npm is installed
echo.
echo [3] Checking npm Installation...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo     ✓ npm found: !NPM_VERSION!
) else (
    echo     ✗ npm not found!
    exit /b 1
)

REM Check frontend dependencies
echo.
echo [4] Checking Frontend Dependencies...
if exist "frontend\node_modules" (
    echo     ✓ Frontend dependencies installed
) else (
    echo     ⚠ Frontend dependencies not installed. Installing...
    cd frontend
    call npm install
    cd ..
)

REM All checks passed
echo.
echo ========================================
echo  SYSTEM CHECK PASSED ✓
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. BACKEND SETUP (If PHP/Laravel is installed):
echo    cd backend
echo    php artisan serve
echo    (This will run on http://localhost:8000)
echo.
echo 2. FRONTEND STARTUP:
echo    Open another terminal and run:
echo    cd frontend
echo    npm run dev
echo    (This will run on http://localhost:5173)
echo.
echo 3. ACCESS THE APPLICATION:
echo    Open your browser and go to: http://localhost:5173
echo.
echo TEST USERS:
echo   Email: admin@rachana.org (Admin)
echo   Email: guard1@rachana.org (Security Guard)
echo   Email: guard2@rachana.org (Security Guard)
echo.
echo DATABASE STATUS:
echo   Location: backend\database\database.sqlite
echo   Users: 3 test users already created
echo.
echo ========================================
echo.
