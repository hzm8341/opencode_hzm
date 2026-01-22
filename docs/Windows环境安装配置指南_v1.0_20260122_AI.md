# OpenCode Windows 环境安装配置指南

**版本**: v1.0  
**日期**: 2026-01-22  
**适用系统**: Windows 10/11

---

## 📋 目录

- [快速开始](#快速开始)
- [详细安装步骤](#详细安装步骤)
- [脚本说明](#脚本说明)
- [验证安装](#验证安装)
- [常见问题](#常见问题)
- [卸载](#卸载)

---

## 🚀 快速开始

### 方法一：使用快速安装脚本（推荐）

1. **下载脚本**
   - 在项目根目录找到 `setup-windows-simple.ps1`

2. **运行脚本**
   - 右键点击脚本文件
   - 选择"使用 PowerShell 运行"
   - 或者在 PowerShell 中运行：
     ```powershell
     powershell -ExecutionPolicy Bypass -File .\setup-windows-simple.ps1
     ```

3. **完成**
   - 脚本会自动安装 Bun、配置 PATH 和安装项目依赖
   - 安装完成后运行 `bun dev` 即可使用

### 方法二：使用完整安装脚本

如果需要更多配置选项和详细输出：

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows-environment.ps1
```

---

## 📝 详细安装步骤

### 步骤 1: 系统要求检查

- **Windows 版本**: Windows 10 或更高版本
- **PowerShell 版本**: PowerShell 5.1 或更高版本
- **内存**: 建议 4GB 以上
- **磁盘空间**: 建议 2GB 以上可用空间

### 步骤 2: 安装 Bun

Bun 是 OpenCode 的运行时环境。

#### 自动安装（推荐）

运行安装脚本会自动安装 Bun。

#### 手动安装

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

验证安装：

```powershell
bun --version
```

### 步骤 3: 配置 PATH 环境变量

#### 自动配置（推荐）

安装脚本会自动配置 PATH。

#### 手动配置

1. **临时添加到当前会话**：
   ```powershell
   $env:PATH += ";$HOME\.bun\bin"
   ```

2. **永久添加到用户 PATH**：
   - 打开"系统属性" -> "高级" -> "环境变量"
   - 在"用户变量"中找到 `Path`
   - 点击"编辑" -> "新建"
   - 添加：`%USERPROFILE%\.bun\bin`
   - 点击"确定"保存

   或者使用 PowerShell：
   ```powershell
   $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
   [Environment]::SetEnvironmentVariable("Path", "$currentPath;$env:USERPROFILE\.bun\bin", "User")
   ```

### 步骤 4: 安装项目依赖

在项目根目录运行：

```powershell
cd c:\Users\hzm\Documents\GitHub\opencode_hzm
bun install
```

### 步骤 5: 验证安装

运行验证脚本：

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

---

## 📄 脚本说明

### setup-windows-environment.ps1（完整版）

**功能**：
- ✅ 检查系统要求（Windows 版本、PowerShell 版本）
- ✅ 自动安装 Bun（如果未安装）
- ✅ 配置 PATH 环境变量（永久和当前会话）
- ✅ 安装项目依赖
- ✅ 验证安装
- ✅ 可选配置 API 密钥

**使用方法**：
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows-environment.ps1
```

**特点**：
- 详细的步骤输出和错误处理
- 交互式配置选项
- 完整的验证流程

### setup-windows-simple.ps1（简化版）

**功能**：
- ✅ 快速安装 Bun
- ✅ 快速配置 PATH
- ✅ 快速安装依赖

**使用方法**：
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows-simple.ps1
```

**特点**：
- 快速、简洁
- 适合快速部署
- 最小化输出

### verify_demo.ps1（验证脚本）

**功能**：
- ✅ 检查 Bun 安装
- ✅ 检查项目依赖
- ✅ 检查项目结构
- ✅ 显示运行方式

**使用方法**：
```powershell
powershell -ExecutionPolicy Bypass -File .\verify_demo.ps1
```

---

## ✅ 验证安装

安装完成后，运行以下命令验证：

```powershell
# 1. 检查 Bun
bun --version
# 应该显示版本号，如：1.3.6

# 2. 检查项目
bun dev --version
# 应该显示：local

# 3. 测试运行
bun dev run "Hello, OpenCode!"
# 应该看到 OpenCode 的响应

# 4. 检查依赖
Test-Path node_modules
# 应该返回 True
```

---

## 🎯 运行 OpenCode

安装完成后，可以使用以下方式运行：

### 1. TUI 界面（推荐）

```powershell
bun dev
```

启动交互式终端界面。

### 2. 运行命令

```powershell
bun dev run "你的问题或任务"
```

### 3. Web 应用界面

```powershell
bun run --cwd packages/app dev
```

然后访问 http://localhost:5173

### 4. 服务器模式

```powershell
bun dev serve --port 4096
```

然后访问 http://localhost:4096

---

## 🔧 配置 API 密钥（可选）

如果需要使用 AI 模型，需要配置 API 密钥。

### 方法一：环境变量

在 PowerShell 中设置：

```powershell
# Claude (Anthropic)
$env:ANTHROPIC_API_KEY = "sk-ant-xxx"

# OpenAI
$env:OPENAI_API_KEY = "sk-xxx"

# Google Gemini
$env:GOOGLE_GENERATIVE_AI_API_KEY = "xxx"
```

永久设置（添加到用户环境变量）：
- 打开"系统属性" -> "高级" -> "环境变量"
- 在"用户变量"中点击"新建"
- 输入变量名和值

### 方法二：配置文件

创建配置文件：`%APPDATA%\opencode\opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-20250514",
  "default_agent": "build",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

---

## ❓ 常见问题

### Q1: PowerShell 执行策略错误

**错误**：
```
无法加载文件，因为在此系统上禁止运行脚本
```

**解决方法**：
```powershell
# 临时允许执行
powershell -ExecutionPolicy Bypass -File .\setup-windows-environment.ps1

# 或永久更改执行策略（需要管理员权限）
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q2: Bun 安装失败

**解决方法**：
1. 检查网络连接
2. 手动安装：
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```
3. 检查防火墙设置

### Q3: PATH 配置未生效

**解决方法**：
1. 重新打开 PowerShell 窗口
2. 手动添加到 PATH（见步骤 3）
3. 重启计算机（如果仍无效）

### Q4: 依赖安装失败

**解决方法**：
1. 检查网络连接
2. 清理缓存后重试：
   ```powershell
   Remove-Item -Recurse -Force node_modules
   bun install
   ```
3. 检查磁盘空间

### Q5: 命令未找到

**错误**：
```
bun: 无法将"bun"项识别为 cmdlet、函数、脚本文件或可运行程序
```

**解决方法**：
1. 检查 PATH 配置
2. 临时添加到当前会话：
   ```powershell
   $env:PATH += ";$HOME\.bun\bin"
   ```
3. 验证 Bun 安装：
   ```powershell
   Test-Path "$HOME\.bun\bin\bun.exe"
   ```

---

## 🗑️ 卸载

### 卸载 Bun

1. 删除 Bun 目录：
   ```powershell
   Remove-Item -Recurse -Force "$env:USERPROFILE\.bun"
   ```

2. 从 PATH 中移除：
   - 打开"系统属性" -> "高级" -> "环境变量"
   - 在"用户变量"中找到 `Path`
   - 删除 `%USERPROFILE%\.bun\bin`

### 卸载项目依赖

```powershell
Remove-Item -Recurse -Force node_modules
```

### 删除配置文件

```powershell
Remove-Item -Recurse -Force "$env:APPDATA\opencode"
```

---

## 📚 相关文档

- [使用指南](USAGE_GUIDE.md)
- [运行指南](DEMO_RUNNING_GUIDE.md)
- [项目 README](README.md)

---

## 📝 更新日志

### v1.0 (2026-01-22)
- 初始版本
- 支持 Windows 10/11
- 自动安装和配置脚本
- 完整的验证流程

---

## 💡 提示

1. **首次运行**：建议使用完整安装脚本，可以了解详细的安装过程
2. **快速部署**：如果已经熟悉流程，可以使用简化脚本
3. **问题排查**：遇到问题时，先运行验证脚本检查环境
4. **PATH 配置**：如果 PATH 未生效，重新打开 PowerShell 窗口即可

---

**需要帮助？** 查看 [常见问题](#常见问题) 或提交 Issue。
