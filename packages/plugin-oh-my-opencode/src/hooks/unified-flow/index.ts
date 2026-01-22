/**
 * Unified Flow Hook
 * 
 * Detects unified flow requests and injects phase-specific prompts.
 */

import type { PluginInput } from "@opencode-ai/plugin"
import { getPhasePrompt } from "../../agents/unified-flow-prompts"
import { ExecutionPhase, createStateManager } from "../../features/unified-executor"
import type { ExecutionState, SuccessCriteria, TaskType } from "../../features/unified-executor/types"
import { TaskType as TaskTypeEnum, VerificationMethod } from "../../features/unified-executor/types"
import { findNearestMessageWithFields } from "../../features/hook-message-injector"
import { injectHookMessage } from "../../features/hook-message-injector/injector"
import { log } from "../../shared/logger"

export interface UnifiedFlowHookOptions {
  /** Whether to enable unified flow detection */
  enabled?: boolean
  
  /** Keywords that trigger unified flow */
  triggerKeywords?: string[]
}

const DEFAULT_TRIGGER_KEYWORDS = [
  "帮我",
  "帮我将",
  "自动",
  "运行demo",
  "运行demo起来",
  "启动",
  "帮我运行",
  "帮我启动",
  "自动完成",
  "完整流程",
]

/**
 * Detect if a message should trigger unified flow
 */
function shouldActivateUnifiedFlow(
  message: string,
  keywords: string[] = DEFAULT_TRIGGER_KEYWORDS
): boolean {
  const lowerMessage = message.toLowerCase()
  
  // Check for explicit trigger
  if (lowerMessage.includes("unified-flow") || lowerMessage.includes("统一流程")) {
    return true
  }
  
  // Check for keywords
  for (const keyword of keywords) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return true
    }
  }
  
  // Check for common patterns
  const patterns = [
    /帮我.*(运行|启动|完成|实现)/,
    /将.*(运行|启动)起来/,
    /自动.*(完成|实现|处理)/,
  ]
  
  for (const pattern of patterns) {
    if (pattern.test(lowerMessage)) {
      return true
    }
  }
  
  return false
}

/**
 * Extract text from message parts
 */
function extractMessageText(parts: unknown[]): string {
  let text = ""
  
  for (const part of parts) {
    if (typeof part === "string") {
      text += part
    } else if (part && typeof part === "object") {
      if ("type" in part && part.type === "text" && "text" in part) {
        text += String(part.text)
      }
    }
  }
  
  return text
}

/**
 * Create unified flow hook
 */
export function createUnifiedFlowHook(
  ctx: PluginInput,
  options: UnifiedFlowHookOptions = {}
): { handler: (event: { type: string; properties?: unknown }) => Promise<void> } {
  const enabled = options.enabled !== false
  const keywords = options.triggerKeywords || DEFAULT_TRIGGER_KEYWORDS
  
  const stateManager = createStateManager(ctx.directory || process.cwd())
  
  return {
    handler: async ({ event }: { event: { type: string; properties?: unknown } }) => {
      if (!enabled) {
        return
      }
      
      const props = event.properties as Record<string, unknown> | undefined
      
      // Detect unified flow activation
      if (event.type === "session.prompt") {
        const sessionID = props?.sessionID as string | undefined
        const parts = props?.parts as unknown[] | undefined
        
        if (!sessionID || !parts) {
          return
        }
        
        const messageText = extractMessageText(parts)
        
        if (shouldActivateUnifiedFlow(messageText, keywords)) {
          // Create or load execution state
          let state = stateManager.loadState(sessionID)
          
          if (!state) {
            state = stateManager.createState(sessionID, messageText)
          }
          
          // Inject phase 1 prompt
          await injectPhasePrompt(ctx, sessionID, state.phase)
        }
      }
      
      // Monitor phase transitions
      if (event.type === "session.idle") {
        const sessionID = props?.sessionID as string | undefined
        
        if (sessionID) {
          const state = stateManager.loadState(sessionID)
          
          if (state && state.phase !== ExecutionPhase.COMPLETED && state.phase !== ExecutionPhase.FAILED) {
            // Check if current phase is complete and transition to next phase
            await checkPhaseTransition(ctx, stateManager, state)
          }
        }
      }
    },
  }
}

/**
 * Inject phase-specific prompt
 */
