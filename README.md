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

#### Installing from Source (Windows)

For Windows users who want to install from source, we provide automated setup scripts:

**Quick Setup (Recommended):**
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows-simple.ps1
```

**Full Setup (with system checks and verification):**
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows-environment-en.ps1
```

These scripts will:
- ✅ Check system requirements (Windows 10+, PowerShell 5.1+)
- ✅ Automatically install Bun (if not installed)
- ✅ Configure PATH environment variable
- ✅ Install project dependencies
- ✅ Verify installation

For more details, see [Windows Setup Guide](WINDOWS_SETUP_README.md) or [Windows Installation Guide](docs/Windows环境安装配置指南_v1.0_20260122_AI.md).

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

**Before starting ANY new task, you MUST use the `plan` agent to create a detailed plan and save it as documentation, then implement it step by step with the `build` agent. This is a mandatory requirement, not an option.**

**Why?**

- ✅ Improves code quality and maintainability
- ✅ Reduces rework and errors
- ✅ Facilitates progress tracking and problem resolution
- ✅ Creates knowledge base and enables team collaboration

```bash
# Step 1: Create a plan
bun dev run --agent plan --model opencode/gpt-5-nano \
  "Create a detailed plan: [your task]. Save to docs/task_plan_v1.0_$(date +%Y%m%d)_AI.md"

# Step 2: Implement based on the plan
bun dev run --agent build --model opencode/grok-code \
  "Implement according to docs/task_plan_v1.0_date_AI.md"
```

**Complete Example:**

```bash
# === Phase 1: Planning
# Use plan agent + text-processing skill to create plan
bun dev run --agent plan --model opencode/gpt-5-nano \
  "Create detailed plan: Encapsulate OCS2 MPC algorithm into ROS2 node.\
  Plan must include:\
  1. Code structure analysis\
  2. ROS2 node design\
  3. Interface definition\
  4. Implementation steps (staged)\
  5. Testing plan\
  6. Risk assessment\
  Save to docs/ocs2_mpc_ros2_node_plan_v1.0_$(date +%Y%m%d)_AI.md with bilingual format."

# === Phase 2: Plan Review
# Review the generated plan document and confirm feasibility
cat docs/ocs2_mpc_ros2_node_plan_v1.0_*.md

# === Phase 3: Implementation
# Implement based on plan document using build agent + code-generation skill
bun dev run --agent build --model opencode/grok-code \
  "Implement Phase B (ROS2 package and interface prototype) according to plan document docs/ocs2_mpc_ros2_node_plan_v1.0_date_AI.md.\
  Use code-generation skill to guide code implementation."

# === Phase 4: Compilation & Verification
# If compilation errors occur, let OpenCode automatically fix them
bun dev run --agent build --model opencode/grok-code \
  "Compile /media/hzm/Data/github/ocs2/ocs2_mpc_ros2_node package,\
  and automatically fix all compilation errors."

# === Phase 5: Documentation Update
# Update implementation status documentation
bun dev run --agent plan --model opencode/gpt-5-nano \
  "Update docs/ocs2_mpc_ros2_node_implementation_status_v1.0_date_AI.md,\
  record completed work, problems encountered and solutions."
```

For detailed usage instructions, see [USAGE_GUIDE.md](./USAGE_GUIDE.md).

### Advanced Features

#### Oh My OpenCode Plugin

Transform your AI agent into a full development team with specialized agents, ultrawork mode, parallel task execution, rules injection system, and unified agent execution flow.

**Key Features:**

- 🤖 **Specialized Agent Team** - Oracle, Librarian, Explore, Frontend Engineer, and more
- 🔄 **Sisyphus Agent** - Never-give-up mechanism with automatic retry and error fixing
- 🪄 **Ultrawork Mode** - Handle complex tasks with automatic task decomposition and parallel execution
- 🛠️ **LSP/AST Tools** - Advanced code analysis capabilities
- 📝 **Rules Injection System** - Define and enforce unified behavior rules for AI Agents across all projects
- 🔄 **Unified Agent Execution Flow** - Automatic 6-step execution flow from task parsing to delivery

```bash
# Install
bunx oh-my-opencode install

# Use ultrawork mode
opencode run "ultrawork: Refactor the entire TypeScript codebase"

# Use specialized agents
opencode run "@oracle Analyze the project architecture"
opencode run "@librarian Find React Hooks best practices"

# Use unified execution flow (automatic task completion)
bun dev run "Help me run the current project demo"
opencode run "unified-flow: Run demo"
```

##### Rules Injection System

A powerful enhancement that allows you to define and enforce consistent behavior rules for AI Agents across all your projects.

**Key Features:**

