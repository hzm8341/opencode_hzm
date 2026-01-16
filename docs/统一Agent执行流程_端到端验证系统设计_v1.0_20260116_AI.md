# 统一Agent执行流程 - 端到端验证系统设计
# Unified Agent Execution Flow - End-to-End Verification System Design

**版本 / Version**: v1.0  
**日期 / Date**: 2026-01-16  
**状态 / Status**: 🟡 设计阶段 / Design Phase

---

## 设计目标 / Design Goals

端到端验证系统是统一Agent执行流程的**核心创新点**，确保任务真正完成，而不仅仅是代码质量检查。

**The end-to-end verification system is the core innovation of the unified Agent execution flow, ensuring tasks are truly completed, not just code quality checks.**

### 核心价值 / Core Value

- ✅ **功能验证**: 验证功能是否真正工作（如demo是否真的运行起来）
- ✅ **自动化**: 无需人工干预，自动验证
- ✅ **可扩展**: 支持多种验证策略
- ✅ **可配置**: 用户可自定义验证方式

---

## 架构设计 / Architecture Design

### 整体架构 / Overall Architecture

```
┌─────────────────────────────────────┐
│   Verification Strategy Registry     │
│   (验证策略注册表)                    │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                 │
┌──────▼──────┐  ┌──────▼──────┐
│ Run Demo    │  │ Fix Bug     │
│ Strategy    │  │ Strategy    │
└─────────────┘  └─────────────┘
       │                 │
       └────────┬────────┘
                │
    ┌───────────▼───────────┐
    │  Verification Engine  │
    │  (验证引擎)            │
    └───────────┬───────────┘
                │
    ┌───────────▼───────────┐
    │  Verification Result  │
    │  (验证结果)            │
    └───────────────────────┘
```

### 核心组件 / Core Components

#### 1. 验证策略注册表 / Verification Strategy Registry

**位置**: `oh-my-opencode/src/tools/verification/registry.ts`

**功能**:
- 注册验证策略
- 根据任务类型选择策略
- 管理策略生命周期

**接口**:
```typescript
interface VerificationStrategy {
  /** Strategy name */
  name: string
  
  /** Match task type */
  match(taskType: TaskType, taskDescription: string): boolean
  
  /** Execute verification */
  verify(context: VerificationContext): Promise<VerificationResult>
  
  /** Strategy priority (higher = preferred) */
  priority?: number
}
```

#### 2. 验证引擎 / Verification Engine

**位置**: `oh-my-opencode/src/tools/verification/engine.ts`

**功能**:
- 选择验证策略
- 执行验证
- 收集验证结果
- 生成验证报告

#### 3. 内置验证策略 / Built-in Verification Strategies

**位置**: `oh-my-opencode/src/tools/verification/strategies/`

**策略列表**:

1. **RunDemoVerificationStrategy**
   - 文件: `run-demo-strategy.ts`
   - 功能: 验证服务是否运行
   - 方法: 端口检测、HTTP健康检查

2. **FixBugVerificationStrategy**
   - 文件: `fix-bug-strategy.ts`
   - 功能: 验证bug是否修复
   - 方法: 复现原始场景、测试运行

3. **AddFeatureVerificationStrategy**
   - 文件: `add-feature-strategy.ts`
   - 功能: 验证功能是否实现
   - 方法: 功能测试、手动检查

---

## 详细设计 / Detailed Design

### 1. RunDemoVerificationStrategy

#### 功能 / Functionality

验证服务是否成功运行，包括：
- 服务进程是否启动
- 端口是否监听
- HTTP响应是否正常
- 功能是否可用

#### 实现步骤 / Implementation Steps

