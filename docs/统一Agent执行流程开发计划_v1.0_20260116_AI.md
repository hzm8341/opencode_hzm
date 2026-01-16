# 统一Agent执行流程开发计划 / Unified Agent Execution Flow Development Plan

**版本 / Version**: v1.0  
**日期 / Date**: 2026-01-16  
**作者 / Author**: AI Assistant  
**状态 / Status**: 计划阶段 / Planning Phase

---

## 执行摘要 / Executive Summary

### 目标 / Objective

设计并实现一个统一的Agent执行流程系统，允许用户通过**一句话输入**自动完成复杂任务。系统将自动协调所有可用的Agent，按照标准化的6步流程执行任务，直到任务完成并验证成功。

**Design and implement a unified Agent execution flow system that allows users to automatically complete complex tasks through a single sentence input. The system will automatically coordinate all available Agents and execute tasks according to a standardized 6-step process until completion and successful verification.**

### 核心价值 / Core Value

- ✅ **零配置使用** / **Zero-configuration usage**: 用户只需输入一句话，系统自动处理所有细节
- ✅ **智能协调** / **Intelligent orchestration**: 自动选择和使用最适合的Agent组合
- ✅ **端到端验证** / **End-to-end verification**: 自动验证任务完成状态，确保质量
- ✅ **永不放弃** / **Never give up**: 集成Sisyphus机制，自动重试和修复错误

---

## 背景与需求分析 / Background and Requirements Analysis

### 当前状态 / Current State

OpenCode已经具备以下能力：

1. **原生Agent系统** / **Native Agent System**:
   - `plan` agent: 只读规划代理
   - `build` agent: 完整权限开发代理
   - `general` subagent: 复杂搜索和多步骤任务
   - `explore` subagent: 快速代码库探索

2. **Oh My OpenCode插件** / **Oh My OpenCode Plugin**:
   - `Sisyphus`: 主协调器，永不放弃机制
   - `orchestrator-sisyphus`: 高级协调器
   - `oracle`: 架构设计和代码审查
   - `librarian`: 文档查找和代码库分析
   - `explore`: 快速代码库探索
   - `frontend-ui-ux-engineer`: 前端开发
   - `document-writer`: 文档编写
   - `multimodal-looker`: 图片/PDF分析
   - `Metis`: 计划顾问（预规划分析）
   - `Momus`: 计划审查者（计划验证）

3. **现有工作流程** / **Existing Workflows**:
   - 计划优先原则：先制定计划，再实施
   - ultrawork模式：自动任务分解和并行执行
   - 验证机制：lsp_diagnostics、测试、构建验证

### 问题与挑战 / Problems and Challenges

1. **手动协调复杂** / **Manual coordination complexity**: 
   - 用户需要手动选择agent、制定计划、执行、验证
   - 需要多次命令才能完成一个任务

2. **缺乏统一入口** / **Lack of unified entry point**:
   - 没有"一句话完成所有事情"的接口
   - 用户需要理解不同agent的用途和使用场景

3. **验证不完整** / **Incomplete verification**:
   - 当前验证主要关注代码质量，缺乏端到端的功能验证
   - 例如："运行demo"需要验证demo是否真的运行起来了

### 用户需求 / User Requirements

**核心需求** / **Core Requirement**:

用户希望输入一句话（如："帮我将当前的项目demo运行起来"），系统能够：

1. **自动理解任务** / **Automatically understand the task**: 解析用户意图，明确交付标准
2. **智能制定计划** / **Intelligently create plan**: 分析代码和文档，制定详细计划
3. **评估计划可行性** / **Evaluate plan feasibility**: 审查计划，确保可执行
4. **自动执行计划** / **Automatically execute plan**: 协调所有agent，并行执行任务
5. **端到端验证** / **End-to-end verification**: 验证任务真正完成（如demo真的运行起来了）
6. **自动退出** / **Automatic exit**: 任务完成后自动退出，无需人工干预

---

## 标准执行流程设计 / Standard Execution Flow Design

### 六步流程概览 / Six-Step Flow Overview

```
用户输入一句话
    ↓
[1] 任务解析 (Task Parsing)
    ↓
[2] 智能拆解 (Intelligent Decomposition)
    ↓
[3] 并行执行 (Parallel Execution)
    ↓
[4] 综合构建 (Synthesis & Construction)
    ↓
[5] 质量保证 (Quality Assurance)
    ↓
[6] 结果交付 (Result Delivery)
    ↓
自动退出
```

