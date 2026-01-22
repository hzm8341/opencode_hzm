# Windows PowerShell 脚本：将 Bun 添加到 PATH
# 使用方法：在 PowerShell 中运行此脚本（需要管理员权限）

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Bun PATH 配置脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$BUN_PATH = "$env:USERPROFILE\.bun\bin"

# 检查 Bun 是否存在
if (Test-Path "$BUN_PATH\bun.exe") {
    Write-Host "✓ 找到 Bun: $BUN_PATH\bun.exe" -ForegroundColor Green
    
    # 获取当前用户的环境变量
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    # 检查是否已经在 PATH 中
    if ($currentPath -split ';' -contains $BUN_PATH) {
        Write-Host "✓ Bun 已经在 PATH 中" -ForegroundColor Green
    } else {
        Write-Host "正在将 Bun 添加到 PATH..." -ForegroundColor Yellow
        
        # 添加到 PATH
        $newPath = if ($currentPath) { "$currentPath;$BUN_PATH" } else { $BUN_PATH }
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        
        Write-Host "✓ Bun 已添加到 PATH" -ForegroundColor Green
        Write-Host ""
        Write-Host "注意：请重新打开 PowerShell 窗口以使更改生效" -ForegroundColor Yellow
        Write-Host "或者运行以下命令临时添加到当前会话：" -ForegroundColor Yellow
        Write-Host "  `$env:PATH += `";$BUN_PATH`"" -ForegroundColor Cyan
    }
} else {
    Write-Host "✗ 未找到 Bun，请先安装 Bun" -ForegroundColor Red
    Write-Host ""
    Write-Host "安装命令：" -ForegroundColor Yellow
    Write-Host "  powershell -c `"irm bun.sh/install.ps1 | iex`"" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "配置完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
