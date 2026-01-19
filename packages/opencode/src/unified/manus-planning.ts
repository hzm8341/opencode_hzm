import { lock } from 'proper-lockfile'
import { readFile, writeFile, rename, mkdir } from 'fs/promises'
import { join } from 'path'
import type { ParsedRequirement } from './types'

export class ManusPlanningSystem {
  private planningFilesDir: string
  
  constructor(directory: string) {
    this.planningFilesDir = directory
  }
  
  /**
   * 创建规划文件
   */
  async createPlanningFiles(requirement: ParsedRequirement): Promise<void> {
    await mkdir(this.planningFilesDir, { recursive: true })
    
    const [taskPlan, findings, progress] = await Promise.all([
      this.createTaskPlan(requirement),
      this.createFindings(),
      this.createProgress(),
    ])
    
    await Promise.all([
      writeFile(join(this.planningFilesDir, 'task_plan.md'), taskPlan, 'utf-8'),
      writeFile(join(this.planningFilesDir, 'findings.md'), findings, 'utf-8'),
      writeFile(join(this.planningFilesDir, 'progress.md'), progress, 'utf-8'),
    ])
  }
  
  /**
   * 创建任务规划文件
   */
  private async createTaskPlan(requirement: ParsedRequirement): Promise<string> {
    const typeMap: Record<string, string> = {
      'development': '开发',
      'analysis': '分析',
      'fix': '修复',
      'test': '测试',
      'documentation': '文档',
    }
    
    const template = `# Task Plan

## Goal
${typeMap[requirement.type] || '开发'}任务

## Requirements
${requirement.skills.join(', ') || '待确定'}

## Phases

### Phase 1: 需求分析
**Status:** pending
**Description:** 分析需求，确定技术方案

### Phase 2: 实现
**Status:** pending
**Description:** 实现核心功能

### Phase 3: 测试
**Status:** pending
**Description:** 编写测试用例

## Decisions
(待记录)

## Errors
(待记录)
`
    return template
  }
  
  /**
   * 创建研究发现文件
   */
  private async createFindings(): Promise<string> {
    return `# Findings

## Research
(待记录)

## Technical Decisions
(待记录)

## Resources
(待记录)
`
  }
  
  /**
   * 创建进度日志文件
   */
  private async createProgress(): Promise<string> {
    return `# Progress

## Session Log
(待记录)

## Test Results
(待记录)
`
  }
  
  /**
   * 带事务的规划文件更新（P0 修复）
   */
  async updateTaskPlanWithTransaction(
    phase: string,
    status: string,
    toolExecution: () => Promise<{ success: boolean; error?: Error; filesModified?: string[] }>
  ): Promise<{ success: boolean; error?: Error }> {
    const filePath = join(this.planningFilesDir, 'task_plan.md')
    
    // 获取文件锁
    let release: (() => Promise<void>) | null = null
    try {
      release = await lock(filePath, {
        retries: {
          retries: 10,
          minTimeout: 100,
          maxTimeout: 1000
        }
      })
    } catch (error) {
      return { success: false, error: error as Error }
    }
    
    try {
      // 先执行工具
      const result = await toolExecution()
      
      // 只有工具执行成功才更新规划文件
      if (result.success) {
        const content = await readFile(filePath, 'utf-8')
        const updated = this.updatePhaseStatus(content, phase, status)
        
        // 原子写入
        const tempPath = `${filePath}.tmp`
        await writeFile(tempPath, updated, 'utf-8')
        await rename(tempPath, filePath)
        
        return { success: true }
      } else {
        // 工具执行失败，记录错误
        await this.logError(result.error!, 1)
        return { success: false, error: result.error }
      }
    } finally {
      if (release) {
        await release()
      }
    }
  }
  
  /**
   * 更新阶段状态
   */
  private updatePhaseStatus(content: string, phase: string, status: string): string {
    const regex = new RegExp(`(### ${phase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?\\*\\*Status:\\*\\* )\\w+`, 's')
    return content.replace(regex, `$1${status}`)
  }
  
  /**
   * 记录错误
   */
  async logError(error: Error, attempt: number): Promise<void> {
    const filePath = join(this.planningFilesDir, 'task_plan.md')
    try {
      const content = await readFile(filePath, 'utf-8')
      const errorLog = `\n## Errors\n\n### Attempt ${attempt}\n${error.message}\n`
      await writeFile(filePath, content + errorLog, 'utf-8')
    } catch {
      // 忽略写入错误
    }
  }
  
  /**
   * 更新进度
   */
  async updateProgress(
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    result?: any
  ): Promise<void> {
    const filePath = join(this.planningFilesDir, 'progress.md')
    try {
      const content = await readFile(filePath, 'utf-8')
      const progressLog = `\n## ${new Date().toISOString()}\n\n**Task:** ${taskId}\n**Status:** ${status}\n${result ? `**Result:** ${JSON.stringify(result)}\n` : ''}`
      await writeFile(filePath, content + progressLog, 'utf-8')
    } catch {
      // 忽略写入错误
    }
  }
}

