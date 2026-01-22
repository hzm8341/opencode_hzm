/**
 * Verification System - Main Module
 * 
 * Exports for the verification system.
 */

export * from "./types"
export * from "./registry"
export * from "./engine"
export * from "./utils"
export * from "./strategies"

// Auto-register built-in strategies
import { registerVerificationStrategy } from "./registry"
import { RunDemoVerificationStrategy } from "./strategies/run-demo-strategy"

// Register built-in strategies
registerVerificationStrategy(new RunDemoVerificationStrategy())

