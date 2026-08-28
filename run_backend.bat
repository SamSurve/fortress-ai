@echo off
title FORTRESS AI - Backend Server (FastAPI)
echo ===================================================
echo  FORTRESS AI - Starting Backend Server
echo ===================================================
cd /d "%~dp0backend"

if not exist venv (
    echo [*] Creating Python virtual environment...
    python -m venv venv
)

echo [*] Activating virtual environment...
call venv\Scripts\activate.bat

echo [*] Installing dependencies...
pip install -r requirements.txt

echo [*] Initializing database and pre-seeding accounts...
python seed.py

echo [*] Launching FastAPI on http://localhost:8000 ...
python main.py
pause
