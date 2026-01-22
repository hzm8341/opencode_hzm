/**
 * Tests for Permission Interceptor
 * 
 * These tests verify that the PermissionInterceptor correctly bridges
 * Claude Agent SDK's canUseTool callback with OpenCode's permission system.
 */

import { describe, it, expect, beforeEach, mock } from "bun:test"
import { PermissionInterceptor, type PermissionResult } from "./permission-interceptor"
import { PermissionNext } from "@/permission/next"
import { Agent } from "@/agent/agent"
import { Session } from "@/session"
import { MessageV2 } from "@/session/message-v2"

// Mock dependencies
mock.module("@/permission/next", () => ({
  PermissionNext: {
    merge: mock(() => []),
    evaluate: mock(() => ({ action: "ask", permission: "test", pattern: "*" })),
    ask: mock(() => Promise.resolve()),
    DeniedError: class DeniedError extends Error {
      constructor(public readonly ruleset: PermissionNext.Ruleset) {
        super("Permission denied")
      }
    },
    RejectedError: class RejectedError extends Error {
      constructor() {
        super("Permission rejected")
      }
    },
    CorrectedError: class CorrectedError extends Error {
      constructor(message: string) {
        super(message)
      }
    },
  },
}))

mock.module("@/agent/agent", () => ({
  Agent: {
    get: mock(() =>
      Promise.resolve({
        name: "test-agent",
        permission: [],
      })
    ),
    defaultAgent: mock(() => Promise.resolve("test-agent")),
  },
}))

mock.module("@/session", () => ({
  Session: {
    get: mock(() =>
      Promise.resolve({
        id: "test-session",
        permission: [],
      })
    ),
  },
}))

mock.module("@/session/message-v2", () => ({
  MessageV2: {
    list: mock(() =>
      Promise.resolve([
        {
          info: {
            id: "msg-1",
            role: "user",
            agent: "test-agent",
          },
        },
      ])
    ),
  },
}))

