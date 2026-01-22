/**
 * User Interaction Tool - Constants
 */

export const USER_INTERACTION_TOOL_DESCRIPTION = `Request user input during execution.

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

export const SUDO_PASSWORD_PROMPT = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 SUDO PASSWORD REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A command requires sudo privileges to continue.

Please enter your sudo password in the TUI interface.
The execution will pause until you provide the password.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

export const USER_CONFIRMATION_PROMPT = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ USER CONFIRMATION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please confirm the action in the TUI interface.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

