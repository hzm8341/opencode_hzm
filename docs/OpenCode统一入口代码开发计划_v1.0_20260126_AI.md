# OpenCode 统一入口代码开发计划

**版本**: v1.0  
**日期**: 2026-01-26  
**作者**: AI Assistant (Claude-4)  
**基于**: OpenCode开发计划_统一入口和智能调度_v5.0_20260126_AI.md  
**目标**: 将 v5.0 开发计划转化为可执行的代码开发任务，包含详细的实现步骤、文件结构、测试要求

---

## 目录

- [项目概述](#项目概述)
- [开发环境准备](#开发环境准备)
- [阶段 1: 基础架构 + Manus 集成](#阶段-1-基础架构--manus-集成)
- [阶段 2: 智能调度 + Manus 同步](#阶段-2-智能调度--manus-同步)
- [阶段 3: 执行和优化](#阶段-3-执行和优化)
- [阶段 4: 集成和优化](#阶段-4-集成和优化)
- [阶段 5: 文档和发布](#阶段-5-文档和发布)
- [代码规范](#代码规范)
- [测试要求](#测试要求)
- [依赖管理](#依赖管理)

---

## 项目概述

### 核心目标

1. **统一入口模块**: 创建共享的统一入口模块，CLI 和 OpenWork 共用
2. **Manus 模式集成**: 集成 planning-with-files skill，实现三文件规划系统
3. **Hooks 适配器**: 将命令式 Hooks 转换为 OpenCode 事件式 Hooks
4. **SessionPrompt 扩展**: 扩展现有 SessionPrompt 支持 Manus 模式
5. **智能调度系统**: 实现 Agent 选择、任务分解、执行计划生成

### 技术栈

- **语言**: TypeScript
- **运行时**: Bun
- **文件锁**: proper-lockfile
- **图算法**: graphlib（可选）
- **现有系统**: OpenCode SessionPrompt、Plugin 系统

---

## 开发环境准备

### 1. 依赖安装

```bash
cd packages/opencode
bun add proper-lockfile
bun add -d @types/proper-lockfile
```

### 2. 目录结构创建

```bash
mkdir -p packages/opencode/src/unified
mkdir -p packages/opencode/src/cli/cmd/unified
mkdir -p openwork/src/app/unified
mkdir -p openwork/src/views/unified
mkdir -p openwork/src/components/unified
```

### 3. 测试目录

```bash
mkdir -p packages/opencode/src/unified/__tests__
```

---

## 阶段 1: 基础架构 + Manus 集成 (7-8 周)

### 1.1 统一入口命令 (Week 1)

#### 任务清单

- [ ] 创建共享统一入口模块
- [ ] 创建 CLI unified 命令
- [ ] 实现参数解析
- [ ] 实现工作目录支持
- [ ] 实现交互式输入
- [ ] 实现 Manus 模式检测

#### 文件结构

```
packages/opencode/src/unified/
├── index.ts                    # 共享统一入口模块（主入口）
├── types.ts                    # 类型定义
└── __tests__/
    └── index.test.ts          # 单元测试
```

#### 实现步骤

**步骤 1.1.1: 创建类型定义文件**

**文件**: `packages/opencode/src/unified/types.ts`

```typescript
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

export interface ParsedRequirement {
  type: 'development' | 'analysis' | 'fix' | 'test' | 'documentation'
  complexity: 'simple' | 'medium' | 'complex'
  skills: string[]
  dependencies: string[]
  useManus: boolean
  estimatedToolCalls: number
}

export interface ProjectInfo {
  type: string
  techStack: string[]
  dependencies: string[]
  hasPlanningFiles: boolean
}

export interface ExecutionPlan {
  tasks: Task[]
  dependencies: DependencyGraph
  parallelStrategy: ParallelStrategy
}

export interface Task {
  id: string
  agent: string
  description: string
  phase?: string
}
```

**步骤 1.1.2: 创建共享统一入口模块**

**文件**: `packages/opencode/src/unified/index.ts`

```typescript
import { RequirementParser } from './requirement-parser'
import { ProjectDetector } from './project-detector'
import { ManusPlanningSystem } from './manus-planning'
import { Scheduler } from './scheduler'
import { SessionPrompt } from '../session/prompt'
import type { UnifiedEntryOptions, UnifiedEntryResult } from './types'

/**
 * 统一入口函数（共享模块）
 * CLI 和 OpenWork 共用此实现
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

**步骤 1.1.3: 创建 CLI 命令**

**文件**: `packages/opencode/src/cli/cmd/unified.ts`

```typescript
import { unifiedEntry } from '../../unified'
import { Session } from '../../session'
import { Identifier } from '../../id/id'
import type { UnifiedEntryOptions } from '../../unified/types'

export async function unifiedCommand(options: {
  dir: string
  requirement: string
  model?: string
  agent?: string
  useManus?: boolean
}) {
  // 创建会话
  const sessionID = Identifier.ascending('session')
  await Session.create(sessionID)
  
  // 调用共享模块
  const result = await unifiedEntry({
    directory: options.dir,
    requirement: options.requirement,
    sessionID,
    model: options.model,
    agent: options.agent,
    useManus: options.useManus,
  })
  
  if (!result.success) {
    console.error('Error:', result.error?.message)
    process.exit(1)
  }
  
  console.log('Success!')
  console.log('Session ID:', result.sessionID)
  if (result.planningFilesCreated) {
    console.log('Planning files created')
  }
  
  return result
}
```

**步骤 1.1.4: 注册 CLI 命令**

**文件**: `packages/opencode/src/cli/cmd/cmd.ts`（修改现有文件）

```typescript
// 在现有命令列表中添加
import { unifiedCommand } from './unified'

// 在 yargs 配置中添加
.command('unified', '统一入口命令', (yargs) => {
  return yargs
    .option('dir', {
      alias: 'd',
      type: 'string',
      demandOption: true,
      describe: '工作目录',
    })
    .option('requirement', {
      alias: 'r',
      type: 'string',
      demandOption: true,
      describe: '需求描述',
    })
    .option('model', {
      type: 'string',
      describe: '指定模型',
    })
    .option('agent', {
      type: 'string',
      describe: '指定 Agent',
    })
    .option('useManus', {
      type: 'boolean',
      describe: '强制使用 Manus 模式',
    })
}, async (argv) => {
  await unifiedCommand({
    dir: argv.dir,
    requirement: argv.requirement,
    model: argv.model,
    agent: argv.agent,
    useManus: argv.useManus,
  })
})
```

#### 测试要求

**文件**: `packages/opencode/src/unified/__tests__/index.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'bun:test'
import { unifiedEntry } from '../index'
import { Session } from '../../session'
import { Identifier } from '../../id/id'

describe('unifiedEntry', () => {
  let sessionID: string
  
  beforeEach(async () => {
    sessionID = Identifier.ascending('session')
    await Session.create(sessionID)
  })
  
  it('should parse simple requirement', async () => {
    const result = await unifiedEntry({
      directory: '/tmp/test',
      requirement: '帮我运行这个项目',
      sessionID,
    })
    
    expect(result.success).toBe(true)
  })
  
  it('should detect Manus mode for complex requirement', async () => {
    const result = await unifiedEntry({
      directory: '/tmp/test',
      requirement: '实现一个用户登录功能，包括前端和后端，数据库设计，API 接口，单元测试',
      sessionID,
    })
    
    expect(result.success).toBe(true)
    expect(result.planningFilesCreated).toBe(true)
  })
})
```

---

### 1.2 需求理解系统 (Week 1-2)

#### 任务清单

- [ ] 实现需求分类器（LLM）
- [ ] 实现规则匹配降级方案（P0 修复）
- [ ] 实现信息提取器
- [ ] 实现复杂度评估
- [ ] 构建需求模板库
- [ ] 实现 Manus 模式判断

#### 文件结构

```
packages/opencode/src/unified/
├── requirement-parser.ts       # 需求解析器
└── __tests__/
    └── requirement-parser.test.ts
```

#### 实现步骤

**步骤 1.2.1: 创建需求解析器**

**文件**: `packages/opencode/src/unified/requirement-parser.ts`

```typescript
import { Provider } from '../provider/provider'
import type { ParsedRequirement } from './types'

export class RequirementParser {
  /**
   * 解析需求（带降级方案 - P0 修复）
   */
  async parse(
    requirement: string,
    options?: {
      useLLM?: boolean
      timeout?: number
    }
  ): Promise<ParsedRequirement> {
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
   * 使用 LLM 分析需求
   */
  private async parseWithLLM(requirement: string): Promise<ParsedRequirement> {
    const model = await Provider.defaultModel()
    const provider = await Provider.getProvider(model.providerID)
    
    // 使用 LLM 分析需求
    // TODO: 实现 LLM 分析逻辑
    // 这里需要调用 LLM API，返回结构化的 ParsedRequirement
    
    // 临时实现：降级到规则匹配
    return await this.parseWithRules(requirement)
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

#### 测试要求

**文件**: `packages/opencode/src/unified/__tests__/requirement-parser.test.ts`

```typescript
import { describe, it, expect } from 'bun:test'
import { RequirementParser } from '../requirement-parser'

describe('RequirementParser', () => {
  const parser = new RequirementParser()
  
  it('should parse simple requirement', async () => {
    const result = await parser.parse('帮我运行这个项目')
    expect(result.type).toBe('development')
    expect(result.complexity).toBe('simple')
    expect(result.useManus).toBe(false)
  })
  
  it('should parse complex requirement', async () => {
    const result = await parser.parse('实现一个用户登录功能，包括前端和后端，数据库设计，API 接口，单元测试')
    expect(result.complexity).toBe('complex')
    expect(result.useManus).toBe(true)
    expect(result.skills).toContain('frontend')
    expect(result.skills).toContain('backend')
  })
  
  it('should fallback to rules when LLM fails', async () => {
    const result = await parser.parse('测试需求', { useLLM: false })
    expect(result.type).toBe('test')
  })
})
```

---

### 1.3 项目检测系统 (Week 2)

#### 任务清单

- [ ] 实现项目类型检测
- [ ] 实现技术栈识别
- [ ] 实现依赖分析
- [ ] 支持常见项目类型
- [ ] 实现规划文件检测

#### 文件结构

```
packages/opencode/src/unified/
├── project-detector.ts         # 项目检测器
└── __tests__/
    └── project-detector.test.ts
```

#### 实现步骤

**步骤 1.3.1: 创建项目检测器**

**文件**: `packages/opencode/src/unified/project-detector.ts`

```typescript
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import type { ProjectInfo } from './types'

export class ProjectDetector {
  /**
   * 检测项目信息
   */
  async detect(directory: string): Promise<ProjectInfo> {
    const [type, techStack, dependencies, hasPlanningFiles] = await Promise.all([
      this.detectProjectType(directory),
      this.detectTechStack(directory),
      this.detectDependencies(directory),
      this.hasPlanningFiles(directory),
    ])
    
    return {
      type,
      techStack,
      dependencies,
      hasPlanningFiles,
    }
  }
  
  /**
   * 检测项目类型
   */
  private async detectProjectType(directory: string): Promise<string> {
    const files = await this.listFiles(directory)
    
    if (files.includes('package.json')) return 'node'
    if (files.includes('requirements.txt') || files.includes('pyproject.toml')) return 'python'
    if (files.includes('Cargo.toml')) return 'rust'
    if (files.includes('go.mod')) return 'go'
    if (files.includes('pom.xml') || files.includes('build.gradle')) return 'java'
    if (files.includes('composer.json')) return 'php'
    if (files.includes('Gemfile')) return 'ruby'
    
    return 'unknown'
  }
  
  /**
   * 检测技术栈
   */
  private async detectTechStack(directory: string): Promise<string[]> {
    const stack: string[] = []
    const files = await this.listFiles(directory)
    
    // 前端框架
    if (files.includes('package.json')) {
      try {
        const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf-8'))
        const deps = { ...pkg.dependencies, ...pkg.devDependencies }
        if (deps.react) stack.push('react')
        if (deps.vue) stack.push('vue')
        if (deps.angular) stack.push('angular')
        if (deps.svelte) stack.push('svelte')
        if (deps.next) stack.push('next')
        if (deps['@remix-run/node']) stack.push('remix')
      } catch {}
    }
    
    // 后端框架
    if (files.includes('package.json')) {
      try {
        const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf-8'))
        const deps = { ...pkg.dependencies, ...pkg.devDependencies }
        if (deps.express) stack.push('express')
        if (deps.koa) stack.push('koa')
        if (deps.fastify) stack.push('fastify')
        if (deps.nestjs) stack.push('nestjs')
      } catch {}
    }
    
    return stack
  }
  
  /**
   * 检测依赖
   */
  private async detectDependencies(directory: string): Promise<string[]> {
    const deps: string[] = []
    const files = await this.listFiles(directory)
    
    if (files.includes('package.json')) {
      try {
        const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf-8'))
        deps.push(...Object.keys(pkg.dependencies || {}))
        deps.push(...Object.keys(pkg.devDependencies || {}))
      } catch {}
    }
    
    return deps
  }
  
  /**
   * 检查是否有规划文件
   */
  private async hasPlanningFiles(directory: string): Promise<boolean> {
    const files = await this.listFiles(directory)
    return files.includes('task_plan.md') || 
           files.includes('findings.md') || 
           files.includes('progress.md')
  }
  
  /**
   * 列出目录文件
   */
  private async listFiles(directory: string): Promise<string[]> {
    try {
      const files = await import('fs/promises').then(m => m.readdir(directory))
      return files
    } catch {
      return []
    }
  }
}
```

#### 测试要求

**文件**: `packages/opencode/src/unified/__tests__/project-detector.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'bun:test'
import { ProjectDetector } from '../project-detector'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { rm } from 'fs/promises'

describe('ProjectDetector', () => {
  let testDir: string
  const detector = new ProjectDetector()
  
  beforeEach(async () => {
    testDir = join(tmpdir(), `opencode-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
  })
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })
  
  it('should detect Node.js project', async () => {
    await writeFile(join(testDir, 'package.json'), JSON.stringify({
      name: 'test',
      dependencies: { express: '^4.0.0' }
    }))
    
    const result = await detector.detect(testDir)
    expect(result.type).toBe('node')
    expect(result.techStack).toContain('express')
  })
  
  it('should detect planning files', async () => {
    await writeFile(join(testDir, 'task_plan.md'), '# Task Plan')
    
    const result = await detector.detect(testDir)
    expect(result.hasPlanningFiles).toBe(true)
  })
})
```

---

### 1.4 Manus 文件规划系统 (Week 2-3)

#### 任务清单

- [ ] 集成 planning-with-files skill
- [ ] 实现规划文件创建
- [ ] 实现规划文件模板系统
- [ ] 添加 proper-lockfile 依赖（P0 修复）
- [ ] 实现规划文件更新接口（使用文件锁）
- [ ] 实现原子写入机制
- [ ] 验证会话恢复脚本兼容性（P0 修复）
- [ ] 实现原生会话恢复机制
- [ ] 实现错误记录系统
- [ ] 实现事务机制（P0 修复）

#### 文件结构

```
packages/opencode/src/unified/
├── manus-planning.ts           # Manus 规划系统
├── templates/
│   ├── task_plan.md.template   # 任务规划模板
│   ├── findings.md.template    # 研究发现模板
│   └── progress.md.template    # 进度日志模板
└── __tests__/
    └── manus-planning.test.ts
```

#### 实现步骤

**步骤 1.4.1: 添加依赖**

**文件**: `packages/opencode/package.json`（修改）

```json
{
  "dependencies": {
    "proper-lockfile": "^4.0.2"
  },
  "devDependencies": {
    "@types/proper-lockfile": "^4.0.0"
  }
}
```

**步骤 1.4.2: 创建 Manus 规划系统**

**文件**: `packages/opencode/src/unified/manus-planning.ts`

```typescript
import { lock } from 'proper-lockfile'
import { readFile, writeFile, rename, mkdir } from 'fs/promises'
import { join } from 'path'
import type { ParsedRequirement } from './types'

export class ManusPlanningSystem {
  private planningFilesDir: string
  
  constructor(directory: string) {
    this.planningFilesDir = directory
  }
  
  /**
   * 创建规划文件
   */
  async createPlanningFiles(requirement: ParsedRequirement): Promise<void> {
    await mkdir(this.planningFilesDir, { recursive: true })
    
    const [taskPlan, findings, progress] = await Promise.all([
      this.createTaskPlan(requirement),
      this.createFindings(),
      this.createProgress(),
    ])
    
    await Promise.all([
      writeFile(join(this.planningFilesDir, 'task_plan.md'), taskPlan, 'utf-8'),
      writeFile(join(this.planningFilesDir, 'findings.md'), findings, 'utf-8'),
      writeFile(join(this.planningFilesDir, 'progress.md'), progress, 'utf-8'),
    ])
  }
  
  /**
   * 创建任务规划文件
   */
  private async createTaskPlan(requirement: ParsedRequirement): Promise<string> {
    const template = `# Task Plan

## Goal
${requirement.type === 'development' ? '开发' : requirement.type === 'analysis' ? '分析' : '修复'}任务

## Requirements
${requirement.skills.join(', ')}

## Phases

### Phase 1: 需求分析
**Status:** pending
**Description:** 分析需求，确定技术方案

### Phase 2: 实现
**Status:** pending
**Description:** 实现核心功能

### Phase 3: 测试
**Status:** pending
**Description:** 编写测试用例

## Decisions
(待记录)

## Errors
(待记录)
`
    return template
  }
  
  /**
   * 创建研究发现文件
   */
  private async createFindings(): Promise<string> {
    return `# Findings

## Research
(待记录)

## Technical Decisions
(待记录)

## Resources
(待记录)
`
  }
  
  /**
   * 创建进度日志文件
   */
  private async createProgress(): Promise<string> {
    return `# Progress

## Session Log
(待记录)

## Test Results
(待记录)
`
  }
  
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
    const regex = new RegExp(`(### ${phase}.*?\\*\\*Status:\\*\\* )\\w+`, 's')
    return content.replace(regex, `$1${status}`)
  }
  
  /**
   * 记录错误
   */
  private async logError(error: Error, attempt: number): Promise<void> {
    const filePath = join(this.planningFilesDir, 'task_plan.md')
    const content = await readFile(filePath, 'utf-8')
    const errorLog = `\n## Errors\n\n### Attempt ${attempt}\n${error.message}\n`
    await writeFile(filePath, content + errorLog, 'utf-8')
  }
}
```

#### 测试要求

**文件**: `packages/opencode/src/unified/__tests__/manus-planning.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { ManusPlanningSystem } from '../manus-planning'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { rm } from 'fs/promises'

describe('ManusPlanningSystem', () => {
  let testDir: string
  let system: ManusPlanningSystem
  
  beforeEach(async () => {
    testDir = join(tmpdir(), `opencode-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
    system = new ManusPlanningSystem(testDir)
  })
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })
  
  it('should create planning files', async () => {
    await system.createPlanningFiles({
      type: 'development',
      complexity: 'medium',
      skills: ['frontend', 'backend'],
      dependencies: [],
      useManus: true,
      estimatedToolCalls: 5,
    })
    
    // 验证文件已创建
    const files = await import('fs/promises').then(m => m.readdir(testDir))
    expect(files).toContain('task_plan.md')
    expect(files).toContain('findings.md')
    expect(files).toContain('progress.md')
  })
  
  it('should update task plan with transaction', async () => {
    await system.createPlanningFiles({
      type: 'development',
      complexity: 'medium',
      skills: [],
      dependencies: [],
      useManus: true,
      estimatedToolCalls: 5,
    })
    
    const result = await system.updateTaskPlanWithTransaction(
      'Phase 1: 需求分析',
      'in_progress',
      async () => ({ success: true })
    )
    
    expect(result.success).toBe(true)
  })
})
```

---

### 1.5 Hooks 系统集成 (Week 3-5) ⚠️ P0 修复

#### 任务清单

- [ ] 分析 planning-with-files Hooks 格式差异（P0）
- [ ] 实现 Hooks 适配器（P0 修复）
- [ ] 实现 PreToolUse Hook（阻塞执行）（P0 修复）
- [ ] 实现 PostToolUse Hook（异步执行）
- [ ] 实现 Stop Hook
- [ ] 集成到 OpenCode Plugin 系统
- [ ] 实现文件读取缓存机制（TTL 500ms）
- [ ] 实现缓存失效机制
- [ ] 实现 Hook 执行超时机制
- [ ] 测试 Hooks 触发和性能
- [ ] 测试 Hooks 执行顺序和冲突处理
- [ ] 测试 PreToolUse Hook 阻塞行为（P0 验证）

#### 文件结构

```
packages/opencode/src/unified/
├── manus-hooks-adapter.ts        # Hooks 适配器（P0 修复）
└── __tests__/
    └── manus-hooks-adapter.test.ts
```

#### 实现步骤

**步骤 1.5.1: 创建 Hooks 适配器**

**文件**: `packages/opencode/src/unified/manus-hooks-adapter.ts`

```typescript
import { Plugin } from '../plugin'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { Log } from '../util/log'

export class ManusHooksAdapter {
  private planningFilesDir: string
  private fileCache: Map<string, { content: string; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 500 // 500ms 缓存
  private readonly HOOK_TIMEOUT = 2000 // 2秒超时
  private log = Log.create({ service: 'manus-hooks' })
  
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
   * 注意：OpenCode Plugin 系统使用事件式 Hooks，我们需要创建一个 Plugin 实例
   */
  private registerPreToolUseHook(): void {
    // 创建一个临时 Plugin 实例来注册 Hook
    // 注意：这需要根据 OpenCode Plugin API 调整
    // 实际实现可能需要通过 Plugin.register() 或其他方式
    
    // 由于 OpenCode Plugin 系统是动态加载的，我们需要：
    // 1. 创建一个 Plugin 函数
    // 2. 在 Plugin 函数中注册 Hook
    // 3. 通过某种机制注入到 Plugin 系统
    
    // TODO: 实现 Plugin 注册机制
    // 临时方案：直接监听 tool.execute.before 事件
    this.log.info('PreToolUse Hook registered (blocking)')
  }
  
  /**
   * PostToolUse Hook（异步执行，不阻塞）
   */
  private registerPostToolUseHook(): void {
    // TODO: 实现 PostToolUse Hook
    this.log.info('PostToolUse Hook registered (async)')
  }
  
  /**
   * Stop Hook（检查完成状态）
   */
  private registerStopHook(): void {
    // TODO: 实现 Stop Hook
    this.log.info('Stop Hook registered')
  }
  
  /**
   * 读取 task_plan.md（带缓存和超时 - P0 修复）
   * 这是 PreToolUse Hook 的核心功能，必须阻塞执行
   */
  async readTaskPlanCached(): Promise<string | null> {
    const path = join(this.planningFilesDir, 'task_plan.md')
    const now = Date.now()
    const cached = this.fileCache.get(path)
    
    // 检查缓存
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.content
    }
    
    // 读取文件（带超时）
    try {
      const content = await Promise.race([
        readFile(path, 'utf-8'),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Read timeout')), this.HOOK_TIMEOUT)
        )
      ])
      
      this.fileCache.set(path, { content, timestamp: now })
      return content
    } catch (error) {
      this.log.warn('Failed to read task_plan.md', { error })
      return null
    }
  }
  
  /**
   * 清除缓存（文件更新时调用）
   */
  clearCache(): void {
    this.fileCache.clear()
    this.log.debug('Cache cleared')
  }
  
  /**
   * 获取 task_plan.md 前 30 行（PreToolUse Hook 使用）
   */
  async getTaskPlanPreview(): Promise<string> {
    const content = await this.readTaskPlanCached()
    if (!content) return ''
    
    const lines = content.split('\n').slice(0, 30).join('\n')
    return lines
  }
}
```

**步骤 1.5.2: 集成到 Plugin 系统**

由于 OpenCode Plugin 系统是动态加载的，我们需要创建一个 Plugin 函数：

**文件**: `packages/opencode/src/unified/manus-plugin.ts`

```typescript
import type { PluginInput, Hooks } from '@opencode-ai/plugin'
import { ManusHooksAdapter } from './manus-hooks-adapter'

let adapter: ManusHooksAdapter | null = null

/**
 * Manus 模式 Plugin
 * 将命令式 Hooks 转换为事件式 Hooks
 */
export default async function manusPlugin(input: PluginInput): Promise<Hooks> {
  // 从环境变量或配置获取规划文件目录
  const planningDir = input.directory || process.cwd()
  adapter = new ManusHooksAdapter(planningDir)
  
  return {
    // 注册 tool.execute.before Hook（阻塞执行）
    async "tool.execute.before"(input, output) {
      const { tool } = input
      
      // 只处理特定工具（匹配 planning-with-files 的 matcher）
      if (!/Write|Edit|Bash|Read|Glob|Grep/.test(tool)) {
        return
      }
      
      // 阻塞执行：读取 task_plan.md 前 30 行
      const preview = await adapter!.getTaskPlanPreview()
      
      if (preview) {
        // 将内容注入到系统消息或上下文中
        // 注意：这里需要与 OpenCode 的消息系统集成
        // 可以通过修改 output.args 或使用其他机制
        console.log('[Manus] PreToolUse: Refreshed task plan context')
        // TODO: 将 preview 注入到 LLM 上下文
      }
    },
    
    // 注册 tool.execute.after Hook（异步执行）
    async "tool.execute.after"(input, output) {
      const { tool } = input
      
      // 只处理 Write/Edit 工具
      if (!/Write|Edit/.test(tool)) {
        return
      }
      
      // 异步提醒更新状态（不阻塞）
      setImmediate(() => {
        console.log('[Manus] PostToolUse: File updated. If this completes a phase, update task_plan.md status.')
      })
    },
  }
}
```

#### 测试要求

**文件**: `packages/opencode/src/unified/__tests__/manus-hooks-adapter.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { ManusHooksAdapter } from '../manus-hooks-adapter'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { rm } from 'fs/promises'

describe('ManusHooksAdapter', () => {
  let testDir: string
  let adapter: ManusHooksAdapter
  
  beforeEach(async () => {
    testDir = join(tmpdir(), `opencode-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
    adapter = new ManusHooksAdapter(testDir)
  })
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })
  
  it('should read task_plan.md with cache', async () => {
    await writeFile(join(testDir, 'task_plan.md'), '# Task Plan\n\n## Goal\nTest')
    
    const content1 = await adapter.readTaskPlanCached()
    const content2 = await adapter.readTaskPlanCached() // 应该使用缓存
    
    expect(content1).toBe(content2)
    expect(content1).toContain('Task Plan')
  })
  
  it('should clear cache', async () => {
    await writeFile(join(testDir, 'task_plan.md'), '# Task Plan')
    
    await adapter.readTaskPlanCached()
    adapter.clearCache()
    
    // 缓存已清除，应该重新读取
    const content = await adapter.readTaskPlanCached()
    expect(content).toContain('Task Plan')
  })
  
  it('should get task plan preview (first 30 lines)', async () => {
    const lines = Array.from({ length: 50 }, (_, i) => `Line ${i + 1}`).join('\n')
    await writeFile(join(testDir, 'task_plan.md'), lines)
    
    const preview = await adapter.getTaskPlanPreview()
    const previewLines = preview.split('\n')
    
    expect(previewLines.length).toBeLessThanOrEqual(30)
  })
  
  it('should handle timeout when reading file', async () => {
    // 模拟慢速文件读取
    // TODO: 实现超时测试
  })
})
```

---

### 1.6 扩展 SessionPrompt（不创建独立执行引擎）(Week 5-6) ⚠️ 架构调整

#### 任务清单

- [ ] 扩展 SessionPrompt.prompt() 支持 Manus 模式（P0 修复）
- [ ] 集成 Hooks 适配器到 SessionPrompt
- [ ] 实现规划文件更新集成
- [ ] 实现错误记录集成
- [ ] 测试与现有系统的兼容性
- [ ] 验证不创建独立执行引擎（P0 验证）

#### 文件结构

```
packages/opencode/src/session/
├── prompt.ts                     # 扩展现有文件
└── __tests__/
    └── prompt-manus.test.ts      # Manus 模式测试
```

#### 实现步骤

**步骤 1.6.1: 扩展 SessionPrompt**

**文件**: `packages/opencode/src/session/prompt.ts`（修改现有文件）

在现有 `SessionPrompt` 命名空间中添加新函数：

```typescript
// 在文件末尾添加
export namespace SessionPrompt {
  // ... 现有代码 ...
  
  /**
   * 带 Manus 模式的 prompt（v5.0 新增）
   * 不创建独立执行引擎，而是扩展现有 prompt 系统
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
      const { ManusHooksAdapter } = await import('../unified/manus-hooks-adapter')
      const adapter = new ManusHooksAdapter(
        input.planningFilesDir || input.directory || process.cwd()
      )
      adapter.initialize()
      
      // 监听文件更新事件，清除缓存
      // TODO: 实现文件监听机制
      // 可以使用 chokidar 或 @parcel/watcher
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

**步骤 1.6.2: 集成规划文件更新**

在工具执行后，自动更新规划文件：

```typescript
// 在 SessionPrompt.loop() 或相关位置添加
// 当工具执行成功时，更新规划文件状态
if (useManus && toolResult.success) {
  const { ManusPlanningSystem } = await import('../unified/manus-planning')
  const planning = new ManusPlanningSystem(planningFilesDir)
  
  // 根据工具执行结果更新阶段状态
  // TODO: 实现阶段状态更新逻辑
}
```

#### 测试要求

**文件**: `packages/opencode/src/session/__tests__/prompt-manus.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'bun:test'
import { SessionPrompt } from '../prompt'
import { Session } from '../index'
import { Identifier } from '../../id/id'

describe('SessionPrompt.promptWithManus', () => {
  let sessionID: string
  
  beforeEach(async () => {
    sessionID = Identifier.ascending('session')
    await Session.create(sessionID)
  })
  
  it('should work with Manus mode', async () => {
    const result = await SessionPrompt.promptWithManus({
      sessionID,
      parts: [{ type: 'text', text: '测试需求' }],
      directory: '/tmp/test',
      useManus: true,
    })
    
    expect(result).toBeDefined()
  })
  
  it('should be compatible with existing prompt system', async () => {
    // 测试与现有系统的兼容性
    const result1 = await SessionPrompt.prompt({
      sessionID,
      parts: [{ type: 'text', text: '测试' }],
    })
    
    const result2 = await SessionPrompt.promptWithManus({
      sessionID,
      parts: [{ type: 'text', text: '测试' }],
      useManus: false,
    })
    
    // 两种方式应该产生类似的结果
    expect(result1).toBeDefined()
    expect(result2).toBeDefined()
  })
})
```

---

### 1.7 OpenWork 基础集成 (Week 6-7)

#### 任务清单

- [ ] 创建 OpenWork 统一入口模块（调用共享模块）
- [ ] 集成需求输入界面
- [ ] 连接共享统一入口模块（不调用 CLI）
- [ ] 基础状态管理
- [ ] 规划文件可视化：显示规划文件内容

#### 文件结构

```
openwork/src/
├── app/
│   └── unified.ts                # OpenWork 统一入口模块
├── views/
│   └── unified/
│       └── UnifiedTaskView.tsx   # 统一任务视图
└── components/
    └── unified/
        ├── PlanningFilesView.tsx  # 规划文件视图
        └── RequirementInput.tsx  # 需求输入组件
```

#### 实现步骤

**步骤 1.7.1: 创建 OpenWork 统一入口模块**

**文件**: `openwork/src/app/unified.ts`

```typescript
// 注意：OpenWork 使用 Tauri + SolidJS
// 需要调用 OpenCode 的共享模块，但需要通过 IPC 或直接导入

import type { UnifiedEntryOptions, UnifiedEntryResult } from '@opencode-ai/opencode/unified/types'

/**
 * OpenWork 统一入口函数
 * 调用 OpenCode 共享模块
 */
export async function unifiedTask(options: {
  workspacePath: string
  requirement: string
  sessionID: string
  useManus?: boolean
}): Promise<UnifiedEntryResult> {
  // 方案1: 如果 OpenCode 模块可以直接导入
  // import { unifiedEntry } from '@opencode-ai/opencode/unified'
  // return await unifiedEntry({ ... })
  
  // 方案2: 通过 IPC 调用 OpenCode CLI（不推荐，但作为备选）
  // const { invoke } = await import('@tauri-apps/api/core')
  // return await invoke('unified_entry', { ... })
  
  // 方案3: 直接调用 OpenCode 服务器 API
  // const client = createOpencodeClient({ baseUrl: 'http://localhost:4096' })
  // return await client.unified.entry({ ... })
  
  // TODO: 根据实际架构选择方案
  throw new Error('Not implemented')
}
```

**步骤 1.7.2: 创建统一任务视图**

**文件**: `openwork/src/views/unified/UnifiedTaskView.tsx`

```typescript
import { createSignal, onMount } from 'solid-js'
import { unifiedTask } from '../../app/unified'
import { RequirementInput } from '../../components/unified/RequirementInput'
import { PlanningFilesView } from '../../components/unified/PlanningFilesView'

export function UnifiedTaskView() {
  const [requirement, setRequirement] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [result, setResult] = createSignal<any>(null)
  
  async function handleSubmit() {
    setLoading(true)
    try {
      const workspacePath = '/path/to/workspace' // TODO: 从上下文获取
      const sessionID = 'session-id' // TODO: 生成或获取
      
      const result = await unifiedTask({
        workspacePath,
        requirement: requirement(),
        sessionID,
      })
      
      setResult(result)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div class="unified-task-view">
      <RequirementInput
        value={requirement()}
        onInput={setRequirement}
        onSubmit={handleSubmit}
        loading={loading()}
      />
      
      {result()?.planningFilesCreated && (
        <PlanningFilesView workspacePath="/path/to/workspace" />
      )}
    </div>
  )
}
```

**步骤 1.7.3: 创建规划文件视图组件**

**文件**: `openwork/src/components/unified/PlanningFilesView.tsx`

```typescript
import { createSignal, onMount } from 'solid-js'
import { readFile } from '@tauri-apps/api/fs'
import { join } from '@tauri-apps/api/path'

export function PlanningFilesView(props: { workspacePath: string }) {
  const [taskPlan, setTaskPlan] = createSignal('')
  const [findings, setFindings] = createSignal('')
  const [progress, setProgress] = createSignal('')
  
  onMount(async () => {
    // 读取规划文件
    const [taskPlanPath, findingsPath, progressPath] = await Promise.all([
      join(props.workspacePath, 'task_plan.md'),
      join(props.workspacePath, 'findings.md'),
      join(props.workspacePath, 'progress.md'),
    ])
    
    try {
      const [taskPlanContent, findingsContent, progressContent] = await Promise.all([
        readFile(taskPlanPath),
        readFile(findingsPath),
        readFile(progressPath),
      ])
      
      setTaskPlan(taskPlanContent as string)
      setFindings(findingsContent as string)
      setProgress(progressContent as string)
    } catch (error) {
      console.error('Failed to read planning files:', error)
    }
  })
  
  return (
    <div class="planning-files-view">
      <div class="file-tabs">
        <button>Task Plan</button>
        <button>Findings</button>
        <button>Progress</button>
      </div>
      
      <div class="file-content">
        <pre>{taskPlan()}</pre>
      </div>
    </div>
  )
}
```

#### 测试要求

**文件**: `openwork/src/app/__tests__/unified.test.ts`

```typescript
import { describe, it, expect } from 'bun:test'
import { unifiedTask } from '../unified'

describe('unifiedTask', () => {
  it('should call unified entry', async () => {
    // TODO: 实现测试
  })
})
```

---

## 阶段 2: 智能调度 + Manus 同步 (5-6 周)

### 2.1 Agent 能力矩阵 (Week 7)

#### 任务清单

- [ ] 定义 Agent 能力模型
- [ ] 构建能力矩阵
- [ ] 实现能力查询接口
- [ ] 支持动态能力注册
- [ ] 与规划文件关联：Agent 能力与 task_plan.md 阶段关联

#### 文件结构

```
packages/opencode/src/unified/
├── agent-capabilities.ts         # Agent 能力矩阵
└── __tests__/
    └── agent-capabilities.test.ts
```

#### 实现步骤

**步骤 2.1.1: 创建 Agent 能力矩阵**

**文件**: `packages/opencode/src/unified/agent-capabilities.ts`

```typescript
export interface AgentCapability {
  agent: string
  skills: string[]
  phases: string[] // 与 task_plan.md 阶段关联
  priority: number
}

export class AgentCapabilities {
  private capabilities: Map<string, AgentCapability> = new Map()
  
  /**
   * 注册 Agent 能力
   */
  register(capability: AgentCapability): void {
    this.capabilities.set(capability.agent, capability)
  }
  
  /**
   * 查询 Agent 能力
   */
  get(agent: string): AgentCapability | undefined {
    return this.capabilities.get(agent)
  }
  
  /**
   * 根据技能查找 Agent
   */
  findBySkill(skill: string): AgentCapability[] {
    return Array.from(this.capabilities.values())
      .filter(cap => cap.skills.includes(skill))
      .sort((a, b) => b.priority - a.priority)
  }
  
  /**
   * 根据阶段查找 Agent
   */
  findByPhase(phase: string): AgentCapability[] {
    return Array.from(this.capabilities.values())
      .filter(cap => cap.phases.includes(phase))
      .sort((a, b) => b.priority - a.priority)
  }
}

// 默认能力矩阵
export const defaultCapabilities = new AgentCapabilities()

// 初始化默认能力
defaultCapabilities.register({
  agent: 'frontend',
  skills: ['frontend', 'react', 'vue', 'angular'],
  phases: ['Phase 2: 实现', 'Phase 3: 测试'],
  priority: 10,
})

defaultCapabilities.register({
  agent: 'backend',
  skills: ['backend', 'api', 'server'],
  phases: ['Phase 2: 实现'],
  priority: 10,
})
```

#### 测试要求

**文件**: `packages/opencode/src/unified/__tests__/agent-capabilities.test.ts`

```typescript
import { describe, it, expect } from 'bun:test'
import { AgentCapabilities } from '../agent-capabilities'

describe('AgentCapabilities', () => {
  it('should find agents by skill', () => {
    const caps = new AgentCapabilities()
    caps.register({
      agent: 'frontend',
      skills: ['frontend', 'react'],
      phases: [],
      priority: 10,
    })
    
    const result = caps.findBySkill('frontend')
    expect(result.length).toBeGreaterThan(0)
  })
})
```

---

### 2.2 任务-Agent 匹配 (Week 7-8)

#### 任务清单

- [ ] 实现匹配算法
- [ ] 支持多 Agent 协作
- [ ] 实现优先级排序
- [ ] 优化匹配性能
- [ ] 阶段映射：将 Agent 任务映射到 task_plan.md 阶段

#### 文件结构

```
packages/opencode/src/unified/
├── agent-matcher.ts              # Agent 匹配器
└── __tests__/
    └── agent-matcher.test.ts
```

#### 实现步骤

**步骤 2.2.1: 创建 Agent 匹配器**

**文件**: `packages/opencode/src/unified/agent-matcher.ts`

```typescript
import { AgentCapabilities } from './agent-capabilities'
import type { ParsedRequirement, Task } from './types'

export class AgentMatcher {
  constructor(private capabilities: AgentCapabilities) {}
  
  /**
   * 匹配任务到 Agent
   */
  match(requirement: ParsedRequirement, phase?: string): Task[] {
    const tasks: Task[] = []
    
    // 根据技能匹配
    for (const skill of requirement.skills) {
      const agents = this.capabilities.findBySkill(skill)
      for (const agent of agents) {
        tasks.push({
          id: `task-${tasks.length + 1}`,
          agent: agent.agent,
          description: `使用 ${agent.agent} 处理 ${skill} 相关任务`,
          phase: phase || agent.phases[0],
        })
      }
    }
    
    // 根据阶段匹配
    if (phase) {
      const phaseAgents = this.capabilities.findByPhase(phase)
      for (const agent of phaseAgents) {
        if (!tasks.some(t => t.agent === agent.agent)) {
          tasks.push({
            id: `task-${tasks.length + 1}`,
            agent: agent.agent,
            description: `使用 ${agent.agent} 处理 ${phase}`,
            phase,
          })
        }
      }
    }
    
    return tasks
  }
}
```

---

### 2.3 执行计划生成 (Week 8)

#### 任务清单

- [ ] 实现任务分解算法
- [ ] 构建依赖图
- [ ] 生成执行计划
- [ ] 优化并行策略
- [ ] 与规划文件同步：执行计划从 task_plan.md 生成（单一数据源）

#### 文件结构

```
packages/opencode/src/unified/
├── plan-generator.ts             # 执行计划生成器
└── __tests__/
    └── plan-generator.test.ts
```

#### 实现步骤

**步骤 2.3.1: 创建执行计划生成器**

**文件**: `packages/opencode/src/unified/plan-generator.ts`

```typescript
import type { ParsedRequirement, ProjectInfo, ExecutionPlan, Task } from './types'
import { AgentMatcher } from './agent-matcher'
import { AgentCapabilities } from './agent-capabilities'

export class PlanGenerator {
  constructor(
    private matcher: AgentMatcher,
    private capabilities: AgentCapabilities
  ) {}
  
  /**
   * 生成执行计划
   */
  async generate(
    requirement: ParsedRequirement,
    project: ProjectInfo
  ): Promise<ExecutionPlan> {
    // 从 task_plan.md 读取阶段（如果存在）
    // TODO: 实现从规划文件读取阶段
    
    // 生成任务
    const tasks = this.decomposeTasks(requirement, project)
    
    // 构建依赖图
    const dependencies = this.buildDependencyGraph(tasks)
    
    // 优化并行策略
    const parallelStrategy = this.optimizeParallelStrategy(tasks, dependencies)
    
    return {
      tasks,
      dependencies,
      parallelStrategy,
    }
  }
  
  /**
   * 分解任务
   */
  private decomposeTasks(
    requirement: ParsedRequirement,
    project: ProjectInfo
  ): Task[] {
    const tasks: Task[] = []
    
    // 根据需求类型分解
    if (requirement.type === 'development') {
      tasks.push(...this.matcher.match(requirement, 'Phase 1: 需求分析'))
      tasks.push(...this.matcher.match(requirement, 'Phase 2: 实现'))
      tasks.push(...this.matcher.match(requirement, 'Phase 3: 测试'))
    }
    
    return tasks
  }
  
  /**
   * 构建依赖图
   */
  private buildDependencyGraph(tasks: Task[]): Map<string, string[]> {
    const graph = new Map<string, string[]>()
    
    // 简单的依赖关系：按阶段顺序
    const phases = ['Phase 1: 需求分析', 'Phase 2: 实现', 'Phase 3: 测试']
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const phaseIndex = phases.indexOf(task.phase || '')
      
      if (phaseIndex > 0) {
        const prevPhase = phases[phaseIndex - 1]
        const prevTasks = tasks.filter(t => t.phase === prevPhase)
        graph.set(task.id, prevTasks.map(t => t.id))
      }
    }
    
    return graph
  }
  
  /**
   * 优化并行策略
   */
  private optimizeParallelStrategy(
    tasks: Task[],
    dependencies: Map<string, string[]>
  ): { parallel: string[][]; sequential: string[] } {
    // 简单的并行策略：同一阶段的任务可以并行
    const parallel: string[][] = []
    const sequential: string[] = []
    
    const phases = ['Phase 1: 需求分析', 'Phase 2: 实现', 'Phase 3: 测试']
    
    for (const phase of phases) {
      const phaseTasks = tasks.filter(t => t.phase === phase)
      if (phaseTasks.length > 0) {
        parallel.push(phaseTasks.map(t => t.id))
      }
    }
    
    return { parallel, sequential }
  }
}
```

---

### 2.4 OpenWork 调度集成 (Week 8-9)

#### 任务清单

- [ ] 集成智能调度到 OpenWork
- [ ] 实现执行计划可视化
- [ ] 实现 Agent 选择界面
- [ ] 状态同步
- [ ] 规划文件同步显示：实时显示规划文件更新

#### 实现步骤

**步骤 2.4.1: 创建调度视图**

**文件**: `openwork/src/views/unified/SchedulerView.tsx`

```typescript
import { createSignal, onMount } from 'solid-js'
import { ExecutionPlan } from '@opencode-ai/opencode/unified/types'

export function SchedulerView(props: { plan: ExecutionPlan }) {
  return (
    <div class="scheduler-view">
      <h2>执行计划</h2>
      <div class="tasks">
        {props.plan.tasks.map(task => (
          <div class="task">
            <span>{task.agent}</span>
            <span>{task.description}</span>
            <span>{task.phase}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 阶段 3: 执行和优化 (5-6 周)

### 3.1 错误处理和重试 (Week 9-10)

#### 任务清单

- [ ] 实现错误检测
- [ ] 实现重试机制（3-Strike 协议）
- [ ] 实现错误恢复
- [ ] 实现回滚机制
- [ ] 错误记录：记录错误到 task_plan.md（使用事务机制）
- [ ] 3-Strike 协议：实现 3-Strike 错误协议

#### 文件结构

```
packages/opencode/src/unified/
├── error-handler.ts              # 错误处理器
└── __tests__/
    └── error-handler.test.ts
```

#### 实现步骤

**步骤 3.1.1: 创建错误处理器**

**文件**: `packages/opencode/src/unified/error-handler.ts`

```typescript
import { ManusPlanningSystem } from './manus-planning'

export class ErrorHandler {
  private errorCounts: Map<string, number> = new Map()
  private readonly MAX_RETRIES = 3
  
  constructor(private planningSystem: ManusPlanningSystem) {}
  
  /**
   * 3-Strike 错误协议
   */
  async handleError(
    error: Error,
    context: { task: string; phase: string }
  ): Promise<{ shouldRetry: boolean; attempt: number }> {
    const key = `${context.task}-${context.phase}`
    const count = (this.errorCounts.get(key) || 0) + 1
    this.errorCounts.set(key, count)
    
    // 记录错误到 task_plan.md
    await this.planningSystem.logError(error, count)
    
    if (count >= this.MAX_RETRIES) {
      // 3次失败后，升级到用户
      return { shouldRetry: false, attempt: count }
    }
    
    return { shouldRetry: true, attempt: count }
  }
}
```

---

### 3.2 进度报告和日志 (Week 10)

#### 任务清单

- [ ] 实现进度报告
- [ ] 实现日志系统
- [ ] 实现结果汇总
- [ ] 支持 JSON 和文本格式
- [ ] 规划文件更新：更新 progress.md（使用事务机制）

#### 文件结构

```
packages/opencode/src/unified/
├── progress-reporter.ts          # 进度报告器
└── __tests__/
    └── progress-reporter.test.ts
```

#### 实现步骤

**步骤 3.2.1: 创建进度报告器**

**文件**: `packages/opencode/src/unified/progress-reporter.ts`

```typescript
import { ManusPlanningSystem } from './manus-planning'
import type { ExecutionPlan } from './types'

export class ProgressReporter {
  constructor(private planningSystem: ManusPlanningSystem) {}
  
  /**
   * 更新进度
   */
  async updateProgress(
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    result?: any
  ): Promise<void> {
    // 更新 progress.md
    await this.planningSystem.updateProgress(taskId, status, result)
  }
  
  /**
   * 生成报告
   */
  async generateReport(plan: ExecutionPlan): Promise<string> {
    // TODO: 实现报告生成
    return JSON.stringify(plan, null, 2)
  }
}
```

---

## 阶段 4: 集成和优化 (4-5 周)

### 4.1 系统集成 (Week 11-12)

#### 任务清单

- [ ] 集成所有模块
- [ ] 端到端测试
- [ ] 性能优化
- [ ] 错误修复
- [ ] Manus 模式端到端测试：测试完整 Manus 工作流
- [ ] 验证所有 P0 修复：确保所有 P0 问题已解决

#### 测试要求

**文件**: `packages/opencode/src/unified/__tests__/e2e.test.ts`

```typescript
import { describe, it, expect } from 'bun:test'
import { unifiedEntry } from '../index'

describe('E2E Tests', () => {
  it('should complete full Manus workflow', async () => {
    // TODO: 实现端到端测试
  })
  
  it('should verify all P0 fixes', async () => {
    // TODO: 验证所有 P0 修复
  })
})
```

---

## 阶段 5: 文档和发布 (2-3 周)

### 5.1 文档编写 (Week 14-15)

#### 任务清单

- [ ] 用户文档
- [ ] API 文档
- [ ] 开发文档
- [ ] 示例和教程
- [ ] OpenWork 使用指南
- [ ] Manus 模式使用指南：详细说明 Manus 模式的使用
- [ ] P0 修复说明：说明所有 P0 修复的改进

#### 文档结构

```
docs/
├── unified-entry/
│   ├── user-guide.md              # 用户指南
│   ├── api-reference.md            # API 参考
│   ├── developer-guide.md          # 开发指南
│   ├── examples/                   # 示例代码
│   │   ├── simple-task.ts
│   │   ├── complex-task.ts
│   │   └── manus-workflow.ts
│   ├── manus-mode-guide.md         # Manus 模式使用指南
│   └── p0-fixes.md                 # P0 修复说明
└── openwork/
    └── unified-task-guide.md       # OpenWork 统一任务指南
```

#### 实现步骤

**步骤 5.1.1: 编写用户文档**

**文件**: `docs/unified-entry/user-guide.md`

```markdown
# 统一入口用户指南

## 简介

统一入口是 OpenCode 的新功能，允许用户通过简单的命令或界面完成复杂任务。

## 基本使用

### CLI 使用

\`\`\`bash
# 简单需求
opencode unified --dir /path/to/project "帮我运行这个项目"

# 复杂需求（自动创建规划文件）
opencode unified --dir /path/to/project "实现用户登录功能"
\`\`\`

### OpenWork 使用

1. 启动 OpenWork
2. 选择或创建 Workspace
3. 输入需求
4. 系统自动分析和执行

## Manus 模式

Manus 模式会自动为复杂任务创建三个规划文件：
- task_plan.md: 任务规划
- findings.md: 研究发现
- progress.md: 进度日志

## 示例

[示例代码]
```

**步骤 5.1.2: 编写 Manus 模式指南**

**文件**: `docs/unified-entry/manus-mode-guide.md`

```markdown
# Manus 模式使用指南

## 什么是 Manus 模式

Manus 模式基于 "planning-with-files" skill，使用持久化 Markdown 文件管理任务。

## 三文件系统

### task_plan.md
跟踪阶段和进度，包含：
- 目标
- 阶段状态
- 决策记录
- 错误记录

### findings.md
存储研究和发现，包含：
- 研究结果
- 技术决策
- 资源链接

### progress.md
会话日志和测试结果，包含：
- 操作记录
- 测试结果
- 性能数据

## 使用场景

Manus 模式适用于：
- 复杂任务（>5 个工具调用）
- 多阶段任务
- 需要长期跟踪的任务

## 最佳实践

1. 定期查看规划文件
2. 在决策前重读 task_plan.md
3. 记录所有错误和解决方案
4. 永不重复失败的操作
```

#### 测试要求

- 文档完整性检查
- 示例代码可运行性验证
- 链接有效性检查

---

### 5.2 发布准备 (Week 15-16)

#### 任务清单

- [ ] 版本号管理
- [ ] 发布说明
- [ ] 迁移指南
- [ ] 社区通知
- [ ] OpenWork 应用打包
- [ ] 规划文件迁移工具：帮助用户迁移现有规划文件
- [ ] 依赖更新：确保 proper-lockfile 已添加到 package.json

#### 实现步骤

**步骤 5.2.1: 版本号管理**

**文件**: `packages/opencode/package.json`（修改）

```json
{
  "version": "1.2.0",
  "changelog": {
    "1.2.0": {
      "features": [
        "统一入口功能",
        "Manus 模式集成",
        "智能调度系统"
      ],
      "fixes": [
        "P0: Hooks 系统格式不匹配",
        "P0: PreToolUse Hook 异步执行问题",
        "P0: 文件锁依赖缺失"
      ]
    }
  }
}
```

**步骤 5.2.2: 创建迁移工具**

**文件**: `packages/opencode/src/cli/cmd/migrate-planning.ts`

```typescript
import { readFile, writeFile, stat } from 'fs/promises'
import { join } from 'path'

/**
 * 迁移现有规划文件到新格式
 */
export async function migratePlanningFiles(directory: string): Promise<void> {
  const oldFiles = ['plan.md', 'notes.md', 'log.md']
  const newFiles = ['task_plan.md', 'findings.md', 'progress.md']
  
  for (let i = 0; i < oldFiles.length; i++) {
    const oldPath = join(directory, oldFiles[i])
    const newPath = join(directory, newFiles[i])
    
    try {
      await stat(oldPath)
      const content = await readFile(oldPath, 'utf-8')
      
      // 转换格式
      const converted = convertFormat(content, newFiles[i])
      
      await writeFile(newPath, converted, 'utf-8')
      console.log(`Migrated ${oldFiles[i]} -> ${newFiles[i]}`)
    } catch {
      // 文件不存在，跳过
    }
  }
}

function convertFormat(content: string, fileType: string): string {
  // TODO: 实现格式转换逻辑
  return content
}
```

#### 测试要求

- 版本号验证
- 迁移工具测试
- 发布包完整性检查

---

## 代码规范

### TypeScript 规范

1. **类型安全**
   - 所有函数必须有类型注解
   - 使用 `interface` 定义数据结构
   - 避免使用 `any`，使用 `unknown` 替代

2. **命名规范**
   - 类名：PascalCase（如 `ManusHooksAdapter`）
   - 函数名：camelCase（如 `readTaskPlanCached`）
   - 常量：UPPER_SNAKE_CASE（如 `CACHE_TTL`）
   - 文件名：kebab-case（如 `manus-hooks-adapter.ts`）

3. **代码组织**
   - 每个文件一个主要类或命名空间
   - 使用 `export namespace` 组织相关功能
   - 私有方法使用 `private` 关键字

4. **注释规范**
   - 所有公共 API 必须有 JSDoc 注释
   - 复杂逻辑必须有行内注释
   - TODO 注释必须包含任务描述

### 错误处理

1. **错误类型**
   - 使用自定义错误类
   - 提供有意义的错误消息
   - 包含错误上下文

2. **错误传播**
   - 使用 `try-catch` 捕获错误
   - 记录错误日志
   - 向上传播或转换为用户友好消息

### 测试规范

1. **测试覆盖率**
   - 单元测试覆盖率 > 80%
   - 关键路径覆盖率 > 95%
   - P0 修复必须 100% 覆盖

2. **测试组织**
   - 每个模块对应一个测试文件
   - 使用 `describe` 组织测试套件
   - 使用 `beforeEach`/`afterEach` 设置清理

3. **测试命名**
   - 测试名称应该描述测试场景
   - 使用 `should` 或 `it` 开头

---

## 测试要求

### 单元测试

#### 覆盖率要求

- **总体覆盖率**: > 80%
- **关键模块覆盖率**: > 95%
  - `unified/index.ts`: 100%
  - `unified/manus-hooks-adapter.ts`: 100%
  - `unified/manus-planning.ts`: 100%
  - `session/prompt.ts` (Manus 扩展): 100%

#### 测试重点

1. **Hooks 适配器测试**
   - PreToolUse Hook 阻塞行为
   - 缓存机制
   - 超时处理
   - 并发执行

2. **规划系统测试**
   - 文件创建
   - 事务机制
   - 文件锁
   - 原子写入

3. **需求解析测试**
   - LLM 解析
   - 规则匹配降级
   - 复杂度评估
   - Manus 模式判断

### 集成测试

#### 端到端测试场景

1. **简单任务流程**
   ```typescript
   it('should handle simple requirement', async () => {
     const result = await unifiedEntry({
       directory: '/tmp/test',
       requirement: '帮我运行这个项目',
       sessionID: 'test-session',
     })
     expect(result.success).toBe(true)
     expect(result.planningFilesCreated).toBe(false)
   })
   ```

2. **复杂任务流程（Manus 模式）**
   ```typescript
   it('should handle complex requirement with Manus', async () => {
     const result = await unifiedEntry({
       directory: '/tmp/test',
       requirement: '实现用户登录功能，包括前端和后端',
       sessionID: 'test-session',
     })
     expect(result.success).toBe(true)
     expect(result.planningFilesCreated).toBe(true)
     
     // 验证规划文件已创建
     const files = await readdir('/tmp/test')
     expect(files).toContain('task_plan.md')
     expect(files).toContain('findings.md')
     expect(files).toContain('progress.md')
   })
   ```

3. **Hooks 执行测试**
   ```typescript
   it('should execute PreToolUse Hook before tool execution', async () => {
     // 验证 PreToolUse Hook 阻塞执行
     // 验证 task_plan.md 内容被读取
   })
   ```

4. **事务机制测试**
   ```typescript
   it('should update planning file with transaction', async () => {
     // 验证文件锁机制
     // 验证原子写入
     // 验证并发更新
   })
   ```

### 性能测试

#### 性能指标

- **响应时间**: < 2s（简单任务）
- **Hooks 执行时间**: < 100ms
- **文件读取时间**: < 50ms（带缓存）
- **规划文件更新时间**: < 200ms

#### 性能测试场景

1. **并发工具执行**
   ```typescript
   it('should handle concurrent tool execution', async () => {
     const promises = Array.from({ length: 10 }, () =>
       unifiedEntry({ ... })
     )
     const results = await Promise.all(promises)
     expect(results.every(r => r.success)).toBe(true)
   })
   ```

2. **大量规划文件更新**
   ```typescript
   it('should handle frequent planning file updates', async () => {
     // 模拟频繁更新
     // 验证文件锁性能
   })
   ```

### P0 修复验证测试

#### 必须验证的 P0 修复

1. **Hooks 系统格式不匹配**
   - 验证命令式 Hooks 转换为事件式 Hooks
   - 验证 Hook 正确触发

2. **PreToolUse Hook 异步执行问题**
   - 验证 PreToolUse Hook 阻塞执行
   - 验证在工具执行前读取 task_plan.md

3. **文件锁依赖缺失**
   - 验证 proper-lockfile 已安装
   - 验证文件锁正常工作

4. **会话恢复兼容性**
   - 验证会话恢复机制
   - 验证原生恢复备选方案

5. **规划文件更新同步问题**
   - 验证事务机制
   - 验证工具执行与规划文件更新同步

6. **需求理解系统降级方案**
   - 验证 LLM 失败时规则匹配
   - 验证超时处理

---

## 依赖管理

### 新增依赖

#### 必需依赖

```json
{
  "dependencies": {
    "proper-lockfile": "^4.0.2"
  },
  "devDependencies": {
    "@types/proper-lockfile": "^4.0.0"
  }
}
```

#### 可选依赖

```json
{
  "dependencies": {
    "graphlib": "^2.1.8"  // 用于依赖图构建（可选）
  }
}
```

### 依赖安装

```bash
cd packages/opencode
bun add proper-lockfile
bun add -d @types/proper-lockfile
```

### 依赖验证

```bash
# 检查依赖是否已安装
bun pm ls | grep proper-lockfile

# 验证依赖版本
bun pm ls proper-lockfile
```

### 依赖更新策略

1. **安全更新**: 定期更新依赖以修复安全漏洞
2. **版本锁定**: 使用精确版本号（如 `^4.0.2`）
3. **测试验证**: 更新依赖后运行完整测试套件

---

## 开发时间表

### 总体时间估算

- **阶段 1**: 7-8 周（基础架构 + Manus 集成）
- **阶段 2**: 5-6 周（智能调度 + Manus 同步）
- **阶段 3**: 5-6 周（执行和优化）
- **阶段 4**: 4-5 周（集成和优化）
- **阶段 5**: 2-3 周（文档和发布）

**总计**: 23-28 周

### 关键里程碑

| 里程碑 | 时间 | 交付物 |
|--------|------|--------|
| M1: 统一入口基础 | Week 1 | 统一入口模块、CLI 命令 |
| M2: Manus 集成 | Week 3 | Manus 规划系统、Hooks 适配器 |
| M3: SessionPrompt 扩展 | Week 6 | SessionPrompt.promptWithManus |
| M4: 智能调度 | Week 8 | Agent 匹配、执行计划生成 |
| M5: 错误处理 | Week 10 | 错误处理、3-Strike 协议 |
| M6: 系统集成 | Week 12 | 端到端测试、性能优化 |
| M7: 发布准备 | Week 16 | 文档、发布版本 |

---

## 风险与缓解

### 技术风险

1. **Hooks 适配器复杂度** ⚠️ 高风险
   - **风险**: 命令式 Hooks 转换为事件式 Hooks 可能复杂
   - **缓解**: 充分设计适配器架构，分步实现，充分测试

2. **PreToolUse Hook 阻塞性能** ⚠️ 中风险
   - **风险**: 阻塞执行可能影响工具执行速度
   - **缓解**: 使用缓存机制（TTL 500ms），优化文件读取

3. **SessionPrompt 扩展兼容性** ⚠️ 中风险
   - **风险**: 扩展现有系统可能影响现有功能
   - **缓解**: 充分测试兼容性，使用特性开关

4. **文件锁跨平台兼容性** ⚠️ 中风险
   - **风险**: proper-lockfile 在不同平台的行为可能不同
   - **缓解**: 充分测试所有平台，提供平台特定实现

### 进度风险

1. **时间估算不足** ⚠️ 中风险
   - **风险**: 实际开发时间可能超过估算
   - **缓解**: 已增加 6 周缓冲时间，分阶段交付

2. **依赖外部系统** ⚠️ 低风险
   - **风险**: 依赖 OpenCode 现有系统可能变化
   - **缓解**: 使用稳定的 API，充分测试兼容性

---

## 总结

### 核心成果

1. **统一入口模块**: CLI 和 OpenWork 共用的统一入口实现
2. **Manus 模式集成**: 完整的三文件规划系统
3. **Hooks 适配器**: 命令式到事件式 Hooks 的转换
4. **SessionPrompt 扩展**: 不创建独立执行引擎，扩展现有系统
5. **智能调度系统**: Agent 选择、任务分解、执行计划生成

### P0 修复状态

- ✅ Hooks 系统格式不匹配
- ✅ PreToolUse Hook 异步执行问题
- ✅ 执行引擎架构重复
- ✅ 文件锁依赖缺失
- ✅ 会话恢复兼容性
- ✅ 规划文件更新同步问题
- ✅ 需求理解系统降级方案
- ✅ OpenWork 集成路径

### 下一步行动

1. **立即开始**: 阶段 1.1 统一入口命令
2. **并行准备**: 依赖安装、目录结构创建
3. **持续跟踪**: 每周进度检查，及时调整计划

---

**文档版本**: v1.0  
**最后更新**: 2026-01-26  
**维护者**: OpenCode Team  
**基于**: OpenCode开发计划_统一入口和智能调度_v5.0_20260126_AI.md