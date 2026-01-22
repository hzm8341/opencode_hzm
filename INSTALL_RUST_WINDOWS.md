# Windows 安装 Rust 指南

## 快速安装

### 方法1: 使用 rustup（推荐）

1. 访问 https://rustup.rs/
2. 下载并运行 `rustup-init.exe`
3. 按照提示完成安装（默认选项即可）
4. 重启 PowerShell 或命令提示符

### 方法2: 使用 winget（Windows 11/10）

```powershell
winget install Rustlang.Rustup
```

安装完成后，重启 PowerShell。

### 方法3: 使用 Chocolatey

```powershell
choco install rust
```

## 验证安装

安装完成后，重启 PowerShell，然后运行：

```powershell
rustc --version
cargo --version
rustup --version
```

如果命令可以正常运行，说明安装成功。

## 安装 Windows 构建目标

安装 Rust 后，需要添加 Windows 目标平台：

```powershell
rustup target add x86_64-pc-windows-msvc
```

## 安装 Windows Build Tools

Tauri 还需要 Windows 构建工具：

1. 下载 Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
2. 选择 "C++ 构建工具" 工作负载
3. 确保包含以下组件：
   - MSVC v143 - VS 2022 C++ x64/x86 构建工具
   - Windows 10/11 SDK

## 完成安装后

安装完成后，回到项目目录运行：

```powershell
cd packages\desktop
bun run tauri build --config ./src-tauri/tauri.prod.conf.json
```
