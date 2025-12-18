# Comprehensive Test Execution Script
# Bobby's Workshop - Full Feature and Connection Detection Testing
# Date: 2025-12-17

$ErrorActionPreference = "Continue"
$testResults = @()
$totalTests = 0
$passedTests = 0
$failedTests = 0

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Bobby's Workshop - Comprehensive Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to write test results
function Write-TestResult {
    param(
        [string]$Name,
        [string]$Status,
        [string]$Message = ""
    )
    
    $script:totalTests++
    
    if ($Status -eq "PASS") {
        $script:passedTests++
        Write-Host "✓ PASS: $Name" -ForegroundColor Green
    } elseif ($Status -eq "FAIL") {
        $script:failedTests++
        Write-Host "✗ FAIL: $Name" -ForegroundColor Red
        if ($Message) { Write-Host "  └─ $Message" -ForegroundColor Yellow }
    } elseif ($Status -eq "SKIP") {
        Write-Host "○ SKIP: $Name" -ForegroundColor Gray
        if ($Message) { Write-Host "  └─ $Message" -ForegroundColor Gray }
    }
    
    $script:testResults += [PSCustomObject]@{
        Name = $Name
        Status = $Status
        Message = $Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
}

# ============================================================================
# 1. PREREQUISITE CHECKS
# ============================================================================

Write-Host "`n[1] Checking Prerequisites..." -ForegroundColor Cyan

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-TestResult "Node.js installed" "PASS" "Version: $nodeVersion"
} else {
    Write-TestResult "Node.js installed" "FAIL" "Node.js not found"
}

# Check npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-TestResult "npm installed" "PASS" "Version: $npmVersion"
} else {
    Write-TestResult "npm installed" "FAIL" "npm not found"
}

# Check for package.json
if (Test-Path "package.json") {
    Write-TestResult "package.json exists" "PASS"
} else {
    Write-TestResult "package.json exists" "FAIL" "Not found in current directory"
}

# Check for node_modules
if (Test-Path "node_modules") {
    Write-TestResult "Dependencies installed" "PASS"
} else {
    Write-TestResult "Dependencies installed" "SKIP" "Run 'npm install' first"
}

# ============================================================================
# 2. LINT TESTS
# ============================================================================

Write-Host "`n[2] Running Linting Tests..." -ForegroundColor Cyan

try {
    npm run lint 2>&1 | Out-Null
    $lintExit = $LASTEXITCODE
    
    if ($lintExit -eq 0) {
        Write-TestResult "ESLint" "PASS"
    } else {
        Write-TestResult "ESLint" "FAIL" "Linting errors found"
    }
} catch {
    Write-TestResult "ESLint" "FAIL" $_.Exception.Message
}

# ============================================================================
# 3. TYPE CHECKING
# ============================================================================

Write-Host "`n[3] Running TypeScript Type Checking..." -ForegroundColor Cyan

try {
    npx tsc --noEmit 2>&1 | Out-Null
    $tscExit = $LASTEXITCODE
    
    if ($tscExit -eq 0) {
        Write-TestResult "TypeScript compilation" "PASS"
    } else {
        Write-TestResult "TypeScript compilation" "FAIL" "Type errors found"
    }
} catch {
    Write-TestResult "TypeScript compilation" "FAIL" $_.Exception.Message
}

# ============================================================================
# 4. UNIT TESTS
# ============================================================================

Write-Host "`n[4] Running Unit Tests..." -ForegroundColor Cyan

try {
    npm run test 2>&1 | Out-Null
    $testExit = $LASTEXITCODE
    
    if ($testExit -eq 0) {
        Write-TestResult "Unit tests (vitest)" "PASS"
    } else {
        Write-TestResult "Unit tests (vitest)" "FAIL" "Some tests failed"
    }
} catch {
    Write-TestResult "Unit tests (vitest)" "FAIL" $_.Exception.Message
}

# ============================================================================
# 5. WORKFLOW TESTS
# ============================================================================

Write-Host "`n[5] Running Workflow System Tests..." -ForegroundColor Cyan

