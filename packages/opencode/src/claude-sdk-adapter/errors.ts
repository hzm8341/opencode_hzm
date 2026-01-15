/**
 * Error types for Claude SDK Adapter
 */

import { NamedError } from "@opencode-ai/util/error"
import z from "zod"

/**
 * Session not found error
 */
export const SessionNotFoundError = NamedError.create(
  "SessionNotFoundError",
  z.object({
    sessionID: z.string().optional(),
    claudeSessionId: z.string().optional(),
    message: z.string(),
  })
)

/**
 * Migration error
 */
export const MigrationError = NamedError.create(
  "MigrationError",
  z.object({
    sessionId: z.string().optional(),
    messageId: z.string().optional(),
    message: z.string(),
  })
)

/**
 * Permission error
 */
export const PermissionError = NamedError.create(
  "PermissionError",
  z.object({
    toolName: z.string(),
    sessionID: z.string(),
    message: z.string(),
  })
)

/**
 * Message conversion error
 */
export const MessageConversionError = NamedError.create(
  "MessageConversionError",
  z.object({
    sessionID: z.string(),
    message: z.string(),
    originalError: z.unknown().optional(),
  })
)
