import { ManusPlanningSystem } from './manus-planning'
import { Log } from '../util/log'

export interface ErrorContext {
  task: string
  phase: string
  tool?: string
  sessionID?: string
}

export interface ErrorHandlingResult {
  shouldRetry: boolean
  attempt: number
  shouldEscalate: boolean
  message?: string
}

export class ErrorHandler {
  private errorCounts: Map<string, number> = new Map()
  private readonly MAX_RETRIES = 3
  private log = Log.create({ service: 'unified.error-handler' })
  
  constructor(private planningSystem?: ManusPlanningSystem) {}
  
  /**
   * 3-Strike 错误协议
   * 第一次和第二次错误：自动重试
   * 第三次错误：升级到用户
   */
  async handleError(
    error: Error,
    context: ErrorContext
  ): Promise<ErrorHandlingResult> {
    const key = `${context.task}-${context.phase}`
    const count = (this.errorCounts.get(key) || 0) + 1
    this.errorCounts.set(key, count)
    
    this.log.warn('Error occurred', {
      error: error.message,
      context,
      attempt: count,
    })
    
    // 记录错误到 task_plan.md（如果使用 Manus 模式）
    if (this.planningSystem) {
      await this.planningSystem.logError(error, count)
    }
    
    if (count >= this.MAX_RETRIES) {
      // 3次失败后，升级到用户
      return {
        shouldRetry: false,
        attempt: count,
        shouldEscalate: true,
        message: `任务失败 ${count} 次，需要人工介入。错误信息: ${error.message}`,
      }
    }
    
    return {
      shouldRetry: true,
      attempt: count,
      shouldEscalate: false,
      message: `第 ${count} 次尝试失败，将自动重试。错误信息: ${error.message}`,
    }
  }
  
  /**
   * 重置错误计数（任务成功时调用）
   */
  resetErrorCount(context: ErrorContext): void {
    const key = `${context.task}-${context.phase}`
    this.errorCounts.delete(key)
  }
  
  /**
   * 获取错误计数
   */
  getErrorCount(context: ErrorContext): number {
    const key = `${context.task}-${context.phase}`
    return this.errorCounts.get(key) || 0
  }
  
  /**
   * 检查是否应该重试
   */
  shouldRetry(context: ErrorContext): boolean {
    const count = this.getErrorCount(context)
    return count < this.MAX_RETRIES
  }
}

