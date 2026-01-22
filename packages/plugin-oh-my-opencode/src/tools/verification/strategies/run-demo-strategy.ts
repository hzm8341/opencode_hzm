/**
 * Run Demo Verification Strategy
 * 
 * Verifies that a demo/service is running successfully.
 */

import type { VerificationStrategy, ServiceHandle } from "../types"
import type { VerificationContext, VerificationResult } from "../../../features/unified-executor/types"
import { VerificationMethod } from "../../../features/unified-executor/types"
import {
  checkPort,
  httpHealthCheck,
  extractPortFromUrl,
  extractHostFromUrl,
  waitForServiceReady,
  findStartCommand,
} from "../utils"
import { log } from "../../../shared/logger"
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"

/**
 * Run Demo Verification Strategy
 */
export class RunDemoVerificationStrategy implements VerificationStrategy {
  name = "run-demo"
  description = "Verify that a demo/service is running successfully"
  priority = 100

  private runningServices: Map<string, ServiceHandle> = new Map()

  match(taskType: string, taskDescription: string): boolean {
    const lowerType = taskType.toLowerCase()
    const lowerDesc = taskDescription.toLowerCase()

    return (
      lowerType === "run_demo" ||
      lowerDesc.includes("run demo") ||
      lowerDesc.includes("运行demo") ||
      lowerDesc.includes("启动") ||
      lowerDesc.includes("start")
    )
  }

