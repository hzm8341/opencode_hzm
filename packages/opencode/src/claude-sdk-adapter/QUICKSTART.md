# 快速开始指南 / Quick Start Guide

**版本 / Version:** v1.0  
**日期 / Date:** 2025-01-14

---

## 5分钟快速开始 / 5-Minute Quick Start

### 步骤1：导入适配器 / Step 1: Import Adapter

```typescript
import { query } from "@/claude-sdk-adapter"
```

### 步骤2：创建查询 / Step 2: Create Query

```typescript
const q = query({
  prompt: "Hello, world!",
  options: {
    cwd: process.cwd(),
  },
})
```

### 步骤3：处理消息 / Step 3: Process Messages

```typescript
for await (const message of q) {
  if (message.type === "text") {
    console.log(message.text)
  }
}
```

**完成！/ Done!** 🎉

---

## 完整示例 / Complete Example

```typescript
import { query } from "@/claude-sdk-adapter"

async function main() {
  try {
    const q = query({
      prompt: "List all files in the current directory",
      options: {
        cwd: process.cwd(),
      },
    })

    for await (const message of q) {
      switch (message.type) {
        case "system":
          if ("subtype" in message && message.subtype === "init") {
            console.log("Session initialized:", message.session_id)
          }
          break
        case "text":
          process.stdout.write(message.text)
          break
        case "tool-call":
          console.log(`\n[Tool] ${message.toolName}`)
          break
        case "tool-result":
          console.log(`\n[Result]`, message.result)
          break
        case "result":
          console.log(`\n[${message.subtype === "success" ? "Success" : "Error"}]`)
          break
      }
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
```

---

## 运行CLI示例 / Run CLI Example

```bash
# 基本使用
bun run packages/opencode/src/claude-sdk-adapter/cli-example.ts "Your prompt"

# 指定工作目录
bun run packages/opencode/src/claude-sdk-adapter/cli-example.ts "List files" --cwd /path/to/project

# 恢复会话
bun run packages/opencode/src/claude-sdk-adapter/cli-example.ts "Continue" --resume <session-id>
```

---

## 更多信息 / More Information

- 详细使用指南：查看 [USAGE.md](./USAGE.md)
- API文档：查看 [README.md](./README.md)
- 完整报告：查看 `docs/Claude_Cowork整合最终完成报告_v1.0_20250114_AI.md`

---

**状态 / Status:** ✅ **可以使用 / Ready to Use**
