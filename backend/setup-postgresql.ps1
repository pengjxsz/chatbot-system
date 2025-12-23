# PostgreSQL Database Setup Script
# One-click setup for chatbot rule database

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Chatbot PostgreSQL Database Setup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check PostgreSQL
Write-Host "[1/6] Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "   OK: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: PostgreSQL not found!" -ForegroundColor Red
    Write-Host "   Please install PostgreSQL from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if database exists
Write-Host "[2/6] Checking database..." -ForegroundColor Yellow
$dbCheck = psql -U postgres -lqt | Select-String -Pattern "admission_db"

if (-not $dbCheck) {
    Write-Host "   Database 'admission_db' not found, creating..." -ForegroundColor Yellow
    try {
        psql -U postgres -c "CREATE DATABASE admission_db;"
        Write-Host "   OK: Database created" -ForegroundColor Green
    } catch {
        Write-Host "   ERROR: Failed to create database" -ForegroundColor Red
        Write-Host "   Please create manually: CREATE DATABASE admission_db;" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "   OK: Database exists" -ForegroundColor Green
}

Write-Host ""

# Check Node.js
Write-Host "[3/6] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   OK: Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Node.js not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install npm dependencies
Write-Host "[4/6] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Setup database and import data
Write-Host "[5/6] Setting up database tables and importing data..." -ForegroundColor Yellow
npm run setup-db
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Database setup complete" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Database setup failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - PostgreSQL service not running" -ForegroundColor White
    Write-Host "  - Wrong password in .env file" -ForegroundColor White
    Write-Host "  - Database connection refused" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Test connection
Write-Host "[6/6] Testing database connection..." -ForegroundColor Yellow
npm run test-db
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Connection test passed" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Connection test failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  - Database: admission_db" -ForegroundColor White
Write-Host "  - Table: rulelibtable" -ForegroundColor White
Write-Host "  - Rules imported: 6" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start backend:  npm start" -ForegroundColor White
Write-Host "  2. Start frontend: cd ../frontend && npm run dev" -ForegroundColor White
Write-Host "  3. Open browser:   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "  - Test DB:         npm run test-db" -ForegroundColor White
Write-Host "  - Re-import data:  npm run setup-db" -ForegroundColor White
Write-Host "  - View logs:       Check console output" -ForegroundColor White
Write-Host ""

$start = Read-Host "Start backend server now? (Y/N)"
if ($start -eq "Y" -or $start -eq "y") {
    Write-Host ""
    Write-Host "Starting server..." -ForegroundColor Yellow
    npm start
} else {
    Write-Host ""
    Write-Host "Run 'npm start' when ready to start the server" -ForegroundColor Yellow
}

Read-Host "Press Enter to exit"
