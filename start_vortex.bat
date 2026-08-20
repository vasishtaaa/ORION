@echo off
echo ========================================================
echo        VORTEX-HF TELEMETRY ENGINE STARTUP SCRIPT
echo ========================================================
echo.

:: Setting UTF-8 encoding specifically for Windows to prevent charmap errors with Rupee symbols
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

echo [1/3] Starting VORTEX-HF Backend Telemetry Engine (Port 8000)...
start "VORTEX-HF Backend" cmd /k "python -u listener.py"

echo [2/3] Starting VORTEX Next.js Frontend Dashboard (Port 3000)...
start "VORTEX-HF UI" cmd /k "cd vortex-ui && npm run dev"

echo [3/3] Launching Terminal Dashboard in Default Browser...
:: Wait 4 seconds to ensure local dev servers are bound to ports
timeout /t 4 /nobreak > nul
start http://localhost:3000

echo.
echo ========================================================
echo All VORTEX-HF services started successfully!
echo - AI Analyst Powered by Gemini 3.6 Flash
echo - Frontend Dashboard: http://localhost:3000
echo - Backend Telemetry:  http://localhost:8000
echo - To stop services, close the terminal windows that opened.
echo ========================================================
echo.
pause