### 详细流程设计 / Detailed Flow Design

#### 阶段1: 任务解析 / Phase 1: Task Parsing

**目标** / **Goal**: 理解核心需求，明确交付标准

**执行Agent** / **Executing Agent**: 
- 主协调器: `orchestrator-sisyphus` 或 `Sisyphus`
- 辅助Agent: `Metis` (预规划分析), `oracle` (复杂架构分析)

**关键活动** / **Key Activities**:

1. **意图分类** / **Intent Classification**:
   - 分析用户输入，识别任务类型（运行demo、修复bug、添加功能、重构等）
   - 确定任务复杂度（简单/中等/复杂）

2. **上下文收集** / **Context Gathering**:
   - 并行启动多个`explore` agent探索代码库：
     - 项目结构分析
     - 相关文件查找
     - 依赖关系分析
     - 配置文件识别
   - 使用`librarian` agent查找文档和最佳实践

3. **需求明确化** / **Requirement Clarification**:
   - 使用`Metis` agent进行预规划分析
   - 识别隐藏需求和潜在风险
   - 明确交付标准（成功标准）

4. **输出** / **Output**:
   - 任务描述文档
   - 明确的成功标准（可验证的指标）
   - 风险评估报告

**验证标准** / **Verification Criteria**:
- ✅ 任务类型已明确
- ✅ 成功标准可验证（如："demo在localhost:3000运行，返回200状态码"）
- ✅ 关键上下文已收集

---

#### 阶段2: 智能拆解 / Phase 2: Intelligent Decomposition

**目标** / **Goal**: 分解为可执行步骤，确定资源需求

**执行Agent** / **Executing Agent**:
- 主规划器: `plan` agent (原生) 或 `Prometheus` (Oh My OpenCode)
- 审查者: `Momus` (计划验证)

**关键活动** / **Key Activities**:

1. **任务分解** / **Task Decomposition**:
   - 使用`plan` agent制定详细计划
   - 将任务分解为可执行的子任务
   - 确定任务依赖关系
   - 识别可并行执行的任务

2. **资源评估** / **Resource Assessment**:
   - 确定需要的Agent类型
   - 评估时间成本
   - 识别潜在风险点

3. **计划审查** / **Plan Review**:
   - 使用`Momus` agent审查计划
   - 确保计划清晰、可验证、完整
   - 如果计划被拒绝，返回阶段1重新分析

4. **输出** / **Output**:
   - 详细工作计划（`.sisyphus/plans/{task-name}.md`）
   - 任务清单（TODO列表）
   - Agent分配方案

**验证标准** / **Verification Criteria**:
- ✅ 计划通过`Momus`审查（OKAY状态）
- ✅ 所有任务有明确的验证标准
- ✅ 任务依赖关系清晰
- ✅ 资源需求已明确

---

#### 阶段3: 并行执行 / Phase 3: Parallel Execution

**目标** / **Goal**: 多线程收集/处理，实时进度跟踪

**执行Agent** / **Executing Agent**:
- 主协调器: `orchestrator-sisyphus` 或 `Sisyphus`
- 执行Agent: `build` agent + 各种专业化Agent

**关键活动** / **Key Activities**:

1. **任务分配** / **Task Assignment**:
   - 根据任务类型分配最适合的Agent
   - 启动并行后台任务（background tasks）
   - 使用`sisyphus_task`工具协调子任务

2. **并行执行** / **Parallel Execution**:
   - **代码探索任务** → `explore` agent (并行多个)
   - **文档查找任务** → `librarian` agent (并行多个)
   - **前端开发任务** → `frontend-ui-ux-engineer` agent
   - **架构设计任务** → `oracle` agent
   - **代码实现任务** → `build` agent + 相应category
   - **文档编写任务** → `document-writer` agent

3. **进度跟踪** / **Progress Tracking**:
   - 实时监控TODO列表完成状态
   - 跟踪后台任务状态
   - 检测阻塞和错误

4. **错误处理** / **Error Handling**:
   - 自动重试失败的任务（Sisyphus机制）
   - 自动修复常见错误
   - 遇到无法自动修复的错误时，咨询`oracle` agent

**验证标准** / **Verification Criteria**:
- ✅ 所有TODO项目标记为完成
- ✅ 所有后台任务已完成
- ✅ 代码通过lsp_diagnostics检查
- ✅ 构建/测试通过（如果适用）

