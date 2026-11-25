@echo off
setlocal enabledelayedexpansion
title AN Xiangqi - Clone and Build Tool
chcp 65001 >nul

echo ==================================================================
echo       AN XIANGQI - TỰ ĐỘNG CLONE VÀ BUILD MÃ NGUỒN
echo       Repository: https://github.com/2Naq/co-tuong.git
echo ==================================================================
echo.

:: 1. Chuyển thư mục làm việc về vị trí chứa file bat này
cd /d "%~dp0"

:: 2. Khởi tạo biến lưu phiên bản
set "OLD_VER=Chua_Co"
set "NEW_VER=Chua_Xac_Dinh"
set "LATEST_COMMIT="

:: Đọc phiên bản cũ trước khi kéo code mới
if exist "manifest.json" (
    for /f "tokens=2 delims=:, " %%a in ('findstr /i "version_name" manifest.json 2^>nul') do set "OLD_VER=%%~a"
) else if exist "co-tuong\manifest.json" (
    for /f "tokens=2 delims=:, " %%a in ('findstr /i "version_name" co-tuong\manifest.json 2^>nul') do set "OLD_VER=%%~a"
)

:: 3. Kiểm tra Git
where git >nul 2>nul
if %errorlevel% neq 0 goto :err_no_git

:: 4. Kiểm tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 goto :err_no_node

:: 5. Kiểm tra npm
where npm >nul 2>nul
if %errorlevel% neq 0 goto :err_no_npm

:: 6. Xác định thư mục và xử lý Clone hoặc Cập nhật
if exist ".git" goto :repo_current_git
if exist "package.json" goto :repo_current_pkg
if exist "co-tuong\.git" goto :repo_sub_git
if exist "co-tuong\package.json" goto :repo_sub_pkg
goto :repo_do_clone

:repo_current_git
echo [*] Phát hiện đang chạy trong thư mục Git repository hiện tại.
if not "!OLD_VER!"=="Chua_Co" echo [*] Phiên bản hiện tại trên máy: !OLD_VER!
echo [*] Đang cập nhật code mới nhất từ GitHub [git pull]...
call git checkout -- dist/ injected.js overlay.css styles/overlay.css >nul 2>nul
call git pull
goto :read_new_ver

:repo_current_pkg
echo [*] Phát hiện mã nguồn dự án đã có sẵn trong thư mục hiện tại.
echo [*] Bỏ qua bước clone để sử dụng trực tiếp mã nguồn này.
goto :read_new_ver

:repo_sub_git
echo [*] Thư mục 'co-tuong' đã tồn tại.
if not "!OLD_VER!"=="Chua_Co" echo [*] Phiên bản hiện tại trên máy: !OLD_VER!
echo [*] Đang chuyển vào 'co-tuong' và cập nhật code mới [git pull]...
cd co-tuong
call git checkout -- dist/ injected.js overlay.css styles/overlay.css >nul 2>nul
call git pull
goto :read_new_ver

:repo_sub_pkg
echo [*] Thư mục 'co-tuong' đã tồn tại mã nguồn.
cd co-tuong
goto :read_new_ver

:repo_do_clone
echo [*] Đang thực hiện git clone mã nguồn từ GitHub...
call git clone https://github.com/2Naq/co-tuong.git
if %errorlevel% neq 0 goto :err_clone_failed
cd co-tuong
goto :read_new_ver

:read_new_ver
:: Đọc phiên bản mới vừa kéo về từ manifest.json (ưu tiên version_name, sau đó là version)
if exist "manifest.json" (
    for /f "tokens=2 delims=:, " %%a in ('findstr /i "version_name" manifest.json 2^>nul') do set "NEW_VER=%%~a"
    if "!NEW_VER!"=="Chua_Xac_Dinh" (
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "\"version\"" manifest.json 2^>nul') do set "NEW_VER=%%~a"
    )
)

:: Lấy thông tin commit mới nhất từ Git
for /f "delims=" %%c in ('git log -1 --pretty^=format:"%%h - %%s" 2^>nul') do set "LATEST_COMMIT=%%c"

goto :start_build

:start_build
:: Giữ nguyên phiên bản từ GitHub khi build, tránh làm bẩn git working tree
set "KEEP_VERSION=1"

:: 7. Tắt tiến trình pikafish_bridge.exe nếu đang chạy ngầm
echo.
echo [*] Đang kiểm tra và giải phóng file pikafish_bridge.exe nếu đang chạy...
taskkill /F /IM pikafish_bridge.exe >nul 2>nul

