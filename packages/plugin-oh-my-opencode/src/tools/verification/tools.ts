/**
 * Verification Tool
 * 
 * Tool for verifying task completion using end-to-end verification strategies.
 */

import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"
import { executeVerification } from "./engine"
import type { VerificationContext } from "../../features/unified-executor/types"
import { log } from "../../shared/logger"

const VERIFICATION_TOOL_DESCRIPTION = `Verify task completion using end-to-end verification strategies.

This tool automatically selects and executes the appropriate verification strategy based on the task type and success criteria.

**Supported Task Types:**
- run_demo: Verify that a demo/service is running
- fix_bug: Verify that a bug has been fixed
- add_feature: Verify that a feature has been implemented
- refactor: Verify that refactoring is complete

**Verification Methods:**
- http_check: HTTP health check
- port_check: Port listening check
- test_run: Run tests
- command_check: Execute command and verify output
- manual_check: Manual verification required

**Usage:**
Call this tool in Phase 5 (Quality Assurance) to verify that the task is truly complete.`

type ToolContextWithMetadata = {
  sessionID: string
  messageID: string
  agent: string
  abort: AbortSignal
  directory: string
  metadata?: (input: { title?: string; metadata?: Record<string, unknown> }) => void
}

export function createVerificationTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: VERIFICATION_TOOL_DESCRIPTION,
    args: {
      taskType: tool.schema.string().describe("Task type (run_demo, fix_bug, add_feature, refactor, other)"),
      taskDescription: tool.schema.string().describe("Human-readable task description"),
      successCriteria: tool.schema.object({
        type: tool.schema.string().describe("Task type"),
        description: tool.schema.string().describe("Success criteria description"),
        verification: tool.schema.object({
          method: tool.schema.string().describe("Verification method (http_check, port_check, test_run, command_check, manual_check)"),
          target: tool.schema.string().describe("Verification target (URL, port, command, etc.)"),
          expected: tool.schema.string().describe("Expected result"),
          timeout: tool.schema.number().optional().describe("Timeout in milliseconds"),
        }),
      }),
    },
    async execute(args, toolContext) {
      const toolCtx = toolContext as ToolContextWithMetadata

      log(`[verification] Starting verification`, {
        sessionID: toolCtx.sessionID,
        taskType: args.taskType,
      })

      try {
        // Build verification context
        const context: VerificationContext = {
          projectPath: toolCtx.directory || ctx.directory,
          taskDescription: args.taskDescription,
          successCriteria: args.successCriteria,
          sessionId: toolCtx.sessionID,
        }

        // Execute verification
        const result = await executeVerification(context)

        // Format result
        const resultText = `Verification Result:
${result.success ? "✅ SUCCESS" : "❌ FAILED"}

${result.message}

${result.evidence && result.evidence.length > 0
  ? `\nEvidence:\n${result.evidence.map((e) => `- ${e.type}: ${e.data.substring(0, 200)}...`).join("\n")}`
  : ""}

${result.error ? `\nError: ${result.error}` : ""}`

        log(`[verification] Verification completed`, {
          sessionID: toolCtx.sessionID,
          success: result.success,
        })

        return resultText
      } catch (error) {
        log(`[verification] Verification error: ${error}`, {
          sessionID: toolCtx.sessionID,
          error,
        })

        return `Verification failed with error: ${error instanceof Error ? error.message : String(error)}`
      }
    },
  })
}

