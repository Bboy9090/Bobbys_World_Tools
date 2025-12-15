@echo off 
set PORT=5050

REM The Pandora Codex - Windows Start Script
REM Equivalent to start.sh for Windows users
REM Starts the production server

setlocal enabledelayedexpansion

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

title The Pandora Codex - Server

echo ========================================================================
echo                    THE PANDORA CODEX - SERVER
echo ========================================================================
echo.

REM ============================================================================
REM NODE.JS DETECTION
REM ============================================================================
echo [INFO] Detecting Node.js...

set "NODE_EXE="

REM Try common Node.js installation paths
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
) else if exist "%PROGRAMFILES%\nodejs\node.exe" (
    set "NODE_EXE=%PROGRAMFILES%\nodejs\node.exe"
) else if exist "%PROGRAMFILES(x86)%\nodejs\node.exe" (
    set "NODE_EXE=%PROGRAMFILES(x86)%\nodejs\node.exe"
) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
) else (
    REM Fallback to PATH-based detection
    node --version >nul 2>&1
    if !errorlevel! equ 0 (
        set "NODE_EXE=node"
    )
)

if "!NODE_EXE!"=="" (
    echo [ERROR] Node.js not found!
    echo.
    echo Node.js 18+ is required. Install from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo    Found Node.js at: !NODE_EXE!
"!NODE_EXE!" --version
echo.

REM ============================================================================
REM CHECK BUILD
REM ============================================================================
echo [INFO] Checking if project is built...

if not exist "%SCRIPT_DIR%crm-api\dist\server.js" (
    echo [ERROR] Backend not built!
    echo.
    echo Please run build.bat first to build the project.
    echo.
    pause
    exit /b 1
)

echo    Build files found!
echo.

REM ============================================================================
REM START SERVER
REM ============================================================================
echo [INFO] Starting Pandora Codex server on port 5000...
echo.

cd /d "%SCRIPT_DIR%crm-api"

REM Set environment variables
set NODE_ENV=production
set PORT=5000

REM Start the server
"!NODE_EXE!" dist\server.js

REM Check exit status
if !errorlevel! neq 0 (
    echo.
    echo [ERROR] Server stopped with error code: !errorlevel!
    echo.
) else (
    echo.
    echo [INFO] Server stopped normally.
    echo.
)

cd /d "%SCRIPT_DIR%"
pause
exit /b !errorlevel!