---

#### 阶段4: 综合构建 / Phase 4: Synthesis & Construction

**目标** / **Goal**: 信息融合，逻辑构建

**执行Agent** / **Executing Agent**:
- 主协调器: `orchestrator-sisyphus`
- 辅助Agent: `oracle` (复杂集成问题)

**关键活动** / **Key Activities**:

1. **信息整合** / **Information Integration**:
   - 收集所有并行任务的结果
   - 整合代码、文档、配置等变更
   - 解决冲突和依赖问题

2. **逻辑构建** / **Logic Construction**:
   - 确保各模块正确集成
   - 验证接口一致性
   - 检查数据流和调用链

3. **依赖处理** / **Dependency Handling**:
   - 安装/更新依赖
   - 配置环境变量
   - 设置必要的服务

4. **输出** / **Output**:
   - 完整的实现代码
   - 更新的配置文件
   - 集成验证报告

**验证标准** / **Verification Criteria**:
- ✅ 所有模块正确集成
- ✅ 依赖已安装
- ✅ 配置文件已更新
- ✅ 无集成冲突

---

#### 阶段5: 质量保证 / Phase 5: Quality Assurance

**目标** / **Goal**: 自检修正，格式优化

**执行Agent** / **Executing Agent**:
- 主协调器: `orchestrator-sisyphus`
- 质量检查: `oracle` (代码审查), LSP工具

**关键活动** / **Key Activities**:

1. **代码质量检查** / **Code Quality Check**:
   - 运行`lsp_diagnostics`检查所有修改的文件
   - 类型检查
   - 代码风格检查
   - 自动修复可修复的问题

2. **功能验证** / **Functional Verification**:
   - 运行单元测试（如果存在）
   - 运行集成测试（如果存在）
   - 构建项目验证编译通过

3. **端到端验证** / **End-to-End Verification**:
   - **关键步骤**: 根据任务类型执行实际验证
   - 对于"运行demo"任务:
     - 启动demo服务
     - 验证服务是否真的运行（检查端口、HTTP响应等）
     - 验证功能是否正常工作
   - 对于"修复bug"任务:
     - 复现原始bug场景
     - 验证bug已修复
   - 对于"添加功能"任务:
     - 测试新功能
     - 验证功能符合需求

4. **格式优化** / **Format Optimization**:
   - 代码格式化
   - 文档格式化
   - 确保符合项目规范

**验证标准** / **Verification Criteria**:
- ✅ 所有代码质量检查通过
- ✅ 测试通过（如果存在）
- ✅ **端到端功能验证通过**（关键）
- ✅ 格式符合规范

---

#### 阶段6: 结果交付 / Phase 6: Result Delivery

**目标** / **Goal**: 按需格式化，附上执行摘要

**执行Agent** / **Executing Agent**:
- 主协调器: `orchestrator-sisyphus`
- 文档编写: `document-writer` agent

**关键活动** / **Key Activities**:

1. **执行摘要生成** / **Execution Summary Generation**:
   - 总结完成的工作
   - 列出修改的文件
   - 记录遇到的问题和解决方案
   - 提供验证证据（截图、日志等）

2. **结果格式化** / **Result Formatting**:
   - 根据用户偏好格式化输出
   - 生成可读性强的报告
   - 包含关键信息（命令、文件路径、验证结果等）

3. **后续建议** / **Follow-up Suggestions**:
   - 提供优化建议
   - 指出潜在问题
   - 建议下一步行动

4. **自动退出** / **Automatic Exit**:
   - 确认所有任务完成
   - 取消所有后台任务
   - 清理临时资源
   - 退出程序

**输出格式** / **Output Format**:

```markdown
## 任务完成报告 / Task Completion Report

### 任务概述 / Task Overview
- **任务**: [用户原始输入]
- **状态**: ✅ 已完成 / Completed
- **执行时间**: [耗时]

### 完成的工作 / Completed Work
1. [任务1]
2. [任务2]
...

### 修改的文件 / Modified Files
- `path/to/file1.ts`
- `path/to/file2.ts`
...

### 验证结果 / Verification Results
- ✅ 代码质量检查通过
- ✅ 构建成功
- ✅ Demo运行在 http://localhost:3000
- ✅ HTTP响应: 200 OK

### 执行摘要 / Execution Summary
[详细摘要]
```

