# OpenWork Desktop 集成说明

**版本**: v1.0  
**日期**: 2025-01-26  
**AI模型**: Claude-4

---

## 概述

本文档说明如何将 OpenWork Desktop 功能集成到当前项目中，并确保全局配置可以使用。

## OpenWork Desktop 简介

OpenWork Desktop 是一个基于 Tauri 的桌面应用，为 OpenCode 提供图形界面。它运行 OpenCode 作为后端引擎，提供：

- **Workspace 管理**: 选择和管理工作空间
- **Session 管理**: 创建和管理会话
- **实时更新**: SSE 事件订阅
- **权限管理**: 权限请求和响应
- **Templates**: 保存和重用工作流模板
- **Skills 管理**: 安装和管理 Skills
- **Plugins 管理**: 管理 OpenCode 插件（项目级和全局级）

## 已完成的集成

### 1. 修改配置读取逻辑

**文件**: `packages/openwork-desktop/src-tauri/src/config.rs`

已修改 `resolve_opencode_config_path` 函数，支持优先读取 `opencode.jsonc` 文件（与 OpenCode CLI 行为一致）：

```rust
pub fn resolve_opencode_config_path(scope: &str, project_dir: &str) -> Result<PathBuf, String> {
  match scope {
    "project" => {
      // Try jsonc first, then json (matching OpenCode's behavior)
      let jsonc_path = PathBuf::from(project_dir).join("opencode.jsonc");
      if jsonc_path.exists() {
        return Ok(jsonc_path);
      }
      Ok(PathBuf::from(project_dir).join("opencode.json"))
    }
    "global" => {
      let config_dir = base.join("opencode");
      // Try jsonc first, then json (matching OpenCode's behavior)
      let jsonc_path = config_dir.join("opencode.jsonc");
      if jsonc_path.exists() {
        return Ok(jsonc_path);
      }
      Ok(config_dir.join("opencode.json"))
    }
    // ...
  }
}
```

### 2. 全局配置文件

**全局配置位置**: `~/.config/opencode/opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["oh-my-opencode"],
  "provider": {
    "opencode": {
      "options": {}
    }
  }
}
```

**注意**: OpenWork Desktop 会优先读取 `opencode.jsonc`，如果不存在则读取 `opencode.json`。为了兼容性，两个文件都已创建。

### 3. 项目配置

