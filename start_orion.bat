@echo off
setlocal enabledelayedexpansion
title ORION - High-Frequency Telemetry and Quantitative AI Platform

:: Ensure execution happens from the script's directory
cd /d "%~dp0"

:: Set console encoding to UTF-8
chcp 65001 > nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

:: Initialize CLI flag variables
set "FORCE_BUILD=0"
set "CLEAN_BUILD=0"
set "FORCE_INSTALL=0"
set "DEV_MODE=0"
set "NO_BROWSER=0"
set "KILL_EXISTING=0"
set "SHOW_HELP=0"

:: Parse command-line arguments
for %%A in (%*) do (
    if /i "%%~A"=="--build" set "FORCE_BUILD=1"
    if /i "%%~A"=="-b" set "FORCE_BUILD=1"
    if /i "%%~A"=="build" set "FORCE_BUILD=1"
    if /i "%%~A"=="--rebuild" set "FORCE_BUILD=1"
    if /i "%%~A"=="-r" set "FORCE_BUILD=1"
    if /i "%%~A"=="rebuild" set "FORCE_BUILD=1"
    if /i "%%~A"=="--clean" set "CLEAN_BUILD=1"
    if /i "%%~A"=="-c" set "CLEAN_BUILD=1"
    if /i "%%~A"=="--install" set "FORCE_INSTALL=1"
    if /i "%%~A"=="-i" set "FORCE_INSTALL=1"
    if /i "%%~A"=="--dev" set "DEV_MODE=1"
    if /i "%%~A"=="-d" set "DEV_MODE=1"
    if /i "%%~A"=="--no-browser" set "NO_BROWSER=1"
    if /i "%%~A"=="-n" set "NO_BROWSER=1"
    if /i "%%~A"=="--kill" set "KILL_EXISTING=1"
    if /i "%%~A"=="-k" set "KILL_EXISTING=1"
    if /i "%%~A"=="--help" set "SHOW_HELP=1"
    if /i "%%~A"=="-h" set "SHOW_HELP=1"
    if /i "%%~A"=="/?" set "SHOW_HELP=1"
    if /i "%%~A"=="help" set "SHOW_HELP=1"
)

if "%SHOW_HELP%"=="1" goto :SHOW_HELP_SCREEN

echo ===============================================================================
echo            ORION - UNIFIED TELEMETRY AND QUANTITATIVE AI PLATFORM
echo ===============================================================================
echo.

:: -----------------------------------------------------------------------------
:: Step 1: Detect Python Environment
:: -----------------------------------------------------------------------------
echo [1/5] Detecting Python runtime environment...

set "PYTHON_EXE="

if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\python.exe"
    echo   - Using local virtual environment: .venv
    goto :PYTHON_FOUND
)

where python >nul 2>nul
if %errorlevel% equ 0 (
    set "PYTHON_EXE=python"
    echo   - Using system Python
    goto :PYTHON_FOUND
)

where py >nul 2>nul
if %errorlevel% equ 0 (
    set "PYTHON_EXE=py"
    echo   - Using Python Launcher: py
    goto :PYTHON_FOUND
)

:PYTHON_NOT_FOUND
echo.
echo [ERROR] Python was not found on your system!
echo Please install Python 3.10+ from https://python.org
echo and ensure "Add Python to PATH" is checked during installation.
echo.
pause
exit /b 1

:PYTHON_FOUND

:: -----------------------------------------------------------------------------
:: Step 2: Manage Port Conflicts & Lingering Engine Instances
:: -----------------------------------------------------------------------------
echo [2/5] Checking for lingering server instances on ports 8000/8001...

"%PYTHON_EXE%" -c "import socket, subprocess, sys; pids=set(); [(pids.update([l.split()[-1] for l in subprocess.check_output('netstat -ano', shell=True).decode('utf-8', errors='ignore').splitlines() if f':{port}' in l and 'LISTENING' in l])) for port in (8000, 8001)]; [subprocess.run(f'taskkill /F /PID {p}', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) for p in pids if p != '0']; sys.exit(0)" >nul 2>nul

echo   - Ports 8000 and 8001 verified ready.

:: -----------------------------------------------------------------------------
:: Step 3: Verify Python Dependencies
:: -----------------------------------------------------------------------------
echo [3/5] Verifying Python dependencies...

if "%FORCE_INSTALL%"=="1" goto :DO_PY_INSTALL

"%PYTHON_EXE%" -c "import requests, bs4, lxml" >nul 2>nul
if %errorlevel% equ 0 goto :PY_DEPS_OK

:DO_PY_INSTALL
echo   - Installing / updating Python dependencies from requirements.txt...
"%PYTHON_EXE%" -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b 1
)
echo   - Python packages installed successfully.
goto :PY_DEPS_DONE

:PY_DEPS_OK
echo   - Python dependencies verified.

:PY_DEPS_DONE

:: -----------------------------------------------------------------------------
:: Step 4: Verify Node.js Environment & Dependencies
:: -----------------------------------------------------------------------------
echo [4/5] Verifying Node.js environment and packages...

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 'npm' was not found on your system!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

if "%FORCE_INSTALL%"=="1" goto :DO_NPM_INSTALL
if not exist "node_modules" goto :DO_NPM_INSTALL