**验证标准** / **Verification Criteria**:
- ✅ 执行摘要已生成
- ✅ 所有验证证据已提供
- ✅ 程序已自动退出

---

## 技术实现方案 / Technical Implementation Plan

### 架构设计 / Architecture Design

#### 1. 统一入口Agent / Unified Entry Agent

**名称**: `unified-executor` 或 `auto-executor`

**职责** / **Responsibilities**:
- 接收用户的一句话输入
- 协调整个6步流程
- 管理状态转换
- 处理异常和重试

**实现方式** / **Implementation Approach**:

**方案A: 扩展现有orchestrator-sisyphus** (推荐)
- 优点: 复用现有逻辑，减少重复代码
- 缺点: 可能增加复杂度

**方案B: 创建新的unified-executor agent**
- 优点: 职责清晰，易于维护
- 缺点: 需要重新实现部分逻辑

**推荐方案**: 方案A，在`orchestrator-sisyphus`基础上扩展

#### 2. 流程状态机 / Flow State Machine

实现一个状态机来管理6个阶段的转换：

```typescript
enum ExecutionPhase {
  TASK_PARSING = "task_parsing",
  INTELLIGENT_DECOMPOSITION = "intelligent_decomposition",
  PARALLEL_EXECUTION = "parallel_execution",
  SYNTHESIS_CONSTRUCTION = "synthesis_construction",
  QUALITY_ASSURANCE = "quality_assurance",
  RESULT_DELIVERY = "result_delivery",
  COMPLETED = "completed",
  FAILED = "failed"
}

interface ExecutionState {
  phase: ExecutionPhase
  taskDescription: string
  successCriteria: SuccessCriteria
  plan?: WorkPlan
  todos: Todo[]
  executionResults: ExecutionResult[]
  verificationResults: VerificationResult[]
}
```

#### 3. 端到端验证系统 / End-to-End Verification System

**关键组件** / **Key Components**:

1. **验证策略注册表** / **Verification Strategy Registry**:
   ```typescript
   interface VerificationStrategy {
     match(taskType: string): boolean
     verify(context: VerificationContext): Promise<VerificationResult>
   }
   ```

2. **内置验证策略** / **Built-in Verification Strategies**:
   - **运行Demo验证** / **Run Demo Verification**:
     - 检测服务是否启动（端口监听）
     - HTTP健康检查
     - 功能测试（如果可能）
   
   - **修复Bug验证** / **Fix Bug Verification**:
     - 复现原始bug场景
     - 验证bug不再出现
   
   - **添加功能验证** / **Add Feature Verification**:
     - 测试新功能
     - 验证功能符合需求

3. **可扩展验证框架** / **Extensible Verification Framework**:
   - 允许用户自定义验证策略
   - 支持多种验证方式（HTTP、CLI、文件检查等）

#### 4. 智能Agent选择器 / Intelligent Agent Selector

根据任务类型自动选择最适合的Agent：

```typescript
interface AgentSelector {
  selectAgent(task: Task, context: ExecutionContext): AgentConfig
}

// 选择规则示例
const selectionRules = {
  "运行demo": {
    primary: "orchestrator-sisyphus",
    assistants: ["explore", "librarian", "build"]
  },
  "修复bug": {
    primary: "orchestrator-sisyphus",
    assistants: ["explore", "oracle", "build"]
  },
  "添加功能": {
    primary: "orchestrator-sisyphus",
    assistants: ["plan", "explore", "build", "frontend-ui-ux-engineer"]
  }
}
```

### 实现步骤 / Implementation Steps

#### 阶段1: 核心框架实现 / Phase 1: Core Framework Implementation

**目标** / **Goal**: 实现基本的流程协调和状态管理

**任务清单** / **Task List**:

1. **创建unified-executor agent** (或扩展orchestrator-sisyphus)
   - 实现状态机
   - 实现阶段转换逻辑
   - 实现基本的错误处理

2. **实现任务解析模块**
   - 集成Metis agent进行预规划分析
   - 实现上下文收集（并行explore/librarian）
   - 实现成功标准提取

3. **实现智能拆解模块**
   - 集成plan agent制定计划
   - 集成Momus agent审查计划
   - 实现计划迭代机制（如果被拒绝）

4. **基础测试**
   - 单元测试
   - 集成测试

**预计时间** / **Estimated Time**: 2-3周

---

