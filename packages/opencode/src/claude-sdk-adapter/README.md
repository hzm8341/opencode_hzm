# Claude SDK Adapter / Claude SDK 适配器

This directory contains the compatibility layer between Claude Agent SDK and OpenCode.

此目录包含Claude Agent SDK与OpenCode之间的兼容层。

## Overview / 概述

The Claude SDK Adapter provides a bridge between:
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) - The official Anthropic SDK
- **OpenCode** - The OpenCode agent system

Claude SDK适配器提供了以下两者之间的桥梁：
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) - Anthropic官方SDK
- **OpenCode** - OpenCode代理系统

## Components / 组件

### Permission Interceptor / 权限拦截器

**File:** `permission-interceptor.ts`

Bridges the gap between Claude SDK's `canUseTool` callback and OpenCode's `PermissionNext.ask()` system.

在Claude SDK的`canUseTool`回调和OpenCode的`PermissionNext.ask()`系统之间架起桥梁。

### Message Converter / 消息格式转换器

**File:** `message-converter.ts`

Converts between OpenCode's MessageV2 format and Claude Agent SDK's message format.

在OpenCode的MessageV2格式和Claude Agent SDK的消息格式之间转换。

#### Usage / 使用方法

```typescript
import { MessageConverter } from "./message-converter"

const converter = new MessageConverter()

// Convert OpenCode stream to Claude SDK format
for await (const sdkMessage of converter.convertStream(opencodeStream, sessionID)) {
  // Process SDK message
}

// Convert Claude SDK messages to OpenCode format
const opencodeMessage = await converter.convertFromSDK(
  sdkMessages,
  sessionID,
  agentName
)
```

### Async Lock / 异步锁

**File:** `async-lock.ts`

Provides async lock mechanism to prevent race conditions in message conversion.

提供异步锁机制，防止消息转换中的竞态条件。

### Session Mapper / 会话映射器

**File:** `session-mapper.ts`

Manages bidirectional mapping between Claude SDK session IDs and OpenCode session IDs.

管理Claude SDK会话ID和OpenCode会话ID之间的双向映射。

#### Usage / 使用方法

```typescript
import { SessionMapper } from "./session-mapper"

const mapper = new SessionMapper()

// Set mapping
await mapper.setMapping(sessionID, claudeSessionId)

// Get OpenCode session ID from Claude session ID
const sessionID = await mapper.getOpenCodeSessionID(claudeSessionId)

// Get Claude session ID from OpenCode session ID
const claudeSessionId = await mapper.getClaudeSessionID(sessionID)
```

### Permission Interceptor / 权限拦截器

**File:** `permission-interceptor.ts`

Bridges the gap between Claude SDK's `canUseTool` callback and OpenCode's `PermissionNext.ask()` system.

在Claude SDK的`canUseTool`回调和OpenCode的`PermissionNext.ask()`系统之间架起桥梁。

#### Usage / 使用方法

```typescript
import { PermissionInterceptor } from "./permission-interceptor"
import { query } from "@anthropic-ai/claude-agent-sdk"

// Create interceptor
const interceptor = new PermissionInterceptor({
  timeoutMs: 5 * 60 * 1000, // 5 minutes
  logDecisions: true,
})

// Create handler for a session
const sessionID = "your-session-id"
const canUseTool = interceptor.createCanUseToolHandler(sessionID)

// Use with Claude SDK
const q = query({
  prompt: "Your prompt here",
  options: {
    canUseTool,
    // ... other options
  },
})
```

#### Features / 功能

- ✅ Converts OpenCode permission system to Claude SDK format
- ✅ Handles async permission requests
- ✅ Supports timeout and abort signals
- ✅ Maps tool names to permission names (e.g., "write" → "edit")
- ✅ Integrates with OpenCode's agent and session permission rules

- ✅ 将OpenCode权限系统转换为Claude SDK格式
- ✅ 处理异步权限请求
- ✅ 支持超时和取消信号
- ✅ 将工具名称映射到权限名称（例如，"write" → "edit"）
- ✅ 与OpenCode的代理和会话权限规则集成

## Implementation Status / 实施状态

### ✅ Completed / 已完成

- [x] Permission Interceptor implementation
- [x] Message Format Converter
- [x] Async Lock for race condition prevention
- [x] Session Mapper for bidirectional session mapping
- [x] Data Migrator
- [x] Main Adapter (ClaudeAgentSDKAdapter)
- [x] Error handling
- [x] Performance monitoring utilities
- [x] Complete test suite (31 tests, all passing)
- [x] Usage documentation
- [x] CLI example

### 🚧 Ready for Integration / 准备集成

- [x] All core components implemented
- [x] All tests passing
- [x] Documentation complete
- [ ] End-to-end integration testing
- [ ] Production deployment

## Testing / 测试

Run tests with:

```bash
cd packages/opencode
bun test src/claude-sdk-adapter
```

**Test Results / 测试结果:**
- ✅ 31 tests passing
- ✅ 0 failures
- ✅ Core components > 80% coverage

## Usage / 使用

### Basic Example / 基本示例

```typescript
import { query } from "@/claude-sdk-adapter"

const q = query({
  prompt: "Hello, world!",
  options: {
    cwd: process.cwd(),
  },
})

for await (const message of q) {
  console.log(message)
}
```

### CLI Example / CLI示例

```bash
bun run packages/opencode/src/claude-sdk-adapter/cli-example.ts "Your prompt here"
```

See [USAGE.md](./USAGE.md) for detailed usage guide.

## Architecture / 架构

```
Claude Agent SDK
    ↓
Permission Interceptor (this module)
    ↓
OpenCode Permission System
    ↓
User/Configuration
```

## Related Documents / 相关文档

- [Implementation Plan](../../../docs/Claude_Cowork整合漏洞修复实施计划_v1.0_20250114_AI.md)
- [Vulnerability Analysis](../../../docs/Claude_Cowork整合深度分析与改进方案_可行性评估与漏洞分析_v1.0_20250114_AI.md)
