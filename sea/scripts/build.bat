@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "BASE_DIR=%~dp0.."
set "PAYLOAD_PATH=%~1"
set "GCC_PREFIX=%~2"
set "ZSTD_PATH=%BASE_DIR%\lib\zstd\lib\libzstd.a"
set "BUILD_DIR=%BASE_DIR%\build"
set "ICON_OBJECT="
set "OUTPUT_PATH=%BUILD_DIR%\out"

if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"
if errorlevel 1 exit /b !errorlevel!

echo %GCC_PREFIX%| findstr /I "mingw32" >nul
if not errorlevel 1 set "OUTPUT_PATH=%BUILD_DIR%\out.exe"

echo Building ZSTD
call :prepare_zstd
if errorlevel 1 exit /b !errorlevel!

echo Preparing payload.o
echo %GCC_PREFIX%| findstr /I "mingw32" >nul
if not errorlevel 1 (
    call :prepare_payload_windows
    if errorlevel 1 exit /b !errorlevel!
    call :generate_icon_windows
    if errorlevel 1 exit /b !errorlevel!
) else (
    call :prepare_payload_linux
    if errorlevel 1 exit /b !errorlevel!
)

echo Building binary
call :build_binary
if errorlevel 1 exit /b !errorlevel!

echo Compilation complete
exit /b 0

:prepare_payload_windows
"%GCC_PREFIX%objcopy" -I binary -O pe-x86-64 -B i386:x86-64 ^
    --rename-section .data=.payload,contents,alloc,load,readonly,data ^
    "%PAYLOAD_PATH%" "%BUILD_DIR%\payload.o"
if errorlevel 1 exit /b !errorlevel!
exit /b 0

:prepare_payload_linux
"%GCC_PREFIX%objcopy" -I binary -O elf64-x86-64 -B i386:x86-64 ^
    --rename-section .data=.payload,contents,alloc,load,readonly,data ^
    "%PAYLOAD_PATH%" "%BUILD_DIR%\payload.o"
if errorlevel 1 exit /b !errorlevel!
exit /b 0

:prepare_zstd
if not exist "%BASE_DIR%\lib\zstd\." (
    mkdir "%BASE_DIR%\lib\zstd"
    if errorlevel 1 exit /b !errorlevel!
    git clone https://github.com/facebook/zstd.git "%BASE_DIR%\lib\zstd"
    if errorlevel 1 exit /b !errorlevel!
)
make -C "%BASE_DIR%\lib\zstd\lib" ZSTD_LIB_COMPRESSION=0 ZSTD_LIB_DECOMPRESSION=1 CC="%GCC_PREFIX%gcc" AR="%GCC_PREFIX%ar"
if errorlevel 1 exit /b !errorlevel!
exit /b 0

:build_binary
"%GCC_PREFIX%gcc" ^
    "%BASE_DIR%\src\data\data.c" ^
    "%BASE_DIR%\src\mkdir\mkdir.c" ^
    "%BASE_DIR%\src\main.c" ^
    "%ZSTD_PATH%" %ICON_OBJECT% "%BUILD_DIR%\payload.o" ^
    -T "%BASE_DIR%\src\linker.ld" ^
    -o "%OUTPUT_PATH%"
if errorlevel 1 exit /b !errorlevel!
exit /b 0

:generate_icon_windows
> "%BUILD_DIR%\icon.rc" echo 1 ICON "%BASE_DIR%\src\icon.ico"
"%GCC_PREFIX%windres" "%BUILD_DIR%\icon.rc" -O coff -o "%BUILD_DIR%\icon.o"
if errorlevel 1 exit /b !errorlevel!
set "ICON_OBJECT=%BUILD_DIR%\icon.o"
exit /b 0