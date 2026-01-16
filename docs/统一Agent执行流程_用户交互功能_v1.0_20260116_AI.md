# 统一Agent执行流程 - 用户交互功能

**版本**: v1.0  
**日期**: 2026-01-16  
**作者**: AI Assistant

## 概述

用户交互功能是统一Agent执行流程的一个重要优化，它允许系统在需要用户输入时（如sudo密码、确认操作等）自动暂停执行并提示用户，等待用户提供输入后继续执行。

## 功能特性

### 支持的交互类型

1. **密码输入** (`password`)
   - 用于需要sudo密码等敏感输入
   - 输入会被隐藏，不会在日志中显示
   - 适用于需要特权操作的情况

2. **文本输入** (`text`)
   - 用于需要用户提供文本信息
   - 支持默认值
   - 适用于需要额外信息的情况

3. **确认** (`confirm`)
   - 用于需要用户确认的操作
   - 支持默认选择（yes/no）
   - 适用于可能产生副作用的操作

4. **选择** (`select`)
   - 用于需要用户从多个选项中选择
   - 支持单选和多选
   - 适用于需要用户决策的情况

### 自动检测机制

系统会自动检测以下情况：

1. **Sudo密码提示**
   - 检测模式：`"sudo: a password is required"`, `"[sudo] password for"`, `"Password:"`
   - 自动触发：`user_interaction(type="password", ...)`

2. **确认提示**
   - 检测模式：`"Are you sure?"`, `"Continue?"`, `"Y/n"`, `"Proceed?"`
   - 自动触发：`user_interaction(type="confirm", ...)`

3. **交互输入**
   - 检测模式：`"Enter"`, `"Input"`, `"Please provide"`
   - 自动触发：`user_interaction(type="text", ...)`

## 实现细节

### 工具定义

**文件**: `oh-my-opencode/src/tools/user-interaction/tools.ts`

```typescript
export function createUserInteractionTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: USER_INTERACTION_TOOL_DESCRIPTION,
    args: {
      type: tool.schema.enum(["password", "text", "confirm", "select", "multiselect"]),
      message: tool.schema.string().describe("Prompt message to show to user"),
      description: tool.schema.string().optional().describe("Additional description"),
      defaultValue: tool.schema.string().optional().describe("Default value (for text input)"),
      defaultChoice: tool.schema.boolean().optional().describe("Default choice (for confirm)"),
      options: tool.schema.array(...).optional().describe("Options for select/multiselect"),
      timeout: tool.schema.number().optional().describe("Timeout in milliseconds"),
    },
    async execute(args, toolContext) {
      // 格式化并显示请求
      // 暂停执行等待用户输入
      // 返回结果
    },
  })
}
```

### Agent集成

**文件**: `oh-my-opencode/src/agents/orchestrator-sisyphus.ts`

在orchestrator-sisyphus的system prompt中添加了用户交互的说明：

```markdown
**User Interaction**: When commands require user input (sudo password, confirmation, etc.), 
use the `user_interaction` tool to pause execution and prompt the user. 
Always explain why you need the input and what it will be used for.
```

### 统一流程集成

**文件**: `oh-my-opencode/src/agents/unified-flow-prompts.ts`

在Phase 1的prompt中添加了用户交互处理步骤：

```markdown
### Step 5: Handle User Interaction (if needed)

**If you encounter commands that require user input** (e.g., sudo password, confirmation):

1. **Detect the need for user input**
2. **Use the user_interaction tool**
3. **Wait for user response**
```

## 使用示例

### 示例1：Sudo密码

```bash
# 用户命令
bun dev run "帮我安装系统依赖包"

# Agent执行
bash("sudo apt install python3-pip")

# 检测到sudo密码提示
# 自动调用
user_interaction(
  type="password",
  message="This command requires sudo privileges. Please enter your password.",
  description="The following command needs sudo access: sudo apt install python3-pip"
)

# 系统显示提示
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔐 SUDO PASSWORD REQUIRED
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# A command requires sudo privileges to continue.
# Please enter your sudo password in the TUI interface.

# 用户输入密码后，系统继续执行
```

### 示例2：用户确认

```bash
# 用户命令
bun dev run "帮我删除临时文件"

# Agent执行
bash("rm -rf /tmp/old-files")

# 检测到确认提示（如果命令有-i选项）
# 自动调用
user_interaction(
  type="confirm",
  message="This will delete temporary files. Are you sure?",
  description="The following command will delete files: rm -rf /tmp/old-files",
  defaultChoice=false
)

# 用户确认后，系统继续执行
```

### 示例3：用户选择

```bash
# 用户命令
bun dev run "帮我选择数据库类型"

# Agent检测到需要选择
# 自动调用
user_interaction(
  type="select",
  message="Please select a database type:",
  options=[
    { label: "PostgreSQL", value: "postgres" },
    { label: "MySQL", value: "mysql" },
    { label: "SQLite", value: "sqlite" }
  ]
)

# 用户选择后，系统继续执行
```

## 技术架构

### 组件结构

```
oh-my-opencode/src/tools/user-interaction/
├── types.ts          # 类型定义
├── tools.ts          # 工具实现
├── constants.ts      # 常量定义
└── index.ts          # 导出
```

### 工作流程

1. **检测阶段**
   - Agent执行bash命令
   - 检查命令输出
   - 识别用户输入提示

2. **暂停阶段**
   - 调用`user_interaction`工具
   - 格式化并显示提示信息
   - 暂停执行流程

3. **等待阶段**
   - 在TUI界面显示提示
   - 等待用户输入
   - 处理超时（如果设置）

4. **继续阶段**
   - 接收用户输入
   - 验证输入（如果设置验证函数）
   - 继续执行流程

## 未来改进

1. **TUI集成**
   - 当前实现是占位符，需要完整集成OpenCode的TUI系统
   - 需要实现实际的对话框显示和输入处理

2. **状态持久化**
   - 保存交互请求状态
   - 支持会话恢复后继续等待输入

3. **超时处理**
   - 实现超时机制
   - 超时后的默认行为

4. **输入验证**
   - 实现输入验证函数
   - 提供验证错误反馈

5. **多步骤交互**
   - 支持需要多个输入的情况
   - 支持条件输入（根据前面的输入决定是否需要更多输入）

## 相关文档

- **统一流程开发计划**: `docs/统一Agent执行流程开发计划_v1.0_20260116_AI.md`
- **统一流程使用指南**: `docs/统一Agent执行流程_使用指南_v1.0_20260116_AI.md`
- **USAGE_GUIDE**: `USAGE_GUIDE.md` (统一Agent执行流程使用指南章节)

