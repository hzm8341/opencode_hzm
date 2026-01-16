# 统一Agent执行流程 - 阶段1实施计划
# Unified Agent Execution Flow - Phase 1 Implementation Plan

**版本 / Version**: v1.0  
**日期 / Date**: 2026-01-16  
**基于 / Based on**: `统一Agent执行流程开发计划_v1.0_20260116_AI.md`  
**审查报告 / Review Report**: `统一Agent执行流程开发计划_技术审查报告_v1.0_20260116_AI.md`

---

## 实施目标 / Implementation Goals

### 阶段1目标 / Phase 1 Goals

实现统一Agent执行流程的**核心框架**，包括：

1. ✅ **扩展orchestrator-sisyphus支持6步流程**
2. ✅ **实现流程状态管理**
3. ✅ **实现阶段1: 任务解析**
4. ✅ **实现阶段2: 智能拆解**

### 成功标准 / Success Criteria

- [ ] orchestrator-sisyphus能够识别并执行6步流程
- [ ] 流程状态能够正确持久化和恢复
- [ ] 任务解析阶段能够正确提取成功标准
- [ ] 智能拆解阶段能够生成并通过Momus审查的计划
- [ ] 基础测试通过

---

## 实施任务清单 / Implementation Task List

### 任务1: 创建流程状态管理模块 / Task 1: Create Flow State Management Module

**优先级**: 🔴 **高 / High**  
**预计时间**: 2-3天

#### 子任务 / Subtasks

1. **创建状态类型定义**
   - 文件: `oh-my-opencode/src/features/unified-executor/types.ts`
   - 定义 `ExecutionPhase` 枚举
   - 定义 `ExecutionState` 接口
   - 定义 `SuccessCriteria` 接口

2. **实现状态管理器**
   - 文件: `oh-my-opencode/src/features/unified-executor/state-manager.ts`
   - 实现状态读取/写入
   - 实现状态持久化（`.sisyphus/execution-state/`）
   - 实现状态恢复

3. **集成到现有系统**
   - 扩展 `boulder-state` 或创建新模块
   - 确保与现有状态管理兼容

#### 验收标准 / Acceptance Criteria

- [ ] 状态能够正确保存到文件
- [ ] 状态能够正确恢复
- [ ] 状态转换逻辑正确
- [ ] 单元测试通过

---

### 任务2: 扩展orchestrator-sisyphus支持6步流程 / Task 2: Extend orchestrator-sisyphus for 6-Step Flow

**优先级**: 🔴 **高 / High**  
**预计时间**: 3-4天

#### 子任务 / Subtasks

1. **创建6步流程提示词模块**
   - 文件: `oh-my-opencode/src/agents/unified-flow-prompts.ts`
   - 定义各阶段的提示词模板
   - 阶段1: 任务解析提示词
   - 阶段2: 智能拆解提示词
   - 阶段3-6: 后续阶段提示词（占位）

2. **扩展orchestrator-sisyphus提示词**
   - 文件: `oh-my-opencode/src/agents/orchestrator-sisyphus.ts`
   - 在系统提示词中添加6步流程指导
   - 添加流程阶段识别逻辑
   - 添加阶段转换指导

3. **创建流程检测Hook**
   - 文件: `oh-my-opencode/src/hooks/unified-flow/index.ts`
   - 检测用户输入是否触发统一流程
   - 注入流程提示词
   - 监控流程阶段转换

#### 验收标准 / Acceptance Criteria

- [ ] orchestrator-sisyphus能够识别统一流程任务
- [ ] 流程提示词正确注入
- [ ] 阶段转换逻辑正确
- [ ] 集成测试通过

---

### 任务3: 实现阶段1 - 任务解析 / Task 3: Implement Phase 1 - Task Parsing

**优先级**: 🔴 **高 / High**  
**预计时间**: 2-3天

#### 子任务 / Subtasks

1. **实现意图分类逻辑**
   - 在orchestrator-sisyphus提示词中添加任务类型识别
   - 支持识别: 运行demo、修复bug、添加功能、重构等

2. **实现上下文收集**
   - 指导Agent并行启动explore/librarian agent
   - 使用background_task工具并行执行
   - 收集项目结构、依赖、配置等信息

3. **实现成功标准提取**
   - 指导Agent明确提取可验证的成功标准
   - 格式: "demo在localhost:3000运行，返回200状态码"

4. **集成Metis agent**
   - 在提示词中指导调用Metis进行预规划分析
   - 确保需求明确化

#### 验收标准 / Acceptance Criteria

- [ ] 能够正确识别任务类型
- [ ] 能够并行收集上下文
- [ ] 能够提取明确的成功标准
- [ ] Metis集成正常工作
- [ ] 测试用例通过

