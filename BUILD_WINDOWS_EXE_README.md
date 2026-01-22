# OpenCode Desktop Windows EXE 打包指南

## 快速开始

### 1. 前置要求

在开始之前，请确保已安装以下工具：

- **Bun**: https://bun.sh
- **Rust**: https://rustup.rs (包含 Cargo)
- **Node.js**: https://nodejs.org
- **Windows Build Tools**: Visual Studio Build Tools 或 Visual Studio（包含 C++ 工作负载）

### 2. 运行打包脚本

在项目根目录打开 PowerShell，运行：

```powershell
# 生产版本（默认）
.\build-windows-exe_v1.0_20260122_AI.ps1

# 开发版本
.\build-windows-exe_v1.0_20260122_AI.ps1 -Dev

# 跳过依赖检查（如果已确认所有依赖已安装）
.\build-windows-exe_v1.0_20260122_AI.ps1 -SkipDeps
```

### 3. 输出文件位置

构建完成后，EXE 文件将位于：

```
packages/desktop/src-tauri/target/release/
```

主要文件：
- **应用程序**: `OpenCode.exe`（或类似名称）
- **NSIS 安装包**: `OpenCode_*.exe`（Setup 安装程序）

## 详细说明

### 脚本功能

打包脚本会自动执行以下步骤：

1. ✅ **依赖检查**: 验证 Bun、Rust、Node.js 是否已安装
2. ✅ **Rust 工具链**: 检查并安装 Windows 目标平台（x86_64-pc-windows-msvc）
3. ✅ **项目依赖**: 安装所有 npm/bun 依赖
4. ✅ **Sidecar 准备**: 准备或构建 opencode CLI 二进制文件
5. ✅ **Tauri 构建**: 构建 Windows 可执行文件

### 配置文件

脚本支持两种构建配置：

- **生产配置** (`tauri.prod.conf.json`): 默认，用于发布版本
- **开发配置** (`tauri.conf.json`): 使用 `-Dev` 参数

### 常见问题

#### 1. Rust 工具链未安装

```powershell
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 或使用 winget (Windows)
winget install Rustlang.Rustup
```

#### 2. Windows 构建工具缺失

安装 Visual Studio Build Tools：
- 下载: https://visualstudio.microsoft.com/downloads/
- 选择 "C++ 构建工具" 工作负载

#### 3. Sidecar 二进制文件缺失

脚本会自动尝试从本地构建 opencode CLI。如果失败，可以：

1. 手动构建 CLI：
```powershell
cd packages/opencode
bun run build
```

2. 或从 GitHub Releases 下载预构建的二进制文件

#### 4. 构建时间较长

首次构建需要下载和编译 Rust 依赖，可能需要 10-30 分钟。后续构建会更快。

### 手动构建（不使用脚本）

如果脚本无法正常工作，可以手动执行构建步骤：

```powershell
# 1. 安装依赖
bun install

# 2. 切换到 desktop 目录
cd packages/desktop

# 3. 准备 sidecar（可选）
bun ./scripts/prepare.ts

# 4. 构建应用
bun run tauri build --config ./src-tauri/tauri.prod.conf.json
```

## 技术细节

### Tauri 配置

- **框架**: Tauri v2
- **前端**: Vite + SolidJS
- **后端**: Rust
- **打包格式**: NSIS (Windows Installer)

### 构建目标

- **平台**: Windows x64
- **架构**: x86_64-pc-windows-msvc
- **输出**: NSIS 安装包 + 便携式 EXE

## 相关文档

- [Tauri 官方文档](https://v2.tauri.app/)
- [Tauri Windows 前置要求](https://v2.tauri.app/start/prerequisites/#windows)
- [OpenCode Desktop README](packages/desktop/README.md)
