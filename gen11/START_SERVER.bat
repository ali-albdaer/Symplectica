@echo off
echo ===============================================
echo   SOLAR SYSTEM SIMULATION - Gen11
echo   Starting Local Web Server...
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting Python HTTP Server on port 8000...
    echo.
    echo Open your browser and navigate to:
    echo   http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python from https://www.python.org/
    echo Or use another method to serve the files:
    echo   - VS Code Live Server extension
    echo   - Any other local web server
    echo.
    pause
)
