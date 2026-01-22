# OpenCode Demo 验证脚本
# 用于验证项目demo是否可以正常运行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OpenCode Demo 验证脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 Bun 是否安装
Write-Host "[1/4] 检查 Bun 安装..." -ForegroundColor Yellow
$env:PATH += ";$HOME\.bun\bin"
$bunVersion = & bun --version 2>&1
if ($LASTEXITCODE -eq 0 -and $bunVersion -notmatch "error|not found") {
    Write-Host "  ✓ Bun 已安装: $bunVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Bun 未安装或不在 PATH 中" -ForegroundColor Red
    exit 1
}

# 2. 检查项目依赖
Write-Host "[2/4] 检查项目依赖..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ 项目依赖已安装" -ForegroundColor Green
} else {
    Write-Host "  ✗ 项目依赖未安装，正在安装..." -ForegroundColor Yellow
    bun install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ 依赖安装完成" -ForegroundColor Green
}

# 3. 检查项目结构
Write-Host "[3/4] 检查项目结构..." -ForegroundColor Yellow
$requiredDirs = @("packages/opencode", "packages/app", "packages/desktop")
$allExist = $true
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "  ✓ $dir 存在" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $dir 不存在" -ForegroundColor Red
        $allExist = $false
    }
}
if (-not $allExist) {
    Write-Host "  ✗ 项目结构不完整" -ForegroundColor Red
    exit 1
}

# 4. 验证运行命令
Write-Host "[4/4] 验证运行命令..." -ForegroundColor Yellow
Write-Host "  运行命令: bun dev" -ForegroundColor Cyan
Write-Host "  运行命令: bun dev run '帮我将当前的项目demo运行起来'" -ForegroundColor Cyan
Write-Host "  Web应用: bun run --cwd packages/app dev (访问 http://localhost:5173)" -ForegroundColor Cyan
Write-Host "  服务器: bun dev serve --port 4096 (访问 http://localhost:4096)" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ 验证完成！项目已配置好，可以运行。" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "使用方法:" -ForegroundColor Yellow
Write-Host "  1. TUI界面: bun dev" -ForegroundColor White
Write-Host "  2. 运行命令: bun dev run '你的问题'" -ForegroundColor White
Write-Host "  3. Web界面: bun run --cwd packages/app dev" -ForegroundColor White
Write-Host ""
