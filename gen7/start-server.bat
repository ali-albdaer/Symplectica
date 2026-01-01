@echo off
echo ========================================
echo Solar System Simulation - Local Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting server with Python...
    echo.
    echo Open your browser to: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo ========================================
    python -m http.server 8000
) else (
    echo Python not found!
    echo.
    echo Please install Python or use another method:
    echo 1. Install Python from https://www.python.org/
    echo 2. Or use Node.js http-server
    echo 3. Or use VS Code Live Server extension
    echo.
    pause
)
