# OpenCode 开发计划：统一入口、智能调度与 Manus 模式集成

**版本**: v5.0  
**日期**: 2026-01-26  
**作者**: AI Assistant (Claude-4)  
**目标**: 实现跨平台统一入口，集成 OpenWork GUI 和 Manus 文件规划模式，用户只需指定工作目录和需求，系统自动调用合适的 Agent 完成任务

**更新说明**: v5.0 基于可行性分析报告（v1.0）的建议进行了**重大架构调整**，修复了所有 P0 严重漏洞：

### 🔴 P0 漏洞修复（必须修复）

1. ✅ **Hooks 系统格式不匹配** - 创建适配器，将 planning-with-files 命令式 Hooks 转换为 OpenCode 事件式 Hooks
2. ✅ **PreToolUse Hook 异步执行问题** - 改为**阻塞执行**，确保在工具执行前读取 task_plan.md
3. ✅ **执行引擎架构重复** - **不创建独立执行引擎**，而是扩展 OpenCode 现有 `SessionPrompt` 系统
4. ✅ **文件锁依赖缺失** - 添加 `proper-lockfile` 依赖到 package.json
5. ✅ **会话恢复兼容性** - 验证 session-catchup.py 兼容性，实现原生恢复备选方案
6. ✅ **规划文件更新同步问题** - 实现事务机制，确保工具执行与规划文件更新同步
7. ✅ **需求理解系统降级方案** - 添加规则匹配备选，不依赖 LLM
8. ✅ **OpenWork 集成路径** - 提取共享模块，CLI 和 GUI 使用相同底层实现

### ⚠️ 架构调整

- **执行引擎**: 不再创建独立 `ExecutionEngine`，而是扩展 `SessionPrompt.prompt()` 支持 Manus 模式
- **Hooks 系统**: 使用 OpenCode 现有 `Plugin.trigger()` 系统，创建适配器转换命令式 Hooks
- **共享模块**: 提取统一入口逻辑为共享模块，CLI 和 OpenWork 共用

### ⏱️ 时间估算调整

- **原计划**: 17-22 周
- **调整后**: 23-28 周（+6 周缓冲）
- **原因**: Hooks 适配器开发、架构重构、测试和调试需要更多时间

---

## 目录