async function injectPhasePrompt(
  ctx: PluginInput,
  sessionID: string,
  phase: ExecutionPhase
): Promise<void> {
  const prompt = getPhasePrompt(phase)
  
  if (!prompt) {
    return
  }
  
  log(`[UnifiedFlow] Injecting prompt for phase: ${phase}`, { sessionID })
  
  try {
    // Use the hook message injector to inject the prompt
    // This follows the same pattern as sisyphus-orchestrator hook
    const { MESSAGE_STORAGE } = await import("../../features/hook-message-injector/constants")
    const { existsSync } = await import("node:fs")
    const { join } = await import("node:path")
    
    const messageDir = join(MESSAGE_STORAGE, sessionID)
    if (!existsSync(messageDir)) {
      log(`[UnifiedFlow] Message directory not found, skipping injection`, { sessionID })
      return
    }
    
    // Find the most recent message to get agent/model info
    const message = findNearestMessageWithFields(messageDir)
    
    if (message) {
      // Inject using the hook message injector
      const hookContent = `\n\n<unified-flow-phase>\n${prompt}\n</unified-flow-phase>\n\n`
      
      const injected = injectHookMessage(sessionID, hookContent, {
        agent: message.agent,
        model: message.model,
        tools: message.tools,
      })
      
      if (injected) {
        log(`[UnifiedFlow] Successfully injected phase ${phase} prompt`, { sessionID })
      } else {
        log(`[UnifiedFlow] Failed to inject prompt (injectHookMessage returned false)`, { sessionID })
      }
    } else {
      log(`[UnifiedFlow] No message found to inject after`, { sessionID })
    }
  } catch (error) {
    log(`[UnifiedFlow] Failed to inject prompt: ${error}`, { sessionID, error })
  }
}

/**
 * Extract success criteria from agent output
 */
