/**
 * Unified Agent Execution Flow - State Manager
 * 
 * Manages execution state for the unified 6-step flow.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import type { ExecutionState } from "./types"
import { ExecutionPhase } from "./types"

const EXECUTION_STATE_DIR = ".sisyphus/execution-state"
const STATE_FILE_EXT = ".json"

/**
 * Get the state file path for a session
 */
function getStateFilePath(sessionId: string, directory: string): string {
  const stateDir = join(directory, EXECUTION_STATE_DIR)
  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true })
  }
  return join(stateDir, `${sessionId}${STATE_FILE_EXT}`)
}

/**
 * State manager for unified execution flow
 */
export class ExecutionStateManager {
  private directory: string

  constructor(directory: string) {
    this.directory = directory
  }

  /**
   * Load execution state for a session
   */
  loadState(sessionId: string): ExecutionState | null {
    const statePath = getStateFilePath(sessionId, this.directory)
    
    if (!existsSync(statePath)) {
      return null
    }

    try {
      const content = readFileSync(statePath, "utf-8")
      return JSON.parse(content) as ExecutionState
    } catch (error) {
      console.error(`[ExecutionStateManager] Failed to load state: ${error}`)
      return null
    }
  }

  /**
   * Save execution state for a session
   */
  saveState(state: ExecutionState): void {
    const statePath = getStateFilePath(state.sessionId, this.directory)
    const updatedState = {
      ...state,
      updatedAt: new Date().toISOString(),
    }

    try {
      writeFileSync(statePath, JSON.stringify(updatedState, null, 2), "utf-8")
    } catch (error) {
      console.error(`[ExecutionStateManager] Failed to save state: ${error}`)
      throw error
    }
  }

  /**
   * Create a new execution state
   */
  createState(sessionId: string, taskDescription: string): ExecutionState {
    const state: ExecutionState = {
      sessionId,
      phase: ExecutionPhase.TASK_PARSING,
      taskDescription,
      todos: [],
      phaseResults: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.saveState(state)
    return state
  }

  /**
   * Update the current phase
   */
  transitionToPhase(state: ExecutionState, newPhase: ExecutionPhase): void {
    // Mark current phase as completed
    if (state.phase !== newPhase) {
      state.phaseResults[state.phase] = {
        completed: true,
        completedAt: new Date().toISOString(),
      }
    }

    // Transition to new phase
    state.phase = newPhase
    this.saveState(state)
  }

  /**
   * Update phase result
   */
  updatePhaseResult(
    state: ExecutionState,
    phase: ExecutionPhase,
    result: { completed: boolean; result?: string; error?: string }
  ): void {
    state.phaseResults[phase] = {
      ...result,
      completedAt: new Date().toISOString(),
    }
    this.saveState(state)
  }

  /**
   * Check if a phase is completed
   */
  isPhaseCompleted(state: ExecutionState, phase: ExecutionPhase): boolean {
    return state.phaseResults[phase]?.completed === true
  }

  /**
   * Get the next phase
   */
  getNextPhase(currentPhase: ExecutionPhase): ExecutionPhase | null {
    const phaseOrder: ExecutionPhase[] = [
      ExecutionPhase.TASK_PARSING,
      ExecutionPhase.INTELLIGENT_DECOMPOSITION,
      ExecutionPhase.PARALLEL_EXECUTION,
      ExecutionPhase.SYNTHESIS_CONSTRUCTION,
      ExecutionPhase.QUALITY_ASSURANCE,
      ExecutionPhase.RESULT_DELIVERY,
      ExecutionPhase.COMPLETED,
    ]

    const currentIndex = phaseOrder.indexOf(currentPhase)
    if (currentIndex === -1 || currentIndex === phaseOrder.length - 1) {
      return null
    }

    return phaseOrder[currentIndex + 1]
  }

  /**
   * Delete state for a session (cleanup)
   */
  deleteState(sessionId: string): void {
    const statePath = getStateFilePath(sessionId, this.directory)
    if (existsSync(statePath)) {
      try {
        // Use fs.unlinkSync in Node.js environment
        const { unlinkSync } = require("fs")
        unlinkSync(statePath)
      } catch (error) {
        console.error(`[ExecutionStateManager] Failed to delete state: ${error}`)
      }
    }
  }
}

/**
 * Create a state manager instance
 */
export function createStateManager(directory: string): ExecutionStateManager {
  return new ExecutionStateManager(directory)
}

