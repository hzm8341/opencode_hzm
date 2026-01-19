import { describe, it, expect } from 'bun:test'
import { ErrorHandler } from '../error-handler'
import { ManusPlanningSystem } from '../manus-planning'
import { mkdir, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('ErrorHandler', () => {
  it('should handle error with 3-strike protocol', async () => {
    const handler = new ErrorHandler()
    
    const context = { task: 'test-task', phase: 'Phase 1' }
    
    // 第一次错误 - 应该重试
    const result1 = await handler.handleError(new Error('Test error'), context)
    expect(result1.shouldRetry).toBe(true)
    expect(result1.attempt).toBe(1)
    expect(result1.shouldEscalate).toBe(false)
    
    // 第二次错误 - 应该重试
    const result2 = await handler.handleError(new Error('Test error'), context)
    expect(result2.shouldRetry).toBe(true)
    expect(result2.attempt).toBe(2)
    expect(result2.shouldEscalate).toBe(false)
    
    // 第三次错误 - 应该升级
    const result3 = await handler.handleError(new Error('Test error'), context)
    expect(result3.shouldRetry).toBe(false)
    expect(result3.attempt).toBe(3)
    expect(result3.shouldEscalate).toBe(true)
  })
  
  it('should reset error count', () => {
    const handler = new ErrorHandler()
    const context = { task: 'test-task', phase: 'Phase 1' }
    
    handler.handleError(new Error('Test error'), context)
    expect(handler.getErrorCount(context)).toBe(1)
    
    handler.resetErrorCount(context)
    expect(handler.getErrorCount(context)).toBe(0)
  })
  
  it('should work with Manus planning system', async () => {
    const testDir = join(tmpdir(), `opencode-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
    
    try {
      const planningSystem = new ManusPlanningSystem(testDir)
      await planningSystem.createPlanningFiles({
        type: 'development',
        complexity: 'medium',
        skills: [],
        dependencies: [],
        useManus: true,
        estimatedToolCalls: 5,
      })
      
      const handler = new ErrorHandler(planningSystem)
      const context = { task: 'test-task', phase: 'Phase 1' }
      
      await handler.handleError(new Error('Test error'), context)
      
      // 验证错误已记录到 task_plan.md
      const { readFile } = await import('fs/promises')
      const content = await readFile(join(testDir, 'task_plan.md'), 'utf-8')
      expect(content).toContain('Test error')
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })
})