```typescript
class RunDemoVerificationStrategy implements VerificationStrategy {
  async verify(context: VerificationContext): Promise<VerificationResult> {
    // Step 1: Find start command
    const startCommand = await this.findStartCommand(context.projectPath)
    
    // Step 2: Start service (if not running)
    const serviceHandle = await this.startService(startCommand, context)
    
    // Step 3: Wait for service to be ready
    await this.waitForServiceReady(serviceHandle, context.successCriteria.verification.target)
    
    // Step 4: Perform health check
    const healthCheck = await this.performHealthCheck(context.successCriteria.verification.target)
    
    // Step 5: Perform functional check (if possible)
    const functionalCheck = await this.performFunctionalCheck(context)
    
    // Step 6: Cleanup (optional, keep service running for user)
    // await this.stopService(serviceHandle)
    
    return {
      success: healthCheck.success && functionalCheck.success,
      message: healthCheck.message,
      evidence: [
        { type: "health_check", data: JSON.stringify(healthCheck) },
        { type: "functional_check", data: JSON.stringify(functionalCheck) },
      ],
    }
  }
}
```

#### 技术实现 / Technical Implementation

**端口检测**:
```typescript
import { createConnection } from "node:net"

async function checkPort(host: string, port: number, timeout: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port }, () => {
      socket.destroy()
      resolve(true)
    })
    
    socket.on("error", () => resolve(false))
    
    setTimeout(() => {
      socket.destroy()
      resolve(false)
    }, timeout)
  })
}
```

**HTTP健康检查**:
```typescript
async function httpHealthCheck(url: string, timeout: number = 10000): Promise<HealthCheckResult> {
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(timeout),
    })
    
    return {
      success: response.ok,
      statusCode: response.status,
      message: `HTTP ${response.status} ${response.statusText}`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Health check failed: ${error}`,
    }
  }
}
```

**服务启动**:
```typescript
import { spawn } from "node:child_process"

