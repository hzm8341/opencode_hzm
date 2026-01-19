import { describe, it, expect } from 'bun:test'
import { ProgressReporter } from '../progress-reporter'
import type { ExecutionPlan, Task } from '../types'

describe('ProgressReporter', () => {
  it('should update progress', async () => {
    const reporter = new ProgressReporter()
    
    await reporter.updateProgress('task-1', 'in_progress')
    await reporter.updateProgress('task-1', 'completed', { result: 'success' })
    
    const updates = reporter.getUpdates()
    expect(updates.length).toBe(2)
    expect(updates[0].status).toBe('in_progress')
    expect(updates[1].status).toBe('completed')
    expect(updates[1].result).toEqual({ result: 'success' })
  })
  
  it('should generate JSON report', async () => {
    const reporter = new ProgressReporter()
    
    const plan: ExecutionPlan = {
      tasks: [
        { id: 'task-1', agent: 'frontend', description: 'Task 1', phase: 'Phase 1' },
        { id: 'task-2', agent: 'backend', description: 'Task 2', phase: 'Phase 2' },
      ],
      dependencies: {},
      parallelStrategy: { parallel: [['task-1'], ['task-2']], sequential: [] },
    }
    
    await reporter.updateProgress('task-1', 'completed')
    await reporter.updateProgress('task-2', 'in_progress')
    
    const report = await reporter.generateReport(plan)
    const parsed = JSON.parse(report)
    
    expect(parsed.summary.total).toBe(2)
    expect(parsed.summary.completed).toBe(1)
    expect(parsed.summary.inProgress).toBe(1)
    expect(parsed.tasks.length).toBe(2)
  })
  
  it('should generate text report', async () => {
    const reporter = new ProgressReporter()
    
    const plan: ExecutionPlan = {
      tasks: [
        { id: 'task-1', agent: 'frontend', description: 'Task 1', phase: 'Phase 1' },
      ],
      dependencies: {},
      parallelStrategy: { parallel: [['task-1']], sequential: [] },
    }
    
    await reporter.updateProgress('task-1', 'completed')
    
    const report = await reporter.generateTextReport(plan)
    
    expect(report).toContain('# 执行报告')
    expect(report).toContain('总任务数: 1')
    expect(report).toContain('已完成: 1')
    expect(report).toContain('task-1')
  })
  
  it('should clear updates', () => {
    const reporter = new ProgressReporter()
    
    reporter.updateProgress('task-1', 'completed')
    expect(reporter.getUpdates().length).toBe(1)
    
    reporter.clear()
    expect(reporter.getUpdates().length).toBe(0)
  })
})

