@echo off
chcp 65001 >nul
color 0B
cls

echo ================================================
echo     智能聊天机器人 - 一键安装全部
echo ================================================
echo.
echo 此脚本将自动安装前端和后端的所有依赖
echo.
pause

REM 获取当前目录
set ROOT_DIR=%cd%

echo.
echo ================================================
echo     第一部分：安装后端
echo ================================================
echo.

cd /d "%ROOT_DIR%\backend"
if %errorlevel% neq 0 (
    echo ✗ backend 目录不存在！
    echo 请确保在项目根目录运行此脚本
    pause
    exit /b 1
)

echo [后端 1/4] 清理旧依赖...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
echo ✓ 完成
echo.

echo [后端 2/4] 安装依赖包（这可能需要几分钟）...
call npm install
if %errorlevel% neq 0 (
    echo ✗ 后端依赖安装失败！
    pause
    exit /b 1
)
echo ✓ 完成
echo.

echo [后端 3/4] 配置环境变量...
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

echo [后端 4/4] 验证安装...
if exist node_modules\express (
    echo ✓ Express 已安装
) else (
    echo ✗ Express 安装失败
)
echo.

echo ================================================
echo     第二部分：安装前端
echo ================================================
echo.

cd /d "%ROOT_DIR%\frontend"
if %errorlevel% neq 0 (
    echo ✗ frontend 目录不存在！
    pause
    exit /b 1
)

echo [前端 1/3] 清理旧依赖...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
echo ✓ 完成
echo.

echo [前端 2/3] 安装依赖包（这可能需要几分钟）...
call npm install
if %errorlevel% neq 0 (
    echo ✗ 前端依赖安装失败！
    pause
    exit /b 1
)
echo ✓ 完成
echo.

echo [前端 3/3] 验证安装...
if exist node_modules\react (
    echo ✓ React 已安装
) else (
    echo ✗ React 安装失败
)
if exist node_modules\vite (
    echo ✓ Vite 已安装
) else (
    echo ✗ Vite 安装失败
)
echo.

cd /d "%ROOT_DIR%"

echo ================================================
echo     安装完成！
echo ================================================
echo.
echo ✓ 后端依赖安装完成
echo ✓ 前端依赖安装完成
echo.
echo 下一步：启动服务
echo.
echo 方式一：手动启动（推荐用于开发）
echo -----------------------------------------
echo 1. 打开终端 1 - 启动后端:
echo    cd backend
echo    npm start
echo.
echo 2. 打开终端 2 - 启动前端:
echo    cd frontend
echo    npm run dev
echo.
echo 3. 访问: http://localhost:5173
echo.
echo 方式二：使用启动脚本
echo -----------------------------------------
echo 运行: start-all.bat
echo.
echo ================================================
echo.

set /p choice="是否创建桌面快捷启动脚本？(Y/N): "
if /i "%choice%"=="Y" (
    echo.
    echo 正在创建启动脚本...
    
    REM 创建启动后端脚本
    (
        echo @echo off
        echo cd /d "%ROOT_DIR%\backend"
        echo start "后端服务" cmd /k "npm start"
        echo timeout /t 3 /nobreak ^>nul
        echo cd /d "%ROOT_DIR%\frontend"
        echo start "前端服务" cmd /k "npm run dev"
        echo echo.
        echo echo 服务已启动！
        echo echo 后端: http://localhost:3001
        echo echo 前端: http://localhost:5173
        echo echo.
        echo timeout /t 5
        echo exit
    ) > "%ROOT_DIR%\start-all.bat"
    
    echo ✓ 已创建 start-all.bat
    echo.
    echo 双击 start-all.bat 即可启动所有服务
)

echo.
pause
