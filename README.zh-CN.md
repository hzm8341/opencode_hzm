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

在开始任何新任务前，**必须先使用 `plan` agent 制定详细计划**，然后使用 `build` agent 逐步实施。这能提高代码质量、减少返工，并便于追踪进度。

```bash
# 步骤1：制定计划
bun dev run --agent plan --model opencode/gpt-5-nano \
  "请制定详细计划：[你的任务]。保存到docs/任务名_plan_v1.0_$(date +%Y%m%d)_AI.md"

# 步骤2：根据计划实施
bun dev run --agent build --model opencode/grok-code \
  "根据docs/任务名_plan_v1.0_日期_AI.md实施..."
```

详细使用说明请查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md)。

### 高级功能

#### Oh My OpenCode 插件

将你的 AI Agent 转变为完整的开发团队，提供专业化 Agent、ultrawork 模式和并行任务执行。

**主要特性：**
- 🤖 **专业化 Agent 团队** - Oracle、Librarian、Explore、Frontend Engineer 等
- 🔄 **Sisyphus Agent** - 永不放弃机制，自动重试和错误修复
- 🪄 **Ultrawork 模式** - 处理复杂任务，自动分解和并行执行
- 🛠️ **LSP/AST 工具** - 高级代码分析能力

```bash
# 安装
bunx oh-my-opencode install

# 使用 ultrawork 模式
opencode run "ultrawork: 重构整个 TypeScript 代码库"

# 使用专业化 Agent
opencode run "@oracle 分析项目架构"
opencode run "@librarian 查找 React Hooks 最佳实践"
```

更多信息请查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md#oh-my-opencode-插件使用指南)。

#### Claude SDK Adapter

兼容层，允许使用 Claude Agent SDK 接口与 OpenCode 的代理系统交互。完全独立，仅使用 OpenCode 的内部 API。

```typescript
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

await bootstrap("/path/to/project", async () => {
  const q = query({
    prompt: "整理当前目录下的文件",
    options: { cwd: "/path/to/project" },
  })
  
  for await (const message of q) {
    console.log(message)
  }
})
```

更多信息请查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md#claude-sdk-adapter-使用指南)。

#### Skills 系统

通过模块化、自包含的技能包扩展 AI Agent 的能力，提供专业化领域支持。

**可用 Skills：**
- 📄 **文档处理**：PDF、DOCX、PPTX、XLSX
- 🎨 **设计与创作**：Frontend Design、Canvas Design、Algorithmic Art、Theme Factory
- 🌐 **Web 开发**：Web Artifacts Builder、Webapp Testing
- 🛠️ **工具与集成**：MCP Builder、Skill Creator
- 💬 **通信协作**：Internal Comms、Doc Coauthoring

Skills 会在需要时自动发现和加载。你也可以显式引用它们：

```bash
# 使用 PDF skill
bun dev run "使用pdf skill提取document.pdf中的文本"

# 组合使用多个 skills
bun dev run "使用pptx skill和theme-factory skill创建演示文稿，应用Modern Minimalist主题"
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
