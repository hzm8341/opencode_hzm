# OpenWork macOS DMG 构建指南

## 快速开始

### 方法一：使用构建脚本（推荐）

```bash
cd packages/openwork-desktop
pnpm build:dmg
```

构建完成后，DMG 文件将位于 `dist/OpenWork_<version>_macOS.dmg`

### 方法二：使用 Tauri CLI 直接构建

```bash
cd packages/openwork-desktop

# 先构建前端
pnpm build:web

# 构建 DMG
pnpm tauri build --bundles dmg
```

构建完成后，DMG 文件位于 `src-tauri/target/release/bundle/dmg/` 目录

## 前置要求

1. **macOS 系统**：必须在 macOS 上运行（DMG 只能在 macOS 上构建）
2. **Node.js 和 pnpm**：确保已安装
3. **Rust 工具链**：Tauri 需要 Rust
4. **Xcode Command Line Tools**：
   ```bash
   xcode-select --install
   ```

## 安装 DMG

1. 双击 DMG 文件打开
2. 将 `OpenWork.app` 拖拽到 `Applications` 文件夹
3. 在 Applications 中启动 OpenWork

## 故障排除

### 如果构建失败

1. **检查 Rust 是否安装**：
   ```bash
   rustc --version
   ```

2. **检查 Tauri CLI**：
   ```bash
   pnpm add -D @tauri-apps/cli
   ```

3. **清理并重新构建**：
   ```bash
   rm -rf src-tauri/target
   pnpm build:dmg
   ```

### 如果 DMG 无法打开

macOS 可能会阻止未签名的应用。解决方法：

1. 右键点击 DMG 文件
2. 选择"打开"
3. 在安全提示中点击"打开"

## 文件结构

构建完成后：
```
packages/openwork-desktop/
├── dist/
│   └── OpenWork_<version>_macOS.dmg  # 最终 DMG 文件
└── src-tauri/target/release/bundle/
    ├── dmg/
    │   └── OpenWork_<version>_<arch>.dmg
    └── macos/
        └── OpenWork.app
```
