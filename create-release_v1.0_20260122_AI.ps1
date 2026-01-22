# GitHub Release 创建脚本
# 版本: v1.0
# 日期: 2026-01-22
# 说明: 创建GitHub Release并上传ZIP文件

param(
    [string]$Tag = "v0.1",
    [string]$Repo = "hzm8341/opencode_hzm",
    [string]$ZipFile = "packages\desktop\src-tauri\target\release\OpenCode-Desktop-Windows.zip"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "创建 GitHub Release" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查ZIP文件
$fullZipPath = Join-Path (Get-Location) $ZipFile
if (-not (Test-Path $fullZipPath)) {
    Write-Host "错误: ZIP文件不存在: $fullZipPath" -ForegroundColor Red
    exit 1
}

$zipSize = (Get-Item $fullZipPath).Length / 1MB
Write-Host "ZIP文件: $fullZipPath" -ForegroundColor Green
Write-Host "大小: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green
Write-Host ""

# 检查GitHub Token
$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Host "提示: 需要设置 GITHUB_TOKEN 环境变量" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请按以下步骤操作:" -ForegroundColor Yellow
    Write-Host "1. 访问 https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. 创建新的 Personal Access Token (需要 repo 权限)" -ForegroundColor White
    Write-Host "3. 设置环境变量:" -ForegroundColor White
    Write-Host "   `$env:GITHUB_TOKEN = 'your_token_here'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "或者手动创建Release:" -ForegroundColor Yellow
    Write-Host "1. 访问: https://github.com/$Repo/releases/new" -ForegroundColor White
    Write-Host "2. Tag: $Tag" -ForegroundColor White
    Write-Host "3. Title: Release $Tag" -ForegroundColor White
    Write-Host "4. 上传文件: $ZipFile" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Release信息
$releaseTitle = "Release $Tag - Windows Desktop应用首次发布"
$releaseNotes = @"
## Release $Tag

### Windows Desktop应用首次发布

#### 新增功能
- Windows桌面应用程序
- 完整的AI编码助手功能
- 图形化用户界面

#### 文件说明
- **OpenCode.exe**: 主应用程序 (21.29 MB)
- **sidecars/opencode-cli-x86_64-pc-windows-msvc.exe**: CLI工具 (141.81 MB)

#### 系统要求
- Windows 10 或更高版本
- WebView2 Runtime（Windows 10/11 通常已内置）
- Visual C++ Redistributable

#### 安装说明
1. 下载并解压 ZIP 文件
2. 保持目录结构不变
3. 双击 OpenCode.exe 运行

详细说明请查看 ZIP 包中的 README.txt

#### 构建信息
- 构建日期: 2026-01-22
- 平台: Windows x64
- 架构: x86_64-pc-windows-msvc
"@

Write-Host "创建Release..." -ForegroundColor Yellow

# 创建Release
$releaseBody = @{
    tag_name = $Tag
    name = $releaseTitle
    body = $releaseNotes
    draft = $false
    prerelease = $false
} | ConvertTo-Json

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $createUrl = "https://api.github.com/repos/$Repo/releases"
    $response = Invoke-RestMethod -Uri $createUrl -Method Post -Headers $headers -Body $releaseBody -ContentType "application/json"
    
    $releaseId = $response.id
    Write-Host "✓ Release已创建 (ID: $releaseId)" -ForegroundColor Green
    Write-Host ""
    
    # 上传ZIP文件
    Write-Host "上传ZIP文件..." -ForegroundColor Yellow
    
    $uploadUrl = $response.upload_url -replace '\{.*$', ''
    $fileName = Split-Path $fullZipPath -Leaf
    $uploadUrl = "$uploadUrl?name=$fileName"
    
    $fileBytes = [System.IO.File]::ReadAllBytes($fullZipPath)
    $fileEnc = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetString($fileBytes)
    
    $uploadHeaders = @{
        "Authorization" = "token $token"
        "Content-Type" = "application/zip"
    }
    
    $uploadResponse = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -Body ([System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($fileEnc))
    
    Write-Host "✓ ZIP文件已上传" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Release创建成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Release URL: $($response.html_url)" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详细信息: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}