async function extractSuccessCriteriaFromMessages(
  ctx: PluginInput,
  sessionID: string
): Promise<{ successCriteria?: SuccessCriteria; taskType?: TaskType } | null> {
  try {
    const messagesResult = await ctx.client.session.messages({
      path: { id: sessionID },
    })

    if (messagesResult.error) {
      return null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages = ((messagesResult as any).data ?? messagesResult) as Array<{
      info?: { role?: string; time?: { created?: number } }
      parts?: Array<{ type?: string; text?: string }>
    }>

    // Get the most recent assistant message
    const assistantMessages = messages
      .filter((m) => m.info?.role === "assistant")
      .sort((a, b) => (b.info?.time?.created ?? 0) - (a.info?.time?.created ?? 0))

    if (assistantMessages.length === 0) {
      return null
    }

    // Extract text from all assistant messages (check last few)
    const recentMessages = assistantMessages.slice(0, 3)
    let allText = ""

    for (const msg of recentMessages) {
      const textParts = msg.parts?.filter((p) => p.type === "text" || p.type === "reasoning") ?? []
      const textContent = textParts.map((p) => p.text ?? "").filter(Boolean).join("\n")
      allText += textContent + "\n\n"
    }

    // Try to detect task type first
    let taskType: TaskType | undefined
    const lowerText = allText.toLowerCase()

    if (lowerText.includes("run_demo") || lowerText.includes("运行demo") || lowerText.includes("启动")) {
      taskType = TaskTypeEnum.RUN_DEMO
    } else if (lowerText.includes("fix_bug") || lowerText.includes("修复") || lowerText.includes("bug")) {
      taskType = TaskTypeEnum.FIX_BUG
    } else if (lowerText.includes("add_feature") || lowerText.includes("添加功能") || lowerText.includes("实现")) {
      taskType = TaskTypeEnum.ADD_FEATURE
    } else if (lowerText.includes("refactor") || lowerText.includes("重构")) {
      taskType = TaskTypeEnum.REFACTOR
    } else {
      taskType = TaskTypeEnum.OTHER
    }

    // Try to extract success criteria from the text
    // Look for patterns like "Success Criteria:", "成功标准:", etc.
    const successCriteriaMatch = allText.match(
      /(?:Success Criteria|成功标准)[:\s]*\n*(?:- Type: ([^\n]+))?\n*(?:- Description: ([^\n]+))?\n*(?:- Verification:)?\n*(?:  - Method: ([^\n]+))?\n*(?:  - Target: ([^\n]+))?\n*(?:  - Expected: ([^\n]+))?/i
    )

    if (successCriteriaMatch) {
      // Parse verification method
      let verificationMethod = VerificationMethod.MANUAL_CHECK
      const methodStr = (successCriteriaMatch[3] || "").toLowerCase()
      if (methodStr.includes("http")) {
        verificationMethod = VerificationMethod.HTTP_CHECK
      } else if (methodStr.includes("test")) {
        verificationMethod = VerificationMethod.TEST_RUN
      } else if (methodStr.includes("port")) {
        verificationMethod = VerificationMethod.PORT_CHECK
      } else if (methodStr.includes("file")) {
        verificationMethod = VerificationMethod.FILE_CHECK
      } else if (methodStr.includes("command")) {
        verificationMethod = VerificationMethod.COMMAND_CHECK
      }

      const successCriteria: SuccessCriteria = {
        type: taskType,
        description: successCriteriaMatch[2] || "Task completion",
        verification: {
          method: verificationMethod,
          target: successCriteriaMatch[4] || "",
          expected: successCriteriaMatch[5] || "",
        },
      }

      return { successCriteria, taskType }
    }

    // If no explicit success criteria found but task type detected, return task type
    if (taskType) {
      return { taskType }
    }

    return null
  } catch (error) {
    log(`[UnifiedFlow] Failed to extract success criteria: ${error}`, { sessionID, error })
    return null
  }
}

/**
 * Check if plan file exists and is approved
 */
async function checkPlanStatus(
  ctx: PluginInput,
  planPath: string
): Promise<{ exists: boolean; approved: boolean }> {
  try {
    const { existsSync, readFileSync } = await import("node:fs")
    const { join } = await import("node:path")

    const fullPath = join(ctx.directory || process.cwd(), planPath)
    
    if (!existsSync(fullPath)) {
      return { exists: false, approved: false }
    }

    // Read plan file and check for approval markers
    const content = readFileSync(fullPath, "utf-8")
    
    // Look for Momus approval markers
    const approved = /(?:OKAY|APPROVED|通过|已批准)/i.test(content) && 
                     !/(?:REJECT|拒绝|未通过)/i.test(content)

    return { exists: true, approved }
  } catch (error) {
    log(`[UnifiedFlow] Failed to check plan status: ${error}`, { planPath, error })
    return { exists: false, approved: false }
  }
}

/**
 * Find plan file path from messages or directory
 */
async function findPlanPath(
  ctx: PluginInput,
  sessionID: string
): Promise<string | null> {
  try {
    // First, try to find from messages
    const messagesResult = await ctx.client.session.messages({
      path: { id: sessionID },
    })

    if (!messagesResult.error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages = ((messagesResult as any).data ?? messagesResult) as Array<{
        parts?: Array<{ type?: string; text?: string }>
      }>

      // Look for plan path in recent messages
      for (const msg of messages.slice(-5)) {
        const textParts = msg.parts?.filter((p) => p.type === "text" || p.type === "reasoning") ?? []
        const textContent = textParts.map((p) => p.text ?? "").join("\n")

        // Look for .sisyphus/plans/ path
        const planMatch = textContent.match(/\.sisyphus\/plans\/([^\s\)\]]+\.md)/)
        if (planMatch) {
          return `.sisyphus/plans/${planMatch[1]}`
        }
      }
    }

    // Fallback: search directory for plan files
    const { existsSync, readdirSync } = await import("node:fs")
    const { join } = await import("node:path")

    const plansDir = join(ctx.directory || process.cwd(), ".sisyphus/plans")
    if (existsSync(plansDir)) {
      const files = readdirSync(plansDir)
      const mdFiles = files.filter((f) => f.endsWith(".md"))
      if (mdFiles.length > 0) {
        // Get the most recent file
        const sortedFiles = mdFiles.sort().reverse()
        return `.sisyphus/plans/${sortedFiles[0]}`
      }
    }

    return null
  } catch (error) {
    log(`[UnifiedFlow] Failed to find plan path: ${error}`, { sessionID, error })
    return null
  }
}

/**
 * Check and handle phase transitions
 */
