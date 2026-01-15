/**
 * Example usage of Claude Agent SDK Adapter
 * 
 * This file demonstrates how to use the adapter to integrate
 * Claude Agent SDK with OpenCode.
 */

import { query } from "./index"
import type { SDKMessage } from "./message-converter"

/**
 * Basic usage example
 */
export async function basicExample() {
  const q = query({
    prompt: "Hello, world!",
    options: {
      cwd: process.cwd(),
    },
  })

  for await (const message of q) {
    console.log("Message:", message)
  }
}

/**
 * Example with custom permission handler
 */
export async function permissionExample() {
  const q = query({
    prompt: "Edit the README file",
    options: {
      cwd: process.cwd(),
      canUseTool: async (toolName, input, { signal }) => {
        if (toolName === "edit" || toolName === "write") {
          // Ask user for permission
          console.log(`Permission requested for ${toolName}`)
          // In a real app, you would show a UI dialog here
          return { behavior: "ask" }
        }
        // Auto-approve other tools
        return { behavior: "allow", updatedInput: input }
      },
    },
  })

  for await (const message of q) {
    if (message.type === "text") {
      console.log("Text:", message.text)
    } else if (message.type === "tool-call") {
      console.log("Tool call:", message.toolName, message.input)
    } else if (message.type === "tool-result") {
      console.log("Tool result:", message.result)
    }
  }
}

/**
 * Example with session resume
 */
export async function resumeExample(claudeSessionId: string) {
  const q = query({
    prompt: "Continue from where we left off",
    options: {
      resume: claudeSessionId,
    },
  })

  for await (const message of q) {
    console.log("Message:", message)
  }
}

/**
 * Example with abort controller
 */
export async function abortExample() {
  const abortController = new AbortController()

  // Abort after 5 seconds
  setTimeout(() => {
    abortController.abort()
  }, 5000)

  const q = query({
    prompt: "This is a long-running task",
    options: {
      abortController,
    },
  })

  try {
    for await (const message of q) {
      console.log("Message:", message)
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Query was aborted")
    } else {
      throw error
    }
  }
}

/**
 * Example: Collect all messages
 */
export async function collectMessagesExample(): Promise<SDKMessage[]> {
  const messages: SDKMessage[] = []

  const q = query({
    prompt: "List all files in the current directory",
    options: {
      cwd: process.cwd(),
    },
  })

  for await (const message of q) {
    messages.push(message)
  }

  return messages
}
