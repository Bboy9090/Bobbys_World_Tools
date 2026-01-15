# Git Rebase Script for Bobby's Workshop
# This script fetches and rebases the local repository with the remote

Write-Host "=== Bobby's Workshop - Git Rebase Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
$gitPath = $null
$possiblePaths = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
    "$env:USERPROFILE\AppData\Local\Programs\Git\cmd\git.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $gitPath = $path
        break
    }
}

if (-not $gitPath) {
    # Try to find git in PATH
    $gitInPath = Get-Command git -ErrorAction SilentlyContinue
    if ($gitInPath) {
        $gitPath = $gitInPath.Source
    }
}

if (-not $gitPath) {
    Write-Host "ERROR: Git not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure Git is installed and available in your PATH." -ForegroundColor Yellow
    Write-Host "Or install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If Git is installed but not in PATH, you can:" -ForegroundColor Yellow
    Write-Host "1. Add Git to your PATH environment variable" -ForegroundColor Yellow
    Write-Host "2. Use Git Bash instead of PowerShell" -ForegroundColor Yellow
    Write-Host "3. Use GitHub Desktop GUI" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found Git at: $gitPath" -ForegroundColor Green
Write-Host ""

# Define git command as function
function Invoke-Git {
    param([string[]]$Arguments)
    & $gitPath $Arguments
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Git command failed with exit code $LASTEXITCODE" -ForegroundColor Red
        return $false
    }
    return $true
}

# Check current branch
Write-Host "Checking current branch..." -ForegroundColor Cyan
$currentBranch = (Invoke-Git @("branch", "--show-current")) | Out-String | ForEach-Object { $_.Trim() }
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow
Write-Host ""

# Check for uncommitted changes
Write-Host "Checking for uncommitted changes..." -ForegroundColor Cyan
$status = Invoke-Git @("status", "--porcelain")
if ($status) {
    Write-Host "WARNING: You have uncommitted changes!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You have the following options:" -ForegroundColor Yellow
    Write-Host "1. Commit your changes first" -ForegroundColor Yellow
    Write-Host "2. Stash your changes: git stash" -ForegroundColor Yellow
    Write-Host "3. Discard changes (DANGEROUS): git reset --hard" -ForegroundColor Red
    Write-Host ""
    $response = Read-Host "Do you want to stash changes and continue? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Stashing changes..." -ForegroundColor Cyan
        if (-not (Invoke-Git @("stash", "push", "-m", "Stashed before rebase - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"))) {
            Write-Host "Failed to stash changes. Aborting." -ForegroundColor Red
            exit 1
        }
        Write-Host "Changes stashed successfully." -ForegroundColor Green
    } else {
        Write-Host "Aborting rebase. Please handle uncommitted changes first." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "No uncommitted changes. Proceeding..." -ForegroundColor Green
}
Write-Host ""

# Fetch latest from remote
Write-Host "Fetching latest changes from remote..." -ForegroundColor Cyan
if (-not (Invoke-Git @("fetch", "origin", "--prune"))) {
    Write-Host "Failed to fetch from remote. Aborting." -ForegroundColor Red
    exit 1
}
Write-Host "Fetch completed successfully." -ForegroundColor Green
Write-Host ""

# Show remote branches
Write-Host "Remote branches:" -ForegroundColor Cyan
Invoke-Git @("branch", "-r") | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
Write-Host ""

# Determine target branch (main-tool-kit based on config)
$targetBranch = "main-tool-kit"
if ($currentBranch -eq "main") {
    $targetBranch = "main"
}

Write-Host "Target branch for rebase: $targetBranch" -ForegroundColor Yellow
Write-Host ""

# Check if remote branch exists
$remoteBranch = "origin/$targetBranch"
$branchExists = Invoke-Git @("ls-remote", "--heads", "origin", $targetBranch)
if (-not $branchExists) {
    Write-Host "WARNING: Remote branch '$targetBranch' not found!" -ForegroundColor Yellow
    Write-Host "Available remote branches:" -ForegroundColor Yellow
    Invoke-Git @("branch", "-r")
    Write-Host ""
    $response = Read-Host "Continue with rebase? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

# Rebase with remote
Write-Host "Rebasing $currentBranch with $remoteBranch..." -ForegroundColor Cyan
Write-Host ""
if (-not (Invoke-Git @("rebase", $remoteBranch))) {
    Write-Host ""
    Write-Host "Rebase encountered conflicts or errors." -ForegroundColor Red
    Write-Host ""
    Write-Host "To resolve:" -ForegroundColor Yellow
    Write-Host "1. Review conflicts: git status" -ForegroundColor Yellow
    Write-Host "2. Resolve conflicts in the files" -ForegroundColor Yellow
    Write-Host "3. Stage resolved files: git add <file>" -ForegroundColor Yellow
    Write-Host "4. Continue rebase: git rebase --continue" -ForegroundColor Yellow
    Write-Host "5. Or abort rebase: git rebase --abort" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Rebase completed successfully!" -ForegroundColor Green
Write-Host ""

# Show current status
Write-Host "Current status:" -ForegroundColor Cyan
Invoke-Git @("status")

Write-Host ""
Write-Host "=== Rebase Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "- Review changes: git log --oneline -10" -ForegroundColor Yellow
Write-Host "- Test your application" -ForegroundColor Yellow
if ($status) {
    Write-Host "- Restore stashed changes: git stash pop" -ForegroundColor Yellow
}
Write-Host ""
