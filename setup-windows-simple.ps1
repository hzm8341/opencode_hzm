# ============================================================
# OpenCode Windows Quick Setup Script (Simplified)
# ============================================================
# Quick installation and configuration of OpenCode environment
# Usage: Right-click -> "Run with PowerShell"
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "OpenCode Windows Quick Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Install Bun
Write-Host "[1/3] Checking Bun..." -ForegroundColor Yellow
$BUN_PATH = "$env:USERPROFILE\.bun\bin"
if (-not (Test-Path "$BUN_PATH\bun.exe")) {
    Write-Host "  Installing Bun..." -ForegroundColor Cyan
    powershell -c "irm bun.sh/install.ps1 | iex"
}
$env:PATH += ";$BUN_PATH"
Write-Host "  [OK] Bun is ready" -ForegroundColor Green

# Step 2: Configure PATH
Write-Host "[2/3] Configuring PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$BUN_PATH*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$BUN_PATH", "User")
    Write-Host "  [OK] PATH configured" -ForegroundColor Green
} else {
    Write-Host "  [OK] PATH already exists" -ForegroundColor Green
}

# Step 3: Install dependencies
Write-Host "[3/3] Installing project dependencies..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
if (-not (Test-Path "node_modules")) {
    & "$BUN_PATH\bun.exe" install
    Write-Host "  [OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  [OK] Dependencies already exist" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
Write-Host "Run: bun dev" -ForegroundColor Cyan
Write-Host ""
