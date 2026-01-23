# OpenCode 使用指南

**版本**: v1.5  
**日期**: 2025-01-07  
**最后更新**: 2026-01-16  
**合并说明**: 已合并 USAGE_GUIDE_temp.md 的内容

---

## ⚠️ 重要提示

**计划优先原则**

在开始任何新任务前，**必须先使用 `plan` agent 制定详细计划并保存为文档**，然后再使用 `build` agent 逐步实施。这是强制要求，不是可选项。

**为什么？**

- ✅ 提高代码质量和可维护性
- ✅ 减少返工和错误
- ✅ 便于追踪进度和问题
- ✅ 知识沉淀和团队协作

👉 **快速开始**: 跳转到 [工作流程最佳实践](#工作流程最佳实践) 查看详细步骤。

---

## 目录

- [重要提示](#️-重要提示)
- [项目简介](#项目简介)
- [环境要求](#环境要求)
- [安装步骤](#安装步骤)
- [配置说明](#配置说明)
- [构建说明](#构建说明)
- [开发指南](#开发指南)
- [常见问题](#常见问题)
- [相关链接](#相关链接)
- [更新日志](#更新日志)
- [许可证](#许可证)
- [功能使用说明](#功能使用说明)
  - [使用方法](#使用方法)
  - [Oh My OpenCode 插件使用指南](#oh-my-opencode-插件使用指南)
  - [统一Agent执行流程使用指南](#统一agent执行流程使用指南)
  - [Claude SDK Adapter 使用指南](#claude-sdk-adapter-使用指南)
  - [Skills 使用指南](#skills-使用指南)
  - [快速参考](#快速参考)

---

## 项目简介

OpenCode 是一个开源的 AI 编程助手工具，支持多种 AI 模型提供商，提供终端用户界面（TUI）和 Web 界面。

### 主要特性

- 🤖 **多模型支持**
- 🖥️ **终端界面**
- 🌐 **Web 界面**
- 🔌 **插件系统**
- 📝 **LSP 支持**
- 🔐 **多代理系统**

---

## 环境要求

### 必需环境

#### 1. Bun 运行时

- **版本要求**
- **安装方法**

```bash
# 使用官方安装脚本
curl -fsSL https://bun.sh/install | bash

# 验证安装
bun --version
```

#### 2. Node.js（可选，用于某些工具）

- **推荐版本**
- **注意**

#### 3. 系统要求

- **操作系统**
  - Linux (推荐
  - macOS
  - Windows (通过 WSL 或原生支持
- **内存**
- **磁盘空间**

### 可选依赖

- **Rust 工具链**
- **Python 3**
- **Git**

---

## 安装步骤

### 方式一：从源码安装

#### 1. 克隆仓库

```bash
git clone https://github.com/anomalyco/opencode.git
cd opencode
```

#### 2. 安装依赖

```bash
# 确保 Bun 已安装
curl -fsSL https://bun.sh/install | bash

# 将 Bun 添加到 PATH（如果尚未添加）/ Add Bun to PATH if not already added
export PATH="$HOME/.bun/bin:$PATH"

# 安装项目依赖
bun install
```

#### 3. 验证安装

```bash
# 检查版本
bun dev --version

# 查看帮助信息
bun dev --help
```

### 方式二：使用包管理器安装

#### npm / yarn / pnpm

```bash
npm i -g opencode-ai@latest
# 或 / or
yarn global add opencode-ai@latest
# 或 / or
pnpm add -g opencode-ai@latest
```

#### Homebrew (macOS / Linux)

```bash
brew install opencode
```

#### Scoop (Windows)

```bash
scoop bucket add extras
scoop install extras/opencode
```

#### Chocolatey (Windows)

```bash
choco install opencode
```

#### Arch Linux

```bash
paru -S opencode-bin
```

#### 一键安装脚本

```bash
curl -fsSL https://opencode.ai/install | bash
```

### 方式三：使用 DEB 包安装（Linux）

#### 1. 获取 DEB 包

DEB 包可以从以下位置获取：

- GitHub Releases
- 项目构建输出：`packages/opencode/dist/opencode_<version>_<arch>.deb`

#### 2. 安装 DEB 包

```bash
# 安装 DEB 包
sudo dpkg -i opencode_1.1.4_amd64.deb

# 如果遇到依赖问题，运行：
sudo apt-get install -f

# 验证安装
opencode --version
```

#### 3. 验证安装

```bash
# 检查包状态
dpkg -l | grep opencode

# 查看安装的文件
dpkg -L opencode

# 测试命令
opencode --version
opencode --help
```

#### 4. 卸载

```bash
# 卸载 OpenCode
sudo dpkg -r opencode

# 完全卸载（包括配置文件）
sudo dpkg -P opencode
```

#### 5. 测试安装脚本

项目提供了自动化测试脚本：

```bash
cd packages/opencode
./test-deb-install.sh
```

该脚本会：

- 检查 DEB 包是否存在
- 显示包信息
- 询问是否安装
- 自动安装并测试

#### DEB 包信息

- **安装位置**: `/usr/bin/opencode`
- **文档位置**: `/usr/share/doc/opencode/`
- **依赖**: `libc6 (>= 2.17)`
- **架构支持**: amd64, arm64

### 安装目录配置

安装脚本按以下优先级选择安装路径：

1. `$OPENCODE_INSTALL_DIR` - 自定义安装目录
2. `$XDG_BIN_DIR` - XDG 规范路径
3. `$HOME/bin` - 标准用户二进制目录
4. `$HOME/.opencode/bin` - 默认回退路径

**示例**

```bash
# 自定义安装目录
OPENCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://opencode.ai/install | bash

# 使用 XDG 目录
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://opencode.ai/install | bash
```

---

## 配置说明

### 配置文件位置

OpenCode 支持多级配置文件，按以下顺序加载：

1. 全局配置 config: `~/.opencode/opencode.json` 或 `~/.opencode
2. 项目配置 config: `./opencode.json` 或 `.
3. 环境变量
4. 命令行参数

### 基本配置示例

创建配置文件 `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-20250514",
  "default_agent": "build",
  "provider": {
    "anthropic": {
      "models": {},
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### 环境变量配置

#### API 密钥配置

设置所需提供商的 API 密钥：

```bash
export ANTHROPIC_API_KEY="your-api-key-here"

export OPENAI_API_KEY="your-api-key-here"

export GOOGLE_API_KEY="your-api-key-here"

# 其他提供商
# 查看文档获取完整列表
```

#### 其他环境变量

```bash
# 自定义模型
export OPENCODE_MODEL="anthropic/claude-sonnet-4-20250514"

# 日志级别
export OPENCODE_LOG_LEVEL="DEBUG"

# 自定义配置路径
export OPENCODE_CONFIG="/path/to/config.json"
```

### 全局配置 OpenCode 命令

**问题**

**Problem**: By default, `bun dev` can only be used in the OpenCode project directory. To use OpenCode from any directory, you need to configure a global command.

#### 方法1：创建别名（推荐）

在 `~/.bashrc` 或 `~

```bash
# OpenCode 便捷命令
function opencode-dev() {
    cd /path/to/opencode && bun dev "$@"
}
```

**注意** / **Note**: 将 `/path/to/opencode` 替换为你的 OpenCode 安装路径（例如：`/media/hzm

**Note**: Replace `/path/to/opencode` with your OpenCode installation path (e.g., `/media/hzm/Data/github/opencode`).

**使用方法**

```bash
# 重新加载配置
source ~/.bashrc  # 或 source ~/.zshrc

# 在任意目录使用
cd /path/to/your/project
opencode-dev run --agent plan --model opencode/gpt-5-nano "任务描述"
```

#### 方法2：创建全局脚本

创建 `/usr/local/bin/opencode-dev` 或 `~/bin

```bash
#!/bin/bash
cd /path/to/opencode
exec bun dev "$@"
```

然后：

```bash
chmod +x ~/bin/opencode-dev
export PATH="$HOME/bin:$PATH"

# 永久添加到 PATH（添加到 ~/.bashrc）
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
```

**注意** / **Note**: 将 `/path/to

#### 方法3：使用符号链接

```bash
# 创建包装脚本（推荐）/ Create wrapper script (Recommended)
mkdir -p ~/bin
cat > ~/bin/opencode-dev << 'EOF'
#!/bin/bash
cd /path/to/opencode
bun dev "$@"
EOF
chmod +x ~/bin/opencode-dev

# 确保 ~/bin 在 PATH 中 / Ensure ~/bin is in PATH
export PATH="$HOME/bin:$PATH"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
```

**注意** / **Note**: 将 `/path/to

#### 验证配置

```bash
# 检查命令是否可用
type opencode-dev

# 应该看到
# opencode-dev is a function
# 或 / or
# opencode-dev is /path/to/opencode-dev
```

#### 故障排除

**问题1：`source ~/.bashrc` 报语法错误**

```bash
# 检查语法
bash -n ~/.bashrc

# 如果语法正确但没有生效，尝试：
# 1. 打开新终端窗口
# 2. 或使用完整路径
cd /path/to/opencode
bun dev run --agent plan --model opencode/gpt-5-nano "任务描述" /path/to/project
```

**问题2：命令找不到**

```bash
# 检查 PATH
echo $PATH

# 确保 ~/bin 在 PATH 中 / Ensure ~/bin is in PATH
export PATH="$HOME/bin:$PATH"

# 添加到 ~/.bashrc 永久生效 / Add to ~/.bashrc for permanent
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
```

**问题3：权限错误**

```bash
# 添加执行权限
chmod +x ~/bin/opencode-dev
```

**问题4：函数定义不生效**

```bash
# 检查是否有同名别名冲突
alias | grep opencode-dev

# 如果有冲突，取消别名
unalias opencode-dev 2>/dev/null

# 重新定义函数
function opencode-dev() {
    cd /path/to/opencode && bun dev "$@"
}
```

#### 完整配置示例

**对于 bash 用户**

```bash
# 添加到 ~/.bashrc
cat >> ~/.bashrc << 'EOF'

# OpenCode 全局命令配置
function opencode-dev() {
    cd /path/to/opencode && bun dev "$@"
}
EOF

# 重新加载
source ~/.bashrc

# 验证
type opencode-dev
```

**注意** / **Note**: 将 `/path/to

**对于 zsh 用户**

```bash
# 添加到 ~/.zshrc
cat >> ~/.zshrc << 'EOF'

# OpenCode 全局命令配置
function opencode-dev() {
    cd /path/to/opencode && bun dev "$@"
}
EOF

# 重新加载
source ~/.zshrc

# 验证
type opencode-dev
```

**注意** / **Note**: 将 `/path/to

### 配置文件变量替换

#### 环境变量替换

使用 `{env:VARIABLE_NAME}` 引用环境变量：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "{env:OPENCODE_MODEL}",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

#### 文件内容替换

使用 `{file:path/to

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{file:/path/to/api-key.txt}"
      }
    }
  }
}
```

### 代理配置

OpenCode 内置两个主要代理：

- **build** - 默认代理，具有完整访问权限，用于开发工作
- **plan** - 只读代理，用于分析和代码探索
  - 默认拒绝文件编辑
  - 运行 bash 命令前会请求权限
  - 适合探索不熟悉的代码库或规划更改

还有一个 **general** 子代理用于复杂搜索和多步骤任务，可通过 `@general` 在消息中调用。

### 提供商配置

#### 启用/禁用提供商

```json
{
  "$schema": "https://opencode.ai/config.json",
  "enabled_providers": ["anthropic", "openai"],
  "disabled_providers": ["gemini"]
}
```

**注意**

---

## 构建说明

### 开发构建

#### 运行开发服务器

```bash
# 从项目根目录运行
bun install
bun dev
```

#### 运行 Web 应用

```bash
# 启动 Web 开发服务器
bun run --cwd packages/app dev

# 访问 http://localhost:5173
```

#### 运行桌面应用

```bash
# 运行原生桌面应用
bun run --cwd packages/desktop tauri dev

# 仅运行 Web 开发服务器（无原生外壳）/ Only web dev server (no native shell)
bun run --cwd packages/desktop dev
```

### 生产构建

#### 构建独立可执行文件

```bash
# 构建当前平台的可执行文件
./packages/opencode/script/build.ts --single

# 运行构建的可执行文件
./packages/opencode/dist/opencode-<platform>/bin/opencode
```

**平台示例**

- Linux x64: `opencode-linux-x64`
- Linux ARM64: `opencode-linux-arm64`
- macOS ARM64: `opencode-darwin-arm64`
- macOS x64: `opencode-darwin-x64`
- Windows x64: `opencode-windows-x64`

#### 构建所有平台

```bash
# 构建所有目标平台
./packages/opencode/script/build.ts
```

#### 打包为 DEB/DMG

##### Linux - 打包为 DEB

```bash
cd packages/opencode

# 1. 先构建可执行文件
bun run script/build.ts --single

# 2. 打包为 DEB（自动检测架构）
bun run script/package.ts --format deb

# 或指定架构
bun run script/package.ts --format deb --arch amd64
bun run script/package.ts --format deb --arch arm64

# 或使用快捷命令
bun run package:deb
```

**输出位置**: `packages/opencode/dist/opencode_<version>_<arch>.deb`

**安装测试**:

```bash
# 安装
sudo dpkg -i dist/opencode_1.1.4_amd64.deb

# 测试
opencode --version

# 卸载
sudo dpkg -r opencode
```

##### macOS - 打包为 DMG

```bash
cd packages/opencode

# 1. 先构建可执行文件
bun run script/build.ts --single

# 2. 打包为 DMG（自动检测架构）
bun run script/package.ts --format dmg

# 或指定架构
bun run script/package.ts --format dmg --arch arm64
bun run script/package.ts --format dmg --arch x64

# 或使用快捷命令
bun run package:dmg
```

**输出位置**: `packages/opencode/dist/opencode_<version>_<arch>.dmg`

**安装测试**:

```bash
# 打开 DMG
open dist/opencode_1.1.4_arm64.dmg

# 复制到系统路径
sudo cp /Volumes/OpenCode/opencode /usr/local/bin/

# 测试
opencode --version
```

**详细文档**: 参考 `docs/打包使用指南_v1.0_20260126_AI.md`

#### 构建桌面应用

```bash
# 构建生产版本和原生应用包
bun run --cwd packages/desktop tauri build
```

这将自动运行 `bun run --cwd packages

### 构建要求

#### 桌面应用构建要求

构建桌面应用需要额外的 Tauri 依赖：

- **Rust 工具链**
- **平台特定库**
  - Linux: `libwebkit2gtk-4.0-dev`, `libssl-dev`, `libayatana-appindicator3-dev`
  - macOS: Xcode Command Line Tools
  - Windows: Microsoft Visual Studio C++ Build Tools

**参考** / **Reference**: [Tauri 先决条件] / [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites

---

## 开发指南

### 项目结构

```
opencode/
├── packages/
│   ├── opencode/          # 核心业务逻辑和服务器 / Core business logic & server
│   │   ├── src/
│   │   │   ├── cli/       # CLI 命令 / CLI commands
│   │   │   │   └── cmd/
│   │   │   │       └── tui/  # TUI 代码（SolidJS + opentui）/ TUI code (SolidJS + opentui)
│   │   │   ├── agent/     # 代理系统 / Agent system
│   │   │   ├── provider/  # 模型提供商 / Model providers
│   │   │   ├── server/    # 服务器代码 / Server code
│   │   │   └── ...
│   │   └── script/        # 构建脚本 / Build scripts
│   ├── app/               # 共享 Web UI 组件（SolidJS）/ Shared web UI components (SolidJS)
│   ├── desktop/           # 原生桌面应用（Tauri）/ Native desktop app (Tauri)
│   ├── plugin/            # @opencode-ai/plugin 源码 / Source for @opencode-ai/plugin
│   ├── sdk/               # SDK 代码 / SDK code
│   └── ...
├── package.json           # 根 package.json / Root package.json
├── bun.lock              # Bun 锁文件 / Bun lockfile
└── turbo.json            # Turbo 配置 / Turbo config
```

### 开发工作流

#### 0. 计划优先原则

**在开始任何开发任务前，必须遵循以下流程**

1. **制定计划** / **Create Plan** (使用 `plan` agent + `opencode
2. **保存计划文档** / **Save Plan Document** (到 `docs
3. **审查计划**
4. **开始实施** / **Start Implementation** (使用 `build` agent + `opencode
5. **验证和测试**
6. **更新文档**

**完整示例**

```bash
# === 阶段1：计划制定
# 使用plan agent和text-processing skill制定计划
bun dev run --agent plan --model opencode/gpt-5-nano \
  "请制定详细计划：将OCS2 MPC算法封装成ROS2节点。\
  计划需要包含：\
  1. 代码结构分析\
  2. ROS2节点设计\
  3. 接口定义\
  4. 实现步骤（分阶段）\
  5. 测试方案\
  6. 风险评估\
  请将计划保存到docs/ocs2_mpc_ros2_node_plan_v1.0_\$(date +%Y%m%d)_AI.md，使用中英文对照格式。"

# === 阶段2：计划审查
# 查看生成的计划文档，确认是否合理
cat docs/ocs2_mpc_ros2_node_plan_v1.0_*.md

# === 阶段3：开始实施
# 根据计划文档，使用build agent和code-generation skill开始实施
bun dev run --agent build --model opencode/grok-code \
  "根据计划文档docs/ocs2_mpc_ros2_node_plan_v1.0_日期_AI.md，\
  开始实施阶段B（ROS2包和接口原型）。\
  请使用code-generation skill来指导代码实现。"

# === 阶段4：编译验证
# 如果有编译错误，让OpenCode自动修复
bun dev run --agent build --model opencode/grok-code \
  "请编译/media/hzm/Data/github/ocs2/ocs2_mpc_ros2_node包，\
  并自动修复所有编译错误。"

# === 阶段5：文档更新
# 更新实现状态文档
bun dev run --agent plan --model opencode/gpt-5-nano \
  "请更新docs/ocs2_mpc_ros2_node_implementation_status_v1.0_日期_AI.md，\
  记录完成的工作、遇到的问题和解决方案。"
```

#### 1. 设置开发环境

```bash
# 克隆仓库
git clone https://github.com/anomalyco/opencode.git
cd opencode

# 安装依赖
bun install
```

#### 2. 运行开发服务器

**重要**

**Important**: You can run OpenCode from any directory, you don't need to be in the OpenCode source directory.

```bash
# 方式1：在项目目录中运行（推荐）/ Method 1: Run in project directory (Recommended)
cd /path/to/your/project
bun dev

# 方式2：从OpenCode目录指定项目路径
cd /media/hzm/Data/github/opencode
bun dev /path/to/test-project

# 方式3：在OpenCode源码目录运行（用于开发OpenCode本身）/ Method 3: Run in OpenCode source directory (for developing OpenCode itself)
cd /media/hzm/Data/github/opencode/packages/opencode
bun dev

# 方式4：在项目根目录运行
cd /path/to/your/project
bun dev .
```

**实际使用示例**

```bash
# 示例1：在OCS2项目中使用
cd /media/hzm/Data/github/ocs2
bun dev run --agent plan --model opencode/gpt-5-nano "制定MPC ROS2节点计划"

# 示例2：在ROS2工作空间中使用
cd ~/ros2_ws/src/my_package
bun dev run --agent build --model opencode/grok-code "实现ROS2节点"

# 示例3：从OpenCode目录操作其他项目
cd /media/hzm/Data/github/opencode
bun dev run --agent plan --model opencode/gpt-5-nano "制定计划" /media/hzm/Data/github/my_other_project
```

#### 3. 运行 Web 应用

```bash
# 启动 Web 开发服务器
bun run --cwd packages/app dev

# 访问 http://localhost:5173
```

#### 4. 运行桌面应用

```bash
# 运行原生桌面应用
bun run --cwd packages/desktop tauri dev
```

### 代码生成

如果修改了 API 或 SDK（例如 `packages/opencode/src/server

```bash
./script/generate.ts
```

### 调试设置

#### 手动调试

最可靠的调试方法是手动在终端运行：

```bash
bun run --inspect=ws://localhost:6499/ dev ...
```

然后通过该 URL 附加调试器。

#### 注意事项

- 如果要在 OpenCode TUI 中运行并触发服务器代码中的断点，可能需要运行 `bun dev spawn` 而不是通常的 `bun dev`。这是因为 `bun dev` 在 worker 线程中运行服务器，断点可能无法在那里工作。
- 如果 `spawn` 不工作，可以分别调试服务器：
  - 调试服务器: `bun run --inspect=ws://localhost:6499/ ./src
  - 附加 TUI: `opencode attach http:/
  - 调试 TUI: `bun run --inspect=ws://localhost:6499/ --conditions=browser ./src

#### VSCode 设置

如果使用 VSCode，可以使用示例配置：

- `.vscode/settings.example.json`
- `.vscode/launch.example.json`

### 类型检查

```bash
# 运行类型检查
bun run typecheck
```

### 代码风格

请遵循 [风格指南]

#### 风格偏好

- **函数**
- **解构**
- **控制流**
- **错误处理** / **Error handling**: 尽可能使用 `.catch(...)` 而不是 `try`
- **类型**
- **变量**
- **命名**
- **运行时 API**

---

## 常见问题

### 工作流程问题

#### Q: 为什么必须先在制定计划？

**A**: 计划优先的工作流程有以下优势：

**A**: The planning-first workflow has the following advantages:

1. **提高代码质量**
2. **减少返工**
3. **便于追踪**
4. **知识沉淀**
5. **团队协作**

#### Q: 计划文档应该包含哪些内容？

**A**: 计划文档应该包含：

**A**: The plan document should include:

- **任务分析**
- **技术方案**
- **实现步骤**
- **接口定义**
- **测试方案**
- **风险评估**

#### Q: 如果计划需要修改怎么办？

**A**: 计划是活的文档，可以随时更新：

**A**: Plans are living documents and can be updated anytime:

```bash
# 更新计划文档
bun dev run --agent plan --model opencode/gpt-5-nano \
  "根据实施过程中遇到的问题，更新docs/任务名_plan_v1.0_日期_AI.md。\
  添加新的发现和调整后的实现步骤。"
```

**版本管理**

- 重大变更创建新版本：`任务名_plan_v1.1_日期_AI.md`
- 在文档中记录变更原因

#### Q: 如何确保OpenCode遵循计划？

**A**: 在每次实施命令中明确引用计划文档：

**A**: Explicitly reference the plan document in each implementation command:

```bash
# ✅ 正确：明确引用计划文档
bun dev run --agent build --model opencode/grok-code \
  "根据计划文档docs/任务名_plan_v1.0_日期_AI.md，实施第X阶段..."

# ❌ 错误：没有引用计划
bun dev run --agent build "实现某个功能"
```

### 安装问题

#### Q: Bun 安装失败怎么办？

**A**: 尝试以下方法：

**A**: Try the following:

1. 检查网络连接
2. 使用代理（如需要）
3. 手动下载 Bun 二进制文件
4. 检查系统权限

#### Q: DEB 包安装失败怎么办？

**A**: 常见问题和解决方案：

**A**: Common issues and solutions:

1. **依赖问题**

   ```bash
   # 如果遇到依赖错误
   sudo apt-get install -f
   # 然后重新安装
   sudo dpkg -i opencode_*.deb
   ```

2. **架构不匹配**

   ```bash
   # 检查系统架构
   uname -m
   # 确保使用匹配的 DEB 包（amd64 或 arm64）
   ```

3. **权限问题**

   ```bash
   # 确保使用 sudo 安装
   sudo dpkg -i opencode_*.deb
   ```

4. **包损坏**
   ```bash
   # 验证包完整性
   dpkg-deb -I opencode_*.deb
   # 重新下载或重新打包
   ```

#### Q: 依赖安装失败怎么办？

**A**: 尝试以下方法：

**A**: Try the following:

1. 清理缓存并重新安装
   ```bash
   rm -rf node_modules bun.lock
   bun install
   ```
2. 检查 Bun 版本（需要 1.3+）
3. 检查磁盘空间

### 运行问题

#### Q: 运行时出现段错误（Segmentation fault）怎么办？

**A**: 这可能是 Bun 二进制兼容性问题。尝试：

**A**: This might be a Bun binary compatibility issue. Try:

1. 更新 Bun 到最新版本
2. 检查系统架构是否匹配
3. 使用 `--single` 标志重新构建

#### Q: Node.js 版本过旧导致的问题

**A**: OpenCode 主要使用 Bun，但某些工具可能需要较新的 Node.js。建议：

**A**: OpenCode primarily uses Bun, but some tools may require newer Node.js. Recommended:

1. 升级 Node.js 到 16+ 版本
2. 或者直接使用 Bun 运行所有命令

#### Q: 如何查看日志？

**A**: 使用以下选项：

**A**: Use the following options:

```bash
# 打印日志到 stderr
bun dev --print-logs

# 设置日志级别
bun dev --log-level DEBUG
```

### 全局配置问题

#### Q: 如何配置全局 OpenCode 命令？

**A**: 有几种方法：

**A**: There are several methods:

1. **创建别名（最简单）**

   ```bash
   # 添加到 ~/.bashrc
   echo 'function opencode-dev() { cd /path/to/opencode && bun dev "$@"; }' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **创建全局脚本**

   ```bash
   cat > ~/bin/opencode-dev << 'EOF'
   #!/bin/bash
   cd /path/to/opencode
   exec bun dev "$@"
   EOF
   chmod +x ~/bin/opencode-dev
   ```

3. **使用完整路径**
   ```bash
   cd /path/to/opencode
   bun dev run --agent plan "任务描述" /path/to/project
   ```

详细说明请参考 [全局配置 OpenCode 命令] 章节。

#### Q: 配置后仍然找不到命令怎么办？

**A**: 检查以下几点：

**A**: Check the following:

1. **确认配置文件已加载**

   ```bash
   source ~/.bashrc  # 或 source ~/.zshrc
   ```

2. **检查函数/别名是否定义** / \*\*Check if function

   ```bash
   type opencode-dev
   ```

3. **检查 PATH**

   ```bash
   echo $PATH | grep -E "(bin|opencode)"
   ```

4. **打开新终端窗口**
   - 新终端会自动加载配置文件
   - New terminals automatically load config files

### 工作目录问题

#### Q: 必须在OpenCode目录下才能使用吗？

**A**: **不需要**。OpenCode 可以在任意目录使用：

**A**: **No**. OpenCode can be used from any directory:

```bash
# ✅ 方式1：在项目目录中直接使用（推荐）/ Method 1: Use directly in project directory (Recommended)
cd /path/to/your/project
bun dev run --agent plan --model opencode/gpt-5-nano "任务描述"

# ✅ 方式2：从OpenCode目录指定项目路径
cd /media/hzm/Data/github/opencode
bun dev run --agent plan --model opencode/gpt-5-nano "任务描述" /path/to/your/project
```

**OpenCode 会自动识别**

- 当前工作目录（如果从项目目录运行）
- 指定的项目路径（如果从 OpenCode 目录运行并指定路径）
- 项目根目录（通过向上查找 `.git` 目录）

#### Q: 如何在不同项目之间切换？

**A**: 有几种方式：

**A**: There are several ways:

```bash
# 方式1：直接切换到项目目录
cd /path/to/project1
bun dev run --agent plan "任务1"

cd /path/to/project2
bun dev run --agent plan "任务2"

# 方式2：从OpenCode目录指定不同项目
cd /media/hzm/Data/github/opencode
bun dev run --agent plan "任务1" /path/to/project1
bun dev run --agent plan "任务2" /path/to/project2
```

#### Q: 配置文件在哪里查找？

**A**: OpenCode 按以下优先级查找配置：

**A**: OpenCode searches for configs in this priority order:

1. **项目目录的配置** / **Project directory config**: `/path/to/project
2. **当前工作目录的配置** / **Current working directory config**: `.
3. **全局配置** / **Global config**: `~/.opencode

如果从项目目录运行，会优先使用项目目录的配置；如果从 OpenCode 目录运行并指定路径，会使用指定路径的配置。

### 配置问题

#### Q: API 密钥未生效怎么办？

**A**: 检查以下几点：

**A**: Check the following:

1. 环境变量是否正确设置
2. 配置文件语法是否正确
3. 提供商是否已启用
4. API 密钥是否有效

#### Q: 如何切换模型？

**A**: 使用以下方法：

**A**: Use the following methods:

1. 命令行参数
   ```bash
   bun dev run --model anthropic/claude-sonnet-4-20250514
   ```
2. 配置文件
   ```json
   {
     "model": "anthropic/claude-sonnet-4-20250514"
   }
   ```
3. 环境变量
   ```bash
   export OPENCODE_MODEL="anthropic/claude-sonnet-4-20250514"
   ```

### 开发问题

#### Q: 如何贡献代码？

**A**: 请阅读 [贡献指南] / **A**: Please read the [Contributing Guide](.

#### Q: 如何报告问题？

**A**: 在 GitHub 上创建 Issue: https://github.com/anomalyco/opencode

**A**: Create an issue on GitHub: https://github.com/anomalyco/opencode/issues

#### Q: 如何获取帮助？

**A**: 可以通过以下方式获取帮助：

**A**: Get help through the following channels:

- **Discord**: https://discord.gg/opencode
- **GitHub Issues**: https://github.com/anomalyco/opencode/issues
- **文档**: https://opencode.ai

---

## Everything Claude Code 集成

OpenCode 支持 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 配置集合，提供经过实战验证的 agents、skills、commands 和 rules。

### 快速安装

```bash
# 使用安装脚本（推荐）
./scripts/install-everything-claude-code.sh

# 或手动安装
# 详见: docs/everything-claude-code_融合实施计划_v1.0_20260126_AI.md
```

### 包含的内容

- **9 个专业 Agents**: planner（规划专家）、architect（架构设计专家）、code-reviewer（代码审查专家）、security-reviewer（安全审查专家）、build-error-resolver（构建错误修复专家）、e2e-runner（E2E 测试专家）、refactor-cleaner（重构清理专家）、doc-updater（文档更新专家）、tdd-guide（TDD 指南专家）
- **14 个实用 Commands**: `/plan`（创建实施计划）、`/tdd`（测试驱动开发）、`/code-review`（代码审查）、`/e2e`（E2E 测试生成）、`/build-fix`（修复构建错误）、`/refactor-clean`（重构和清理）、`/update-docs`（更新文档）、`/checkpoint`（保存检查点）、`/verify`（运行验证循环）、`/learn`（提取模式）、`/eval`（评估）、`/orchestrate`（编排任务）、`/test-coverage`（测试覆盖率）、`/update-codemaps`（更新代码地图）、`/setup-pm`（配置包管理器）
- **11 个专业 Skills**: backend-patterns（后端模式）、frontend-patterns（前端模式）、tdd-workflow（TDD 工作流）、security-review（安全审查）、verification-loop（验证循环）、eval-harness（评估框架）、continuous-learning（持续学习）、strategic-compact（战略压缩）、coding-standards（编码标准）、clickhouse-io（ClickHouse 集成）、project-guidelines-example（项目指南示例）
- **8 个最佳实践 Rules**: security（安全规则）、coding-style（编码风格）、testing（测试规则）、git-workflow（Git 工作流）、agents（Agents 规则）、performance（性能规则）、memory（内存规则）、context（上下文规则）
- **完整的 Hooks 配置**: 自动化工作流
- **MCP 服务器配置**: GitHub、Supabase、Vercel、Railway 等

### 使用示例

```bash
# 使用 planner agent 创建计划
opencode run "@planner 创建一个新的用户认证系统"

# 使用 code-reviewer agent 审查代码
opencode run "@code-reviewer 审查 src/auth/ 目录下的代码"

# 使用 /plan 命令创建实施计划
opencode run "/plan 实现用户登录功能"

# 使用 /tdd 命令进行测试驱动开发
opencode run "/tdd 创建用户服务测试"

# 使用 /code-review 命令进行代码审查
opencode run "/code-review 审查最近的提交"
```

### 详细文档

- **融合总结**: [everything-claude-code_融合总结_v1.0_20260126_AI.md](./docs/everything-claude-code_融合总结_v1.0_20260126_AI.md)
- **融合评估报告**: [everything-claude-code_融合评估报告_v1.0_20260126_AI.md](./docs/everything-claude-code_融合评估报告_v1.0_20260126_AI.md)
- **融合实施计划**: [everything-claude-code_融合实施计划_v1.0_20260126_AI.md](./docs/everything-claude-code_融合实施计划_v1.0_20260126_AI.md)

## 相关链接

- **官方网站** / **Official Website**: https:/
- **GitHub 仓库** / **GitHub Repository**: https://github.com/anomalyco
- **文档** / **Documentation**: https://opencode.ai
- **Discord 社区** / **Discord Community**: https://discord.gg
- **X.com** / **X.com**: https://x.com/opencode

---

## 更新日志

### v1.6 (2026-01-26)

- 添加 DEB 包安装方式（方式三）
- 添加 DEB/DMG 打包说明
- 添加 DEB 安装测试脚本说明
- 添加 DEB 安装常见问题解答

### v1.5 (2026-01-16)

- 添加统一Agent执行流程使用指南
- 添加6步执行流程说明
- 添加端到端验证系统使用说明
- 添加统一流程与现有功能集成说明

### v1.4 (2026-01-25)

- 添加 Oh My OpenCode 插件使用指南
- 添加 ultrawork 模式使用说明
- 添加专业化 Agent 使用示例
- 添加与 OpenCode 原生功能集成说明

### v1.2 (2025-01-13)

- 添加全局配置 OpenCode 命令章节
- 添加别名、脚本、符号链接三种配置方法
- 添加故障排除指南
- 优化工作目录使用说明

### v1.1 (2025-01-13)

- 添加计划优先工作流程
- 强调强制计划原则
- 添加完整的工作流示例
- 优化使用方法和最佳实践

### v1.0 (2025-01-07)

- 初始版本的使用指南
- 包含安装、配置、使用和构建说明

---

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](.

---

**最后更新**
**当前版本**
**维护者**
**贡献者** / **Contributors**: See [CONTRIBUTING.md](.

---

---

# 功能使用说明

## 使用方法

### 工作流程最佳实践

**重要提示**

在开始任何新任务之前，**必须先制定计划并保存为文档**，然后再逐步实施。

#### 1. 计划阶段

在开始任何开发任务前，使用 `plan` agent 制定详细计划：

```bash
# 使用plan agent制定计划，并指定使用text-processing skill
bun dev run --agent plan --model opencode/gpt-5-nano "请制定一个详细计划：[你的任务描述]。计划需要包含：1. 任务分析 2. 实现步骤 3. 技术方案 4. 测试方案 5. 风险评估。请将计划保存到docs目录下，文件名格式：任务名_plan_v1.0_$(date +%Y%m%d)_AI.md"
```

**计划文档要求**

- 必须保存到 `docs/` 目录下
- 文件名格式：`任务名_plan_v版本号_日期_AI.md`
- 必须包含中英文对照
- 包含完整的任务分解和实现步骤

**示例**

```bash
bun dev run --agent plan --model opencode/gpt-5-nano "请制定一个详细计划：将OCS2 MPC算法封装成ROS2节点。计划需要包含：1. 代码结构分析 2. ROS2节点设计 3. 接口定义 4. 实现步骤 5. 测试方案。请将计划保存到docs/ocs2_mpc_ros2_node_plan_v1.0_$(date +%Y%m%d)_AI.md"
```

#### 2. 实施阶段

根据计划文档，使用 `build` agent 逐步实施：

```bash
# 使用build agent实现代码，并指定使用code-generation skill
bun dev run --agent build --model opencode/grok-code "根据计划文档docs/任务名_plan_v1.0_日期_AI.md，开始实施第X阶段：[具体任务]。请使用code-generation skill来指导代码实现。"
```

**实施原则**

- 严格按照计划文档执行
- 每个阶段完成后验证
- 遇到问题及时更新计划文档
- 保持代码和文档同步

#### 3. 验证和测试阶段

```bash
# 编译和测试
bun dev run --agent build --model opencode/grok-code "请编译项目并修复所有错误。如果有编译错误，分析错误原因并逐一修复。"
```

#### 4. 文档更新

完成任务后，更新相关文档：

```bash
# 更新实现状态文档
bun dev run --agent plan --model opencode/gpt-5-nano "请更新docs/任务名_implementation_status_v1.0_日期_AI.md，记录完成的工作和遇到的问题。"
```

### 强制计划工作流

**每个新Chat开始时**

1. **第一步：制定计划**

   ```bash
   bun dev run --agent plan --model opencode/gpt-5-nano "[任务描述]。请先制定详细计划，保存到docs/目录。"
   ```

2. **第二步：确认计划**
   - review计划文档
   - 确认任务分解是否合理
   - 确认技术方案是否可行

3. **第三步：开始实施**
   ```bash
   bun dev run --agent build --model opencode/grok-code "根据计划文档开始实施。"
   ```

**为什么需要强制计划**

- ✅ 避免盲目开发
- ✅ 提高代码质量
- ✅ 便于追踪进度
- ✅ 减少返工
- ✅ 文档化思考过程

### 基本使用

#### 工作目录说明

**重要**

**Important**: OpenCode can be used in any directory, you don't need to enter the OpenCode source directory first.

**使用方式**

1. **在任意项目目录使用**

   ```bash
   # 方式1：在项目目录中直接运行（推荐）/ Method 1: Run directly in project directory (Recommended)
   cd /path/to/your/project
   bun dev run --agent plan --model opencode/gpt-5-nano "任务描述"

   # 方式2：从OpenCode目录指定项目路径
   cd /media/hzm/Data/github/opencode
   bun dev run --agent plan --model opencode/gpt-5-nano "任务描述" /path/to/your/project
   ```

2. **OpenCode 会自动识别工作目录**
   - 如果从项目目录运行，OpenCode 会使用当前目录作为工作目录
   - 如果从 OpenCode 目录运行并指定路径，OpenCode 会使用指定路径作为工作目录
   - OpenCode 会自动向上查找 `.git` 目录来确定项目根目录

**示例场景**

```bash
# 场景1：在OCS2项目中使用OpenCode
cd /media/hzm/Data/github/ocs2
bun dev run --agent plan --model opencode/gpt-5-nano \
  "请制定计划：将MPC算法封装成ROS2节点。保存到docs/ocs2_mpc_ros2_node_plan_v1.0_$(date +%Y%m%d)_AI.md"

# 场景2：在ROS2工作空间中使用OpenCode
cd ~/ros2_ws/src/my_package
bun dev run --agent build --model opencode/grok-code \
  "根据计划文档实现ROS2节点"

# 场景3：从OpenCode目录操作其他项目
cd /media/hzm/Data/github/opencode
bun dev run --agent plan --model opencode/gpt-5-nano \
  "请制定计划：优化算法性能" /media/hzm/Data/github/my_other_project
```

**配置文件优先级**

- OpenCode 会按以下顺序查找配置文件：
  1. 项目目录的 `opencode.json` (如果指定了项目路径)
  2. 当前工作目录的 `opencode.json`
  3. 全局配置 `~/.opencode

#### 启动 TUI

```bash
# 在当前目录启动
bun dev

# 在指定目录启动
bun dev /path/to/project

# 在项目根目录启动
bun dev .

# 从任意位置启动并指定工作目录
cd /any/directory
bun dev /path/to/your/project
```

#### 运行命令

**⚠️ 重要：开始新任务前必须先制定计划**

**工作目录说明**

- 可以在任意目录运行 OpenCode 命令
- 如果从项目目录运行，OpenCode 会自动使用当前目录
- 如果从 OpenCode 目录运行，可以指定项目路径作为最后一个参数

**Working Directory Note**:

- You can run OpenCode commands from any directory
- If running from project directory, OpenCode automatically uses current directory
- If running from OpenCode directory, you can specify project path as the last argument

```bash
# ❌ 错误方式：直接开始实现
bun dev run "实现一个用户登录功能"

# ✅ 正确方式1：在项目目录中运行
cd /path/to/your/project
# 步骤1：制定计划
bun dev run --agent plan --model opencode/gpt-5-nano \
  "请制定详细计划：实现用户登录功能。包含：1. 需求分析 2. 技术方案 3. 实现步骤 4. 测试方案。保存到docs/user_login_plan_v1.0_$(date +%Y%m%d)_AI.md"

# 步骤2：根据计划实施
bun dev run --agent build --model opencode/grok-code \
  "根据docs/user_login_plan_v1.0_日期_AI.md开始实施用户登录功能"

# ✅ 正确方式2：从OpenCode目录指定项目路径
cd /media/hzm/Data/github/opencode
# 步骤1：制定计划（指定项目路径）/ Step 1: Create plan (specify project path)
bun dev run --agent plan --model opencode/gpt-5-nano \
  "请制定详细计划：实现用户登录功能。包含：1. 需求分析 2. 技术方案 3. 实现步骤 4. 测试方案。保存到docs/user_login_plan_v1.0_$(date +%Y%m%d)_AI.md" \
  /path/to/your/project

# 步骤2：根据计划实施（指定项目路径）/ Step 2: Implement (specify project path)
bun dev run --agent build --model opencode/grok-code \
  "根据docs/user_login_plan_v1.0_日期_AI.md开始实施用户登录功能" \
  /path/to/your/project

# 继续上次会话
bun dev run --continue

# 使用指定会话
bun dev run --session <session-id>

# 使用指定模型
bun dev run --model anthropic/claude-sonnet-4-20250514

# 使用指定代理
bun dev run --agent plan  # 用于制定计划 / For planning
bun dev run --agent build # 用于代码实现 / For code implementation
```

### 常用命令

#### 查看帮助

```bash
bun dev --help
```

#### 查看版本

```bash
bun dev --version
```

#### 认证管理

```bash
# 管理凭证
bun dev auth

# 连接提供商
bun dev auth connect anthropic
```

#### 模型列表

```bash
# 列出所有可用模型
bun dev models

# 列出特定提供商的模型
bun dev models anthropic
```

#### 会话管理

```bash
# 管理会话
bun dev session

# 导出会话
bun dev export <session-id>

# 导入会话
bun dev import <file>
```

#### 统计信息

```bash
# 显示令牌使用和成本统计
bun dev stats
```

### 高级功能

#### 无头服务器模式

```bash
# 启动服务器
bun dev serve --port 4096

# 附加到运行中的服务器
bun dev attach http://localhost:4096
```

#### Web 界面

```bash
# 启动 Web 服务器
bun dev web
```

#### GitHub 集成

```bash
# 管理 GitHub 代理
bun dev github

# 获取并检出 PR 分支
bun dev pr <number>
```

#### MCP 服务器管理

```bash
# 管理 MCP 服务器
bun dev mcp
```

#### ACP 服务器

```bash
# 启动 ACP 服务器
bun dev acp
```

### 命令行选项

```bash
# 日志选项
bun dev --print-logs
bun dev --log-level DEBUG

# 服务器选项
bun dev serve --port 4096 --hostname 0.0.0.0

# 模型选项
bun dev run --model anthropic/claude-sonnet-4-20250514

# 代理选项
bun dev run --agent build
```

---

## Oh My OpenCode 插件使用指南

### 概述

**Oh My OpenCode** 是一个强大的 OpenCode 插件，将你的 AI Agent 转变为完整的开发团队。它提供了专业化 Agent 协作、Sisyphus 永不放弃机制、LSP

**Oh My OpenCode** is a powerful OpenCode plugin that transforms your AI agent into a full development team. It provides specialized agent collaboration, Sisyphus never-give-up mechanism, LSP/AST tools, and parallel background task execution.

### 主要特性

- 🤖 **专业化 Agent 团队**
- 🔄 **Sisyphus Agent**
- 🛠️ **LSP 工具** / \*\*LSP
- ⚡ **后台任务**
- 🪄 **ultrawork 模式**
- 🔌 **Claude Code 兼容**

### 安装

#### 方式1：使用安装脚本（推荐）

```bash
# 交互式安装
bunx oh-my-opencode install

# 非交互式安装（无订阅）/ Non-interactive installation (no subscriptions)
bunx oh-my-opencode install --no-tui --claude=no --chatgpt=no --gemini=no
```

安装脚本会自动：

- 检查 OpenCode 版本（需要 >= 1.0.150）
- 在 `opencode.json` 中注册插件
- 创建 `oh-my-opencode.json` 配置文件
- 配置 Agent 模型

#### 方式2：手动安装

1. **添加插件到配置**

编辑 `~/.config/opencode

```json
{
  "plugin": ["oh-my-opencode"]
}
```

2. **创建配置文件**

创建 `~/.config/opencode

```json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "agents": {
    "Sisyphus": {
      "model": "opencode/glm-4.7-free"
    },
    "oracle": {
      "model": "opencode/glm-4.7-free"
    },
    "librarian": {
      "model": "opencode/glm-4.7-free"
    }
  }
}
```

### 配置说明

#### 配置文件位置

oh-my-opencode 支持多级配置，按以下优先级加载：

1. **项目配置** / **Project config**: `.opencode/oh-my-opencode.json` 或 `.opencode
2. **用户配置** / **User config**: `~/.config/opencode/oh-my-opencode.json` 或 `~/.config/opencode

#### 基本配置示例

```json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "agents": {
    "Sisyphus": {
      "model": "opencode/glm-4.7-free"
    },
    "oracle": {
      "model": "opencode/glm-4.7-free"
    },
    "librarian": {
      "model": "opencode/glm-4.7-free"
    },
    "explore": {
      "model": "opencode/grok-code"
    },
    "frontend-ui-ux-engineer": {
      "model": "opencode/glm-4.7-free"
    }
  },
  "sisyphus": {
    "ultrawork": true,
    "max_retries": 10,
    "auto_fix": true
  }
}
```

#### 使用 API 密钥的完整配置

如果你有 API 密钥，可以为不同 Agent 配置最适合的模型：

```json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "agents": {
    "Sisyphus": {
      "model": "anthropic/claude-opus-4-5"
    },
    "oracle": {
      "model": "openai/gpt-5.2"
    },
    "librarian": {
      "model": "opencode/glm-4.7-free"
    },
    "explore": {
      "model": "opencode/grok-code"
    },
    "frontend-ui-ux-engineer": {
      "model": "google/gemini-3-pro-preview"
    },
    "document-writer": {
      "model": "google/gemini-3-flash"
    }
  },
  "sisyphus": {
    "ultrawork": true,
    "max_retries": 10,
    "auto_fix": true,
    "context_compress_threshold": 100000
  }
}
```

**环境变量配置**

```bash
export ANTHROPIC_API_KEY="sk-ant-xxx"
export OPENAI_API_KEY="sk-xxx"
export GOOGLE_GENERATIVE_AI_API_KEY="xxx"
```

### 使用方法

#### 1. 基础使用

```bash
# 简单对话（使用默认 Agent）
opencode run "你的问题"

# 指定模型
opencode run --model opencode/glm-4.7-free "你的问题"
```

#### 2. 使用 ultrawork 模式（推荐）

**ultrawork 模式**是 oh-my-opencode 的核心功能，只需在提示词中包含 `ultrawork` 或 `ulw` 关键词：

**ultrawork mode** is the core feature of oh-my-opencode. Just include `ultrawork` or `ulw` keyword in your prompt:

```bash
# 使用 ultrawork 模式处理复杂任务
opencode run "ultrawork: 重构整个项目的TypeScript代码，统一代码风格，修复所有eslint错误"

# 或使用简写 ulw
opencode run "ulw: 创建一个完整的REST API，包含用户认证和CRUD操作"
```

**ultrawork 模式会自动**:

- ✅ 分析任务结构
- ✅ 启动多个后台 Agent 并行工作
- ✅ 自动重试失败的任务
- ✅ 自动修复错误
- ✅ 持续工作直到任务完成
- ✅ 自动管理上下文（压缩、优化）

#### 3. 使用专业化 Agent

oh-my-opencode 提供了多个专业化 Agent，每个擅长不同的任务：

**可用 Agent**

- **@oracle**: 架构设计、代码审查、策略制定（推荐模型：GPT 5.2）
- **@librarian**: 文档查找、代码库分析、实现案例搜索（推荐模型：GLM-4.7 Free）
- **@explore**: 快速代码库探索和模式匹配（推荐模型：Grok Code）
- **@frontend-ui-ux-engineer**: 前端开发、UI
- **@document-writer**: 技术文档编写（推荐模型：Gemini 3 Flash）
- **@multimodal-looker**: 图片

**使用示例**

```bash
# 使用 Oracle 进行架构分析
opencode run "@oracle 分析这个项目的架构，提出改进建议"

# 使用 Librarian 查找实现案例
opencode run "@librarian 查找React Hooks的最佳实践和TypeScript类型定义示例"

# 使用 Explore 快速探索代码库
opencode run "@explore 查找所有使用useState的组件"

# 使用 Frontend Engineer 实现UI
opencode run "@frontend-ui-ux-engineer 创建一个响应式仪表板组件"

# 使用 Document Writer 编写文档
opencode run "@document-writer 为这个项目编写完整的README文档"

# 使用 Multimodal Looker 分析图片
opencode run "@multimodal-looker 分析这个PDF文档中的架构图"
```

#### 4. 组合使用

可以同时使用多个功能：

```bash
# ultrawork + 专业化 Agent
opencode run "ultrawork: @oracle 分析项目架构，@frontend-ui-ux-engineer 实现前端组件，@document-writer 更新文档"

# 在计划阶段使用专业化 Agent
opencode run --agent plan "@oracle 分析需求，制定详细计划" --model opencode/gpt-5-nano

# 在实施阶段使用 ultrawork
opencode run --agent build "ultrawork: 根据计划文档实施所有功能" --model opencode/grok-code
```

#### 5. 与 OpenCode 原生功能集成

oh-my-opencode 完全兼容 OpenCode 的原生功能：

```bash
# 使用 plan agent + oh-my-opencode
opencode run --agent plan "ultrawork: 制定详细计划：实现用户认证系统" --model opencode/gpt-5-nano

# 使用 build agent + oh-my-opencode
opencode run --agent build "ultrawork: 根据计划文档实施用户认证系统" --model opencode/grok-code

# 继续上次会话
opencode run --continue

# 使用指定会话
opencode run --session <session-id>
```

### 实际使用场景

#### 场景1: 大规模代码重构

```bash
opencode run "ultrawork: 重构整个项目的TypeScript代码，统一代码风格，修复所有eslint错误"
```

**Sisyphus 会**:

- 自动分析项目结构
- 逐个文件进行重构
- 遇到错误自动修复
- 持续工作直到所有任务完成
- 如果上下文过长，自动压缩

#### 场景2: 多模块并行开发

```bash
opencode run "ultrawork: @frontend-ui-ux-engineer 实现前端组件 & @oracle 设计后端API架构"
```

**效果**:

- 前端和后端可以并行开发
- 使用最适合的模型处理对应任务
- 提高开发效率

#### 场景3: 复杂问题调试

```bash
opencode run "@oracle 分析这个bug的根本原因，@librarian 查找类似的解决方案"
```

**效果**:

- Oracle 进行深度分析
- Librarian 查找相关案例
- 提高问题解决效率

#### 场景4: 文档编写

```bash
opencode run "@document-writer 为新实现的组件编写完整的API文档，包含使用示例和最佳实践"
```

### 最佳实践

#### 1. 模型选择策略

- **简单任务**: 使用 `opencode/glm-4.7-free` 或 `opencode
- **复杂任务**: 使用 `opencode/gpt-5.1-codex` 或 `anthropic
- **需要深度思考**: 使用 `anthropic/claude-opus-4-5` 或 `opencode

#### 2. Agent 选择指南

| Agent             | 适用场景                     | 推荐模型                                          |
| ----------------- | ---------------------------- | ------------------------------------------------- |
| Oracle            | 架构设计、代码审查、策略制定 | `anthropic/claude-sonnet-4-20250514` 或 `opencode |
| Librarian         | 文档查找、代码库分析         | `opencode                                         |
| Explore           | 快速代码库探索               | `opencode                                         |
| Frontend Engineer | UI 设计、前端开发            | `opencode/gpt-5.1-codex` 或 `google               |
| Document Writer   | 文档编写、README 生成        | `opencode                                         |
| Multimodal Looker | 图片                         |

#### 3. 使用 ultrawork 的建议

- ✅ **复杂任务**: 使用 `ultrawork` 处理需要多步骤、多文件操作的任务
- ✅ **重构任务**: 使用 `ultrawork` 进行大规模代码重构
- ✅ **新功能开发**: 使用 `ultrawork` 开发完整功能模块
- ⚠️ **简单任务**: 简单任务可以不使用 `ultrawork`，直接使用普通模式

#### 4. 与计划工作流结合

**推荐工作流**

```bash
# 步骤1: 使用 plan agent + Oracle 制定计划
opencode run --agent plan "@oracle 分析需求，制定详细计划：实现用户认证系统。保存到docs/user_auth_plan_v1.0_$(date +%Y%m%d)_AI.md" --model opencode/gpt-5-nano

# 步骤2: 使用 build agent + ultrawork 实施
opencode run --agent build "ultrawork: 根据docs/user_auth_plan_v1.0_日期_AI.md实施用户认证系统" --model opencode/grok-code

# 步骤3: 使用 Document Writer 更新文档
opencode run "@document-writer 更新docs/user_auth_plan_v1.0_日期_AI.md，记录完成的工作"
```

### 故障排查

#### 问题1: 插件未加载

**症状**

**解决方案**

```bash
# 检查插件配置
cat ~/.config/opencode/opencode.json

# 应该包含 "oh-my-opencode"
```

#### 问题2: ultrawork 模式不工作

**症状**

**解决方案**

1. 检查配置文件中 `sisyphus.ultrawork` 是否为 `true`
2. 确保提示词中包含 `ultrawork` 或 `ulw` 关键词
3. 检查 OpenCode 版本（需要 >= 1.0.150）

#### 问题3: 专业化 Agent 不可用

**症状**

**解决方案**

1. 检查 `oh-my-opencode.json` 配置
2. 确认 Agent 名称正确（区分大小写）
3. 检查模型 ID 格式（`provider

### 相关资源

- **GitHub 仓库**: https://github.com/code-yeongyu/oh-my-opencode
- **配置计划文档**: `docs/Oh_My_OpenCode_配置落地计划_v3.0_20260125_AI.md`
- **评估报告**: `docs/Oh_My_OpenCode_配置计划评估报告_v1.0_20260125_AI.md`
- **配置完成报告**: `docs/Oh_My_OpenCode_配置完成报告_v1.0_20260125_AI.md`

---

## 规则注入系统使用指南

### 概述

**规则注入系统**是Oh My OpenCode插件的重要增强功能，允许你为AI Agent定义和执行统一的行为规则。通过规则文件，你可以确保AI Agent在不同项目、不同任务中保持一致的代码风格、命名规范和工作流程，避免"AI代码泛滥"问题，提升代码质量和团队协作效率。

**Rules Injection System** is a key enhancement of the Oh My OpenCode plugin that allows you to define and enforce unified behavior rules for AI Agents. Through rule files, you can ensure AI Agents maintain consistent code style, naming conventions, and workflows across different projects and tasks, avoiding "AI code slop" and improving code quality and team collaboration efficiency.

### 主要特性

- 📝 **规则文件管理**: 支持`.mdc`和`.md`格式的规则文件，使用frontmatter进行配置
- 🗂️ **多级配置**: 支持项目级(`.claude/rules/`)和用户级(`~/.claude/rules/`)规则
- 🎯 **智能匹配**: 基于`globs`模式匹配文件类型，支持`alwaysApply: true`始终生效规则
- ⚙️ **自动注入**: Oh My OpenCode的`rules-injector`钩子自动将匹配的规则注入AI Agent上下文
- 🔄 **实时生效**: 规则修改后立即生效，无需重启Agent
- 📋 **全面覆盖**: 支持代码风格、文件命名、文档管理、工作流程等各类规则

### 使用方法

#### 1. 创建规则目录

首先，在项目根目录创建`.claude/rules/`目录：

```bash
# 创建项目级规则目录
mkdir -p .claude/rules

# 或者创建用户级规则目录
mkdir -p ~/.claude/rules
```

#### 2. 规则文件格式

规则文件使用Markdown格式，支持frontmatter配置：

```markdown
---
description: "Python代码规则"
globs: ["*.py"]
alwaysApply: false
---

## Python代码规则

- 遵循PEP 8规范
- 使用类型注解（Type Hints）
- 避免使用`as any`等类型忽略语句
- 优先使用PyTorch进行深度学习实现
```

**frontmatter字段说明**:

- `description`: 规则描述
- `globs`: 文件匹配模式（如`["*.py"]`、`["*.ts", "*.tsx"]`）
- `alwaysApply`: 是否始终生效（true/false）

#### 3. 配置规则注入钩子

确保`oh-my-opencode.json`配置文件中启用了`rules-injector`钩子：

```json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "hooks": {
    "rules-injector": true
  }
}
```

#### 4. 验证规则生效

创建测试文件验证规则是否生效：

```bash
# 创建Python测试文件
touch test_rules_v1.0_20250122_AI.py

# 使用OpenCode运行，观察是否显示规则注入提示
bun dev run "在test_rules_v1.0_20250122_AI.py中写一个简单的函数"
```

如果规则生效，你将在输出中看到类似提示：

```
[Rule: .claude/rules/python-rules.mdc]
[Match: glob: *.py]
```

### 规则文件示例

#### 示例1: Python代码规则 (`python-rules.mdc`)

```markdown
---
description: "Python代码规范"
globs: ["*.py"]
---

## Python代码规则

- **PEP 8规范**: 遵循Python官方代码风格指南
- **类型安全**: 使用Type Hints，避免`as any`、`@ts-ignore`等类型忽略语句
- **错误处理**: 明确异常处理，避免空的`except:`块
- **性能优化**: 优先使用向量化操作，避免不必要的循环
- **框架选择**: 深度学习任务优先使用PyTorch
- **可复现性**: 设置随机种子，确保实验可复现
```

#### 示例2: 文件命名规则 (`file-naming-rules.mdc`)

```markdown
---
description: "文件命名规范"
alwaysApply: true
---

## 文件命名规范

- **英文命名**: 所有文件名必须是英文的，不能使用中文
- **AI标识**: AI生成的代码文件必须在文件名最后加上"\_AI"标识
- **命名格式**: `功能名_版本号_日期_AI.扩展名`
- **日期格式**: 必须使用YYYYMMDD格式（如20250122）
- **版本管理**: 每次修改代码创建新版本文件，保留历史版本
- **示例**: `train_improved_v1.0_20250122_AI.py`, `paper_analysis_transformer_v1.0_20250122_AI.md`
```

#### 示例3: 文档管理规则 (`documentation-rules.mdc`)

```markdown
---
description: "文档管理规范"
globs: ["*.md"]
---

## 文档管理规则

- **必须创建文档的情况**:
  - 技术文档：重要的技术方案、架构设计、API文档等
  - 计划文档：项目计划、开发路线图、任务分解等
  - 问题解决文档：多次修改才解决的问题、复杂问题的解决过程
  - 论文分析文档：必须放在`docs/papers/`目录
  - 技术思路文档：必须放在`docs/technical_ideas/`目录
- **文档位置要求**: 所有AI生成的文档必须放在docs目录下
- **命名规范**: 必须包含版本号和日期，格式：`功能名_版本号_日期_AI.md`
```

#### 示例4: 通用规则 (`general-rules.mdc`)

```markdown
---
description: "通用行为规则"
alwaysApply: true
---

## AI模型优先选择规则

- **代码生成**: 优先使用Claude-4模型进行代码生成和算法实现
- **知识问答**: 优先使用Grok-4模型
- **文档生成**: 优先使用Claude-4模型生成技术文档
- **算法分析**: 使用Claude-4模型进行PPO、SAC等强化学习算法的分析和优化
- **机器人学任务**: 使用Claude-4模型处理机器人操作、MuJoCo环境等专业任务

## 语言要求

- 始终使用简体中文回答

## 思考步骤

逐步思考：首先理解任务；其次规划架构；第三编写代码；第四建议测试
```

### 从Cursor规则迁移

如果你有现有的Cursor规则文件（如`Cursor-rules.txt`），可以按照以下步骤迁移：

#### 1. 分析现有规则

将`Cursor-rules.txt`中的规则分类整理：

- 代码风格规则
- 文件命名规则
- 文档管理规则
- 工作流程规则
- 专业领域规则

#### 2. 转换为`.mdc`格式

为每类规则创建独立的`.mdc`文件：

```bash
# 创建规则目录
mkdir -p .claude/rules

# 转换规则文件
# 通用规则
echo '---
description: "通用行为规则"
alwaysApply: true
---

## AI模型优先选择规则
- 优先使用Claude-4模型进行代码生成和算法实现
- 知识问答优先使用Grok-4模型
' > .claude/rules/general-rules.mdc

# Python规则
echo '---
description: "Python代码规范"
globs: ["*.py"]
---

## Python代码规则
- 遵循PEP 8规范
- 使用类型注解（Type Hints）
' > .claude/rules/python-rules.mdc
```

#### 3. 验证规则转换

使用OpenCode测试规则是否生效：

```bash
# 测试Python规则
bun dev run "创建一个简单的Python函数，计算斐波那契数列"

# 检查文件名是否符合规范（应自动添加_AI后缀和日期）
ls *.py
```

### 配置详解

#### 1. 规则查找优先级

规则系统按以下优先级查找和应用规则：

1. **项目级规则**: `./.claude/rules/`（当前项目）
2. **父目录规则**: 向上查找父目录中的`.claude/rules/`
3. **用户级规则**: `~/.claude/rules/`（全局规则）
4. **默认规则**: 系统内置的默认规则（如有）

#### 2. 规则匹配逻辑

- **globs匹配**: 规则文件的`globs`字段匹配当前处理的文件类型
- **alwaysApply**: 如果设置为`true`，该规则对所有文件生效
- **多规则合并**: 多个匹配的规则会合并应用，后匹配的规则优先级更高

#### 3. 规则注入机制

规则通过Oh My OpenCode的`rules-injector`钩子注入：

1. Agent开始处理任务
2. Hook检测当前文件类型
3. 查找匹配的规则文件
4. 将规则内容注入Agent的上下文
5. Agent在处理过程中遵循规则要求

### 实际使用场景

#### 场景1: 统一团队代码风格

团队成员在`.claude/rules/`目录中共享规则文件，确保所有AI生成的代码遵循相同的规范。

#### 场景2: 项目特定规则

为不同类型的项目配置不同的规则：

- **Web项目**: 侧重TypeScript、React规范
- **数据科学项目**: 侧重Python、Jupyter规范
- **嵌入式项目**: 侧重C/C++、安全规范

#### 场景3: 自动化代码审查

规则系统可以替代部分代码审查工作，确保AI生成的代码符合预设标准。

#### 场景4: 文档管理自动化

通过文档规则确保所有重要决策和技术方案都有规范化的文档记录。

### 故障排查

#### 问题1: 规则不生效

**症状**: 创建规则文件后，AI Agent行为没有变化。

**解决方案**:

1. 检查规则文件路径是否正确（应在`.claude/rules/`目录）
2. 确认规则文件格式正确（包含有效的frontmatter）
3. 检查`oh-my-opencode.json`是否启用了`rules-injector`钩子
4. 查看OpenCode输出中是否有规则注入提示

#### 问题2: 规则冲突

**症状**: 多个规则文件存在冲突，AI Agent行为不一致。

**解决方案**:

1. 检查规则优先级（项目级 > 用户级）
2. 避免在多个规则文件中定义相同的规则
3. 使用`alwaysApply: true`谨慎，确保不会与其他规则冲突
4. 通过测试验证规则合并效果

#### 问题3: 性能问题

**症状**: 规则文件过多导致Agent启动变慢。

**解决方案**:

1. 合并相似的规则文件
2. 移除不再使用的规则
3. 使用`globs`精确匹配，减少不必要的规则检查
4. 定期清理规则目录

### 最佳实践

#### 1. 规则设计原则

- **简洁明确**: 每条规则应清晰具体，避免歧义
- **可测试**: 规则应能够通过简单测试验证是否生效
- **可维护**: 定期审查和更新规则，保持与项目需求同步
- **渐进式**: 从少数核心规则开始，逐步添加更多规则

#### 2. 目录结构建议

```
.claude/rules/
├── general-rules.mdc          # 通用规则（alwaysApply: true）
├── python-rules.mdc          # Python代码规则
├── typescript-rules.mdc      # TypeScript代码规则
├── file-naming-rules.mdc     # 文件命名规则
├── documentation-rules.mdc   # 文档管理规则
├── workflow-rules.mdc        # 工作流程规则
└── professional-rules.mdc    # 专业领域规则
```

#### 3. 版本控制

将`.claude/rules/`目录纳入版本控制，确保团队成员使用相同的规则：

```bash
# 将规则目录添加到git
git add .claude/rules/
git commit -m "添加AI Agent行为规则"
```

### 相关资源

- **OpenCode项目**: https://github.com/anomalyco/opencode
- **Oh My OpenCode插件**: https://github.com/code-yeongyu/oh-my-opencode
- **规则文件示例**: 本项目中的`.claude/rules/`目录
- **验证测试文件**: `test_rules_v1.0_20250122_AI.py`

---

## 统一Agent执行流程使用指南

### 概述

**统一Agent执行流程**是Oh My OpenCode插件的一个核心功能，它允许你通过一句话输入自动触发完整的6步执行流程，从任务解析到结果交付，全程自动化执行。

**Unified Agent Execution Flow** is a core feature of the Oh My OpenCode plugin that allows you to trigger a complete 6-step execution flow with a single sentence input, from task parsing to result delivery, all automated.

### 主要特性

- 🎯 **自动任务解析**: 自动识别任务类型，提取成功标准
- 📋 **智能拆解**: 自动创建详细计划并通过审查
- ⚡ **并行执行**: 多线程处理，实时进度跟踪
- 🔨 **综合构建**: 信息融合，逻辑构建
- ✅ **质量保证**: 自检修正，端到端验证
- 📦 **结果交付**: 按需格式化，执行摘要

### 6步执行流程

统一流程包含以下6个阶段：

1. **阶段1: 任务解析** - 理解核心需求，明确交付标准
2. **阶段2: 智能拆解** - 分解为可执行步骤，确定资源需求
3. **阶段3: 并行执行** - 多线程收集/处理，实时进度跟踪
4. **阶段4: 综合构建** - 信息融合，逻辑构建
5. **阶段5: 质量保证** - 自检修正，端到端验证
6. **阶段6: 结果交付** - 按需格式化，附上执行摘要

### 使用方法

#### 基本使用

统一流程系统已自动集成，只需在提示词中包含触发关键词即可：

**The unified flow system is automatically integrated. Just include trigger keywords in your prompt:**

```bash
# 方式1: 自动触发（推荐）
cd /path/to/your/project
bun dev run "帮我将当前的项目demo运行起来"

# 方式2: 显式触发
bun dev run "unified-flow: 运行demo"

# 方式3: 使用oh-my-opencode命令
bunx oh-my-opencode run "帮我将当前的项目demo运行起来"
```

#### 触发关键词

系统会自动检测以下关键词并触发统一流程：

**The system automatically detects the following keywords to trigger unified flow:**

**中文关键词**:

- "帮我"
- "帮我将"
- "运行demo"
- "运行demo起来"
- "启动"
- "帮我运行"
- "帮我启动"
- "自动完成"
- "完整流程"

**英文关键词**:

- "unified-flow"
- "auto complete"
- "run demo"
- "help me"

**模式匹配**:

- `/帮我.*(运行|启动|完成|实现)/`
- `/将.*(运行|启动)起来/`
- `/自动.*(完成|实现|处理)/`

### 使用示例

#### 示例1: 运行Demo

```bash
cd /path/to/your/project
bun dev run "帮我将当前的项目demo运行起来"
```

**执行流程**:

1. **阶段1**: 系统识别任务类型为"run_demo"，收集项目信息（package.json、启动脚本等）
2. **阶段2**: 创建详细计划（检查依赖、配置环境、启动服务）
3. **阶段3-4**: 执行计划，启动服务
4. **阶段5**: 端到端验证（检查服务是否真正运行，HTTP健康检查）
5. **阶段6**: 生成执行摘要，自动退出

#### 示例2: 修复Bug

```bash
cd /path/to/your/project
bun dev run "修复登录功能中的空指针异常"
```

**执行流程**:

1. **阶段1**: 识别任务类型为"fix_bug"，收集相关代码和错误信息
2. **阶段2**: 创建计划（定位bug、分析原因、修复、测试）
3. **阶段3-4**: 执行修复
4. **阶段5**: 验证bug是否真正修复（复现原始场景、运行测试）
5. **阶段6**: 生成修复报告

#### 示例3: 添加功能

```bash
cd /path/to/your/project
bun dev run "添加用户头像上传功能"
```

**执行流程**:

1. **阶段1**: 识别任务类型为"add_feature"，收集相关代码和文档
2. **阶段2**: 创建计划（设计API、实现后端、实现前端、测试）
3. **阶段3-4**: 并行执行多个任务
4. **阶段5**: 功能验证（测试新功能、验证需求）
5. **阶段6**: 生成功能实现报告

### 配置

#### 启用/禁用统一流程

统一流程Hook默认启用。可以通过配置文件禁用：

**The unified flow hook is enabled by default. You can disable it via config:**

在 `oh-my-opencode.json` 中配置：

```json
{
  "disabled_hooks": [] // 不包含 "unified-flow" 则默认启用
}
```

禁用统一流程：

```json
{
  "disabled_hooks": ["unified-flow"]
}
```

### 端到端验证系统

统一流程的核心创新是**端到端验证系统**，确保任务真正完成，而不仅仅是代码质量检查。

**The core innovation of unified flow is the end-to-end verification system, ensuring tasks are truly completed, not just code quality checks.**

#### 验证方法

系统支持多种验证方法：

- **http_check**: HTTP健康检查（用于Web服务）
- **port_check**: 端口监听检查（用于服务）
- **test_run**: 测试运行（用于功能验证）
- **command_check**: 命令输出检查（用于CLI工具）
- **manual_check**: 手动检查（用于复杂场景）

#### 验证示例

在阶段5中，系统会自动调用验证工具：

```typescript
// 系统自动调用（无需手动）
verification(
  (taskType = "run_demo"),
  (taskDescription = "运行项目demo"),
  (successCriteria = {
    type: "run_demo",
    description: "Demo服务运行成功",
    verification: {
      method: "http_check",
      target: "http://localhost:3000",
      expected: "200 OK",
      timeout: 30000,
    },
  }),
)
```

### 状态管理

#### 状态文件位置

执行状态保存在：

```
.sisyphus/execution-state/{session-id}.json
```

#### 状态恢复

如果会话中断，系统会自动恢复状态：

- 从状态文件读取
- 继续执行当前阶段
- 保持上下文

### 与现有功能集成

统一流程完全兼容OpenCode和Oh My OpenCode的现有功能：

```bash
# 使用plan agent + 统一流程
bun dev run --agent plan "帮我制定详细计划：实现用户认证系统"

# 使用build agent + 统一流程
bun dev run --agent build "帮我将当前的项目demo运行起来"

# 使用ultrawork模式 + 统一流程
bun dev run "ultrawork: 帮我完成整个项目的重构"

# 使用专业化Agent + 统一流程
bun dev run "@oracle 帮我分析项目架构并提出改进方案"
```

### 用户交互功能

统一流程支持在需要用户输入时自动暂停并提示用户。

#### 支持的交互类型

1. **密码输入** (`password`)
   - 用于需要sudo密码等敏感输入
   - 输入会被隐藏

2. **文本输入** (`text`)
   - 用于需要用户提供文本信息
   - 支持默认值

3. **确认** (`confirm`)
   - 用于需要用户确认的操作
   - 支持默认选择（yes/no）

4. **选择** (`select`)
   - 用于需要用户从多个选项中选择
   - 支持单选和多选

#### 使用场景

**场景1：需要sudo密码**

```bash
# Agent会自动检测sudo密码提示并暂停
bun dev run "帮我安装系统依赖包"
# 当需要sudo时，系统会提示：
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔐 SUDO PASSWORD REQUIRED
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 请在TUI界面输入sudo密码
```

**场景2：需要用户确认**

```bash
# Agent会自动检测确认提示
bun dev run "帮我删除临时文件"
# 当需要确认时，系统会提示：
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ❓ USER CONFIRMATION REQUIRED
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 请确认是否继续
```

**场景3：需要用户选择**

```bash
# Agent会自动检测选择提示
bun dev run "帮我选择数据库类型"
# 系统会显示选项供用户选择
```

#### 工作原理

1. **自动检测**：Agent在执行命令后自动检测输出中是否包含用户输入提示
   - sudo密码提示：`"sudo: a password is required"`, `"[sudo] password for"`
   - 确认提示：`"Are you sure?"`, `"Continue?"`, `"Y/n"`
   - 交互提示：`"Enter"`, `"Input"`, `"Please provide"`

2. **暂停执行**：检测到需要用户输入时，系统自动暂停执行

3. **显示提示**：在TUI界面显示清晰的提示信息，说明需要什么输入以及为什么需要

4. **等待输入**：等待用户在TUI界面提供输入

5. **继续执行**：用户提供输入后，系统自动继续执行

#### 注意事项

- **安全性**：密码输入会被隐藏，不会在日志中显示
- **超时**：可以设置超时时间，超时后可以取消或使用默认值
- **取消**：用户可以随时取消交互，系统会相应地处理
- **自动继续**：用户提供输入后，系统会自动继续执行，无需手动恢复

### 最佳实践

#### 1. 明确的任务描述

**好的示例**:

```bash
bun dev run "帮我将当前的项目demo运行起来"
```

**不好的示例**:

```bash
bun dev run "做点什么"
```

#### 2. 等待阶段完成

每个阶段需要时间完成，请耐心等待。系统会在阶段完成时自动转换。

#### 3. 检查状态文件

如果遇到问题，检查状态文件了解当前进度：

```bash
cat .sisyphus/execution-state/{session-id}.json
```

#### 4. 及时响应交互提示

当系统提示需要输入时，及时在TUI界面提供输入，避免长时间等待。

### 故障排查

#### 问题1: 统一流程未触发

**症状**: 输入包含关键词但未触发统一流程

**解决方案**:

1. 检查Hook是否启用

   ```bash
   cat ~/.config/opencode/oh-my-opencode.json
   ```

2. 检查日志

   ```bash
   bun dev run --print-logs "测试"
   ```

3. 显式触发
   ```bash
   bun dev run "unified-flow: 你的任务"
   ```

#### 问题2: 阶段未转换

**症状**: Phase 1完成后未自动转换到Phase 2

**可能原因**:

- 成功标准未正确提取
- 状态文件未更新
- Agent输出格式不符合预期

**解决方案**:

1. 检查状态文件

   ```bash
   cat .sisyphus/execution-state/{session-id}.json
   ```

2. 检查Agent输出
   - 确保输出包含"PHASE 1 COMPLETE"标记
   - 确保成功标准格式正确

#### 问题3: 验证失败

**症状**: 端到端验证失败

**解决方案**:

1. 检查服务是否真正运行
2. 检查验证目标是否正确（URL、端口等）
3. 查看验证证据
4. 手动验证后重试

### 相关文档

- **开发计划**: `docs/统一Agent执行流程开发计划_v1.0_20260116_AI.md`
- **技术审查**: `docs/统一Agent执行流程开发计划_技术审查报告_v1.0_20260116_AI.md`
- **使用指南**: `docs/统一Agent执行流程_使用指南_v1.0_20260116_AI.md`
- **端到端验证系统设计**: `docs/统一Agent执行流程_端到端验证系统设计_v1.0_20260116_AI.md`

---

## Claude SDK Adapter 使用指南

### 概述

Claude SDK Adapter 提供了一个兼容层，允许使用 Claude Agent SDK 的接口与 OpenCode 的代理系统交互。该适配器完全独立，不依赖 Claude Code 可执行文件，只使用 OpenCode 的内部 API。

### 基本使用

#### 1. 在代码中使用

```typescript
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

// 使用bootstrap初始化OpenCode环境
await bootstrap("/path/to/project", async () => {
  const q = query({
    prompt: "请帮我整理当前目录下的文件和文件夹",
    options: {
      cwd: "/path/to/project",
    },
  })

  for await (const message of q) {
    if (message.type === "text") {
      console.log(message.text)
    } else if (message.type === "tool-call") {
      console.log(`工具调用: ${message.toolName}`)
    }
  }
})
```

#### 2. 使用测试脚本

```bash
# 基本使用：整理Downloads文件夹
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/test-usage.ts

# 使用CLI示例（必须在packages/opencode目录下运行）
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "请帮我整理当前目录下的文件" \
  --cwd /home/hzm/Downloads

# 指定工作目录
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "列出所有文件" --cwd /path/to/project

# 恢复会话
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "继续" --resume <session-id> --cwd /path/to/project
```

### 使用示例

#### 示例1：基本查询

```bash
# 在项目目录中创建测试脚本
cd /path/to/your/project
cat > test-adapter.ts << 'EOF'
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

await bootstrap(process.cwd(), async () => {
  const q = query({
    prompt: "列出当前目录下的所有文件",
    options: { cwd: process.cwd() },
  })

  for await (const message of q) {
    if (message.type === "text") {
      process.stdout.write(message.text)
    }
  }
})
EOF

# 运行测试
bun run test-adapter.ts
```

#### 示例2：文件整理任务

```bash
# 整理Downloads文件夹
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/test-usage.ts
```

#### 示例3：自定义权限控制

```typescript
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

await bootstrap("/path/to/project", async () => {
  const q = query({
    prompt: "编辑README文件",
    options: {
      cwd: "/path/to/project",
      canUseTool: async (toolName, input, { signal }) => {
        if (toolName === "edit" || toolName === "write") {
          // 自定义权限逻辑
          console.log(`请求权限: ${toolName}`)
          return { behavior: "ask" } // 或 "allow" / "deny"
        }
        return { behavior: "allow", updatedInput: input }
      },
    },
  })

  for await (const message of q) {
    // 处理消息
  }
})
```

#### 示例4：会话恢复

```typescript
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

const claudeSessionId = "ses_xxxxx" // 从之前的会话获取

await bootstrap("/path/to/project", async () => {
  const q = query({
    prompt: "继续之前的工作",
    options: {
      resume: claudeSessionId,
    },
  })

  for await (const message of q) {
    console.log(message)
  }
})
```

#### 示例5：取消查询

```typescript
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

const abortController = new AbortController()

// 5秒后取消
setTimeout(() => abortController.abort(), 5000)

await bootstrap("/path/to/project", async () => {
  const q = query({
    prompt: "长时间运行的任务",
    options: {
      abortController,
    },
  })

  try {
    for await (const message of q) {
      console.log(message)
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("查询已取消")
    }
  }
})
```

### 数据迁移

#### 从Claude-Cowork迁移数据

```typescript
import { DataMigrator } from "@/claude-sdk-adapter/data-migrator"

const migrator = new DataMigrator()

// 迁移数据
const result = await migrator.migrateFromSQLite(
  "/path/to/claude-cowork.db",
  "project-id", // 可选
)

console.log(`迁移了 ${result.sessionsMigrated} 个会话`)
console.log(`迁移了 ${result.messagesMigrated} 条消息`)

// 验证迁移
const validation = await migrator.validateMigration("/path/to/claude-cowork.db")
if (validation.valid) {
  console.log("迁移验证成功")
} else {
  console.warn("迁移问题:", validation.issues)
}
```

### 快速命令参考

```bash
# === 基本使用
# 使用测试脚本整理Downloads文件夹
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/test-usage.ts

# 使用CLI示例执行任务
bun run src/claude-sdk-adapter/cli-example.ts \
  "请帮我整理 /home/hzm/Downloads 目录下的文件和文件夹"

# === 文件整理任务
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "请帮我整理当前目录下的文件和文件夹" \
  --cwd /home/hzm/Downloads

# === 会话恢复
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "继续" --resume ses_xxxxx --cwd /path/to/project

# === 在代码中使用
# 创建测试文件 test-adapter.ts
cat > test-adapter.ts << 'EOF'
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

await bootstrap(process.cwd(), async () => {
  const q = query({
    prompt: "你的提示",
    options: { cwd: process.cwd() },
  })
  for await (const message of q) {
    console.log(message)
  }
})
EOF

bun run test-adapter.ts
```

### 简单命令示例

类似其他功能的命令格式，Claude SDK Adapter 也提供了简单的命令行使用方式：

```bash
# === 示例1：整理Downloads文件夹
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "请帮我整理当前目录下的文件和文件夹，\
  按文件类型分类并移动到对应文件夹。" \
  --cwd /home/hzm/Downloads

# === 示例2：列出项目文件
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "列出当前目录下的所有文件" \
  --cwd /path/to/project

# === 示例3：代码分析任务
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "分析当前目录下的代码结构，生成项目架构文档。" \
  --cwd /path/to/project
```

### 重要提示

1. **环境初始化**
   - 必须使用 `bootstrap` 函数初始化 OpenCode 环境
   - `bootstrap` 会自动处理实例上下文和依赖初始化

2. **工作目录**
   - 可以在任意目录使用适配器
   - 通过 `cwd` 选项指定工作目录

3. **会话管理**
   - 适配器会自动创建和管理会话
   - 支持通过 `resume` 选项恢复会话

4. **权限控制**
   - 默认使用 OpenCode 的权限系统
   - 可以通过 `canUseTool` 选项自定义权限处理

5. **代码独立性**
   - 适配器完全独立，不依赖 Claude Code 可执行文件
   - 只使用 OpenCode 的内部 API
   - 可以替换为任何兼容 OpenCode API 的后端

### 相关文档

- 详细使用指南: `packages/opencode/src/claude-sdk-adapter
- 快速开始: `packages/opencode/src/claude-sdk-adapter
- API文档: `packages/opencode/src/claude-sdk-adapter
- 代码独立性验证: `packages/opencode/src/claude-sdk-adapter

---

## Skills 使用指南

### 概述

OpenCode 支持通过 Skills 机制扩展 AI Agent 的能力。Skills 是模块化的、自包含的包，提供专业化的知识、工作流程和工具集成。当 Agent 需要处理特定领域的任务时，会自动加载相应的 Skill。

### Skills 发现机制

Skills 可以通过以下位置自动发现：

1. **项目级别**
   - `.opencode/skill/<name>/SKILL.md`
   - `.claude/skills/<name>/SKILL.md`

2. **全局级别**
   - `~/.config/opencode/skill/<name>/SKILL.md`
   - `~/.claude/skills/<name>/SKILL.md`

### 可用 Skills 列表

#### 文档处理类

##### 1. PDF Skill (`pdf`)

**功能**

- PDF 文本和表格提取
- PDF 合并和拆分
- PDF 创建和编辑
- PDF 表单填充
- PDF 元数据提取

**使用场景**

- 提取 PDF 中的文本和表格数据
- 合并多个 PDF 文件
- 创建新的 PDF 文档
- 填充 PDF 表单

**主要工具**

- `pypdf` - 基本操作（合并、拆分、旋转）
- `pdfplumber` - 文本和表格提取
- `reportlab` - PDF 创建
- `qpdf` - 命令行工具

**示例**

```bash
# 提取 PDF 文本
bun dev run "使用pdf skill提取document.pdf中的文本内容"

# 合并多个PDF
bun dev run "使用pdf skill合并file1.pdf和file2.pdf"
```

##### 2. DOCX Skill (`docx`)

**功能**

- Word 文档创建和编辑
- 跟踪更改（修订模式）
- 注释管理
- 格式保留
- 文本提取

**使用场景**

- 创建新的 Word 文档
- 编辑现有文档并保留格式
- 添加跟踪更改（用于文档审查）
- 提取文档内容

**主要工具**

- `docx-js` - 创建新文档（JavaScript
- `pandoc` - 文本提取和转换
- OOXML 库 - 直接编辑 XML

**示例**

```bash
# 创建新文档
bun dev run "使用docx skill创建一个包含标题和段落的Word文档"

# 编辑文档（带跟踪更改）
bun dev run "使用docx skill编辑document.docx，添加跟踪更改"
```

##### 3. PPTX Skill (`pptx`)

**功能**

- PowerPoint 演示文稿创建
- 幻灯片编辑和修改
- 模板使用
- 布局管理
- 注释和演讲者备注

**使用场景**

- 创建新的演示文稿
- 使用模板创建演示文稿
- 编辑现有演示文稿
- 分析演示文稿内容

**主要工具**

- `html2pptx` - HTML 转 PowerPoint
- `PptxGenJS` - JavaScript 创建演示文稿
- OOXML 脚本 - 直接编辑 XML

**示例**

```bash
# 创建新演示文稿
bun dev run "使用pptx skill创建一个关于AI技术的演示文稿"

# 使用模板创建
bun dev run "使用pptx skill基于template.pptx创建新演示文稿"
```

##### 4. XLSX Skill (`xlsx`)

**功能**

- Excel 电子表格创建和编辑
- 公式和计算
- 数据分析和可视化
- 格式化和样式
- 公式重新计算

**使用场景**

- 创建带公式的电子表格
- 分析 Excel 数据
- 修改现有电子表格
- 创建财务模型

**主要工具**

- `pandas` - 数据分析
- `openpyxl` - Excel 文件操作
- `recalc.py` - 公式重新计算

**示例**

```bash
# 创建带公式的电子表格
bun dev run "使用xlsx skill创建一个包含SUM和AVERAGE公式的电子表格"

# 分析数据
bun dev run "使用xlsx skill分析data.xlsx中的数据并生成报告"
```

#### 设计和创作类

##### 5. Frontend Design Skill (`frontend-design`)

**功能**

- 创建高质量前端界面
- 避免通用 AI 美学
- 生产级代码生成
- 创意 UI 设计

**使用场景**

- 构建 Web 组件和页面
- 创建仪表板和着陆页
- 设计 React 组件
- 美化 Web UI

**设计原则**

- 独特的字体选择（避免 Arial、Inter 等通用字体）
- 一致的配色方案
- 动画和微交互
- 创新的布局和空间组合

**示例**

```bash
# 创建前端组件
bun dev run "使用frontend-design skill创建一个响应式仪表板组件"
```

##### 6. Canvas Design Skill (`canvas-design`)

**功能**

- 创建视觉艺术作品
- 设计哲学创建
- PDF 和 PNG 输出
- 原创视觉设计

**使用场景**

- 创建海报和艺术作品
- 设计静态视觉作品
- 生成设计哲学文档

**工作流程**

1. 创建设计哲学（.md 文件）
2. 在画布上表达（.pdf 或 .png 文件）

**示例**

```bash
# 创建艺术作品
bun dev run "使用canvas-design skill创建一个关于未来科技的海报"
```

##### 7. Algorithmic Art Skill (`algorithmic-art`)

**功能**

- 使用 p5.js 创建算法艺术
- 种子随机性和参数探索
- 交互式生成艺术
- 原创算法艺术

**使用场景**

- 创建生成艺术
- 实现粒子系统和流场
- 创建交互式艺术工件

**技术栈**

- p5.js - 生成艺术库
- HTML 工件 - 自包含交互式艺术

**示例**

```bash
# 创建算法艺术
bun dev run "使用algorithmic-art skill创建一个基于流场的生成艺术作品"
```

##### 8. Theme Factory Skill (`theme-factory`)

**功能**

- 应用专业主题到工件
- 10 个预设主题
- 颜色和字体配对
- 自定义主题创建

**可用主题**

1. Ocean Depths - 专业冷静的海洋主题
2. Sunset Boulevard - 温暖活力的日落色彩
3. Forest Canopy - 自然接地的大地色调
4. Modern Minimalist - 简洁现代的无彩色
5. Golden Hour - 丰富温暖的秋季调色板
6. Arctic Frost - 凉爽清新的冬季主题
7. Desert Rose - 柔和精致的尘土色调
8. Tech Innovation - 大胆现代的科技美学
9. Botanical Garden - 新鲜有机的花园色彩
10. Midnight Galaxy - 戏剧性的宇宙深色调

**示例**

```bash
# 应用主题
bun dev run "使用theme-factory skill将Ocean Depths主题应用到演示文稿"
```

##### 9. Brand Guidelines Skill (`brand-guidelines`)

**功能**

- 应用 Anthropic 官方品牌样式
- 品牌颜色和字体
- 智能字体应用
- 形状和强调色

**品牌颜色**

- 主色：Dark (#141413), Light
- 强调色：Orange , Blue , Green

**示例**

```bash
# 应用品牌样式
bun dev run "使用brand-guidelines skill将Anthropic品牌样式应用到文档"
```

#### Web 开发类

##### 10. Web Artifacts Builder Skill (`web-artifacts-builder`)

**功能**

- 创建复杂的多组件 HTML 工件
- React + TypeScript + Tailwind CSS / React + TypeScript + Tailwind CSS
- shadcn/ui 组件 / shadcn
- 单文件 HTML 打包

**技术栈**

- React 18 + TypeScript
- Vite + Parcel（打包）
- Tailwind CSS
- shadcn/ui

**工作流程**

1. 初始化项目：`bash scripts
2. 开发工件
3. 打包为单文件：`bash scripts
4. 显示工件给用户

**示例**

```bash
# 创建Web工件
bun dev run "使用web-artifacts-builder skill创建一个交互式数据可视化仪表板"
```

##### 11. Webapp Testing Skill (`webapp-testing`)

**功能**

- 使用 Playwright 测试本地 Web 应用
- 验证前端功能
- 调试 UI 行为
- 捕获浏览器截图

**主要工具**

- Playwright - 浏览器自动化
- `with_server.py` - 服务器生命周期管理

**示例**

```bash
# 测试Web应用
bun dev run "使用webapp-testing skill测试localhost:5173上的React应用"
```

#### 工具和集成类

##### 12. MCP Builder Skill (`mcp-builder`)

**功能**

- 创建高质量的 MCP 服务器
- Python 和 Node
- 工具设计和实现
- 评估创建

**工作流程**

1. 深度研究和规划
2. 实现核心基础设施
3. 实现工具
4. 审查和测试
5. 创建评估

**示例**

```bash
# 创建MCP服务器
bun dev run "使用mcp-builder skill创建一个GitHub API的MCP服务器"
```

##### 13. Skill Creator Skill (`skill-creator`)

**功能**

- 创建有效的 Skills 指南
- 技能创建流程
- 最佳实践
- 技能打包

**工作流程**

1. 理解技能（通过具体示例）
2. 规划可重用内容
3. 初始化技能：`scripts
4. 编辑技能
5. 打包技能：`scripts
6. 迭代

**示例**

```bash
# 创建新技能
bun dev run "使用skill-creator skill创建一个新的数据处理技能"
```

#### 通信和协作类

##### 14. Internal Comms Skill (`internal-comms`)

**功能**

- 编写各种内部通信
- 3P 更新（进度、计划、问题）
- 公司通讯和 FAQ
- 状态报告和项目更新

**支持的格式**

- 3P 更新
- 公司通讯
- FAQ 回答
- 一般通信

**示例**

```bash
# 编写内部通信
bun dev run "使用internal-comms skill编写本周的3P更新"
```

##### 15. Doc Coauthoring Skill (`doc-coauthoring`)

**功能**

- 结构化文档协作工作流
- 上下文收集
- 细化和结构
- 读者测试

**工作流程**

1. **阶段1：上下文收集** - 用户提供所有相关上下文
2. **阶段2：细化和结构** - 逐节构建文档
3. **阶段3：读者测试** - 使用新的 Claude 实例测试文档

**示例**

```bash
# 协作编写文档
bun dev run "使用doc-coauthoring skill协作编写技术规范文档"
```

#### 创意和媒体类

##### 16. Slack GIF Creator Skill (`slack-gif-creator`)

**功能**

- 创建优化的 Slack GIF
- 动画概念和工具
- 验证和优化
- PIL 图形绘制

**Slack 要求**

- Emoji GIFs: 128x128
- Message GIFs: 480x480
- FPS: 10-30
- 颜色：48-128

**示例**

```bash
# 创建Slack GIF
bun dev run "使用slack-gif-creator skill创建一个跳动的星星GIF用于Slack"
```

#### 外部 Skills

以下 Skills 需要从外部源获取完整文件：

- **brand-voice-guard**: https://agentskills.io/skills/brand-voice-guard
- **presentation-builder**: https://agentskills.io/skills/presentation-builder
- **git-pr-reviewer**: https://agentskills.io/skills/git-pr-reviewer
- **linear-integration**: https://agentskills.io/skills/linear-integration
- **pdf-deep-reader**: https://agentskills.io/skills/pdf-deep-reader
- **postgres-admin**: https://agentskills.io/skills/postgres-admin

### 使用 Skills

#### 自动触发

Skills 会根据任务描述自动触发。当 Agent 识别到需要特定领域知识时，会自动加载相应的 Skill。

#### 显式引用

你也可以在任务描述中显式引用 Skill：

```bash
# 使用特定Skill
bun dev run "使用pdf skill提取document.pdf中的表格数据"

# 使用多个Skills
bun dev run "使用pptx skill和theme-factory skill创建一个关于AI的演示文稿，应用Modern Minimalist主题"
```

#### 技能组合使用

多个 Skills 可以组合使用来完成复杂任务：

```bash
# 组合使用多个Skills
bun dev run "使用docx skill创建文档，使用frontend-design skill创建配套的Web界面，使用theme-factory skill应用统一主题"
```

### Skills 最佳实践

1. **明确任务描述**
2. **组合使用**
3. **验证输出**
4. **查看 Skill 文档** / **Review Skill Documentation**: 每个 Skill 都有详细的文档，可以在 `skills/<name>

### 故障排查

#### Skill 未自动加载

如果 Skill 未自动加载，可以：

- 在任务描述中显式引用 Skill 名称
- 检查 Skill 文件是否存在于标准位置
- 验证 Skill 的 `description` 字段是否准确描述了功能

#### Skill 功能不工作

- 检查依赖项是否已安装
- 查看 Skill 文档中的依赖项要求
- 验证脚本文件是否有执行权限

---

## 快速参考

### 新任务开始检查清单

在开始任何新任务前，请确认：

- [ ] ✅ 已使用 `plan` agent 制定计划
- [ ] ✅ 计划文档已保存到 `docs/` 目录
- [ ] ✅ 计划文档包含中英文对照
- [ ] ✅ 计划文档包含完整的任务分解
- [ ] ✅ 已审查计划并确认可行性
- [ ] ✅ 准备使用 `build` agent 开始实施

### 常用命令速查

**工作目录说明**
所有命令都可以在任意目录运行。如果从项目目录运行，OpenCode 会自动使用当前目录；如果从 OpenCode 目录运行，可以在命令末尾指定项目路径。

**Working Directory Note**:

**全局命令配置**
如果已配置全局 `opencode-dev` 命令（见 [全局配置]），可以在任意目录直接使用 `opencode-dev` 代替 `bun dev`。

**Global Command Configuration**:

```bash
# === 在项目目录中运行（推荐）/ Run in project directory (Recommended) ===
cd /path/to/your/project

# 制定计划
bun dev run --agent plan --model opencode/gpt-5-nano \
  "任务描述。保存到docs/任务名_plan_v1.0_$(date +%Y%m%d)_AI.md"

# 实施代码
bun dev run --agent build --model opencode/grok-code \
  "根据docs/任务名_plan_v1.0_日期_AI.md实施..."

# 编译和修复
bun dev run --agent build --model opencode/grok-code \
  "编译项目并修复所有错误"

# 更新文档
bun dev run --agent plan --model opencode/gpt-5-nano \
  "更新docs/任务名_status_v1.0_日期_AI.md"

# === Oh My OpenCode 使用
# 使用 ultrawork 模式处理复杂任务
opencode run "ultrawork: 重构整个项目的TypeScript代码"

# 使用专业化 Agent
opencode run "@oracle 分析这个项目的架构"
opencode run "@librarian 查找React Hooks的最佳实践"
opencode run "@frontend-ui-ux-engineer 创建一个React组件"

# 组合使用：ultrawork + 专业化 Agent
opencode run "ultrawork: @oracle 分析架构，@frontend-ui-ux-engineer 实现前端"

# 与计划工作流结合
opencode run --agent plan "@oracle 分析需求，制定详细计划" --model opencode/gpt-5-nano
opencode run --agent build "ultrawork: 根据计划文档实施" --model opencode/grok-code

# === 统一Agent执行流程使用
# 自动触发统一流程（使用触发关键词）
bun dev run "帮我将当前的项目demo运行起来"
bun dev run "自动完成用户登录功能"
bun dev run "帮我运行demo"

# 显式触发统一流程
bun dev run "unified-flow: 运行demo"
bun dev run "统一流程: 修复登录bug"

# 与plan agent结合
bun dev run --agent plan "帮我制定详细计划：实现用户认证系统"

# 与build agent结合
bun dev run --agent build "帮我将当前的项目demo运行起来"

# 与ultrawork模式结合
bun dev run "ultrawork: 帮我完成整个项目的重构"

# === 从OpenCode目录运行（指定项目路径）/ Run from OpenCode directory (specify project path) ===
cd /media/hzm/Data/github/opencode

# 制定计划（指定项目路径）/ Create plan (specify project path)
bun dev run --agent plan --model opencode/gpt-5-nano \
  "任务描述。保存到docs/任务名_plan_v1.0_$(date +%Y%m%d)_AI.md" \
  /path/to/your/project

# 实施代码（指定项目路径）/ Implement code (specify project path)
bun dev run --agent build --model opencode/grok-code \
  "根据docs/任务名_plan_v1.0_日期_AI.md实施..." \
  /path/to/your/project

# === Claude SDK Adapter 使用
# 使用测试脚本（整理Downloads文件夹）
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/test-usage.ts

# 使用CLI示例（必须在packages/opencode目录下运行）
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "请帮我整理当前目录下的文件" \
  --cwd /home/hzm/Downloads

# 指定工作目录
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "列出所有文件" --cwd /path/to/project

# 恢复会话
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "继续" --resume ses_xxxxx --cwd /path/to/project
```
