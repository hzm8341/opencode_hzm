# OpenCode Desktop 运行时文件要求

## 简短回答

**仅 `OpenCode.exe` 通常不足以运行**，还需要以下文件：

1. **Sidecar 二进制文件** (`opencode-cli.exe`)
2. **前端资源文件**（通常已嵌入到exe中，但需要确认）

## 详细说明

### 1. 主应用程序

- **文件**: `OpenCode.exe`
- **位置**: `src-tauri/target/release/OpenCode.exe`
- **大小**: ~21 MB
- **说明**: 主应用程序可执行文件

### 2. Sidecar 二进制文件（必需）

根据 `tauri.conf.json` 配置：
```json
"externalBin": ["sidecars/opencode-cli"]
```

应用需要 sidecar 二进制文件：
- **文件**: `opencode-cli.exe` 或 `opencode-cli-x86_64-pc-windows-msvc.exe`
- **位置**: 与 `OpenCode.exe` 同目录下的 `sidecars/` 子目录
- **大小**: ~142 MB
- **说明**: CLI 工具，桌面应用会调用它执行命令

**目录结构应该是：**
```
release/
├── OpenCode.exe
└── sidecars/
    └── opencode-cli-x86_64-pc-windows-msvc.exe
```

### 3. 前端资源文件

Tauri v2 **默认会将前端资源嵌入到 exe 中**，但需要确认：

- **构建时**: `dist/` 目录包含前端资源
- **运行时**: 资源通常已嵌入到 `OpenCode.exe` 中
- **验证**: 如果应用能正常显示界面，说明资源已嵌入

### 4. Windows 运行时依赖

Windows 上可能需要的 DLL：
- **Visual C++ Redistributable**: 通常系统已安装
- **WebView2 Runtime**: Windows 10/11 通常已内置

## 测试方法

### 方法1: 最小文件集测试

```powershell
# 创建测试目录
$testDir = "C:\opencode-test"
New-Item -ItemType Directory -Path $testDir -Force

# 复制主程序
Copy-Item "packages\desktop\src-tauri\target\release\OpenCode.exe" "$testDir\"

# 创建sidecars目录并复制CLI
New-Item -ItemType Directory -Path "$testDir\sidecars" -Force
Copy-Item "packages\desktop\src-tauri\target\release\opencode-cli.exe" "$testDir\sidecars\opencode-cli-x86_64-pc-windows-msvc.exe"

# 运行测试
cd $testDir
.\OpenCode.exe
```

### 方法2: 检查依赖

```powershell
# 检查exe的依赖
dumpbin /dependents OpenCode.exe

# 或者使用 PowerShell
(Get-Command OpenCode.exe).DLLs
```

## 推荐的分发方式

### 选项1: 使用 NSIS 安装包（推荐）

构建 NSIS 安装包会自动处理所有依赖：

```powershell
bun run tauri build --config ./src-tauri/tauri.prod.conf.json
```

安装包位置：`src-tauri/target/release/bundle/nsis/`

### 选项2: 便携式打包

手动打包所需文件：

```
OpenCode/
├── OpenCode.exe
└── sidecars/
    └── opencode-cli-x86_64-pc-windows-msvc.exe
```

### 选项3: 单文件分发（如果可能）

如果 Tauri 配置支持，可以尝试将所有内容打包到单个 exe，但这通常需要特殊配置。

## 验证清单

运行应用前，确保：

- [ ] `OpenCode.exe` 存在
- [ ] `sidecars/opencode-cli-x86_64-pc-windows-msvc.exe` 存在
- [ ] 两个文件在同一目录结构下
- [ ] Windows 10/11 系统（WebView2 支持）
- [ ] Visual C++ Redistributable 已安装（通常系统自带）

## 常见问题

### Q: 为什么需要 sidecar？

A: OpenCode Desktop 需要调用 CLI 工具执行命令，sidecar 是独立的可执行文件。

### Q: 前端资源在哪里？

A: Tauri v2 默认将前端资源嵌入到 exe 中，不需要单独的 dist 目录。

### Q: 可以只分发 OpenCode.exe 吗？

A: 不可以，至少需要 sidecar 二进制文件。缺少 sidecar 会导致应用无法执行 CLI 命令。

## 参考

- [Tauri External Binaries](https://v2.tauri.app/guides/building/external-binaries/)
- [Tauri Windows Prerequisites](https://v2.tauri.app/start/prerequisites/#windows)