"%PYTHON_EXE%" -c "import os, sys; lock='node_modules/.package-lock.json' if os.path.exists('node_modules/.package-lock.json') else 'node_modules'; sys.exit(1 if os.path.exists('package.json') and os.path.exists(lock) and os.path.getmtime('package.json') > os.path.getmtime(lock) else 0)" >nul 2>nul
if %errorlevel% neq 0 (
    echo   - Detected updated dependencies in package.json.
    goto :DO_NPM_INSTALL
)
echo   - Node.js dependencies verified.
goto :NPM_DEPS_DONE

:DO_NPM_INSTALL
echo   - Installing Node.js dependencies: npm install...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] 'npm install' failed. Please check your network or Node.js setup.
    pause
    exit /b 1
)
echo   - Node.js packages installed successfully.

:NPM_DEPS_DONE

:: -----------------------------------------------------------------------------
:: Step 5: Check & Compile Frontend Assets to Implement Code Changes
:: -----------------------------------------------------------------------------
echo [5/5] Checking frontend build status...

if "%DEV_MODE%"=="1" goto :DEV_MODE_START

if not "%CLEAN_BUILD%"=="1" goto :SKIP_CLEAN
echo   - Cleaning build caches: .next and out...
if exist "out" rd /s /q "out"
if exist ".next" rd /s /q ".next"
set "FORCE_BUILD=1"

:SKIP_CLEAN

set "NEED_BUILD=%FORCE_BUILD%"

if not exist "out\index.html" (
    set "NEED_BUILD=1"
    goto :DO_NEXT_BUILD
)

if "%NEED_BUILD%"=="1" goto :DO_NEXT_BUILD

:: Automatic source change detection:
:: Compare newest timestamp in source files against out\index.html
"%PYTHON_EXE%" -c "import os, sys; out='out/index.html'; t_out=os.path.getmtime(out) if os.path.exists(out) else 0; src=['package.json','next.config.ts']+[os.path.join(r,f) for d in ['app','components','lib','public'] if os.path.exists(d) for r,_,fs in os.walk(d) for f in fs]; t_src=max([os.path.getmtime(p) for p in src if os.path.exists(p)] or [0]); sys.exit(0 if t_src <= t_out and t_out > 0 else 1)" >nul 2>nul
if %errorlevel% neq 0 (
    echo   - Detected modifications in frontend source files since last build.
    goto :DO_NEXT_BUILD
)

echo   - Production frontend assets in ./out are up to date with source files.
goto :START_SERVICES

:DO_NEXT_BUILD
echo   - Compiling Next.js production static export: npm run build...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Next.js compilation failed. Check above errors for details.
    pause
    exit /b 1
)
echo   - Frontend build completed successfully. Production assets updated in ./out.
goto :START_SERVICES

:DEV_MODE_START
echo.
echo ===============================================================================
echo   ORION DEVELOPMENT MODE: Next.js Hot-Reload + Backend Telemetry Engine
echo   - Next.js UI (Live Dev Server): http://localhost:3000
echo   - Backend REST & Telemetry APIs: http://localhost:8000
echo   - WebSocket High-Frequency Feed: ws://localhost:8001
echo ===============================================================================
echo.

if "%NO_BROWSER%"=="0" (
    start /b cmd /c "ping -n 4 127.0.0.1 > nul && start http://localhost:3000"
)

:: Start Next dev server in background
start "ORION Next.js Dev Server" cmd /c "npm run dev"

:: Run engine in foreground
"%PYTHON_EXE%" engine.py
goto :SHUTDOWN

:START_SERVICES
echo.
echo ===============================================================================
echo   ORION UNIFIED SERVICES ACTIVE
echo   - Production Web UI: http://localhost:8000
echo   - REST Telemetry APIs: http://localhost:8000/api/*
echo   - High-Frequency WS Feed: ws://localhost:8001
echo ===============================================================================
echo.
echo   Opening dashboard in browser...
echo   Press Ctrl+C in this terminal window to shut down the server.
echo.

if "%NO_BROWSER%"=="0" (
    start /b cmd /c "ping -n 3 127.0.0.1 > nul && start http://localhost:8000"
)

:: Launch Core Unified Engine
"%PYTHON_EXE%" engine.py

:SHUTDOWN
if %errorlevel% neq 0 (
    echo.
    echo [CRITICAL] ORION Engine exited with error code %errorlevel%.
    pause
)
exit /b %errorlevel%

:SHOW_HELP_SCREEN
echo.
echo ===============================================================================
echo                     ORION CLI LAUNCHER HELP
echo ===============================================================================
echo.
echo Usage:
echo   In Command Prompt (CMD):
echo     start_orion.bat [options]
echo.
echo   In Windows PowerShell:
echo     .\start_orion.bat [options]
echo     .\start_orion.ps1 [options]
echo.
echo Options:
echo   --build, -b       Force a Next.js production build to compile recent changes
echo   --clean, -c       Purge cache (.next, out) and perform a clean rebuild
echo   --install, -i     Force reinstall of Node.js and Python dependencies
echo   --dev, -d         Launch Next.js in hot-reloading dev mode alongside engine
echo   --no-browser, -n  Start backend without automatically launching default browser
echo   --kill, -k        Forcefully terminate lingering processes on ports 8000/8001
echo   --help, -h        Display this help documentation
echo.
echo Note: When running without flags, ORION automatically detects if any
echo source files were modified since the last build and recompiles as needed!
echo ===============================================================================
exit /b 0