---

### 任务4: 实现阶段2 - 智能拆解 / Task 4: Implement Phase 2 - Intelligent Decomposition

**优先级**: 🔴 **高 / High**  
**预计时间**: 2-3天

#### 子任务 / Subtasks

1. **集成plan agent**
   - 指导Agent调用plan agent或Prometheus制定计划
   - 确保计划保存到`.sisyphus/plans/`

2. **集成Momus agent审查**
   - 指导Agent调用Momus审查计划
   - 处理REJECT情况，实现计划迭代

3. **实现计划迭代机制**
   - 如果计划被拒绝，指导Agent根据反馈改进
   - 最多迭代3次

4. **确保计划质量**
   - 计划必须包含明确的验证标准
   - 计划必须包含任务依赖关系

#### 验收标准 / Acceptance Criteria

- [ ] 能够生成详细计划
- [ ] Momus审查正常工作
- [ ] 计划迭代机制正常
- [ ] 生成的计划质量符合要求
- [ ] 测试用例通过

---

### 任务5: 创建测试和文档 / Task 5: Create Tests and Documentation

**优先级**: 🟡 **中 / Medium**  
**预计时间**: 1-2天

#### 子任务 / Subtasks

1. **编写单元测试**
   - 状态管理器测试
   - 流程检测测试
   - 各阶段功能测试

2. **编写集成测试**
   - 端到端流程测试
   - 状态持久化测试

3. **更新文档**
   - 更新USAGE_GUIDE.md
   - 创建使用示例
   - 创建故障排查指南

#### 验收标准 / Acceptance Criteria

- [ ] 单元测试覆盖率 > 70%
- [ ] 集成测试通过
- [ ] 文档完整准确

---

## 实施步骤 / Implementation Steps

### 步骤1: 准备环境 / Step 1: Prepare Environment

```bash
# 1. 确保在正确的目录
cd /media/hzm/data_disk/opencode

# 2. 检查依赖
bun install

# 3. 创建新功能目录
mkdir -p oh-my-opencode/src/features/unified-executor
mkdir -p oh-my-opencode/src/hooks/unified-flow
```

### 步骤2: 实现状态管理 / Step 2: Implement State Management

按照任务1的子任务逐步实现。

### 步骤3: 扩展orchestrator-sisyphus / Step 3: Extend orchestrator-sisyphus

按照任务2的子任务逐步实现。

### 步骤4: 实现阶段1和2 / Step 4: Implement Phases 1 and 2

按照任务3和4的子任务逐步实现。

### 步骤5: 测试和文档 / Step 5: Tests and Documentation

按照任务5的子任务逐步实现。

---

## 技术实现细节 / Technical Implementation Details

### 1. 状态管理实现 / State Management Implementation

#### 文件结构 / File Structure

```
oh-my-opencode/src/features/unified-executor/
├── types.ts              # 类型定义
├── state-manager.ts       # 状态管理器
└── index.ts              # 导出
```

#### 类型定义示例 / Type Definition Example

```typescript
// types.ts
export enum ExecutionPhase {
  TASK_PARSING = "task_parsing",
  INTELLIGENT_DECOMPOSITION = "intelligent_decomposition",
  PARALLEL_EXECUTION = "parallel_execution",
  SYNTHESIS_CONSTRUCTION = "synthesis_construction",
  QUALITY_ASSURANCE = "quality_assurance",
  RESULT_DELIVERY = "result_delivery",
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface SuccessCriteria {
  type: string  // "run_demo", "fix_bug", "add_feature", etc.
  description: string
  verification: {
    method: string  // "http_check", "test_run", "manual_check", etc.
    target: string  // URL, command, etc.
    expected: string  // Expected result
  }
}

export interface ExecutionState {
  sessionId: string
  phase: ExecutionPhase
  taskDescription: string
  successCriteria?: SuccessCriteria
  planPath?: string
  todos: string[]  // TODO IDs
  createdAt: string
  updatedAt: string
}
```

### 2. 流程提示词设计 / Flow Prompt Design

#### 阶段1提示词示例 / Phase 1 Prompt Example

```typescript
// unified-flow-prompts.ts
export const PHASE_1_TASK_PARSING_PROMPT = `
## PHASE 1: TASK PARSING

You are in the TASK PARSING phase of the unified execution flow.

### Your Mission
1. **Classify the task type**: Identify if this is "run_demo", "fix_bug", "add_feature", "refactor", etc.
2. **Gather context**: Launch parallel explore/librarian agents to understand the codebase
3. **Extract success criteria**: Define clear, verifiable success criteria

