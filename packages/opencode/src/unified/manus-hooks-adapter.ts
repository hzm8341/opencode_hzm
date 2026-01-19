import { readFile } from 'fs/promises'
import { join } from 'path'
import { Log } from '../util/log'

export class ManusHooksAdapter {
  private planningFilesDir: string
  private fileCache: Map<string, { content: string; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 500 // 500ms 缓存
  private readonly HOOK_TIMEOUT = 2000 // 2秒超时
  private log = Log.create({ service: 'manus-hooks' })
  
  constructor(directory: string) {
    this.planningFilesDir = directory
  }
  
  /**
   * 初始化所有 Hooks（v5.0 改进）
   */
  initialize(): void {
    this.log.info('ManusHooksAdapter initialized', { directory: this.planningFilesDir })
  }
  
  /**
   * 读取 task_plan.md（带缓存和超时 - P0 修复）
   * 这是 PreToolUse Hook 的核心功能，必须阻塞执行
   */
  async readTaskPlanCached(): Promise<string | null> {
    const path = join(this.planningFilesDir, 'task_plan.md')
    const now = Date.now()
    const cached = this.fileCache.get(path)
    
    // 检查缓存
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.content
    }
    
    // 读取文件（带超时）
    try {
      const content = await Promise.race([
        readFile(path, 'utf-8'),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Read timeout')), this.HOOK_TIMEOUT)
        )
      ])
      
      this.fileCache.set(path, { content, timestamp: now })
      return content
    } catch (error) {
      this.log.warn('Failed to read task_plan.md', { error })
      return null
    }
  }
  
  /**
   * 清除缓存（文件更新时调用）
   */
  clearCache(): void {
    this.fileCache.clear()
    this.log.debug('Cache cleared')
  }
  
  /**
   * 获取 task_plan.md 前 30 行（PreToolUse Hook 使用）
   */
  async getTaskPlanPreview(): Promise<string> {
    const content = await this.readTaskPlanCached()
    if (!content) return ''
    
    const lines = content.split('\n').slice(0, 30).join('\n')
    return lines
  }
  
  /**
   * 检查工具是否应该触发 Hook
   */
  shouldHandleTool(tool: string): boolean {
    // 只处理特定工具（匹配 planning-with-files 的 matcher）
    return /Write|Edit|Bash|Read|Glob|Grep/.test(tool)
  }
}