  async verify(context: VerificationContext): Promise<VerificationResult> {
    log(`[RunDemoStrategy] Starting verification`, {
      sessionID: context.sessionId,
      target: context.successCriteria.verification.target,
    })

    const evidence: VerificationResult["evidence"] = []

    try {
      // Step 1: Determine verification method
      const method = context.successCriteria.verification.method
      const target = context.successCriteria.verification.target

      if (method === VerificationMethod.HTTP_CHECK) {
        // HTTP health check
        return await this.verifyHttpService(context, target, evidence)
      } else if (method === VerificationMethod.PORT_CHECK) {
        // Port check
        return await this.verifyPortService(context, target, evidence)
      } else if (method === VerificationMethod.COMMAND_CHECK) {
        // Command check (run command and verify output)
        return await this.verifyCommand(context, target, evidence)
      } else {
        // Default: Try to detect service type and verify
        return await this.verifyAutoDetect(context, target, evidence)
      }
    } catch (error) {
      log(`[RunDemoStrategy] Verification error: ${error}`, {
        sessionID: context.sessionId,
        error,
      })

      return {
        success: false,
        message: `Verification failed: ${error instanceof Error ? error.message : String(error)}`,
        evidence,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Verify HTTP service
   */
  private async verifyHttpService(
    context: VerificationContext,
    url: string,
    evidence: VerificationResult["evidence"]
  ): Promise<VerificationResult> {
    log(`[RunDemoStrategy] Verifying HTTP service: ${url}`, {
      sessionID: context.sessionId,
    })

    // Perform health check
    const healthCheck = await httpHealthCheck(url, 10000)
    evidence?.push({
      type: "health_check",
      data: JSON.stringify(healthCheck),
    })

    if (!healthCheck.success) {
      // Service might not be running, try to start it
      log(`[RunDemoStrategy] Service not responding, attempting to start`, {
        sessionID: context.sessionId,
      })

      const started = await this.ensureServiceRunning(context)
      if (started) {
        // Wait a bit for service to be ready
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Retry health check
        const retryCheck = await httpHealthCheck(url, 10000)
        evidence?.push({
          type: "health_check_retry",
          data: JSON.stringify(retryCheck),
        })

        return {
          success: retryCheck.success,
          message: retryCheck.success
            ? `Service is running and healthy: ${retryCheck.message}`
            : `Service started but health check failed: ${retryCheck.message}`,
          evidence,
        }
      }
    }

    return {
      success: healthCheck.success,
      message: healthCheck.success
        ? `Service is running and healthy: ${healthCheck.message}`
        : `Health check failed: ${healthCheck.message}`,
      evidence,
    }
  }

  /**
   * Verify port service
   */
  private async verifyPortService(
    context: VerificationContext,
    target: string,
    evidence: VerificationResult["evidence"]
  ): Promise<VerificationResult> {
    // Extract port from target (could be "localhost:3000" or just "3000")
    const port = extractPortFromUrl(target) || parseInt(target, 10)
    const host = extractHostFromUrl(target) || "localhost"

    if (isNaN(port)) {
      return {
        success: false,
        message: `Invalid port: ${target}`,
        evidence,
        error: "Invalid port format",
      }
    }

    log(`[RunDemoStrategy] Verifying port service: ${host}:${port}`, {
      sessionID: context.sessionId,
    })

    const portCheck = await checkPort(host, port, 5000)
    evidence?.push({
      type: "port_check",
      data: JSON.stringify(portCheck),
    })

    if (!portCheck.success) {
      // Port not listening, try to start service
      log(`[RunDemoStrategy] Port not listening, attempting to start service`, {
        sessionID: context.sessionId,
      })

      const started = await this.ensureServiceRunning(context)
      if (started) {
        // Wait for service to be ready
        const isReady = await waitForServiceReady(
          async () => {
            const retryCheck = await checkPort(host, port, 2000)
            return retryCheck.success
          },
          30000,
          1000
        )

        if (isReady) {
          return {
            success: true,
            message: `Service started and port ${port} is now listening`,
            evidence,
          }
        }
      }
    }

    return {
      success: portCheck.success,
      message: portCheck.success
        ? `Port ${port} is listening`
        : `Port ${port} is not listening: ${portCheck.error}`,
      evidence,
    }
  }

  /**
   * Verify command output
   */
  private async verifyCommand(
    context: VerificationContext,
    command: string,
    evidence: VerificationResult["evidence"]
  ): Promise<VerificationResult> {
    log(`[RunDemoStrategy] Verifying command: ${command}`, {
      sessionID: context.sessionId,
    })

    try {
      const { execSync } = await import("node:child_process")
      const output = execSync(command, {
        cwd: context.projectPath,
        encoding: "utf-8",
        timeout: 10000,
      })

      evidence?.push({
        type: "command_output",
        data: output,
      })

      // Check if output matches expected
      const expected = context.successCriteria.verification.expected
      const matches = expected ? output.includes(expected) : true

      return {
        success: matches,
        message: matches
          ? `Command executed successfully`
          : `Command output does not match expected: ${expected}`,
        evidence,
      }
    } catch (error) {
      return {
        success: false,
        message: `Command execution failed: ${error instanceof Error ? error.message : String(error)}`,
        evidence,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Auto-detect service type and verify
   */
  private async verifyAutoDetect(
    context: VerificationContext,
    target: string,
    evidence: VerificationResult["evidence"]
  ): Promise<VerificationResult> {
    log(`[RunDemoStrategy] Auto-detecting service type: ${target}`, {
      sessionID: context.sessionId,
    })

    // Try HTTP first
    if (target.startsWith("http://") || target.startsWith("https://")) {
      return await this.verifyHttpService(context, target, evidence)
    }

    // Try port
    const port = extractPortFromUrl(target) || parseInt(target, 10)
    if (!isNaN(port)) {
      return await this.verifyPortService(context, target, evidence)
    }

    // Try command
    return await this.verifyCommand(context, target, evidence)
  }

  /**
   * Ensure service is running
   */
  private async ensureServiceRunning(context: VerificationContext): Promise<boolean> {
    const serviceKey = context.sessionId

    // Check if service is already running
    if (this.runningServices.has(serviceKey)) {
      const handle = this.runningServices.get(serviceKey)!
      // Check if process is still alive
      if (handle.pid) {
        try {
          process.kill(handle.pid, 0) // Signal 0 checks if process exists
          log(`[RunDemoStrategy] Service already running: PID ${handle.pid}`, {
            sessionID: context.sessionId,
          })
          return true
        } catch {
          // Process is dead, remove from map
          this.runningServices.delete(serviceKey)
        }
      }
    }

    // Find start command
    const startCommand = await findStartCommand(context.projectPath)
    if (!startCommand) {
      log(`[RunDemoStrategy] No start command found`, {
        sessionID: context.sessionId,
        projectPath: context.projectPath,
      })
      return false
    }

    log(`[RunDemoStrategy] Starting service: ${startCommand}`, {
      sessionID: context.sessionId,
    })

    try {
      // Parse command
      const [cmd, ...args] = startCommand.split(" ")

      // Start service
      const process = spawn(cmd, args, {
        cwd: context.projectPath,
        stdio: "pipe",
        detached: true,
      })

      const handle: ServiceHandle = {
        pid: process.pid,
        command: startCommand,
        cwd: context.projectPath,
        process,
      }

      this.runningServices.set(serviceKey, handle)

      log(`[RunDemoStrategy] Service started: PID ${process.pid}`, {
        sessionID: context.sessionId,
        pid: process.pid,
      })

      return true
    } catch (error) {
      log(`[RunDemoStrategy] Failed to start service: ${error}`, {
        sessionID: context.sessionId,
        error,
      })
      return false
    }
  }

  /**
   * Cleanup running services (optional)
   */
  cleanup(sessionID: string): void {
    const handle = this.runningServices.get(sessionID)
    if (handle && handle.process) {
      try {
        handle.process.kill("SIGTERM")
        log(`[RunDemoStrategy] Cleaned up service for session: ${sessionID}`)
      } catch {
        // Ignore errors
      }
      this.runningServices.delete(sessionID)
    }
  }
}

