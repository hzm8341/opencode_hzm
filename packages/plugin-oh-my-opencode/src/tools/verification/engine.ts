/**
 * Verification Engine
 * 
 * Executes verification strategies and collects results.
 */

import type { VerificationContext, VerificationResult } from "../../features/unified-executor/types"
import { selectVerificationStrategy } from "./registry"
import { log } from "../../shared/logger"

/**
 * Execute verification for a task
 */
export async function executeVerification(
  context: VerificationContext
): Promise<VerificationResult> {
  log(`[VerificationEngine] Starting verification`, {
    sessionID: context.sessionId,
    taskType: context.successCriteria.type,
  })

  // Select appropriate strategy
  const strategy = selectVerificationStrategy(
    context.successCriteria.type,
    context.taskDescription
  )

  if (!strategy) {
    return {
      success: false,
      message: `No verification strategy found for task type: ${context.successCriteria.type}`,
      error: `No matching strategy for type: ${context.successCriteria.type}`,
    }
  }

  try {
    // Execute verification
    log(`[VerificationEngine] Executing strategy: ${strategy.name}`, {
      sessionID: context.sessionId,
    })

    const result = await strategy.verify(context)

    log(`[VerificationEngine] Verification completed`, {
      sessionID: context.sessionId,
      success: result.success,
      strategy: strategy.name,
    })

    return result
  } catch (error) {
    log(`[VerificationEngine] Verification failed: ${error}`, {
      sessionID: context.sessionId,
      strategy: strategy.name,
      error,
    })

    return {
      success: false,
      message: `Verification failed: ${error}`,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

