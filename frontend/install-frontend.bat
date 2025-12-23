@echo off
chcp 65001 >nul
color 0A
cls

echo ================================================
echo     智能聊天机器人前端 - 快速安装
echo ================================================
echo.

echo [1/4] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 未找到 Node.js！
    echo.
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo ✓ Node.js 已安装
echo.

echo [2/4] 清理旧依赖...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
echo ✓ 清理完成
echo.

echo [3/4] 安装依赖包（请稍候）...
call npm install
if %errorlevel% neq 0 (
    echo ✗ 安装失败！
    echo.
    echo 请手动运行: npm install
    pause
    exit /b 1
)
echo ✓ 依赖安装完成
echo.

echo [4/4] 验证安装...
if exist node_modules\react (
    echo ✓ React 已安装
) else (
    echo ✗ React 安装失败！
)
if exist node_modules\vite (
    echo ✓ Vite 已安装
) else (
    echo ✗ Vite 安装失败！
)
echo.

echo ================================================
echo     安装完成！
echo ================================================
echo.
echo 启动开发服务器:
echo    npm run dev
echo.
echo 构建生产版本:
echo    npm run build
echo.

set /p start="是否立即启动开发服务器？(Y/N): "
if /i "%start%"=="Y" (
    echo.
    echo 正在启动开发服务器...
    echo 服务将运行在: http://localhost:5173
    echo.
    npm run dev
) else (
    echo.
    echo 稍后运行 'npm run dev' 启动开发服务器
)

pause
