# 统一Agent执行流程开发计划 - 技术审查报告
# Unified Agent Execution Flow Development Plan - Technical Review Report

**版本 / Version**: v1.0  
**日期 / Date**: 2026-01-16  
**审查者 / Reviewer**: AI Assistant  
**审查对象 / Review Target**: `统一Agent执行流程开发计划_v1.0_20260116_AI.md`

---

## 执行摘要 / Executive Summary

### 总体评估 / Overall Assessment

**可行性评级**: ⭐⭐⭐⭐ (4/5) - **高度可行 / Highly Feasible**

本计划的技术方案**整体可行**，大部分设计基于OpenCode现有架构，具有良好的实施基础。主要需要关注的是**端到端验证系统**的实现，这是计划的核心创新点，也是最大的技术挑战。

**The technical approach of this plan is overall feasible, with most designs based on OpenCode's existing architecture and a solid foundation for implementation. The main focus should be on the implementation of the end-to-end verification system, which is the core innovation of the plan and the biggest technical challenge.**

### 关键发现 / Key Findings

✅ **优势 / Strengths**:
- 充分利用现有架构和工具
- 6步流程设计清晰合理
- Agent协调机制已有基础
- 自动退出机制已存在

⚠️ **需要关注 / Concerns**:
- 端到端验证系统需要从零实现
- 状态机管理需要明确设计
- 流程阶段转换的自动化程度
- 验证策略的可扩展性

---

## 详细技术审查 / Detailed Technical Review

### 1. 统一入口Agent设计 / Unified Entry Agent Design

#### 审查结果 / Review Result: ✅ **可行 / Feasible**

**现有基础 / Existing Foundation**:
- `orchestrator-sisyphus` agent已经具备强大的协调能力
- 支持任务分解、Agent分配、并行执行
- 已有完整的提示词和工具集成

**计划方案评估 / Plan Assessment**:

**方案A: 扩展现有orchestrator-sisyphus** (推荐) ✅
- **可行性**: 高
- **优点**: 
  - 复用现有逻辑，减少重复代码
  - 保持架构一致性
  - 利用已有的协调机制
- **实施建议**:
  - 在`orchestrator-sisyphus.ts`中添加6步流程的提示词指导
  - 通过系统提示词注入实现流程控制
  - 使用hook机制监控流程阶段

**方案B: 创建新的unified-executor agent** ⚠️
- **可行性**: 中
- **缺点**: 
  - 需要重新实现大量协调逻辑
  - 可能与现有系统产生冲突
  - 维护成本较高

**推荐方案**: **方案A** - 扩展现有orchestrator-sisyphus

**实施建议 / Implementation Recommendations**:

1. **通过提示词注入实现流程控制**:
   ```typescript
   // 在hook中根据执行阶段注入不同的提示词
   function injectPhasePrompt(phase: ExecutionPhase): string {
     switch(phase) {
       case ExecutionPhase.TASK_PARSING:
         return TASK_PARSING_PROMPT
       case ExecutionPhase.INTELLIGENT_DECOMPOSITION:
         return DECOMPOSITION_PROMPT
       // ...
     }
   }
   ```

2. **使用状态持久化跟踪流程**:
   - 利用现有的`.sisyphus/`目录结构
   - 在`.sisyphus/execution-state/`中存储流程状态
   - 通过hook读取和更新状态

3. **集成现有的boulder-state机制**:
   - 复用`oh-my-opencode/src/features/boulder-state/`中的状态管理
   - 扩展支持6步流程状态

---

### 2. 流程状态机 / Flow State Machine

#### 审查结果 / Review Result: ⚠️ **需要明确设计 / Needs Clear Design**

**现有基础 / Existing Foundation**:
- OpenCode有会话状态管理（`session.status()`）
- oh-my-opencode有boulder-state机制用于计划跟踪
- 有TODO状态管理（pending/in_progress/completed/cancelled）

**计划方案评估 / Plan Assessment**:

**状态机设计** ✅ **可行**:
- TypeScript枚举定义清晰
- 状态转换逻辑合理
- 状态持久化方案可行

**需要明确的问题 / Questions to Clarify**:

1. **状态转换的触发机制**:
   - ❓ 如何自动检测阶段完成？
   - ❓ 是否需要显式的阶段转换命令？
   - 💡 **建议**: 通过hook监控TODO完成和Agent输出，自动判断阶段完成

2. **状态持久化的位置**:
   - 计划建议: `.opencode/execution-state/{session-id}.json`
   - ✅ 可行，但建议使用`.sisyphus/execution-state/`保持一致性

