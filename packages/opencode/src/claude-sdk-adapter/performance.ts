/**
 * Performance optimization utilities for Claude SDK Adapter
 */

import { Log } from "@/util/log"

const log = Log.create({ service: "claude-sdk-adapter.performance" })

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  messageConversionTime: number
  permissionCheckTime: number
  sessionLookupTime: number
  totalTime: number
  messageCount: number
  toolCallCount: number
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    messageConversionTime: 0,
    permissionCheckTime: 0,
    sessionLookupTime: 0,
    totalTime: 0,
    messageCount: 0,
    toolCallCount: 0,
  }

  private startTime: number = 0

  start(): void {
    this.startTime = performance.now()
  }

  recordMessageConversion(time: number): void {
    this.metrics.messageConversionTime += time
    this.metrics.messageCount++
  }

  recordPermissionCheck(time: number): void {
    this.metrics.permissionCheckTime += time
  }

  recordSessionLookup(time: number): void {
    this.metrics.sessionLookupTime += time
  }

  recordToolCall(): void {
    this.metrics.toolCallCount++
  }

  end(): PerformanceMetrics {
    this.metrics.totalTime = performance.now() - this.startTime
    return { ...this.metrics }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  reset(): void {
    this.metrics = {
      messageConversionTime: 0,
      permissionCheckTime: 0,
      sessionLookupTime: 0,
      totalTime: 0,
      messageCount: 0,
      toolCallCount: 0,
    }
    this.startTime = 0
  }

  logMetrics(): void {
    const m = this.getMetrics()
    log.info("Performance metrics", {
      totalTime: `${m.totalTime.toFixed(2)}ms`,
      messageConversion: `${m.messageConversionTime.toFixed(2)}ms`,
      permissionCheck: `${m.permissionCheckTime.toFixed(2)}ms`,
      sessionLookup: `${m.sessionLookupTime.toFixed(2)}ms`,
      messageCount: m.messageCount,
      toolCallCount: m.toolCallCount,
      avgMessageTime: m.messageCount > 0 ? `${(m.messageConversionTime / m.messageCount).toFixed(2)}ms` : "0ms",
    })
  }
}

/**
 * Cache for frequently accessed data
 */
export class Cache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number }>()
  private ttl: number

  constructor(ttlMs: number = 5 * 60 * 1000) {
    // Default 5 minutes TTL
    this.ttl = ttlMs
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value
  }

  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    })
  }

  delete(key: K): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}
