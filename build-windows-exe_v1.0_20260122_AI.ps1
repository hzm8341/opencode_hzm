# OpenCode Desktop Windows EXE 打包脚本
# 版本: v1.0
# 日期: 2026-01-22
# 说明: 用于构建 OpenCode Desktop Windows 可执行文件

param(
    [switch]$SkipDeps,      # 跳过依赖检查
    [switch]$Dev,            # 使用开发配置
    [string]$Config = "prod"  # 配置文件: prod 或 dev (默认: prod)
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OpenCode Desktop Windows EXE 打包脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取脚本所在目录（项目根目录）
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$DesktopDir = Join-Path $ProjectRoot "packages\desktop"

# 检查必要的依赖
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

if (-not $SkipDeps) {
    Write-Host "检查依赖..." -ForegroundColor Yellow
    
    $missingDeps = @()
    
    if (-not (Test-Command "bun")) {
        $missingDeps += "Bun (https://bun.sh)"
    }
    
    if (-not (Test-Command "cargo")) {
        $missingDeps += "Rust/Cargo (https://rustup.rs)"
    }
    
    if (-not (Test-Command "node")) {
        $missingDeps += "Node.js (https://nodejs.org)"
    }
    
    if ($missingDeps.Count -gt 0) {
        Write-Host "错误: 缺少以下依赖:" -ForegroundColor Red
        foreach ($dep in $missingDeps) {
            Write-Host "  - $dep" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "请先安装缺少的依赖后再运行此脚本。" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✓ 所有依赖已安装" -ForegroundColor Green
    Write-Host ""
}

# 检查 Rust 工具链
Write-Host "检查 Rust 工具链..." -ForegroundColor Yellow
try {
    $rustVersion = cargo --version
    Write-Host "✓ $rustVersion" -ForegroundColor Green
    
    # 检查 Windows 目标平台
    $targetInstalled = cargo target list --installed | Select-String "x86_64-pc-windows-msvc"
    if (-not $targetInstalled) {
        Write-Host "安装 Windows 目标平台..." -ForegroundColor Yellow
        rustup target add x86_64-pc-windows-msvc
        Write-Host "✓ Windows 目标平台已安装" -ForegroundColor Green
    } else {
        Write-Host "✓ Windows 目标平台已安装" -ForegroundColor Green
    }
} catch {
    Write-Host "错误: 无法检查 Rust 工具链" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 切换到项目根目录
Set-Location $ProjectRoot

# 安装项目依赖
Write-Host "安装项目依赖..." -ForegroundColor Yellow
try {
    bun install
    Write-Host "✓ 依赖安装完成" -ForegroundColor Green
} catch {
    Write-Host "错误: 依赖安装失败" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 切换到 desktop 目录
Set-Location $DesktopDir

# 准备 sidecar 二进制文件（如果需要）
Write-Host "准备 sidecar 二进制文件..." -ForegroundColor Yellow
$sidecarPath = "src-tauri\sidecars\opencode-cli-x86_64-pc-windows-msvc.exe"
if (-not (Test-Path $sidecarPath)) {
    Write-Host "警告: sidecar 二进制文件不存在: $sidecarPath" -ForegroundColor Yellow
    Write-Host "提示: 如果需要 sidecar，请先构建 opencode CLI 或从 GitHub Releases 下载" -ForegroundColor Yellow
    Write-Host "      本地开发构建可以跳过此步骤" -ForegroundColor Yellow
    
    # 尝试从本地构建 opencode CLI
    Write-Host "尝试从本地构建 opencode CLI..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    Set-Location "packages\opencode"
    
    try {
        Write-Host "构建 opencode CLI..." -ForegroundColor Yellow
        bun run build
        
        # 查找构建的二进制文件
        $cliExe = Get-ChildItem -Path "dist" -Filter "opencode.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($cliExe) {
            Write-Host "找到 CLI 二进制文件: $($cliExe.FullName)" -ForegroundColor Green
            
            # 创建 sidecars 目录
            $sidecarsDir = Join-Path $ProjectRoot "packages\desktop\src-tauri\sidecars"
            New-Item -ItemType Directory -Force -Path $sidecarsDir | Out-Null
            
            # 复制到 sidecar 目录
            Copy-Item $cliExe.FullName $sidecarPath -Force
            Write-Host "✓ Sidecar 二进制文件已准备" -ForegroundColor Green
        } else {
            Write-Host "警告: 未找到构建的 CLI 二进制文件，继续构建（sidecar 可能不可用）" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "警告: 无法构建 CLI，继续构建（sidecar 可能不可用）" -ForegroundColor Yellow
    }
    
    Set-Location $DesktopDir
} else {
    Write-Host "✓ Sidecar 二进制文件已存在" -ForegroundColor Green
}
Write-Host ""

# 选择配置文件
$configFile = if ($Dev -or $Config -eq "dev") {
    "tauri.conf.json"
} else {
    "tauri.prod.conf.json"
}

Write-Host "使用配置文件: $configFile" -ForegroundColor Cyan
Write-Host ""

# 构建 Tauri 应用
Write-Host "开始构建 Tauri 应用..." -ForegroundColor Yellow
Write-Host "这可能需要几分钟时间，请耐心等待..." -ForegroundColor Yellow
Write-Host ""

try {
    if ($Dev -or $Config -eq "dev") {
        bun run tauri build --config ./src-tauri/tauri.conf.json
    } else {
        bun run tauri build --config ./src-tauri/tauri.prod.conf.json
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "构建完成！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # 查找生成的 exe 文件
    $exeFiles = Get-ChildItem -Path "src-tauri\target\release" -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue
    
    if ($exeFiles) {
        Write-Host "生成的 EXE 文件位置:" -ForegroundColor Cyan
        foreach ($exe in $exeFiles) {
            Write-Host "  - $($exe.FullName)" -ForegroundColor White
        }
        Write-Host ""
        
        # NSIS 安装包
        $nsisInstaller = Get-ChildItem -Path "src-tauri\target\release" -Filter "*.exe" -ErrorAction SilentlyContinue | 
            Where-Object { $_.Name -like "*Setup*" -or $_.Name -like "*installer*" }
        
        if ($nsisInstaller) {
            Write-Host "NSIS 安装包:" -ForegroundColor Cyan
            Write-Host "  - $($nsisInstaller.FullName)" -ForegroundColor White
            Write-Host ""
        }
    } else {
        Write-Host "警告: 未找到生成的 EXE 文件" -ForegroundColor Yellow
        Write-Host "请检查构建输出以获取更多信息" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "构建失败！" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "错误信息:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "提示:" -ForegroundColor Yellow
    Write-Host "1. 确保已安装所有依赖（Rust、Bun、Node.js）" -ForegroundColor Yellow
    Write-Host "2. 确保已安装 Windows 构建工具（Visual Studio Build Tools）" -ForegroundColor Yellow
    Write-Host "3. 检查网络连接（首次构建需要下载依赖）" -ForegroundColor Yellow
    Write-Host "4. 查看 Tauri 文档: https://v2.tauri.app/start/prerequisites/" -ForegroundColor Yellow
    exit 1
}

Write-Host "构建完成！" -ForegroundColor Green
