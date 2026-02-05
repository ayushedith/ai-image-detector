#!/usr/bin/env bash
# Quick dev startup for TruthLens
# Usage: ./run-dev.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "🚀 TruthLens - Full Stack Dev Startup"
echo "========================================"

# Setup Frontend
echo "📦 Setting up frontend..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    npm install -q
fi

# Setup Backend
echo "📦 Setting up backend..."
cd "$BACKEND_DIR"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements-dev.txt 2>/dev/null || pip install -q fastapi uvicorn python-multipart

# Start services
echo ""
echo "✅ Starting services..."
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

sleep 2

cd "$BACKEND_DIR"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Handle cleanup
trap "kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
