# OpenCode Demo 运行指南

## ✅ 环境配置完成

项目demo已经配置好并验证可以运行！

## 📋 验证结果

- ✅ **Bun 已安装**: 版本 1.3.6
- ✅ **项目依赖已安装**: node_modules 存在
- ✅ **项目结构完整**: packages/opencode 和 packages/app 存在

## 🚀 运行方式

### 1. TUI 界面（终端用户界面）

```powershell
# 在项目根目录运行
cd c:\Users\hzm\Documents\GitHub\opencode_hzm
$env:PATH += ";$HOME\.bun\bin"
bun dev
```

这会启动 OpenCode 的交互式终端界面，你可以：
- 直接输入问题或命令
- 使用 `tab` 键切换代理
- 使用 `ctrl+p` 打开命令面板

### 2. 运行命令模式

```powershell
# 运行特定命令
cd c:\Users\hzm\Documents\GitHub\opencode_hzm
$env:PATH += ";$HOME\.bun\bin"
bun dev run "帮我将当前的项目demo运行起来"
```

这会触发统一Agent执行流程，自动完成6个阶段的执行。

### 3. Web 应用界面

```powershell
# 启动 Web 开发服务器
cd c:\Users\hzm\Documents\GitHub\opencode_hzm
$env:PATH += ";$HOME\.bun\bin"
bun run --cwd packages/app dev
```

然后访问 http://localhost:5173

### 4. 服务器模式

```powershell
# 启动后端服务器
cd c:\Users\hzm\Documents\GitHub\opencode_hzm
$env:PATH += ";$HOME\.bun\bin"
bun dev serve --port 4096
```

然后访问 http://localhost:4096

## 📝 注意事项

1. **PATH 配置**: 每次打开新的 PowerShell 窗口时，需要将 Bun 添加到 PATH：
   ```powershell
   $env:PATH += ";$HOME\.bun\bin"
   ```

2. **永久配置 PATH** (可选): 如果希望永久配置，可以：
   - 打开系统环境变量设置
   - 将 `%USERPROFILE%\.bun\bin` 添加到 PATH
   - 或者添加到 PowerShell 配置文件

3. **工作目录**: 确保在项目根目录 `c:\Users\hzm\Documents\GitHub\opencode_hzm` 运行命令

## 🎯 快速开始

最简单的运行方式：

```powershell
cd c:\Users\hzm\Documents\GitHub\opencode_hzm
$env:PATH += ";$HOME\.bun\bin"
bun dev
```

然后就可以在 TUI 界面中输入问题或命令了！

## 📚 更多信息

详细使用指南请参考 `USAGE_GUIDE.md`
