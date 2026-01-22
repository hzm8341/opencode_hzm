# ============================================================
# OpenCode Windows 环境安装和配置脚本
# ============================================================
# 功能：
#   1. 检查系统要求
#   2. 安装 Bun（如果未安装）
#   3. 配置 PATH 环境变量
#   4. 安装项目依赖
#   5. 验证安装
#   6. 可选：配置 API 密钥
#
# 使用方法：
#   powershell -ExecutionPolicy Bypass -File .\setup-windows-environment.ps1
#   或者右键点击脚本 -> "使用 PowerShell 运行"
# ============================================================

#Requires -Version 5.1

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# 颜色输出函数
function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n========================================" -ForegroundColor $Color
    Write-Host $Message -ForegroundColor $Color
    Write-Host "========================================`n" -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-Host "  [INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [✓] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  [!] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "  [✗] $Message" -ForegroundColor Red
}

# 检查管理员权限
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# 检查命令是否存在
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# 获取脚本所在目录（项目根目录）
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = $ScriptDir

# 开始安装流程
Write-Step "OpenCode Windows 环境安装和配置脚本" "Cyan"
Write-Host "项目路径: $ProjectRoot`n" -ForegroundColor Gray

# ============================================================
# 步骤 1: 检查系统要求
# ============================================================
Write-Step "步骤 1: 检查系统要求" "Yellow"

# 检查 Windows 版本
$osVersion = [System.Environment]::OSVersion.Version
Write-Info "Windows 版本: $($osVersion.Major).$($osVersion.Minor)"
if ($osVersion.Major -lt 10) {
    Write-Error "需要 Windows 10 或更高版本"
    exit 1
}
Write-Success "Windows 版本符合要求"

# 检查 PowerShell 版本
$psVersion = $PSVersionTable.PSVersion
Write-Info "PowerShell 版本: $($psVersion.Major).$($psVersion.Minor)"
if ($psVersion.Major -lt 5) {
    Write-Error "需要 PowerShell 5.1 或更高版本"
    exit 1
}
Write-Success "PowerShell 版本符合要求"

# 检查项目目录
if (-not (Test-Path "$ProjectRoot\package.json")) {
    Write-Error "未找到 package.json，请确保在项目根目录运行此脚本"
    exit 1
}
Write-Success "项目目录验证通过"

# ============================================================
# 步骤 2: 安装 Bun
# ============================================================
Write-Step "步骤 2: 检查并安装 Bun" "Yellow"

$BUN_PATH = "$env:USERPROFILE\.bun\bin"
$BUN_EXE = "$BUN_PATH\bun.exe"

# 检查 Bun 是否已安装
if (Test-Path $BUN_EXE) {
    $bunVersion = & $BUN_EXE --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Bun 已安装: $bunVersion"
    } else {
        Write-Warning "找到 Bun 但无法运行，将重新安装"
        $needInstallBun = $true
    }
} else {
    Write-Info "Bun 未安装，开始安装..."
    $needInstallBun = $true
}

