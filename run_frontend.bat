@echo off
title FORTRESS AI - Frontend (Next.js)
echo ===================================================
echo  FORTRESS AI - Starting Frontend Client
echo ===================================================
cd /d "%~dp0frontend"

if not exist node_modules (
    echo [*] Installing frontend npm dependencies...
    call npm install
)

echo [*] Starting Next.js development server on http://localhost:3000 ...
call npm run dev
pause