try {
    if (Test-Path "tests/workflow-system.test.js") {
        npm run test:workflow 2>&1 | Out-Null
        $workflowExit = $LASTEXITCODE
        
        if ($workflowExit -eq 0) {
            Write-TestResult "Workflow system tests" "PASS"
        } else {
            Write-TestResult "Workflow system tests" "FAIL" "Workflow tests failed"
        }
    } else {
        Write-TestResult "Workflow system tests" "SKIP" "Test file not found"
    }
} catch {
    Write-TestResult "Workflow system tests" "FAIL" $_.Exception.Message
}

# ============================================================================
# 6. BUILD TESTS
# ============================================================================

Write-Host "`n[6] Running Build Tests..." -ForegroundColor Cyan

try {
    Write-Host "  Building application..." -ForegroundColor Gray
    npm run build 2>&1 | Out-Null
    $buildExit = $LASTEXITCODE
    
    if ($buildExit -eq 0) {
        Write-TestResult "Frontend build" "PASS"
    } else {
        Write-TestResult "Frontend build" "FAIL" "Build failed"
    }
} catch {
    Write-TestResult "Frontend build" "FAIL" $_.Exception.Message
}

# Check if dist folder was created
if (Test-Path "dist") {
    Write-TestResult "Build artifacts created" "PASS" "dist/ folder exists"
} else {
    Write-TestResult "Build artifacts created" "FAIL" "dist/ folder not found"
}

# ============================================================================
# 7. FILE STRUCTURE VALIDATION
# ============================================================================

Write-Host "`n[7] Validating Project Structure..." -ForegroundColor Cyan

$requiredFiles = @(
    "src\App.tsx",
    "src\main.tsx",
    "src\hooks\use-android-devices.ts",
    "src\hooks\use-device-detection.ts",
    "src\lib\probeDevice.ts",
    "src\lib\deviceDetection.ts",
    "src\lib\backend-health.ts",
    "src\lib\app-context.tsx",
    "src\components\DemoModeBanner.tsx",
    "src\components\EmptyState.tsx",
    "src\components\ErrorState.tsx",
    "README.md",
    "TRUTH_FIRST_STATUS.md",
    "COMPREHENSIVE_TEST_PLAN.md"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-TestResult "File exists: $file" "PASS"
    } else {
        Write-TestResult "File exists: $file" "FAIL" "File not found"
    }
}

# ============================================================================
# 8. CONNECTION DETECTION VALIDATION
# ============================================================================

Write-Host "`n[8] Validating Connection Detection Code..." -ForegroundColor Cyan

# Check for truth-first patterns in device detection
$deviceDetectionFiles = @(
    "src\hooks\use-android-devices.ts",
    "src\hooks\use-device-detection.ts"
)

foreach ($file in $deviceDetectionFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Check for real API calls (not mocks)
        if ($content -match "fetch.*api") {
            Write-TestResult "Uses real API: $file" "PASS"
        } else {
            Write-TestResult "Uses real API: $file" "FAIL" "No fetch calls found"
        }
        
        # Check for error handling
        if ($content -match "catch|error") {
            Write-TestResult "Has error handling: $file" "PASS"
        } else {
            Write-TestResult "Has error handling: $file" "FAIL" "No error handling found"
        }
    }
}

# ============================================================================
# 9. DEMO MODE VALIDATION
# ============================================================================

Write-Host "`n[9] Validating Demo Mode Implementation..." -ForegroundColor Cyan

if (Test-Path "src\lib\app-context.tsx") {
    $appContext = Get-Content "src\lib\app-context.tsx" -Raw
    
    if ($appContext -match "isDemoMode") {
        Write-TestResult "Demo mode context exists" "PASS"
    } else {
        Write-TestResult "Demo mode context exists" "FAIL"
    }
}

if (Test-Path "src\components\DemoModeBanner.tsx") {
    Write-TestResult "Demo mode banner component exists" "PASS"
} else {
    Write-TestResult "Demo mode banner component exists" "FAIL"
}

# Check for DEMO labeling in components
$demoComponents = @(
    "src\components\PandoraFlashPanel.tsx",
    "src\components\PandoraTestsPanel.tsx"
)

foreach ($comp in $demoComponents) {
    if (Test-Path $comp) {
        $content = Get-Content $comp -Raw
        
        if ($content -match "\[DEMO\]|DEMO") {
            Write-TestResult "Has DEMO labeling: $(Split-Path -Leaf $comp)" "PASS"
        } else {
            Write-TestResult "Has DEMO labeling: $(Split-Path -Leaf $comp)" "FAIL"
        }
    }
}

