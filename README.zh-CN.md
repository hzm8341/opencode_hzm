<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenCode logo">
    </picture>
  </a>
</p>
<p align="center">开源的 AI Coding Agent。</p>
<p align="center">
  <a href="https://opencode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/opencode-ai"><img alt="npm" src="https://img.shields.io/npm/v/opencode-ai?style=flat-square" /></a>
  <a href="https://github.com/anomalyco/opencode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/anomalyco/opencode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

[![OpenCode Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://opencode.ai)

---

### 安装

```bash
# 直接安装 (YOLO)
curl -fsSL https://opencode.ai/install | bash

# 软件包管理器
npm i -g opencode-ai@latest        # 也可使用 bun/pnpm/yarn
scoop bucket add extras; scoop install extras/opencode  # Windows
choco install opencode             # Windows
brew install opencode              # macOS 和 Linux
paru -S opencode-bin               # Arch Linux
mise use -g opencode               # 任意系统
nix run nixpkgs#opencode           # 或用 github:anomalyco/opencode 获取最新 dev 分支
```

> [!TIP]
> 安装前请先移除 0.1.x 之前的旧版本。

### 桌面应用程序 (BETA)

OpenCode 也提供桌面版应用。可直接从 [发布页 (releases page)](https://github.com/anomalyco/opencode/releases) 或 [opencode.ai/download](https://opencode.ai/download) 下载。

| 平台                  | 下载文件                              |
| --------------------- | ------------------------------------- |
| macOS (Apple Silicon) | `opencode-desktop-darwin-aarch64.dmg` |
| macOS (Intel)         | `opencode-desktop-darwin-x64.dmg`     |
| Windows               | `opencode-desktop-windows-x64.exe`    |
| Linux                 | `.deb`、`.rpm` 或 AppImage            |

```bash
# macOS (Homebrew Cask)
brew install --cask opencode-desktop
```

#### 安装目录

安装脚本按照以下优先级决定安装路径：

1. `$OPENCODE_INSTALL_DIR` - 自定义安装目录
2. `$XDG_BIN_DIR` - 符合 XDG 基础目录规范的路径
3. `$HOME/bin` - 如果存在或可创建的用户二进制目录
4. `$HOME/.opencode/bin` - 默认备用路径

```bash
# 示例
OPENCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://opencode.ai/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://opencode.ai/install | bash
```

### 主要特性

- 🤖 **多模型支持** - 支持 Claude、OpenAI、Google 或本地模型
- 🖥️ **终端界面** - 专为终端用户打造的强大 TUI
- 🌐 **Web 界面** - 可通过浏览器或桌面应用访问
- 🔌 **插件系统** - 可扩展，支持 Oh My OpenCode 等插件
- 📝 **LSP 支持** - 开箱即用的语言服务器协议支持
- 🔐 **多代理系统** - 针对不同任务的专业化代理

### Agents

OpenCode 内置两种 Agent，可用 `Tab` 键快速切换：

- **build** - 默认模式，具备完整权限，适合开发工作
- **plan** - 只读模式，适合代码分析与探索
  - 默认拒绝修改文件
  - 运行 bash 命令前会询问
  - 便于探索未知代码库或规划改动

另外还包含一个 **general** 子 Agent，用于复杂搜索和多步任务，内部使用，也可在消息中输入 `@general` 调用。

了解更多 [Agents](https://opencode.ai/docs/agents) 相关信息。

### 工作流程最佳实践

**⚠️ 计划优先原则**

**在开始任何新任务前，必须先使用 `plan` agent 制定详细计划并保存为文档，然后使用 `build` agent 逐步实施。这是一个强制性要求，不是可选项。**

**为什么？**

- ✅ 提高代码质量和可维护性
- ✅ 减少返工和错误
- ✅ 便于追踪进度和问题解决
- ✅ 知识沉淀和团队协作

```bash
# 步骤1：制定计划
bun dev run --agent plan --model opencode/gpt-5-nano \
  "请制定详细计划：[你的任务]。保存到docs/任务名_plan_v1.0_$(date +%Y%m%d)_AI.md"

# 步骤2：根据计划实施
bun dev run --agent build --model opencode/grok-code \
  "根据docs/任务名_plan_v1.0_日期_AI.md实施..."
```

**完整示例：**

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
  请将计划保存到docs/ocs2_mpc_ros2_node_plan_v1.0_$(date +%Y%m%d)_AI.md，使用中英文对照格式。"

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

详细使用说明请查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md)。

### 高级功能

#### Oh My OpenCode 插件

将你的 AI Agent 转变为完整的开发团队，提供专业化 Agent、ultrawork 模式、并行任务执行、规则注入系统和统一 Agent 执行流程。

**主要特性：**
- 🤖 **专业化 Agent 团队** - Oracle、Librarian、Explore、Frontend Engineer 等
- 🔄 **Sisyphus Agent** - 永不放弃机制，自动重试和错误修复
- 🪄 **Ultrawork 模式** - 处理复杂任务，自动分解和并行执行
- 🛠️ **LSP/AST 工具** - 高级代码分析能力
- 📝 **规则注入系统** - 定义和执行统一的 AI Agent 行为规则
- 🔄 **统一 Agent 执行流程** - 自动触发完整的 6 步执行流程

```bash
# 安装
bunx oh-my-opencode install

# 使用 ultrawork 模式
opencode run "ultrawork: 重构整个 TypeScript 代码库"

# 使用专业化 Agent
opencode run "@oracle 分析项目架构"
opencode run "@librarian 查找 React Hooks 最佳实践"

# 使用统一执行流程（自动任务完成）
bun dev run "帮我将当前的项目demo运行起来"
opencode run "unified-flow: 运行demo"
```

##### 规则注入系统

一个强大的增强功能，允许你在所有项目中为 AI Agent 定义和执行统一的行为规则，确保代码质量，避免"AI代码泛滥"问题，提升团队协作效率。

**主要特性：**

- 📝 **规则文件管理** - 支持 `.mdc` 和 `.md` 格式的规则文件，使用 frontmatter 进行配置
- 🗂️ **多级配置** - 支持项目级 (`.claude/rules/`) 和用户级 (`~/.claude/rules/`) 规则
- 🎯 **智能匹配** - 基于 `globs` 模式匹配文件类型，支持 `alwaysApply: true` 始终生效规则
- ⚙️ **自动注入** - 通过 `rules-injector` 钩子自动将匹配的规则注入 AI Agent 上下文
- 🔄 **实时生效** - 规则修改后立即生效，无需重启 Agent
- 📋 **全面覆盖** - 支持代码风格、文件命名、文档管理、工作流程等各类规则

```bash
# 创建规则目录
mkdir -p .claude/rules

# 示例规则文件：python-rules.mdc
cat > .claude/rules/python-rules.mdc << 'EOF'
---
description: "Python代码规则"
globs: ["*.py"]
---

## Python代码规则

- 遵循PEP 8规范
- 使用类型注解（Type Hints）
- 避免使用`as any`等类型忽略语句
- 优先使用PyTorch进行深度学习实现
EOF

# 验证规则是否生效
bun dev run "创建一个简单的Python函数，计算斐波那契数列"
```

##### 统一 Agent 执行流程

一个核心功能，通过一句话输入自动触发完整的 6 步执行流程，从任务解析到结果交付，全程自动化执行。

**6 步执行流程：**

1. **阶段 1：任务解析** - 理解核心需求，明确交付标准
2. **阶段 2：智能拆解** - 分解为可执行步骤，确定资源需求
3. **阶段 3：并行执行** - 多线程收集/处理，实时进度跟踪
4. **阶段 4：综合构建** - 信息融合，逻辑构建
5. **阶段 5：质量保证** - 自检修正，端到端验证
6. **阶段 6：结果交付** - 按需格式化，附上执行摘要

**自动触发：**

```bash
# 自动统一流程触发的示例
bun dev run "帮我将当前的项目demo运行起来"
bun dev run "自动完成用户登录功能"
bun dev run "帮我运行demo"
```

**主要特性：**

- 🎯 **自动任务识别** - 自动识别任务类型，提取成功标准
- 📋 **智能拆解** - 自动创建详细计划并通过审查
- ⚡ **并行执行** - 多线程处理，实时进度跟踪
- 🔨 **综合构建** - 信息融合，逻辑构建
- ✅ **质量保证** - 自检修正，端到端验证
- 📦 **结果交付** - 按需格式化，执行摘要

更多信息请查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md#oh-my-opencode-插件使用指南)。

#### Claude SDK Adapter

一个兼容层，允许使用 Claude Agent SDK 的接口与 OpenCode 的代理系统交互。完全独立实现，仅使用 OpenCode 的内部 API - 不依赖 Claude Code 可执行文件。

**主要特性：**

- 🎯 **完全兼容** - 无缝使用 Claude Agent SDK 接口与 OpenCode
- 🔄 **会话管理** - 自动会话创建和管理恢复能力
- 🛡️ **权限控制** - 通过 `canUseTool` 回调自定义工具使用权限
- ⚡ **实时流式传输** - 异步消息流式传输，完全支持 TypeScript
- 🏗️ **架构独立** - 完全独立于 Claude Code，可以替换为任何兼容 OpenCode API 的后端

**基本使用：**

```typescript
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

await bootstrap("/path/to/project", async () => {
  const q = query({
    prompt: "整理当前目录下的文件",
    options: { cwd: "/path/to/project" },
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

**高级使用：**

```typescript
// 会话恢复
const q = query({
  prompt: "继续之前的工作",
  options: {
    resume: "ses_previous_session_id",
    cwd: "/path/to/project"
  }
})

// 自定义权限
const q = query({
  prompt: "编辑README文件",
  options: {
    canUseTool: async (toolName, input, { signal }) => {
      if (toolName === "edit" || toolName === "write") {
        return { behavior: "ask" } // "allow" / "deny"
      }
      return { behavior: "allow", updatedInput: input }
    }
  }
})

// 取消支持
const abortController = new AbortController()
setTimeout(() => abortController.abort(), 5000)

const q = query({
  prompt: "长时间运行的任务",
  options: { abortController }
})
```

**快速示例：**

```bash
# 测试使用（整理Downloads文件夹）
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/test-usage.ts

# CLI 示例
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "整理当前目录下的文件" \
  --cwd /home/hzm/Downloads

# 恢复会话
bun run src/claude-sdk-adapter/cli-example.ts \
  "继续" --resume ses_xxxxx --cwd /path/to/project
```

更多信息请查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md#claude-sdk-adapter-使用指南)。

#### Skills 系统

通过模块化、自包含的技能包扩展 AI Agent 的能力，提供专业化领域支持。当 Agent 需要处理特定领域的任务时，会自动加载相应的 Skill。

**可用 Skills：**

##### 文档处理类

- **PDF Skill** (`pdf`) - PDF 文本和表格提取、合并、拆分、创建、编辑、元数据提取
- **DOCX Skill** (`docx`) - Word 文档创建和编辑、跟踪更改（修订模式）、格式保留、文本提取
- **PPTX Skill** (`pptx`) - PowerPoint 演示文稿创建、幻灯片编辑、模板使用、布局管理、注释和演讲者备注
- **XLSX Skill** (`xlsx`) - Excel 电子表格创建和编辑、公式和计算、数据分析和可视化、格式化和样式、公式重新计算

##### 设计和创作类

- **Frontend Design Skill** (`frontend-design`) - 创建高质量前端界面、避免通用 AI 美学、生产级代码生成、创意 UI 设计
- **Canvas Design Skill** (`canvas-design`) - 创建视觉艺术作品、设计哲学创建、PDF 和 PNG 输出、原创视觉设计
- **Algorithmic Art Skill** (`algorithmic-art`) - 使用 p5.js 创建算法艺术、种子随机性和参数探索、交互式生成艺术
- **Theme Factory Skill** (`theme-factory`) - 应用专业主题到工件、10 个预设主题、颜色和字体配对、自定义主题创建

##### Web 开发类

- **Web Artifacts Builder Skill** (`web-artifacts-builder`) - 创建复杂的多组件 HTML 工件、React + TypeScript + Tailwind CSS / React + TypeScript + Tailwind CSS、shadcn/ui 组件、单文件 HTML 打包
- **Webapp Testing Skill** (`webapp-testing`) - 使用 Playwright 测试本地 Web 应用、验证前端功能、调试 UI 行为、捕获浏览器截图

##### 工具和集成类

- **MCP Builder Skill** (`mcp-builder`) - 创建高质量的 MCP 服务器、Python 和 Node.js、工具设计和实现、评估创建
- **Skill Creator Skill** (`skill-creator`) - 创建有效的 Skills 指南、技能创建流程、最佳实践、技能打包

##### 通信和协作类

- **Internal Comms Skill** (`internal-comms`) - 编写各种内部通信、3P 更新（进度、计划、问题）、公司通讯和 FAQ、状态报告和项目更新
- **Doc Coauthoring Skill** (`doc-coauthoring`) - 结构化文档协作工作流、上下文收集、细化和结构、读者测试

**Skills 发现机制：**

Skills 可以通过以下位置自动发现：

1. **项目级别** - `.opencode/skill/<name>/SKILL.md`、`.claude/skills/<name>/SKILL.md`
2. **全局级别** - `~/.config/opencode/skill/<name>/SKILL.md`、`~/.claude/skills/<name>/SKILL.md`

**使用示例：**

```bash
# 自动技能加载（推荐）
bun dev run "提取document.pdf中的文本"

# 显式技能引用
bun dev run "使用pdf skill提取document.pdf中的文本"

# 组合使用多个 skills
bun dev run "使用pptx skill和theme-factory skill创建演示文稿，应用Modern Minimalist主题"

# 复杂工作流使用 skills
bun dev run "使用frontend-design skill创建一个响应式仪表板组件"
```

更多信息请查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md#skills-使用指南)。

### 文档

更多配置说明请查看我们的 [**官方文档**](https://opencode.ai/docs)。

- **使用指南**: [USAGE_GUIDE.md](./USAGE_GUIDE.md) - 包含安装、配置、工作流程和高级功能的完整指南

### 参与贡献

如有兴趣贡献代码，请在提交 PR 前阅读 [贡献指南 (Contributing Docs)](./CONTRIBUTING.md)。

### 基于 OpenCode 进行开发

如果你在项目名中使用了 “opencode”（如 “opencode-dashboard” 或 “opencode-mobile”），请在 README 里注明该项目不是 OpenCode 团队官方开发，且不存在隶属关系。

### 常见问题 (FAQ)

#### 这和 Claude Code 有什么不同？

功能上很相似，关键差异：

- 100% 开源。
- 不绑定特定提供商。推荐使用 [OpenCode Zen](https://opencode.ai/zen) 的模型，但也可搭配 Claude、OpenAI、Google 甚至本地模型。模型迭代会缩小差异、降低成本，因此保持 provider-agnostic 很重要。
- 内置 LSP 支持。
- 聚焦终端界面 (TUI)。OpenCode 由 Neovim 爱好者和 [terminal.shop](https://terminal.shop) 的创建者打造，会持续探索终端的极限。
- 客户端/服务器架构。可在本机运行，同时用移动设备远程驱动。TUI 只是众多潜在客户端之一。

#### 另一个同名的仓库是什么？

另一个名字相近的仓库与本项目无关。[点击这里了解背后故事](https://x.com/thdxr/status/1933561254481666466)。

---

**加入我们的社区** [Discord](https://discord.gg/opencode) | [X.com](https://x.com/opencode)