:: 8. Cài đặt dependencies
echo.
echo [*] Đang cài đặt/kiểm tra các thư viện phụ thuộc [npm install]...
call npm install
if %errorlevel% neq 0 (
    echo [CẢNH BÁO] Có cảnh báo trong quá trình npm install, hệ thống sẽ tiếp tục thử build...
)

:: 9. Chạy build Extension
echo.
echo ==================================================================
echo [*] Đang thực hiện build Extension [npm run build]...
echo ==================================================================
call npm run build
if %errorlevel% neq 0 goto :err_build_failed

:: 10. Chạy build Bridge executable
echo.
echo ==================================================================
echo [*] Đang thực hiện build Pikafish Bridge Native [npm run build:bridge]...
echo ==================================================================
call npm run build:bridge
if %errorlevel% neq 0 (
    echo [CẢNH BÁO] Build file pikafish_bridge.exe qua pkg gặp sự cố.
    echo Bạn vẫn có thể chạy Bridge trực tiếp qua file start_pikafish.bat hoặc lệnh npm run pikafish.
)

echo.
echo ==================================================================
if "!OLD_VER!"=="Chua_Co" goto :show_new_install
if "!OLD_VER!"=="!NEW_VER!" goto :show_up_to_date
goto :show_updated

:show_new_install
echo   [+] CÀI ĐẶT MỚI THÀNH CÔNG!
echo ==================================================================
echo [*] Phiên bản tải về:       !NEW_VER!
goto :show_footer

:show_up_to_date
echo   [i] BẠN ĐANG DÙNG PHIÊN BẢN MỚI NHẤT!
echo ==================================================================
echo [*] Phiên bản hiện tại:     !NEW_VER!
echo [*] Trạng thái:             Đã đồng bộ với GitHub (không có thay đổi mới).
goto :show_footer

:show_updated
echo   [OK] CẬP NHẬT PHIÊN BẢN MỚI THÀNH CÔNG!
echo ==================================================================
echo [*] Phiên bản cũ trên máy:  !OLD_VER!
echo [*] Phiên bản MỚI NHẤT:     !NEW_VER!
echo [*] Trạng thái:             ĐÃ NÂNG CẤP LÊN BẢN MỚI THÀNH CÔNG!
goto :show_footer

:show_footer
if defined LATEST_COMMIT echo [*] Chi tiết bản cập nhật:  !LATEST_COMMIT!
echo ==================================================================
echo [*] Extension đã sẵn sàng tại thư mục: %CD%
echo     - File JavaScript: dist/injected.js và injected.js
echo     - File Stylesheet: styles/overlay.css và overlay.css
if exist "pikafish_bridge.exe" (
    echo     - Pikafish Bridge: pikafish_bridge.exe [Native]
)
echo.
echo HƯỚNG DẪN SỬ DỤNG TIẾP THEO:
echo 1. Cài / Cập nhật Extension vào trình duyệt:
echo    - Mở Chrome hoặc Edge, truy cập: chrome://extensions/
echo    - Nếu đã cài trước đó: Bấm nút "Reload" [Tải lại] để áp dụng bản mới!
echo    - Nếu cài lần đầu: Bật "Developer mode", bấm "Load unpacked" và chọn:
echo      "%CD%"
echo.
echo 2. Khởi động AI Pikafish Native:
echo    - Chạy file: start_pikafish.bat hoặc pikafish_bridge.exe
echo ==================================================================
echo.
pause
exit /b 0

:err_no_git
echo.
echo [LỖI] Máy tính của bạn chưa cài đặt Git!
echo Vui lòng tải và cài đặt Git tại: https://git-scm.com/downloads
echo Sau khi cài xong, vui lòng khởi động lại file này.
echo.
pause
exit /b 1

:err_no_node
echo.
echo [LỖI] Máy tính của bạn chưa cài đặt Node.js!
echo Vui lòng tải và cài đặt Node.js [khuyến nghị bản LTS] tại: https://nodejs.org
echo Sau khi cài xong, vui lòng khởi động lại file này.
echo.
pause
exit /b 1

:err_no_npm
echo.
echo [LỖI] Không tìm thấy npm! Vui lòng kiểm tra lại môi trường Node.js.
echo.
pause
exit /b 1

:err_clone_failed
echo.
echo [LỖI] Quá trình git clone thất bại! Vui lòng kiểm tra lại kết nối mạng.
echo.
pause
exit /b 1

:err_build_failed
echo.
echo [LỖI] Quá trình build Extension thất bại!
echo.
pause
exit /b 1