#### 阶段2: 执行和验证系统 / Phase 2: Execution and Verification System

**目标** / **Goal**: 实现并行执行和端到端验证

**任务清单** / **Task List**:

1. **实现并行执行模块**
   - 集成sisyphus_task工具
   - 实现任务分配逻辑
   - 实现进度跟踪

2. **实现端到端验证系统**
   - 创建验证策略注册表
   - 实现内置验证策略（运行demo、修复bug、添加功能）
   - 实现验证结果收集和报告

3. **实现综合构建模块**
   - 实现信息整合逻辑
   - 实现依赖处理
   - 实现冲突解决

4. **测试和优化**
   - 端到端测试
   - 性能优化

**预计时间** / **Estimated Time**: 2-3周

---

#### 阶段3: 质量保证和结果交付 / Phase 3: Quality Assurance and Result Delivery

**目标** / **Goal**: 实现质量检查和结果格式化

**任务清单** / **Task List**:

1. **实现质量保证模块**
   - 集成LSP诊断工具
   - 实现自动修复机制
   - 实现测试运行和验证

2. **实现结果交付模块**
   - 实现执行摘要生成
   - 实现结果格式化
   - 实现自动退出逻辑

3. **用户体验优化**
   - 改进错误消息
   - 添加进度指示
   - 优化输出格式

4. **文档和示例**
   - 编写使用文档
   - 创建示例场景
   - 录制演示视频

**预计时间** / **Estimated Time**: 1-2周

---

#### 阶段4: 测试和优化 / Phase 4: Testing and Optimization

**目标** / **Goal**: 全面测试和性能优化

**任务清单** / **Task List**:

1. **全面测试**
   - 单元测试覆盖率 > 80%
   - 集成测试
   - 端到端测试
   - 压力测试

2. **性能优化**
   - 并行执行优化
   - 上下文管理优化
   - 减少不必要的API调用

3. **错误处理完善**
   - 异常场景处理
   - 优雅降级
   - 用户友好的错误消息

4. **文档完善**
   - API文档
   - 用户指南
   - 故障排查指南

**预计时间** / **Estimated Time**: 1-2周

---

## 技术细节 / Technical Details

### 1. 状态持久化 / State Persistence

执行状态需要持久化，以便：
- 支持中断恢复
- 支持会话管理
- 支持进度查询

**存储位置** / **Storage Location**:
- `.opencode/execution-state/{session-id}.json`

**状态结构** / **State Structure**:
```typescript
interface ExecutionState {
  sessionId: string
  phase: ExecutionPhase
  taskDescription: string
  successCriteria: SuccessCriteria
  plan?: WorkPlan
  todos: Todo[]
  executionResults: ExecutionResult[]
  verificationResults: VerificationResult[]
  createdAt: string
  updatedAt: string
}
```

### 2. 验证策略实现示例 / Verification Strategy Implementation Example

**运行Demo验证策略** / **Run Demo Verification Strategy**:

```typescript
class RunDemoVerificationStrategy implements VerificationStrategy {
  match(taskType: string): boolean {
    return taskType.includes("运行") || 
           taskType.includes("run") || 
           taskType.includes("demo") ||
           taskType.includes("启动")
  }

  async verify(context: VerificationContext): Promise<VerificationResult> {
    const { projectPath, taskDescription } = context
    
    // 1. 查找启动命令
    const startCommand = await this.findStartCommand(projectPath)
    
    // 2. 执行启动命令
    await this.executeStartCommand(startCommand, projectPath)
    
    // 3. 等待服务启动
    await this.waitForService()
    
    // 4. 健康检查
    const healthCheck = await this.performHealthCheck()
    
    // 5. 功能验证
    const functionalCheck = await this.performFunctionalCheck()
    
    return {
      success: healthCheck.success && functionalCheck.success,
      evidence: {
        healthCheck,
        functionalCheck,
        serviceUrl: healthCheck.url
      }
    }
  }
  
  private async findStartCommand(projectPath: string): Promise<string> {
    // 查找package.json、docker-compose.yml等
    // 返回启动命令
  }
  
  private async performHealthCheck(): Promise<HealthCheckResult> {
    // 检查端口监听
    // HTTP请求健康检查
    // 返回结果
  }
}
```

### 3. Agent协调机制 / Agent Coordination Mechanism

使用现有的`sisyphus_task`工具进行Agent协调：