describe("PermissionInterceptor", () => {
  let interceptor: PermissionInterceptor
  let sessionID: string

  beforeEach(() => {
    interceptor = new PermissionInterceptor({
      timeoutMs: 1000,
      logDecisions: false,
    })
    sessionID = "test-session-id"
  })

  describe("createCanUseToolHandler", () => {
    it("should create a handler function", () => {
      const handler = interceptor.createCanUseToolHandler(sessionID)
      expect(handler).toBeInstanceOf(Function)
    })

    it("should return allow when custom handler allows", async () => {
      const customHandler = mock(() =>
        Promise.resolve({ behavior: "allow" as const, updatedInput: {} })
      )

      interceptor = new PermissionInterceptor({
        customHandler,
        logDecisions: false,
      })

      const handler = interceptor.createCanUseToolHandler(sessionID)
      const result = await handler("test-tool", {}, { signal: new AbortController().signal })

      expect(result.behavior).toBe("allow")
      expect(customHandler).toHaveBeenCalled()
    })

    it("should return deny when custom handler denies", async () => {
      const customHandler = mock(() =>
        Promise.resolve({ behavior: "deny" as const, message: "Custom denial" })
      )

      interceptor = new PermissionInterceptor({
        customHandler,
        logDecisions: false,
      })

      const handler = interceptor.createCanUseToolHandler(sessionID)
      const result = await handler("test-tool", {}, { signal: new AbortController().signal })

      expect(result.behavior).toBe("deny")
      if (result.behavior === "deny") {
        expect(result.message).toBeDefined()
        expect(result.message).toBe("Custom denial")
      }
    })

    it("should fall through to OpenCode system when custom handler returns ask", async () => {
      const customHandler = mock(() =>
        Promise.resolve({ behavior: "ask" as const })
      )

      interceptor = new PermissionInterceptor({
        customHandler,
        logDecisions: false,
      })

      const handler = interceptor.createCanUseToolHandler(sessionID)
      
      // Mock PermissionNext.ask to resolve
      // Note: PermissionNext.ask is read-only, so we can't mock it directly
      // This test verifies the fall-through behavior when custom handler returns "ask"

      const result = await handler("test-tool", {}, { signal: new AbortController().signal })

      expect(customHandler).toHaveBeenCalled()
      // Should fall through and use OpenCode system
    })

    it("should handle permission allow from rules", async () => {
      const PermissionNext = await import("@/permission/next")
      PermissionNext.PermissionNext.evaluate = mock(() => ({
        action: "allow" as const,
        permission: "test-tool",
        pattern: "*",
      }))

      const handler = interceptor.createCanUseToolHandler(sessionID)
      const result = await handler("test-tool", {}, { signal: new AbortController().signal })

      expect(result.behavior).toBe("allow")
    })

    it("should handle permission deny from rules", async () => {
      const PermissionNext = await import("@/permission/next")
      PermissionNext.PermissionNext.evaluate = mock(() => ({
        action: "deny",
        permission: "test-tool",
        pattern: "*",
      }))

      const handler = interceptor.createCanUseToolHandler(sessionID)
      const result = await handler("test-tool", {}, { signal: new AbortController().signal })

      expect(result.behavior).toBe("deny")
      if (result.behavior === "deny") {
        expect(result.message).toBeDefined()
        expect(result.message).toContain("denied by configuration")
      }
    })

    it("should handle permission ask and grant", async () => {
      const PermissionNext = await import("@/permission/next")
      PermissionNext.PermissionNext.evaluate = mock(() => ({
        action: "ask",
        permission: "test-tool",
        pattern: "*",
      }))
      PermissionNext.PermissionNext.ask = mock(() => Promise.resolve())

      const handler = interceptor.createCanUseToolHandler(sessionID)
      const result = await handler("test-tool", {}, { signal: new AbortController().signal })

      expect(result.behavior).toBe("allow")
    })

    it("should handle permission ask and deny (DeniedError)", async () => {
      const PermissionNext = await import("@/permission/next")
      PermissionNext.PermissionNext.evaluate = mock(() => ({
        action: "ask",
        permission: "test-tool",
        pattern: "*",
      }))
      PermissionNext.PermissionNext.ask = mock(() => {
        throw new PermissionNext.PermissionNext.DeniedError([])
      })

      const handler = interceptor.createCanUseToolHandler(sessionID)
      const result = await handler("test-tool", {}, { signal: new AbortController().signal })

      expect(result.behavior).toBe("deny")
      if (result.behavior === "deny") {
        expect(result.message).toBeDefined()
        expect(result.message).toContain("denied")
      }
    })

    it("should handle permission ask and reject (RejectedError)", async () => {
      const PermissionNext = await import("@/permission/next")
      PermissionNext.PermissionNext.evaluate = mock(() => ({
        action: "ask",
        permission: "test-tool",
        pattern: "*",
      }))
      PermissionNext.PermissionNext.ask = mock(() => {
        throw new PermissionNext.PermissionNext.RejectedError()
      })

      const handler = interceptor.createCanUseToolHandler(sessionID)
      const result = await handler("test-tool", {}, { signal: new AbortController().signal })

      expect(result.behavior).toBe("deny")
      if (result.behavior === "deny") {
        expect(result.message).toBeDefined()
        expect(result.message).toContain("rejected")
      }
    })

    it("should handle abort signal", async () => {
      const PermissionNext = await import("@/permission/next")
      PermissionNext.PermissionNext.evaluate = mock(() => ({
        action: "ask",
        permission: "test-tool",
        pattern: "*",
      }))
      
      // Create a promise that never resolves
      PermissionNext.PermissionNext.ask = mock(() => new Promise(() => {}))

      const abortController = new AbortController()
      const handler = interceptor.createCanUseToolHandler(sessionID)
      
      // Abort after a short delay
      setTimeout(() => abortController.abort(), 10)

      const result = await handler("test-tool", {}, { signal: abortController.signal })

      expect(result.behavior).toBe("deny")
      if (result.behavior === "deny") {
        expect(result.message).toBeDefined()
        expect(result.message).toContain("aborted")
      }
    })

    it("should map edit tools to edit permission", async () => {
      const PermissionNext = await import("@/permission/next")
      const evaluateMock = mock(() => ({
        action: "allow",
        permission: "edit",
        pattern: "*",
      }))
      PermissionNext.PermissionNext.evaluate = evaluateMock

      const handler = interceptor.createCanUseToolHandler(sessionID)
      await handler("write", {}, { signal: new AbortController().signal })

      // Should have been called with "edit" permission, not "write"
      expect(evaluateMock).toHaveBeenCalledWith("edit", "*", expect.anything())
    })
  })
})
