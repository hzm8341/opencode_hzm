# OpenCode Desktop Windows ZIP 打包脚本
# 版本: v1.0
# 日期: 2026-01-22
# 说明: 将Windows运行所需文件打包成ZIP

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OpenCode Desktop Windows ZIP 打包脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ReleaseDir = Join-Path $ScriptDir "src-tauri\target\release"
$PackageDir = Join-Path $ReleaseDir "opencode-desktop-windows"
$ZipFile = Join-Path $ReleaseDir "OpenCode-Desktop-Windows.zip"

# 检查必要文件
Write-Host "检查必要文件..." -ForegroundColor Yellow

$requiredFiles = @(
    @{Path = "src-tauri\target\release\OpenCode.exe"; Name = "OpenCode.exe"},
    @{Path = "src-tauri\sidecars\opencode-cli-x86_64-pc-windows-msvc.exe"; Name = "Sidecar CLI"}
)

foreach ($file in $requiredFiles) {
    $fullPath = Join-Path $ScriptDir $file.Path
    if (-not (Test-Path $fullPath)) {
        Write-Host "错误: 找不到文件 $($file.Name)" -ForegroundColor Red
        Write-Host "路径: $fullPath" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ 找到 $($file.Name)" -ForegroundColor Green
}

Write-Host ""

# 创建打包目录
Write-Host "创建打包目录..." -ForegroundColor Yellow
if (Test-Path $PackageDir) {
    Remove-Item $PackageDir -Recurse -Force
}
New-Item -ItemType Directory -Path $PackageDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $PackageDir "sidecars") -Force | Out-Null
Write-Host "✓ 打包目录已创建" -ForegroundColor Green
Write-Host ""

# 复制文件
Write-Host "复制文件..." -ForegroundColor Yellow

# 复制主程序
$mainExe = Join-Path $ScriptDir "src-tauri\target\release\OpenCode.exe"
$mainExeDest = Join-Path $PackageDir "OpenCode.exe"
Copy-Item $mainExe $mainExeDest -Force
$mainSize = (Get-Item $mainExeDest).Length / 1MB
Write-Host "✓ 已复制 OpenCode.exe ($([math]::Round($mainSize, 2)) MB)" -ForegroundColor Green

# 复制Sidecar CLI
$sidecarExe = Join-Path $ScriptDir "src-tauri\sidecars\opencode-cli-x86_64-pc-windows-msvc.exe"
$sidecarDest = Join-Path $PackageDir "sidecars\opencode-cli-x86_64-pc-windows-msvc.exe"
Copy-Item $sidecarExe $sidecarDest -Force
$sidecarSize = (Get-Item $sidecarDest).Length / 1MB
Write-Host "✓ 已复制 Sidecar CLI ($([math]::Round($sidecarSize, 2)) MB)" -ForegroundColor Green

# 复制README（如果存在）
$readmeSource = Join-Path $ReleaseDir "README.txt"
if (Test-Path $readmeSource) {
    Copy-Item $readmeSource (Join-Path $PackageDir "README.txt") -Force
    Write-Host "✓ 已复制 README.txt" -ForegroundColor Green
}

Write-Host ""

# 创建ZIP文件
Write-Host "创建ZIP文件..." -ForegroundColor Yellow
if (Test-Path $ZipFile) {
    Remove-Item $ZipFile -Force
}

Compress-Archive -Path "$PackageDir\*" -DestinationPath $ZipFile -Force
$zipSize = (Get-Item $ZipFile).Length / 1MB

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "打包完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "ZIP文件位置:" -ForegroundColor Cyan
Write-Host "  $ZipFile" -ForegroundColor White
Write-Host ""
Write-Host "文件大小: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "ZIP内容:" -ForegroundColor Cyan
Get-ChildItem -Path $PackageDir -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Replace($PackageDir + "\", "")
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  - $relativePath ($size MB)" -ForegroundColor White
}
Write-Host ""
