@echo off
cls

echo ================================================
echo   Chatbot Backend - Quick Install
echo ================================================
echo.

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo OK: Node.js installed
echo.

echo [2/5] Cleaning old dependencies...
if exist node_modules rmdir /s /q node_modules 2>nul
if exist package-lock.json del /f /q package-lock.json 2>nul
echo OK: Cleanup complete
echo.

echo [3/5] Installing dependencies (please wait)...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Installation failed!
    echo.
    echo Try manual install: npm install
    pause
    exit /b 1
)
echo OK: Dependencies installed
echo.

echo [4/5] Setting up environment...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
    ) else (
        echo PORT=3001> .env
        echo QWEN_API_KEY=your_qwen_api_key_here>> .env
        echo QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation>> .env
    )
    echo OK: Created .env file
) else (
    echo OK: .env file exists
)
echo.

echo [5/5] Verifying files...
if exist src\server.js (
    echo OK: src\server.js
) else (
    echo ERROR: src\server.js missing!
)
if exist src\config\rules.json (
    echo OK: src\config\rules.json
) else (
    echo ERROR: src\config\rules.json missing!
)
echo.

echo ================================================
echo   Installation Complete!
echo ================================================
echo.
echo To start the server:
echo    npm start
echo.
echo Or run directly:
echo    node src\server.js
echo.

set /p start="Start server now? (Y/N): "
if /i "%start%"=="Y" (
    echo.
    echo Starting server...
    npm start
) else (
    echo.
    echo Run 'npm start' later to start the server
)

pause