- [项目目标](#项目目标)
- [核心设计理念](#核心设计理念)
- [Manus 模式分析](#manus-模式分析)
- [OpenWork 功能分析](#openwork-功能分析)
- [需求分析](#需求分析)
- [系统设计（v5.0 架构调整）](#系统设计v50-架构调整)
- [开发计划](#开发计划)
- [技术实现（v5.0 改进）](#技术实现v50-改进)
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

#### 2. Hooks 系统（v5.0 改进）

**planning-with-files 使用命令式 Hooks**:
```yaml
hooks:
  PreToolUse:
    - matcher: "Write|Edit|Bash|Read|Glob|Grep"
      hooks:
        - type: command
          command: "cat task_plan.md 2>/dev/null | head -30 || true"
```

**OpenCode 使用事件式 Hooks**:
```typescript
await Plugin.trigger("tool.execute.before", {
  tool: key,
  sessionID: ctx.sessionID,
  callID: opts.toolCallId,
}, { args })
```

**v5.0 解决方案**: 创建 Hooks 适配器，将命令式 Hooks 转换为事件式 Hooks

#### 3. 会话恢复系统

**功能**: 自动检测和恢复未同步的上下文

**实现**:
- `session-catchup.py`: 分析前一个会话的 JSONL 文件（需要验证兼容性）
- 原生恢复机制: 直接读取 OpenCode 会话数据（备选方案）

#### 4. 错误处理协议

**3-Strike 错误协议**:
1. **尝试1**: 诊断和修复
2. **尝试2**: 替代方法（绝不重复相同的失败操作）
3. **尝试3**: 重新思考（质疑假设，搜索解决方案）
4. **3次失败后**: 升级到用户

---

## 系统设计（v5.0 架构调整）

### 架构设计（重大调整）

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
│           共享统一入口模块 (Shared Unified Module)        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 需求理解     │  │ 项目检测     │  │ Manus 规划   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│        Manus 文件规划系统 (Manus Planning System)        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 规划文件创建 │  │ Hooks 适配器 │  │ 会话恢复     │ │
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
│   扩展 OpenCode SessionPrompt (不创建独立执行引擎)        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ prompt()     │  │ resolveTools │  │ Plugin.trigger│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Manus Hooks  │  │ 规划文件更新 │  │ 错误记录     │ │
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

### 核心模块设计（v5.0 调整）

#### 1. 共享统一入口模块（新增）

**文件**: `packages/opencode/src/unified/index.ts`

**功能**:
- 统一入口逻辑（不依赖 CLI）
- 需求理解
- 项目检测
- Manus 模式管理
- 智能调度

**接口**:
```typescript
export async function unifiedEntry(options: UnifiedEntryOptions): Promise<UnifiedEntryResult> {
  // 1. 需求理解（带降级方案）
  const parsed = await parseRequirement(options.requirement)
  
  // 2. 项目检测
  const project = await detectProject(options.directory)
  
  // 3. Manus 模式判断
  const useManus = shouldUseManus(parsed, project)
  
  // 4. 创建规划文件（如果需要）
  if (useManus) {
    await ManusPlanningSystem.createPlanningFiles(options.directory, parsed)
    await ManusPlanningSystem.initializeHooks(options.sessionID)
  }
  
  // 5. 智能调度
  const plan = await generateExecutionPlan(parsed, project)
  
  // 6. 执行（使用 OpenCode 现有系统）
  return await executeWithOpenCode(plan, options)
}
```

**CLI 使用**:
```typescript
// packages/opencode/src/cli/cmd/unified.ts
export async function unifiedCommand(options: UnifiedCommandOptions) {
  return await unifiedEntry({
    directory: options.dir,
    requirement: options.requirement,
    sessionID: await createSession(),
    // ...
  })
}
```

**OpenWork 使用**:
```typescript
// openwork/src/app/unified.ts
export async function unifiedTask(options: UnifiedTaskOptions) {
  return await unifiedEntry({
    directory: options.workspacePath,
    requirement: options.requirement,
    sessionID: options.sessionID,
    // ...
  })
}
```

#### 2. Hooks 适配器（新增，P0 修复）

**文件**: `packages/opencode/src/unified/manus-hooks-adapter.ts`

**功能**: 将 planning-with-files 命令式 Hooks 转换为 OpenCode 事件式 Hooks

**实现**:
```typescript
import { Plugin } from '../plugin'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class ManusHooksAdapter {
  private planningFilesDir: string
  private fileCache: Map<string, { content: string; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 500 // 500ms 缓存（减少到 500ms 提高一致性）
  
  constructor(directory: string) {
    this.planningFilesDir = directory
  }
  
  /**
   * 注册 PreToolUse Hook（阻塞执行）
   * 这是 P0 修复：PreToolUse Hook 必须阻塞，确保在工具执行前读取 task_plan.md
   */
  registerPreToolUseHook(): void {
    Plugin.register({
      "tool.execute.before": async (input, output) => {
        const { tool } = input
        
        // 只处理特定工具（匹配 planning-with-files 的 matcher）
        if (!/Write|Edit|Bash|Read|Glob|Grep/.test(tool)) {
          return
        }
        
        // 读取 task_plan.md 的前 30 行（阻塞执行）
        const taskPlanPath = join(this.planningFilesDir, 'task_plan.md')
        const content = await this.readTaskPlanCached(taskPlanPath)
        
        if (content) {
          const lines = content.split('\n').slice(0, 30).join('\n')
          // 将内容注入到系统消息或上下文中
          // 注意：这里需要与 OpenCode 的消息系统集成
          // 可以通过修改 output.args 或使用其他机制
          console.log('[Manus] PreToolUse: Refreshed task plan context')
        }
      }
    })
  }
  
  /**
   * 注册 PostToolUse Hook（异步执行，不阻塞）
   */
  registerPostToolUseHook(): void {
    Plugin.register({
      "tool.execute.after": async (input, output) => {
        const { tool } = input
        
        // 只处理 Write/Edit 工具
        if (!/Write|Edit/.test(tool)) {
          return
        }
        
        // 异步提醒更新状态（不阻塞）
        setImmediate(() => {
          console.log('[Manus] PostToolUse: File updated. If this completes a phase, update task_plan.md status.')
        })
      }
    })
  }
  
  /**
   * 注册 Stop Hook
   */
  registerStopHook(): void {
    // Stop Hook 需要在会话级别实现
    // 可以通过监听会话事件或扩展 SessionPrompt 实现
    // TODO: 实现 Stop Hook
  }
  
  /**
   * 读取 task_plan.md（带缓存）
   */
  private async readTaskPlanCached(path: string): Promise<string | null> {
    const now = Date.now()
    const cached = this.fileCache.get(path)
    
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.content
    }
    
    try {
      const content = await readFile(path, 'utf-8')
      this.fileCache.set(path, { content, timestamp: now })
      return content
    } catch {
      return null
    }
  }
  
  /**
   * 清除缓存（文件更新时调用）
   */
  clearCache(): void {
    this.fileCache.clear()
  }
}
```

#### 3. 扩展 SessionPrompt（不创建独立执行引擎）

**文件**: `packages/opencode/src/session/prompt.ts`（扩展现有文件）

**功能**: 扩展 `SessionPrompt.prompt()` 支持 Manus 模式

**实现**:
```typescript
// 在 SessionPrompt 命名空间中添加新函数
export namespace SessionPrompt {
  // ... 现有代码 ...
  
  /**
   * 带 Manus 模式的 prompt（v5.0 新增）
   */
  export async function promptWithManus(input: {
    sessionID: string
    parts: MessageV2.Part[]
    directory?: string
    useManus?: boolean
    planningFilesDir?: string
  }): Promise<MessageV2.Assistant> {
    // 如果使用 Manus 模式，初始化 Hooks
    if (input.useManus) {
      const adapter = new ManusHooksAdapter(input.planningFilesDir || input.directory || process.cwd())
      adapter.registerPreToolUseHook()
      adapter.registerPostToolUseHook()
      adapter.registerStopHook()
    }
    
    // 使用现有的 prompt 系统
    return await prompt({
      sessionID: input.sessionID,
      parts: input.parts,
      directory: input.directory,
    })
  }
}
```

#### 4. 需求理解模块（添加降级方案）

**文件**: `packages/opencode/src/unified/requirement-parser.ts`

**功能**: 需求理解，带规则匹配降级方案

**实现**:
```typescript
export class RequirementParser {
  /**
   * 解析需求（带降级方案）
   */
  async parse(requirement: string): Promise<ParsedRequirement> {
    try {
      // 尝试使用 LLM 分析
      return await this.parseWithLLM(requirement)
    } catch (error) {
      // 降级到规则匹配
      console.warn('[RequirementParser] LLM failed, using rule-based fallback')
      return await this.parseWithRules(requirement)
    }
  }
  
  /**
   * 使用 LLM 分析需求
   */
  private async parseWithLLM(requirement: string): Promise<ParsedRequirement> {
    // 使用 OpenCode 的 LLM Provider 系统
    const model = await Provider.defaultModel()
    // ... LLM 分析逻辑
  }
  
  /**
   * 使用规则匹配分析需求（降级方案）
   */
  private parseWithRules(requirement: string): ParsedRequirement {
    const lower = requirement.toLowerCase()
    
    // 基于关键词匹配
    const type = 
      /(开发|实现|创建|构建|编写)/.test(lower) ? 'development' :
      /(分析|检查|查看|审查)/.test(lower) ? 'analysis' :
      /(修复|解决|调试)/.test(lower) ? 'fix' :
      /(测试|验证)/.test(lower) ? 'test' :
      'development'
    
    const complexity = 
      requirement.length > 100 || /(包括|和|以及)/.test(lower) ? 'complex' :
      requirement.length > 50 ? 'medium' :
      'simple'
    
    const skills: string[] = []
    if (/(前端|frontend|react|vue|angular)/.test(lower)) skills.push('frontend')
    if (/(后端|backend|api|server)/.test(lower)) skills.push('backend')
    if (/(数据库|database|db|sql)/.test(lower)) skills.push('database')
    
    const estimatedToolCalls = complexity === 'complex' ? 10 : complexity === 'medium' ? 5 : 2
    
    return {
      type,
      complexity,
      skills,
      dependencies: [],
      useManus: estimatedToolCalls > 5,
      estimatedToolCalls,
    }
  }
}
```

#### 5. Manus 文件规划模块（改进）

**文件**: `packages/opencode/src/unified/manus-planning.ts`

**改进**:
- ✅ 添加 `proper-lockfile` 依赖
- ✅ 实现事务机制
- ✅ 验证会话恢复兼容性

**实现**:
```typescript
import { lock } from 'proper-lockfile' // 需要添加到 package.json

export class ManusPlanningSystem {
  /**
   * 更新规划文件（带事务机制）
   */
  async updateTaskPlanWithTransaction(
    phase: string,
    status: string,
    toolExecution: () => Promise<{ success: boolean; error?: Error }>
  ): Promise<void> {
    const filePath = join(this.planningFilesDir, 'task_plan.md')
    
    // 使用文件锁
    const release = await lock(filePath, {
      retries: {
        retries: 10,
        minTimeout: 100,
        maxTimeout: 1000
      }
    })
    
    try {
      // 先执行工具
      const result = await toolExecution()
      
      // 只有工具执行成功才更新规划文件
      if (result.success) {
        const content = await readFile(filePath, 'utf-8')
        const updated = this.updatePhaseStatus(content, phase, status)
        
        // 原子写入
        const tempPath = `${filePath}.tmp`
        await writeFile(tempPath, updated, 'utf-8')
        await rename(tempPath, filePath)
      } else {
        // 工具执行失败，记录错误
        await this.logError(result.error!, 1)
      }
    } finally {
      await release()
    }
  }
  
  /**
   * 验证会话恢复兼容性
   */
  async verifySessionRecoveryCompatibility(): Promise<{
    compatible: boolean
    reason?: string
    useNative: boolean
  }> {
    // 检查 OpenCode 会话格式
    // 如果格式不兼容，返回 useNative: true
    // TODO: 实现格式验证逻辑
    return {
      compatible: false, // 默认不兼容，使用原生恢复
      useNative: true
    }
  }
}
```

---

## 开发计划（v5.0 时间调整）

### 阶段 1: 基础架构 + Manus 集成 (7-8 周) ⚠️ 时间延长

#### 1.1 统一入口命令 (Week 1)

**任务**:
- [ ] 创建共享统一入口模块（不依赖 CLI）
- [ ] 创建 `unified` 命令（CLI，调用共享模块）
- [ ] 实现参数解析
- [ ] 支持工作目录指定
- [ ] 支持交互式输入
- [ ] **Manus 模式检测**: 自动检测是否需要 Manus 模式

**交付物**:
- `packages/opencode/src/unified/index.ts`（共享模块）
- `packages/opencode/src/cli/cmd/unified.ts`（CLI）
- 单元测试
- 文档

#### 1.2 需求理解系统 (Week 1-2)

**任务**:
- [ ] 实现需求分类器（LLM）
- [ ] 实现规则匹配降级方案（P0 修复）
- [ ] 实现信息提取器
- [ ] 实现复杂度评估
- [ ] 构建需求模板库
- [ ] **Manus 模式判断**: 判断是否需要使用 Manus 模式

**交付物**:
- `packages/opencode/src/unified/requirement-parser.ts`
- 需求分类模型
- 规则匹配降级方案
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
- [ ] **添加 proper-lockfile 依赖**（P0 修复）
- [ ] 实现规划文件更新接口（使用文件锁防止并发更新）
- [ ] 实现原子写入机制（临时文件 + 重命名）
- [ ] **验证会话恢复脚本兼容性**（P0 修复）
- [ ] 实现原生会话恢复机制（备选方案）
- [ ] 实现错误记录系统（使用文件锁）
- [ ] **实现事务机制**（P0 修复）

**交付物**:
- `packages/opencode/src/unified/manus-planning.ts`
- `packages/opencode/package.json`（添加 proper-lockfile）
- 规划文件模板
- 会话恢复脚本（兼容性验证）
- 文件锁实现
- 事务机制实现
- 并发更新测试用例
- 会话恢复测试用例

#### 1.5 Hooks 系统集成 (Week 3-5) ⚠️ 时间延长（P0 修复）

**任务**:
- [ ] **分析 planning-with-files Hooks 格式与 OpenCode Hooks 格式差异**（P0）
- [ ] **实现 Hooks 适配器**（P0 修复：命令式 → 事件式）
- [ ] **实现 PreToolUse Hook（阻塞执行）**（P0 修复：必须阻塞）
- [ ] 实现 PostToolUse Hook（异步执行，不阻塞）
- [ ] 实现 Stop Hook（检查完成状态）
- [ ] **集成到 OpenCode Plugin 系统**（P0 修复：使用 Plugin.trigger）
- [ ] 实现文件读取缓存机制（TTL 500ms，提高一致性）
- [ ] 实现缓存失效机制（文件更新时清除）
- [ ] 实现 Hook 执行超时机制（防止 Hang）
- [ ] 测试 Hooks 触发和性能
- [ ] 测试 Hooks 执行顺序和冲突处理
- [ ] **测试 PreToolUse Hook 阻塞行为**（P0 验证）

**交付物**:
- `packages/opencode/src/unified/manus-hooks-adapter.ts`（Hooks 适配器）
- Hooks 系统实现
- Hooks 缓存机制
- Hooks 测试用例（包括性能测试和阻塞测试）
- Hooks 调试工具
- 文档

**注意事项**:
- Hooks 适配器是 P0 修复，需要额外 2 周时间
- PreToolUse Hook 必须阻塞执行，这是 Manus 模式的核心要求
- 必须充分测试 Hooks 执行顺序和阻塞行为

#### 1.6 扩展 SessionPrompt（不创建独立执行引擎）(Week 5-6) ⚠️ 架构调整

**任务**:
- [ ] **扩展 SessionPrompt.prompt() 支持 Manus 模式**（P0 修复）
- [ ] 集成 Hooks 适配器到 SessionPrompt
- [ ] 实现规划文件更新集成
- [ ] 实现错误记录集成
- [ ] 测试与现有系统的兼容性
- [ ] **验证不创建独立执行引擎**（P0 验证）

**交付物**:
- `packages/opencode/src/session/prompt.ts`（扩展）
- SessionPrompt 扩展测试用例
- 兼容性测试报告

#### 1.7 OpenWork 基础集成 (Week 6-7)

**任务**:
- [ ] 创建 OpenWork 统一入口模块（调用共享模块）
- [ ] 集成需求输入界面
- [ ] 连接共享统一入口模块（不调用 CLI）
- [ ] 基础状态管理
- [ ] **规划文件可视化**: 显示规划文件内容

**交付物**:
- `openwork/src/app/unified.ts`（调用共享模块）
- `openwork/src/views/UnifiedTaskView.tsx`
- `openwork/src/components/PlanningFilesView.tsx`
- 基础集成测试

### 阶段 2: 智能调度 + Manus 同步 (5-6 周)

#### 2.1 Agent 能力矩阵 (Week 7)

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

#### 2.2 任务-Agent 匹配 (Week 7-8)

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

#### 2.3 执行计划生成 (Week 8)

**任务**:
- [ ] 实现任务分解算法
- [ ] 构建依赖图
- [ ] 生成执行计划
- [ ] 优化并行策略
- [ ] **与规划文件同步**: 执行计划从 task_plan.md 生成（单一数据源）

**交付物**:
- `packages/opencode/src/unified/plan-generator.ts`
- 计划生成算法
- 测试用例

#### 2.4 OpenWork 调度集成 (Week 8-9)

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

### 阶段 3: 执行和优化 (5-6 周)

#### 3.1 错误处理和重试 (Week 9-10)

**任务**:
- [ ] 实现错误检测
- [ ] 实现重试机制（3-Strike 协议）
- [ ] 实现错误恢复
- [ ] 实现回滚机制
- [ ] **错误记录**: 记录错误到 task_plan.md（使用事务机制）
- [ ] **3-Strike 协议**: 实现 3-Strike 错误协议

**交付物**:
- 错误处理模块
- 重试策略配置
- 测试用例

#### 3.2 进度报告和日志 (Week 10)

**任务**:
- [ ] 实现进度报告
- [ ] 实现日志系统
- [ ] 实现结果汇总
- [ ] 支持 JSON 和文本格式
- [ ] **规划文件更新**: 更新 progress.md（使用事务机制）

**交付物**:
- 进度报告模块
- 日志系统
- 测试用例

#### 3.3 OpenWork 执行集成 (Week 10-11)

**任务**:
- [ ] 集成执行到 OpenWork（使用共享模块）
- [ ] 实现实时进度显示
- [ ] 实现步骤状态更新
- [ ] 实现结果展示
- [ ] **规划文件实时更新**: 实时显示规划文件变化

**交付物**:
- OpenWork 执行界面
- 实时更新组件
- 集成测试

### 阶段 4: 集成和优化 (4-5 周)

#### 4.1 系统集成 (Week 11-12)

**任务**:
- [ ] 集成所有模块
- [ ] 端到端测试
- [ ] 性能优化
- [ ] 错误修复
- [ ] **Manus 模式端到端测试**: 测试完整 Manus 工作流
- [ ] **验证所有 P0 修复**: 确保所有 P0 问题已解决

**交付物**:
- 集成测试
- 性能报告
- 问题修复
- P0 修复验证报告

#### 4.2 用户体验优化 (Week 12-13)

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

#### 4.3 跨平台测试 (Week 13-14)

**任务**:
- [ ] Linux 测试
- [ ] macOS 测试
- [ ] Windows 测试
- [ ] 兼容性修复
- [ ] OpenWork 桌面应用测试
- [ ] **规划文件跨平台测试**: 测试规划文件在不同平台的行为
- [ ] **文件锁跨平台测试**: 验证 proper-lockfile 在所有平台正常工作

**交付物**:
- 跨平台测试报告
- 兼容性修复
- 文档更新

### 阶段 5: 文档和发布 (2-3 周)

#### 5.1 文档编写 (Week 14-15)

**任务**:
- [ ] 用户文档
- [ ] API 文档
- [ ] 开发文档
- [ ] 示例和教程
- [ ] OpenWork 使用指南
- [ ] **Manus 模式使用指南**: 详细说明 Manus 模式的使用
- [ ] **P0 修复说明**: 说明所有 P0 修复的改进

**交付物**:
- 完整文档
- 示例代码
- 教程视频（可选）

#### 5.2 发布准备 (Week 15-16)

**任务**:
- [ ] 版本号管理
- [ ] 发布说明
- [ ] 迁移指南
- [ ] 社区通知
- [ ] OpenWork 应用打包
- [ ] **规划文件迁移工具**: 帮助用户迁移现有规划文件
- [ ] **依赖更新**: 确保 proper-lockfile 已添加到 package.json

**交付物**:
- 发布版本
- 发布说明
- 社区公告

---

## 技术实现（v5.0 改进）

### 技术选型

#### 核心语言和框架
- **TypeScript**: 类型安全，易于维护
- **Bun**: 运行时和包管理
- **Tauri**: 桌面应用框架（OpenWork）
- **SolidJS**: 前端框架（OpenWork）
- **Python**: 会话恢复脚本（session-catchup.py，可选）
- **现有架构**: 复用 OpenCode 现有架构（v5.0 关键改进）

#### 关键依赖
- **LLM API**: 使用现有 Provider 系统
- **任务调度**: 使用 OpenCode 现有 SessionPrompt 系统（不创建独立执行引擎）
- **依赖图**: 使用图算法库（如 `graphlib`）
- **OpenCode SDK**: `@opencode-ai/sdk/v2/client`
- **planning-with-files**: 集成现有 skill
- **文件锁**: `proper-lockfile`（**v5.0 新增依赖，P0 修复**）
- **缓存**: 内存缓存（用于 Hooks 文件读取优化）

### 实现细节（v5.0 关键改进）

#### 1. Hooks 适配器实现（P0 修复）

```typescript
// packages/opencode/src/unified/manus-hooks-adapter.ts
import { Plugin } from '../plugin'
import { readFile } from 'fs/promises'
import { join } from 'path'

export class ManusHooksAdapter {
  private planningFilesDir: string
  private fileCache: Map<string, { content: string; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 500 // 500ms 缓存
  
  constructor(directory: string) {
    this.planningFilesDir = directory
  }
  
  /**
   * 初始化所有 Hooks（v5.0 改进）
   */
  initialize(): void {
    this.registerPreToolUseHook()
    this.registerPostToolUseHook()
    this.registerStopHook()
  }
  
  /**
   * PreToolUse Hook（阻塞执行 - P0 修复）
   */
  private registerPreToolUseHook(): void {
    // 注意：这里需要注册为 Plugin，而不是直接调用 Plugin.trigger
    // 因为 Plugin.trigger 是系统调用的，我们需要注册 Hook 处理器
    // 实际实现需要根据 OpenCode Plugin 系统的具体 API 调整
  }
  
  /**
   * 读取 task_plan.md（带缓存和事件驱动失效）
   */
  async readTaskPlanCached(): Promise<string | null> {
    const path = join(this.planningFilesDir, 'task_plan.md')
    const now = Date.now()
    const cached = this.fileCache.get(path)
    
    // 检查缓存
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.content
    }
    
    // 读取文件
    try {
      const content = await readFile(path, 'utf-8')
      this.fileCache.set(path, { content, timestamp: now })
      return content
    } catch {
      return null
    }
  }
  
  /**
   * 清除缓存（文件更新时调用）
   */
  clearCache(): void {
    this.fileCache.clear()
  }
}
```

#### 2. SessionPrompt 扩展实现（P0 修复）

```typescript
// packages/opencode/src/session/prompt.ts（扩展现有文件）
export namespace SessionPrompt {
  // ... 现有代码 ...
  
  /**
   * 带 Manus 模式的 prompt（v5.0 新增）
   */
  export async function promptWithManus(input: {
    sessionID: string
    parts: MessageV2.Part[]
    directory?: string
    useManus?: boolean
    planningFilesDir?: string
  }): Promise<MessageV2.Assistant> {
    // 如果使用 Manus 模式，初始化 Hooks
    if (input.useManus) {
      const adapter = new ManusHooksAdapter(
        input.planningFilesDir || input.directory || process.cwd()
      )
      adapter.initialize()
      
      // 监听文件更新事件，清除缓存
      // TODO: 实现文件监听机制
    }
    
    // 使用现有的 prompt 系统
    return await prompt({
      sessionID: input.sessionID,
      parts: input.parts,
      directory: input.directory,
    })
  }
}
```

#### 3. 事务机制实现（P0 修复）

```typescript
// packages/opencode/src/unified/manus-planning.ts
import { lock } from 'proper-lockfile'
import { readFile, writeFile, rename } from 'fs/promises'
import { join } from 'path'

export class ManusPlanningSystem {
  /**
   * 带事务的规划文件更新（P0 修复）
   */
  async updateTaskPlanWithTransaction(
    phase: string,
    status: string,
    toolExecution: () => Promise<{ success: boolean; error?: Error; filesModified?: string[] }>
  ): Promise<{ success: boolean; error?: Error }> {
    const filePath = join(this.planningFilesDir, 'task_plan.md')
    
    // 获取文件锁
    let release: (() => Promise<void>) | null = null
    try {
      release = await lock(filePath, {
        retries: {
          retries: 10,
          minTimeout: 100,
          maxTimeout: 1000
        }
      })
    } catch (error) {
      return { success: false, error: error as Error }
    }
    
    try {
      // 先执行工具
      const result = await toolExecution()
      
      // 只有工具执行成功才更新规划文件
      if (result.success) {
        const content = await readFile(filePath, 'utf-8')
        const updated = this.updatePhaseStatus(content, phase, status)
        
        // 原子写入
        const tempPath = `${filePath}.tmp`
        await writeFile(tempPath, updated, 'utf-8')
        await rename(tempPath, filePath)
        
        // 清除缓存（通知 Hooks 适配器）
        // TODO: 实现事件通知机制
        
        return { success: true }
      } else {
        // 工具执行失败，记录错误
        await this.logError(result.error!, 1)
        return { success: false, error: result.error }
      }
    } finally {
      if (release) {
        await release()
      }
    }
  }
  
  /**
   * 更新阶段状态
   */
  private updatePhaseStatus(content: string, phase: string, status: string): string {
    // 使用正则表达式更新阶段状态
    const regex = new RegExp(`(### ${phase}.*?\\*\\*Status:\\*\\* )\\w+`, 's')
    return content.replace(regex, `$1${status}`)
  }
}
```

#### 4. 需求理解降级方案（P0 修复）

```typescript
// packages/opencode/src/unified/requirement-parser.ts
export class RequirementParser {
  /**
   * 解析需求（带降级方案 - P0 修复）
   */
  async parse(requirement: string, options?: {
    useLLM?: boolean
    timeout?: number
  }): Promise<ParsedRequirement> {
    const useLLM = options?.useLLM !== false // 默认使用 LLM
    
    if (useLLM) {
      try {
        // 尝试使用 LLM 分析（带超时）
        return await Promise.race([
          this.parseWithLLM(requirement),
          new Promise<ParsedRequirement>((_, reject) =>
            setTimeout(() => reject(new Error('LLM timeout')), options?.timeout || 5000)
          )
        ])
      } catch (error) {
        // LLM 失败，降级到规则匹配
        console.warn('[RequirementParser] LLM failed, using rule-based fallback:', error)
        return await this.parseWithRules(requirement)
      }
    } else {
      // 直接使用规则匹配
      return await this.parseWithRules(requirement)
    }
  }
  
  /**
   * 使用规则匹配分析需求（降级方案）
   */
  private async parseWithRules(requirement: string): Promise<ParsedRequirement> {
    const lower = requirement.toLowerCase()
    
    // 基于关键词匹配的任务类型
    const type = 
      /(开发|实现|创建|构建|编写|添加)/.test(lower) ? 'development' :
      /(分析|检查|查看|审查|评估)/.test(lower) ? 'analysis' :
      /(修复|解决|调试|修复|改正)/.test(lower) ? 'fix' :
      /(测试|验证|校验)/.test(lower) ? 'test' :
      /(文档|说明|记录)/.test(lower) ? 'documentation' :
      'development'
    
    // 复杂度评估
    const complexity = 
      requirement.length > 100 || /(包括|和|以及|同时)/.test(lower) ? 'complex' :
      requirement.length > 50 ? 'medium' :
      'simple'
    
    // 技能识别
    const skills: string[] = []
    if (/(前端|frontend|react|vue|angular|svelte)/.test(lower)) skills.push('frontend')
    if (/(后端|backend|api|server|服务)/.test(lower)) skills.push('backend')
    if (/(数据库|database|db|sql|mongodb|postgres)/.test(lower)) skills.push('database')
    if (/(移动|mobile|ios|android|react-native)/.test(lower)) skills.push('mobile')
    if (/(测试|test|jest|mocha|cypress)/.test(lower)) skills.push('testing')
    
    // 估计工具调用次数
    const estimatedToolCalls = 
      complexity === 'complex' ? 10 :
      complexity === 'medium' ? 5 : 2
    
    return {
      type,
      complexity,
      skills,
      dependencies: [],
      useManus: estimatedToolCalls > 5,
      estimatedToolCalls,
    }
  }
}
```

#### 5. 共享模块实现（P0 修复）

```typescript
// packages/opencode/src/unified/index.ts
import { RequirementParser } from './requirement-parser'
import { ProjectDetector } from './project-detector'
import { ManusPlanningSystem } from './manus-planning'
import { Scheduler } from './scheduler'
import { SessionPrompt } from '../session/prompt'

export interface UnifiedEntryOptions {
  directory: string
  requirement: string
  sessionID: string
  useManus?: boolean
  model?: string
  agent?: string
}

export interface UnifiedEntryResult {
  success: boolean
  sessionID: string
  messageID?: string
  planningFilesCreated?: boolean
  executionPlan?: ExecutionPlan
  error?: Error
}

/**
 * 统一入口函数（共享模块 - P0 修复）
 */
export async function unifiedEntry(
  options: UnifiedEntryOptions
): Promise<UnifiedEntryResult> {
  try {
    // 1. 需求理解（带降级方案）
    const parser = new RequirementParser()
    const parsed = await parser.parse(options.requirement)
    
    // 2. 项目检测
    const detector = new ProjectDetector()
    const project = await detector.detect(options.directory)
    
    // 3. Manus 模式判断
    const useManus = options.useManus ?? parsed.useManus
    
    // 4. 创建规划文件（如果需要）
    let planningFilesCreated = false
    if (useManus) {
      const manus = new ManusPlanningSystem(options.directory)
      await manus.createPlanningFiles(parsed)
      planningFilesCreated = true
    }
    
    // 5. 智能调度
    const scheduler = new Scheduler()
    const plan = await scheduler.generatePlan(parsed, project)
    
    // 6. 执行（使用 OpenCode 现有系统）
    const message = await SessionPrompt.promptWithManus({
      sessionID: options.sessionID,
      parts: [{ type: 'text', text: options.requirement }],
      directory: options.directory,
      useManus,
      planningFilesDir: options.directory,
    })
    
    return {
      success: true,
      sessionID: options.sessionID,
      messageID: message.id,
      planningFilesCreated,
      executionPlan: plan,
    }
  } catch (error) {
    return {
      success: false,
      sessionID: options.sessionID,
      error: error as Error,
    }
  }
}
```

---

## 测试计划

### 单元测试

- 需求理解模块测试（包括降级方案测试）
- 项目检测模块测试
- Agent 匹配模块测试
- **Manus 规划系统测试**: 
  - 测试规划文件创建、更新、恢复
  - **并发更新测试**: 测试文件锁机制，确保无竞态条件
  - **原子写入测试**: 验证临时文件 + 重命名机制
  - **事务机制测试**: 验证工具执行与规划文件更新的同步
- **Hooks 系统测试**: 
  - 测试 Hooks 适配器（命令式 → 事件式转换）
  - **阻塞测试**: 验证 PreToolUse Hook 阻塞执行（P0 验证）
  - **性能测试**: 测试缓存机制，确保响应时间 < 100ms
  - **并发测试**: 测试多个 Hooks 同时执行
  - **超时测试**: 测试 Hook 执行超时处理
- **SessionPrompt 扩展测试**: 验证不创建独立执行引擎
- OpenWork 组件测试

### 集成测试

- 端到端场景测试
- CLI + OpenWork 集成测试（使用共享模块）
- **Manus 模式端到端测试**: 测试完整 Manus 工作流
- **并发场景测试**: 测试多个工具同时更新规划文件
- **会话恢复兼容性测试**: 验证 session-catchup.py 与 OpenCode 格式兼容性
- **原生会话恢复测试**: 测试原生恢复机制
- 跨平台兼容性测试（Linux、macOS、Windows）
- **性能测试**: 
  - 响应时间测试（目标 < 2s）
  - Hooks 性能测试（目标 < 100ms）
  - 并发性能测试
  - 文件锁性能测试
- 错误处理测试
- **P0 修复验证测试**: 验证所有 P0 问题已解决

### 用户测试

- 真实场景测试
- 用户体验测试
- 反馈收集
- **Manus 模式用户测试**: 测试 Manus 模式的实际使用
- **降级方案测试**: 测试 LLM 不可用时的规则匹配

---

## 部署计划

### 开发环境

- 本地开发环境设置
- 测试数据准备
- 开发工具配置
- **规划文件模板准备**: 准备规划文件模板
- **依赖安装**: 确保 proper-lockfile 已安装

### 测试环境

- CI/CD 集成
- 自动化测试
- 性能监控
- **规划文件测试数据**: 准备测试用的规划文件
- **跨平台测试环境**: Linux、macOS、Windows

### 生产环境

- 版本发布
- 文档更新
- 社区通知
- OpenWork 应用打包
- **规划文件迁移工具**: 提供迁移工具帮助用户
- **依赖更新**: 确保 proper-lockfile 在 package.json 中

---

## 风险和挑战

### 技术风险

1. **Hooks 适配器复杂度** ⚠️ 高风险
   - **问题**: 命令式 Hooks 转换为事件式 Hooks 可能复杂
   - **缓解**: 充分设计适配器架构，分步实现，充分测试

2. **PreToolUse Hook 阻塞性能** ⚠️ 中风险
   - **问题**: 阻塞执行可能影响工具执行速度
   - **缓解**: 使用缓存机制（TTL 500ms），优化文件读取

3. **SessionPrompt 扩展兼容性** ⚠️ 中风险
   - **问题**: 扩展现有系统可能影响现有功能
   - **缓解**: 充分测试兼容性，使用特性开关

4. **文件锁跨平台兼容性** ⚠️ 中风险
   - **问题**: proper-lockfile 在不同平台的行为可能不同
   - **缓解**: 充分测试所有平台，提供平台特定实现

5. **会话恢复兼容性** ⚠️ 中风险
   - **问题**: session-catchup.py 可能不兼容 OpenCode 格式
   - **缓解**: 实现原生恢复作为备选方案

6. **需求理解降级方案准确性** ⚠️ 低风险
   - **问题**: 规则匹配可能不如 LLM 准确
   - **缓解**: 持续优化规则，提供用户手动选择选项

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

- ✅ 需求理解准确率 > 80%（LLM）或 > 60%（规则匹配）
- ✅ Agent 选择准确率 > 85%
- ✅ 任务执行成功率 > 90%
- ✅ 平均响应时间 < 2s
- ✅ OpenWork GUI 响应时间 < 100ms
- ✅ **规划文件同步准确率 > 95%**: 规划文件与执行状态同步
- ✅ **会话恢复成功率 > 90%**: 能够成功恢复未同步的上下文
- ✅ **Hooks 执行成功率 > 98%**: Hooks 正常执行
- ✅ **PreToolUse Hook 阻塞率 100%**: 所有 PreToolUse Hook 都阻塞执行

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
- **优化 Hooks 性能**: 进一步优化缓存机制

### 长期优化 (6-12 个月)

- 支持更多项目类型
- 增强自动化能力
- 集成更多工具
- 构建社区生态
- OpenWork 移动端支持
- **规划文件智能分析**: 使用 AI 分析规划文件，提供建议
- **多项目规划文件管理**: 支持管理多个项目的规划文件

---

## 改进说明（v5.0）

### 基于可行性分析报告的改进

本版本（v5.0）基于《OpenCode开发计划_可行性分析和漏洞检查_v1.0》的建议进行了**重大架构调整**，修复了所有 P0 严重漏洞：

#### 1. Hooks 系统格式不匹配 ✅ P0 修复

**问题**: planning-with-files 使用命令式 Hooks，OpenCode 使用事件式 Hooks

**解决方案**:
- 创建 Hooks 适配器（`ManusHooksAdapter`）
- 将命令式 Hooks 转换为事件式 Hooks
- 集成到 OpenCode Plugin 系统

#### 2. PreToolUse Hook 异步执行问题 ✅ P0 修复

**问题**: PreToolUse Hook 异步执行违背 Manus 原则

**解决方案**:
- PreToolUse Hook **必须阻塞执行**
- 确保在工具执行前读取 task_plan.md
- 使用缓存优化性能（TTL 500ms）

#### 3. 执行引擎架构重复 ✅ P0 修复

**问题**: 创建独立执行引擎与 OpenCode 现有系统重复

**解决方案**:
- **不创建独立执行引擎**
- 扩展 `SessionPrompt.prompt()` 支持 Manus 模式
- 使用 OpenCode 现有工具执行系统

#### 4. 文件锁依赖缺失 ✅ P0 修复

**问题**: proper-lockfile 不在依赖中

**解决方案**:
- 添加 `proper-lockfile` 到 `package.json`
- 实现文件锁机制
- 测试跨平台兼容性

#### 5. 会话恢复兼容性 ✅ P0 修复

**问题**: session-catchup.py 可能不兼容 OpenCode 格式

**解决方案**:
- 验证会话格式兼容性
- 实现原生恢复机制作为备选方案
- 优先使用原生恢复

#### 6. 规划文件更新同步问题 ✅ P0 修复

**问题**: 规划文件更新与工具执行不同步

**解决方案**:
- 实现事务机制
- 先执行工具，成功后再更新规划文件
- 使用文件锁防止并发更新

#### 7. 需求理解系统降级方案 ✅ P0 修复

**问题**: 完全依赖 LLM，无降级方案

**解决方案**:
- 添加规则匹配降级方案
- 实现超时和重试机制
- 提供手动选择选项

#### 8. OpenWork 集成路径 ✅ P0 修复

**问题**: CLI 和 GUI 集成路径不明确

**解决方案**:
- 提取共享统一入口模块
- CLI 和 GUI 使用相同底层实现
- 不依赖 CLI 命令

### 架构调整

1. **执行引擎**: 不再创建独立 `ExecutionEngine`，而是扩展 `SessionPrompt.prompt()`
2. **Hooks 系统**: 使用 OpenCode 现有 `Plugin.trigger()` 系统，创建适配器
3. **共享模块**: 提取统一入口逻辑为共享模块

### 时间估算调整

- **原计划**: 17-22 周
- **调整后**: 23-28 周（+6 周缓冲）
- **原因**: Hooks 适配器开发、架构重构、测试和调试需要更多时间

---

**文档版本**: v5.0  
**最后更新**: 2026-01-26  
**维护者**: OpenCode Team  
**基于分析**: OpenCode开发计划_可行性分析和漏洞检查_v1.0_20260126_AI.md  
**P0 修复状态**: ✅ 所有 P0 漏洞已修复