```typescript
// 阶段3: 并行执行示例
async function executeParallelTasks(
  plan: WorkPlan,
  context: ExecutionContext
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = []
  
  // 并行启动多个任务
  const tasks = plan.todos.map(todo => 
    sisyphus_task({
      category: selectCategory(todo),
      prompt: todo.description,
      background: canRunInBackground(todo)
    })
  )
  
  // 等待所有任务完成
  const taskResults = await Promise.allSettled(tasks)
  
  // 收集结果
  for (const result of taskResults) {
    if (result.status === 'fulfilled') {
      results.push(result.value)
    } else {
      // 错误处理
      await handleTaskError(result.reason, context)
    }
  }
  
  return results
}
```

### 4. 错误处理和重试机制 / Error Handling and Retry Mechanism

集成Sisyphus的永不放弃机制：

```typescript
interface RetryConfig {
  maxRetries: number
  retryDelay: number
  retryableErrors: string[]
}

async function executeWithRetry<T>(
  task: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await task()
    } catch (error) {
      lastError = error
      
      // 检查是否可重试
      if (!isRetryable(error, config.retryableErrors)) {
        throw error
      }
      
      // 等待后重试
      await sleep(config.retryDelay * (attempt + 1))
    }
  }
  
  throw lastError
}
```

---

## 使用示例 / Usage Examples

### 示例1: 运行Demo / Example 1: Run Demo

**用户输入** / **User Input**:
```bash
bun dev run "帮我将当前的项目demo运行起来"
```

**执行流程** / **Execution Flow**:

1. **任务解析**:
   - 识别任务类型: "运行demo"
   - 收集上下文: 查找package.json、启动脚本、依赖等
   - 明确成功标准: "demo在localhost:3000运行，返回200状态码"

2. **智能拆解**:
   - 制定计划:
     - 检查依赖是否安装
     - 安装缺失依赖
     - 配置环境变量
     - 启动服务
     - 验证服务运行

3. **并行执行**:
   - explore agent: 查找启动脚本
   - librarian agent: 查找项目文档
   - build agent: 安装依赖、配置环境

4. **综合构建**:
   - 整合所有配置
   - 确保依赖完整

5. **质量保证**:
   - 启动服务
   - **端到端验证**: 
     - 检查端口3000是否监听
     - HTTP GET http://localhost:3000
     - 验证返回200状态码

6. **结果交付**:
   - 生成报告: "Demo已成功运行在 http://localhost:3000"
   - 提供验证证据: HTTP响应截图
   - 自动退出

---

### 示例2: 修复Bug / Example 2: Fix Bug

**用户输入** / **User Input**:
```bash
bun dev run "修复登录功能中的空指针异常"
```

**执行流程** / **Execution Flow**:

1. **任务解析**:
   - 识别任务类型: "修复bug"
   - 收集上下文: 查找登录相关代码、错误日志、测试用例
   - 明确成功标准: "登录功能正常工作，不再出现空指针异常"

2. **智能拆解**:
   - 制定计划:
     - 定位bug位置
     - 分析bug原因
     - 修复bug
     - 添加测试
     - 验证修复

3. **并行执行**:
   - explore agent: 查找登录相关代码
   - oracle agent: 分析bug原因
   - build agent: 修复代码

4. **综合构建**:
   - 整合修复代码
   - 更新相关测试

5. **质量保证**:
   - 代码质量检查
   - 运行测试
   - **端到端验证**: 
     - 复现原始bug场景
     - 验证bug已修复
     - 验证登录功能正常

6. **结果交付**:
   - 生成报告: "Bug已修复，登录功能正常工作"
   - 提供验证证据: 测试结果、修复前后对比
   - 自动退出

---

### 示例3: 添加功能 / Example 3: Add Feature

**用户输入** / **User Input**:
```bash
bun dev run "添加用户头像上传功能"
```

**执行流程** / **Execution Flow**:

1. **任务解析**:
   - 识别任务类型: "添加功能"
   - 收集上下文: 查找用户相关代码、文件上传相关代码、项目架构
   - 明确成功标准: "用户可以上传头像，头像显示在用户资料页面"

2. **智能拆解**:
   - 使用Metis进行预规划分析
   - 制定详细计划:
     - 设计API接口
     - 实现文件上传逻辑
     - 实现前端上传组件
     - 更新用户资料页面
     - 添加测试

