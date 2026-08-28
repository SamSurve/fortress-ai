@echo off
title FORTRESS AI - Hackathon Prototype Runner
echo ===================================================
echo  FORTRESS AI: Private Organisational AI Assistant
echo  Smart India Hackathon 2026 Prototype
echo ===================================================

echo [*] Starting Backend in new window...
start "FORTRESS AI Backend" "%~dp0run_backend.bat"

timeout /t 3 /nobreak >nul

echo [*] Starting Frontend in new window...
start "FORTRESS AI Frontend" "%~dp0run_frontend.bat"

echo.
echo ===================================================
echo  FORTRESS AI Services Launched!
echo.
echo  Frontend UI:  http://localhost:3000
echo  Backend API:  http://localhost:8000/docs
echo.
echo  Demo Credentials:
echo    Admin:     admin@company.com / admin123
echo    Employee:  employee@company.com / employee123
echo ===================================================
pause
