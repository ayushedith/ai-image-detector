@echo off
setlocal enabledelayedexpansion

echo ========================================
echo TRUTHLENS - FULL STACK DEV ENVIRONMENT
echo ========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Starting backend and frontend...
echo.

:: Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

:: Start Backend in a new window
echo Launching Backend (FastAPI)...
start "TruthLens Backend" cmd /k "cd "!SCRIPT_DIR!backend" && python -m venv venv 2>nul || echo Virtual environment already exists && call venv\Scripts\activate.bat && pip install -q -r requirements.txt && echo. && echo Starting FastAPI server on http://localhost:8000 && echo. && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak

:: Start Frontend in a new window
echo Launching Frontend (Next.js)...
start "TruthLens Frontend" cmd /k "cd "!SCRIPT_DIR!frontend" && npm install -q 2>nul || echo Dependencies already installed && echo. && echo Starting Next.js dev server on http://localhost:3000 && echo. && npm run dev"

echo.
echo ========================================
echo Services starting...
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
echo Close either terminal window to stop that service.
echo ========================================