**项目配置位置**: `.opencode/opencode.jsonc`

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  // 插件通过 .opencode/plugin/ 目录自动加载，无需在配置中指定
  "instructions": ["STYLE_GUIDE.md"],
  "provider": {
    "opencode": {
      "options": {}
    }
  },
  // ... 其他配置
}
```

## 使用方法

### 启动 OpenWork Desktop

```bash
cd /Users/minghu/Downloads/opencode_hzm/packages/openwork-desktop
pnpm install
pnpm dev
```

### 在 OpenWork Desktop 中管理插件

1. **打开 OpenWork Desktop**
2. **选择工作空间**（或创建新工作空间）
3. **进入 Plugins 标签页**
4. **切换 Scope**:
   - **Project**: 管理项目级插件（`.opencode/opencode.jsonc`）
   - **Global**: 管理全局插件（`~/.config/opencode/opencode.jsonc`）

### 全局配置的使用

OpenWork Desktop 支持两种配置范围：

1. **Project Scope**: 项目级配置，存储在项目目录的 `opencode.json` 或 `opencode.jsonc`
2. **Global Scope**: 全局配置，存储在 `~/.config/opencode/opencode.json` 或 `~/.config/opencode/opencode.jsonc`

**配置优先级**:
- OpenCode CLI: 项目配置 > 全局配置
- OpenWork Desktop: 可以在 UI 中切换查看/编辑项目或全局配置

## 配置同步

### 当前配置状态

**全局配置** (`~/.config/opencode/`):
- ✅ `opencode.jsonc` - 包含 `oh-my-opencode` 插件
- ✅ `opencode.json` - 包含 `oh-my-opencode` 插件（OpenWork Desktop 兼容）
- ✅ `oh-my-opencode.json` - Hook 配置（`unified-flow` 已启用）

**项目配置** (`.opencode/`):
- ✅ `opencode.jsonc` - 项目配置
- ✅ `plugin/oh-my-opencode.ts` - 本地插件符号链接（相对路径）

### 配置同步建议

为了保持配置一致，建议：

1. **主要使用 `opencode.jsonc`**: OpenCode CLI 和 OpenWork Desktop 都支持
2. **保持 `opencode.json` 同步**: 如果 OpenWork Desktop 修改了 `opencode.json`，确保 `opencode.jsonc` 也更新
3. **使用符号链接**: 项目级插件使用符号链接，确保可移植性

## 功能验证

### 验证 OpenWork Desktop 可以读取全局配置

1. 启动 OpenWork Desktop
2. 进入 Plugins 标签页
3. 切换到 "Global" scope
4. 应该能看到 `oh-my-opencode` 插件已安装

### 验证统一流程功能

在 OpenWork Desktop 中：
1. 选择一个工作空间
2. 创建一个新会话
3. 输入: "帮我将当前的项目demo运行起来"
4. 应该触发统一流程的6阶段执行

## 架构说明

### OpenWork Desktop 架构

```
OpenWork Desktop (Tauri App)
├── Frontend (SolidJS)
│   ├── PluginsView - 插件管理界面
│   ├── SessionView - 会话管理界面
│   └── DashboardView - 主界面
├── Backend (Rust)
│   ├── config.rs - 配置读取/写入
│   ├── engine/spawn.rs - OpenCode 引擎启动
│   └── commands/ - Tauri 命令
└── OpenCode Integration
    ├── 通过 `opencode serve` 启动服务器
    └── 使用 `@opencode-ai/sdk/v2/client` 连接
```

### 配置读取流程

1. **OpenWork Desktop 启动**
2. **用户选择工作空间**
3. **读取配置**:
   - 项目配置: `<workspace>/opencode.jsonc` 或 `<workspace>/opencode.json`
   - 全局配置: `~/.config/opencode/opencode.jsonc` 或 `~/.config/opencode/opencode.json`
4. **启动 OpenCode 服务器**: `opencode serve --hostname 127.0.0.1 --port <port>`
5. **UI 连接服务器**: 使用 SDK 连接并显示插件列表

## 故障排查

### 问题1: OpenWork Desktop 无法读取全局配置

**症状**: 在 Global scope 中看不到插件

**解决方案**:
1. 检查配置文件是否存在：
   ```bash
   ls -la ~/.config/opencode/opencode.json*
   ```

2. 检查文件内容是否正确：
   ```bash
   cat ~/.config/opencode/opencode.json
   ```

3. 确保文件格式正确（JSON 或 JSONC）

### 问题2: 插件未显示在 OpenWork Desktop

**症状**: 配置中有插件但 OpenWork Desktop 不显示

**解决方案**:
1. 点击 "Refresh" 按钮刷新插件列表
2. 检查插件名称是否正确（区分大小写）
3. 查看 OpenWork Desktop 的控制台日志

### 问题3: 统一流程未触发

**症状**: 在 OpenWork Desktop 中输入触发关键词但未触发统一流程

**解决方案**:
1. 确认 `oh-my-opencode` 插件已安装
2. 检查 `oh-my-opencode.json` 中 `unified-flow` hook 已启用
3. 查看 OpenCode 服务器日志

## 相关文档

- **OpenWork Desktop README**: `packages/openwork-desktop/README.md`
- **统一Agent功能启用说明**: `docs/统一Agent功能启用说明_v1.0_20250126_AI.md`
- **相对路径插件配置说明**: `docs/相对路径插件配置说明_v1.0_20250126_AI.md`
- **USAGE_GUIDE.md**: 完整使用指南

---

**最后更新**: 2025-01-26  
**维护者**: AI Assistant (Claude-4)