### Step 1: Classify Task Type
Analyze the user's request and classify it into one of these types:
- run_demo: User wants to run/start a demo or service
- fix_bug: User wants to fix a bug
- add_feature: User wants to add a new feature
- refactor: User wants to refactor code
- other: Other types

### Step 2: Gather Context (PARALLEL)
Launch these agents in parallel using background_task:
\`\`\`
background_task(agent="explore", prompt="Find project structure, package.json, startup scripts...")
background_task(agent="explore", prompt="Find dependencies and configuration files...")
background_task(agent="librarian", prompt="Find project documentation and README...")
\`\`\`

### Step 3: Consult Metis (if complex)
For complex tasks, consult Metis agent:
\`\`\`
call_omo_agent(subagent_type="Metis (Plan Consultant)", prompt="Analyze this task: [task description]")
\`\`\`

### Step 4: Extract Success Criteria
Define clear, verifiable success criteria. Examples:
- run_demo: "Service runs on http://localhost:3000, returns 200 OK"
- fix_bug: "Bug no longer occurs when [reproduction steps]"
- add_feature: "Feature works as described: [specific behavior]"

### Output Format
After completing Phase 1, output:
\`\`\`
PHASE 1 COMPLETE

Task Type: [type]
Success Criteria: [criteria]
Context Gathered: [summary]
\`\`\`

Then proceed to Phase 2.
`
```

### 3. Hook实现 / Hook Implementation

#### Hook结构 / Hook Structure

```typescript
// hooks/unified-flow/index.ts
export function createUnifiedFlowHook(
  ctx: PluginInput,
  options?: UnifiedFlowHookOptions
) {
  return {
    handler: async ({ event }: { event: { type: string; properties?: unknown } }) => {
      // 检测是否触发统一流程
      if (event.type === "session.prompt") {
        const props = event.properties as { sessionID: string; parts?: unknown[] }
        const shouldActivate = await detectUnifiedFlow(props.parts)
        
        if (shouldActivate) {
          // 注入流程提示词
          await injectFlowPrompt(ctx, props.sessionID)
        }
      }
      
      // 监控阶段转换
      if (event.type === "session.idle") {
        await checkPhaseTransition(ctx, event.properties)
      }
    }
  }
}

async function detectUnifiedFlow(parts: unknown[]): Promise<boolean> {
  // 检测用户输入是否包含统一流程关键词
  // 如: "运行demo", "帮我", "自动完成"等
  // 返回true如果应该激活统一流程
}
```

---

## 测试计划 / Testing Plan

### 单元测试 / Unit Tests

1. **状态管理器测试**
   - 测试状态保存和恢复
   - 测试状态转换
   - 测试错误处理

2. **流程检测测试**
   - 测试关键词识别
   - 测试流程激活条件

### 集成测试 / Integration Tests

1. **端到端流程测试**
   - 测试完整阶段1-2流程
   - 测试状态持久化
   - 测试计划生成和审查

2. **实际场景测试**
   - 测试"运行demo"场景
   - 测试"修复bug"场景
   - 测试"添加功能"场景

---

## 风险与缓解 / Risks and Mitigation

| 风险 / Risk | 影响 / Impact | 缓解措施 / Mitigation |
|------------|---------------|---------------------|
| 状态管理复杂 | 中 | 使用简单的文件存储，逐步优化 |
| 提示词过长 | 低 | 分阶段注入，避免一次性注入过多 |
| 流程检测不准确 | 中 | 使用明确的关键词，允许用户显式触发 |
| 计划迭代失败 | 中 | 设置最大迭代次数，失败时报告用户 |

---

## 时间表 / Timeline

| 任务 / Task | 开始日期 / Start | 结束日期 / End | 状态 / Status |
|------------|----------------|---------------|--------------|
| 任务1: 状态管理 | Day 1 | Day 3 | ⏳ 待开始 |
| 任务2: 扩展orchestrator | Day 2 | Day 5 | ⏳ 待开始 |
| 任务3: 阶段1实现 | Day 4 | Day 6 | ⏳ 待开始 |
| 任务4: 阶段2实现 | Day 6 | Day 8 | ⏳ 待开始 |
| 任务5: 测试和文档 | Day 8 | Day 9 | ⏳ 待开始 |

**总预计时间**: 9个工作日

---

## 下一步行动 / Next Steps

1. ✅ 创建实施计划文档（本文档）
2. ⏳ 开始实施任务1: 状态管理模块
3. ⏳ 开始实施任务2: 扩展orchestrator-sisyphus
4. ⏳ 开始实施任务3和4: 阶段1和2实现
5. ⏳ 开始实施任务5: 测试和文档

---

**文档版本历史 / Document Version History**:

- v1.0 (2026-01-16): 初始版本，基于审查报告创建

