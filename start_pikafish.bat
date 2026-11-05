@echo off
title AN Xiangqi - Pikafish NNUE Bridge
chcp 65001 >nul

echo ==================================================================
echo   AN XIANGQI - PIKAFISH NNUE BRIDGE (3000+ ELO)
echo ==================================================================
echo.

cd /d "%~dp0"

if exist "pikafish_bridge.exe" goto :run_standalone

where node >nul 2>nul
if %errorlevel% equ 0 goto :run_node

echo.
echo [!] THONG BAO: May tinh chua co pikafish_bridge.exe va chua cai Node.js.
echo.
echo [1] Ban van co the choi binh thuong!
echo     Extension co san AI Grandmaster JS va Cloud Pikafish (D30+)
echo     chay truc tiep trong trinh duyet Chrome ma khong can bat ky phan mem nao.
echo.
echo [2] Neu muon dung Pikafish Native 3000+ ELO offline:
echo     Hay chay file 'pikafish_bridge.exe' hoac cai dat Node.js tai https://nodejs.org
echo.
pause
goto :end

:run_standalone
echo [*] Phat hien ban Standalone [Khong can cai dat Node.js].
echo [*] Dang khoi dong Pikafish Bridge Native...
echo.
pikafish_bridge.exe
goto :end

:run_node
echo [*] Dang khoi dong bang Node.js...
if not exist "node_modules\ws" (
    echo [*] Dang tu dong cai dat thu vien ws...
    call npm install ws --no-audit --no-fund
)
node scripts/pikafish_bridge.js
goto :end

:end
