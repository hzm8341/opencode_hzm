# Claude Agent SDK Adapter - 使用指南 / Usage Guide

**版本 / Version:** v1.0  
**日期 / Date:** 2025-01-14

---

## 概述 / Overview

Claude Agent SDK Adapter 提供了一个兼容层，允许使用 Claude Agent SDK 的接口与 OpenCode 的代理系统交互。

The Claude Agent SDK Adapter provides a compatibility layer that allows using Claude Agent SDK's interface to interact with OpenCode's agent system.

---

## 快速开始 / Quick Start

### 基本使用 / Basic Usage

```typescript
import { query } from "@/claude-sdk-adapter"

// 创建查询
const q = query({
  prompt: "Hello, world!",
  options: {
    cwd: "/path/to/project",
  },
})

// 处理消息流
for await (const message of q) {
  if (message.type === "text") {
    console.log("Text:", message.text)
  } else if (message.type === "tool-call") {
    console.log("Tool call:", message.toolName, message.input)
  } else if (message.type === "tool-result") {
    console.log("Tool result:", message.result)
  }
}
```

---

## API 参考 / API Reference

### `query(options: QueryOptions)`

主要的查询函数，兼容 Claude Agent SDK 的接口。

**参数 / Parameters:**

```typescript
interface QueryOptions {
  prompt: string                    // 用户提示
  options?: {
    cwd?: string                    // 工作目录
    resume?: string                 // Claude session ID (用于恢复会话)
    abortController?: AbortController  // 取消控制器
    canUseTool?: (                  // 自定义权限处理器
      toolName: string,
      input: unknown,
      opts: { signal: AbortSignal }
    ) => Promise<PermissionResult>
  }
}
```

**返回 / Returns:**

`AsyncIterable<SDKMessage>` - 异步消息流

**消息类型 / Message Types:**

- `{ type: "system", subtype: "init", session_id?: string }` - 初始化消息
- `{ type: "text", text: string }` - 文本消息
- `{ type: "tool-call", toolName: string, input: unknown, id?: string }` - 工具调用
- `{ type: "tool-result", result: unknown, id?: string }` - 工具结果
- `{ type: "result", subtype: "success" | "error" }` - 完成消息

---

## 使用场景 / Use Cases

### 1. 基本查询 / Basic Query

```typescript
import { query } from "@/claude-sdk-adapter"

async function basicQuery() {
  const q = query({
    prompt: "List all files in the current directory",
    options: {
      cwd: process.cwd(),
    },
  })

  for await (const message of q) {
    console.log(message)
  }
}
```

### 2. 自定义权限控制 / Custom Permission Control

```typescript
import { query } from "@/claude-sdk-adapter"

async function customPermissions() {
  const q = query({
    prompt: "Edit the README file",
    options: {
      cwd: process.cwd(),
      canUseTool: async (toolName, input, { signal }) => {
        if (toolName === "edit" || toolName === "write") {
          // 显示权限请求对话框
          const approved = await showPermissionDialog(toolName, input)
          return approved
            ? { behavior: "allow", updatedInput: input }
            : { behavior: "deny", message: "User denied permission" }
        }
        // 自动批准其他工具
        return { behavior: "allow", updatedInput: input }
      },
    },
  })

  for await (const message of q) {
    // 处理消息
  }
}
```

### 3. 会话恢复 / Session Resume

```typescript
import { query } from "@/claude-sdk-adapter"

async function resumeSession(claudeSessionId: string) {
  const q = query({
    prompt: "Continue from where we left off",
    options: {
      resume: claudeSessionId,
    },
  })

  for await (const message of q) {
    console.log(message)
  }
}
```

### 4. 取消查询 / Cancel Query

```typescript
import { query } from "@/claude-sdk-adapter"

async function cancelableQuery() {
  const abortController = new AbortController()

  // 5秒后取消
  setTimeout(() => {
    abortController.abort()
  }, 5000)

  const q = query({
    prompt: "Long-running task",
    options: {
      abortController,
    },
  })

  try {
    for await (const message of q) {
      console.log(message)
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Query was cancelled")
    } else {
      throw error
    }
  }
}
```

### 5. 收集所有消息 / Collect All Messages

```typescript
import { query } from "@/claude-sdk-adapter"
import type { SDKMessage } from "@/claude-sdk-adapter/message-converter"

async function collectMessages(): Promise<SDKMessage[]> {
  const messages: SDKMessage[] = []

  const q = query({
    prompt: "Analyze the codebase",
    options: {
      cwd: process.cwd(),
    },
  })

  for await (const message of q) {
    messages.push(message)
  }

  return messages
}
```

---

## 高级用法 / Advanced Usage

### 使用适配器类 / Using Adapter Class

```typescript
import { ClaudeAgentSDKAdapter } from "@/claude-sdk-adapter"
import { PermissionInterceptor } from "@/claude-sdk-adapter/permission-interceptor"
import { MessageConverter } from "@/claude-sdk-adapter/message-converter"
import { SessionMapper } from "@/claude-sdk-adapter/session-mapper"

// 创建自定义配置的适配器
const adapter = new ClaudeAgentSDKAdapter({
  permissionInterceptor: new PermissionInterceptor({
    timeoutMs: 10 * 60 * 1000, // 10分钟超时
    logDecisions: true,
  }),
  messageConverter: new MessageConverter(),
  sessionMapper: new SessionMapper(),
})

// 使用适配器
const q = adapter.query({
  prompt: "Your prompt here",
  options: {
    cwd: process.cwd(),
  },
})
```

### 数据迁移 / Data Migration

