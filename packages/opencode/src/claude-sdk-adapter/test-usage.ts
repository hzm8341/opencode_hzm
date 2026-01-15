#!/usr/bin/env bun
/**
 * 测试适配器实际使用
 * 测试场景：整理 /home/hzm/Downloads 下面的文件夹和文件
 */

import { query } from "./index"
import type { SDKMessage } from "./message-converter"
import { bootstrap } from "@/cli/bootstrap"

async function main() {
  console.log("🚀 开始测试适配器...")
  console.log("📁 任务：整理 /home/hzm/Downloads 下面的文件夹和文件")
  console.log("")

  const targetDir = "/home/hzm/Downloads"
  
  // 使用bootstrap初始化OpenCode环境
  await bootstrap(targetDir, async () => {

    const prompt = `请帮我整理当前目录下的文件和文件夹。

要求：
1. 先列出当前目录下的所有文件和文件夹
2. 根据文件类型（图片、文档、视频、压缩包等）创建分类文件夹
3. 将文件移动到对应的分类文件夹中
4. 如果有重复文件，请识别并处理
5. 最后显示整理结果

请使用工具来完成这个任务。`

    const q = query({
      prompt,
      options: {
        cwd: targetDir,
      },
    })

    let messageCount = 0
    let claudeSessionId: string | undefined
    let currentText = ""

    for await (const message of q) {
      messageCount++

      // 捕获会话ID
      if (message.type === "system" && "subtype" in message && message.subtype === "init") {
        claudeSessionId = message.session_id
        console.log(`[系统] 会话已初始化: ${claudeSessionId}`)
        console.log("")
      }

      // 处理文本消息
      if (message.type === "text") {
        currentText += message.text
        // 实时输出文本（流式）
        process.stdout.write(message.text)
      }

      // 处理工具调用
      if (message.type === "tool-call") {
        console.log("") // 换行
        console.log(`\n[工具调用] ${message.toolName}`)
        if (message.input && typeof message.input === "object") {
          console.log(`  输入: ${JSON.stringify(message.input, null, 2)}`)
        }
      }

      // 处理工具结果
      if (message.type === "tool-result") {
        console.log(`[工具结果]`)
        if (typeof message.result === "string") {
          // 如果结果很长，只显示前500字符
          const result = message.result.length > 500 
            ? message.result.substring(0, 500) + "..."
            : message.result
          console.log(`  ${result}`)
        } else {
          console.log(`  ${JSON.stringify(message.result, null, 2)}`)
        }
        console.log("")
      }

      // 处理完成消息
      if (message.type === "result") {
        console.log("")
        if (message.subtype === "success") {
          console.log("✅ [成功] 任务完成")
        } else {
          console.log("❌ [错误] 任务失败")
        }
      }
    }

    console.log("")
    console.log("=".repeat(60))
    console.log("📊 统计信息:")
    console.log(`  总消息数: ${messageCount}`)
    if (claudeSessionId) {
      console.log(`  会话ID: ${claudeSessionId}`)
    }
    console.log("=".repeat(60))
  })
}

async function runTest() {
  try {
    await main()
  } catch (error) {
    console.error("")
    console.error("❌ 错误:", error)
    if (error instanceof Error) {
      console.error("   消息:", error.message)
      if (error.stack) {
        console.error("   堆栈:", error.stack)
      }
    }
    process.exit(1)
  }
}

// 运行测试
if (import.meta.main) {
  runTest()
}
