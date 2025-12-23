# 一键更新前端组件脚本
# 应用所有新功能：调整大小、格式优化、图标优化

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   前端组件更新脚本 - v2.5" -ForegroundColor Cyan
Write-Host "   新功能：调整大小、格式优化、图标优化" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "E:\chatbot-1223\chatbot-system\frontend"

# 检查路径
if (-not (Test-Path $frontendPath)) {
    Write-Host "错误：找不到前端目录" -ForegroundColor Red
    Write-Host "请确认路径：$frontendPath" -ForegroundColor Yellow
    Read-Host "按Enter键退出"
    exit 1
}

Write-Host "[1/6] 检查环境..." -ForegroundColor Yellow
cd $frontendPath

# 检查Node.js
try {
    $nodeVersion = node --version
    Write-Host "   OK: Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   错误：Node.js未安装" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/6] 清除缓存..." -ForegroundColor Yellow

# 清除Vite缓存
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "   OK: Vite缓存已清除" -ForegroundColor Green
} else {
    Write-Host "   OK: 无缓存需要清除" -ForegroundColor Green
}

# 清除dist
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "   OK: dist目录已清除" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/6] 备份旧文件..." -ForegroundColor Yellow

$backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# 备份组件
$filesToBackup = @(
    "src/components/ChatBot.jsx",
    "src/components/ChatMessage.jsx",
    "src/styles/ChatBot.css"
)

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        $destDir = Join-Path $backupDir (Split-Path $file -Parent)
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        Copy-Item $file (Join-Path $backupDir $file)
    }
}

Write-Host "   OK: 备份已创建：$backupDir" -ForegroundColor Green

Write-Host ""
Write-Host "[4/6] 验证新文件..." -ForegroundColor Yellow

$componentPath = "src/components/ChatBot.jsx"
$content = Get-Content $componentPath -Raw

if ($content -match "handleResizeStart" -and $content -match "chat-resize-handle") {
    Write-Host "   OK: ChatBot.jsx 包含调整大小功能" -ForegroundColor Green
} else {
    Write-Host "   警告：ChatBot.jsx 可能未更新完整" -ForegroundColor Yellow
}

$messagePath = "src/components/ChatMessage.jsx"
$content = Get-Content $messagePath -Raw

if ($content -match "formatText" -and $content -match "message-heading") {
    Write-Host "   OK: ChatMessage.jsx 包含格式化功能" -ForegroundColor Green
} else {
    Write-Host "   警告：ChatMessage.jsx 可能未更新完整" -ForegroundColor Yellow
}

$cssPath = "src/styles/ChatBot.css"
$content = Get-Content $cssPath -Raw

if ($content -match "chat-resize-handle" -and $content -match "nwse-resize") {
    Write-Host "   OK: ChatBot.css 包含调整大小样式" -ForegroundColor Green
} else {
    Write-Host "   警告：ChatBot.css 可能未更新完整" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[5/6] 检查依赖..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "   安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK: 依赖已安装" -ForegroundColor Green
    } else {
        Write-Host "   错误：依赖安装失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   OK: 依赖已存在" -ForegroundColor Green
}

Write-Host ""
Write-Host "[6/6] 准备启动..." -ForegroundColor Yellow
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   更新完成！" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "新功能已就绪：" -ForegroundColor Yellow
Write-Host "  ✅ 调整大小：拖拽右下角调整窗口" -ForegroundColor White
Write-Host "  ✅ 格式优化：标题、列表、代码块" -ForegroundColor White
Write-Host "  ✅ 图标优化：SVG图标和动画" -ForegroundColor White
Write-Host ""

Write-Host "旧文件备份在：$backupDir" -ForegroundColor Cyan
Write-Host ""

Write-Host "下一步：" -ForegroundColor Yellow
Write-Host "  1. 启动开发服务器：npm run dev" -ForegroundColor White
Write-Host "  2. 打开浏览器：http://localhost:5173" -ForegroundColor White
Write-Host "  3. 清除浏览器缓存：Ctrl+Shift+R" -ForegroundColor White
Write-Host "  4. 测试新功能" -ForegroundColor White
Write-Host ""

Write-Host "测试清单：" -ForegroundColor Yellow
Write-Host "  □ 打开聊天窗口" -ForegroundColor White
Write-Host "  □ 鼠标移到右下角 → 看到对角箭头" -ForegroundColor White
Write-Host "  □ 拖拽右下角 → 窗口改变大小" -ForegroundColor White
Write-Host "  □ 发送消息 → 查看格式化效果" -ForegroundColor White
Write-Host "  □ 检查图标 → SVG图标显示正常" -ForegroundColor White
Write-Host ""

$startNow = Read-Host "现在启动开发服务器？(Y/N)"

if ($startNow -eq "Y" -or $startNow -eq "y") {
    Write-Host ""
    Write-Host "启动开发服务器..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "提示：" -ForegroundColor Cyan
    Write-Host "  - 服务器启动后，打开浏览器访问 http://localhost:5173" -ForegroundColor White
    Write-Host "  - 记得清除浏览器缓存（Ctrl+Shift+R）" -ForegroundColor White
    Write-Host "  - 按 Ctrl+C 停止服务器" -ForegroundColor White
    Write-Host ""
    
    npm run dev
} else {
    Write-Host ""
    Write-Host "稍后运行：npm run dev" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "按Enter键退出"