# 安装 Bun
if ($needInstallBun) {
    Write-Info "正在安装 Bun（这可能需要几分钟）..."
    try {
        # 使用官方安装脚本
        $installScript = Invoke-WebRequest -Uri "https://bun.sh/install.ps1" -UseBasicParsing
        $installScript.Content | Invoke-Expression
        
        # 验证安装
        Start-Sleep -Seconds 2
        if (Test-Path $BUN_EXE) {
            $bunVersion = & $BUN_EXE --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Bun 安装成功: $bunVersion"
            } else {
                Write-Error "Bun 安装后无法运行"
                exit 1
            }
        } else {
            Write-Error "Bun 安装失败，请手动安装: https://bun.sh"
            exit 1
        }
    } catch {
        Write-Error "安装 Bun 时出错: $($_.Exception.Message)"
        Write-Info "请手动安装 Bun: powershell -c `"irm bun.sh/install.ps1 | iex`""
        exit 1
    }
}

# ============================================================
# 步骤 3: 配置 PATH 环境变量
# ============================================================
Write-Step "步骤 3: 配置 PATH 环境变量" "Yellow"

# 添加到当前会话
$env:PATH += ";$BUN_PATH"
Write-Success "已添加到当前会话 PATH"

# 检查是否已在用户 PATH 中
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$pathArray = $currentPath -split ';' | Where-Object { $_ -ne '' }

if ($pathArray -contains $BUN_PATH) {
    Write-Success "Bun 已在用户 PATH 中"
} else {
    Write-Info "正在将 Bun 添加到用户 PATH（永久）..."
    try {
        $newPath = if ($currentPath) { "$currentPath;$BUN_PATH" } else { $BUN_PATH }
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Success "Bun 已添加到用户 PATH"
        Write-Warning "请重新打开 PowerShell 窗口以使 PATH 更改永久生效"
    } catch {
        Write-Warning "无法永久添加到 PATH: $($_.Exception.Message)"
        Write-Info "你可以手动添加: $BUN_PATH"
    }
}

# ============================================================
# 步骤 4: 安装项目依赖
# ============================================================
Write-Step "步骤 4: 安装项目依赖" "Yellow"

Set-Location $ProjectRoot

# 检查 node_modules
if (Test-Path "node_modules") {
    Write-Success "项目依赖已安装"
    
    # 询问是否重新安装
    $reinstall = Read-Host "是否重新安装依赖？(y/N)"
    if ($reinstall -eq 'y' -or $reinstall -eq 'Y') {
        Write-Info "正在重新安装依赖..."
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        $needInstallDeps = $true
    }
} else {
    Write-Info "项目依赖未安装"
    $needInstallDeps = $true
}

# 安装依赖
if ($needInstallDeps) {
    Write-Info "正在安装项目依赖（这可能需要几分钟）..."
    try {
        & $BUN_EXE install
        if ($LASTEXITCODE -eq 0) {
            Write-Success "项目依赖安装成功"
        } else {
            Write-Error "项目依赖安装失败"
            exit 1
        }
    } catch {
        Write-Error "安装依赖时出错: $($_.Exception.Message)"
        exit 1
    }
}

# ============================================================
# 步骤 5: 验证安装
# ============================================================
Write-Step "步骤 5: 验证安装" "Yellow"

# 验证 Bun
Write-Info "验证 Bun..."
$bunVersion = & $BUN_EXE --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Bun 版本: $bunVersion"
} else {
    Write-Error "Bun 验证失败"
    exit 1
}

# 验证项目结构
Write-Info "验证项目结构..."
$requiredDirs = @("packages\opencode", "packages\app")
$allExist = $true
foreach ($dir in $requiredDirs) {
    if (Test-Path "$ProjectRoot\$dir") {
        Write-Success "$dir 存在"
    } else {
        Write-Error "$dir 不存在"
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Error "项目结构不完整"
    exit 1
}

# 验证 OpenCode 命令
Write-Info "验证 OpenCode 命令..."
try {
    $opencodeVersion = & $BUN_EXE dev --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "OpenCode 命令可用"
    } else {
        Write-Warning "OpenCode 命令验证失败，但可能仍可运行"
    }
} catch {
    Write-Warning "无法验证 OpenCode 命令: $($_.Exception.Message)"
}

# ============================================================
# 步骤 6: 可选配置
# ============================================================
Write-Step "步骤 6: 可选配置" "Yellow"

# 检查配置文件
$configDir = "$env:APPDATA\opencode"
$configFile = "$configDir\opencode.json"

if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    Write-Success "创建配置目录: $configDir"
}

# 询问是否配置 API 密钥
Write-Info "API 密钥配置（可选）"
$configureApi = Read-Host "是否配置 API 密钥？(y/N)"
if ($configureApi -eq 'y' -or $configureApi -eq 'Y') {
    Write-Info "你可以设置以下环境变量："
    Write-Host "  - ANTHROPIC_API_KEY (Claude 模型)" -ForegroundColor Cyan
    Write-Host "  - OPENAI_API_KEY (GPT 模型)" -ForegroundColor Cyan
    Write-Host "  - GOOGLE_GENERATIVE_AI_API_KEY (Gemini 模型)" -ForegroundColor Cyan
    Write-Host ""
    Write-Info "或者编辑配置文件: $configFile"
    Write-Info "配置文件示例："
    Write-Host @"
{
  `"`$schema`": `"https://opencode.ai/config.json`",
  `"model`": `"anthropic/claude-sonnet-4-20250514`",
  `"default_agent`": `"build`",
  `"provider`": {
    `"anthropic`": {
      `"options`": {
        `"apiKey`": `"{env:ANTHROPIC_API_KEY}`"
      }
    }
  }
}
"@ -ForegroundColor Gray
}

# ============================================================
# 完成
# ============================================================
Write-Step "安装和配置完成！" "Green"

Write-Host "`n运行方式：" -ForegroundColor Yellow
Write-Host "  1. TUI 界面（推荐）:" -ForegroundColor White
Write-Host "     bun dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. 运行命令:" -ForegroundColor White
Write-Host "     bun dev run `"你的问题`"" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Web 应用界面:" -ForegroundColor White
Write-Host "     bun run --cwd packages/app dev" -ForegroundColor Cyan
Write-Host "     然后访问 http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. 服务器模式:" -ForegroundColor White
Write-Host "     bun dev serve --port 4096" -ForegroundColor Cyan
Write-Host "     然后访问 http://localhost:4096" -ForegroundColor Gray
Write-Host ""

Write-Host "注意事项：" -ForegroundColor Yellow
Write-Host "  - 如果 PATH 更改未生效，请重新打开 PowerShell 窗口" -ForegroundColor Gray
Write-Host "  - 详细使用指南请参考 USAGE_GUIDE.md" -ForegroundColor Gray
Write-Host "  - 配置文件位置: $configFile" -ForegroundColor Gray
Write-Host ""

Write-Success "环境配置完成！可以开始使用 OpenCode 了。"
Write-Host ""
