#!/usr/bin/env bun
/**
 * CLI Example for Claude Agent SDK Adapter
 * 
 * This is a working example that demonstrates how to use the adapter
 * in a real application.
 * 
 * Usage:
 *   bun run cli-example.ts "Your prompt here"
 */

import { query } from "./index"
import type { SDKMessage } from "./message-converter"
import { bootstrap } from "@/cli/bootstrap"

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error("Usage: bun run cli-example.ts <prompt> [--cwd <directory>] [--resume <session-id>]")
    process.exit(1)
  }

  const prompt = args[0]
  let cwd: string | undefined
  let resume: string | undefined

  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--cwd" && i + 1 < args.length) {
      cwd = args[i + 1]
      i++
    } else if (args[i] === "--resume" && i + 1 < args.length) {
      resume = args[i + 1]
      i++
    }
  }

  const targetDir = cwd || process.cwd()

  console.log("Starting query...")
  console.log(`Prompt: ${prompt}`)
  console.log(`Working directory: ${targetDir}`)
  if (resume) console.log(`Resuming session: ${resume}`)
  console.log("")

  // 使用bootstrap初始化OpenCode环境
  await bootstrap(targetDir, async () => {
    try {
      const q = query({
        prompt,
        options: {
          cwd: targetDir,
          resume,
        },
      })

    let messageCount = 0
    let claudeSessionId: string | undefined

    for await (const message of q) {
      messageCount++

      // Capture session ID
      if (message.type === "system" && "subtype" in message && message.subtype === "init") {
        claudeSessionId = message.session_id
        console.log(`[System] Session initialized: ${claudeSessionId}`)
        console.log("")
      }

      // Handle text messages
      if (message.type === "text") {
        process.stdout.write(message.text)
      }

      // Handle tool calls
      if (message.type === "tool-call") {
        console.log("")
        console.log(`[Tool Call] ${message.toolName}`)
        console.log(`  Input: ${JSON.stringify(message.input, null, 2)}`)
        console.log("")
      }

      // Handle tool results
      if (message.type === "tool-result") {
        console.log(`[Tool Result]`)
        if (typeof message.result === "string") {
          console.log(`  Output: ${message.result}`)
        } else {
          console.log(`  Output: ${JSON.stringify(message.result, null, 2)}`)
        }
        console.log("")
      }

      // Handle completion
      if (message.type === "result") {
        console.log("")
        if (message.subtype === "success") {
          console.log("[Success] Query completed successfully")
        } else {
          console.log("[Error] Query completed with error")
        }
      }
    }

      console.log("")
      console.log(`Total messages: ${messageCount}`)
      if (claudeSessionId) {
        console.log(`Session ID: ${claudeSessionId}`)
        console.log(`To resume this session, use: --resume ${claudeSessionId} --cwd ${targetDir}`)
      }
    } catch (error) {
      console.error("Error:", error)
      process.exit(1)
    }
  })
}

// Run if executed directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
}
