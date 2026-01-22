/**
 * Tests for Message Converter
 * 
 * These tests verify that the MessageConverter correctly converts
 * between OpenCode MessageV2 format and Claude Agent SDK format.
 */

import { describe, it, expect, beforeEach } from "bun:test"
import { MessageConverter, type SDKMessage, type OpenCodeStreamEvent } from "./message-converter"
import { MessageV2 } from "@/session/message-v2"
import { Identifier } from "@/id/id"

describe("MessageConverter", () => {
  let converter: MessageConverter
  const sessionID = "test-session-id"

  beforeEach(() => {
    converter = new MessageConverter()
  })

  describe("convertStream", () => {
    it("should convert message.created event", async () => {
      const events: OpenCodeStreamEvent[] = [
        {
          type: "message.created",
          message: {
            id: "msg-1",
            sessionID,
            role: "assistant",
            agent: "test-agent",
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
            time: { created: Date.now() },
          },
        },
      ]

      const messages: SDKMessage[] = []
      for await (const msg of converter.convertStream(async function* () {
        for (const event of events) yield event
      }(), sessionID)) {
        messages.push(msg)
      }

      expect(messages).toHaveLength(1)
      expect(messages[0]).toMatchObject({
        type: "system",
        subtype: "init",
        session_id: sessionID,
      })
    })

    it("should convert text part", async () => {
      const events: OpenCodeStreamEvent[] = [
        {
          type: "part.created",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "text",
            text: "Hello, world!",
          },
          messageID: "msg-1",
        },
      ]

      const messages: SDKMessage[] = []
      for await (const msg of converter.convertStream(async function* () {
        for (const event of events) yield event
      }(), sessionID)) {
        messages.push(msg)
      }

      expect(messages).toHaveLength(1)
      expect(messages[0]).toMatchObject({
        type: "text",
        text: "Hello, world!",
      })
    })

    it("should convert reasoning part", async () => {
      const events: OpenCodeStreamEvent[] = [
        {
          type: "part.created",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "reasoning",
            text: "Let me think about this...",
            time: {
              start: Date.now(),
            },
          },
          messageID: "msg-1",
        },
      ]

      const messages: SDKMessage[] = []
      for await (const msg of converter.convertStream(async function* () {
        for (const event of events) yield event
      }(), sessionID)) {
        messages.push(msg)
      }

      expect(messages).toHaveLength(1)
      expect(messages[0]).toMatchObject({
        type: "text",
        text: "[Reasoning] Let me think about this...",
      })
    })

    it("should convert tool call part", async () => {
      const callID = crypto.randomUUID()
      const events: OpenCodeStreamEvent[] = [
        {
          type: "part.created",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "tool",
            callID,
            tool: "bash",
            state: {
              status: "pending",
              input: { command: "echo hello" },
              raw: "echo hello",
            },
          },
          messageID: "msg-1",
        },
      ]

      const messages: SDKMessage[] = []
      for await (const msg of converter.convertStream(async function* () {
        for (const event of events) yield event
      }(), sessionID)) {
        messages.push(msg)
      }

      expect(messages).toHaveLength(1)
      expect(messages[0]).toMatchObject({
        type: "tool-call",
        toolName: "bash",
        input: { command: "echo hello" },
      })
      expect(messages[0]).toHaveProperty("id")
    })

    it("should convert tool result (completed)", async () => {
      const callID = crypto.randomUUID()
      const events: OpenCodeStreamEvent[] = [
        {
          type: "part.created",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "tool",
            callID,
            tool: "bash",
            state: {
              status: "pending",
              input: { command: "echo hello" },
              raw: "echo hello",
            },
          },
          messageID: "msg-1",
        },
        {
          type: "part.updated",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "tool",
            callID,
            tool: "bash",
            state: {
              status: "completed",
              input: { command: "echo hello" },
              output: "hello",
              title: "Execute command",
              metadata: {},
              time: {
                start: Date.now(),
                end: Date.now(),
              },
            },
          },
          messageID: "msg-1",
        },
      ]

      const messages: SDKMessage[] = []
      for await (const msg of converter.convertStream(async function* () {
        for (const event of events) yield event
      }(), sessionID)) {
        messages.push(msg)
      }

      expect(messages).toHaveLength(2)
      expect(messages[0].type).toBe("tool-call")
      expect(messages[1]).toMatchObject({
        type: "tool-result",
        result: "hello",
      })
    })

    it("should convert tool result (error)", async () => {
      const callID = crypto.randomUUID()
      const events: OpenCodeStreamEvent[] = [
        {
          type: "part.created",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "tool",
            callID,
            tool: "bash",
            state: {
              status: "pending",
              input: { command: "invalid-command" },
            },
          },
          messageID: "msg-1",
        },
        {
          type: "part.updated",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "tool",
            callID,
            tool: "bash",
            state: {
              status: "error",
              input: { command: "invalid-command" },
              error: "Command not found",
              time: {
                start: Date.now(),
                end: Date.now(),
              },
            },
          },
          messageID: "msg-1",
        },
      ]

      const messages: SDKMessage[] = []
      for await (const msg of converter.convertStream(async function* () {
        for (const event of events) yield event
      }(), sessionID)) {
        messages.push(msg)
      }

      expect(messages).toHaveLength(2)
      expect(messages[0].type).toBe("tool-call")
      expect(messages[1]).toMatchObject({
        type: "tool-result",
        result: expect.objectContaining({
          error: "Command not found",
        }),
      })
    })

    it("should handle concurrent tool calls", async () => {
      const callID1 = crypto.randomUUID()
      const callID2 = crypto.randomUUID()
      const events: OpenCodeStreamEvent[] = [
        {
          type: "part.created",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "tool",
            callID: callID1,
            tool: "bash",
            state: {
              status: "pending",
              input: { command: "command1" },
            },
          },
          messageID: "msg-1",
        },
        {
          type: "part.created",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "tool",
            callID: callID2,
            tool: "read",
            state: {
              status: "pending",
              input: { path: "file.txt" },
            },
          },
          messageID: "msg-1",
        },
        {
          type: "part.updated",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "tool",
            callID: callID2,
            tool: "read",
            state: {
              status: "completed",
              input: { path: "file.txt" },
              output: "file content",
              title: "Read file",
              metadata: {},
              time: {
                start: Date.now(),
                end: Date.now(),
              },
            },
          },
          messageID: "msg-1",
        },
        {
          type: "part.updated",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "tool",
            callID: callID1,
            tool: "bash",
            state: {
              status: "completed",
              input: { command: "command1" },
              output: "result1",
              title: "Execute command",
              metadata: {},
              time: {
                start: Date.now(),
                end: Date.now(),
              },
            },
          },
          messageID: "msg-1",
        },
      ]

      const messages: SDKMessage[] = []
      for await (const msg of converter.convertStream(async function* () {
        for (const event of events) yield event
      }(), sessionID)) {
        messages.push(msg)
      }

      // Should have 2 tool-calls and 2 tool-results
      expect(messages.filter((m) => m.type === "tool-call")).toHaveLength(2)
      expect(messages.filter((m) => m.type === "tool-result")).toHaveLength(2)
    })

    it("should stream text parts immediately", async () => {
      const events: OpenCodeStreamEvent[] = [
        {
          type: "part.created",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "text",
            text: "Hello",
          },
          messageID: "msg-1",
        },
        {
          type: "part.created",
          part: {
            id: Identifier.ascending("part"),
            sessionID,
            messageID: "msg-1",
            type: "text",
            text: " World",
          },
          messageID: "msg-1",
        },
        {
          type: "message.completed",
          messageID: "msg-1",
        },
      ]

      const messages: SDKMessage[] = []
      for await (const msg of converter.convertStream(async function* () {
        for (const event of events) yield event
      }(), sessionID)) {
        messages.push(msg)
      }

      // Should have streamed text parts immediately (not accumulated)
      const textMessages = messages.filter((m) => m.type === "text")
      expect(textMessages.length).toBeGreaterThanOrEqual(2) // At least 2 text messages
      expect(textMessages[0]).toMatchObject({
        type: "text",
        text: "Hello",
      })
      expect(textMessages[1]).toMatchObject({
        type: "text",
        text: " World",
      })
    })
  })

  describe("convertFromSDK", () => {
    it("should convert SDK messages to OpenCode format", async () => {
      const sdkMessages: SDKMessage[] = [
        { type: "text", text: "Hello" },
        {
          type: "tool-call",
          toolName: "bash",
          input: { command: "echo test" },
        },
        {
          type: "tool-result",
          result: "test",
        },
        { type: "text", text: " Done" },
      ]

      const result = await converter.convertFromSDK(sdkMessages, sessionID, "test-agent")

      expect(result.role).toBe("assistant")
      expect(result.agent).toBe("test-agent")
      expect(result.parts).toHaveLength(3) // text, tool, text

      const textParts = result.parts.filter((p) => p.type === "text")
      expect(textParts).toHaveLength(2)
      expect(textParts[0].type === "text" && textParts[0].text).toBe("Hello")
      expect(textParts[1].type === "text" && textParts[1].text).toBe(" Done")

      const toolPart = result.parts.find((p) => p.type === "tool")
      expect(toolPart).toBeDefined()
      if (toolPart && toolPart.type === "tool") {
        expect(toolPart.tool).toBe("bash")
        expect(toolPart.state.status).toBe("completed")
      }
    })

    it("should handle tool errors", async () => {
      const sdkMessages: SDKMessage[] = [
        {
          type: "tool-call",
          toolName: "bash",
          input: { command: "invalid" },
        },
        {
          type: "tool-result",
          result: { error: "Command not found" },
        },
      ]

      const result = await converter.convertFromSDK(sdkMessages, sessionID, "test-agent")

      const toolPart = result.parts.find((p) => p.type === "tool")
      expect(toolPart).toBeDefined()
      if (toolPart && toolPart.type === "tool") {
        expect(toolPart.state.status).toBe("error")
        expect("error" in toolPart.state && toolPart.state.error).toBe("Command not found")
      }
    })
  })

  describe("clear", () => {
    it("should clear internal state", () => {
      // Add some state
      converter["toolCallMap"].set("test", {
        sdkToolCallId: "sdk-1",
        opencodeCallID: "oc-1",
        part: {} as MessageV2.ToolPart,
        createdAt: Date.now(),
      })

      converter.clear()

      expect(converter["toolCallMap"].size).toBe(0)
      expect(converter["pendingToolCalls"].size).toBe(0)
      expect(converter["currentMessage"]).toBeNull()
      expect(converter["textBuffer"]).toBe("")
    })
  })
})
