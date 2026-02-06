<#
Starts both frontend (Next.js) and backend (FastAPI) in separate PowerShell windows.
Front: http://localhost:3001 (falls back from 3000 if busy)
Back:  http://localhost:8001
#>

$repoRoot = Split-Path $MyInvocation.MyCommand.Path -Parent
$frontend = Join-Path $repoRoot "frontend"
$backendCmd = ".\backend\venv\Scripts\python.exe -m uvicorn backend.app.mock_main:app --host 0.0.0.0 --port 8001 --reload"
$frontendCmd = "npm run dev"

Write-Host "Launching backend on port 8001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoLogo", "-NoExit", "-Command", "cd `"$repoRoot`"; $backendCmd"

Write-Host "Launching frontend (Next.js)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoLogo", "-NoExit", "-Command", "cd `"$frontend`"; $frontendCmd"

Write-Host "Both processes started in separate windows." -ForegroundColor Green
