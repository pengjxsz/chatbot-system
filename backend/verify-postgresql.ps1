# PostgreSQL Path Verification Script
# Verifies PostgreSQL installation at D:\Postgresql\15\bin

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   PostgreSQL Installation Verification" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Expected PostgreSQL path
$postgresPath = "D:\Postgresql\15\bin"
$psqlExe = Join-Path $postgresPath "psql.exe"
$pgDumpExe = Join-Path $postgresPath "pg_dump.exe"

Write-Host "[1/5] Checking PostgreSQL installation path..." -ForegroundColor Yellow
Write-Host "   Expected path: $postgresPath" -ForegroundColor White

if (Test-Path $postgresPath) {
    Write-Host "   OK: PostgreSQL directory found" -ForegroundColor Green
} else {
    Write-Host "   ERROR: PostgreSQL directory not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please check:" -ForegroundColor Yellow
    Write-Host "   - PostgreSQL is installed at: D:\Postgresql\15" -ForegroundColor White
    Write-Host "   - Or update POSTGRESQL_PATH in .env file" -ForegroundColor White
    Read-Host "Press Enter to continue anyway"
}

Write-Host ""

# Check psql.exe
Write-Host "[2/5] Checking psql.exe..." -ForegroundColor Yellow
if (Test-Path $psqlExe) {
    Write-Host "   OK: psql.exe found" -ForegroundColor Green
    
    # Get version
    try {
        $version = & $psqlExe --version
        Write-Host "   Version: $version" -ForegroundColor Green
    } catch {
        Write-Host "   WARNING: Cannot get version" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERROR: psql.exe not found" -ForegroundColor Red
}

Write-Host ""

# Check if PostgreSQL is in PATH
Write-Host "[3/5] Checking system PATH..." -ForegroundColor Yellow
$pathEnv = $env:Path -split ';'
$pgInPath = $pathEnv | Where-Object { $_ -like "*PostgreSQL*" }

if ($pgInPath) {
    Write-Host "   OK: PostgreSQL found in system PATH" -ForegroundColor Green
    $pgInPath | ForEach-Object {
        Write-Host "   - $_" -ForegroundColor White
    }
} else {
    Write-Host "   WARNING: PostgreSQL not in system PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   To add to PATH:" -ForegroundColor Yellow
    Write-Host "   1. Open System Properties > Environment Variables" -ForegroundColor White
    Write-Host "   2. Edit PATH variable" -ForegroundColor White
    Write-Host "   3. Add: $postgresPath" -ForegroundColor White
}

Write-Host ""

# Check PostgreSQL service
Write-Host "[4/5] Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($pgService) {
    $pgService | ForEach-Object {
        $status = $_.Status
        $name = $_.Name
        
        if ($status -eq "Running") {
            Write-Host "   OK: $name is running" -ForegroundColor Green
        } else {
            Write-Host "   WARNING: $name is $status" -ForegroundColor Yellow
            Write-Host "   Starting service..." -ForegroundColor Yellow
            try {
                Start-Service $name
                Write-Host "   OK: Service started" -ForegroundColor Green
            } catch {
                Write-Host "   ERROR: Cannot start service" -ForegroundColor Red
                Write-Host "   Please start manually from Services" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "   WARNING: No PostgreSQL service found" -ForegroundColor Yellow
}

Write-Host ""

# Test database connection
Write-Host "[5/5] Testing database connection..." -ForegroundColor Yellow

$env:PGPASSWORD = "20250820"
$testCommand = "SELECT version();"

try {
    if (Test-Path $psqlExe) {
        $result = & $psqlExe -U postgres -d admission_db -c $testCommand 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   OK: Database connection successful" -ForegroundColor Green
            Write-Host "   Database: admission_db" -ForegroundColor Green
        } else {
            Write-Host "   ERROR: Connection failed" -ForegroundColor Red
            Write-Host "   Error: $result" -ForegroundColor Red
        }
    } else {
        # Try psql from PATH
        $result = psql -U postgres -d admission_db -c $testCommand 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   OK: Database connection successful (using PATH)" -ForegroundColor Green
        } else {
            Write-Host "   ERROR: Connection failed" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ERROR: Cannot connect to database" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please check:" -ForegroundColor Yellow
    Write-Host "   - PostgreSQL service is running" -ForegroundColor White
    Write-Host "   - Database 'admission_db' exists" -ForegroundColor White
    Write-Host "   - Password is correct (20250820)" -ForegroundColor White
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Verification Complete" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if table exists
Write-Host "Bonus: Checking if rulelibtable exists..." -ForegroundColor Yellow

try {
    $tableCheck = "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rulelibtable');"
    
    if (Test-Path $psqlExe) {
        $result = & $psqlExe -U postgres -d admission_db -t -c $tableCheck 2>&1
    } else {
        $result = psql -U postgres -d admission_db -t -c $tableCheck 2>&1
    }
    
    if ($result -match "t") {
        Write-Host "   OK: rulelibtable exists" -ForegroundColor Green
        
        # Count rules
        $countQuery = "SELECT COUNT(*) FROM rulelibtable;"
        if (Test-Path $psqlExe) {
            $count = & $psqlExe -U postgres -d admission_db -t -c $countQuery 2>&1
        } else {
            $count = psql -U postgres -d admission_db -t -c $countQuery 2>&1
        }
        
        Write-Host "   Rules in database: $($count.Trim())" -ForegroundColor Green
    } else {
        Write-Host "   WARNING: rulelibtable does not exist" -ForegroundColor Yellow
        Write-Host "   Run: npm run setup-db" -ForegroundColor White
    }
} catch {
    Write-Host "   Cannot check table" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Installation Path: $postgresPath" -ForegroundColor White
Write-Host "  Database: admission_db" -ForegroundColor White
Write-Host "  User: postgres" -ForegroundColor White
Write-Host "  Password: ******" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. If table doesn't exist: npm run setup-db" -ForegroundColor White
Write-Host "  2. Test connection: npm run test-db" -ForegroundColor White
Write-Host "  3. Start server: npm start" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
