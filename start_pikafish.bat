@echo off
title AN Xiangqi - Pikafish NNUE Pro Bridge
chcp 65001 >nul

echo ==================================================================
echo   AN XIANGQI - PIKAFISH NNUE PRO BRIDGE (3500+ ELO AUTO-TUNED)
echo ==================================================================
echo.

cd /d "%~dp0"

REM Uu tien chay truc tiep bang Node.js neu co san de luon chay ban script moi nhat
where node >nul 2>nul
if %errorlevel% equ 0 (
    if exist "scripts\pikafish_bridge.js" goto :run_node
)

if exist "pikafish_bridge.exe" goto :run_standalone

echo.
echo [!] THONG BAO: May tinh chua co Node.js va chua co pikafish_bridge.exe.
echo.
echo [1] Ban van co the choi binh thuong!
echo     Extension co san AI Grandmaster JS va Cloud Pikafish (D30+)
echo     chay truc tiep trong trinh duyet Chrome ma khong can bat ky phan mem nao.
echo.
echo [2] Neu muon dung Pikafish Native 3500+ ELO offline:
echo     Hay cai dat Node.js tai https://nodejs.org hoac chay pikafish_bridge.exe
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
echo [*] Phat hien ban Standalone [Khong can cai dat Node.js].
echo [*] Dang khoi dong Pikafish Bridge Native...
echo.
pikafish_bridge.exe
goto :end

:end
