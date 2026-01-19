import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { ManusPlanningSystem } from '../manus-planning'
import { mkdir, rm, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('ManusPlanningSystem', () => {
  let testDir: string
  let system: ManusPlanningSystem
  
  beforeEach(async () => {
    testDir = join(tmpdir(), `opencode-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
    system = new ManusPlanningSystem(testDir)
  })
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })
  
  it('should create planning files', async () => {
    await system.createPlanningFiles({
      type: 'development',
      complexity: 'medium',
      skills: ['frontend', 'backend'],
      dependencies: [],
      useManus: true,
      estimatedToolCalls: 5,
    })
    
    // 验证文件已创建
    const { readdir } = await import('fs/promises')
    const files = await readdir(testDir)
    expect(files).toContain('task_plan.md')
    expect(files).toContain('findings.md')
    expect(files).toContain('progress.md')
  })
  
  it('should update task plan with transaction', async () => {
    await system.createPlanningFiles({
      type: 'development',
      complexity: 'medium',
      skills: [],
      dependencies: [],
      useManus: true,
      estimatedToolCalls: 5,
    })
    
    const result = await system.updateTaskPlanWithTransaction(
      'Phase 1: 需求分析',
      'in_progress',
      async () => ({ success: true })
    )
    
    expect(result.success).toBe(true)
    
    // 验证文件已更新
    const content = await readFile(join(testDir, 'task_plan.md'), 'utf-8')
    expect(content).toContain('in_progress')
  })
})

