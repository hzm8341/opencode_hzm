/**
 * 统一流程检测器
 * 检测用户输入是否应该触发统一流程
 */

/**
 * 检测是否应该触发统一流程
 * @param message 用户输入的消息
 * @returns 是否应该触发统一流程
 */
export function shouldTriggerUnifiedFlow(message: string): boolean {
  if (!message || message.trim().length === 0) {
    return false
  }

  const normalizedMessage = message.toLowerCase().trim()

  // 中文关键词
  const chineseKeywords = [
    '帮我',
    '帮我将',
    '运行demo',
    '运行demo起来',
    '启动',
    '帮我运行',
    '帮我启动',
    '自动完成',
    '完整流程',
    '统一流程',
  ]

  // 英文关键词
  const englishKeywords = [
    'unified-flow',
    'unified flow',
    'auto complete',
    'auto-complete',
    'run demo',
    'help me',
  ]

  // 检查关键词
  for (const keyword of [...chineseKeywords, ...englishKeywords]) {
    if (normalizedMessage.includes(keyword.toLowerCase())) {
      return true
    }
  }

  // 正则表达式模式匹配
  const patterns = [
    /帮我.*(运行|启动|完成|实现)/,
    /将.*(运行|启动)起来/,
    /自动.*(完成|实现|处理)/,
    /unified[-_]?flow/i,
  ]

  for (const pattern of patterns) {
    if (pattern.test(message)) {
      return true
    }
  }

  return false
}
