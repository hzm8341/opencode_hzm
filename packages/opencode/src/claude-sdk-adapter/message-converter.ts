/**
 * Message Format Converter for Claude Agent SDK Compatibility
 * 
 * This module converts between OpenCode's MessageV2 format and Claude Agent SDK's message format.
 * 
 * Key differences:
 * - OpenCode: Hierarchical structure (Message -> Parts)
 * - Claude SDK: Flat structure (linear message stream)
 * - OpenCode: Tool calls are parts with state
 * - Claude SDK: Tool calls are separate messages
 */

import { MessageV2 } from "@/session/message-v2"
import { Identifier } from "@/id/id"
import { Log } from "@/util/log"
import { AsyncLock } from "./async-lock"

const log = Log.create({ service: "claude-sdk-adapter.message-converter" })

/**
 * Claude Agent SDK message types
 */
export type SDKMessage =
  | { type: "system"; subtype: "init"; session_id?: string; [key: string]: unknown }
  | { type: "text"; text: string; [key: string]: unknown }
  | { type: "tool-call"; toolName: string; input: unknown; id?: string; [key: string]: unknown }
  | { type: "tool-result"; result: unknown; id?: string; [key: string]: unknown }
  | { type: "result"; subtype: "success" | "error"; [key: string]: unknown }

/**
 * OpenCode stream event types
 */
export type OpenCodeStreamEvent =
  | { type: "message.created"; message: MessageV2.Assistant }
  | { type: "part.created"; part: MessageV2.Part; messageID: string }
  | { type: "part.updated"; part: MessageV2.Part; messageID: string; delta?: string }
  | { type: "message.completed"; messageID: string }
  | { type: "message.error"; messageID: string; error: Error }

/**
 * Tool call mapping entry
 */
interface ToolCallMapping {
  sdkToolCallId: string
  opencodeCallID: string
  part: MessageV2.ToolPart
  createdAt: number
}

/**
 * Message Converter class
 * 
 * Converts between OpenCode MessageV2 format and Claude Agent SDK format
 */
export class MessageConverter {
  private toolCallMap = new Map<string, ToolCallMapping>()
  private pendingToolCalls = new Map<string, MessageV2.ToolPart>()
  private currentMessage: MessageV2.Assistant | null = null
  private textBuffer: string = ""
  private lock = new AsyncLock()

  /**
   * Convert OpenCode stream to Claude SDK format
   * 
   * @param opencodeStream - OpenCode event stream
   * @param sessionID - OpenCode session ID
   * @returns Async generator of SDK messages
   */
  async* convertStream(
    opencodeStream: AsyncIterable<OpenCodeStreamEvent>,
    sessionID: string
  ): AsyncGenerator<SDKMessage, void, unknown> {
    // Reset state
    this.toolCallMap.clear()
    this.pendingToolCalls.clear()
    this.currentMessage = null
    this.textBuffer = ""

    for await (const event of opencodeStream) {
      // Use lock to ensure atomic event processing
      const messages: SDKMessage[] = []
      await this.lock.acquire(async () => {
        for await (const msg of this.processEvent(event, sessionID)) {
          messages.push(msg)
        }
      })
      // Yield messages after lock is released
      for (const msg of messages) {
        yield msg
      }
    }

    // Finalize: flush any remaining text buffer (shouldn't be needed with streaming)
    // But keep for safety
    if (this.textBuffer) {
      yield {
        type: "text",
        text: this.textBuffer,
      }
      this.textBuffer = ""
    }

    // Check for incomplete tool calls
    for (const [callID, part] of this.pendingToolCalls) {
      if (part.state.status === "running") {
        log.warn("Tool call not completed", {
          callID,
          tool: part.tool,
          sessionID,
        })
      }
    }
  }

  /**
   * Process a single OpenCode event
   */
  private async* processEvent(
    event: OpenCodeStreamEvent,
    sessionID: string
  ): AsyncGenerator<SDKMessage, void, unknown> {
    switch (event.type) {
      case "message.created":
        this.currentMessage = event.message
        yield {
          type: "system",
          subtype: "init",
          session_id: sessionID,
        }
        break

      case "part.created":
        yield* this.handlePartCreated(event.part, event.messageID)
        break

      case "part.updated":
        yield* this.handlePartUpdated(event.part, event.messageID, event.delta)
        break

      case "message.completed":
        yield {
          type: "result",
          subtype: "success",
        }
        break

      case "message.error":
        yield {
          type: "result",
          subtype: "error",
        }
        break
    }
  }

  /**
   * Handle part created event
   */
  private async* handlePartCreated(
    part: MessageV2.Part,
    messageID: string
  ): AsyncGenerator<SDKMessage, void, unknown> {
    if (part.type === "text") {
      // For text parts, yield immediately (streaming)
      if (part.text) {
        yield {
          type: "text",
          text: part.text,
        }
      }
    } else if (part.type === "reasoning") {
      // Convert reasoning to text with prefix
      if (this.textBuffer) {
        yield {
          type: "text",
          text: this.textBuffer,
        }
        this.textBuffer = ""
      }
      yield {
        type: "text",
        text: `[Reasoning] ${part.text}`,
      }
    } else if (part.type === "tool") {
      // Flush text buffer before tool call
      if (this.textBuffer) {
        yield {
          type: "text",
          text: this.textBuffer,
        }
        this.textBuffer = ""
      }

      // Create tool call mapping
      const sdkToolCallId = crypto.randomUUID()
      this.toolCallMap.set(part.callID, {
        sdkToolCallId,
        opencodeCallID: part.callID,
        part,
        createdAt: Date.now(),
      })
      this.pendingToolCalls.set(part.callID, part)

      // Yield tool call message
      yield {
        type: "tool-call",
        toolName: part.tool,
        input: part.state.input,
        id: sdkToolCallId,
      }
    } else if (part.type === "file") {
      // Handle file parts - convert to text description
      if (this.textBuffer) {
        yield {
          type: "text",
          text: this.textBuffer,
        }
        this.textBuffer = ""
      }
      yield {
        type: "text",
        text: `[File] ${part.filename || part.url}`,
      }
    }
    // Other part types can be handled here
  }

