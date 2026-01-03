@echo off
REM ============================================
REM Solar System Simulation - Quick Launcher
REM ============================================

echo.
echo ========================================
echo   SOLAR SYSTEM SIMULATION LAUNCHER
echo ========================================
echo.
echo Starting local HTTP server...
echo.
echo Once server starts:
echo   1. Open browser
echo   2. Go to: http://localhost:8000
echo   3. Click canvas to start!
echo.
echo Press Ctrl+C to stop server
echo ========================================
echo.

cd /d "%~dp0"
python -m http.server 8000
