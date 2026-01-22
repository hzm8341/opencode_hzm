/**
 * Data Migrator for Claude-Cowork to OpenCode Migration
 * 
 * This module migrates data from Claude-Cowork's SQLite database
 * to OpenCode's file system storage format.
 * 
 * Migration process:
 * 1. Read sessions and messages from SQLite
 * 2. Convert to OpenCode format
 * 3. Write to OpenCode storage
 * 4. Validate data integrity
 */

// Use Bun's built-in SQLite support
import { Database } from "bun:sqlite"
import { Storage } from "@/storage/storage"
import { Session } from "@/session"
import { MessageV2 } from "@/session/message-v2"
import { Identifier } from "@/id/id"
import { MessageConverter, type SDKMessage } from "./message-converter"
import { Log } from "@/util/log"
import { Instance } from "@/project/instance"
import path from "path"
import fs from "fs/promises"

const log = Log.create({ service: "claude-sdk-adapter.data-migrator" })

/**
 * Claude-Cowork session structure from SQLite
 */
interface ClaudeCoworkSession {
  id: string
  title: string
  claude_session_id: string | null
  status: string
  cwd: string | null
  allowed_tools: string | null
  last_prompt: string | null
  created_at: number
  updated_at: number
}

/**
 * Claude-Cowork message structure from SQLite
 */
interface ClaudeCoworkMessage {
  id: string
  session_id: string
  data: string // JSON string
  created_at: number
}

/**
 * Migration result
 */
export interface MigrationResult {
  sessionsMigrated: number
  messagesMigrated: number
  errors: Array<{ sessionId?: string; messageId?: string; error: string }>
  warnings: Array<{ sessionId?: string; message: string }>
}

/**
 * Data Migrator class
 */
export class DataMigrator {
  private converter = new MessageConverter()
  private errors: Array<{ sessionId?: string; messageId?: string; error: string }> = []
  private warnings: Array<{ sessionId?: string; message: string }> = []

  /**
   * Migrate data from Claude-Cowork SQLite database to OpenCode storage
   * 
   * @param sqlitePath - Path to Claude-Cowork SQLite database
   * @param projectID - OpenCode project ID (optional, will be determined from cwd if not provided)
   * @returns Migration result
   */
  async migrateFromSQLite(
    sqlitePath: string,
    projectID?: string
  ): Promise<MigrationResult> {
    this.errors = []
    this.warnings = []

    // Check if database exists
    try {
      await fs.access(sqlitePath)
    } catch (error) {
      throw new Error(`Database file not found: ${sqlitePath}`)
    }

    // Open database
    const db = new Database(sqlitePath, { readonly: true })

    try {
      // Read all sessions
      const stmt = db.prepare(
        `SELECT id, title, claude_session_id, status, cwd, allowed_tools, last_prompt, created_at, updated_at
         FROM sessions
         ORDER BY created_at ASC`
      )
      const sessions = stmt.all() as ClaudeCoworkSession[]

      log.info("Found sessions to migrate", { count: sessions.length })

      let sessionsMigrated = 0
      let messagesMigrated = 0

      for (const session of sessions) {
        try {
          const result = await this.migrateSession(session, db, projectID)
          sessionsMigrated++
          messagesMigrated += result.messagesCount
        } catch (error) {
          this.errors.push({
            sessionId: session.id,
            error: error instanceof Error ? error.message : String(error),
          })
          log.error("Failed to migrate session", {
            sessionId: session.id,
            error,
          })
        }
      }

      return {
        sessionsMigrated,
        messagesMigrated,
        errors: this.errors,
        warnings: this.warnings,
      }
    } finally {
      db.close()
    }
  }

  /**
   * Migrate a single session
   */
  private async migrateSession(
    session: ClaudeCoworkSession,
    db: Database,
    projectID?: string
  ): Promise<{ messagesCount: number }> {
    // Determine project ID from cwd
    let finalProjectID = projectID
    if (!finalProjectID && session.cwd) {
      try {
        // Try to get project ID from worktree
        finalProjectID = await this.getProjectIDFromCwd(session.cwd)
      } catch (error) {
        this.warnings.push({
          sessionId: session.id,
          message: `Could not determine project ID from cwd: ${session.cwd}`,
        })
        // Use a default project ID
        finalProjectID = "migrated"
      }
    }
    if (!finalProjectID) {
      finalProjectID = "migrated"
    }

    // Convert session to OpenCode format
    const opencodeSession: Session.Info = {
      id: session.id,
      projectID: finalProjectID,
      directory: session.cwd || process.cwd(),
      title: session.title,
      version: "migrated",
      time: {
        created: session.created_at,
        updated: session.updated_at,
      },
      // Store Claude-Cowork specific data in a way that can be accessed later
      // Note: Session.Info doesn't have a metadata field, so we'll store it separately
    }

    // Write session
    await Storage.write(["session", finalProjectID, session.id], opencodeSession)

    // Store Claude-Cowork metadata separately
    if (session.claude_session_id || session.allowed_tools || session.last_prompt) {
      await Storage.write(
        ["claude-cowork-metadata", session.id],
        {
          claudeSessionId: session.claude_session_id,
          allowedTools: session.allowed_tools,
          lastPrompt: session.last_prompt,
          originalStatus: session.status,
          migratedAt: Date.now(),
        }
      )
    }

    // Read messages for this session
    const msgStmt = db.prepare(
      `SELECT id, session_id, data, created_at
       FROM messages
       WHERE session_id = ?
       ORDER BY created_at ASC`
    )
    const messages = msgStmt.all(session.id) as ClaudeCoworkMessage[]

    let messagesCount = 0

    // Migrate messages
    for (const msg of messages) {
      try {
        await this.migrateMessage(msg, session.id, finalProjectID)
        messagesCount++
      } catch (error) {
        this.errors.push({
          sessionId: session.id,
          messageId: msg.id,
          error: error instanceof Error ? error.message : String(error),
        })
        log.error("Failed to migrate message", {
          sessionId: session.id,
          messageId: msg.id,
          error,
        })
      }
    }

    return { messagesCount }
  }

