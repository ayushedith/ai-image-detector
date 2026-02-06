@REM .\run_backend.bat

@echo off
cd /d %~dp0
"venv\Scripts\python.exe" -m uvicorn backend.app.mock_main:app --host 0.0.0.0 --port 8001 --reload