3. **状态恢复机制**:
   - ❓ 如何从中断中恢复？
   - 💡 **建议**: 在hook中实现状态恢复逻辑

**实施建议 / Implementation Recommendations**:

```typescript
// 建议的状态管理实现
interface ExecutionStateManager {
  // 读取当前阶段
  getCurrentPhase(sessionID: string): Promise<ExecutionPhase>
  
  // 转换到下一阶段
  transitionToNextPhase(sessionID: string): Promise<void>
  
  // 检查阶段完成条件
  checkPhaseCompletion(sessionID: string, phase: ExecutionPhase): Promise<boolean>
  
  // 持久化状态
  persistState(sessionID: string, state: ExecutionState): Promise<void>
  
  // 恢复状态
  restoreState(sessionID: string): Promise<ExecutionState | null>
}
```

**实施位置 / Implementation Location**:
- 新建: `oh-my-opencode/src/features/unified-executor/state-manager.ts`
- 或扩展: `oh-my-opencode/src/features/boulder-state/` 支持流程状态

---

### 3. 端到端验证系统 / End-to-End Verification System

#### 审查结果 / Review Result: ⚠️ **核心创新，需要重点实现 / Core Innovation, Needs Focused Implementation**

**现有基础 / Existing Foundation**:
- ✅ LSP诊断工具（`lsp_diagnostics`）
- ✅ 构建和测试验证（通过bash命令）
- ✅ 代码质量检查
- ❌ **缺少**: 功能性的端到端验证（如服务运行验证）

**计划方案评估 / Plan Assessment**:

**验证策略注册表设计** ✅ **可行**:
- 接口设计清晰
- 可扩展性好
- 符合开闭原则

**内置验证策略** ⚠️ **需要实现**:

1. **运行Demo验证策略** - **关键挑战**:
   ```typescript
   // 计划中的实现示例
   class RunDemoVerificationStrategy {
     async verify(context: VerificationContext): Promise<VerificationResult> {
       // 1. 查找启动命令 - ✅ 可行（读取package.json等）
       // 2. 执行启动命令 - ⚠️ 需要后台进程管理
       // 3. 等待服务启动 - ⚠️ 需要轮询机制
       // 4. 健康检查 - ✅ 可行（HTTP请求）
       // 5. 功能验证 - ⚠️ 需要根据项目类型定制
     }
   }
   ```

   **技术挑战 / Technical Challenges**:
   - **进程管理**: 需要启动服务并保持运行
   - **端口检测**: 需要检测服务是否真的在监听
   - **超时处理**: 服务启动可能需要时间
   - **清理机制**: 验证完成后需要清理进程

   **解决方案 / Solutions**:
   - 使用`child_process`启动服务
   - 使用`net`模块检测端口监听
   - 使用现有的`with_server.py`模式（参考`skills/webapp-testing/scripts/with_server.py`）
   - 集成到现有的background-task机制

2. **修复Bug验证策略** ✅ **相对简单**:
   - 复现原始bug场景 - 通过bash命令
   - 验证bug不再出现 - 检查输出/日志
   - ✅ 可行性高

3. **添加功能验证策略** ⚠️ **需要定制**:
   - 测试新功能 - 需要根据功能类型定制
   - 验证功能符合需求 - 需要明确的验收标准
   - ⚠️ 可能需要AI辅助验证

**实施建议 / Implementation Recommendations**:

1. **创建验证工具模块**:
   ```
   oh-my-opencode/src/tools/verification/
   ├── strategies/
   │   ├── run-demo-strategy.ts
   │   ├── fix-bug-strategy.ts
   │   └── add-feature-strategy.ts
   ├── registry.ts
   └── context.ts
   ```

2. **集成到orchestrator-sisyphus**:
   - 在阶段5（质量保证）自动调用验证策略
   - 通过工具调用方式实现，而非硬编码

3. **利用现有工具**:
   - 使用`bash`工具执行命令
   - 使用`interactive_bash`进行交互式验证
   - 使用`playwright` skill进行前端验证（如果可用）

4. **进程管理方案**:
   ```typescript
   // 建议使用类似with_server.py的模式
   class ServiceManager {
     async startService(command: string, cwd: string): Promise<ServiceHandle> {
       // 启动服务
       // 返回进程句柄
     }
     
     async waitForService(handle: ServiceHandle, port: number, timeout: number): Promise<boolean> {
       // 轮询检测端口
     }
     
     async stopService(handle: ServiceHandle): Promise<void> {
       // 清理进程
     }
   }
   ```

---

### 4. Agent协调机制 / Agent Coordination Mechanism

