# TruthLens Next.js Production Stack

@echo off
echo.
echo =============================================
echo   TruthLens - AI Image Detector Setup
echo =============================================
echo.

REM Check if we're in the right directory
if not exist "frontend" (
    echo ERROR: Please run this script from the truthlens-nextjs directory
    pause
    exit /b 1
)

echo [1/5] Setting up Frontend...
cd frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed
)

if not exist ".env.local" (
    echo Creating frontend .env.local...
    copy .env.example .env.local
)

cd ..

echo.
echo [2/5] Setting up Backend...
cd backend

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

if not exist ".env" (
    echo Creating backend .env...
    copy .env.example .env
)

echo.
echo [3/5] Creating upload directory...
if not exist "uploads" mkdir uploads

cd ..

echo.
echo [4/5] Setup complete!
echo.
echo =============================================
echo   Quick Start Commands
echo =============================================
echo.
echo Option 1 - Docker (Recommended):
echo   docker-compose up -d
echo.
echo Option 2 - Manual:
echo   Terminal 1: cd frontend ^&^& npm run dev
echo   Terminal 2: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo.
echo =============================================
echo   Access URLs
echo =============================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo =============================================
echo.

choice /C YN /M "Do you want to start the development servers now"
if errorlevel 2 goto end
if errorlevel 1 goto start

:start
echo.
echo Starting servers...
echo.
start cmd /k "cd frontend && npm run dev"
timeout /t 2 >nul
start cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload"
echo.
echo Servers starting in new windows...
echo.

:end
echo Setup complete! Check SETUP.md for detailed instructions.
pause
