# 聊天机器人后端自动安装脚本
# 使用方法：在 backend 目录下右键 -> "使用 PowerShell 运行"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    智能聊天机器人后端 - 自动安装脚本" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "1. 检查 Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ 未找到 Node.js！请先安装 Node.js" -ForegroundColor Red
    Write-Host "   下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 检查 npm
try {
    $npmVersion = npm --version
    Write-Host "   ✓ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ npm 未正确安装" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 清理旧的依赖
Write-Host "2. 清理旧的依赖..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "   ✓ 已删除旧的 node_modules" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
    Write-Host "   ✓ 已删除旧的 package-lock.json" -ForegroundColor Green
}

Write-Host ""

# 清理 npm 缓存
Write-Host "3. 清理 npm 缓存..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "   ✓ 缓存已清理" -ForegroundColor Green

Write-Host ""

# 安装依赖
Write-Host "4. 安装依赖包（这可能需要几分钟）..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ 依赖安装成功！" -ForegroundColor Green
} else {
    Write-Host "   ✗ 依赖安装失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "请尝试手动安装：" -ForegroundColor Yellow
    Write-Host "   npm install express cors axios dotenv body-parser" -ForegroundColor White
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 创建 .env 文件
Write-Host "5. 配置环境变量..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   ✓ 已创建 .env 文件" -ForegroundColor Green
    } else {
        # 手动创建 .env 文件
        @"
PORT=3001
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "   ✓ 已创建 .env 文件" -ForegroundColor Green
    }
} else {
    Write-Host "   ✓ .env 文件已存在" -ForegroundColor Green
}

Write-Host ""

# 检查关键文件
Write-Host "6. 检查项目文件..." -ForegroundColor Yellow
$requiredFiles = @(
    "package.json",
    "src/server.js",
    "src/config/rules.json",
    "src/controllers/chatController.js",
    "src/services/ruleEngine.js",
    "src/services/aiService.js",
    "src/routes/chat.js"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file 缺失！" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "警告：部分文件缺失，项目可能无法正常运行" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    安装完成！" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "现在可以启动服务了：" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "或直接运行：" -ForegroundColor Yellow
Write-Host "   node src/server.js" -ForegroundColor White
Write-Host ""
Write-Host "提示：" -ForegroundColor Cyan
Write-Host "- 服务将运行在 http://localhost:3001" -ForegroundColor White
Write-Host "- 如需配置千问API，请编辑 .env 文件" -ForegroundColor White
Write-Host ""

# 询问是否立即启动
$start = Read-Host "是否立即启动服务？(Y/N)"
if ($start -eq "Y" -or $start -eq "y") {
    Write-Host ""
    Write-Host "正在启动服务..." -ForegroundColor Yellow
    npm start
} else {
    Write-Host ""
    Write-Host "稍后运行 'npm start' 来启动服务" -ForegroundColor Yellow
}

Read-Host "按回车键退出"
