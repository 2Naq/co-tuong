@echo off
title AN Xiangqi - Pikafish NNUE Pro Bridge
chcp 65001 >nul

echo ==================================================================
echo   AN XIANGQI - PIKAFISH NNUE PRO BRIDGE (3500+ ELO AUTO-TUNED)
echo ==================================================================
echo.

cd /d "%~dp0"

set "BRIDGE_URL=https://github.com/2Naq/co-tuong/releases/download/pikafish-bridge-latest/pikafish_bridge.exe"

REM 1. Uu tien chay truc tiep bang Node.js neu may co Node.js + source script moi nhat
where node >nul 2>nul
if %errorlevel% equ 0 (
    if exist "scripts\pikafish_bridge.js" goto :run_node
)

REM 2. Neu khong co Node.js, chay ban Standalone pikafish_bridge.exe
if exist "pikafish_bridge.exe" goto :run_standalone

REM 3. Chua co ca Node.js lan pikafish_bridge.exe -> ho tro tu dong tai tu GitHub Release
echo [!] May tinh chua cai Node.js va chua co file 'pikafish_bridge.exe'.
echo.
echo [*] Ban co muon tu dong tai 'pikafish_bridge.exe' ban moi nhat tu GitHub ve chay luon khong?
echo     Link: %BRIDGE_URL%
echo.
set /p "DL_CHOICE=Nhap Y de tai tu dong (hoac N de bo qua) [Y/n]: "
if /i "%DL_CHOICE%"=="N" goto :manual_info

echo.
echo [*] Dang tai pikafish_bridge.exe tu GitHub Release...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%BRIDGE_URL%' -OutFile 'pikafish_bridge.exe' -UseBasicParsing"
if exist "pikafish_bridge.exe" goto :dl_ok

echo.
echo [!] Tai tu dong that bai (kiem tra ket noi mang hoac Release tren GitHub).
goto :manual_info

:dl_ok
echo [OK] Da tai thanh cong pikafish_bridge.exe! Dang khoi dong...
echo.
goto :run_standalone

:manual_info
echo.
echo [1] Ban van co the choi binh thuong!
echo     Extension co san AI Grandmaster JS va Cloud Pikafish (D30+)
echo     chay truc tiep trong trinh duyet Chrome ma khong can cai dat gi them.
echo.
echo [2] De dung Pikafish Native 3500+ ELO offline (khong can Node.js/npm):
echo     - Tai file 'pikafish_bridge.exe' tai: https://github.com/2Naq/co-tuong/releases
echo     - Bo vao thu muc nay roi chay lai start_pikafish.bat hoac pikafish_bridge.exe
echo.
pause
goto :end

:run_node
echo [*] Dang khoi dong Pikafish Pro Bridge bang Node.js (Auto CPU/RAM)...
if not exist "node_modules\ws" (
    echo [*] Dang tu dong cai dat thu vien ws...
    call npm install ws --no-audit --no-fund
)
node scripts/pikafish_bridge.js
goto :end

:run_standalone
echo [*] Phat hien ban Standalone [Khong can cai dat Node.js/npm].
echo [*] Dang khoi dong Pikafish Pro Bridge Native...
echo.
pikafish_bridge.exe
goto :end

:end
