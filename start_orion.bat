@echo off
title ORION - Unified Market Telemetry Platform
echo ========================================================
echo         ORION TELEMETRY ENGINE & QUANTITATIVE AI
echo ========================================================
echo.

:: Setting UTF-8 encoding for Windows terminal
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

:: Build static assets if ./out folder does not exist
if not exist "out\index.html" (
    echo [1/3] Compiling Next.js frontend assets...
    call npm run build
) else (
    echo [1/3] Using compiled frontend assets in ./out
)

echo [2/3] Launching ORION Unified Engine on http://localhost:8000...
echo - Serving Next.js Frontend Dashboard on http://localhost:8000
echo - Serving REST Telemetry APIs & WebSocket on http://localhost:8000
echo.

:: Open browser automatically after 2 seconds
start /b cmd /c "timeout /t 2 /nobreak > nul && start http://localhost:8000"

echo [3/3] Engine Running. Press Ctrl+C in this window to stop.
echo.
python engine.py
