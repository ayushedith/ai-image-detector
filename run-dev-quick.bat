@echo off
setlocal enabledelayedexpansion

echo ========================================
echo TRUTHLENS - QUICK START (Mock Backend)
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

set "SCRIPT_DIR=%~dp0"

echo Starting services...
echo.

:: Start Backend (Mock) in a new window
echo Launching Mock Backend (FastAPI)...
start "TruthLens Backend (Mock)" cmd /k "cd "!SCRIPT_DIR!" && python -m uvicorn backend.app.mock_main:app --reload --host 0.0.0.0 --port 8000"

:: Wait 2 seconds for backend to start
timeout /t 2 /nobreak

:: Start Frontend in a new window
echo Launching Frontend (Next.js)...
start "TruthLens Frontend" cmd /k "cd "!SCRIPT_DIR!frontend" && npm install -q 2>nul & npm run dev"

echo.
echo ========================================
echo Services starting...
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
echo Ready to test! Upload an image to get started.
echo ========================================
