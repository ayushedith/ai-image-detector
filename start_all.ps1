<#
Start both backend and frontend in this PowerShell window using background jobs.
Backend: http://localhost:8001
Frontend: http://localhost:3000 (auto-falls back to 3001 if busy)

Usage (from repo root):
	powershell -ExecutionPolicy Bypass -File .\start_all.ps1
To view logs: Receive-Job -Name backend -Keep; Receive-Job -Name frontend -Keep
To stop:     Stop-Job -Name backend,frontend; Remove-Job -Name backend,frontend
#>

$repoRoot = Split-Path $MyInvocation.MyCommand.Path -Parent
$frontend = Join-Path $repoRoot "frontend"

Write-Host "Starting backend on 8001..." -ForegroundColor Cyan
$backendJob = Start-Job -Name backend -ScriptBlock {
		param($root)
		Set-Location $root
		& .\backend\venv\Scripts\python.exe -m uvicorn backend.app.mock_main:app --host 0.0.0.0 --port 8001 --reload
} -ArgumentList $repoRoot

Write-Host "Starting frontend (Next.js)..." -ForegroundColor Cyan
$frontendJob = Start-Job -Name frontend -ScriptBlock {
		param($frontDir)
		Set-Location $frontDir
		npm run dev
} -ArgumentList $frontend

Write-Host "Launched jobs: backend (8001), frontend (3000/3001)." -ForegroundColor Green
Write-Host "View logs:  Receive-Job -Name backend -Keep" -ForegroundColor DarkGray
Write-Host "            Receive-Job -Name frontend -Keep" -ForegroundColor DarkGray
Write-Host "Stop jobs:   Stop-Job -Name backend,frontend; Remove-Job -Name backend,frontend" -ForegroundColor DarkGray
