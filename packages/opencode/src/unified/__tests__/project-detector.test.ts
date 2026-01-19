import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { ProjectDetector } from '../project-detector'
import { mkdir, writeFile, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('ProjectDetector', () => {
  let testDir: string
  const detector = new ProjectDetector()
  
  beforeEach(async () => {
    testDir = join(tmpdir(), `opencode-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
  })
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })
  
  it('should detect Node.js project', async () => {
    await writeFile(join(testDir, 'package.json'), JSON.stringify({
      name: 'test',
      dependencies: { express: '^4.0.0' }
    }))
    
    const result = await detector.detect(testDir)
    expect(result.type).toBe('node')
    expect(result.techStack).toContain('express')
  })
  
  it('should detect planning files', async () => {
    await writeFile(join(testDir, 'task_plan.md'), '# Task Plan')
    
    const result = await detector.detect(testDir)
    expect(result.hasPlanningFiles).toBe(true)
  })
})

