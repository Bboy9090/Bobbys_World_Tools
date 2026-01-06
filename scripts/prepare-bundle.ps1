# Master script to prepare bundle (PowerShell version for Windows)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

Write-Host "🚀 Preparing Tauri bundle resources..." -ForegroundColor Cyan

# Bundle Node.js
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📦 Step 1: Bundling Node.js runtime" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
node "$ScriptDir\bundle-nodejs.js"
if ($LASTEXITCODE -ne 0) {
    throw "Node.js bundling failed"
}

# Bundle server
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📦 Step 2: Bundling server code" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
& "$ScriptDir\bundle-server.ps1"
if ($LASTEXITCODE -ne 0) {
    throw "Server bundling failed"
}

# Fix import paths
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🔧 Step 3: Fixing import paths" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
& "$ScriptDir\fix-bundle-imports.ps1"
if ($LASTEXITCODE -ne 0) {
    throw "Import path fixing failed"
}

Write-Host ""
Write-Host "Bundle preparation complete!" -ForegroundColor Green

