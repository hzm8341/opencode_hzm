import { describe, it, expect } from 'bun:test'
import { AgentCapabilities } from '../agent-capabilities'

describe('AgentCapabilities', () => {
  it('should find agents by skill', () => {
    const caps = new AgentCapabilities()
    caps.register({
      agent: 'frontend',
      skills: ['frontend', 'react'],
      phases: [],
      priority: 10,
    })
    
    const result = caps.findBySkill('frontend')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].agent).toBe('frontend')
  })
  
  it('should find agents by phase', () => {
    const caps = new AgentCapabilities()
    caps.register({
      agent: 'frontend',
      skills: ['frontend'],
      phases: ['Phase 2: 实现'],
      priority: 10,
    })
    
    const result = caps.findByPhase('Phase 2: 实现')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].agent).toBe('frontend')
  })
})

