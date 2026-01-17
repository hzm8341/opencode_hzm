<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenCode logo">
    </picture>
  </a>
</p>
<p align="center">The open source AI coding agent.</p>
<p align="center">
  <a href="https://opencode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/opencode-ai"><img alt="npm" src="https://img.shields.io/npm/v/opencode-ai?style=flat-square" /></a>
  <a href="https://github.com/anomalyco/opencode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/anomalyco/opencode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

[![OpenCode Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://opencode.ai)

---

### Installation

```bash
# YOLO
curl -fsSL https://opencode.ai/install | bash

# Package managers
npm i -g opencode-ai@latest        # or bun/pnpm/yarn
scoop bucket add extras; scoop install extras/opencode  # Windows
choco install opencode             # Windows
brew install opencode              # macOS and Linux
paru -S opencode-bin               # Arch Linux
mise use -g opencode               # Any OS
nix run nixpkgs#opencode           # or github:anomalyco/opencode for latest dev branch
```

> [!TIP]
> Remove versions older than 0.1.x before installing.

### Desktop App (BETA)

OpenCode is also available as a desktop application. Download directly from the [releases page](https://github.com/anomalyco/opencode/releases) or [opencode.ai/download](https://opencode.ai/download).

| Platform              | Download                              |
| --------------------- | ------------------------------------- |
| macOS (Apple Silicon) | `opencode-desktop-darwin-aarch64.dmg` |
| macOS (Intel)         | `opencode-desktop-darwin-x64.dmg`     |
| Windows               | `opencode-desktop-windows-x64.exe`    |
| Linux                 | `.deb`, `.rpm`, or AppImage           |

```bash
# macOS (Homebrew)
brew install --cask opencode-desktop
```

#### Installation Directory

The install script respects the following priority order for the installation path:

1. `$OPENCODE_INSTALL_DIR` - Custom installation directory
2. `$XDG_BIN_DIR` - XDG Base Directory Specification compliant path
3. `$HOME/bin` - Standard user binary directory (if exists or can be created)
4. `$HOME/.opencode/bin` - Default fallback

```bash
# Examples
OPENCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://opencode.ai/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://opencode.ai/install | bash
```

### Key Features

- 🤖 **Multi-model support** - Works with Claude, OpenAI, Google, or local models
- 🖥️ **Terminal interface** - Built for terminal users with powerful TUI
- 🌐 **Web interface** - Access via browser or desktop app
- 🔌 **Plugin system** - Extensible with plugins like Oh My OpenCode
- 📝 **LSP support** - Out-of-the-box language server protocol support
- 🔐 **Multi-agent system** - Specialized agents for different tasks

### Agents

OpenCode includes two built-in agents you can switch between with the `Tab` key.

- **build** - Default, full access agent for development work
- **plan** - Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also, included is a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

Learn more about [agents](https://opencode.ai/docs/agents).

### Workflow Best Practices

**⚠️ Planning First Principle**

Before starting any new task, **always create a detailed plan** using the `plan` agent, then implement it step by step with the `build` agent. This ensures better code quality, reduces rework, and facilitates progress tracking.

```bash
# Step 1: Create a plan
bun dev run --agent plan --model opencode/gpt-5-nano \
  "Create a detailed plan: [your task]. Save to docs/task_plan_v1.0_$(date +%Y%m%d)_AI.md"

# Step 2: Implement based on the plan
bun dev run --agent build --model opencode/grok-code \
  "Implement according to docs/task_plan_v1.0_date_AI.md"
```

For detailed usage instructions, see [USAGE_GUIDE.md](./USAGE_GUIDE.md).

### Advanced Features

#### Oh My OpenCode Plugin

Transform your AI agent into a full development team with specialized agents, ultrawork mode, and parallel task execution.

**Key Features:**
- 🤖 **Specialized Agent Team** - Oracle, Librarian, Explore, Frontend Engineer, and more
- 🔄 **Sisyphus Agent** - Never-give-up mechanism with automatic retry and error fixing
- 🪄 **Ultrawork Mode** - Handle complex tasks with automatic task decomposition and parallel execution
- 🛠️ **LSP/AST Tools** - Advanced code analysis capabilities

```bash
# Install
bunx oh-my-opencode install

# Use ultrawork mode
opencode run "ultrawork: Refactor the entire TypeScript codebase"

# Use specialized agents
opencode run "@oracle Analyze the project architecture"
opencode run "@librarian Find React Hooks best practices"
```

Learn more in [USAGE_GUIDE.md](./USAGE_GUIDE.md#oh-my-opencode-插件使用指南).

#### Claude SDK Adapter

A compatibility layer that allows using Claude Agent SDK interfaces with OpenCode's agent system. Fully independent, using only OpenCode's internal APIs.

```typescript
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

await bootstrap("/path/to/project", async () => {
  const q = query({
    prompt: "Organize files in the current directory",
    options: { cwd: "/path/to/project" },
  })
  
  for await (const message of q) {
    console.log(message)
  }
})
```

Learn more in [USAGE_GUIDE.md](./USAGE_GUIDE.md#claude-sdk-adapter-使用指南).

#### Skills System

Extend AI Agent capabilities with modular, self-contained skill packages for specialized domains.

**Available Skills:**
- 📄 **Document Processing**: PDF, DOCX, PPTX, XLSX
- 🎨 **Design & Creation**: Frontend Design, Canvas Design, Algorithmic Art, Theme Factory
- 🌐 **Web Development**: Web Artifacts Builder, Webapp Testing
- 🛠️ **Tools & Integration**: MCP Builder, Skill Creator
- 💬 **Communication**: Internal Comms, Doc Coauthoring

Skills are automatically discovered and loaded when needed. You can also explicitly reference them:

```bash
# Use PDF skill
bun dev run "Use pdf skill to extract text from document.pdf"

# Combine multiple skills
bun dev run "Use pptx skill and theme-factory skill to create a presentation with Modern Minimalist theme"
```

Learn more in [USAGE_GUIDE.md](./USAGE_GUIDE.md#skills-使用指南).

### Documentation

For more info on how to configure OpenCode [**head over to our docs**](https://opencode.ai/docs).

- **Usage Guide**: [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Comprehensive guide with installation, configuration, workflows, and advanced features

### Contributing

If you're interested in contributing to OpenCode, please read our [contributing docs](./CONTRIBUTING.md) before submitting a pull request.

### Building on OpenCode

If you are working on a project that's related to OpenCode and is using "opencode" as a part of its name; for example, "opencode-dashboard" or "opencode-mobile", please add a note to your README to clarify that it is not built by the OpenCode team and is not affiliated with us in any way.

### FAQ

#### How is this different from Claude Code?

It's very similar to Claude Code in terms of capability. Here are the key differences:

- 100% open source
- Not coupled to any provider. Although we recommend the models we provide through [OpenCode Zen](https://opencode.ai/zen); OpenCode can be used with Claude, OpenAI, Google or even local models. As models evolve the gaps between them will close and pricing will drop so being provider-agnostic is important.
- Out of the box LSP support
- A focus on TUI. OpenCode is built by neovim users and the creators of [terminal.shop](https://terminal.shop); we are going to push the limits of what's possible in the terminal.
- A client/server architecture. This for example can allow OpenCode to run on your computer, while you can drive it remotely from a mobile app. Meaning that the TUI frontend is just one of the possible clients.

---

**Join our community** [Discord](https://discord.gg/opencode) | [X.com](https://x.com/opencode)
