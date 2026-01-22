/**
 * User Interaction Tool - Type Definitions
 * 
 * Types for user interaction and input handling.
 */

/**
 * User interaction request types
 */
export enum InteractionType {
  /** Password input (hidden) */
  PASSWORD = "password",
  
  /** Text input (visible) */
  TEXT = "text",
  
  /** Confirmation (yes/no) */
  CONFIRM = "confirm",
  
  /** Selection from options */
  SELECT = "select",
  
  /** Multiple choice */
  MULTISELECT = "multiselect",
}

/**
 * User interaction request
 */
export interface UserInteractionRequest {
  /** Interaction type */
  type: InteractionType
  
  /** Prompt message */
  message: string
  
  /** Optional description */
  description?: string
  
  /** Optional default value */
  defaultValue?: string
  
  /** Optional validation function */
  validate?: (value: string) => string | null
  
  /** For select/multiselect: available options */
  options?: Array<{ label: string; value: string }>
  
  /** For confirm: default choice */
  defaultChoice?: boolean
  
  /** Timeout in milliseconds (optional) */
  timeout?: number
}

/**
 * User interaction result
 */
export interface UserInteractionResult {
  /** Whether user provided input */
  provided: boolean
  
  /** User's input value */
  value?: string
  
  /** Whether user cancelled */
  cancelled?: boolean
  
  /** Error message if validation failed */
  error?: string
}

/**
 * User interaction context
 */
export interface UserInteractionContext {
  /** Session ID */
  sessionID: string
  
  /** Request ID (for tracking) */
  requestID: string
  
  /** Timestamp */
  timestamp: string
}

