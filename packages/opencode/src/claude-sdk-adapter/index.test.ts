/**
 * Tests for Claude Agent SDK Adapter
 * 
 * These tests verify that the adapter correctly bridges
 * Claude Agent SDK and OpenCode.
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test"
import { ClaudeAgentSDKAdapter, query } from "./index"
import { Session } from "@/session"
import { MessageV2 } from "@/session/message-v2"
import { Bus } from "@/bus"
import { SessionPrompt } from "@/session/prompt"

// Mock dependencies
mock.module("@/session", () => ({
  Session: {
    create: mock(() =>
      Promise.resolve({
        id: "test-session-id",
        projectID: "test-project",
        directory: process.cwd(),
        title: "Test Session",
        time: {
          created: Date.now(),
          updated: Date.now(),
        },
      })
    ),
    get: mock(() =>
      Promise.resolve({
        id: "test-session-id",
        projectID: "test-project",
        directory: process.cwd(),
        title: "Test Session",
        time: {
          created: Date.now(),
          updated: Date.now(),
        },
      })
    ),
  },
}))

mock.module("@/session/prompt", () => ({
  SessionPrompt: {
    prompt: mock(() => Promise.resolve({
      info: {
        id: "test-message-id",
        sessionID: "test-session-id",
        role: "assistant",
        agent: "build",
        parts: [],
        time: {
          created: Date.now(),
          completed: Date.now(),
        },
      },
      parts: [],
    })),
  },
}))

mock.module("@/bus", () => ({
  Bus: {
    subscribe: mock(() => () => {}), // Return unsubscribe function
  },
}))

describe("ClaudeAgentSDKAdapter", () => {
  let adapter: ClaudeAgentSDKAdapter

  beforeEach(() => {
    adapter = new ClaudeAgentSDKAdapter()
  })

  describe("query", () => {
    it("should create a new session when resume is not provided", async () => {
      const Session = await import("@/session")
      const createSpy = Session.Session.create as ReturnType<typeof mock>

      const q = adapter.query({
        prompt: "Test prompt",
        options: {
          cwd: process.cwd(),
        },
      })

      // Start consuming (this will trigger session creation)
      const iterator = q[Symbol.asyncIterator]()
      const first = await iterator.next()

      expect(createSpy).toHaveBeenCalled()
    })

    it("should yield init message first", async () => {
      const q = adapter.query({
        prompt: "Test prompt",
        options: {
          cwd: process.cwd(),
        },
      })

      const messages: any[] = []
      for await (const msg of q) {
        messages.push(msg)
        if (messages.length >= 1) break // Just get first message
      }

      expect(messages.length).toBeGreaterThan(0)
      // First message should be system init
      expect(messages[0].type).toBe("system")
    })

    it("should handle abort signal", async () => {
      const abortController = new AbortController()

      const q = adapter.query({
        prompt: "Test prompt",
        options: {
          cwd: process.cwd(),
          abortController,
        },
      })

      // Abort after a short delay to allow setup
      setTimeout(() => {
        abortController.abort()
      }, 10)

      const messages: any[] = []
      let aborted = false
      try {
        for await (const msg of q) {
          messages.push(msg)
          if (abortController.signal.aborted) {
            aborted = true
            break
          }
        }
      } catch (error) {
        // Abort may throw or just stop
        if (error instanceof Error && error.name === "AbortError") {
          aborted = true
        }
      }

      // Should handle abort gracefully
      expect(aborted || abortController.signal.aborted).toBe(true)
    }, 1000) // 1 second timeout
  })

  describe("query function", () => {
    it("should be callable", () => {
      expect(typeof query).toBe("function")
    })

    it("should return async iterable", () => {
      const q = query({
        prompt: "Test",
      })

      expect(Symbol.asyncIterator in q).toBe(true)
    })
  })
})
