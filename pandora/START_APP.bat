@echo off
REM The Pandora Codex - Windows Launcher
REM Double-click this file to start the application
REM This script uses absolute paths to ensure Node.js and Python are found

setlocal enabledelayedexpansion

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

title The Pandora Codex - Starting...

echo.
echo ========================================================================
echo                    THE PANDORA CODEX
echo              Device Repair ^& Exploitation Suite
echo ========================================================================
echo.
echo [INFO] Checking prerequisites...
echo.

REM ============================================================================
REM PYTHON DETECTION - Using absolute paths for reliability
REM ============================================================================
echo [1/2] Checking for Python installation...

set "PYTHON_EXE="

REM Try common Python installation paths
if exist "C:\Program Files\Python312\python.exe" (
    set "PYTHON_EXE=C:\Program Files\Python312\python.exe"
) else if exist "C:\Program Files\Python311\python.exe" (
    set "PYTHON_EXE=C:\Program Files\Python311\python.exe"
) else if exist "C:\Program Files\Python310\python.exe" (
    set "PYTHON_EXE=C:\Program Files\Python310\python.exe"
) else if exist "C:\Program Files\Python39\python.exe" (
    set "PYTHON_EXE=C:\Program Files\Python39\python.exe"
) else if exist "C:\Program Files\Python38\python.exe" (
    set "PYTHON_EXE=C:\Program Files\Python38\python.exe"
) else if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
) else if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
) else if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
) else if exist "%LOCALAPPDATA%\Programs\Python\Python39\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python39\python.exe"
) else if exist "%LOCALAPPDATA%\Programs\Python\Python38\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python38\python.exe"
) else (
    REM Fallback to PATH-based detection
    python --version >nul 2>&1
    if !errorlevel! equ 0 (
        set "PYTHON_EXE=python"
    )
)

if "!PYTHON_EXE!"=="" (
    echo [ERROR] Python not found!
    echo.
    echo Python 3.8 or higher is required but was not found in common locations:
    echo   - C:\Program Files\Python3X\
    echo   - %%LOCALAPPDATA%%\Programs\Python\Python3X\
    echo   - System PATH
    echo.
    echo Please install Python from: https://www.python.org
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo    Found Python at: !PYTHON_EXE!
"!PYTHON_EXE!" --version
echo.

REM ============================================================================
REM NODE.JS DETECTION - Using absolute paths for reliability
REM ============================================================================
echo [2/2] Checking for Node.js installation...

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
    echo Node.js 18 or higher is required but was not found in common locations:
    echo   - C:\Program Files\nodejs\
    echo   - C:\Program Files (x86)\nodejs\
    echo   - %%LOCALAPPDATA%%\Programs\nodejs\
    echo   - System PATH
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Download the LTS (Long Term Support) version.
    echo.
    pause
    exit /b 1
)

echo    Found Node.js at: !NODE_EXE!
"!NODE_EXE!" --version
echo.

REM ============================================================================
REM LAUNCH APPLICATION
REM ============================================================================
echo [INFO] All prerequisites met!
echo [INFO] Starting The Pandora Codex...
echo.

REM Set Bobby Creator environment variable (bypasses password)
set BOBBY_CREATOR=1

REM Run the launcher using detected Python
"!PYTHON_EXE!" "%SCRIPT_DIR%launch_app.py"

REM Check if launch was successful
if !errorlevel! neq 0 (
    echo.
    echo [ERROR] Application failed to start (exit code: !errorlevel!)
    echo Check the error messages above for details.
    echo.
) else (
    echo.
    echo [INFO] Application closed successfully.
    echo.
)

pause
exit /b !errorlevel!
