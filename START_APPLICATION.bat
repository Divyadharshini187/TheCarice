@echo off
REM The Carice - Application Startup Script (Batch Version)
REM This script starts the backend Flask server

setlocal enabledelayedexpansion

echo.
echo ================================
echo Starting The Carice Application
echo ================================
echo.

cd /d "%~dp0"
set "VENV_PATH=%CD%\.venv"
set "BACKEND_DIR=%CD%\backend"

REM Check if virtual environment exists
if not exist "%VENV_PATH%\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found
    echo Please run: python -m venv .venv
    pause
    exit /b 1
)

echo Activating Python virtual environment...
call "%VENV_PATH%\Scripts\activate.bat"

echo Checking dependencies...
cd "%BACKEND_DIR%"

echo.
echo ================================
echo Starting Backend Server
echo ================================
echo Backend API will be available at: http://localhost:5000
echo.

python server.py

pause
