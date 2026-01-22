/**
 * Claude Agent SDK Adapter for OpenCode
 * 
 * This module provides a compatibility layer that allows Claude Agent SDK
 * to work with OpenCode's agent system.
 * 
 * Main entry point: `ClaudeAgentSDKAdapter`
 */

import { Session } from "@/session"
import { SessionPrompt } from "@/session/prompt"
import { MessageV2 } from "@/session/message-v2"
import { Bus } from "@/bus"
import { SessionStatus } from "@/session/status"
import { PermissionInterceptor } from "./permission-interceptor"
import { MessageConverter, type SDKMessage, type OpenCodeStreamEvent } from "./message-converter"
import { SessionMapper } from "./session-mapper"
import { Log } from "@/util/log"
import { Agent } from "@/agent/agent"
import { Identifier } from "@/id/id"
import { Instance } from "@/project/instance"
import { SessionNotFoundError, MessageConversionError } from "./errors"

const log = Log.create({ service: "claude-sdk-adapter" })

/**
 * Query options matching Claude Agent SDK's interface
 */
export interface QueryOptions {
  prompt: string
  options?: {
    cwd?: string
    resume?: string // claudeSessionId
    abortController?: AbortController
    canUseTool?: (
      toolName: string,
      input: unknown,
      opts: { signal: AbortSignal }
    ) => Promise<{
      behavior: "allow" | "deny" | "ask"
      updatedInput?: unknown
      message?: string
    }>
    [key: string]: unknown
  }
}

/**
 * Claude Agent SDK Adapter
 * 
 * Provides a compatibility layer between Claude Agent SDK and OpenCode
 */
export class ClaudeAgentSDKAdapter {
  private permissionInterceptor: PermissionInterceptor
  private messageConverter: MessageConverter
  private sessionMapper: SessionMapper

  constructor(options?: {
    permissionInterceptor?: PermissionInterceptor
    messageConverter?: MessageConverter
    sessionMapper?: SessionMapper
  }) {
    this.permissionInterceptor = options?.permissionInterceptor ?? new PermissionInterceptor()
    this.messageConverter = options?.messageConverter ?? new MessageConverter()
    this.sessionMapper = options?.sessionMapper ?? new SessionMapper()
  }

