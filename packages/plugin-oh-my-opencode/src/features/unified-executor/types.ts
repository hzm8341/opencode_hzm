/**
 * Unified Agent Execution Flow - Type Definitions
 * 
 * Type definitions for the unified 6-step execution flow system.
 */

/**
 * Execution phases in the unified flow
 */
export enum ExecutionPhase {
  /** Phase 1: Task Parsing - Understand requirements and extract success criteria */
  TASK_PARSING = "task_parsing",
  
  /** Phase 2: Intelligent Decomposition - Create and review work plan */
  INTELLIGENT_DECOMPOSITION = "intelligent_decomposition",
  
  /** Phase 3: Parallel Execution - Execute tasks in parallel */
  PARALLEL_EXECUTION = "parallel_execution",
  
  /** Phase 4: Synthesis & Construction - Integrate results */
  SYNTHESIS_CONSTRUCTION = "synthesis_construction",
  
  /** Phase 5: Quality Assurance - Verify and test */
  QUALITY_ASSURANCE = "quality_assurance",
  
  /** Phase 6: Result Delivery - Generate report and exit */
  RESULT_DELIVERY = "result_delivery",
  
  /** Completed - All phases done */
  COMPLETED = "completed",
  
  /** Failed - Execution failed */
  FAILED = "failed",
}

/**
 * Task types that can be handled by the unified flow
 */
export enum TaskType {
  /** Run/start a demo or service */
  RUN_DEMO = "run_demo",
  
  /** Fix a bug */
  FIX_BUG = "fix_bug",
  
  /** Add a new feature */
  ADD_FEATURE = "add_feature",
  
  /** Refactor code */
  REFACTOR = "refactor",
  
  /** Other types */
  OTHER = "other",
}

/**
 * Verification methods for success criteria
 */
export enum VerificationMethod {
  /** HTTP health check */
  HTTP_CHECK = "http_check",
  
  /** Run tests */
  TEST_RUN = "test_run",
  
  /** Manual check */
  MANUAL_CHECK = "manual_check",
  
  /** Port listening check */
  PORT_CHECK = "port_check",
  
  /** File existence check */
  FILE_CHECK = "file_check",
  
  /** Command output check */
  COMMAND_CHECK = "command_check",
}

/**
 * Success criteria for a task
 */
export interface SuccessCriteria {
  /** Task type */
  type: TaskType
  
  /** Human-readable description */
  description: string
  
  /** Verification details */
  verification: {
    /** Verification method */
    method: VerificationMethod
    
    /** Target to verify (URL, command, file path, etc.) */
    target: string
    
    /** Expected result */
    expected: string
    
    /** Optional timeout in milliseconds */
    timeout?: number
  }
}

/**
 * Execution state for the unified flow
 */
export interface ExecutionState {
  /** Session ID */
  sessionId: string
  
  /** Current execution phase */
  phase: ExecutionPhase
  
  /** Original task description from user */
  taskDescription: string
  
  /** Detected task type */
  taskType?: TaskType
  
  /** Success criteria (extracted in Phase 1) */
  successCriteria?: SuccessCriteria
  
  /** Plan file path (created in Phase 2) */
  planPath?: string
  
  /** Plan name */
  planName?: string
  
  /** TODO IDs for tracking progress */
  todos: string[]
  
  /** Execution results from each phase */
  phaseResults: {
    [phase in ExecutionPhase]?: {
      completed: boolean
      result?: string
      error?: string
      completedAt?: string
    }
  }
  
  /** Created timestamp */
  createdAt: string
  
  /** Last updated timestamp */
  updatedAt: string
}

/**
 * Context for verification
 */
export interface VerificationContext {
  /** Project path */
  projectPath: string
  
  /** Task description */
  taskDescription: string
  
  /** Success criteria */
  successCriteria: SuccessCriteria
  
  /** Session ID */
  sessionId: string
}

/**
 * Verification result
 */
export interface VerificationResult {
  /** Whether verification succeeded */
  success: boolean
  
  /** Verification message */
  message: string
  
  /** Evidence (screenshots, logs, etc.) */
  evidence?: {
    type: string
    data: string
  }[]
  
  /** Error if verification failed */
  error?: string
}