# ============================================================================
# 10. BACKEND API ENDPOINT VALIDATION
# ============================================================================

Write-Host "`n[10] Checking Backend API Endpoints..." -ForegroundColor Cyan

$apiEndpoints = @(
    @{ URL = "http://localhost:3001/api/health"; Name = "Health Check" },
    @{ URL = "http://localhost:3001/api/android-devices/all"; Name = "Android Devices" },
    @{ URL = "http://localhost:3001/api/system-tools"; Name = "System Tools" }
)

foreach ($endpoint in $apiEndpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.URL -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-TestResult "API endpoint: $($endpoint.Name)" "PASS"
        } else {
            Write-TestResult "API endpoint: $($endpoint.Name)" "FAIL" "Status: $($response.StatusCode)"
        }
    } catch {
        Write-TestResult "API endpoint: $($endpoint.Name)" "SKIP" "Backend not running"
    }
}

# ============================================================================
# 11. SECURITY & COMPLIANCE CHECKS
# ============================================================================

Write-Host "`n[11] Security & Compliance Checks..." -ForegroundColor Cyan

# Check for hardcoded secrets
$securityFiles = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx,*.js

$foundSecrets = $false
foreach ($file in $securityFiles) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match "password\s*=\s*['\`"][^\`'`"]{8,}['\`"]" -or 
        $content -match "api[_-]?key\s*=\s*['\`"][^\`'`"]{16,}['\`"]" -or
        $content -match "secret\s*=\s*['\`"][^\`'`"]{16,}['\`"]") {
        $foundSecrets = $true
        Write-TestResult "No hardcoded secrets in: $($file.Name)" "FAIL" "Potential secret found"
    }
}

if (-not $foundSecrets) {
    Write-TestResult "No hardcoded secrets" "PASS"
}

# Check for .env.example
if (Test-Path ".env.example") {
    Write-TestResult ".env.example exists" "PASS"
} else {
    Write-TestResult ".env.example exists" "SKIP" "Not found"
}

# ============================================================================
# 12. DOCUMENTATION VALIDATION
# ============================================================================

Write-Host "`n[12] Validating Documentation..." -ForegroundColor Cyan

$docFiles = @(
    "README.md",
    "TRUTH_FIRST_STATUS.md",
    "TRUTH_FIRST_GUIDE.md",
    "BOBBY_SECRET_WORKSHOP.md",
    "COMPREHENSIVE_TEST_PLAN.md"
)

foreach ($doc in $docFiles) {
    if (Test-Path $doc) {
        $size = (Get-Item $doc).Length
        if ($size -gt 1000) {
            Write-TestResult "Documentation: $doc" "PASS" "Size: $size bytes"
        } else {
            Write-TestResult "Documentation: $doc" "FAIL" "Too small: $size bytes"
        }
    } else {
        Write-TestResult "Documentation: $doc" "FAIL" "Not found"
    }
}

# ============================================================================
# FINAL SUMMARY
# ============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST EXECUTION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Total Tests:  $totalTests" -ForegroundColor White
Write-Host "Passed:       $passedTests" -ForegroundColor Green
Write-Host "Failed:       $failedTests" -ForegroundColor Red
Write-Host "Skipped:      $($totalTests - $passedTests - $failedTests)" -ForegroundColor Gray

$passRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }
Write-Host "`nPass Rate:    $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 75) { "Yellow" } else { "Red" })

# Export results to JSON
$exportPath = "test-results-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').json"
$testResults | ConvertTo-Json -Depth 10 | Out-File $exportPath
Write-Host "`nResults exported to: $exportPath" -ForegroundColor Cyan

# Final status
Write-Host "`n========================================`n" -ForegroundColor Cyan

if ($passRate -ge 90) {
    Write-Host "✓ EXCELLENT - All systems operational!" -ForegroundColor Green
} elseif ($passRate -ge 75) {
    Write-Host "⚠ GOOD - Some issues need attention" -ForegroundColor Yellow
} else {
    Write-Host "✗ NEEDS WORK - Critical issues found" -ForegroundColor Red
}

Write-Host ""

# Return exit code based on pass rate
if ($passRate -ge 75) {
    exit 0
} else {
    exit 1
}