#### 审查结果 / Review Result: ✅ **完全可行 / Fully Feasible**

**现有基础 / Existing Foundation**:
- ✅ `sisyphus_task`工具已实现
- ✅ `background_task`工具支持并行执行
- ✅ `call_omo_agent`工具支持Agent调用
- ✅ BackgroundManager管理后台任务
- ✅ 已有完整的任务完成检测机制

**计划方案评估 / Plan Assessment**:

**并行执行设计** ✅ **完全可行**:
- 计划中的代码示例与现有实现高度一致
- 可以直接使用现有的`sisyphus_task`工具
- BackgroundManager已经实现了任务跟踪和完成检测

**实施建议 / Implementation Recommendations**:

1. **直接使用现有工具**:
   ```typescript
   // 计划中的代码可以直接使用
   sisyphus_task({
     category: selectCategory(todo),
     prompt: todo.description,
     background: canRunInBackground(todo)
   })
   ```

2. **利用现有的完成检测**:
   - `oh-my-opencode/src/cli/run/completion.ts`已经实现了TODO和子会话完成检测
   - 可以直接复用`checkCompletionConditions`函数

3. **Agent选择逻辑**:
   - 计划中的选择规则可以实现在提示词中
   - 或创建工具函数辅助选择

---

### 5. 自动退出机制 / Automatic Exit Mechanism

#### 审查结果 / Review Result: ✅ **已存在，可直接使用 / Already Exists, Can Use Directly**

**现有基础 / Existing Foundation**:
- ✅ `oh-my-opencode/src/cli/run/runner.ts`已实现等待完成机制
- ✅ `checkCompletionConditions`检查TODO和子会话完成
- ✅ 支持超时退出
- ✅ 支持优雅退出

**计划方案评估 / Plan Assessment**:

**自动退出设计** ✅ **已完全实现**:
- 计划中描述的自动退出机制已经存在于`oh-my-opencode run`命令中
- 只需要确保6步流程正确设置TODO，系统会自动等待完成

**实施建议 / Implementation Recommendations**:

1. **直接使用现有机制**:
   - 使用`bunx oh-my-opencode run`命令
   - 或集成到OpenCode原生的`bun dev run`命令

2. **确保TODO正确设置**:
   - 每个阶段创建相应的TODO
   - 阶段完成时标记TODO为完成
   - 系统会自动检测并退出

3. **扩展完成条件**（如果需要）:
   - 可以在`checkCompletionConditions`中添加端到端验证检查
   - 确保验证通过后才退出

---

### 6. 阶段1: 任务解析 / Phase 1: Task Parsing

#### 审查结果 / Review Result: ✅ **可行，需要提示词优化 / Feasible, Needs Prompt Optimization**

**现有基础 / Existing Foundation**:
- ✅ `Metis` agent已实现预规划分析
- ✅ `explore` agent支持代码库探索
- ✅ `librarian` agent支持文档查找
- ✅ `oracle` agent支持架构分析
- ✅ `background_task`支持并行执行

**计划方案评估 / Plan Assessment**:

**意图分类** ✅ **可行**:
- orchestrator-sisyphus已有意图分类逻辑（Phase 0 - Intent Gate）
- 可以扩展支持更多任务类型

**上下文收集** ✅ **完全可行**:
- 计划中的并行explore/librarian调用可以直接实现
- 使用`background_task`工具并行启动

**需求明确化** ✅ **可行**:
- Metis agent已实现预规划分析功能
- 可以直接调用

**实施建议 / Implementation Recommendations**:

1. **优化orchestrator-sisyphus提示词**:
   - 在Phase 0中添加任务类型识别
   - 明确成功标准提取要求

2. **集成Metis调用**:
   ```typescript
   // 在提示词中指导调用Metis
   "For complex tasks, first consult Metis agent to clarify requirements:
   call_omo_agent(subagent_type='Metis (Plan Consultant)', prompt='...')"
   ```

---

### 7. 阶段2: 智能拆解 / Phase 2: Intelligent Decomposition

#### 审查结果 / Review Result: ✅ **完全可行 / Fully Feasible**

**现有基础 / Existing Foundation**:
- ✅ `plan` agent已实现规划功能
- ✅ `Prometheus` agent（Oh My OpenCode）支持详细规划
- ✅ `Momus` agent已实现计划审查
- ✅ 计划文件存储在`.sisyphus/plans/`

**计划方案评估 / Plan Assessment**:

**任务分解** ✅ **完全可行**:
- plan agent或Prometheus可以直接使用
- 已有完整的计划生成机制

**计划审查** ✅ **完全可行**:
- Momus agent已实现完整的审查逻辑
- 支持OKAY/REJECT判断
- 支持详细的改进建议

