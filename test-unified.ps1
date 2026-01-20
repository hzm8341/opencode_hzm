# OpenCode 统一入口快速测试脚本 (Windows PowerShell 版本)
# 对应 Bash 版本: test-unified.sh
#
# 使用方法:
#   1. 在 PowerShell 中运行: .\test-unified.ps1
#   2. 如果遇到执行策略限制，运行: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
#
# 功能:
#   - 测试简单需求（不使用 Manus）
#   - 测试复杂需求（自动使用 Manus）
#   - 测试强制使用 Manus 模式
#   - 测试项目检测功能
#   - 验证规划文件内容
#
# 要求:
#   - Windows PowerShell 5.1 或 PowerShell Core 7+
#   - 已安装 bun 命令或 bun.exe 在 PATH 中
#   - 项目已正确配置

$ErrorActionPreference = "Stop"

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 项目根目录（自动检测）
$PROJECT_ROOT = if ($PSScriptRoot) { 
    $PSScriptRoot 
} else { 
    Split-Path -Parent $MyInvocation.MyCommand.Path 
}
$OPENCODE_DIR = Join-Path $PROJECT_ROOT "packages\opencode"

# 测试目录
$TEST_DIR = Join-Path $env:TEMP "opencode-test"
$PROJECT_DIR = Join-Path $TEST_DIR "test-project"

# 查找 bun 命令
$BUN_CMD = $null
if (Get-Command bun -ErrorAction SilentlyContinue) {
    $BUN_CMD = "bun"
} elseif (Test-Path "$env:USERPROFILE\.bun\bin\bun.exe") {
    $BUN_CMD = "$env:USERPROFILE\.bun\bin\bun.exe"
    $env:PATH = "$env:USERPROFILE\.bun\bin;$env:PATH"
} else {
    Write-ColorOutput "错误: 未找到 bun 命令" "Red"
    Write-Host "请安装 bun 或将其添加到 PATH"
    exit 1
}

# 检查是否使用开发模式
$USE_DEV_MODE = $true

# 执行 opencode 命令的函数
function Invoke-OpenCode {
    param(
        [string[]]$Arguments
    )
    
    if ($USE_DEV_MODE) {
        # 使用开发模式（直接运行 TypeScript）
        Push-Location $OPENCODE_DIR
        try {
            & $BUN_CMD run --conditions=browser ./src/index.ts $Arguments
        } finally {
            Pop-Location
        }
    } else {
        # 使用已安装的 opencode
        & opencode $Arguments
    }
}

# 显示运行模式
if ($USE_DEV_MODE) {
    Write-ColorOutput "使用开发模式运行 OpenCode (使用 $BUN_CMD)" "Blue"
} else {
    Write-ColorOutput "使用已安装的 OpenCode" "Blue"
}

# 创建测试目录
Write-ColorOutput "=== 准备测试环境 ===" "Yellow"
New-Item -ItemType Directory -Force -Path $PROJECT_DIR | Out-Null
Set-Location $PROJECT_DIR

# 创建测试项目文件
$packageJsonContent = @"
{
  "name": "test-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0"
  }
}
"@
Set-Content -Path "package.json" -Value $packageJsonContent

Write-ColorOutput "✅ 测试环境准备完成" "Green"
Write-Host ""

# 测试 1: 简单需求
Write-ColorOutput "=== 测试 1: 简单需求（不使用 Manus） ===" "Yellow"
$test1Log = Join-Path $env:TEMP "test1.log"
try {
    $TEST1_OUTPUT = Invoke-OpenCode -Arguments @("unified", "--dir", $PROJECT_DIR, "--requirement", "帮我运行这个项目") 2>&1 | Tee-Object -FilePath $test1Log
    $TEST1_EXIT_CODE = $LASTEXITCODE
    if ($null -eq $TEST1_EXIT_CODE) { $TEST1_EXIT_CODE = 0 }
} catch {
    $TEST1_OUTPUT = $_.Exception.Message
    $TEST1_EXIT_CODE = 1
}

if ($TEST1_EXIT_CODE -eq 0 -and ($TEST1_OUTPUT | Select-String -Pattern "error|Error|ERROR" -Quiet) -eq $false) {
    Write-ColorOutput "✅ 测试 1 通过" "Green"
    
    # 检查是否创建了规划文件（应该没有）
    if (-not (Test-Path "task_plan.md") -and -not (Test-Path "findings.md") -and -not (Test-Path "progress.md")) {
        Write-ColorOutput "✅ 正确：未创建规划文件" "Green"
    } else {
        Write-ColorOutput "❌ 错误：不应该创建规划文件" "Red"
    }
} else {
    Write-ColorOutput "❌ 测试 1 失败" "Red"
}
Write-Host ""

# 测试 2: 复杂需求（自动使用 Manus）
Write-ColorOutput "=== 测试 2: 复杂需求（自动使用 Manus） ===" "Yellow"
$test2Log = Join-Path $env:TEMP "test2.log"
try {
    $TEST2_OUTPUT = Invoke-OpenCode -Arguments @("unified", "--dir", $PROJECT_DIR, "--requirement", "实现一个用户登录功能，包括前端和后端，数据库设计，API 接口，单元测试") 2>&1 | Tee-Object -FilePath $test2Log
    $TEST2_EXIT_CODE = $LASTEXITCODE
    if ($null -eq $TEST2_EXIT_CODE) { $TEST2_EXIT_CODE = 0 }
} catch {
    $TEST2_OUTPUT = $_.Exception.Message
    $TEST2_EXIT_CODE = 1
}

