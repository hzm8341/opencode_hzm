# Windows 环境安装脚本说明

## 📦 脚本文件

本项目提供了多个 Windows 环境安装脚本：

### 1. `setup-windows-environment-en.ps1`（完整版 - 英文，推荐）

**功能完整，适合首次安装**

- ✅ 详细的系统要求检查
- ✅ 自动安装 Bun（如果未安装）
- ✅ 配置 PATH 环境变量（永久和当前会话）
- ✅ 安装项目依赖
- ✅ 完整的验证流程
- ✅ 可选配置 API 密钥
- ✅ 友好的输出和错误处理
- ✅ **无编码问题**（英文版本）

**使用方法**：
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows-environment-en.ps1
```

### 2. `setup-windows-simple.ps1`（简化版 - 英文，推荐）

**快速安装，适合快速部署**

- ✅ 快速安装 Bun
- ✅ 快速配置 PATH
- ✅ 快速安装依赖
- ✅ 简洁的输出
- ✅ **无编码问题**（英文版本）

**使用方法**：
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows-simple.ps1
```

### 3. `setup-windows-environment.ps1`（完整版 - 中文）

**注意**：此脚本存在编码问题，建议使用英文版本 `setup-windows-environment-en.ps1`

### 4. `setup-windows-simple-en.ps1`（简化版 - 英文，备用）

与 `setup-windows-simple.ps1` 功能相同，备用版本。

## 🚀 快速开始

### 方法一：右键运行（最简单）

1. 找到 `setup-windows-simple.ps1` 文件
2. 右键点击文件
3. 选择"使用 PowerShell 运行"

### 方法二：命令行运行

```powershell
# 进入项目目录
cd c:\Users\hzm\Documents\GitHub\opencode_hzm

# 运行安装脚本
powershell -ExecutionPolicy Bypass -File .\setup-windows-simple.ps1
```

## ✅ 验证安装

安装完成后，运行验证脚本：

```powershell
powershell -ExecutionPolicy Bypass -File .\verify_demo.ps1
```

或手动验证：

```powershell
# 检查 Bun
bun --version

# 检查项目
bun dev --version

# 测试运行
bun dev run "Hello, OpenCode!"
```

## 📚 详细文档

完整的使用指南请参考：
- [Windows环境安装配置指南](docs/Windows环境安装配置指南_v1.0_20260122_AI.md)
- [运行指南](DEMO_RUNNING_GUIDE.md)
- [使用指南](USAGE_GUIDE.md)

## ⚠️ 注意事项

1. **执行策略**：如果遇到执行策略错误，使用 `-ExecutionPolicy Bypass` 参数
2. **管理员权限**：通常不需要管理员权限，但如果 PATH 配置失败，可能需要
3. **网络连接**：安装 Bun 和依赖需要网络连接
4. **PATH 生效**：PATH 配置后需要重新打开 PowerShell 窗口才能生效

## 🔧 常见问题

### PowerShell 执行策略错误

```powershell
# 解决方法：使用 Bypass 参数
powershell -ExecutionPolicy Bypass -File .\setup-windows-environment.ps1
```

### Bun 安装失败

```powershell
# 手动安装 Bun
powershell -c "irm bun.sh/install.ps1 | iex"
```

### PATH 未生效

重新打开 PowerShell 窗口，或手动添加到 PATH：
```powershell
$env:PATH += ";$HOME\.bun\bin"
```

## 📝 脚本对比

| 功能 | 完整版 (英文) | 简化版 (英文) |
|------|--------------|--------------|
| 系统检查 | ✅ | ❌ |
| 自动安装 Bun | ✅ | ✅ |
| PATH 配置 | ✅ | ✅ |
| 依赖安装 | ✅ | ✅ |
| 详细输出 | ✅ | ❌ |
| 交互式配置 | ✅ | ❌ |
| API 密钥配置 | ✅ | ❌ |
| 验证流程 | ✅ | ❌ |
| 编码问题 | ✅ 无 | ✅ 无 |

**推荐**：
- 首次安装：使用 `setup-windows-environment-en.ps1`（完整版英文）
- 快速部署：使用 `setup-windows-simple.ps1`（简化版英文）