**实施建议 / Implementation Recommendations**:

1. **使用现有Agent**:
   - 复杂任务使用Prometheus
   - 简单任务使用plan agent
   - 自动调用Momus进行审查

2. **计划迭代机制**:
   ```typescript
   // 伪代码
   let plan = await createPlan(task)
   let review = await momus.review(plan)
   
   while (review.verdict === 'REJECT') {
     plan = await refinePlan(plan, review.feedback)
     review = await momus.review(plan)
   }
   ```

---

### 8. 阶段3-6: 执行、构建、质量保证、交付 / Phases 3-6: Execution, Construction, QA, Delivery

#### 审查结果 / Review Result: ✅ **大部分可行，部分需要实现 / Mostly Feasible, Some Implementation Needed**

**现有基础 / Existing Foundation**:
- ✅ orchestrator-sisyphus已实现执行协调
- ✅ 有完整的验证机制（lsp_diagnostics、测试等）
- ✅ 有文档生成能力（document-writer agent）
- ⚠️ 缺少端到端功能验证

**计划方案评估 / Plan Assessment**:

**阶段3: 并行执行** ✅ **完全可行**:
- 已有完整的实现基础

**阶段4: 综合构建** ✅ **可行**:
- 主要通过Agent协调实现
- 依赖处理可以通过bash工具实现

**阶段5: 质量保证** ⚠️ **需要扩展**:
- 代码质量检查 ✅ 已实现
- 功能验证 ✅ 部分实现（测试）
- **端到端验证** ❌ 需要实现（核心创新点）

**阶段6: 结果交付** ✅ **可行**:
- document-writer agent可以生成报告
- 自动退出机制已存在

---

## 关键技术挑战与解决方案 / Key Technical Challenges and Solutions

### 挑战1: 端到端验证系统实现 / Challenge 1: End-to-End Verification System

**挑战描述 / Challenge Description**:
- 需要实现服务启动、端口检测、健康检查等功能验证
- 需要支持多种项目类型（Web、CLI、API等）
- 需要进程管理和清理机制

**解决方案 / Solution**:

1. **参考现有实现**:
   - 研究`skills/webapp-testing/scripts/with_server.py`
   - 参考background-task的进程管理

2. **分阶段实现**:
   - 第一阶段: 实现基础的HTTP服务验证
   - 第二阶段: 扩展支持CLI、API等
   - 第三阶段: 支持自定义验证策略

3. **工具化设计**:
   - 创建`verification`工具模块
   - 通过工具调用而非硬编码
   - 支持用户扩展

### 挑战2: 流程状态管理 / Challenge 2: Flow State Management

**挑战描述 / Challenge Description**:
- 如何自动检测阶段完成？
- 如何实现状态转换？
- 如何支持中断恢复？

**解决方案 / Solution**:

1. **基于TODO的状态检测**:
   - 每个阶段创建阶段性的TODO
   - 阶段完成时标记TODO
   - 通过hook检测TODO完成，自动转换阶段

2. **状态持久化**:
   - 使用`.sisyphus/execution-state/`存储状态
   - 支持会话恢复

3. **提示词驱动**:
   - 通过系统提示词指导Agent按阶段工作
   - 减少硬编码的状态机逻辑

### 挑战3: 验证策略的可扩展性 / Challenge 3: Extensibility of Verification Strategies

**挑战描述 / Challenge Description**:
- 如何支持用户自定义验证策略？
- 如何适配不同的项目类型？

**解决方案 / Solution**:

1. **插件化设计**:
   - 验证策略作为可插拔模块
   - 支持通过配置文件注册

2. **项目类型检测**:
   - 自动检测项目类型（通过package.json、配置文件等）
   - 选择对应的验证策略

3. **默认策略 + 自定义**:
   - 提供常见场景的默认策略
   - 允许用户覆盖或扩展

---

## 实施优先级建议 / Implementation Priority Recommendations

### 高优先级 / High Priority (必须实现 / Must Implement)

1. ✅ **阶段1-2: 任务解析和智能拆解**
   - 基础功能，已有大部分实现
   - 只需要优化提示词和集成

2. ✅ **阶段3: 并行执行**
   - 完全可行，直接使用现有工具

3. ⚠️ **阶段5: 端到端验证（核心功能）**
   - 这是计划的核心创新
   - 需要重点实现

### 中优先级 / Medium Priority (重要功能 / Important Features)

4. ✅ **阶段4: 综合构建**
   - 主要通过Agent协调实现
   - 相对简单