- 📝 **Rule File Management** - Support for `.mdc` and `.md` rule files with frontmatter configuration
- 🗂️ **Multi-level Configuration** - Project-level (`.claude/rules/`) and user-level (`~/.claude/rules/`) rules
- 🎯 **Intelligent Matching** - Rule matching based on `globs` patterns with `alwaysApply: true` for universal rules
- ⚙️ **Automatic Injection** - Rules automatically injected into AI Agent context via `rules-injector` hook
- 🔄 **Real-time Application** - Rule changes take effect immediately without restarting the Agent
- 📋 **Comprehensive Coverage** - Support for code style, file naming, documentation, workflow, and domain-specific rules

```bash
# Create rules directory
mkdir -p .claude/rules

# Example rule file: python-rules.mdc
cat > .claude/rules/python-rules.mdc << 'EOF'
---
description: "Python code rules"
globs: ["*.py"]
---

## Python Code Rules

- Follow PEP 8 guidelines
- Use type annotations (Type Hints)
- Avoid type-ignoring statements like `as any`
- Prefer PyTorch for deep learning implementations
EOF

# Verify rules are working
bun dev run "Create a simple Python function to calculate fibonacci sequence"
```

##### Unified Agent Execution Flow

A core feature that automatically triggers a complete 6-step execution flow with a single sentence input, from task parsing to result delivery.

**6-Step Execution Flow:**

1. **Phase 1: Task Parsing** - Understand core requirements and clarify success criteria
2. **Phase 2: Intelligent Decomposition** - Break down into executable steps and determine resource needs
3. **Phase 3: Parallel Execution** - Multi-threaded collection/processing with real-time progress tracking
4. **Phase 4: Comprehensive Building** - Information fusion and logical construction
5. **Phase 5: Quality Assurance** - Self-inspection and end-to-end verification
6. **Phase 6: Result Delivery** - Format as needed and provide execution summary

**Automatic Triggers:**

```bash
# Examples of automatic unified flow triggers
bun dev run "Help me run the current project demo"
bun dev run "Automatically complete user login functionality"
bun dev run "Help me run demo"
```

**Key Features:**

- 🎯 **Automatic Task Recognition** - Automatically identifies task types and extracts success criteria
- 📋 **Smart Decomposition** - Creates detailed plans and reviews automatically
- ⚡ **Parallel Execution** - Multi-threaded processing with real-time progress tracking
- 🔨 **Comprehensive Building** - Information integration and logical construction
- ✅ **Quality Assurance** - Self-inspection with end-to-end verification
- 📦 **Result Delivery** - Deliverables formatted as needed with execution summaries

