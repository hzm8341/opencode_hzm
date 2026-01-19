import { describe, it, expect } from 'bun:test'
import { RequirementParser } from '../requirement-parser'

describe('RequirementParser', () => {
  const parser = new RequirementParser()
  
  it('should parse simple requirement', async () => {
    const result = await parser.parse('帮我运行这个项目')
    expect(result.type).toBe('development')
    expect(result.complexity).toBe('simple')
    expect(result.useManus).toBe(false)
  })
  
  it('should parse complex requirement', async () => {
    const result = await parser.parse('实现一个用户登录功能，包括前端和后端，数据库设计，API 接口，单元测试')
    expect(result.complexity).toBe('complex')
    expect(result.useManus).toBe(true)
    expect(result.skills.length).toBeGreaterThan(0)
  })
  
  it('should fallback to rules when LLM fails', async () => {
    const result = await parser.parse('测试需求', { useLLM: false })
    expect(result.type).toBe('test')
  })
})

