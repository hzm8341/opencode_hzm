export interface UnifiedEntryOptions {
  directory: string
  requirement: string
  sessionID: string
  useManus?: boolean
  model?: string
  agent?: string
}

export interface UnifiedEntryResult {
  success: boolean
  sessionID: string
  messageID?: string
  planningFilesCreated?: boolean
  executionPlan?: ExecutionPlan
  error?: Error
}

export interface ParsedRequirement {
  type: 'development' | 'analysis' | 'fix' | 'test' | 'documentation'
  complexity: 'simple' | 'medium' | 'complex'
  skills: string[]
  dependencies: string[]
  useManus: boolean
  estimatedToolCalls: number
}

export interface ProjectInfo {
  type: string
  techStack: string[]
  dependencies: string[]
  hasPlanningFiles: boolean
}

export interface ExecutionPlan {
  tasks: Task[]
  dependencies: DependencyGraph
  parallelStrategy: ParallelStrategy
}

export interface Task {
  id: string
  agent: string
  description: string
  phase?: string
}

export interface DependencyGraph {
  [taskId: string]: string[]
}

export interface ParallelStrategy {
  parallel: string[][]
  sequential: string[]
}

