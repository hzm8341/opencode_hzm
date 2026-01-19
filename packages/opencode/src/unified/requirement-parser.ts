import { Provider } from '../provider/provider'
import type { ParsedRequirement } from './types'

export class RequirementParser {
  /**
   * 解析需求（带降级方案 - P0 修复）
   */
  async parse(
    requirement: string,
    options?: {
      useLLM?: boolean
      timeout?: number
    }
  ): Promise<ParsedRequirement> {
    const useLLM = options?.useLLM !== false // 默认使用 LLM
    
    if (useLLM) {
      try {
        // 尝试使用 LLM 分析（带超时）
        return await Promise.race([
          this.parseWithLLM(requirement),
          new Promise<ParsedRequirement>((_, reject) =>
            setTimeout(() => reject(new Error('LLM timeout')), options?.timeout || 5000)
          )
        ])
      } catch (error) {
        // LLM 失败，降级到规则匹配
        console.warn('[RequirementParser] LLM failed, using rule-based fallback:', error)
        return await this.parseWithRules(requirement)
      }
    } else {
      // 直接使用规则匹配
      return await this.parseWithRules(requirement)
    }
  }
  
  /**
   * 使用 LLM 分析需求
   */
  private async parseWithLLM(requirement: string): Promise<ParsedRequirement> {
    const model = await Provider.defaultModel()
    const provider = await Provider.getProvider(model.providerID)
    
    // 使用 LLM 分析需求
    // TODO: 实现 LLM 分析逻辑
    // 这里需要调用 LLM API，返回结构化的 ParsedRequirement
    
    // 临时实现：降级到规则匹配
    return await this.parseWithRules(requirement)
  }
  
  /**
   * 使用规则匹配分析需求（降级方案）
   */
  private async parseWithRules(requirement: string): Promise<ParsedRequirement> {
    const lower = requirement.toLowerCase()
    
    // 基于关键词匹配的任务类型
    const type = 
      /(开发|实现|创建|构建|编写|添加)/.test(lower) ? 'development' :
      /(分析|检查|查看|审查|评估)/.test(lower) ? 'analysis' :
      /(修复|解决|调试|修复|改正)/.test(lower) ? 'fix' :
      /(测试|验证|校验)/.test(lower) ? 'test' :
      /(文档|说明|记录)/.test(lower) ? 'documentation' :
      'development'
    
    // 复杂度评估
    const complexity = 
      requirement.length > 100 || /(包括|和|以及|同时)/.test(lower) ? 'complex' :
      requirement.length > 50 ? 'medium' :
      'simple'
    
    // 技能识别
    const skills: string[] = []
    if (/(前端|frontend|react|vue|angular|svelte)/.test(lower)) skills.push('frontend')
    if (/(后端|backend|api|server|服务)/.test(lower)) skills.push('backend')
    if (/(数据库|database|db|sql|mongodb|postgres)/.test(lower)) skills.push('database')
    if (/(移动|mobile|ios|android|react-native)/.test(lower)) skills.push('mobile')
    if (/(测试|test|jest|mocha|cypress)/.test(lower)) skills.push('testing')
    
    // 估计工具调用次数
    const estimatedToolCalls = 
      complexity === 'complex' ? 10 :
      complexity === 'medium' ? 5 : 2
    
    return {
      type,
      complexity,
      skills,
      dependencies: [],
      useManus: estimatedToolCalls > 5,
      estimatedToolCalls,
    }
  }
}

