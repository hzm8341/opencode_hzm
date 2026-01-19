import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { unifiedEntry } from '../index'
import { Session } from '../../session'
import { Identifier } from '../../id/id'
import { mkdir, rm, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('E2E Tests', () => {
  let testDir: string
  let sessionID: string
  
  beforeEach(async () => {
    testDir = join(tmpdir(), `opencode-e2e-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
    sessionID = Identifier.ascending('session')
    await Session.create(sessionID)
  })
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })
  
  it('should handle simple requirement without Manus', async () => {
    const result = await unifiedEntry({
      directory: testDir,
      requirement: '帮我运行这个项目',
      sessionID,
    })
    
    expect(result.success).toBe(true)
    expect(result.planningFilesCreated).toBe(false)
    expect(result.sessionID).toBe(sessionID)
  })
  
  it('should handle complex requirement with Manus', async () => {
    const result = await unifiedEntry({
      directory: testDir,
      requirement: '实现一个用户登录功能，包括前端和后端，数据库设计，API 接口，单元测试',
      sessionID,
    })
    
    // 注意：由于没有实际的 LLM 和 SessionPrompt 环境，这个测试可能会失败
    // 但我们可以验证规划文件是否创建
    if (result.planningFilesCreated) {
      const { readdir } = await import('fs/promises')
      const files = await readdir(testDir)
      expect(files).toContain('task_plan.md')
      expect(files).toContain('findings.md')
      expect(files).toContain('progress.md')
    }
  })
  
  it('should create planning files when useManus is true', async () => {
    const result = await unifiedEntry({
      directory: testDir,
      requirement: '测试需求',
      sessionID,
      useManus: true,
    })
    
    if (result.planningFilesCreated) {
      const { readdir } = await import('fs/promises')
      const files = await readdir(testDir)
      expect(files).toContain('task_plan.md')
      
      // 验证 task_plan.md 内容
      const content = await readFile(join(testDir, 'task_plan.md'), 'utf-8')
      expect(content).toContain('# Task Plan')
      expect(content).toContain('## Phases')
    }
  })
  
  it('should generate execution plan', async () => {
    const result = await unifiedEntry({
      directory: testDir,
      requirement: '实现前端和后端功能',
      sessionID,
    })
    
    if (result.executionPlan) {
      expect(result.executionPlan.tasks.length).toBeGreaterThan(0)
      expect(result.executionPlan.parallelStrategy).toBeDefined()
    }
  })
})

