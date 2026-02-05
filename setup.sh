#!/bin/bash

echo ""
echo "============================================="
echo "  TruthLens - AI Image Detector Setup"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "ERROR: Please run this script from the truthlens-nextjs directory"
    exit 1
fi

echo "[1/5] Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi

if [ ! -f ".env.local" ]; then
    echo "Creating frontend .env.local..."
    cp .env.example .env.local
fi

cd ..

echo ""
echo "[2/5] Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating backend .env..."
    cp .env.example .env
fi

echo ""
echo "[3/5] Creating upload directory..."
mkdir -p uploads

cd ..

echo ""
echo "[4/5] Setup complete!"
echo ""
echo "============================================="
echo "  Quick Start Commands"
echo "============================================="
echo ""
echo "Option 1 - Docker (Recommended):"
echo "  docker-compose up -d"
echo ""
echo "Option 2 - Manual:"
echo "  Terminal 1: cd frontend && npm run dev"
echo "  Terminal 2: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "============================================="
echo "  Access URLs"
echo "============================================="
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "============================================="
echo ""
echo "Setup complete! Check SETUP.md for detailed instructions."
