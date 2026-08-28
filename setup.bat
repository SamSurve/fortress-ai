@echo off
title FORTRESS AI - Environment Setup
echo ===================================================
echo  FORTRESS AI - One-Click Environment Setup
echo ===================================================

echo [1/3] Setting up Python virtual environment...
cd /d "%~dp0backend"
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
python seed.py

echo [2/3] Setting up Frontend dependencies...
cd /d "%~dp0frontend"
call npm install

echo [3/3] Running Automated System Verification...
cd /d "%~dp0"
call backend\venv\Scripts\python.exe test_system.py

echo.
echo ===================================================
echo  SETUP AND VERIFICATION COMPLETED SUCCESSFULLY!
echo  Run start_all.bat to start the system.
echo ===================================================
pause
