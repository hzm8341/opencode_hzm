/**
 * Session Mapper for Claude Agent SDK Compatibility
 * 
 * This module manages the bidirectional mapping between:
 * - Claude Agent SDK's session_id (claudeSessionId)
 * - OpenCode's sessionID
 * 
 * This mapping is essential for session resume functionality.
 */

import { Session } from "@/session"
import { Storage } from "@/storage/storage"
import { Log } from "@/util/log"

const log = Log.create({ service: "claude-sdk-adapter.session-mapper" })

/**
 * Session Mapper class
 * 
 * Manages bidirectional mapping between Claude SDK and OpenCode sessions
 */
export class SessionMapper {
  // Memory cache for fast lookups
  private claudeToOpenCode = new Map<string, string>() // claudeSessionId -> sessionID
  private openCodeToClaude = new Map<string, string>() // sessionID -> claudeSessionId

  /**
   * Create or update mapping between Claude session ID and OpenCode session ID
   * 
   * @param sessionID - OpenCode session ID
   * @param claudeSessionId - Claude Agent SDK session ID
   */
  async setMapping(sessionID: string, claudeSessionId: string): Promise<void> {
    // Update memory cache
    this.claudeToOpenCode.set(claudeSessionId, sessionID)
    this.openCodeToClaude.set(sessionID, claudeSessionId)

    // Persist to storage
    try {
      // Store mapping in a dedicated storage location
      // Note: We don't need to update Session directly, just store the mapping
      await Storage.write(
        ["claude-sdk-mapping", sessionID],
        {
          sessionID,
          claudeSessionId,
          updatedAt: Date.now(),
        }
      )
    } catch (error) {
      log.error("Failed to persist session mapping", {
        sessionID,
        claudeSessionId,
        error,
      })
      // Don't throw - memory cache is still valid
    }
  }

  /**
   * Get OpenCode session ID from Claude session ID
   * 
   * @param claudeSessionId - Claude Agent SDK session ID
   * @returns OpenCode session ID or undefined if not found
   */
  async getOpenCodeSessionID(claudeSessionId: string): Promise<string | undefined> {
    // Check memory cache first
    const cached = this.claudeToOpenCode.get(claudeSessionId)
    if (cached) {
      return cached
    }

    // Try to load from storage
    try {
      const mappings = await Storage.list(["claude-sdk-mapping"])
      for (const mappingPath of mappings) {
        const mapping = await Storage.read<{
          sessionID: string
          claudeSessionId: string
        }>(mappingPath)

        if (mapping.claudeSessionId === claudeSessionId) {
          // Update cache
          this.claudeToOpenCode.set(claudeSessionId, mapping.sessionID)
          this.openCodeToClaude.set(mapping.sessionID, claudeSessionId)
          return mapping.sessionID
        }
      }
    } catch (error) {
      log.error("Failed to load session mapping from storage", {
        claudeSessionId,
        error,
      })
    }

    // Try to find by checking session metadata
    try {
      const sessions = await Storage.list(["session"])
      for (const sessionPath of sessions) {
        const session = await Session.get(sessionPath[1] as string)
        // Check if session has claudeSessionId in metadata
        // This would require Session.Info to have metadata field
        // For now, we'll rely on the dedicated storage location
      }
    } catch (error) {
      log.error("Failed to search sessions for mapping", {
        claudeSessionId,
        error,
      })
    }

    return undefined
  }

  /**
   * Get Claude session ID from OpenCode session ID
   * 
   * @param sessionID - OpenCode session ID
   * @returns Claude Agent SDK session ID or undefined if not found
   */
  async getClaudeSessionID(sessionID: string): Promise<string | undefined> {
    // Check memory cache first
    const cached = this.openCodeToClaude.get(sessionID)
    if (cached) {
      return cached
    }

    // Try to load from storage
    try {
      const mapping = await Storage.read<{
        sessionID: string
        claudeSessionId: string
      }>(["claude-sdk-mapping", sessionID])

      if (mapping) {
        // Update cache
        this.claudeToOpenCode.set(mapping.claudeSessionId, sessionID)
        this.openCodeToClaude.set(sessionID, mapping.claudeSessionId)
        return mapping.claudeSessionId
      }
    } catch (error) {
      // Mapping not found or error reading - that's okay
      log.debug("Session mapping not found in storage", {
        sessionID,
        error,
      })
    }

    return undefined
  }

  /**
   * Remove mapping (when session is deleted)
   * 
   * @param sessionID - OpenCode session ID
   */
  async removeMapping(sessionID: string): Promise<void> {
    const claudeSessionId = this.openCodeToClaude.get(sessionID)
    if (claudeSessionId) {
      this.claudeToOpenCode.delete(claudeSessionId)
    }
    this.openCodeToClaude.delete(sessionID)

    // Remove from storage
    try {
      await Storage.remove(["claude-sdk-mapping", sessionID])
    } catch (error) {
      log.error("Failed to delete session mapping from storage", {
        sessionID,
        error,
      })
    }
  }

  /**
   * Clear all mappings (for testing or reset)
   */
  clear(): void {
    this.claudeToOpenCode.clear()
    this.openCodeToClaude.clear()
  }

  /**
   * Get all mappings (for debugging)
   */
  getAllMappings(): Array<{ sessionID: string; claudeSessionId: string }> {
    const mappings: Array<{ sessionID: string; claudeSessionId: string }> = []
    for (const [sessionID, claudeSessionId] of this.openCodeToClaude) {
      mappings.push({ sessionID, claudeSessionId })
    }
    return mappings
  }
}
