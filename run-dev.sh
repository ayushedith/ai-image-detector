#!/bin/bash

echo "========================================"
echo "TRUTHLENS - FULL STACK DEV ENVIRONMENT"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Starting backend and frontend..."
echo ""

# Start Backend in background
echo "Launching Backend (FastAPI)..."
(
    cd "$SCRIPT_DIR/backend"
    python3 -m venv venv 2>/dev/null || true
    source venv/bin/activate
    pip install -q -r requirements.txt
    echo ""
    echo "Starting FastAPI server on http://localhost:8000"
    echo ""
    python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
) &
BACKEND_PID=$!

# Wait 3 seconds for backend to start
sleep 3

# Start Frontend in background
echo "Launching Frontend (Next.js)..."
(
    cd "$SCRIPT_DIR/frontend"
    npm install -q 2>/dev/null || true
    echo ""
    echo "Starting Next.js dev server on http://localhost:3000"
    echo ""
    npm run dev
) &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Services starting..."
echo ""
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
