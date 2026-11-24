<#
.SYNOPSIS
    ORION - Unified Telemetry and Quantitative AI Platform Launcher (PowerShell)
.DESCRIPTION
    Builds and runs the ORION platform. Automatically detects source file changes
    and compiles the Next.js static export into ./out, manages ports, and starts the engine.
.PARAMETER Build
    Force Next.js production static export build to apply recent code changes.
.PARAMETER Clean
    Purge cached directories (.next, out) before building.
.PARAMETER Install
    Force reinstallation of Node.js and Python dependencies.
.PARAMETER Dev
    Start Next.js development server with hot reload alongside the backend engine.
.PARAMETER NoBrowser
    Do not automatically open the web browser.
.PARAMETER Kill
    Kill any existing processes occupying ports 8000 or 8001.
#>

param(
    [Alias("b")][switch]$Build,
    [Alias("c")][switch]$Clean,
    [Alias("i")][switch]$Install,
    [Alias("d")][switch]$Dev,
    [Alias("n")][switch]$NoBrowser,
    [Alias("k")][switch]$Kill
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "           ORION - UNIFIED TELEMETRY AND QUANTITATIVE AI PLATFORM              " -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Detect Python
Write-Host "[1/5] Detecting Python runtime environment..." -ForegroundColor Yellow
$PythonExe = $null
$LocalVenvPy = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

if (Test-Path $LocalVenvPy) {
    $PythonExe = $LocalVenvPy
    Write-Host "  - Using local virtual environment: .venv" -ForegroundColor Green
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $PythonExe = "python"
    Write-Host "  - Using system Python" -ForegroundColor Green
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $PythonExe = "py"
    Write-Host "  - Using Python Launcher: py" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Python 3.10+ was not found on your system!" -ForegroundColor Red
    Write-Host "Please install Python from https://python.org and ensure 'Add Python to PATH' is checked." -ForegroundColor Red
    exit 1
}

# 2. Check and Free Ports 8000 and 8001
Write-Host "[2/5] Checking for lingering server instances on ports 8000/8001..." -ForegroundColor Yellow
$Ports = @(8000, 8001)
foreach ($Port in $Ports) {
    $Connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($Connections) {
        $Pids = $Connections.OwningProcess | Select-Object -Unique
        foreach ($ProcessId in $Pids) {
            if ($ProcessId -and $ProcessId -ne 0 -and $ProcessId -ne $PID) {
                Write-Host "  - Terminating lingering process PID $ProcessId on port $Port..." -ForegroundColor DarkYellow
                Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
            }
        }
    }
}
Write-Host "  - Ports 8000 and 8001 verified ready." -ForegroundColor Green

# 3. Python Dependencies
Write-Host "[3/5] Verifying Python dependencies..." -ForegroundColor Yellow
$NeedPyInstall = $Install
if (-not $NeedPyInstall) {
    & $PythonExe -c "import requests, bs4, lxml" 2>$null
    if ($LASTEXITCODE -ne 0) { $NeedPyInstall = $true }
}
if ($NeedPyInstall) {
    Write-Host "  - Installing dependencies from requirements.txt..." -ForegroundColor DarkCyan
    & $PythonExe -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install Python dependencies." -ForegroundColor Red
        exit 1
    }
}
Write-Host "  - Python dependencies verified." -ForegroundColor Green

# 4. Node.js & npm Dependencies
Write-Host "[4/5] Verifying Node.js environment and packages..." -ForegroundColor Yellow
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] npm was not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

$NeedNpmInstall = $Install
if (-not (Test-Path "node_modules")) {
    $NeedNpmInstall = $true
} else {
    $LockPath = if (Test-Path "node_modules/.package-lock.json") { "node_modules/.package-lock.json" } else { "node_modules" }
    if ((Get-Item "package.json").LastWriteTime -gt (Get-Item $LockPath).LastWriteTime) {
        $NeedNpmInstall = $true
    }
}

