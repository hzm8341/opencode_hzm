import { AgentCapabilities } from './agent-capabilities'
import type { ParsedRequirement, Task } from './types'

export class AgentMatcher {
  constructor(private capabilities: AgentCapabilities) {}
  
  /**
   * 匹配任务到 Agent
   */
  match(requirement: ParsedRequirement, phase?: string): Task[] {
    const tasks: Task[] = []
    
    // 根据技能匹配
    for (const skill of requirement.skills) {
      const agents = this.capabilities.findBySkill(skill)
      for (const agent of agents) {
        tasks.push({
          id: `task-${tasks.length + 1}`,
          agent: agent.agent,
          description: `使用 ${agent.agent} 处理 ${skill} 相关任务`,
          phase: phase || agent.phases[0],
        })
      }
    }
    
    // 根据阶段匹配
    if (phase) {
      const phaseAgents = this.capabilities.findByPhase(phase)
      for (const agent of phaseAgents) {
        if (!tasks.some(t => t.agent === agent.agent)) {
          tasks.push({
            id: `task-${tasks.length + 1}`,
            agent: agent.agent,
            description: `使用 ${agent.agent} 处理 ${phase}`,
            phase,
          })
        }
      }
    }
    
    return tasks
  }
}

