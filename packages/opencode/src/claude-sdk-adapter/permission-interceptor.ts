/**
 * Permission Interceptor for Claude Agent SDK Compatibility
 * 
 * This module provides a compatibility layer between Claude Agent SDK's `canUseTool` callback
 * and OpenCode's `PermissionNext.ask()` system.
 * 
 * The main challenge is that:
 * - Claude SDK's `canUseTool` expects a `PermissionResult` return value
 * - OpenCode's `PermissionNext.ask()` returns `Promise<void>` and throws exceptions for denials
 * 
 * This adapter bridges the gap by:
 * 1. Evaluating permission rules first
 * 2. Handling async permission requests through Promise resolution
 * 3. Converting exceptions to return values
 */

import { PermissionNext } from "@/permission/next"
import { Agent } from "@/agent/agent"
import { Session } from "@/session"
import { MessageV2 } from "@/session/message-v2"
import { Log } from "@/util/log"
import { withTimeout } from "@/util/timeout"

const log = Log.create({ service: "claude-sdk-adapter.permission" })

/**
 * Permission result type matching Claude Agent SDK's expected format
 */
export type PermissionResult =
  | { behavior: "allow"; updatedInput?: unknown }
  | { behavior: "deny"; message?: string }
  | { behavior: "ask" }

/**
 * Options for creating a permission handler
 */
export interface PermissionHandlerOptions {
  /**
   * Custom permission handler that can override default behavior
   * If this returns a result other than "ask", it will be used directly
   */
  customHandler?: (
    toolName: string,
    input: unknown,
    opts: { signal: AbortSignal }
  ) => Promise<PermissionResult>

  /**
   * Timeout for permission requests in milliseconds
   * Default: 5 minutes
   */
  timeoutMs?: number

  /**
   * Whether to log permission decisions
   * Default: true
   */
  logDecisions?: boolean
}

/**
 * Permission Interceptor class
 * 
 * Creates `canUseTool` compatible handlers that integrate with OpenCode's permission system
 */
export class PermissionInterceptor {
  private readonly timeoutMs: number
  private readonly logDecisions: boolean

  constructor(private readonly options: PermissionHandlerOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? 5 * 60 * 1000 // 5 minutes default
    this.logDecisions = options.logDecisions ?? true
  }