async function startService(
  command: string,
  cwd: string
): Promise<ServiceHandle> {
  const [cmd, ...args] = command.split(" ")
  const process = spawn(cmd, args, {
    cwd,
    stdio: "pipe",
    detached: true,
  })
  
  return {
    process,
    pid: process.pid,
    command,
    cwd,
  }
}
```

---

### 2. FixBugVerificationStrategy

#### 功能 / Functionality

验证bug是否真正修复：
- 复现原始bug场景
- 验证bug不再出现
- 运行相关测试

#### 实现步骤 / Implementation Steps

```typescript
class FixBugVerificationStrategy implements VerificationStrategy {
  async verify(context: VerificationContext): Promise<VerificationResult> {
    // Step 1: Reproduce original bug scenario
    const bugReproduction = await this.reproduceBug(context)
    
    // Step 2: Verify bug no longer occurs
    const bugFixed = !bugReproduction.occurred
    
    // Step 3: Run related tests
    const testResults = await this.runTests(context)
    
    return {
      success: bugFixed && testResults.success,
      message: bugFixed 
        ? "Bug has been fixed" 
        : "Bug still occurs",
      evidence: [
        { type: "bug_reproduction", data: JSON.stringify(bugReproduction) },
        { type: "test_results", data: JSON.stringify(testResults) },
      ],
    }
  }
}
```

---

### 3. AddFeatureVerificationStrategy

#### 功能 / Functionality

验证新功能是否实现：
- 测试新功能
- 验证功能符合需求
- 检查相关测试

#### 实现步骤 / Implementation Steps

```typescript
class AddFeatureVerificationStrategy implements VerificationStrategy {
  async verify(context: VerificationContext): Promise<VerificationResult> {
    // Step 1: Test new feature
    const featureTest = await this.testFeature(context)
    
    // Step 2: Verify feature matches requirements
    const requirementsCheck = await this.checkRequirements(context)
    
    // Step 3: Run related tests
    const testResults = await this.runTests(context)
    
    return {
      success: featureTest.success && requirementsCheck.success && testResults.success,
      message: "Feature verification complete",
      evidence: [
        { type: "feature_test", data: JSON.stringify(featureTest) },
        { type: "requirements_check", data: JSON.stringify(requirementsCheck) },
        { type: "test_results", data: JSON.stringify(testResults) },
      ],
    }
  }
}
```

---

## 工具设计 / Tool Design

### 验证工具 / Verification Tool

创建一个OpenCode工具，供Agent调用：

```typescript
export const VerificationTool = tool({
  description: "Verify task completion using end-to-end verification strategies",
  args: {
    taskType: tool.schema.string().describe("Task type to verify"),
    successCriteria: tool.schema.object({
      type: tool.schema.string(),
      description: tool.schema.string(),
      verification: tool.schema.object({
        method: tool.schema.string(),
        target: tool.schema.string(),
        expected: tool.schema.string(),
      }),
    }),
  },
  async execute(args, ctx) {
    const strategy = verificationRegistry.selectStrategy(args.taskType, args.successCriteria)
    
    if (!strategy) {
      return `No verification strategy found for task type: ${args.taskType}`
    }
    
    const result = await strategy.verify({
      projectPath: ctx.directory,
      taskDescription: args.successCriteria.description,
      successCriteria: args.successCriteria,
      sessionId: ctx.sessionID,
    })
    
    return JSON.stringify(result, null, 2)
  },
})
```

---

## 集成到统一流程 / Integration into Unified Flow

### Phase 5: 质量保证阶段 / Phase 5: Quality Assurance Phase

在Phase 5中自动调用验证工具：

```typescript
// Phase 5提示词中指导Agent调用验证工具
const PHASE_5_QUALITY_ASSURANCE_PROMPT = `
## ✅ PHASE 5: QUALITY ASSURANCE

### Step 1: Code Quality Check
[LSP diagnostics, tests, etc.]

### Step 2: End-to-End Verification (MANDATORY)

Call the verification tool to verify task completion:

\`\`\`typescript
verification(
  taskType="${state.taskType}",
  successCriteria=${JSON.stringify(state.successCriteria)}
)
\`\`\`

**CRITICAL**: Task is NOT complete until verification passes.
`
```

---

## 实施计划 / Implementation Plan

### 阶段1: 基础框架 / Phase 1: Basic Framework

**目标**: 实现验证策略注册表和基础引擎

**任务**:
1. 创建验证工具目录结构
2. 实现策略注册表
3. 实现验证引擎
4. 创建基础接口

**预计时间**: 2-3天

---

### 阶段2: RunDemo策略实现 / Phase 2: RunDemo Strategy Implementation

**目标**: 实现运行Demo验证策略

**任务**:
1. 实现服务启动检测
2. 实现端口检测
3. 实现HTTP健康检查
4. 实现功能验证

**预计时间**: 3-4天

---

### 阶段3: 其他策略实现 / Phase 3: Other Strategies Implementation

**目标**: 实现FixBug和AddFeature策略

**任务**:
1. 实现FixBug策略
2. 实现AddFeature策略
3. 测试和优化

**预计时间**: 2-3天

---

### 阶段4: 集成和测试 / Phase 4: Integration and Testing

**目标**: 集成到统一流程并测试

**任务**:
1. 集成到Phase 5
2. 端到端测试
3. 文档更新

**预计时间**: 2-3天

---

## 技术挑战 / Technical Challenges

### 挑战1: 服务进程管理

**问题**: 如何启动和管理服务进程？

**解决方案**:
- 使用Node.js `child_process.spawn`
- 保持进程运行（不自动清理）
- 提供清理机制（可选）

### 挑战2: 端口检测准确性

**问题**: 如何准确检测端口是否监听？

**解决方案**:
- 使用TCP连接检测
- 设置合理的超时时间
- 重试机制

### 挑战3: 验证策略选择

**问题**: 如何选择最合适的验证策略？

**解决方案**:
- 基于任务类型匹配
- 支持优先级
- 支持多个策略组合

---

## 总结 / Summary

端到端验证系统是统一Agent执行流程的核心创新，确保任务真正完成。设计采用策略模式，支持可扩展的验证方式。

**The end-to-end verification system is the core innovation of the unified Agent execution flow, ensuring tasks are truly completed. The design uses a strategy pattern to support extensible verification methods.**

---

**文档版本历史 / Document Version History**:

- v1.0 (2026-01-16): 初始版本，端到端验证系统设计

