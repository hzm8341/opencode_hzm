/**
 * Verification Utilities
 * 
 * Helper functions for verification strategies.
 */

import { createConnection } from "node:net"
import type { HealthCheckResult, PortCheckResult } from "./types"
import { log } from "../../shared/logger"

/**
 * Check if a port is listening
 */
export async function checkPort(
  host: string,
  port: number,
  timeout: number = 5000
): Promise<PortCheckResult> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const socket = createConnection({ host, port }, () => {
      const responseTime = Date.now() - startTime
      socket.destroy()
      resolve({
        success: true,
        port,
        host,
      })
    })

    socket.on("error", (error) => {
      resolve({
        success: false,
        port,
        host,
        error: error.message,
      })
    })

    setTimeout(() => {
      socket.destroy()
      resolve({
        success: false,
        port,
        host,
        error: "Connection timeout",
      })
    }, timeout)
  })
}

/**
 * Perform HTTP health check
 */
export async function httpHealthCheck(
  url: string,
  timeout: number = 10000
): Promise<HealthCheckResult> {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "OpenCode-Verification/1.0",
      },
    })

    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    return {
      success: response.ok,
      statusCode: response.status,
      message: `HTTP ${response.status} ${response.statusText}`,
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        message: `Health check timeout after ${timeout}ms`,
        responseTime,
      }
    }

    return {
      success: false,
      message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
      responseTime,
    }
  }
}

/**
 * Extract port from URL
 */
export function extractPortFromUrl(url: string): number | null {
  try {
    const urlObj = new URL(url)
    const port = urlObj.port ? parseInt(urlObj.port, 10) : (urlObj.protocol === "https:" ? 443 : 80)
    return port
  } catch {
    // Try to extract port from string like "localhost:3000"
    const match = url.match(/:(\d+)/)
    if (match) {
      return parseInt(match[1], 10)
    }
    return null
  }
}

/**
 * Extract host from URL
 */
export function extractHostFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    // Try to extract host from string like "localhost:3000"
    const match = url.match(/([^:]+)/)
    return match ? match[1] : "localhost"
  }
}

/**
 * Wait for service to be ready
 */
export async function waitForServiceReady(
  checkFn: () => Promise<boolean>,
  maxWaitTime: number = 30000,
  checkInterval: number = 1000
): Promise<boolean> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const isReady = await checkFn()
      if (isReady) {
        return true
      }
    } catch {
      // Continue waiting
    }

    await new Promise((resolve) => setTimeout(resolve, checkInterval))
  }

  return false
}

/**
 * Find start command from package.json
 */
export async function findStartCommand(projectPath: string): Promise<string | null> {
  try {
    const { existsSync, readFileSync } = await import("node:fs")
    const { join } = await import("node:path")

    const packageJsonPath = join(projectPath, "package.json")
    if (!existsSync(packageJsonPath)) {
      return null
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
    const scripts = packageJson.scripts || {}

    // Look for common start scripts
    const startScripts = ["dev", "start", "serve", "demo", "run"]
    for (const script of startScripts) {
      if (scripts[script]) {
        return `npm run ${script}`
      }
    }

    return null
  } catch (error) {
    log(`[VerificationUtils] Failed to find start command: ${error}`, { projectPath, error })
    return null
  }
}

