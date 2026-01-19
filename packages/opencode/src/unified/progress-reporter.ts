import { ManusPlanningSystem } from './manus-planning'
import type { ExecutionPlan, Task } from './types'
import { Log } from '../util/log'

export interface ProgressUpdate {
  taskId: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  result?: any
  error?: Error
  timestamp: number
}

export class ProgressReporter {
  private log = Log.create({ service: 'unified.progress-reporter' })
  private updates: ProgressUpdate[] = []
  
  constructor(private planningSystem?: ManusPlanningSystem) {}
  
  /**
   * 更新进度
   */
  async updateProgress(
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    result?: any,
    error?: Error
  ): Promise<void> {
    const update: ProgressUpdate = {
      taskId,
      status,
      result,
      error,
      timestamp: Date.now(),
    }
    
    this.updates.push(update)
    
    this.log.info('Progress updated', {
      taskId,
      status,
      hasResult: !!result,
      hasError: !!error,
    })
    
    // 更新 progress.md（如果使用 Manus 模式）
    if (this.planningSystem) {
      await this.planningSystem.updateProgress(taskId, status, result)
    }
  }
  
  /**
   * 生成报告
   */
  async generateReport(plan: ExecutionPlan): Promise<string> {
    const completed = this.updates.filter(u => u.status === 'completed').length
    const failed = this.updates.filter(u => u.status === 'failed').length
    const inProgress = this.updates.filter(u => u.status === 'in_progress').length
    const pending = plan.tasks.length - completed - failed - inProgress
    
    const report = {
      summary: {
        total: plan.tasks.length,
        completed,
        failed,
        inProgress,
        pending,
        successRate: plan.tasks.length > 0 ? (completed / plan.tasks.length * 100).toFixed(2) + '%' : '0%',
      },
      tasks: plan.tasks.map(task => {
        const update = this.updates.find(u => u.taskId === task.id)
        return {
          id: task.id,
          agent: task.agent,
          description: task.description,
          phase: task.phase,
          status: update?.status || 'pending',
          result: update?.result,
          error: update?.error?.message,
          timestamp: update?.timestamp,
        }
      }),
      executionPlan: {
        parallel: plan.parallelStrategy.parallel,
        sequential: plan.parallelStrategy.sequential,
      },
    }
    
    return JSON.stringify(report, null, 2)
  }
  
  /**
   * 生成文本格式报告
   */
  async generateTextReport(plan: ExecutionPlan): Promise<string> {
    const completed = this.updates.filter(u => u.status === 'completed').length
    const failed = this.updates.filter(u => u.status === 'failed').length
    const inProgress = this.updates.filter(u => u.status === 'in_progress').length
    const pending = plan.tasks.length - completed - failed - inProgress
    
    let report = `# 执行报告\n\n`
    report += `## 摘要\n\n`
    report += `- 总任务数: ${plan.tasks.length}\n`
    report += `- 已完成: ${completed}\n`
    report += `- 进行中: ${inProgress}\n`
    report += `- 待处理: ${pending}\n`
    report += `- 失败: ${failed}\n`
    report += `- 成功率: ${plan.tasks.length > 0 ? (completed / plan.tasks.length * 100).toFixed(2) + '%' : '0%'}\n\n`
    
    report += `## 任务详情\n\n`
    for (const task of plan.tasks) {
      const update = this.updates.find(u => u.taskId === task.id)
      const status = update?.status || 'pending'
      const statusEmoji = {
        completed: '✅',
        failed: '❌',
        in_progress: '🔄',
        pending: '⏳',
      }[status]
      
      report += `### ${statusEmoji} ${task.id}\n\n`
      report += `- **Agent**: ${task.agent}\n`
      report += `- **描述**: ${task.description}\n`
      report += `- **阶段**: ${task.phase || 'N/A'}\n`
      report += `- **状态**: ${status}\n`
      
      if (update?.result) {
        report += `- **结果**: ${JSON.stringify(update.result, null, 2)}\n`
      }
      
      if (update?.error) {
        report += `- **错误**: ${update.error.message}\n`
      }
      
      if (update?.timestamp) {
        report += `- **时间**: ${new Date(update.timestamp).toISOString()}\n`
      }
      
      report += `\n`
    }
    
    return report
  }
  
  /**
   * 获取所有更新
   */
  getUpdates(): ProgressUpdate[] {
    return [...this.updates]
  }
  
  /**
   * 清除更新历史
   */
  clear(): void {
    this.updates = []
  }
}

