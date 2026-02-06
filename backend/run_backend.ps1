<#
Start backend API (FastAPI/Uvicorn) from backend folder.
Usage (from repo root or backend folder):
  powershell -ExecutionPolicy Bypass -File backend\run_backend.ps1
#>

$here = Split-Path $MyInvocation.MyCommand.Path -Parent
Set-Location $here

Write-Host "Starting backend on http://localhost:8001 ..." -ForegroundColor Cyan
& .\venv\Scripts\python.exe -m uvicorn backend.app.mock_main:app --host 0.0.0.0 --port 8001 --reload