  /**
   * Query function compatible with Claude Agent SDK's query interface
   * 
   * @param options - Query options
   * @returns Async generator of SDK messages
   */
  async* query(options: QueryOptions): AsyncGenerator<SDKMessage, void, unknown> {
    const { prompt, options: queryOptions = {} } = options
    const { cwd, resume, abortController, canUseTool } = queryOptions

    // 1. Get or create session
    let sessionID: string
    let claudeSessionId: string | undefined

    if (resume) {
      // Resume existing session
      const mappedSessionID = await this.sessionMapper.getOpenCodeSessionID(resume)
      if (!mappedSessionID) {
        throw new SessionNotFoundError({
          claudeSessionId: resume,
          message: `Session not found for claudeSessionId: ${resume}`,
        })
      }
      sessionID = mappedSessionID
      claudeSessionId = resume
    } else {
      // Create new session
      sessionID = await this.createSession({
        directory: cwd || Instance.directory || process.cwd(),
        title: await this.generateTitle(prompt),
      })
    }

    // 2. Create permission handler (for future use in tool execution)
    // Note: OpenCode handles permissions internally, but we keep this for compatibility
    const permissionHandler = this.permissionInterceptor.createCanUseToolHandler(sessionID)
    
    // If custom canUseTool is provided, wrap it
    const finalCanUseTool = canUseTool
      ? async (toolName: string, input: unknown, opts: { signal: AbortSignal }) => {
          // Try custom handler first
          const customResult = await canUseTool(toolName, input, opts)
          if (customResult.behavior !== "ask") {
            return customResult
          }
          // Fall through to OpenCode permission system
          return await permissionHandler(toolName, input, opts)
        }
      : permissionHandler

    // 3. Set up event stream BEFORE calling prompt
    // This ensures we don't miss any events
    const opencodeStream = this.createOpenCodeStream(sessionID, abortController)

    // 4. Start prompt processing in background
    // Use a small delay to ensure event listeners are set up
    const promptPromise = (async () => {
      // Wait a bit to ensure event listeners are ready
      await new Promise(resolve => setTimeout(resolve, 10))
      return this.callOpenCodePrompt(sessionID, prompt, {
        directory: cwd,
        abort: abortController?.signal,
      }).catch((error) => {
        log.error("Prompt processing failed", { sessionID, error })
        return error
      })
    })()

    // 5. Convert and yield messages from stream
    let initMessageSent = false
    try {
      for await (const sdkMessage of this.messageConverter.convertStream(opencodeStream, sessionID)) {
        try {
          // Capture claudeSessionId from init message
          if (!initMessageSent && sdkMessage.type === "system" && "subtype" in sdkMessage && sdkMessage.subtype === "init") {
            initMessageSent = true
            const sdkSessionId = sdkMessage.session_id
            if (sdkSessionId && !claudeSessionId) {
              claudeSessionId = sdkSessionId
              // Store mapping
              await this.sessionMapper.setMapping(sessionID, sdkSessionId).catch((error) => {
                log.error("Failed to store session mapping", { sessionID, sdkSessionId, error })
              })
            } else if (claudeSessionId && sdkSessionId) {
              // Update mapping if both exist
              await this.sessionMapper.setMapping(sessionID, sdkSessionId).catch((error) => {
                log.error("Failed to update session mapping", { sessionID, sdkSessionId, error })
              })
            }
          }

          yield sdkMessage
        } catch (error) {
          log.error("Error processing SDK message", { sessionID, error })
          throw new MessageConversionError({
            sessionID,
            message: `Failed to process message: ${error instanceof Error ? error.message : String(error)}`,
            originalError: error,
          })
        }
      }
    } catch (error) {
      // Handle stream errors
      if (error instanceof MessageConversionError) {
        throw error
      }
      log.error("Stream processing error", { sessionID, error })
      throw new MessageConversionError({
        sessionID,
        message: `Stream processing failed: ${error instanceof Error ? error.message : String(error)}`,
        originalError: error,
      })
    } finally {
      // Wait for prompt to complete
      try {
        await promptPromise
      } catch (error) {
        log.error("Prompt processing error", { sessionID, error })
        // Don't throw - stream may have already completed
      }
    }
  }

