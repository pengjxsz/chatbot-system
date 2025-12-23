@echo off
chcp 65001 >nul
color 0A
cls

echo ================================================
echo     智能聊天机器人后端 - 快速安装
echo ================================================
echo.

echo [1/5] 检查 Node.js...
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

echo [2/5] 清理旧依赖...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
echo ✓ 清理完成
echo.

echo [3/5] 安装依赖包（请稍候）...
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

echo [4/5] 配置环境变量...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
    ) else (
        (
            echo PORT=3001
            echo QWEN_API_KEY=your_qwen_api_key_here
            echo QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
        ) > .env
    )
    echo ✓ 已创建 .env 文件
) else (
    echo ✓ .env 文件已存在
)
echo.

echo [5/5] 检查文件完整性...
if exist src\server.js (
    echo ✓ src\server.js
) else (
    echo ✗ src\server.js 缺失！
)
if exist src\config\rules.json (
    echo ✓ src\config\rules.json
) else (
    echo ✗ src\config\rules.json 缺失！
)
echo.

echo ================================================
echo     安装完成！
echo ================================================
echo.
echo 启动服务:
echo    npm start
echo.
echo 或直接运行:
echo    node src\server.js
echo.

set /p start="是否立即启动服务？(Y/N): "
if /i "%start%"=="Y" (
    echo.
    echo 正在启动服务...
    npm start
) else (
    echo.
    echo 稍后运行 'npm start' 启动服务
)

pause
