/**
 * Verification Strategy Registry
 * 
 * Manages verification strategies and selects appropriate strategy for tasks.
 */

import type { VerificationStrategy } from "./types"
import { log } from "../../shared/logger"

/**
 * Verification strategy registry
 */
class VerificationRegistry {
  private strategies: VerificationStrategy[] = []

  /**
   * Register a verification strategy
   */
  register(strategy: VerificationStrategy): void {
    // Remove existing strategy with same name
    this.strategies = this.strategies.filter((s) => s.name !== strategy.name)
    
    // Add new strategy
    this.strategies.push(strategy)
    
    // Sort by priority (higher priority first)
    this.strategies.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    
    log(`[VerificationRegistry] Registered strategy: ${strategy.name}`, {
      priority: strategy.priority ?? 0,
    })
  }

  /**
   * Select strategy for a task
   */
  selectStrategy(taskType: string, taskDescription: string): VerificationStrategy | null {
    // Find matching strategies
    const matching = this.strategies.filter((strategy) =>
      strategy.match(taskType, taskDescription)
    )

    if (matching.length === 0) {
      log(`[VerificationRegistry] No strategy found for task type: ${taskType}`, {
        taskDescription,
      })
      return null
    }

    // Return highest priority strategy (already sorted)
    const selected = matching[0]
    log(`[VerificationRegistry] Selected strategy: ${selected.name}`, {
      taskType,
      priority: selected.priority ?? 0,
    })

    return selected
  }

  /**
   * Get all registered strategies
   */
  getAllStrategies(): VerificationStrategy[] {
    return [...this.strategies]
  }

  /**
   * Get strategy by name
   */
  getStrategy(name: string): VerificationStrategy | null {
    return this.strategies.find((s) => s.name === name) || null
  }
}

// Singleton instance
let registryInstance: VerificationRegistry | null = null

/**
 * Get the verification strategy registry instance
 */
export function getVerificationRegistry(): VerificationRegistry {
  if (!registryInstance) {
    registryInstance = new VerificationRegistry()
  }
  return registryInstance
}

/**
 * Register a verification strategy
 */
export function registerVerificationStrategy(strategy: VerificationStrategy): void {
  getVerificationRegistry().register(strategy)
}

/**
 * Select verification strategy for a task
 */
export function selectVerificationStrategy(
  taskType: string,
  taskDescription: string
): VerificationStrategy | null {
  return getVerificationRegistry().selectStrategy(taskType, taskDescription)
}

