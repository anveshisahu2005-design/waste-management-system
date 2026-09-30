@echo off
title EcoClean Waste Management System
echo ====================================================
echo Starting EcoClean Waste Management System...
echo ====================================================
cd /d "%~dp0"
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo Python launch failed. Opening index.html directly in default browser...
    start index.html
)
pause
