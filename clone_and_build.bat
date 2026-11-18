@echo off
setlocal enabledelayedexpansion
title AN Xiangqi - Clone and Build Tool
chcp 65001 >nul

echo ==================================================================
echo       AN XIANGQI - TỰ ĐỘNG CLONE VÀ BUILD MÃ NGUỒN
echo       Repository: https://github.com/2Naq/co-tuong.git
echo ==================================================================
echo.

:: 1. Kiểm tra Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Máy tính của bạn chưa cài đặt Git!
    echo Vui lòng tải và cài đặt Git tại: https://git-scm.com/downloads
    echo Sau khi cài xong, vui lòng khởi động lại file này.
    echo.
    pause
    exit /b 1
)

:: 2. Kiểm tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Máy tính của bạn chưa cài đặt Node.js!
    echo Vui lòng tải và cài đặt Node.js (khuyến nghị bản LTS) tại: https://nodejs.org
    echo Sau khi cài xong, vui lòng khởi động lại file này.
    echo.
    pause
    exit /b 1
)

:: 3. Kiểm tra npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Không tìm thấy npm! Vui lòng kiểm tra lại môi trường Node.js.
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"

:: 4. Xử lý Clone hoặc Cập nhật mã nguồn
if exist ".git" (
    echo [*] Phát hiện đang chạy trong thư mục Git repository hiện tại.
    echo [*] Đang cập nhật code mới nhất từ GitHub (git pull)...
    call git pull
) else if exist "co-tuong\.git" (
    echo [*] Thư mục 'co-tuong' đã tồn tại.
    echo [*] Đang chuyển vào 'co-tuong' và cập nhật code mới (git pull)...
    cd co-tuong
    call git pull
) else (
    echo [*] Đang thực hiện git clone mã nguồn từ GitHub...
    call git clone https://github.com/2Naq/co-tuong.git
    if %errorlevel% neq 0 (
        echo [LỖI] Quá trình git clone thất bại! Vui lòng kiểm tra lại kết nối mạng.
        pause
        exit /b 1
    )
    cd co-tuong
)

:: 5. Tắt tiến trình pikafish_bridge.exe nếu đang chạy ngầm (để tránh lỗi EPERM khi build lại)
echo.
echo [*] Đang kiểm tra và giải phóng file pikafish_bridge.exe nếu đang chạy...
taskkill /F /IM pikafish_bridge.exe >nul 2>nul

:: 6. Cài đặt dependencies
echo.
echo [*] Đang cài đặt/kiểm tra các thư viện phụ thuộc (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo [CẢNH BÁO] Có lỗi/cảnh báo trong quá trình npm install, hệ thống sẽ tiếp tục thử build...
)

:: 7. Chạy build Extension
echo.
echo ==================================================================
echo [*] Đang thực hiện build Extension (npm run build)...
echo ==================================================================
call npm run build
if %errorlevel% neq 0 (
    echo [LỖI] Quá trình build Extension thất bại!
    pause
    exit /b 1
)

:: 8. Chạy build Bridge executable
echo.
echo ==================================================================
echo [*] Đang thực hiện build Pikafish Bridge Native (npm run build:bridge)...
echo ==================================================================
call npm run build:bridge
if %errorlevel% neq 0 (
    echo [CẢNH BÁO] Build file pikafish_bridge.exe qua pkg gặp sự cố.
    echo Bạn vẫn có thể chạy Bridge trực tiếp qua file start_pikafish.bat hoặc lệnh 'npm run pikafish'.
)

echo.
echo ==================================================================
echo   BUILD HOÀN TẤT THÀNH CÔNG!
echo ==================================================================
echo [*] Extension đã sẵn sàng tại thư mục: %CD%
echo     - File JavaScript: dist/injected.js và injected.js
echo     - File Stylesheet: styles/overlay.css và overlay.css
if exist "pikafish_bridge.exe" (
    echo     - Pikafish Bridge: pikafish_bridge.exe (Native)
)
echo.
echo HƯỚNG DẪN SỬ DỤNG TIẾP THEO:
echo 1. Cài Extension vào trình duyệt:
echo    - Mở Chrome/Edge, vào: chrome://extensions/ (hoặc edge://extensions/)
echo    - Bật "Developer mode" (Chế độ cho nhà phát triển).
echo    - Bấm "Load unpacked" (Tải tiện ích đã giải nén) và chọn thư mục này:
echo      "%CD%"
echo.
echo 2. Khởi động AI Pikafish Native:
echo    - Chạy file: start_pikafish.bat (hoặc pikafish_bridge.exe)
echo ==================================================================
echo.
pause