if ($NeedNpmInstall) {
    Write-Host "  - Installing Node.js dependencies: npm install..." -ForegroundColor DarkCyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] 'npm install' failed." -ForegroundColor Red
        exit 1
    }
}
Write-Host "  - Node.js dependencies verified." -ForegroundColor Green

# 5. Frontend Build & Source Change Detection
Write-Host "[5/5] Checking frontend build status..." -ForegroundColor Yellow

if ($Dev) {
    Write-Host "`n===============================================================================" -ForegroundColor Magenta
    Write-Host "  ORION DEVELOPMENT MODE: Next.js Hot-Reload + Backend Telemetry Engine        " -ForegroundColor Magenta
    Write-Host "  - Next.js UI (Live Dev Server): http://localhost:3000                        " -ForegroundColor Magenta
    Write-Host "  - Backend REST & Telemetry APIs: http://localhost:8000                       " -ForegroundColor Magenta
    Write-Host "  - WebSocket High-Frequency Feed: ws://localhost:8001                         " -ForegroundColor Magenta
    Write-Host "===============================================================================`n" -ForegroundColor Magenta

    if (-not $NoBrowser) {
        Start-Job -ScriptBlock { Start-Sleep -Seconds 4; Start-Process "http://localhost:3000" } | Out-Null
    }
    Start-Process -FilePath "npm" -ArgumentList "run dev"
    & $PythonExe engine.py
    exit 0
}

if ($Clean) {
    Write-Host "  - Cleaning build caches (.next, out)..." -ForegroundColor DarkYellow
    if (Test-Path "out") { Remove-Item -Recurse -Force "out" }
    if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
}

$NeedBuild = $Build
$OutIndex = "out\index.html"

if (-not (Test-Path $OutIndex)) {
    $NeedBuild = $true
} elseif (-not $NeedBuild) {
    $OutTime = (Get-Item $OutIndex).LastWriteTime
    $SourceDirs = @("app", "components", "lib", "public") | Where-Object { Test-Path $_ }
    $SourceFiles = Get-ChildItem -Path $SourceDirs -Recurse -File -ErrorAction SilentlyContinue
    $ConfigFiles = @("package.json", "next.config.ts") | Where-Object { Test-Path $_ } | ForEach-Object { Get-Item $_ }
    
    $AllSources = @($SourceFiles) + @($ConfigFiles)
    $NewestSource = ($AllSources | Measure-Object -Property LastWriteTime -Maximum).Maximum
    
    if ($NewestSource -and $NewestSource -gt $OutTime) {
        Write-Host "  - Detected modifications in frontend source files since last build." -ForegroundColor Cyan
        $NeedBuild = $true
    }
}

if ($NeedBuild) {
    Write-Host "  - Compiling Next.js production static export: npm run build..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Next.js compilation failed." -ForegroundColor Red
        exit 1
    }
    Write-Host "  - Frontend build completed successfully. Production assets updated in ./out" -ForegroundColor Green
} else {
    Write-Host "  - Production frontend assets in ./out are up to date with source files." -ForegroundColor Green
}

# 6. Launch Unified Services
Write-Host "`n===============================================================================" -ForegroundColor Cyan
Write-Host "  ORION UNIFIED SERVICES ACTIVE                                                " -ForegroundColor Green
Write-Host "  - Production Web UI: http://localhost:8000                                   " -ForegroundColor Cyan
Write-Host "  - REST Telemetry APIs: http://localhost:8000/api/*                           " -ForegroundColor Cyan
Write-Host "  - High-Frequency WS Feed: ws://localhost:8001                                " -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "`n  Opening dashboard in browser..." -ForegroundColor Yellow
Write-Host "  Press Ctrl+C in this terminal window to shut down the server.`n" -ForegroundColor DarkGray

if (-not $NoBrowser) {
    Start-Job -ScriptBlock { Start-Sleep -Seconds 2; Start-Process "http://localhost:8000" } | Out-Null
}

& $PythonExe engine.py
