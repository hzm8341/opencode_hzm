import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { ManusHooksAdapter } from '../manus-hooks-adapter'
import { mkdir, writeFile, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('ManusHooksAdapter', () => {
  let testDir: string
  let adapter: ManusHooksAdapter
  
  beforeEach(async () => {
    testDir = join(tmpdir(), `opencode-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
    adapter = new ManusHooksAdapter(testDir)
  })
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })
  
  it('should read task_plan.md with cache', async () => {
    await writeFile(join(testDir, 'task_plan.md'), '# Task Plan\n\n## Goal\nTest')
    
    const content1 = await adapter.readTaskPlanCached()
    const content2 = await adapter.readTaskPlanCached() // 应该使用缓存
    
    expect(content1).toBe(content2)
    expect(content1).toContain('Task Plan')
  })
  
  it('should clear cache', async () => {
    await writeFile(join(testDir, 'task_plan.md'), '# Task Plan')
    
    await adapter.readTaskPlanCached()
    adapter.clearCache()
    
    // 缓存已清除，应该重新读取
    const content = await adapter.readTaskPlanCached()
    expect(content).toContain('Task Plan')
  })
  
  it('should get task plan preview (first 30 lines)', async () => {
    const lines = Array.from({ length: 50 }, (_, i) => `Line ${i + 1}`).join('\n')
    await writeFile(join(testDir, 'task_plan.md'), lines)
    
    const preview = await adapter.getTaskPlanPreview()
    const previewLines = preview.split('\n')
    
    expect(previewLines.length).toBeLessThanOrEqual(30)
  })
  
  it('should handle tool matching', () => {
    expect(adapter.shouldHandleTool('Write')).toBe(true)
    expect(adapter.shouldHandleTool('Edit')).toBe(true)
    expect(adapter.shouldHandleTool('Bash')).toBe(true)
    expect(adapter.shouldHandleTool('Read')).toBe(true)
    expect(adapter.shouldHandleTool('Glob')).toBe(true)
    expect(adapter.shouldHandleTool('Grep')).toBe(true)
    expect(adapter.shouldHandleTool('Other')).toBe(false)
  })
})

