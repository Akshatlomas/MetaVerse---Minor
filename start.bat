@echo off
REM ==============================================================================
REM IIIT BHOPAL METAVERSE — ONE-CLICK LAUNCH SCRIPT (Windows)
REM ==============================================================================

echo ====================================================================
echo        INDIAN INSTITUTE OF INFORMATION TECHNOLOGY BHOPAL
echo             VIRTUAL CAMPUS METAVERSE & CLASSROOMS
echo ====================================================================

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH! Please install Node.js v18+.
    pause
    exit /b 1
)

echo [OK] Node.js detected.
echo [INFO] Starting Backend Server (Port 5001) and Frontend Client (Port 5173)...

start "IIIT Bhopal Metaverse - Backend" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak >nul
start "IIIT Bhopal Metaverse - Frontend" cmd /k "cd client && npm run dev"

echo.
echo Application launched! Open http://localhost:5173 in your browser.
echo.
pause
