# Setup Bun PATH and verify environment
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "OpenCode Environment Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Add Bun to PATH permanently
Write-Host "[1/4] Configuring Bun PATH..." -ForegroundColor Yellow
$BUN_PATH = "$env:USERPROFILE\.bun\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$BUN_PATH*") {
    $newPath = if ($currentPath) { "$currentPath;$BUN_PATH" } else { $BUN_PATH }
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "  [OK] Bun added to PATH permanently" -ForegroundColor Green
} else {
    Write-Host "  [OK] Bun already in PATH" -ForegroundColor Green
}

# Add to current session
$env:PATH += ";$BUN_PATH"

# Step 2: Verify Bun
Write-Host "[2/4] Verifying Bun installation..." -ForegroundColor Yellow
try {
    $bunVersion = & "$BUN_PATH\bun.exe" --version
    Write-Host "  [OK] Bun version: $bunVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Bun not found!" -ForegroundColor Red
    exit 1
}

# Step 3: Check project
Write-Host "[3/4] Checking project..." -ForegroundColor Yellow
$projectRoot = "C:\Users\hzm\Documents\GitHub\opencode_hzm"
if (-not (Test-Path "$projectRoot\package.json")) {
    Write-Host "  [ERROR] Project not found at $projectRoot" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Project found" -ForegroundColor Green

# Step 4: Install dependencies if needed
Write-Host "[4/4] Checking dependencies..." -ForegroundColor Yellow
Set-Location $projectRoot
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    & "$BUN_PATH\bun.exe" install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  [OK] Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Please restart PowerShell for PATH changes to take effect permanently" -ForegroundColor Yellow
Write-Host "For now, Bun is available in this session." -ForegroundColor Yellow