```typescript
import { DataMigrator } from "@/claude-sdk-adapter/data-migrator"

async function migrateData() {
  const migrator = new DataMigrator()

  // 从Claude-Cowork SQLite数据库迁移
  const result = await migrator.migrateFromSQLite(
    "/path/to/claude-cowork.db",
    "project-id" // 可选，如果不提供会从cwd推断
  )

  console.log(`Migrated ${result.sessionsMigrated} sessions`)
  console.log(`Migrated ${result.messagesMigrated} messages`)
  
  if (result.errors.length > 0) {
    console.error("Migration errors:", result.errors)
  }

  // 验证迁移
  const validation = await migrator.validateMigration("/path/to/claude-cowork.db")
  console.log("Validation result:", validation.valid)
  if (validation.issues.length > 0) {
    console.warn("Validation issues:", validation.issues)
  }
}
```

---

## 错误处理 / Error Handling

### 错误类型 / Error Types

```typescript
import {
  SessionNotFoundError,
  MigrationError,
  PermissionError,
  MessageConversionError,
} from "@/claude-sdk-adapter/errors"

try {
  const q = query({
    prompt: "Test",
    options: {
      resume: "invalid-session-id",
    },
  })
  // ...
} catch (error) {
  if (error instanceof SessionNotFoundError) {
    console.error("Session not found:", error.properties.claudeSessionId)
  } else if (error instanceof MessageConversionError) {
    console.error("Message conversion failed:", error.properties.message)
  } else {
    console.error("Unexpected error:", error)
  }
}
```

---

## 性能优化 / Performance Optimization

### 性能监控 / Performance Monitoring

```typescript
import { PerformanceMonitor } from "@/claude-sdk-adapter/performance"

const monitor = new PerformanceMonitor()
monitor.start()

// ... 执行查询 ...

const metrics = monitor.end()
monitor.logMetrics()

console.log(`Total time: ${metrics.totalTime}ms`)
console.log(`Messages processed: ${metrics.messageCount}`)
```

---

## 最佳实践 / Best Practices

### 1. 错误处理 / Error Handling

始终使用 try-catch 处理错误：

```typescript
try {
  const q = query({ prompt: "..." })
  for await (const message of q) {
    // 处理消息
  }
} catch (error) {
  // 处理错误
  console.error("Query failed:", error)
}
```

### 2. 资源清理 / Resource Cleanup

使用 AbortController 确保资源正确清理：

```typescript
const abortController = new AbortController()

try {
  const q = query({
    prompt: "...",
    options: { abortController },
  })
  // ...
} finally {
  abortController.abort()
}
```

### 3. 权限控制 / Permission Control

实现自定义权限处理器以提供更好的用户体验：

```typescript
const q = query({
  prompt: "...",
  options: {
    canUseTool: async (toolName, input, { signal }) => {
      // 实现你的权限逻辑
      return { behavior: "allow" }
    },
  },
})
```

### 4. 会话管理 / Session Management

保存 claudeSessionId 以便后续恢复：

```typescript
let claudeSessionId: string | undefined

const q = query({ prompt: "..." })

for await (const message of q) {
  if (message.type === "system" && "subtype" in message && message.subtype === "init") {
    claudeSessionId = message.session_id
    // 保存到本地存储
    localStorage.setItem("claudeSessionId", claudeSessionId)
  }
}
```

---

## 故障排除 / Troubleshooting

### 问题：会话恢复失败 / Issue: Session Resume Fails

**解决方案 / Solution:**

确保 claudeSessionId 已正确映射：

```typescript
import { SessionMapper } from "@/claude-sdk-adapter/session-mapper"

const mapper = new SessionMapper()
const sessionID = await mapper.getOpenCodeSessionID(claudeSessionId)

if (!sessionID) {
  console.error("Session mapping not found")
}
```

### 问题：权限请求超时 / Issue: Permission Request Timeout

**解决方案 / Solution:**

增加超时时间：

```typescript
import { PermissionInterceptor } from "@/claude-sdk-adapter/permission-interceptor"

const interceptor = new PermissionInterceptor({
  timeoutMs: 10 * 60 * 1000, // 10分钟
})
```

### 问题：消息转换错误 / Issue: Message Conversion Errors

**解决方案 / Solution:**

检查消息格式并查看日志：

```typescript
import { Log } from "@/util/log"

const log = Log.create({ service: "claude-sdk-adapter" })
// 日志会自动记录转换错误
```

---

## 限制和注意事项 / Limitations and Notes

1. **权限控制 / Permission Control:**
   - OpenCode 的权限系统在工具执行时自动处理
   - `canUseTool` 主要用于兼容性，实际权限由 OpenCode 控制

2. **会话恢复 / Session Resume:**
   - 需要先建立 claudeSessionId 和 sessionID 的映射
   - 映射关系存储在 OpenCode 的存储系统中

3. **消息格式 / Message Format:**
   - 某些 OpenCode 特定的消息类型可能无法完全转换
   - 推理过程（ReasoningPart）会转换为文本消息

4. **性能 / Performance:**
   - 消息转换有轻微开销
   - 大量并发工具调用可能影响性能

---

## 更多资源 / More Resources

- [实施计划](../../../docs/Claude_Cowork整合漏洞修复实施计划_v1.0_20250114_AI.md)
- [完成总结](../../../docs/Claude_Cowork整合漏洞修复完成总结_v1.0_20250114_AI.md)
- [README](./README.md)

---

**文档版本 / Document Version:** v1.0  
**最后更新 / Last Updated:** 2025-01-14
