# Chatbot Backend Quick Install Script
# Run in PowerShell

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Chatbot Backend - Quick Install" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   OK: Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "   Download: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "   OK: npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: npm not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Clean old dependencies
Write-Host "[2/5] Cleaning old dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "   OK: Removed old node_modules" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "   OK: Removed old package-lock.json" -ForegroundColor Green
}

Write-Host ""

# Clear npm cache
Write-Host "[3/5] Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "   OK: Cache cleared" -ForegroundColor Green

Write-Host ""

# Install dependencies
Write-Host "[4/5] Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Installation failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try manual install:" -ForegroundColor Yellow
    Write-Host "   npm install express cors axios dotenv body-parser" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Setup .env file
Write-Host "[5/5] Setting up environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   OK: Created .env file from template" -ForegroundColor Green
    } else {
        @"
PORT=3001
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "   OK: Created .env file" -ForegroundColor Green
    }
} else {
    Write-Host "   OK: .env file already exists" -ForegroundColor Green
}

Write-Host ""

# Verify files
Write-Host "Verifying files..." -ForegroundColor Yellow
$files = @(
    "package.json",
    "src/server.js",
    "src/config/rules.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   OK: $file" -ForegroundColor Green
    } else {
        Write-Host "   ERROR: $file missing!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Installation Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the server:" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "Or run directly:" -ForegroundColor Yellow
Write-Host "   node src/server.js" -ForegroundColor White
Write-Host ""

# Ask to start
$start = Read-Host "Start server now? (Y/N)"
if ($start -eq "Y" -or $start -eq "y") {
    Write-Host ""
    Write-Host "Starting server..." -ForegroundColor Yellow
    npm start
} else {
    Write-Host ""
    Write-Host "Run 'npm start' later to start the server" -ForegroundColor Yellow
}

Read-Host "Press Enter to exit"