5. ✅ **阶段6: 结果交付**
   - 已有基础，需要格式化优化

6. ⚠️ **流程状态机**
   - 需要明确设计，但可以通过提示词简化

### 低优先级 / Low Priority (优化功能 / Optimization Features)

7. **验证策略扩展**
   - 先实现基础策略，再扩展

8. **用户自定义验证**
   - 后续版本实现

---

## 风险评估与缓解 / Risk Assessment and Mitigation

| 风险 / Risk | 影响 / Impact | 概率 / Probability | 缓解措施 / Mitigation |
|------------|---------------|-------------------|----------------------|
| 端到端验证实现复杂 | 高 | 中 | 分阶段实现，先支持常见场景 |
| 流程状态管理复杂 | 中 | 低 | 使用提示词驱动，减少硬编码 |
| Agent协调性能问题 | 低 | 低 | 已有优化机制，并行执行 |
| 验证策略不够完善 | 中 | 中 | 先实现核心策略，逐步扩展 |
| 用户学习曲线 | 低 | 中 | 提供详细文档和示例 |

---

## 修改建议 / Modification Recommendations

### 建议1: 简化状态机实现 / Suggestion 1: Simplify State Machine Implementation

**当前方案**: 硬编码的状态机
**建议方案**: 提示词驱动的阶段管理

**理由**: 
- 减少代码复杂度
- 更灵活，易于调整
- 符合OpenCode的设计哲学（提示词优先）

**实施**: 
- 通过系统提示词指导Agent按阶段工作
- 使用TODO标记阶段完成
- 通过hook检测阶段转换

### 建议2: 分阶段实现验证系统 / Suggestion 2: Phased Implementation of Verification System

**当前方案**: 一次性实现所有验证策略
**建议方案**: 分阶段实现

**第一阶段**: HTTP服务验证（运行demo）
**第二阶段**: CLI验证
**第三阶段**: 自定义验证策略

**理由**: 
- 降低实施风险
- 更快交付核心功能
- 逐步完善

### 建议3: 利用现有CLI机制 / Suggestion 3: Leverage Existing CLI Mechanism

**当前方案**: 可能需要新的CLI命令
**建议方案**: 扩展现有`oh-my-opencode run`命令

**理由**: 
- 已有完整的等待完成机制
- 用户熟悉现有命令
- 减少维护成本

**实施**: 
- 添加`--unified-flow`标志启用6步流程
- 或通过关键词自动检测（如包含"运行demo"）

---

## 总结与建议 / Summary and Recommendations

### 总体评价 / Overall Assessment

本计划**技术方案高度可行**，大部分设计基于现有架构，实施风险较低。主要需要关注的是**端到端验证系统**的实现，这是计划的核心创新点。

**This plan's technical approach is highly feasible, with most designs based on existing architecture and low implementation risk. The main focus should be on the implementation of the end-to-end verification system, which is the core innovation of the plan.**

### 关键建议 / Key Recommendations

1. ✅ **采用方案A**: 扩展现有orchestrator-sisyphus，而非创建新agent
2. ✅ **分阶段实施**: 先实现核心功能（阶段1-3和端到端验证），再完善细节
3. ✅ **提示词驱动**: 使用提示词管理流程阶段，减少硬编码
4. ✅ **复用现有机制**: 充分利用现有的工具、hook、CLI机制
5. ⚠️ **重点实现验证系统**: 这是核心创新，需要重点投入

### 下一步行动 / Next Steps

1. **确认技术方案**: 根据本审查报告调整计划（如需要）
2. **开始阶段1实施**: 实现任务解析和智能拆解
3. **并行开发验证系统**: 同时开始端到端验证系统的设计和实现
4. **迭代优化**: 根据实施情况调整后续阶段

---

**审查完成时间 / Review Completion Time**: 2026-01-16  
**审查者签名 / Reviewer Signature**: AI Assistant  
**审查状态 / Review Status**: ✅ **通过，建议开始实施 / Approved, Ready for Implementation**

---

**附录 / Appendix**:

### 相关代码位置 / Related Code Locations

- orchestrator-sisyphus: `oh-my-opencode/src/agents/orchestrator-sisyphus.ts`
- 完成检测: `oh-my-opencode/src/cli/run/completion.ts`
- 后台任务管理: `oh-my-opencode/src/features/background-agent/manager.ts`
- 状态管理: `oh-my-opencode/src/features/boulder-state/`
- 验证参考: `skills/webapp-testing/scripts/with_server.py`

### 参考文档 / Reference Documents

- OpenCode架构文档
- Oh My OpenCode使用指南
- USAGE_GUIDE.md

