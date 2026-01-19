import { RequirementParser } from './requirement-parser'
import { ProjectDetector } from './project-detector'
import { ManusPlanningSystem } from './manus-planning'
import { Scheduler } from './scheduler'
import { ErrorHandler } from './error-handler'
import { ProgressReporter } from './progress-reporter'
import { SessionPrompt } from '../session/prompt'
import type { UnifiedEntryOptions, UnifiedEntryResult } from './types'

/**
 * 统一入口函数（共享模块）
 * CLI 和 OpenWork 共用此实现
 */
export async function unifiedEntry(
  options: UnifiedEntryOptions
): Promise<UnifiedEntryResult> {
  try {
    // 1. 需求理解（带降级方案）
    const parser = new RequirementParser()
    const parsed = await parser.parse(options.requirement)
    
    // 2. 项目检测
    const detector = new ProjectDetector()
    const project = await detector.detect(options.directory)
    
    // 3. Manus 模式判断
    const useManus = options.useManus ?? parsed.useManus
    
    // 4. 创建规划文件（如果需要）
    let planningFilesCreated = false
    let manus: ManusPlanningSystem | undefined
    if (useManus) {
      manus = new ManusPlanningSystem(options.directory)
      await manus.createPlanningFiles(parsed)
      planningFilesCreated = true
    }
    
    // 5. 智能调度
    const scheduler = new Scheduler()
    const plan = await scheduler.generatePlan(parsed, project)
    
    // 6. 初始化错误处理和进度报告
    const errorHandler = new ErrorHandler(manus)
    const progressReporter = new ProgressReporter(manus)
    
    // 7. 执行（使用 OpenCode 现有系统）
    try {
      const promptInput = {
        sessionID: options.sessionID,
        parts: [{ type: 'text' as const, text: options.requirement }],
        directory: options.directory,
        useManus,
        planningFilesDir: options.directory,
      }
      const message = await SessionPrompt.promptWithManus(promptInput)
      
      // 记录成功
      if (plan.tasks.length > 0) {
        await progressReporter.updateProgress(plan.tasks[0].id, 'completed', {
          messageID: message.id,
        })
      }
      
      return {
        success: true,
        sessionID: options.sessionID,
        messageID: message.id,
        planningFilesCreated,
        executionPlan: plan,
      }
    } catch (error) {
      // 错误处理
      const handlingResult = await errorHandler.handleError(error as Error, {
        task: 'unified-entry',
        phase: 'execution',
        sessionID: options.sessionID,
      })
      
      // 记录失败
      if (plan.tasks.length > 0) {
        await progressReporter.updateProgress(
          plan.tasks[0].id,
          'failed',
          undefined,
          error as Error
        )
      }
      
      if (handlingResult.shouldEscalate) {
        // 需要用户介入
        return {
          success: false,
          sessionID: options.sessionID,
          error: new Error(handlingResult.message || '任务失败，需要人工介入'),
        }
      }
      
      // 可以重试，但这里先返回错误
      return {
        success: false,
        sessionID: options.sessionID,
        error: error as Error,
      }
    }
  } catch (error) {
    return {
      success: false,
      sessionID: options.sessionID,
      error: error as Error,
    }
  }
}

