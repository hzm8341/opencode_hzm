# 安装 Windows 构建工具

## 问题

构建失败，错误信息：
```
linker `link.exe` not found
the msvc targets depend on the msvc linker but `link.exe` was not found
```

## 解决方案

需要安装 **Visual Studio Build Tools** 或 **Visual Studio**（包含 C++ 工作负载）。

### 方法1: 安装 Visual Studio Build Tools（推荐，体积小）

1. **下载 Visual Studio Build Tools**
   - 访问: https://visualstudio.microsoft.com/downloads/
   - 滚动到底部，找到 "Tools for Visual Studio"
   - 下载 "Build Tools for Visual Studio 2022"

2. **安装必要的组件**
   运行安装程序后，选择：
   - ✅ **"C++ 生成工具"** 工作负载
   - 确保包含以下组件：
     - MSVC v143 - VS 2022 C++ x64/x86 生成工具
     - Windows 10/11 SDK（最新版本）
     - C++ CMake 工具（可选但推荐）

3. **安装完成后**
   - 重启 PowerShell 或命令提示符
   - 重新运行构建命令

### 方法2: 安装完整 Visual Studio（如果已安装可跳过）

1. **下载 Visual Studio Community**（免费）
   - 访问: https://visualstudio.microsoft.com/downloads/
   - 下载 "Visual Studio Community 2022"

2. **安装时选择工作负载**
   - ✅ **"使用 C++ 的桌面开发"**
   - 确保包含 Windows SDK

3. **安装完成后**
   - 重启 PowerShell
   - 重新运行构建命令

## 验证安装

安装完成后，验证 link.exe 是否可用：

```powershell
where.exe link.exe
```

如果找到路径，说明安装成功。

## 继续构建

安装完成后，回到项目目录运行：

```powershell
cd packages\desktop
bun run tauri build --config ./src-tauri/tauri.prod.conf.json
```

## 注意事项

- 首次构建 Rust 项目可能需要 10-30 分钟（下载和编译依赖）
- 确保网络连接正常
- 如果遇到权限问题，以管理员身份运行 PowerShell
