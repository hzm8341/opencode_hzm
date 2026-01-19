import type { ParsedRequirement, ProjectInfo, ExecutionPlan, Task, DependencyGraph, ParallelStrategy } from './types'
import { AgentMatcher } from './agent-matcher'
import { AgentCapabilities } from './agent-capabilities'

export class PlanGenerator {
  constructor(
    private matcher: AgentMatcher,
    private capabilities: AgentCapabilities
  ) {}
  
  /**
   * 生成执行计划
   */
  async generate(
    requirement: ParsedRequirement,
    project: ProjectInfo
  ): Promise<ExecutionPlan> {
    // 从 task_plan.md 读取阶段（如果存在）
    // TODO: 实现从规划文件读取阶段
    
    // 生成任务
    const tasks = this.decomposeTasks(requirement, project)
    
    // 构建依赖图
    const dependencies = this.buildDependencyGraph(tasks)
    
    // 优化并行策略
    const parallelStrategy = this.optimizeParallelStrategy(tasks, dependencies)
    
    return {
      tasks,
      dependencies,
      parallelStrategy,
    }
  }
  
  /**
   * 分解任务
   */
  private decomposeTasks(
    requirement: ParsedRequirement,
    project: ProjectInfo
  ): Task[] {
    const tasks: Task[] = []
    
    // 根据需求类型分解
    if (requirement.type === 'development') {
      tasks.push(...this.matcher.match(requirement, 'Phase 1: 需求分析'))
      tasks.push(...this.matcher.match(requirement, 'Phase 2: 实现'))
      tasks.push(...this.matcher.match(requirement, 'Phase 3: 测试'))
    } else if (requirement.type === 'fix') {
      tasks.push(...this.matcher.match(requirement, 'Phase 1: 需求分析'))
      tasks.push(...this.matcher.match(requirement, 'Phase 2: 实现'))
    } else {
      tasks.push(...this.matcher.match(requirement))
    }
    
    return tasks
  }
  
  /**
   * 构建依赖图
   */
  private buildDependencyGraph(tasks: Task[]): DependencyGraph {
    const graph: DependencyGraph = {}
    
    // 简单的依赖关系：按阶段顺序
    const phases = ['Phase 1: 需求分析', 'Phase 2: 实现', 'Phase 3: 测试']
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const phaseIndex = phases.indexOf(task.phase || '')
      
      if (phaseIndex > 0) {
        const prevPhase = phases[phaseIndex - 1]
        const prevTasks = tasks.filter(t => t.phase === prevPhase)
        graph[task.id] = prevTasks.map(t => t.id)
      } else {
        graph[task.id] = []
      }
    }
    
    return graph
  }
  
  /**
   * 优化并行策略
   */
  private optimizeParallelStrategy(
    tasks: Task[],
    dependencies: DependencyGraph
  ): ParallelStrategy {
    // 简单的并行策略：同一阶段的任务可以并行
    const parallel: string[][] = []
    const sequential: string[] = []
    
    const phases = ['Phase 1: 需求分析', 'Phase 2: 实现', 'Phase 3: 测试']
    
    for (const phase of phases) {
      const phaseTasks = tasks.filter(t => t.phase === phase)
      if (phaseTasks.length > 0) {
        parallel.push(phaseTasks.map(t => t.id))
      }
    }
    
    return { parallel, sequential }
  }
}