async function checkPhaseTransition(
  ctx: PluginInput,
  stateManager: ReturnType<typeof createStateManager>,
  state: ExecutionState
): Promise<void> {
  log(`[UnifiedFlow] Checking phase transition for phase: ${state.phase}`, { sessionID: state.sessionId })

  // For Phase 1: Check if success criteria is extracted
  if (state.phase === ExecutionPhase.TASK_PARSING) {
    // Try to extract success criteria from messages
    const extracted = await extractSuccessCriteriaFromMessages(ctx, state.sessionId)

    if (extracted?.successCriteria) {
      // Update state with success criteria
      state.successCriteria = extracted.successCriteria
      if (extracted.taskType) {
        state.taskType = extracted.taskType
      }
      stateManager.saveState(state)

      log(`[UnifiedFlow] Phase 1 complete, extracted success criteria`, {
        sessionID: state.sessionId,
        taskType: extracted.taskType,
      })

      // Transition to Phase 2
      const nextPhase = stateManager.getNextPhase(state.phase)
      if (nextPhase) {
        stateManager.transitionToPhase(state, nextPhase)
        await injectPhasePrompt(ctx, state.sessionId, nextPhase)
        log(`[UnifiedFlow] Transitioned to phase: ${nextPhase}`, { sessionID: state.sessionId })
      }
      return
    }

    // Also check for explicit phase completion markers in messages
    const messagesResult = await ctx.client.session.messages({
      path: { id: state.sessionId },
    })

    if (!messagesResult.error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages = ((messagesResult as any).data ?? messagesResult) as Array<{
        parts?: Array<{ type?: string; text?: string }>
      }>

      const recentText = messages
        .slice(-3)
        .flatMap((m) => m.parts?.filter((p) => p.type === "text" || p.type === "reasoning") ?? [])
        .map((p) => p.text ?? "")
        .join("\n")
        .toLowerCase()

      // Check for phase completion markers
      if (recentText.includes("phase 1 complete") || recentText.includes("阶段1完成")) {
        // Try one more time to extract success criteria
        const extracted = await extractSuccessCriteriaFromMessages(ctx, state.sessionId)
        if (extracted?.successCriteria) {
          state.successCriteria = extracted.successCriteria
          if (extracted.taskType) {
            state.taskType = extracted.taskType
          }
          stateManager.saveState(state)

          const nextPhase = stateManager.getNextPhase(state.phase)
          if (nextPhase) {
            stateManager.transitionToPhase(state, nextPhase)
            await injectPhasePrompt(ctx, state.sessionId, nextPhase)
          }
        }
      }
    }
  }

  // For Phase 2: Check if plan is created and approved
  if (state.phase === ExecutionPhase.INTELLIGENT_DECOMPOSITION) {
    // Try to find plan path
    const planPath = state.planPath || (await findPlanPath(ctx, state.sessionId))

    if (planPath) {
      // Update state with plan path
      if (!state.planPath) {
        state.planPath = planPath
        // Extract plan name from path
        const planNameMatch = planPath.match(/([^/]+)\.md$/)
        if (planNameMatch) {
          state.planName = planNameMatch[1]
        }
        stateManager.saveState(state)
      }

      // Check if plan is approved
      const planStatus = await checkPlanStatus(ctx, planPath)

      if (planStatus.exists && planStatus.approved) {
        log(`[UnifiedFlow] Phase 2 complete, plan approved`, {
          sessionID: state.sessionId,
          planPath,
        })

        // Transition to Phase 3
        const nextPhase = stateManager.getNextPhase(state.phase)
        if (nextPhase) {
          stateManager.transitionToPhase(state, nextPhase)
          await injectPhasePrompt(ctx, state.sessionId, nextPhase)
          log(`[UnifiedFlow] Transitioned to phase: ${nextPhase}`, { sessionID: state.sessionId })
        }
        return
      } else if (planStatus.exists && !planStatus.approved) {
        // Plan exists but not approved yet, wait
        log(`[UnifiedFlow] Plan exists but not approved yet`, {
          sessionID: state.sessionId,
          planPath,
        })
        return
      }
    }

    // Also check for explicit phase completion markers
    const messagesResult = await ctx.client.session.messages({
      path: { id: state.sessionId },
    })

    if (!messagesResult.error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages = ((messagesResult as any).data ?? messagesResult) as Array<{
        parts?: Array<{ type?: string; text?: string }>
      }>

      const recentText = messages
        .slice(-3)
        .flatMap((m) => m.parts?.filter((p) => p.type === "text" || p.type === "reasoning") ?? [])
        .map((p) => p.text ?? "")
        .join("\n")
        .toLowerCase()

      if (recentText.includes("phase 2 complete") || recentText.includes("阶段2完成")) {
        // Try to find plan again
        const planPath = state.planPath || (await findPlanPath(ctx, state.sessionId))
        if (planPath) {
          state.planPath = planPath
          const planNameMatch = planPath.match(/([^/]+)\.md$/)
          if (planNameMatch) {
            state.planName = planNameMatch[1]
          }
          stateManager.saveState(state)

          const nextPhase = stateManager.getNextPhase(state.phase)
          if (nextPhase) {
            stateManager.transitionToPhase(state, nextPhase)
            await injectPhasePrompt(ctx, state.sessionId, nextPhase)
          }
        }
      }
    }
  }

  // TODO: Implement checks for other phases (3-6)
}