3. **并行执行**:
   - explore agent: 查找相关代码模式
   - librarian agent: 查找文件上传最佳实践
   - oracle agent: 设计架构
   - build agent: 实现后端
   - frontend-ui-ux-engineer: 实现前端

4. **综合构建**:
   - 整合前后端代码
   - 确保接口一致

5. **质量保证**:
   - 代码质量检查
   - 运行测试
   - **端到端验证**: 
     - 测试上传功能
     - 验证头像显示
     - 验证功能符合需求

6. **结果交付**:
   - 生成报告: "头像上传功能已添加"
   - 提供验证证据: 功能演示截图、测试结果
   - 自动退出

---

## 实施计划 / Implementation Plan

### 里程碑 / Milestones

| 里程碑 / Milestone | 目标 / Goal | 预计完成时间 / Estimated Completion |
|-------------------|-------------|-------------------------------------|
| M1: 核心框架 | 完成阶段1-2的基础实现 | Week 4 |
| M2: 验证系统 | 完成端到端验证系统 | Week 6 |
| M3: 完整流程 | 完成所有6个阶段 | Week 8 |
| M4: 测试优化 | 完成测试和优化 | Week 10 |

### 资源需求 / Resource Requirements

1. **开发人员** / **Developers**:
   - 1-2名全栈开发工程师
   - 熟悉TypeScript、OpenCode架构、Agent系统

2. **测试环境** / **Testing Environment**:
   - 多个测试项目（不同技术栈）
   - 各种场景的测试用例

3. **时间投入** / **Time Investment**:
   - 总计: 8-10周
   - 每周: 20-30小时

### 风险与缓解 / Risks and Mitigation

| 风险 / Risk | 影响 / Impact | 缓解措施 / Mitigation |
|------------|---------------|----------------------|
| 流程过于复杂 | 高 | 分阶段实现，先实现核心功能 |
| Agent协调困难 | 中 | 复用现有sisyphus_task机制 |
| 验证策略不完善 | 中 | 先实现常见场景，逐步扩展 |
| 性能问题 | 低 | 优化并行执行，减少不必要的调用 |

---

## 后续优化方向 / Future Optimization Directions

### 1. 学习能力 / Learning Capability

- 记录成功和失败的执行模式
- 优化Agent选择策略
- 改进任务分解算法

### 2. 用户偏好学习 / User Preference Learning

- 学习用户的常用模式
- 个性化Agent选择
- 优化输出格式

### 3. 更智能的验证 / Smarter Verification

- 使用AI进行功能验证
- 自动生成测试用例
- 更全面的端到端测试

### 4. 多项目支持 / Multi-Project Support

- 支持同时处理多个项目
- 跨项目依赖管理
- 项目间知识共享

---

## 总结 / Summary

本计划旨在创建一个统一的Agent执行流程系统，实现"一句话完成所有事情"的目标。通过标准化的6步流程，系统将自动协调所有可用的Agent，完成从任务理解到结果交付的全过程，并确保端到端的验证。

**This plan aims to create a unified Agent execution flow system that achieves the goal of "completing everything with a single sentence". Through a standardized 6-step process, the system will automatically coordinate all available Agents to complete the entire process from task understanding to result delivery, ensuring end-to-end verification.**

### 关键成功因素 / Key Success Factors

1. ✅ **清晰的流程设计** / **Clear flow design**: 6步流程逻辑清晰，易于实现
2. ✅ **充分利用现有能力** / **Full utilization of existing capabilities**: 复用现有Agent和工具
3. ✅ **端到端验证** / **End-to-end verification**: 确保任务真正完成
4. ✅ **用户友好** / **User-friendly**: 零配置，一句话完成

### 下一步行动 / Next Steps

1. **审查本计划** / **Review this plan**: 确认技术方案可行性
2. **开始阶段1实现** / **Start Phase 1 implementation**: 实现核心框架
3. **迭代开发** / **Iterative development**: 分阶段实现和测试
4. **用户反馈** / **User feedback**: 收集使用反馈，持续优化

---

**文档版本历史 / Document Version History**:

- v1.0 (2026-01-16): 初始版本，包含完整的6步流程设计和实施计划

---

**备注 / Notes**:

- 本计划基于当前OpenCode架构设计，实施时可能需要根据实际情况调整
- 建议先实现核心功能，再逐步完善细节
- 重点关注端到端验证的实现，这是确保任务真正完成的关键