if ($TEST2_EXIT_CODE -eq 0 -and ($TEST2_OUTPUT | Select-String -Pattern "error|Error|ERROR" -Quiet) -eq $false) {
    Write-ColorOutput "✅ 测试 2 通过" "Green"
    
    # 检查规划文件
    if (Test-Path "task_plan.md") {
        Write-ColorOutput "✅ task_plan.md 已创建" "Green"
        Write-Host "--- task_plan.md 前 20 行 ---"
        Get-Content "task_plan.md" | Select-Object -First 20
    } else {
        Write-ColorOutput "❌ task_plan.md 未创建" "Red"
    }
    
    if (Test-Path "findings.md") {
        Write-ColorOutput "✅ findings.md 已创建" "Green"
    } else {
        Write-ColorOutput "❌ findings.md 未创建" "Red"
    }
    
    if (Test-Path "progress.md") {
        Write-ColorOutput "✅ progress.md 已创建" "Green"
    } else {
        Write-ColorOutput "❌ progress.md 未创建" "Red"
    }
} else {
    Write-ColorOutput "❌ 测试 2 失败" "Red"
}
Write-Host ""

# 测试 3: 强制使用 Manus
Write-ColorOutput "=== 测试 3: 强制使用 Manus 模式 ===" "Yellow"
# 先清理之前的文件
Remove-Item -Path "task_plan.md", "findings.md", "progress.md" -ErrorAction SilentlyContinue

$test3Log = Join-Path $env:TEMP "test3.log"
try {
    $TEST3_OUTPUT = Invoke-OpenCode -Arguments @("unified", "--dir", $PROJECT_DIR, "--requirement", "测试需求", "--useManus") 2>&1 | Tee-Object -FilePath $test3Log
    $TEST3_EXIT_CODE = $LASTEXITCODE
    if ($null -eq $TEST3_EXIT_CODE) { $TEST3_EXIT_CODE = 0 }
} catch {
    $TEST3_OUTPUT = $_.Exception.Message
    $TEST3_EXIT_CODE = 1
}

if ($TEST3_EXIT_CODE -eq 0 -and ($TEST3_OUTPUT | Select-String -Pattern "error|Error|ERROR" -Quiet) -eq $false) {
    Write-ColorOutput "✅ 测试 3 通过" "Green"
    
    # 检查规划文件
    if ((Test-Path "task_plan.md") -and (Test-Path "findings.md") -and (Test-Path "progress.md")) {
        Write-ColorOutput "✅ 所有规划文件已创建" "Green"
    } else {
        Write-ColorOutput "❌ 部分规划文件未创建" "Red"
    }
} else {
    Write-ColorOutput "❌ 测试 3 失败" "Red"
}
Write-Host ""

# 测试 4: 项目检测
Write-ColorOutput "=== 测试 4: 项目检测 ===" "Yellow"
$test4Log = Join-Path $env:TEMP "test4.log"
try {
    $test4Output = Invoke-OpenCode -Arguments @("unified", "--dir", $PROJECT_DIR, "--requirement", "检测项目类型") 2>&1 | Tee-Object -FilePath $test4Log
    if ($test4Output | Select-String -Pattern "node|express" -CaseSensitive:$false) {
        Write-ColorOutput "✅ 测试 4 通过：项目检测正常" "Green"
    } else {
        Write-ColorOutput "⚠️  测试 4：项目检测结果未在输出中显示（可能需要查看日志）" "Yellow"
    }
} catch {
    Write-ColorOutput "⚠️  测试 4：项目检测结果未在输出中显示（可能需要查看日志）" "Yellow"
}
Write-Host ""

# 测试 5: 验证规划文件内容
Write-ColorOutput "=== 测试 5: 验证规划文件内容 ===" "Yellow"
if (Test-Path "task_plan.md") {
    $content = Get-Content "task_plan.md" -Raw
    if ($content -match "# Task Plan" -and $content -match "## Phases" -and $content -match "Phase 1") {
        Write-ColorOutput "✅ task_plan.md 内容格式正确" "Green"
    } else {
        Write-ColorOutput "❌ task_plan.md 内容格式错误" "Red"
    }
    
    if ($content -match "## Errors") {
        Write-ColorOutput "✅ task_plan.md 包含错误记录部分" "Green"
    }
} else {
    Write-ColorOutput "⚠️  task_plan.md 不存在，跳过内容验证" "Yellow"
}
Write-Host ""

# 总结
Write-ColorOutput "=== 测试总结 ===" "Yellow"
Write-Host "测试目录: $PROJECT_DIR"
Write-Host "测试日志: $env:TEMP\test*.log"
Write-Host ""
Write-ColorOutput "测试完成！" "Green"
Write-Host ""
Write-Host "查看详细日志："
Write-Host "  Get-Content $env:TEMP\test1.log  # 测试 1 日志"
Write-Host "  Get-Content $env:TEMP\test2.log  # 测试 2 日志"
Write-Host "  Get-Content $env:TEMP\test3.log  # 测试 3 日志"
Write-Host "  Get-Content $env:TEMP\test4.log  # 测试 4 日志"
Write-Host ""
Write-Host "查看规划文件："
Write-Host "  Get-Content $PROJECT_DIR\task_plan.md"
Write-Host "  Get-Content $PROJECT_DIR\findings.md"
Write-Host "  Get-Content $PROJECT_DIR\progress.md"

