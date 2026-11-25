@echo off
title AN Xiangqi - Cap Nhat Pikafish NNUE Moi Nhat
chcp 65001 >nul
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\update_pikafish.ps1"
echo.
pause