  /**
   * Create a `canUseTool` compatible handler for a specific session
   * 
   * @param sessionID - The OpenCode session ID
   * @returns A function compatible with Claude Agent SDK's `canUseTool` callback
   */
  createCanUseToolHandler(sessionID: string): (
    toolName: string,
    input: unknown,
    opts: { signal: AbortSignal }
  ) => Promise<PermissionResult> {
    return async (toolName: string, input: unknown, opts: { signal: AbortSignal }): Promise<PermissionResult> => {
      // 1. If custom handler exists, try it first
      if (this.options.customHandler) {
        const customResult = await this.options.customHandler(toolName, input, opts)
        if (customResult.behavior !== "ask") {
          if (this.logDecisions) {
            log.info("Custom handler decision", {
              toolName,
              behavior: customResult.behavior,
              sessionID,
            })
          }
          return customResult
        }
        // If custom handler returns "ask", fall through to OpenCode permission system
      }

      // 2. Get agent and session information
      let agent: Agent.Info
      let session: Session.Info
      try {
        session = await Session.get(sessionID)
        
        // Try to get agent from last user message
        const allMessages = await Session.messages({ sessionID })
        const lastUserMessage = allMessages
          .filter((m: MessageV2.WithParts) => m.info.role === "user")
          .sort((a: MessageV2.WithParts, b: MessageV2.WithParts) => a.info.id.localeCompare(b.info.id))
          .at(-1)

        const agentName = lastUserMessage?.info.agent ?? (await Agent.defaultAgent())
        agent = await Agent.get(agentName)
      } catch (error) {
        log.error("Failed to get agent or session", { sessionID, error })
        // Fallback: deny if we can't determine permissions
        return {
          behavior: "deny",
          message: `Failed to determine permissions: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

      // 3. Get permission ruleset (merge agent and session permissions)
      const ruleset = PermissionNext.merge(
        agent.permission,
        session.permission ?? []
      )

      // 4. Map tool name to permission name
      // Some tools map to specific permissions (e.g., edit, write, patch -> "edit")
      const EDIT_TOOLS = ["edit", "write", "patch", "multiedit"]
      const permissionName = EDIT_TOOLS.includes(toolName) ? "edit" : toolName

      // 5. Evaluate permission rules
      // We need to determine the pattern - for now, use "*" as default
      // In a real implementation, we might need to extract pattern from input
      const pattern = "*"
      const rule = PermissionNext.evaluate(permissionName, pattern, ruleset)

      if (this.logDecisions) {
        log.info("Permission evaluation", {
          toolName,
          permissionName,
          pattern,
          action: rule.action,
          sessionID,
        })
      }

      // 6. Handle based on rule action
      if (rule.action === "allow") {
        return { behavior: "allow", updatedInput: input }
      }

      if (rule.action === "deny") {
        return {
          behavior: "deny",
          message: `Permission denied by configuration rule: ${JSON.stringify(rule)}`,
        }
      }

      // 7. Handle "ask" action - need to request permission from user
      if (rule.action === "ask") {
        try {
          // Create a promise that will resolve when permission is granted/denied
          const permissionPromise = PermissionNext.ask({
            permission: permissionName,
            patterns: [pattern],
            sessionID,
            always: [],
            metadata: {
              tool: toolName,
              input: input as Record<string, unknown>,
            },
            ruleset,
          })

          // Wait for permission with timeout and abort signal support
          const abortPromise = new Promise<never>((_, reject) => {
            opts.signal.addEventListener("abort", () => {
              reject(new Error("Permission request aborted"))
            })
          })

          await Promise.race([
            withTimeout(permissionPromise, this.timeoutMs),
            abortPromise,
          ])

          // If we get here, permission was granted
          if (this.logDecisions) {
            log.info("Permission granted", { toolName, sessionID })
          }
          return { behavior: "allow", updatedInput: input }
        } catch (error) {
          // Handle different error types
          if (error instanceof PermissionNext.DeniedError) {
            if (this.logDecisions) {
              log.info("Permission denied by rule", {
                toolName,
                sessionID,
                ruleset: error.ruleset,
              })
            }
            return {
              behavior: "deny",
              message: `Permission denied by configuration: ${error.message}`,
            }
          }

          if (error instanceof PermissionNext.RejectedError) {
            if (this.logDecisions) {
              log.info("Permission rejected by user", { toolName, sessionID })
            }
            return {
              behavior: "deny",
              message: "Permission rejected by user",
            }
          }

          if (error instanceof PermissionNext.CorrectedError) {
            if (this.logDecisions) {
              log.info("Permission rejected with correction", {
                toolName,
                sessionID,
                message: error.message,
              })
            }
            return {
              behavior: "deny",
              message: error.message,
            }
          }

          // Handle timeout or abort
          if (error instanceof Error) {
            if (error.message.includes("timeout") || error.message.includes("aborted")) {
              if (this.logDecisions) {
                log.warn("Permission request timeout/abort", {
                  toolName,
                  sessionID,
                  error: error.message,
                })
              }
              return {
                behavior: "deny",
                message: error.message,
              }
            }
          }

          // Unknown error - log and deny
          log.error("Unexpected error in permission request", {
            toolName,
            sessionID,
            error,
          })
          return {
            behavior: "deny",
            message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          }
        }
      }

      // Fallback - should not reach here
      log.warn("Unexpected permission evaluation result", {
        toolName,
        sessionID,
        rule,
      })
      return {
        behavior: "deny",
        message: "Unexpected permission evaluation result",
      }
    }
  }
}
