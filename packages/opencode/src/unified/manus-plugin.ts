import type { PluginInput, Hooks } from '@opencode-ai/plugin'
import { ManusHooksAdapter } from './manus-hooks-adapter'

let adapter: ManusHooksAdapter | null = null

/**
 * Manus 模式 Plugin
 * 将命令式 Hooks 转换为事件式 Hooks
 */
export default async function manusPlugin(input: PluginInput): Promise<Hooks> {
  // 从环境变量或配置获取规划文件目录
  const planningDir = input.directory || process.cwd()
  adapter = new ManusHooksAdapter(planningDir)
  adapter.initialize()
  
  return {
    // 注册 tool.execute.before Hook（阻塞执行）
    async "tool.execute.before"(input, output) {
      const { tool } = input
      
      // 只处理特定工具（匹配 planning-with-files 的 matcher）
      if (!adapter!.shouldHandleTool(tool)) {
        return
      }
      
      // 阻塞执行：读取 task_plan.md 前 30 行
      const preview = await adapter!.getTaskPlanPreview()
      
      if (preview) {
        // 将内容注入到系统消息或上下文中
        // 注意：这里需要与 OpenCode 的消息系统集成
        // 可以通过修改 output.args 或使用其他机制
        console.log('[Manus] PreToolUse: Refreshed task plan context')
        // TODO: 将 preview 注入到 LLM 上下文
        // 可以通过修改 output.args 添加额外的上下文信息
      }
    },
    
    // 注册 tool.execute.after Hook（异步执行）
    async "tool.execute.after"(input, output) {
      const { tool } = input
      
      // 只处理 Write/Edit 工具
      if (!/Write|Edit/.test(tool)) {
        return
      }
      
      // 异步提醒更新状态（不阻塞）
      setImmediate(() => {
        console.log('[Manus] PostToolUse: File updated. If this completes a phase, update task_plan.md status.')
      })
    },
  }
}

