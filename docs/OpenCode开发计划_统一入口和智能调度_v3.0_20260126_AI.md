# OpenCode 开发计划：统一入口、智能调度与 Manus 模式集成

**版本**: v4.0  
**日期**: 2026-01-26  
**作者**: AI Assistant (Claude-4)  
**目标**: 实现跨平台统一入口，集成 OpenWork GUI 和 Manus 文件规划模式，用户只需指定工作目录和需求，系统自动调用合适的 Agent 完成任务

**更新说明**: v4.0 基于可行性评估报告（v1.0）的建议进行了完善，主要改进包括：
- 添加并发控制机制（文件锁）解决规划文件竞态条件
- 添加会话恢复脚本兼容性验证
- 优化 Hooks 性能（缓存、异步执行）
- 调整时间估算（Hooks 集成延长至 2 周）
- 添加详细的技术设计和风险缓解措施
- 增强测试计划

---

## 目录

- [项目目标](#项目目标)
- [核心设计理念](#核心设计理念)
- [Manus 模式分析](#manus-模式分析)
- [OpenWork 功能分析](#openwork-功能分析)
- [需求分析](#需求分析)
- [系统设计](#系统设计)
- [开发计划](#开发计划)
- [技术实现](#技术实现)
- [测试计划](#测试计划)
- [部署计划](#部署计划)

---

## 项目目标

### 核心目标

1. **统一入口**: 提供一个简单的命令或接口，用户只需指定工作目录和需求
2. **智能调度**: 自动分析需求，选择合适的 Agent 和工具
3. **自动化执行**: 自动分解任务，并行执行，跟踪进度
4. **跨平台支持**: 在 Linux、macOS、Windows 上一致运行
5. **GUI 集成**: 集成 OpenWork 图形界面，提供桌面和移动端支持
6. **Manus 模式**: 集成文件规划模式，使用持久化 Markdown 文件管理任务
7. **多模式支持**: 支持 CLI、TUI、GUI（OpenWork）三种使用方式

### 用户场景

#### CLI 场景
```bash
# 场景1: 简单需求
opencode --dir /path/to/project "帮我运行这个项目"

# 场景2: 复杂需求（自动创建规划文件）
opencode --dir /path/to/project "实现一个用户登录功能，包括前端和后端"

# 场景3: 分析需求
opencode --dir /path/to/project "分析这个项目的架构，找出潜在问题"
```

#### OpenWork GUI 场景
```bash
# 启动 OpenWork
openwork

# 用户操作：
# 1. 选择或创建 Workspace（文件夹）
# 2. 输入需求："帮我运行这个项目"
# 3. 系统自动创建 task_plan.md, findings.md, progress.md
# 4. 系统自动分析、调度、执行
# 5. 实时查看进度和结果
```

---

## 核心设计理念

### Manus 核心原则

```
Context Window = RAM (volatile, limited)
Filesystem = Disk (persistent, unlimited)

→ Anything important gets written to disk.
```

### 三文件模式

对于每个复杂任务，创建三个文件：

```
task_plan.md      → 跟踪阶段和进度
findings.md       → 存储研究和发现
progress.md       → 会话日志和测试结果
```

### 关键规则

1. **先创建计划**: 永远不要在没有 `task_plan.md` 的情况下开始复杂任务
2. **2-Action 规则**: 每2次查看/浏览器操作后，立即保存关键发现到文件
3. **决策前重读**: 在重大决策前，重读计划文件（通过 Hooks 自动实现）
4. **记录所有错误**: 每个错误都记录在计划文件中，防止重复
5. **永不重复失败**: 如果操作失败，改变方法，不要重复相同的失败操作

---

## Manus 模式分析

### planning-with-files 核心功能

#### 1. 三文件规划系统

**文件结构**:
- `task_plan.md`: 目标、阶段、决策、错误记录
- `findings.md`: 研究发现、技术决策、资源
- `progress.md`: 会话日志、操作记录、测试结果

**模板位置**:
- OpenCode: `~/.config/opencode/skills/planning-with-files/templates/`
- 项目级: `.opencode/skills/planning-with-files/templates/`

#### 2. Hooks 系统

**PreToolUse Hook**:
- 触发时机: 在执行 Write/Edit/Bash/Read/Glob/Grep 之前
- 功能: 自动读取 `task_plan.md` 的前30行，刷新目标到注意力窗口

**PostToolUse Hook**:
- 触发时机: 在执行 Write/Edit 之后
- 功能: 提醒更新 `task_plan.md` 状态（如果阶段完成）

**Stop Hook**:
- 触发时机: 当 Agent 尝试停止时
- 功能: 检查所有阶段是否完成，防止过早停止

#### 3. 会话恢复系统

**功能**: 自动检测和恢复未同步的上下文

**实现**:
- `session-catchup.py`: 分析前一个会话的 JSONL 文件
- 找到最后规划文件更新的时间
- 提取之后发生的对话（可能丢失的上下文）
- 显示恢复报告，帮助同步规划文件

#### 4. 错误处理协议

**3-Strike 错误协议**:
1. **尝试1**: 诊断和修复
2. **尝试2**: 替代方法（绝不重复相同的失败操作）
3. **尝试3**: 重新思考（质疑假设，搜索解决方案）
4. **3次失败后**: 升级到用户

#### 5. 5-Question 重启测试

如果能够回答这些问题，上下文管理是可靠的：

| 问题 | 答案来源 |
|------|----------|
| 我在哪里？ | `task_plan.md` 中的当前阶段 |
| 我要去哪里？ | 剩余阶段 |
| 目标是什么？ | 计划中的目标声明 |
| 我学到了什么？ | `findings.md` |
| 我做了什么？ | `progress.md` |

### 集成优势

1. **持久化记忆**: 规划文件作为"磁盘上的工作记忆"
2. **目标保持**: 通过 Hooks 自动重读计划，防止目标漂移
3. **错误学习**: 记录所有错误，避免重复
4. **会话恢复**: 即使上下文丢失，也能恢复工作
5. **进度可视化**: 规划文件提供清晰的进度跟踪

---

## OpenWork 功能分析

### OpenWork 核心功能

#### 1. 工作区管理（Workspace Management）

- **文件夹即工作区**: 每个文件夹就是一个工作区
- **JIT 工作区选择**: 按需选择工作区，而不是启动时选择
- **Starter Workspace**: 首次运行时创建默认工作区
- **多工作区支持**: 支持多个工作区切换
- **工作区模板**: 支持从模板创建工作区

#### 2. 会话管理（Session Management）

- **会话创建**: 创建新的任务会话
- **会话列表**: 查看历史会话
- **会话选择**: 切换不同会话
- **会话状态**: 实时显示会话状态

#### 3. 实时事件流（Real-time Event Streaming）

- **SSE 订阅**: 通过 Server-Sent Events 实时接收更新
- **流式响应**: 实时显示 AI 响应
- **步骤更新**: 实时更新任务步骤状态
- **权限请求**: 实时显示权限请求

#### 4. 执行计划可视化（Execution Plan Visualization）

- **Todo 时间线**: 将 OpenCode todos 渲染为时间线
- **步骤状态**: 显示每个步骤的状态（pending/running/completed/failed）
- **进度指示**: 水平步骤点显示进度

#### 5. 权限管理（Permission Management）

- **权限请求显示**: 清晰显示权限请求
- **权限响应**: 支持 once/session/always/deny
- **权限审计**: 记录权限决策

#### 6. 模板系统（Template System）

- **模板创建**: 保存任务为模板
- **模板运行**: 快速运行模板
- **模板管理**: 管理模板列表

#### 7. Skills 管理器（Skills Manager）

- **Skills 列表**: 显示已安装的 Skills
- **Skills 安装**: 从 OpenPackage 安装 Skills
- **本地导入**: 导入本地 Skills 文件夹

#### 8. 插件管理（Plugin Management）

- **插件列表**: 显示已安装的插件
- **插件配置**: 管理 `opencode.json` 中的插件配置

#### 9. Host/Client 模式

- **Host 模式**: 本地运行 OpenCode 服务器
- **Client 模式**: 连接到远程 OpenCode 服务器（移动端）

---

## 需求分析

### 功能需求

#### 1. 统一入口命令（CLI + GUI）

**需求**: 提供统一的入口，支持：
- CLI: `opencode --dir <directory> <requirement>`
- GUI: OpenWork 界面输入需求
- 工作目录指定（`--dir` 或 GUI 选择）
- 需求输入（命令行参数或 GUI 输入框）
- 可选配置（模型、Agent、输出格式等）

**实现**:
- CLI: 扩展 `opencode run` 命令
- GUI: 集成到 OpenWork 的会话创建流程

#### 2. 需求理解系统

**需求**: 自动分析用户需求，识别：
- 任务类型（开发、分析、修复、测试等）
- 复杂度（简单、中等、复杂）
- 所需技能（前端、后端、文档、测试等）
- 依赖关系（是否需要先分析、是否需要外部资源）

**实现**:
- 使用 LLM 进行需求分析
- 构建需求分类模型
- 提取关键信息（技术栈、文件类型、操作类型等）

#### 3. 智能 Agent 调度

**需求**: 根据需求分析结果，自动选择：
- 合适的 Primary Agent（build/plan）
- 需要的 Subagent（oracle、librarian、explore 等）
- 执行顺序（并行/串行）
- 任务分解策略

**实现**:
- Agent 能力矩阵
- 任务-Agent 匹配算法
- 执行计划生成

#### 4. 项目自动检测

**需求**: 自动检测项目：
- 项目类型（Web、移动、CLI、库等）
- 技术栈（框架、语言、工具）
- 项目状态（是否可运行、依赖是否安装等）
- 配置文件（package.json、requirements.txt 等）

**实现**:
- 项目检测器（Project Detector）
- 技术栈识别
- 依赖分析

#### 5. Manus 文件规划集成

**需求**: 自动创建和管理规划文件：
- 自动创建 `task_plan.md`, `findings.md`, `progress.md`
- 集成 Hooks 系统（PreToolUse, PostToolUse, Stop）
- 自动更新规划文件状态
- 会话恢复支持

**实现**:
- 集成 planning-with-files skill
- 创建规划文件模板系统
- 实现 Hooks 集成
- 实现会话恢复机制

#### 6. 任务自动分解

**需求**: 将复杂需求分解为：
- 可执行的子任务
- 任务依赖关系
- 并行执行计划
- 进度跟踪（与规划文件同步）

**实现**:
- 任务分解算法
- 依赖图构建
- 执行计划生成
- 与 `task_plan.md` 同步

#### 7. 自动化执行

**需求**: 自动执行任务：
- 按计划执行子任务
- 处理任务依赖
- 并行执行独立任务
- 错误处理和重试
- 进度报告（更新规划文件）

**实现**:
- 任务执行引擎
- 依赖管理
- 并行执行控制
- 错误恢复机制
- 规划文件自动更新

#### 8. OpenWork GUI 集成

**需求**: 在 OpenWork 中集成智能调度和 Manus 模式：
- 需求输入界面
- 自动分析和调度
- 执行计划可视化
- 规划文件可视化
- 实时进度显示
- 结果展示

**实现**:
- 扩展 OpenWork 会话创建流程
- 集成需求理解系统
- 集成智能调度系统
- 集成 Manus 文件规划
- 可视化执行计划和规划文件

### 非功能需求

1. **性能**: 响应时间 < 2s，任务执行时间优化
2. **可靠性**: 错误处理完善，支持重试和恢复
3. **可扩展性**: 易于添加新的 Agent 和工具
4. **用户体验**: 清晰的进度提示，友好的错误信息
5. **跨平台**: Linux、macOS、Windows 一致体验
6. **GUI 性能**: 60fps 动画，<100ms 交互延迟
7. **持久化**: 规划文件持久化，支持会话恢复

---

## 系统设计

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                   统一入口层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  CLI 命令    │  │  OpenWork    │  │  TUI 界面    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              需求理解系统 (Requirement Parser)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 需求分类     │  │ 信息提取     │  │ 复杂度分析   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│           项目检测系统 (Project Detector)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 项目类型     │  │ 技术栈识别   │  │ 依赖分析     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│        Manus 文件规划系统 (Manus Planning System)        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 规划文件创建 │  │ Hooks 集成   │  │ 会话恢复     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ task_plan.md │  │ findings.md  │  │ progress.md  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         智能调度系统 (Intelligent Scheduler)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Agent 选择   │  │ 任务分解     │  │ 执行计划     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│           执行引擎 (Execution Engine)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 任务执行     │  │ 依赖管理     │  │ 进度跟踪     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Hooks 触发   │  │ 规划文件更新 │  │ 错误记录     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Agent 系统 (Agent System)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Primary      │  │ Subagent     │  │ Oh My OMO    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         OpenCode Server (opencode serve)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Sessions   │  │  Messages    │  │  Events      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 核心模块设计

#### 1. 统一入口模块 (Unified Entry)

**CLI 实现**: `packages/opencode/src/cli/cmd/unified.ts`

**OpenWork 集成**: 扩展 `src/app/session.ts` 和 `src/views/SessionView.tsx`

**功能**:
- 解析命令行参数
- 支持交互式输入
- 工作目录处理
- 配置加载
- **Manus 模式检测**: 自动检测是否需要创建规划文件

**接口**:
```typescript
interface UnifiedCommandOptions {
  dir?: string
  requirement: string
  model?: string
  agent?: string
  format?: 'default' | 'json'
  interactive?: boolean
  // OpenWork 特定
  workspaceId?: string
  templateId?: string
  // Manus 模式
  useManus?: boolean  // 自动检测或手动指定
  planningFilesDir?: string  // 规划文件目录
}
```

#### 2. 需求理解模块 (Requirement Parser)

**文件**: `packages/opencode/src/unified/requirement-parser.ts`

**功能**:
- 需求分类（开发、分析、修复、测试等）
- 信息提取（技术栈、文件、操作类型）
- 复杂度评估
- 依赖识别
- **Manus 模式判断**: 判断是否需要使用 Manus 模式（>5 工具调用或复杂任务）

**接口**:
```typescript
interface ParsedRequirement {
  type: 'development' | 'analysis' | 'fix' | 'test' | 'documentation'
  complexity: 'simple' | 'medium' | 'complex'
  skills: string[]
  dependencies: string[]
  files?: string[]
  techStack?: string[]
  // Manus 模式
  useManus: boolean  // 是否需要 Manus 模式
  estimatedToolCalls: number  // 估计的工具调用次数
}
```

#### 3. 项目检测模块 (Project Detector)

**文件**: `packages/opencode/src/unified/project-detector.ts`

**功能**:
- 项目类型检测
- 技术栈识别
- 依赖分析
- 配置文件发现
- **规划文件检测**: 检查是否已有规划文件

**接口**:
```typescript
interface ProjectInfo {
  type: 'web' | 'mobile' | 'cli' | 'library' | 'unknown'
  techStack: {
    languages: string[]
    frameworks: string[]
    tools: string[]
  }
  dependencies: {
    installed: boolean
    missing: string[]
  }
  configFiles: string[]
  // Manus 模式
  hasPlanningFiles: boolean
  planningFiles?: {
    taskPlan?: string
    findings?: string
    progress?: string
  }
}
```

#### 4. Manus 文件规划模块 (Manus Planning System)

**文件**: `packages/opencode/src/unified/manus-planning.ts`

**功能**:
- 规划文件创建（task_plan.md, findings.md, progress.md）
- Hooks 集成（PreToolUse, PostToolUse, Stop）
- 规划文件更新
- 会话恢复
- 错误记录

**接口**:
```typescript
interface ManusPlanningSystem {
  // 创建规划文件
  createPlanningFiles(directory: string, task: ParsedRequirement): Promise<void>
  
  // 初始化 Hooks
  initializeHooks(sessionId: string): Promise<void>
  
  // 更新规划文件
  updateTaskPlan(directory: string, phase: string, status: 'pending' | 'in_progress' | 'complete'): Promise<void>
  updateFindings(directory: string, finding: Finding): Promise<void>
  updateProgress(directory: string, action: Action): Promise<void>
  
  // 会话恢复
  recoverSession(directory: string): Promise<RecoveryReport>
  
  // 错误记录
  logError(directory: string, error: Error, attempt: number): Promise<void>
}

interface Finding {
  type: 'research' | 'decision' | 'resource'
  content: string
  timestamp: Date
}

interface Action {
  type: 'phase_start' | 'phase_complete' | 'file_created' | 'file_modified' | 'test_run'
  description: string
  files?: string[]
  timestamp: Date
}

interface RecoveryReport {
  hasUnsyncedContext: boolean
  lastPlanningUpdate?: Date
  unsyncedMessages?: string[]
  recommendations: string[]
}
```

#### 5. 智能调度模块 (Intelligent Scheduler)

**文件**: `packages/opencode/src/unified/scheduler.ts`

**功能**:
- Agent 能力矩阵管理
- 任务-Agent 匹配
- 执行计划生成
- 优化策略
- **与规划文件同步**: 执行计划与 task_plan.md 同步

**接口**:
```typescript
interface ExecutionPlan {
  primaryAgent: string
  subagents: Array<{
    agent: string
    task: string
    dependencies?: string[]
  }>
  parallel: boolean
  steps: ExecutionStep[]
  // Manus 模式
  phases: Phase[]  // 与 task_plan.md 中的阶段对应
}

interface Phase {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'complete'
  steps: ExecutionStep[]
  estimatedTime?: number
}

interface ExecutionStep {
  id: string
  agent: string
  task: string
  dependencies: string[]
  estimatedTime?: number
  // Manus 模式
  phaseId: string  // 所属阶段
  updatePlanningFile?: boolean  // 是否需要更新规划文件
}
```

#### 6. 执行引擎模块 (Execution Engine)

**文件**: `packages/opencode/src/unified/execution-engine.ts`

**功能**:
- 任务执行
- 依赖管理
- 并行控制
- 进度跟踪
- 错误处理
- **Hooks 集成**: 在执行前后触发 Hooks
- **规划文件更新**: 自动更新规划文件

**接口**:
```typescript
interface ExecutionResult {
  success: boolean
  steps: Array<{
    id: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    result?: any
    error?: Error
    phaseId?: string
  }>
  summary: string
  // Manus 模式
  planningFilesUpdated: boolean
  phasesCompleted: string[]
}

interface ExecutionEngine {
  // 执行任务
  execute(plan: ExecutionPlan, options: ExecutionOptions): Promise<ExecutionResult>
  
  // Hooks 集成
  onPreToolUse(tool: string, callback: (context: ToolContext) => Promise<void>): void
  onPostToolUse(tool: string, callback: (context: ToolContext) => Promise<void>): void
  onStop(callback: (context: StopContext) => Promise<boolean>): void
}

interface ToolContext {
  tool: string
  args: any
  directory: string
  sessionId: string
  planningFiles: {
    taskPlan?: string
    findings?: string
    progress?: string
  }
}

interface StopContext {
  directory: string
  sessionId: string
  completedPhases: string[]
  remainingPhases: string[]
}
```

#### 7. OpenWork 集成模块

**文件**: 
- `openwork/src/app/unified.ts`: OpenWork 统一入口状态管理
- `openwork/src/views/UnifiedTaskView.tsx`: 统一任务视图
- `openwork/src/components/PlanningFilesView.tsx`: 规划文件可视化组件

**功能**:
- 需求输入界面
- 自动分析和调度
- 执行计划可视化
- **规划文件可视化**: 显示 task_plan.md, findings.md, progress.md
- 实时进度显示
- 结果展示

**接口**:
```typescript
interface UnifiedTaskState {
  requirement: string
  workspaceId: string
  parsedRequirement?: ParsedRequirement
  projectInfo?: ProjectInfo
  executionPlan?: ExecutionPlan
  executionResult?: ExecutionResult
  status: 'idle' | 'analyzing' | 'planning' | 'executing' | 'completed' | 'failed'
  // Manus 模式
  manusEnabled: boolean
  planningFiles?: {
    taskPlan?: string
    findings?: string
    progress?: string
  }
  planningFilesStatus?: {
    taskPlan?: 'pending' | 'in_progress' | 'complete'
    findings?: 'up_to_date' | 'needs_update'
    progress?: 'up_to_date' | 'needs_update'
  }
}
```

---

## 开发计划

### 阶段 1: 基础架构 + Manus 集成 (5-6 周) ⚠️ 时间调整

#### 1.1 统一入口命令 (Week 1)

**任务**:
- [ ] 创建 `unified` 命令（CLI）
- [ ] 实现参数解析
- [ ] 支持工作目录指定
- [ ] 支持交互式输入
- [ ] 集成现有 bootstrap 系统
- [ ] **Manus 模式检测**: 自动检测是否需要 Manus 模式

**交付物**:
- `packages/opencode/src/cli/cmd/unified.ts`
- 单元测试
- 文档

#### 1.2 需求理解系统 (Week 1-2)

**任务**:
- [ ] 实现需求分类器
- [ ] 实现信息提取器
- [ ] 实现复杂度评估
- [ ] 集成 LLM 进行需求分析
- [ ] 构建需求模板库
- [ ] **Manus 模式判断**: 判断是否需要使用 Manus 模式

**交付物**:
- `packages/opencode/src/unified/requirement-parser.ts`
- 需求分类模型
- 测试用例

#### 1.3 项目检测系统 (Week 2)

**任务**:
- [ ] 实现项目类型检测
- [ ] 实现技术栈识别
- [ ] 实现依赖分析
- [ ] 支持常见项目类型（Web、Node、Python、Rust 等）
- [ ] **规划文件检测**: 检查是否已有规划文件

**交付物**:
- `packages/opencode/src/unified/project-detector.ts`
- 项目检测器库
- 测试用例

#### 1.4 Manus 文件规划系统 (Week 2-3)

**任务**:
- [ ] 集成 planning-with-files skill
- [ ] 实现规划文件创建（task_plan.md, findings.md, progress.md）
- [ ] 实现规划文件模板系统
- [ ] 实现规划文件更新接口（**使用文件锁防止并发更新**）
- [ ] 实现原子写入机制（临时文件 + 重命名）
- [ ] 验证会话恢复脚本兼容性（session-catchup.py 与 OpenCode 格式）
- [ ] 实现会话恢复机制（支持原生恢复作为备选）
- [ ] 实现错误记录系统（使用文件锁）

**交付物**:
- `packages/opencode/src/unified/manus-planning.ts`
- 规划文件模板
- 会话恢复脚本（兼容性验证）
- 文件锁实现
- 并发更新测试用例
- 会话恢复测试用例

**关键改进**:
- ✅ 使用 `proper-lockfile` 实现文件锁，防止并发更新竞态条件
- ✅ 实现原子写入（先写临时文件，再重命名）
- ✅ 验证并修复会话恢复脚本兼容性

#### 1.5 Hooks 系统集成 (Week 3-4) ⚠️ 时间延长

**任务**:
- [ ] 分析 planning-with-files Hooks 格式与 OpenCode Hooks 格式差异
- [ ] 实现 Hooks 适配器（转换层）
- [ ] 实现 PreToolUse Hook（读取 task_plan.md，带缓存）
- [ ] 实现 PostToolUse Hook（提醒更新状态，异步执行）
- [ ] 实现 Stop Hook（检查完成状态）
- [ ] 集成到执行引擎
- [ ] 实现文件读取缓存机制（TTL 2秒）
- [ ] 实现异步 Hook 执行（不阻塞主流程）
- [ ] 实现 Hook 执行超时机制（防止 Hang）
- [ ] 测试 Hooks 触发和性能
- [ ] 测试 Hooks 执行顺序和冲突处理

**交付物**:
- Hooks 系统实现
- Hooks 适配器
- Hooks 缓存机制
- Hooks 测试用例（包括性能测试）
- Hooks 调试工具
- 文档

**注意事项**:
- Hooks 集成复杂度较高，需要额外 1 周时间
- 必须实现缓存和异步执行，避免性能问题
- 需要充分测试 Hooks 执行顺序和冲突场景

#### 1.6 OpenWork 基础集成 (Week 4-5)

**任务**:
- [ ] 创建 OpenWork 统一入口模块
- [ ] 集成需求输入界面
- [ ] 连接 OpenCode 统一入口命令
- [ ] 基础状态管理
- [ ] **规划文件可视化**: 显示规划文件内容

**交付物**:
- `openwork/src/app/unified.ts`
- `openwork/src/views/UnifiedTaskView.tsx`
- `openwork/src/components/PlanningFilesView.tsx`
- 基础集成测试

### 阶段 2: 智能调度 + Manus 同步 (4-5 周)

#### 2.1 Agent 能力矩阵 (Week 5)

**任务**:
- [ ] 定义 Agent 能力模型
- [ ] 构建能力矩阵
- [ ] 实现能力查询接口
- [ ] 支持动态能力注册
- [ ] **与规划文件关联**: Agent 能力与 task_plan.md 阶段关联

**交付物**:
- `packages/opencode/src/unified/agent-capabilities.ts`
- Agent 能力配置文件
- 文档

#### 2.2 任务-Agent 匹配 (Week 5-6)

**任务**:
- [ ] 实现匹配算法
- [ ] 支持多 Agent 协作
- [ ] 实现优先级排序
- [ ] 优化匹配性能
- [ ] **阶段映射**: 将 Agent 任务映射到 task_plan.md 阶段

**交付物**:
- `packages/opencode/src/unified/agent-matcher.ts`
- 匹配算法文档
- 测试用例

#### 2.3 执行计划生成 (Week 6)

**任务**:
- [ ] 实现任务分解
- [ ] 构建依赖图
- [ ] 生成执行计划
- [ ] 优化并行策略
- [ ] **与规划文件同步**: 执行计划与 task_plan.md 同步

**交付物**:
- `packages/opencode/src/unified/plan-generator.ts`
- 计划生成算法
- 测试用例

#### 2.4 OpenWork 调度集成 (Week 6-7)

**任务**:
- [ ] 集成智能调度到 OpenWork
- [ ] 实现执行计划可视化
- [ ] 实现 Agent 选择界面
- [ ] 状态同步
- [ ] **规划文件同步显示**: 实时显示规划文件更新

**交付物**:
- OpenWork 调度界面
- 可视化组件
- 集成测试

### 阶段 3: 执行引擎 + Hooks 集成 (4-5 周)

#### 3.1 任务执行引擎 (Week 7)

**任务**:
- [ ] 实现任务执行器
- [ ] 支持串行和并行执行
- [ ] 实现依赖管理
- [ ] 实现进度跟踪
- [ ] **Hooks 集成**: 在执行前后触发 Hooks
- [ ] **规划文件更新**: 自动更新规划文件

**交付物**:
- `packages/opencode/src/unified/execution-engine.ts`
- 执行引擎文档
- 测试用例

#### 3.2 错误处理和重试 (Week 7-8)

**任务**:
- [ ] 实现错误检测
- [ ] 实现重试机制
- [ ] 实现错误恢复
- [ ] 实现回滚机制
- [ ] **错误记录**: 记录错误到 task_plan.md
- [ ] **3-Strike 协议**: 实现 3-Strike 错误协议

**交付物**:
- 错误处理模块
- 重试策略配置
- 测试用例

#### 3.3 进度报告和日志 (Week 8)

**任务**:
- [ ] 实现进度报告
- [ ] 实现日志系统
- [ ] 实现结果汇总
- [ ] 支持 JSON 和文本格式
- [ ] **规划文件更新**: 更新 progress.md

**交付物**:
- 进度报告模块
- 日志系统
- 测试用例

#### 3.4 OpenWork 执行集成 (Week 8-9)

**任务**:
- [ ] 集成执行引擎到 OpenWork
- [ ] 实现实时进度显示
- [ ] 实现步骤状态更新
- [ ] 实现结果展示
- [ ] **规划文件实时更新**: 实时显示规划文件变化

**交付物**:
- OpenWork 执行界面
- 实时更新组件
- 集成测试

### 阶段 4: 集成和优化 (3-4 周)

#### 4.1 系统集成 (Week 9)

**任务**:
- [ ] 集成所有模块
- [ ] 端到端测试
- [ ] 性能优化
- [ ] 错误修复
- [ ] **Manus 模式端到端测试**: 测试完整 Manus 工作流

**交付物**:
- 集成测试
- 性能报告
- 问题修复

#### 4.2 用户体验优化 (Week 9-10)

**任务**:
- [ ] 优化交互流程
- [ ] 改进错误提示
- [ ] 添加进度可视化
- [ ] 优化输出格式
- [ ] OpenWork UI/UX 优化
- [ ] **规划文件可视化优化**: 改进规划文件显示

**交付物**:
- UI/UX 改进
- 用户文档
- 示例

#### 4.3 跨平台测试 (Week 10)

**任务**:
- [ ] Linux 测试
- [ ] macOS 测试
- [ ] Windows 测试
- [ ] 兼容性修复
- [ ] OpenWork 桌面应用测试
- [ ] **规划文件跨平台测试**: 测试规划文件在不同平台的行为

**交付物**:
- 跨平台测试报告
- 兼容性修复
- 文档更新

### 阶段 5: 文档和发布 (1-2 周)

#### 5.1 文档编写 (Week 11)

**任务**:
- [ ] 用户文档
- [ ] API 文档
- [ ] 开发文档
- [ ] 示例和教程
- [ ] OpenWork 使用指南
- [ ] **Manus 模式使用指南**: 详细说明 Manus 模式的使用

**交付物**:
- 完整文档
- 示例代码
- 教程视频（可选）

#### 5.2 发布准备 (Week 11-12)

**任务**:
- [ ] 版本号管理
- [ ] 发布说明
- [ ] 迁移指南
- [ ] 社区通知
- [ ] OpenWork 应用打包
- [ ] **规划文件迁移工具**: 帮助用户迁移现有规划文件

**交付物**:
- 发布版本
- 发布说明
- 社区公告

---

## 技术实现

### 技术选型

#### 核心语言和框架
- **TypeScript**: 类型安全，易于维护
- **Bun**: 运行时和包管理
- **Tauri**: 桌面应用框架（OpenWork）
- **SolidJS**: 前端框架（OpenWork）
- **Python**: 会话恢复脚本（session-catchup.py）
- **现有架构**: 复用 OpenCode 现有架构

#### 关键依赖
- **LLM API**: 使用现有 Provider 系统
- **任务调度**: 自定义实现或使用现有工具
- **依赖图**: 使用图算法库（如 `graphlib`）
- **OpenCode SDK**: `@opencode-ai/sdk/v2/client`
- **planning-with-files**: 集成现有 skill
- **文件锁**: `proper-lockfile` 或 `flock`（解决并发更新问题）
- **缓存**: 内存缓存（用于 Hooks 文件读取优化）

### 实现细节

#### 1. Manus 文件规划实现

```typescript
// packages/opencode/src/unified/manus-planning.ts
import { readFile, writeFile, exists, rename } from 'fs/promises'
import { join } from 'path'
import { lock } from 'proper-lockfile'

export class ManusPlanningSystem {
  private planningFilesDir: string
  
  constructor(directory: string) {
    this.planningFilesDir = directory
  }
  
  async createPlanningFiles(task: ParsedRequirement): Promise<void> {
    const templates = await this.loadTemplates()
    
    // 创建 task_plan.md
    const taskPlan = this.generateTaskPlan(templates.taskPlan, task)
    await writeFile(
      join(this.planningFilesDir, 'task_plan.md'),
      taskPlan
    )
    
    // 创建 findings.md
    const findings = templates.findings
    await writeFile(
      join(this.planningFilesDir, 'findings.md'),
      findings
    )
    
    // 创建 progress.md
    const progress = templates.progress
    await writeFile(
      join(this.planningFilesDir, 'progress.md'),
      progress
    )
  }
  
  async updateTaskPlan(phase: string, status: string): Promise<void> {
    const filePath = join(this.planningFilesDir, 'task_plan.md')
    
    // 使用文件锁防止并发更新竞态条件
    const release = await lock(filePath, { 
      retries: {
        retries: 10,
        minTimeout: 100,
        maxTimeout: 1000
      }
    })
    
    try {
      const content = await readFile(filePath, 'utf-8')
      
      // 更新阶段状态
      const updated = content.replace(
        new RegExp(`### ${phase}.*?\\*\\*Status:\\*\\* \\w+`, 's'),
        `### ${phase}...**Status:** ${status}`
      )
      
      // 原子写入：先写临时文件，再重命名
      const tempPath = `${filePath}.tmp`
      await writeFile(tempPath, updated, 'utf-8')
      await rename(tempPath, filePath)
    } finally {
      await release()
    }
  }
  
  async logError(error: Error, attempt: number): Promise<void> {
    const filePath = join(this.planningFilesDir, 'task_plan.md')
    
    // 使用文件锁防止并发更新
    const release = await lock(filePath, { 
      retries: {
        retries: 10,
        minTimeout: 100,
        maxTimeout: 1000
      }
    })
    
    try {
      const content = await readFile(filePath, 'utf-8')
      
      // 添加到错误表
      const errorRow = `| ${error.message} | ${attempt} | ${new Date().toISOString()} |`
      const updated = content.replace(
        /## Errors Encountered.*?\|/s,
        `## Errors Encountered\n| Error | Attempt | Resolution |\n|-------|---------|------------|\n${errorRow}\n|`
      )
      
      // 原子写入
      const tempPath = `${filePath}.tmp`
      await writeFile(tempPath, updated, 'utf-8')
      await rename(tempPath, filePath)
    } finally {
      await release()
    }
  }
  
  async recoverSession(): Promise<RecoveryReport> {
    // 首先验证 OpenCode 会话格式兼容性
    const sessionFormat = await this.verifySessionFormat()
    if (!sessionFormat.compatible) {
      // 如果格式不兼容，使用原生恢复机制
      return await this.recoverSessionNative()
    }
    
    // 调用 session-catchup.py（如果兼容）
    const { exec } = require('child_process')
    const scriptPath = join(
      process.env.HOME || process.env.USERPROFILE,
      '.config/opencode/skills/planning-with-files/scripts/session-catchup.py'
    )
    
    return new Promise((resolve, reject) => {
      exec(
        `python3 ${scriptPath} "${this.planningFilesDir}"`,
        { timeout: 30000 }, // 30秒超时
        (error, stdout, stderr) => {
          if (error) {
            // 如果脚本失败，回退到原生恢复
            this.recoverSessionNative().then(resolve).catch(reject)
            return
          }
          
          // 解析输出
          const report = this.parseRecoveryReport(stdout)
          resolve(report)
        }
      )
    })
  }
  
  private async verifySessionFormat(): Promise<{ compatible: boolean; reason?: string }> {
    // 验证 OpenCode 会话格式是否与 session-catchup.py 兼容
    // 检查会话文件格式、JSONL 结构等
    // 返回兼容性结果
    // TODO: 实现格式验证逻辑
    return { compatible: true }
  }
  
  private async recoverSessionNative(): Promise<RecoveryReport> {
    // 原生会话恢复实现（不依赖 Python 脚本）
    // 直接读取 OpenCode 会话数据
    // TODO: 实现原生恢复逻辑
    return {
      hasUnsyncedContext: false,
      recommendations: []
    }
  }
}
```

#### 2. Hooks 集成实现

```typescript
// packages/opencode/src/unified/execution-engine.ts
export class ExecutionEngine {
  private hooks: {
    preToolUse: Map<string, Array<(context: ToolContext) => Promise<void>>>
    postToolUse: Map<string, Array<(context: ToolContext) => Promise<void>>>
    stop: Array<(context: StopContext) => Promise<boolean>>
  }
  
  // 文件读取缓存（优化 Hooks 性能）
  private fileCache: Map<string, { content: string; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 2000 // 2秒缓存
  
  constructor() {
    this.hooks = {
      preToolUse: new Map(),
      postToolUse: new Map(),
      stop: []
    }
  }
  
  async executeStep(step: ExecutionStep, context: ExecutionContext): Promise<StepResult> {
    // PreToolUse Hook（异步执行，不阻塞主流程）
    if (this.hooks.preToolUse.has(step.tool)) {
      const callbacks = this.hooks.preToolUse.get(step.tool)!
      // 并行执行所有 callbacks，不等待完成
      Promise.all(callbacks.map(callback => 
        callback({
          tool: step.tool,
          args: step.args,
          directory: context.directory,
          sessionId: context.sessionId,
          planningFiles: await this.getPlanningFilesCached(context.directory)
        }).catch(err => {
          // Hook 执行失败不应影响主流程
          console.error('Hook execution failed:', err)
        })
      )).catch(() => {}) // 忽略错误，继续执行
    }
    
    // 执行工具
    const result = await this.executeTool(step.tool, step.args)
    
    // PostToolUse Hook（异步执行）
    if (this.hooks.postToolUse.has(step.tool)) {
      const callbacks = this.hooks.postToolUse.get(step.tool)!
      // 异步执行，不阻塞主流程
      Promise.all(callbacks.map(callback =>
        callback({
          tool: step.tool,
          args: step.args,
          directory: context.directory,
          sessionId: context.sessionId,
          planningFiles: await this.getPlanningFilesCached(context.directory),
          result
        }).catch(err => {
          console.error('PostHook execution failed:', err)
        })
      )).catch(() => {})
    }
    
    // 更新规划文件（如果需要）
    if (step.updatePlanningFile) {
      await this.updatePlanningFiles(context, step, result)
    }
    
    return result
  }
  
  async checkStop(context: StopContext): Promise<boolean> {
    // Stop Hook
    for (const callback of this.hooks.stop) {
      const shouldStop = await callback(context)
      if (!shouldStop) {
        return false
      }
    }
    
    // 检查所有阶段是否完成
    const allPhasesComplete = context.remainingPhases.length === 0
    return allPhasesComplete
  }
  
  // 带缓存的规划文件读取（优化性能）
  private async getPlanningFilesCached(directory: string): Promise<{
    taskPlan?: string
    findings?: string
    progress?: string
  }> {
    const now = Date.now()
    const taskPlanPath = join(directory, 'task_plan.md')
    const findingsPath = join(directory, 'findings.md')
    const progressPath = join(directory, 'progress.md')
    
    const getCachedOrRead = async (path: string): Promise<string | undefined> => {
      const cached = this.fileCache.get(path)
      if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
        return cached.content
      }
      
      try {
        const content = await readFile(path, 'utf-8')
        this.fileCache.set(path, { content, timestamp: now })
        return content
      } catch {
        return undefined
      }
    }
    
    return {
      taskPlan: await getCachedOrRead(taskPlanPath),
      findings: await getCachedOrRead(findingsPath),
      progress: await getCachedOrRead(progressPath)
    }
  }
  
  // 清除缓存（当文件更新时调用）
  clearCache(directory: string): void {
    const paths = [
      join(directory, 'task_plan.md'),
      join(directory, 'findings.md'),
      join(directory, 'progress.md')
    ]
    paths.forEach(path => this.fileCache.delete(path))
  }
  
  private async updatePlanningFiles(
    context: ExecutionContext,
    step: ExecutionStep,
    result: StepResult
  ): Promise<void> {
    const manus = new ManusPlanningSystem(context.directory)
    
    // 更新 progress.md
    await manus.updateProgress({
      type: step.phaseId ? 'phase_complete' : 'action',
      description: `Executed ${step.tool}`,
      files: result.filesModified,
      timestamp: new Date()
    })
    
    // 如果阶段完成，更新 task_plan.md
    if (step.phaseId && result.success) {
      await manus.updateTaskPlan(step.phaseId, 'complete')
    }
  }
}
```

#### 3. OpenWork 规划文件可视化

```typescript
// openwork/src/components/PlanningFilesView.tsx
export default function PlanningFilesView(props: PlanningFilesViewProps) {
  const [activeTab, setActiveTab] = createSignal<'task_plan' | 'findings' | 'progress'>('task_plan')
  const [content, setContent] = createSignal<string>('')
  
  createEffect(() => {
    // 监听规划文件更新
    if (props.planningFiles) {
      const file = props.planningFiles[activeTab()]
      if (file) {
        setContent(file)
      }
    }
  })
  
  return (
    <div class="planning-files-view">
      {/* 标签页 */}
      <div class="tabs">
        <button
          class={activeTab() === 'task_plan' ? 'active' : ''}
          onClick={() => setActiveTab('task_plan')}
        >
          Task Plan
          {props.planningFilesStatus?.taskPlan && (
            <span class={`status ${props.planningFilesStatus.taskPlan}`}>
              {props.planningFilesStatus.taskPlan}
            </span>
          )}
        </button>
        <button
          class={activeTab() === 'findings' ? 'active' : ''}
          onClick={() => setActiveTab('findings')}
        >
          Findings
          {props.planningFilesStatus?.findings && (
            <span class={`status ${props.planningFilesStatus.findings}`}>
              {props.planningFilesStatus.findings}
            </span>
          )}
        </button>
        <button
          class={activeTab() === 'progress' ? 'active' : ''}
          onClick={() => setActiveTab('progress')}
        >
          Progress
          {props.planningFilesStatus?.progress && (
            <span class={`status ${props.planningFilesStatus.progress}`}>
              {props.planningFilesStatus.progress}
            </span>
          )}
        </button>
      </div>
      
      {/* 内容显示 */}
      <div class="content">
        <MarkdownView content={content()} />
      </div>
    </div>
  )
}
```

---

## 测试计划

### 单元测试

- 需求理解模块测试
- 项目检测模块测试
- Agent 匹配模块测试
- 执行引擎测试
- **Manus 规划系统测试**: 
  - 测试规划文件创建、更新、恢复
  - **并发更新测试**: 测试文件锁机制，确保无竞态条件
  - **原子写入测试**: 验证临时文件 + 重命名机制
- **Hooks 系统测试**: 
  - 测试 Hooks 触发和回调
  - **性能测试**: 测试缓存机制，确保响应时间 < 100ms
  - **并发测试**: 测试多个 Hooks 同时执行
  - **超时测试**: 测试 Hook 执行超时处理
- OpenWork 组件测试

### 集成测试

- 端到端场景测试
- CLI + OpenWork 集成测试
- **Manus 模式端到端测试**: 测试完整 Manus 工作流
- **并发场景测试**: 测试多个工具同时更新规划文件
- **会话恢复兼容性测试**: 验证 session-catchup.py 与 OpenCode 格式兼容性
- 跨平台兼容性测试（Linux、macOS、Windows）
- **性能测试**: 
  - 响应时间测试（目标 < 2s）
  - Hooks 性能测试（目标 < 100ms）
  - 并发性能测试
- 错误处理测试
- **会话恢复测试**: 测试会话恢复功能（包括原生恢复备选方案）

### 用户测试

- 真实场景测试
- 用户体验测试
- 反馈收集
- **Manus 模式用户测试**: 测试 Manus 模式的实际使用

---

## 部署计划

### 开发环境

- 本地开发环境设置
- 测试数据准备
- 开发工具配置
- **规划文件模板准备**: 准备规划文件模板

### 测试环境

- CI/CD 集成
- 自动化测试
- 性能监控
- **规划文件测试数据**: 准备测试用的规划文件

### 生产环境

- 版本发布
- 文档更新
- 社区通知
- OpenWork 应用分发
- **规划文件迁移工具**: 提供迁移工具帮助用户

---

## 风险和挑战

### 技术风险

1. **需求理解准确性**: LLM 可能误解用户需求
   - **缓解**: 多轮确认，提供示例

2. **Agent 选择准确性**: 可能选择不合适的 Agent
   - **缓解**: 建立能力矩阵，持续优化

3. **执行性能**: 复杂任务可能执行缓慢
   - **缓解**: 并行执行，优化算法

4. **OpenWork 集成复杂度**: GUI 集成可能复杂
   - **缓解**: 模块化设计，逐步集成

5. **Manus 模式集成**: 规划文件同步可能复杂
   - **缓解**: 使用现有 planning-with-files skill，充分测试
   - **新增缓解**: 实现文件锁机制，防止并发更新竞态条件

6. **Hooks 性能**: Hooks 可能影响执行性能
   - **缓解**: 异步执行，优化 Hook 逻辑
   - **新增缓解**: 实现文件读取缓存（TTL 2秒），减少 I/O 操作

7. **规划文件并发更新竞态条件** ⚠️ 严重风险
   - **问题**: 多个工具同时更新规划文件可能导致数据丢失
   - **缓解**: 使用 `proper-lockfile` 实现文件锁，原子写入机制

8. **会话恢复脚本兼容性** ⚠️ 严重风险
   - **问题**: session-catchup.py 依赖 Claude 格式，可能与 OpenCode 不兼容
   - **缓解**: 验证兼容性，实现原生恢复作为备选方案

### 用户体验风险

1. **学习曲线**: 用户需要时间适应新系统
   - **缓解**: 提供详细文档和示例

2. **错误处理**: 错误信息可能不够友好
   - **缓解**: 改进错误提示，提供解决方案

3. **规划文件管理**: 用户可能不知道如何管理规划文件
   - **缓解**: 提供清晰的文档和示例

### 兼容性风险

1. **跨平台差异**: 不同平台可能有差异
   - **缓解**: 充分测试，提供平台特定文档

2. **OpenWork 打包**: 桌面应用打包可能复杂
   - **缓解**: 使用 Tauri 标准流程，充分测试

3. **规划文件格式**: 不同平台的文件格式可能有差异
   - **缓解**: 使用标准 Markdown，充分测试

---

## 成功指标

### 功能指标

- ✅ 需求理解准确率 > 80%
- ✅ Agent 选择准确率 > 85%
- ✅ 任务执行成功率 > 90%
- ✅ 平均响应时间 < 2s
- ✅ OpenWork GUI 响应时间 < 100ms
- ✅ **规划文件同步准确率 > 95%**: 规划文件与执行状态同步
- ✅ **会话恢复成功率 > 90%**: 能够成功恢复未同步的上下文

### 用户体验指标

- ✅ 用户满意度 > 4/5
- ✅ 错误率 < 5%
- ✅ 文档完整性 > 90%
- ✅ OpenWork UI 流畅度 60fps
- ✅ **Manus 模式采用率 > 60%**: 复杂任务中使用 Manus 模式的比例

---

## 后续优化

### 短期优化 (3-6 个月)

- 改进需求理解准确性
- 优化 Agent 选择算法
- 增强错误处理
- 改进用户体验
- OpenWork UI/UX 优化
- **优化规划文件更新性能**: 减少规划文件更新延迟
- **增强会话恢复能力**: 提高会话恢复的准确性

### 长期优化 (6-12 个月)

- 支持更多项目类型
- 增强自动化能力
- 集成更多工具
- 构建社区生态
- OpenWork 移动端支持
- **规划文件智能分析**: 使用 AI 分析规划文件，提供建议
- **多项目规划文件管理**: 支持管理多个项目的规划文件

---

---

## 改进说明（v4.0）

### 基于可行性评估报告的改进

本版本（v4.0）基于《OpenCode开发计划_可行性评估和漏洞分析_v1.0》的建议进行了以下关键改进：

#### 1. 并发控制机制 ✅
- 添加文件锁机制（`proper-lockfile`）防止规划文件并发更新竞态条件
- 实现原子写入（临时文件 + 重命名）
- 添加并发更新测试用例

#### 2. 会话恢复兼容性 ✅
- 添加会话格式兼容性验证
- 实现原生恢复机制作为备选方案
- 添加兼容性测试

#### 3. Hooks 性能优化 ✅
- 实现文件读取缓存（TTL 2秒）
- 异步执行 Hooks，不阻塞主流程
- 添加 Hook 执行超时机制
- 添加性能测试

#### 4. 时间估算调整 ⚠️
- Hooks 集成从 Week 3 延长至 Week 3-4（增加 1 周）
- 阶段 1 总时间从 4-5 周调整为 5-6 周
- 整体项目时间从 10-11 周调整为 11-12 周

#### 5. 测试计划增强 ✅
- 添加并发场景测试
- 添加性能测试（响应时间、Hooks 性能）
- 添加会话恢复兼容性测试
- 添加 Hook 超时和并发测试

#### 6. 风险缓解措施 ✅
- 添加规划文件并发更新风险缓解
- 添加会话恢复兼容性风险缓解
- 添加 Hooks 性能风险缓解

### 实施优先级

根据评估报告，建议按以下优先级实施：

**高优先级（必须实现）**:
1. ✅ 统一入口命令
2. ✅ 项目检测系统
3. ✅ 规划文件创建
4. ⚠️ **文件并发控制**（必须修复竞态条件）
5. ⚠️ **Hooks 基础集成**（需要仔细设计）

**中优先级（重要但可延后）**:
1. ⚠️ 需求理解系统（可以先实现简单版本）
2. ⚠️ 智能调度系统（可以先实现规则匹配）
3. ⚠️ 执行引擎扩展（可以分步实现）

**低优先级（可以后续优化）**:
1. ⚠️ 会话恢复机制（可以先验证兼容性）
2. ⚠️ 高级智能调度（可以后续优化）

---

**文档版本**: v4.0  
**最后更新**: 2026-01-26  
**维护者**: OpenCode Team  
**基于评估**: OpenCode开发计划_可行性评估和漏洞分析_v1.0_20260126_AI.md

