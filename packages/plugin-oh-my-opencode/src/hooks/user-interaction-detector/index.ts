/**
 * User Interaction Detector Hook
 * 
 * Automatically detects user interaction requirements from bash command outputs
 * and triggers the user_interaction tool.
 */

import type { PluginInput } from "@opencode-ai/plugin"
import { log } from "../../shared/logger"

/**
 * Patterns that indicate user interaction is needed
 */
const INTERACTION_PATTERNS = {
  sudoPassword: [
    /sudo: a password is required/i,
    /\[sudo\] password for/i,
    /Password:/i,
    /sudo: a terminal is required to read the password/i,
  ],
  confirmation: [
    /are you sure\?/i,
    /continue\?/i,
    /proceed\?/i,
    /^[Yy]\/[Nn]/,
    /confirm/i,
  ],
  textInput: [
    /^Enter /i,
    /^Input /i,
    /please provide/i,
    /please enter/i,
  ],
}

/**
 * Detect interaction type from command output
 */
function detectInteractionType(output: string): "password" | "confirm" | "text" | null {
  // Check for sudo password prompts first (highest priority)
  for (const pattern of INTERACTION_PATTERNS.sudoPassword) {
    if (pattern.test(output)) {
      return "password"
    }
  }

  // Check for confirmation prompts
  for (const pattern of INTERACTION_PATTERNS.confirmation) {
    if (pattern.test(output)) {
      return "confirm"
    }
  }

  // Check for text input prompts
  for (const pattern of INTERACTION_PATTERNS.textInput) {
    if (pattern.test(output)) {
      return "text"
    }
  }

  return null
}

/**
 * Extract command from tool input
 */
function extractCommand(toolInput: unknown): string {
  if (typeof toolInput === "string") {
    return toolInput
  }
  
  if (toolInput && typeof toolInput === "object") {
    if ("command" in toolInput && typeof toolInput.command === "string") {
      return toolInput.command
    }
    if ("tmux_command" in toolInput && typeof toolInput.tmux_command === "string") {
      return toolInput.tmux_command
    }
  }
  
  return ""
}

/**
 * Create user interaction detector hook
 */
export function createUserInteractionDetectorHook(
  ctx: PluginInput
): {
  "tool.execute.after": (
    input: { tool: string; sessionID: string; callID: string; args?: unknown },
    output: { output: string; title?: string }
  ) => Promise<void>
  handler?: (event: { type: string; properties?: unknown }) => Promise<void>
} {
  const toolExecuteAfter = async (
    input: { tool: string; sessionID: string; callID: string; args?: unknown },
    output: { output: string; title?: string }
  ) => {
    const toolName = input.tool?.toLowerCase()
    
    // Only check bash and interactive_bash tools
    if (toolName !== "bash" && toolName !== "interactive_bash") {
      return
    }

    const toolOutput = output.output || ""
    const toolInput = input.args

    // Detect if user interaction is needed
    const interactionType = detectInteractionType(toolOutput)

    if (interactionType) {
      const command = extractCommand(toolInput)
      
      log(`[UserInteractionDetector] Detected ${interactionType} interaction needed`, {
        tool: toolName,
        command,
        outputSnippet: toolOutput.slice(0, 200),
        sessionID: input.sessionID,
      })

      // Inject guidance directly into the output
      // This will be seen by the agent before it generates its response
      let guidanceMessage = ""
      
      if (interactionType === "password") {
        // Use a very direct, action-oriented message that Agent cannot ignore
        guidanceMessage = `<SYSTEM_INSTRUCTION>
🚨🚨🚨 CRITICAL BLOCKING ISSUE - IMMEDIATE ACTION REQUIRED 🚨🚨🚨

SUDO PASSWORD REQUIRED - YOU MUST CALL user_interaction TOOL NOW

Command: "${command}"
Output: "${toolOutput.slice(0, 200)}"

**MANDATORY ACTION - DO THIS IMMEDIATELY:**

user_interaction(
  type="password",
  message="This command requires sudo privileges. Please enter your password.",
  description="Command: ${command}\\n\\nThe system needs sudo access to execute this command. Please provide your sudo password in the TUI interface."
)

**FORBIDDEN - DO NOT DO THESE:**
❌ Do NOT suggest sudo -S
❌ Do NOT suggest passwordless sudo  
❌ Do NOT suggest running without sudo
❌ Do NOT just explain the error
❌ Do NOT skip this step

**ONLY ONE OPTION: Call user_interaction tool NOW, then retry: "${command}"**
</SYSTEM_INSTRUCTION>

`
      } else if (interactionType === "confirm") {
        guidanceMessage = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CRITICAL: USER INPUT REQUIRED - CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The command "${command}" requires user confirmation. The output indicates:
${toolOutput.slice(0, 300)}

**MANDATORY ACTION**: You MUST call the \`user_interaction\` tool:

\`\`\`typescript
user_interaction(
  type="confirm",
  message="This operation requires confirmation. Do you want to proceed?",
  description="Command: ${command}\\n\\nPlease confirm if you want to proceed with this operation.",
  defaultChoice=false
)
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
      } else if (interactionType === "text") {
        guidanceMessage = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CRITICAL: USER INPUT REQUIRED - TEXT INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The command "${command}" requires additional input. The output indicates:
${toolOutput.slice(0, 300)}

**MANDATORY ACTION**: You MUST call the \`user_interaction\` tool:

\`\`\`typescript
user_interaction(
  type="text",
  message="Please provide the required information.",
  description="Command: ${command}\\n\\nThe command needs additional information to continue."
)
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
      }

      if (guidanceMessage) {
        // Prepend guidance to output (so Agent sees it first)
        // This ensures the agent sees it before generating response
        output.output = guidanceMessage + output.output
        
        log(`[UserInteractionDetector] Prepended guidance for ${interactionType} to tool output`, {
          sessionID: input.sessionID,
          command,
          tool: toolName,
          outputLength: output.output.length,
        })
      }
    }
  }

  return {
    "tool.execute.after": toolExecuteAfter,
  }
}

