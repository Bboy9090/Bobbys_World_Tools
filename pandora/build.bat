@echo off
REM The Pandora Codex - Windows Build Script
REM Equivalent to build.sh for Windows users
REM This builds both frontend and backend components

setlocal enabledelayedexpansion

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

title The Pandora Codex - Build

echo ========================================================================
echo                    THE PANDORA CODEX - BUILD
echo ========================================================================
echo.

REM ============================================================================
REM NODE.JS DETECTION
REM ============================================================================
echo [1/3] Detecting Node.js...

set "NODE_EXE="
set "NPM_EXE="

REM Try common Node.js installation paths
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    set "NPM_EXE=C:\Program Files\nodejs\npm.cmd"
) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
    set "NPM_EXE=C:\Program Files (x86)\nodejs\npm.cmd"
) else if exist "%PROGRAMFILES%\nodejs\node.exe" (
    set "NODE_EXE=%PROGRAMFILES%\nodejs\node.exe"
    set "NPM_EXE=%PROGRAMFILES%\nodejs\npm.cmd"
) else if exist "%PROGRAMFILES(x86)%\nodejs\node.exe" (
    set "NODE_EXE=%PROGRAMFILES(x86)%\nodejs\node.exe"
    set "NPM_EXE=%PROGRAMFILES(x86)%\nodejs\npm.cmd"
) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
    set "NPM_EXE=%LOCALAPPDATA%\Programs\nodejs\npm.cmd"
) else (
    REM Fallback to PATH-based detection
    node --version >nul 2>&1
    if !errorlevel! equ 0 (
        set "NODE_EXE=node"
        set "NPM_EXE=npm"
    )
)

if "!NODE_EXE!"=="" (
    echo [ERROR] Node.js not found!
    echo.
    echo Node.js 18+ is required for building. Install from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo    Found Node.js at: !NODE_EXE!
"!NODE_EXE!" --version
echo    Found npm at: !NPM_EXE!
call "!NPM_EXE!" --version
echo.

REM ============================================================================
REM BUILD FRONTEND
REM ============================================================================
echo [2/3] Building Frontend...
echo.

cd /d "%SCRIPT_DIR%frontend"
if !errorlevel! neq 0 (
    echo [ERROR] Frontend directory not found at: %SCRIPT_DIR%frontend
    pause
    exit /b 1
)

echo    Installing frontend dependencies...
call "!NPM_EXE!" install
if !errorlevel! neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    cd /d "%SCRIPT_DIR%"
    pause
    exit /b 1
)

echo    Building frontend...
call "!NPM_EXE!" run build
if !errorlevel! neq 0 (
    echo [ERROR] Failed to build frontend
    cd /d "%SCRIPT_DIR%"
    pause
    exit /b 1
)

echo    Frontend build complete!
echo.

REM ============================================================================
REM PREPARE BACKEND STATIC FILES
REM ============================================================================
echo [2.5/3] Preparing backend static files...

cd /d "%SCRIPT_DIR%"
if not exist "%SCRIPT_DIR%crm-api\public\" mkdir "%SCRIPT_DIR%crm-api\public"

if not exist "%SCRIPT_DIR%frontend\dist\" (
    echo [ERROR] Frontend build directory not found at: %SCRIPT_DIR%frontend\dist
    echo The frontend build may have failed.
    pause
    exit /b 1
)

echo    Copying frontend build to backend public directory...
xcopy /E /I /Y "%SCRIPT_DIR%frontend\dist\*" "%SCRIPT_DIR%crm-api\public\" >nul
if !errorlevel! neq 0 (
    echo [WARNING] Failed to copy some frontend files to backend
)

echo    Static files prepared!
echo.

REM ============================================================================
REM BUILD BACKEND API
REM ============================================================================
echo [3/3] Building Backend API...
echo.

cd /d "%SCRIPT_DIR%crm-api"
if !errorlevel! neq 0 (
    echo [ERROR] API directory not found at: %SCRIPT_DIR%crm-api
    pause
    exit /b 1
)

echo    Installing API dependencies...
call "!NPM_EXE!" install
if !errorlevel! neq 0 (
    echo [ERROR] Failed to install API dependencies
    cd /d "%SCRIPT_DIR%"
    pause
    exit /b 1
)

echo    Generating Prisma client...
call "!NPM_EXE!" exec prisma generate
if !errorlevel! neq 0 (
    echo [WARNING] Prisma generate failed or not configured
)

echo    Building API...
call "!NPM_EXE!" run build
if !errorlevel! neq 0 (
    echo [ERROR] Failed to build API
    cd /d "%SCRIPT_DIR%"
    pause
    exit /b 1
)

echo    Backend API build complete!
echo.

REM ============================================================================
REM BUILD COMPLETE
REM ============================================================================
cd /d "%SCRIPT_DIR%"

echo ========================================================================
echo                    BUILD COMPLETE!
echo ========================================================================
echo.
echo The Pandora Codex has been built successfully.
echo You can now run START_APP.bat or start.bat to launch the application.
echo.
pause
exit /b 0