  /**
   * Migrate a single message
   */
  private async migrateMessage(
    msg: ClaudeCoworkMessage,
    sessionID: string,
    projectID: string
  ): Promise<void> {
    // Parse SDK message from JSON
    let sdkMessage: SDKMessage | SDKMessage[]
    try {
      sdkMessage = JSON.parse(msg.data) as SDKMessage | SDKMessage[]
    } catch (error) {
      throw new Error(`Failed to parse message JSON: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Handle array of messages or single message
    const messages = Array.isArray(sdkMessage) ? sdkMessage : [sdkMessage]

    // Determine agent name (default to "build")
    const agentName = "build"

    // Convert SDK messages to OpenCode format
    // Note: We need to handle the case where multiple SDK messages might belong to one OpenCode message
    // For simplicity, we'll create one OpenCode message per SDK message sequence
    const opencodeMessage = await this.converter.convertFromSDK(
      messages,
      sessionID,
      agentName
    )

    // Set message ID from original if available, otherwise use generated
    if (msg.id && msg.id !== opencodeMessage.id) {
      // Store original ID in metadata if needed
      opencodeMessage.id = msg.id
    }

    // Set time from original message
    opencodeMessage.time = {
      created: msg.created_at,
      completed: msg.created_at, // Estimate completion time
    }

    // Extract parts from message
    const parts = (opencodeMessage as any).parts || []

    // Write message (without parts)
    const messageToWrite = { ...opencodeMessage }
    delete (messageToWrite as any).parts
    await Storage.write(
      ["message", sessionID, opencodeMessage.id],
      messageToWrite
    )

    // Write parts
    for (const part of parts) {
      await Storage.write(
        ["part", opencodeMessage.id, part.id],
        {
          ...part,
          // Add migration metadata
          metadata: {
            ...(part.type === "tool" ? part.metadata : {}),
            migratedFrom: "claude-cowork",
            migrationTimestamp: Date.now(),
            originalMessageId: msg.id,
          },
        }
      )
    }
  }

  /**
   * Get project ID from working directory
   */
  private async getProjectIDFromCwd(cwd: string): Promise<string> {
    // Try to get git commit hash as project ID
    try {
      const { $ } = await import("bun")
      const [id] = await $`git rev-list --max-parents=0 --all`
        .quiet()
        .nothrow()
        .cwd(cwd)
        .text()
        .then((x) =>
          x
            .split("\n")
            .filter(Boolean)
            .map((x) => x.trim())
            .toSorted(),
        )
      if (id) return id
    } catch (error) {
      // Git command failed, continue
    }

    // Fallback: use directory name hash or similar
    // For now, return a default
    return "migrated"
  }

  /**
   * Validate migration
   * 
   * @param sqlitePath - Path to original SQLite database
   * @returns Validation result
   */
  async validateMigration(sqlitePath: string): Promise<{
    valid: boolean
    issues: Array<{ type: "error" | "warning"; message: string }>
  }> {
    const issues: Array<{ type: "error" | "warning"; message: string }> = []

    // Open database (Bun SQLite doesn't support readonly option, but we'll be careful)
    const db = new Database(sqlitePath)

    try {
      // Count sessions in SQLite
      const countStmt = db.prepare(`SELECT COUNT(*) as count FROM sessions`)
      const sqliteSessionCount = countStmt.get() as { count: number }

      // Count sessions in OpenCode storage
      // This is approximate - we'd need to scan all projects
      const opencodeSessions = await Storage.list(["session"])
      const opencodeSessionCount = opencodeSessions.length

      if (sqliteSessionCount.count !== opencodeSessionCount) {
        issues.push({
          type: "warning",
          message: `Session count mismatch: SQLite has ${sqliteSessionCount.count}, OpenCode has ${opencodeSessionCount}`,
        })
      }

      // Validate each session
      const sessionStmt = db.prepare(
        `SELECT id FROM sessions ORDER BY created_at ASC`
      )
      const sessions = sessionStmt.all() as Array<{ id: string }>

      for (const session of sessions) {
        // Check if session exists in OpenCode
        try {
          // Try to find session in any project
          const sessionFiles = await Storage.list(["session"])
          const found = sessionFiles.some(
            (file) => file[file.length - 1] === session.id
          )

          if (!found) {
            issues.push({
              type: "error",
              message: `Session ${session.id} not found in OpenCode storage`,
            })
            continue
          }

          // Count messages
          const msgCountStmt = db.prepare(`SELECT COUNT(*) as count FROM messages WHERE session_id = ?`)
          const sqliteMessageCount = msgCountStmt.get(session.id) as { count: number }

          const opencodeMessages = await Storage.list(["message", session.id])
          const opencodeMessageCount = opencodeMessages.length

          if (sqliteMessageCount.count !== opencodeMessageCount) {
            issues.push({
              type: "warning",
              message: `Message count mismatch for session ${session.id}: SQLite has ${sqliteMessageCount.count}, OpenCode has ${opencodeMessageCount}`,
            })
          }
        } catch (error) {
          issues.push({
            type: "error",
            message: `Failed to validate session ${session.id}: ${error instanceof Error ? error.message : String(error)}`,
          })
        }
      }
    } finally {
      db.close()
    }

    return {
      valid: issues.filter((i) => i.type === "error").length === 0,
      issues,
    }
  }
}
