# OpenCode 功能整理文档

**版本**: v1.0  
**日期**: 2026-01-26  
**作者**: AI Assistant (Claude-4)  
**目的**: 整理当前OpenCode项目的核心功能，为未来开发计划提供基础

---

## 目录

- [项目概述](#项目概述)
- [核心功能模块](#核心功能模块)
- [CLI命令系统](#cli命令系统)
- [Agent系统](#agent系统)
- [插件系统](#插件系统)
- [工具系统](#工具系统)
- [跨平台支持](#跨平台支持)
- [当前架构](#当前架构)
- [功能清单](#功能清单)

---

## 项目概述

OpenCode 是一个开源的 AI 编程助手工具，支持多种 AI 模型提供商，提供终端用户界面（TUI）和 Web 界面。

### 核心定位
- 🤖 **多模型支持** - 支持 Claude、OpenAI、Google、本地模型
- 🖥️ **终端界面** - 强大的 TUI 界面
- 🌐 **Web 界面** - 浏览器和桌面应用访问
- 🔌 **插件系统** - 可扩展的插件架构
- 📝 **LSP 支持** - 开箱即用的语言服务器协议支持
- 🔐 **多代理系统** - 专业化的 Agent 系统

---

## 核心功能模块

### 1. CLI 命令系统

OpenCode 提供了丰富的 CLI 命令，支持多种使用场景：

#### 主要命令

| 命令 | 功能 | 使用场景 |
|------|------|----------|
| `opencode` | 启动 TUI 界面 | 交互式开发 |
| `opencode run <message>` | 执行单次任务 | 快速任务执行 |
| `opencode agent` | Agent 管理 | 查看、配置 Agent |
| `opencode attach <url>` | 连接到远程服务器 | 远程开发 |
| `opencode serve` | 启动后端服务器 | 服务模式 |
| `opencode web` | 启动 Web 服务器 | Web 访问 |
| `opencode acp` | ACP 协议服务器 | IDE 集成 |
| `opencode mcp` | MCP 服务器管理 | MCP 集成 |
| `opencode session` | 会话管理 | 会话操作 |
| `opencode models` | 模型管理 | 查看可用模型 |
| `opencode auth` | 认证管理 | API 密钥配置 |
| `opencode export/import` | 数据导出/导入 | 数据迁移 |
| `opencode github` | GitHub 集成 | PR 操作 |
| `opencode pr` | PR 管理 | Pull Request |
| `opencode stats` | 统计信息 | 使用统计 |
| `opencode debug` | 调试工具 | 问题诊断 |

#### 命令特性

- **工作目录支持**: 自动检测和设置工作目录
- **会话管理**: 支持会话继续、分享、导出
- **模型选择**: 支持指定模型和 Agent
- **文件附加**: 支持附加文件到消息
- **格式输出**: 支持默认格式和 JSON 格式

### 2. Agent 系统

#### 内置 Agent

**Primary Agents (主 Agent)**
- **build**: 默认 Agent，拥有完整工具访问权限，用于开发工作
- **plan**: 只读 Agent，用于分析和代码探索，默认拒绝文件编辑和 bash 命令

**Subagents (子 Agent)**
- **general**: 通用子 Agent，用于复杂搜索和多步骤任务
- **explore**: 快速代码库搜索

#### Agent 特性

- **Agent 切换**: 使用 Tab 键或 `@mention` 调用
- **权限控制**: 细粒度的权限管理（文件编辑、bash 命令等）
- **工具访问**: 可配置的工具访问权限
- **模型配置**: 每个 Agent 可配置不同的模型

### 3. Oh My OpenCode 插件系统

Oh My OpenCode 是 OpenCode 的增强插件，提供专业化的 Agent 团队：

#### 专业化 Agent

| Agent | 模型 | 用途 |
|-------|------|------|
| **Sisyphus** | Claude Opus 4.5 | 主协调器，任务编排 |
| **Oracle** | GPT-5.2 | 高智商调试、架构咨询 |
| **Librarian** | GLM-4.7-free | 多仓库研究、文档搜索 |
| **Explore** | Grok Code | 快速代码库搜索 |
| **Frontend Engineer** | Gemini 3 Pro | UI/UX 生成 |
| **Document Writer** | Gemini 3 Pro | 技术文档编写 |
| **Multimodal Looker** | Gemini 3 Flash | PDF/图片分析 |
| **Prometheus** | - | 规划 Agent |
| **Metis** | - | 计划顾问 |
| **Momus** | - | 计划审查 |

#### 插件特性

- **Ultrawork Mode**: 复杂任务的自动分解和并行执行
- **Background Tasks**: 后台任务执行
- **Unified Flow**: 6 阶段统一执行流程
- **Skills System**: 技能系统，支持 PDF、DOCX、PPTX 等
- **MCP 集成**: 支持 MCP 服务器集成
- **LSP/AST Tools**: 高级代码分析能力

### 4. 工具系统

#### 内置工具

| 工具 | 功能 | 用途 |
|------|------|------|
| **read** | 读取文件 | 文件内容读取 |
| **write** | 写入文件 | 文件创建/修改 |
| **edit** | 编辑文件 | 代码编辑 |
| **grep** | 文本搜索 | 代码搜索 |
| **glob** | 文件匹配 | 文件查找 |
| **bash** | 执行命令 | 系统命令执行 |
| **websearch** | 网络搜索 | 信息搜索 |
| **webfetch** | 网页获取 | 内容抓取 |
| **lsp** | LSP 操作 | 代码分析 |
| **todo** | 任务管理 | 任务跟踪 |
| **task** | 任务执行 | 多步骤任务 |
| **codesearch** | 代码搜索 | 语义搜索 |

#### 工具特性

- **权限控制**: 细粒度的权限管理
- **批量操作**: 支持批量文件操作
- **错误处理**: 完善的错误处理机制
- **进度跟踪**: 任务进度可视化

### 5. Skills 系统

Skills 是模块化的技能包，用于扩展 AI Agent 的能力：

#### 可用 Skills

- **文档处理**: PDF、DOCX、PPTX、XLSX
- **设计与创作**: Frontend Design、Canvas Design、Algorithmic Art、Theme Factory
- **Web 开发**: Web Artifacts Builder、Webapp Testing
- **工具与集成**: MCP Builder、Skill Creator
- **通信**: Internal Comms、Doc Coauthoring

#### Skills 特性

- **自动发现**: 自动发现和加载 Skills
- **显式引用**: 支持显式引用特定 Skill
- **组合使用**: 支持多个 Skills 组合使用
- **配置管理**: 支持项目级和全局配置

### 6. 项目初始化系统

#### Bootstrap 流程

```typescript
InstanceBootstrap() {
  1. Plugin.init()          // 初始化插件系统
  2. Share.init()          // 初始化分享功能
  3. Format.init()         // 初始化格式化
  4. LSP.init()            // 初始化 LSP
  5. FileWatcher.init()    // 初始化文件监听
  6. File.init()           // 初始化文件系统
  7. Vcs.init()            // 初始化版本控制
}
```

#### 项目检测

- 自动检测项目类型
- 支持 Git 仓库检测
- 支持多工作树（Worktree）
- 配置文件自动发现

---

## CLI 命令系统

### 命令结构

```
opencode [command] [options] [arguments]
```

### 核心命令详解

#### 1. `run` 命令

```bash
opencode run "任务描述" [选项]
```

**选项**:
- `--model, -m`: 指定模型 (provider/model)
- `--agent`: 指定 Agent
- `--continue, -c`: 继续上次会话
- `--session, -s`: 指定会话 ID
- `--file, -f`: 附加文件
- `--title`: 会话标题
- `--format`: 输出格式 (default/json)
- `--port`: 服务器端口
- `--attach`: 连接到远程服务器

#### 2. `agent` 命令

```bash
opencode agent [list|create|update|delete]
```

用于管理 Agent 配置。

#### 3. `acp` 命令

```bash
opencode acp [--cwd <directory>]
```

启动 ACP (Agent Client Protocol) 服务器，用于 IDE 集成。

#### 4. `mcp` 命令

```bash
opencode mcp [command]
```

管理 MCP (Model Context Protocol) 服务器。

---

## Agent 系统

### Agent 架构

```
Primary Agents (主 Agent)
  ├── build (默认)
  └── plan (只读)

Subagents (子 Agent)
  ├── general (通用)
  └── explore (探索)

Oh My OpenCode Agents
  ├── Sisyphus (协调器)
  ├── Oracle (架构)
  ├── Librarian (研究)
  ├── Explore (搜索)
  ├── Frontend Engineer (前端)
  ├── Document Writer (文档)
  ├── Multimodal Looker (多模态)
  ├── Prometheus (规划)
  ├── Metis (顾问)
  └── Momus (审查)
```

### Agent 调用方式

1. **Tab 键切换**: 在 TUI 中使用 Tab 键切换 Primary Agent
2. **@mention**: 在消息中使用 `@agent-name` 调用 Subagent
3. **命令行指定**: 使用 `--agent` 选项指定 Agent
4. **任务工具**: 通过 Task 工具调用 Agent

---

## 插件系统

### 插件架构

- **插件发现**: 自动发现 `.opencode/` 和 `~/.config/opencode/` 中的插件
- **插件加载**: 支持 TypeScript/JavaScript 插件
- **生命周期钩子**: 支持多种生命周期钩子
- **配置管理**: 支持 JSONC 格式配置

### Oh My OpenCode 插件

- **安装**: `bunx oh-my-opencode install`
- **诊断**: `bunx oh-my-opencode doctor`
- **运行**: `bunx oh-my-opencode run <message>`

---

## 工具系统

### 工具分类

1. **文件操作**: read, write, edit, glob, grep
2. **系统操作**: bash, todo
3. **网络操作**: websearch, webfetch
4. **代码分析**: lsp, codesearch
5. **任务管理**: task, todo

### 工具权限

- **ask**: 执行前询问用户
- **auto**: 自动执行
- **deny**: 拒绝执行

---

## 跨平台支持

### 支持平台

- ✅ **Linux**: 完整支持
- ✅ **macOS**: 完整支持
- ✅ **Windows**: 通过 WSL 或原生支持

### 安装方式

- **包管理器**: npm, yarn, pnpm, Homebrew, Scoop, Chocolatey
- **一键安装**: `curl -fsSL https://opencode.ai/install | bash`
- **源码安装**: 从 GitHub 克隆并构建

### 桌面应用

- macOS: `.dmg` 文件
- Windows: `.exe` 文件
- Linux: `.deb`, `.rpm`, AppImage

---

## 当前架构

### 目录结构

```
opencode/
├── packages/
│   ├── opencode/        # 核心包
│   │   ├── src/
│   │   │   ├── cli/     # CLI 命令
│   │   │   ├── agent/   # Agent 系统
│   │   │   ├── tool/    # 工具系统
│   │   │   ├── session/ # 会话管理
│   │   │   ├── server/  # 服务器
│   │   │   └── ...
│   ├── console/         # 控制台应用
│   ├── web/            # Web 界面
│   ├── desktop/        # 桌面应用
│   └── sdk/            # SDK
├── oh-my-opencode/     # Oh My OpenCode 插件
└── docs/               # 文档
```

### 核心技术栈

- **运行时**: Bun
- **语言**: TypeScript
- **UI 框架**: SolidJS (Web), TUI (终端)
- **构建工具**: Bun, Vite
- **包管理**: Bun workspaces

---

## 功能清单

### ✅ 已实现功能

#### 核心功能
- [x] CLI 命令系统
- [x] TUI 界面
- [x] Web 界面
- [x] 桌面应用
- [x] Agent 系统（Primary + Subagent）
- [x] 工具系统（文件、系统、网络、代码分析）
- [x] 会话管理
- [x] 项目初始化
- [x] LSP 支持
- [x] MCP 集成
- [x] ACP 协议支持
- [x] 插件系统
- [x] Skills 系统
- [x] 多模型支持
- [x] 权限管理
- [x] 文件监听
- [x] 版本控制集成

#### Oh My OpenCode 功能
- [x] 专业化 Agent 团队
- [x] Ultrawork Mode
- [x] Background Tasks
- [x] Unified Flow
- [x] 统一 Agent 执行流程
- [x] 任务分解和执行
- [x] 并行任务执行
- [x] 任务进度跟踪

#### 集成功能
- [x] GitHub 集成
- [x] Claude SDK Adapter
- [x] Skills 自动发现
- [x] 配置管理（项目级 + 全局）
- [x] 数据导出/导入

### ⚠️ 待改进功能

#### 用户体验
- [ ] 更智能的 Agent 自动选择
- [ ] 更统一的任务入口
- [ ] 更好的跨平台一致性
- [ ] 更简单的配置流程

#### 功能增强
- [ ] 项目类型自动检测和配置
- [ ] 任务模板系统
- [ ] 工作流自动化
- [ ] 更智能的依赖管理

---

## 总结

OpenCode 已经具备了强大的 AI 编程助手能力，包括：

1. **完整的 CLI 系统**: 支持多种使用场景
2. **灵活的 Agent 系统**: Primary Agent + Subagent 架构
3. **丰富的工具集**: 文件、系统、网络、代码分析工具
4. **强大的插件系统**: Oh My OpenCode 提供专业化 Agent 团队
5. **跨平台支持**: Linux、macOS、Windows
6. **多种界面**: TUI、Web、桌面应用

**当前优势**:
- 功能完整，覆盖开发全流程
- 架构清晰，易于扩展
- 跨平台支持良好
- 插件系统灵活

**改进方向**:
- 统一入口，简化使用流程
- 智能 Agent 调度
- 自动化工作流
- 更好的项目检测和配置

---

**文档版本**: v1.0  
**最后更新**: 2026-01-26  
**维护者**: OpenCode Team