  /**
   * Handle part updated event
   */
  private async* handlePartUpdated(
    part: MessageV2.Part,
    messageID: string,
    delta?: string
  ): AsyncGenerator<SDKMessage, void, unknown> {
    if (part.type === "tool") {
      const mapping = this.toolCallMap.get(part.callID)
      if (!mapping) {
        log.warn("Tool call mapping not found", {
          callID: part.callID,
          messageID,
        })
        return
      }

      // Update mapping
      mapping.part = part
      this.pendingToolCalls.set(part.callID, part)

      const state = part.state
      if (state.status === "completed") {
        // Flush text buffer before tool result
        if (this.textBuffer) {
          yield {
            type: "text",
            text: this.textBuffer,
          }
          this.textBuffer = ""
        }

        // Tool completed successfully
        yield {
          type: "tool-result",
          result: state.output,
          id: mapping.sdkToolCallId,
        }
        this.pendingToolCalls.delete(part.callID)
      } else if (state.status === "error") {
        // Flush text buffer before tool error
        if (this.textBuffer) {
          yield {
            type: "text",
            text: this.textBuffer,
          }
          this.textBuffer = ""
        }

        // Tool failed
        yield {
          type: "tool-result",
          result: {
            error: state.error,
            output: state.output || "",
          },
          id: mapping.sdkToolCallId,
        }
        this.pendingToolCalls.delete(part.callID)
      }
      // "running" and "pending" states don't need to yield anything
      // We wait for completion or error
    } else if (part.type === "text") {
      // Text part updated - use delta if available, otherwise use full text
      const textDelta = delta || part.text
      if (textDelta) {
        // For streaming text, yield immediately
        yield {
          type: "text",
          text: textDelta,
        }
      }
    } else if (part.type === "reasoning") {
      // Reasoning part updated - use delta if available
      const textDelta = delta || part.text
      if (textDelta) {
        yield {
          type: "text",
          text: `[Reasoning] ${textDelta}`,
        }
      }
    }
  }

  /**
   * Convert Claude SDK messages to OpenCode format
   * 
   * This is used for session recovery and data migration
   * 
   * @param sdkMessages - Array of SDK messages
   * @param sessionID - OpenCode session ID
   * @param agentName - Agent name
   * @returns OpenCode message
   */
  async convertFromSDK(
    sdkMessages: SDKMessage[],
    sessionID: string,
    agentName: string
  ): Promise<MessageV2.Assistant> {
    const parts: MessageV2.Part[] = []
    let textBuffer = ""
    const toolCallStack: Array<{ callID: string; toolName: string; input: unknown }> = []

    for (const msg of sdkMessages) {
      if (msg.type === "text") {
        textBuffer += msg.text
      } else if (msg.type === "tool-call") {
        // Save previous text
        if (textBuffer) {
          parts.push({
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "", // Will be set when message is created
            type: "text",
            text: textBuffer,
          })
          textBuffer = ""
        }

        // Create tool call part
        const callID = crypto.randomUUID()
        toolCallStack.push({
          callID,
          toolName: msg.toolName,
          input: msg.input,
        })

        parts.push({
          id: Identifier.ascending("part"),
          sessionID,
          messageID: "", // Will be set when message is created
          type: "tool",
          callID,
          tool: msg.toolName,
          state: {
            status: "pending",
            input: msg.input as Record<string, unknown>,
          },
        })
      } else if (msg.type === "tool-result") {
        // Find the last tool call part
        const lastToolPart = parts
          .slice()
          .reverse()
          .find((p): p is MessageV2.ToolPart => p.type === "tool")

        if (lastToolPart) {
          // Determine if result is error or success
          const result = msg.result as { error?: string; output?: string } | string
          const isError = typeof result === "object" && "error" in result && result.error

          lastToolPart.state = {
            status: isError ? "error" : "completed",
            input: lastToolPart.state.input,
            output: isError
              ? (result as { error: string }).error
              : typeof result === "string"
                ? result
                : JSON.stringify(result),
            title: "",
            metadata: {
              migratedFrom: "claude-sdk",
            },
            time: {
              start: Date.now(),
              end: Date.now(),
            },
            ...(isError && {
              error: (result as { error: string }).error,
            }),
          }
        } else {
          log.warn("Tool result without matching tool call", { sessionID })
        }
      }
    }

    // Save remaining text
    if (textBuffer) {
      parts.push({
        id: Identifier.ascending("part"),
        sessionID,
        messageID: "", // Will be set when message is created
        type: "text",
        text: textBuffer,
      })
    }

    // Set messageID for all parts
    const messageID = Identifier.ascending("message")
    for (const part of parts) {
      part.messageID = messageID
    }

    return {
      id: messageID,
      sessionID,
      role: "assistant",
      agent: agentName,
      parts,
      time: {
        created: Date.now(),
        completed: Date.now(),
      },
    }
  }

  /**
   * Clear internal state
   */
  clear(): void {
    this.toolCallMap.clear()
    this.pendingToolCalls.clear()
    this.currentMessage = null
    this.textBuffer = ""
  }
}
