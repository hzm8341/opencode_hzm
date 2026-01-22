/**
 * User Interaction Tool
 * 
 * Tool for requesting user input during execution (e.g., sudo password, confirmation).
 */

import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"
import type {
  UserInteractionRequest,
  UserInteractionResult,
  InteractionType,
} from "./types"
import { log } from "../../shared/logger"
import { SUDO_PASSWORD_PROMPT, USER_CONFIRMATION_PROMPT } from "./constants"

const USER_INTERACTION_TOOL_DESCRIPTION = `Request user input during execution.

Use this tool when you need user intervention, such as:
- Sudo password for privileged operations
- Confirmation for destructive actions
- User choice between options
- Additional information from user

**When to use:**
- Command requires sudo password
- Need user confirmation before proceeding
- Need user to choose between options
- Need additional information from user

**Important:**
- Always explain why you need the input
- Provide clear instructions
- Use appropriate interaction type (password for sensitive data)
- Set reasonable timeout if needed`

type ToolContextWithMetadata = {
  sessionID: string
  messageID: string
  agent: string
  abort: AbortSignal
  metadata?: (input: { title?: string; metadata?: Record<string, unknown> }) => void
}

/**
 * Generate unique request ID
 */
function generateRequestID(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Format interaction request for display
 */
function formatInteractionRequest(request: UserInteractionRequest): string {
  let message = `\n\n`
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  message += `🔔 USER INTERACTION REQUIRED\n`
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
  
  message += `${request.message}\n\n`
  
  if (request.description) {
    message += `${request.description}\n\n`
  }
  
  switch (request.type) {
    case "password":
      message += `Type: Password (input will be hidden)\n`
      break
    case "text":
      message += `Type: Text input\n`
      if (request.defaultValue) {
        message += `Default: ${request.defaultValue}\n`
      }
      break
    case "confirm":
      message += `Type: Confirmation (yes/no)\n`
      message += `Default: ${request.defaultChoice ? "yes" : "no"}\n`
      break
    case "select":
      message += `Type: Selection\n`
      if (request.options) {
        message += `Options:\n`
        request.options.forEach((opt, idx) => {
          message += `  ${idx + 1}. ${opt.label}\n`
        })
      }
      break
  }
  
  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  message += `⚠️  Please provide input in the OpenCode TUI interface.\n`
  message += `   The execution will pause until you respond.\n`
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
  
  return message
}

export function createUserInteractionTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: USER_INTERACTION_TOOL_DESCRIPTION,
    args: {
      type: tool.schema
        .enum(["password", "text", "confirm", "select", "multiselect"])
        .describe("Type of interaction: password, text, confirm, select, or multiselect"),
      message: tool.schema.string().describe("Prompt message to show to user"),
      description: tool.schema.string().optional().describe("Additional description or instructions"),
      defaultValue: tool.schema.string().optional().describe("Default value (for text input)"),
      defaultChoice: tool.schema.boolean().optional().describe("Default choice (for confirm, true=yes, false=no)"),
      options: tool.schema
        .array(
          tool.schema.object({
            label: tool.schema.string(),
            value: tool.schema.string(),
          })
        )
        .optional()
        .describe("Options for select/multiselect"),
      timeout: tool.schema.number().optional().describe("Timeout in milliseconds (optional)"),
    },
    async execute(args, toolContext) {
      const toolCtx = toolContext as ToolContextWithMetadata

      const requestID = generateRequestID()
      const request: UserInteractionRequest = {
        type: args.type as InteractionType,
        message: args.message,
        description: args.description,
        defaultValue: args.defaultValue,
        defaultChoice: args.defaultChoice,
        options: args.options,
        timeout: args.timeout,
      }

      log(`[user_interaction] Requesting user input`, {
        sessionID: toolCtx.sessionID,
        requestID,
        type: request.type,
      })

      // Format and display the request
      const formattedRequest = formatInteractionRequest(request)

      // Store interaction request in a way that can be retrieved
      // For now, we'll use a special message format that can be detected
      // In a full implementation, this would integrate with OpenCode's event system
      
      // Create a special marker that can be detected by hooks or TUI
      const interactionMarker = `\n<user-interaction-request>
requestID: ${requestID}
type: ${request.type}
message: ${request.message}
</user-interaction-request>\n`

      // Return formatted request with instructions
      return formattedRequest + interactionMarker + 
        `\n[SYSTEM] ⚠️  EXECUTION PAUSED - USER INPUT REQUIRED\n` +
        `\nPlease provide the requested input in the OpenCode TUI interface.\n` +
        `The execution will continue automatically after you respond.\n` +
        `\nRequest ID: ${requestID}\n` +
        `Session ID: ${toolCtx.sessionID}\n\n` +
        `To continue:\n` +
        `1. Look for the prompt in the TUI\n` +
        `2. Enter your input (password will be hidden)\n` +
        `3. Press Enter to submit\n` +
        `4. Execution will resume automatically\n`
    },
  })
}

