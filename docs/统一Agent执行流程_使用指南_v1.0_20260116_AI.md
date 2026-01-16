# 统一Agent执行流程 - 使用指南
# Unified Agent Execution Flow - Usage Guide

**版本 / Version**: v1.0  
**日期 / Date**: 2026-01-16  
**状态 / Status**: ✅ 可用 / Available

---

## 快速开始 / Quick Start

### 基本使用 / Basic Usage

统一流程系统已集成到OpenCode，可以通过以下方式使用：

**The unified flow system has been integrated into OpenCode and can be used as follows:**

```bash
# 方式1: 自动触发（推荐）
cd /path/to/your/project
bun dev run "帮我将当前的项目demo运行起来"

# 方式2: 显式触发
bun dev run "unified-flow: 运行demo"

# 方式3: 使用oh-my-opencode命令
bunx oh-my-opencode run "帮我将当前的项目demo运行起来"
```

---

## 触发关键词 / Trigger Keywords

系统会自动检测以下关键词并触发统一流程：

**The system automatically detects the following keywords to trigger unified flow:**

### 中文关键词 / Chinese Keywords

- "帮我"
- "帮我将"
- "运行demo"
- "运行demo起来"
- "启动"
- "帮我运行"
- "帮我启动"
- "自动完成"
- "完整流程"

### 英文关键词 / English Keywords

- "unified-flow"
- "auto complete"
- "run demo"
- "help me"

### 模式匹配 / Pattern Matching

系统还支持正则表达式模式匹配：

- `/帮我.*(运行|启动|完成|实现)/`
- `/将.*(运行|启动)起来/`
- `/自动.*(完成|实现|处理)/`

---

## 执行流程 / Execution Flow

### 阶段1: 任务解析 / Phase 1: Task Parsing

**自动执行**:
1. 识别任务类型（运行demo、修复bug、添加功能等）
2. 并行收集上下文（explore/librarian agents）
3. 提取成功标准
4. 咨询Metis（如果需要）

**输出**:
- 任务类型
- 成功标准（可验证的指标）
- 上下文摘要

### 阶段2: 智能拆解 / Phase 2: Intelligent Decomposition

**自动执行**:
1. 创建详细计划（plan/Prometheus agent）
2. Momus审查计划
3. 计划迭代（如果被拒绝）

**输出**:
- 工作计划（`.sisyphus/plans/{task-name}.md`）
- 任务清单
- 计划状态（已批准/待审查）

### 阶段3-6: 待实现 / Phases 3-6: To Be Implemented

- 阶段3: 并行执行
- 阶段4: 综合构建
- 阶段5: 质量保证
- 阶段6: 结果交付

---

## 配置 / Configuration

### 启用/禁用统一流程 / Enable/Disable Unified Flow

在 `oh-my-opencode.json` 中配置：

```json
{
  "disabled_hooks": []  // 不包含 "unified-flow" 则默认启用
}
```

禁用统一流程：

```json
{
  "disabled_hooks": ["unified-flow"]
}
```

### 自定义触发关键词 / Custom Trigger Keywords

目前不支持自定义关键词，但可以通过修改代码实现。

---

## 状态管理 / State Management

### 状态文件位置 / State File Location

执行状态保存在：
```
.sisyphus/execution-state/{session-id}.json
```

### 状态内容 / State Content

状态文件包含：
- 当前阶段
- 任务描述
- 成功标准
- 计划路径
- TODO列表
- 阶段结果

### 状态恢复 / State Recovery

如果会话中断，系统会自动恢复状态：
- 从状态文件读取
- 继续执行当前阶段
- 保持上下文

---

## 使用示例 / Usage Examples

### 示例1: 运行Demo / Example 1: Run Demo

```bash
cd /path/to/your/project
bun dev run "帮我将当前的项目demo运行起来"
```

**预期流程**:
1. 系统检测到"帮我"关键词，触发统一流程
2. Phase 1: 识别任务类型为"run_demo"，收集项目信息
3. Phase 2: 创建计划（检查依赖、配置环境、启动服务）
4. Phase 3-6: 待实现

---

### 示例2: 修复Bug / Example 2: Fix Bug

```bash
cd /path/to/your/project
bun dev run "修复登录功能中的空指针异常"
```

