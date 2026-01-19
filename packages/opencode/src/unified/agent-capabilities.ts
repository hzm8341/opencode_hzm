export interface AgentCapability {
  agent: string
  skills: string[]
  phases: string[] // 与 task_plan.md 阶段关联
  priority: number
}

export class AgentCapabilities {
  private capabilities: Map<string, AgentCapability> = new Map()
  
  /**
   * 注册 Agent 能力
   */
  register(capability: AgentCapability): void {
    this.capabilities.set(capability.agent, capability)
  }
  
  /**
   * 查询 Agent 能力
   */
  get(agent: string): AgentCapability | undefined {
    return this.capabilities.get(agent)
  }
  
  /**
   * 根据技能查找 Agent
   */
  findBySkill(skill: string): AgentCapability[] {
    return Array.from(this.capabilities.values())
      .filter(cap => cap.skills.includes(skill))
      .sort((a, b) => b.priority - a.priority)
  }
  
  /**
   * 根据阶段查找 Agent
   */
  findByPhase(phase: string): AgentCapability[] {
    return Array.from(this.capabilities.values())
      .filter(cap => cap.phases.includes(phase))
      .sort((a, b) => b.priority - a.priority)
  }
}

// 默认能力矩阵
export const defaultCapabilities = new AgentCapabilities()

// 初始化默认能力
defaultCapabilities.register({
  agent: 'frontend',
  skills: ['frontend', 'react', 'vue', 'angular'],
  phases: ['Phase 2: 实现', 'Phase 3: 测试'],
  priority: 10,
})

defaultCapabilities.register({
  agent: 'backend',
  skills: ['backend', 'api', 'server'],
  phases: ['Phase 2: 实现'],
  priority: 10,
})

defaultCapabilities.register({
  agent: 'database',
  skills: ['database', 'db', 'sql'],
  phases: ['Phase 2: 实现'],
  priority: 8,
})

defaultCapabilities.register({
  agent: 'testing',
  skills: ['testing', 'test'],
  phases: ['Phase 3: 测试'],
  priority: 9,
})

