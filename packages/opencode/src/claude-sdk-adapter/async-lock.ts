/**
 * Async Lock for Concurrent Control
 * 
 * Provides a simple async lock mechanism to prevent race conditions
 * in message conversion and tool call ID mapping.
 */

import { Log } from "@/util/log"

const log = Log.create({ service: "claude-sdk-adapter.async-lock" })

/**
 * Async Lock class
 * 
 * Ensures that only one async operation can execute at a time
 */
export class AsyncLock {
  private queue: Array<{
    resolve: () => void
    reject: (error: Error) => void
  }> = []
  private locked = false

  /**
   * Acquire the lock and execute a function
   * 
   * @param fn - Function to execute while holding the lock
   * @returns Result of the function
   */
  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    // Wait for lock to be available
    await this.waitForLock()

    try {
      // Execute function while holding lock
      return await fn()
    } finally {
      // Release lock
      this.release()
    }
  }

  /**
   * Wait for the lock to become available
   */
  private waitForLock(): Promise<void> {
    if (!this.locked) {
      this.locked = true
      return Promise.resolve()
    }

    return new Promise<void>((resolve, reject) => {
      this.queue.push({ resolve, reject })
    })
  }

  /**
   * Release the lock and allow next operation to proceed
   */
  private release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!
      next.resolve()
    } else {
      this.locked = false
    }
  }

  /**
   * Check if lock is currently held
   */
  isLocked(): boolean {
    return this.locked
  }

  /**
   * Get number of operations waiting for lock
   */
  getQueueLength(): number {
    return this.queue.length
  }

  /**
   * Clear all pending operations (use with caution)
   */
  clear(): void {
    const error = new Error("AsyncLock cleared")
    for (const item of this.queue) {
      item.reject(error)
    }
    this.queue = []
    this.locked = false
  }
}
