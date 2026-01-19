import type { ParsedRequirement, ProjectInfo, ExecutionPlan, Task, DependencyGraph, ParallelStrategy } from './types'
import { AgentCapabilities } from './agent-capabilities'
import { AgentMatcher } from './agent-matcher'
import { PlanGenerator } from './plan-generator'

export class Scheduler {
  private capabilities: AgentCapabilities
  private matcher: AgentMatcher
  private generator: PlanGenerator
  
  constructor() {
    this.capabilities = new AgentCapabilities()
    this.matcher = new AgentMatcher(this.capabilities)
    this.generator = new PlanGenerator(this.matcher, this.capabilities)
  }
  
  /**
   * 生成执行计划
   */
  async generatePlan(
    requirement: ParsedRequirement,
    project: ProjectInfo
  ): Promise<ExecutionPlan> {
    return await this.generator.generate(requirement, project)
  }
}

