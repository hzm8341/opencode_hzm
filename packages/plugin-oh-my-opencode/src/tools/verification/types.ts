/**
 * Verification System - Type Definitions
 * 
 * Type definitions for the end-to-end verification system.
 */

import type { SuccessCriteria, VerificationContext, VerificationResult } from "../../features/unified-executor/types"

/**
 * Verification strategy interface
 */
export interface VerificationStrategy {
  /** Strategy name */
  name: string
  
  /** Strategy description */
  description: string
  
  /** Match task type and description */
  match(taskType: string, taskDescription: string): boolean
  
  /** Execute verification */
  verify(context: VerificationContext): Promise<VerificationResult>
  
  /** Strategy priority (higher = preferred when multiple strategies match) */
  priority?: number
}

/**
 * Service handle for managing running services
 */
export interface ServiceHandle {
  /** Process ID */
  pid?: number
  
  /** Command used to start service */
  command: string
  
  /** Working directory */
  cwd: string
  
  /** Process handle */
  process?: {
    kill(signal?: string | number): void
  }
  
  /** Service URL (if applicable) */
  url?: string
  
  /** Port (if applicable) */
  port?: number
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  /** Whether health check passed */
  success: boolean
  
  /** Status code (for HTTP) */
  statusCode?: number
  
  /** Response message */
  message: string
  
  /** Response time in milliseconds */
  responseTime?: number
}

/**
 * Port check result
 */
export interface PortCheckResult {
  /** Whether port is listening */
  success: boolean
  
  /** Port number */
  port: number
  
  /** Host */
  host: string
  
  /** Error message if failed */
  error?: string
}

