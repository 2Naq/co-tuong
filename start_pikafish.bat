@echo off
title AN Xiangqi - Pikafish NNUE Bridge

echo ==================================================================
echo AN XIANGQI - KHOI DONG PIKAFISH NNUE BRIDGE (3000+ ELO)
echo ==================================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [!] LOI: May tinh chua cai dat Node.js!
    echo Vui long tai va cai dat Node.js tai: https://nodejs.org
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\ws" (
    echo [*] Dang tu dong cai dat thu vien ws...
    call npm install ws --no-audit --no-fund
)

echo [*] Dang khoi dong Pikafish Bridge...
node scripts/pikafish_bridge.js
pause