**预期流程**:
1. 系统检测到"修复"关键词，触发统一流程
2. Phase 1: 识别任务类型为"fix_bug"，收集相关代码
3. Phase 2: 创建计划（定位bug、分析原因、修复、测试）
4. Phase 3-6: 待实现

---

### 示例3: 添加功能 / Example 3: Add Feature

```bash
cd /path/to/your/project
bun dev run "添加用户头像上传功能"
```

**预期流程**:
1. 系统检测到"添加"关键词，触发统一流程
2. Phase 1: 识别任务类型为"add_feature"，收集相关代码和文档
3. Phase 2: 创建计划（设计API、实现后端、实现前端、测试）
4. Phase 3-6: 待实现

---

## 故障排查 / Troubleshooting

### 问题1: 统一流程未触发

**症状**: 输入包含关键词但未触发统一流程

**解决方案**:
1. 检查Hook是否启用
   ```bash
   # 检查配置
   cat ~/.config/opencode/oh-my-opencode.json
   ```

2. 检查日志
   ```bash
   # 查看OpenCode日志
   bun dev run --print-logs "测试"
   ```

3. 显式触发
   ```bash
   bun dev run "unified-flow: 你的任务"
   ```

---

### 问题2: 阶段未转换

**症状**: Phase 1完成后未自动转换到Phase 2

**可能原因**:
- 成功标准未正确提取
- 状态文件未更新
- Agent输出格式不符合预期

**解决方案**:
1. 检查状态文件
   ```bash
   cat .sisyphus/execution-state/{session-id}.json
   ```

2. 检查Agent输出
   - 确保输出包含"PHASE 1 COMPLETE"标记
   - 确保成功标准格式正确

3. 手动触发阶段转换（待实现）

---

### 问题3: 提示词未注入

**症状**: 未看到阶段提示词

**解决方案**:
1. 检查消息历史
   - 查看是否有 `<unified-flow-phase>` 标签

2. 检查日志
   ```bash
   # 查看Hook日志
   bun dev run --print-logs "测试"
   ```

3. 验证Hook注册
   - 确保Hook在 `oh-my-opencode.json` 中未禁用

---

## 高级用法 / Advanced Usage

### 查看执行状态 / View Execution State

```bash
# 查看状态文件
cat .sisyphus/execution-state/{session-id}.json
```

### 手动恢复状态 / Manual State Recovery

如果状态文件损坏，可以手动编辑或删除后重新创建。

### 调试模式 / Debug Mode

启用详细日志：

```bash
export OPENCODE_LOG_LEVEL=DEBUG
bun dev run "你的任务"
```

---

## 限制和已知问题 / Limitations and Known Issues

### 当前限制 / Current Limitations

1. **阶段转换检测**
   - 需要Agent输出特定格式
   - 可能不够准确
   - 需要进一步完善

2. **Phase 3-6**
   - 提示词仅为占位符
   - 功能待实现

3. **端到端验证**
   - 尚未实现
   - 这是核心功能，需要重点开发

### 已知问题 / Known Issues

1. 阶段转换可能不够及时
2. 成功标准提取可能不准确
3. 计划审查状态检测需要改进

---

## 最佳实践 / Best Practices

### 1. 明确的任务描述

**好的示例**:
```bash
bun dev run "帮我将当前的项目demo运行起来"
```

**不好的示例**:
```bash
bun dev run "做点什么"
```

### 2. 等待阶段完成

每个阶段需要时间完成，请耐心等待。系统会在阶段完成时自动转换。

### 3. 检查状态文件

如果遇到问题，检查状态文件了解当前进度。

---

## 相关文档 / Related Documents

- `统一Agent执行流程开发计划_v1.0_20260116_AI.md` - 完整开发计划
- `统一Agent执行流程开发计划_技术审查报告_v1.0_20260116_AI.md` - 技术审查
- `统一Agent执行流程_阶段1实施计划_v1.0_20260116_AI.md` - 实施计划
- `统一Agent执行流程_实施进度_v1.1_20260116_AI.md` - 进度报告
- `统一Agent执行流程_完成总结_v1.0_20260116_AI.md` - 完成总结

---

**文档版本历史 / Document Version History**:

- v1.0 (2026-01-16): 初始版本

---

**最后更新 / Last Updated**: 2026-01-16