  /**
   * Create OpenCode event stream from Bus events
   */
  private createOpenCodeStream(
    sessionID: string,
    abortController?: AbortController
  ): AsyncIterable<OpenCodeStreamEvent> {
    const events: OpenCodeStreamEvent[] = []
    let resolveNext: ((value: OpenCodeStreamEvent | null) => void) | null = null
    let isComplete = false
    let currentMessage: MessageV2.Assistant | null = null
    const seenParts = new Set<string>()
    const seenMessages = new Set<string>()

    // Subscribe to Bus events
    const unsubscribeMessage = Bus.subscribe(MessageV2.Event.Updated, async (evt) => {
      if (evt.properties.info.sessionID !== sessionID) return
      if (evt.properties.info.role !== "assistant") return

      const message = evt.properties.info as MessageV2.Assistant
      const messageKey = message.id

      // Only emit message.created once per message
      if (!seenMessages.has(messageKey)) {
        seenMessages.add(messageKey)
        currentMessage = message

        // Emit message.created event
        events.push({
          type: "message.created",
          message,
        })
        if (resolveNext) {
          resolveNext(events.shift() || null)
          resolveNext = null
        }
      }
    })

    const unsubscribePart = Bus.subscribe(MessageV2.Event.PartUpdated, async (evt) => {
      if (evt.properties.part.sessionID !== sessionID) return

      const part = evt.properties.part
      const partKey = `${part.messageID}-${part.id}`

      // Check if this is a new part or an update
      if (!seenParts.has(partKey)) {
        seenParts.add(partKey)
        events.push({
          type: "part.created",
          part,
          messageID: part.messageID,
        })
      } else {
        events.push({
          type: "part.updated",
          part,
          messageID: part.messageID,
          delta: evt.properties.delta, // Include delta for streaming text
        })
      }

      if (resolveNext) {
        resolveNext(events.shift() || null)
        resolveNext = null
      }
    })

    // Subscribe to session status to detect completion
    const unsubscribeStatus = Bus.subscribe(SessionStatus.Event.Idle, async (evt) => {
      // When session becomes idle, mark as complete
      // Note: We can't check sessionID here as Idle event doesn't include it
      // But we'll check in the stream iterator
      isComplete = true
      if (resolveNext) {
        resolveNext(null)
        resolveNext = null
      }
    })

    // Also subscribe to status events for more precise control
    const unsubscribeStatusDetail = Bus.subscribe(SessionStatus.Event.Status, async (evt) => {
      if (evt.properties.sessionID === sessionID && evt.properties.status.type === "idle") {
        isComplete = true
        if (resolveNext) {
          resolveNext(null)
          resolveNext = null
        }
      }
    })

    // Handle abort
    if (abortController) {
      abortController.signal.addEventListener("abort", () => {
        isComplete = true
        if (resolveNext) {
          resolveNext(null)
          resolveNext = null
        }
        unsubscribeMessage()
        unsubscribePart()
        unsubscribeStatus()
        unsubscribeStatusDetail()
      })
    }

    return {
      async *[Symbol.asyncIterator]() {
        try {
          // Yield init message first
          yield {
            type: "message.created",
            message: {
              id: Identifier.ascending("message"),
              sessionID,
              role: "assistant",
              agent: "",
              parentID: "",
              modelID: "",
              providerID: "",
              mode: "",
              path: {
                cwd: process.cwd(),
                root: process.cwd(),
              },
              cost: 0,
              tokens: {
                input: 0,
                output: 0,
                reasoning: 0,
                cache: {
                  read: 0,
                  write: 0,
                },
              },
              time: {
                created: Date.now(),
              },
            },
          }

          while (!isComplete) {
            if (events.length > 0) {
              const event = events.shift()!
              if (event) {
                yield event
              }
            } else {
              // Wait for next event with timeout
              const event = await Promise.race([
                new Promise<OpenCodeStreamEvent | null>((resolve) => {
                  resolveNext = resolve
                }),
                new Promise<null>((resolve) => {
                  setTimeout(() => resolve(null), 1000) // 1 second timeout
                }),
              ])

              if (event) {
                yield event
              } else if (events.length === 0 && isComplete) {
                // No more events and we're done
                break
              }
            }
          }

          // Emit completion event if we have a current message
          if (currentMessage) {
            yield {
              type: "message.completed",
              messageID: currentMessage.id,
            }
          }
        } finally {
          unsubscribeMessage()
          unsubscribePart()
          unsubscribeStatus()
          unsubscribeStatusDetail()
        }
      },
    }
  }

  /**
   * Call OpenCode prompt
   */
  private async callOpenCodePrompt(
    sessionID: string,
    prompt: string,
    options: {
      directory?: string
      abort?: AbortSignal
    }
  ): Promise<void> {
    try {
      // Check if aborted before calling
      if (options.abort?.aborted) {
        log.info("Prompt call aborted before execution", { sessionID })
        return
      }

      await SessionPrompt.prompt({
        sessionID,
        parts: [
          {
            type: "text",
            text: prompt,
          },
        ],
      })
    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === "AbortError" || options.abort?.aborted) {
          log.info("Prompt call aborted", { sessionID })
          return // Abort is not an error
        }
      }
      log.error("Failed to call OpenCode prompt", { sessionID, error })
      throw error
    }
  }

  /**
   * Create a new OpenCode session
   */
  private async createSession(options: {
    directory: string
    title: string
  }): Promise<string> {
    const session = await Session.createNext({
      directory: options.directory,
      title: options.title,
    })
    return session.id
  }

  /**
   * Generate a title from prompt
   */
  private async generateTitle(prompt: string): Promise<string> {
    // Simple title generation - take first line or first 50 characters
    const firstLine = prompt.split("\n")[0].trim()
    if (firstLine.length <= 50) {
      return firstLine
    }
    return firstLine.substring(0, 47) + "..."
  }
}

/**
 * Create a query function compatible with Claude Agent SDK
 * 
 * This is the main entry point for using the adapter
 * 
 * @example
 * ```typescript
 * import { query } from "./claude-sdk-adapter"
 * 
 * const q = query({
 *   prompt: "Hello, world!",
 *   options: {
 *     cwd: "/path/to/project",
 *   }
 * })
 * 
 * for await (const message of q) {
 *   console.log(message)
 * }
 * ```
 */
export function query(options: QueryOptions): AsyncIterable<SDKMessage> {
  const adapter = new ClaudeAgentSDKAdapter()
  return adapter.query(options)
}