Learn more in [USAGE_GUIDE.md](./USAGE_GUIDE.md#oh-my-opencode-插件使用指南).

#### Rules Injection System

A powerful enhancement to the Oh My OpenCode plugin that allows you to define and enforce consistent behavior rules for AI Agents across all your projects. Ensure code quality, maintain naming conventions, and standardize workflows with automated rule enforcement.

**Key Features:**

- 📝 **Rule File Management**: Support for `.mdc` and `.md` rule files with frontmatter configuration
- 🗂️ **Multi-level Configuration**: Project-level (`.claude/rules/`) and user-level (`~/.claude/rules/`) rules
- 🎯 **Intelligent Matching**: Rule matching based on `globs` patterns with `alwaysApply: true` for universal rules
- ⚙️ **Automatic Injection**: Rules are automatically injected into AI Agent context via the `rules-injector` hook
- 🔄 **Real-time Application**: Rule changes take effect immediately without restarting the Agent
- 📋 **Comprehensive Coverage**: Support for code style, file naming, documentation, workflow, and domain-specific rules

```bash
# Create rules directory
mkdir -p .claude/rules

# Example rule file: python-rules.mdc
cat > .claude/rules/python-rules.mdc << 'EOF'
---
description: "Python code rules"
globs: ["*.py"]
---

## Python Code Rules

- Follow PEP 8 guidelines
- Use type annotations (Type Hints)
- Avoid type-ignoring statements like `as any`
- Prefer PyTorch for deep learning implementations
EOF

# Verify rules are working
bun dev run "Create a simple Python function to calculate fibonacci sequence"
```

**Rule File Structure:**

- Frontmatter with `description`, `globs`, and `alwaysApply` fields
- Markdown content with clear, actionable rules
- Support for multiple rule files organized by domain or technology

**Quick Start:**

1. Create `.claude/rules/` directory in your project root
2. Add rule files (e.g., `python-rules.mdc`, `file-naming-rules.mdc`)
3. Ensure `rules-injector` hook is enabled in `oh-my-opencode.json`
4. Use OpenCode normally - rules will be automatically applied

**Example Rule Categories:**

- **Code Style**: Language-specific conventions and best practices
- **File Naming**: Consistent naming with AI-generated file identification
- **Documentation**: When and how to create documentation
- **Workflow**: Standard procedures for code modifications and versioning
- **Domain-specific**: Rules for AI/ML, robotics, web development, etc.

Learn more in [USAGE_GUIDE.md](./USAGE_GUIDE.md#规则注入系统使用指南).

#### Claude SDK Adapter

A compatibility layer that allows using Claude Agent SDK interfaces with OpenCode's agent system. Fully independent implementation using only OpenCode's internal APIs - no dependency on Claude Code executable.

**Key Features:**

- 🎯 **Full Compatibility** - Use Claude Agent SDK interface seamlessly with OpenCode
- 🔄 **Session Management** - Automatic session creation and resume capability
- 🛡️ **Permission Control** - Customizable tool usage permissions via `canUseTool` callback
- ⚡ **Real-time Streaming** - Asynchronous message streaming with full TypeScript support
- 🏗️ **Architecture Independence** - Completely independent of Claude Code, can be replaced with any OpenCode API-compatible backend

**Basic Usage:**

```typescript
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

await bootstrap("/path/to/project", async () => {
  const q = query({
    prompt: "Organize files in the current directory",
    options: { cwd: "/path/to/project" },
  })

  for await (const message of q) {
    if (message.type === "text") {
      console.log(message.text)
    } else if (message.type === "tool-call") {
      console.log(`Tool call: ${message.toolName}`)
    }
  }
})
```

**Advanced Usage:**

```typescript
// Session resume
const q = query({
  prompt: "Continue with previous work",
  options: {
    resume: "ses_previous_session_id",
    cwd: "/path/to/project"
  }
})

// Custom permissions
const q = query({
  prompt: "Edit README file",
  options: {
    canUseTool: async (toolName, input, { signal }) => {
      if (toolName === "edit" || toolName === "write") {
        return { behavior: "ask" } // "allow" / "deny"
      }
      return { behavior: "allow", updatedInput: input }
    }
  }
})

// Cancellation support
const abortController = new AbortController()
setTimeout(() => abortController.abort(), 5000)

const q = query({
  prompt: "Long running task",
  options: { abortController }
})
```

**Quick Examples:**

```bash
# Test usage (organize Downloads folder)
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/test-usage.ts

# CLI example
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "Organize files in current directory" \
  --cwd /home/hzm/Downloads

# Resume session
bun run src/claude-sdk-adapter/cli-example.ts \
  "Continue" --resume ses_xxxxx --cwd /path/to/project
```

Learn more in [USAGE_GUIDE.md](./USAGE_GUIDE.md#claude-sdk-adapter-使用指南).

#### Skills System

Extend AI Agent capabilities with modular, self-contained skill packages for specialized domains. Skills are automatically discovered and loaded when needed for specific tasks.

**Available Skills:**

##### Document Processing

- **PDF Skill** (`pdf`) - PDF text/table extraction, merging, splitting, creation, editing, metadata extraction
- **DOCX Skill** (`docx`) - Word document creation/editing, track changes, format preservation, text extraction
- **PPTX Skill** (`pptx`) - PowerPoint presentation creation, slide editing, template usage, layout management
- **XLSX Skill** (`xlsx`) - Excel spreadsheet creation/editing, formulas, data analysis, visualization, formatting

##### Design & Creation

- **Frontend Design Skill** (`frontend-design`) - High-quality frontend UI creation, avoiding generic AI aesthetics, production-ready code
- **Canvas Design Skill** (`canvas-design`) - Visual artwork creation, design philosophy, PDF/PNG output, original visual design
- **Algorithmic Art Skill** (`algorithmic-art`) - p5.js algorithmic art, seeded randomness, interactive generation
- **Theme Factory Skill** (`theme-factory`) - Apply professional themes to artifacts, 10 preset themes, color/font pairing, custom theme creation

##### Web Development

- **Web Artifacts Builder Skill** (`web-artifacts-builder`) - Complex multi-component HTML artifacts, React + TypeScript + Tailwind CSS, shadcn/ui components, single-file HTML packaging
- **Webapp Testing Skill** (`webapp-testing`) - Playwright testing for local web apps, frontend functionality verification, UI behavior debugging, browser screenshot capture

##### Tools & Integration

- **MCP Builder Skill** (`mcp-builder`) - Create high-quality MCP servers, Python and Node.js, tool design and implementation
- **Skill Creator Skill** (`skill-creator`) - Create effective skills guides, skill creation workflows, best practices, skill packaging

##### Communication & Collaboration

- **Internal Comms Skill** (`internal-comms`) - Writing internal communications, 3P updates (progress/plans/problems), company communications and FAQs
- **Doc Coauthoring Skill** (`doc-coauthoring`) - Structured document collaboration workflow, context collection, refinement and structuring, reader testing

**Skills Discovery:**

Skills are automatically discovered from:

1. **Project-level**: `.opencode/skill/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`
2. **Global-level**: `~/.config/opencode/skill/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md`

**Usage Examples:**

```bash
# Automatic skill loading (recommended)
bun dev run "Extract text from document.pdf"

# Explicit skill reference
bun dev run "Use pdf skill to extract text from document.pdf"

# Combine multiple skills
bun dev run "Use pptx skill and theme-factory skill to create a presentation with Modern Minimalist theme"

# Complex workflow with skills
bun dev run "Use frontend-design skill to create a responsive dashboard component"
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
