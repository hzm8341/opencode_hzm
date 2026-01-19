import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import type { ProjectInfo } from './types'

export class ProjectDetector {
  /**
   * 检测项目信息
   */
  async detect(directory: string): Promise<ProjectInfo> {
    const [type, techStack, dependencies, hasPlanningFiles] = await Promise.all([
      this.detectProjectType(directory),
      this.detectTechStack(directory),
      this.detectDependencies(directory),
      this.hasPlanningFiles(directory),
    ])
    
    return {
      type,
      techStack,
      dependencies,
      hasPlanningFiles,
    }
  }
  
  /**
   * 检测项目类型
   */
  private async detectProjectType(directory: string): Promise<string> {
    const files = await this.listFiles(directory)
    
    if (files.includes('package.json')) return 'node'
    if (files.includes('requirements.txt') || files.includes('pyproject.toml')) return 'python'
    if (files.includes('Cargo.toml')) return 'rust'
    if (files.includes('go.mod')) return 'go'
    if (files.includes('pom.xml') || files.includes('build.gradle')) return 'java'
    if (files.includes('composer.json')) return 'php'
    if (files.includes('Gemfile')) return 'ruby'
    
    return 'unknown'
  }
  
  /**
   * 检测技术栈
   */
  private async detectTechStack(directory: string): Promise<string[]> {
    const stack: string[] = []
    const files = await this.listFiles(directory)
    
    // 前端框架
    if (files.includes('package.json')) {
      try {
        const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf-8'))
        const deps = { ...pkg.dependencies, ...pkg.devDependencies }
        if (deps.react) stack.push('react')
        if (deps.vue) stack.push('vue')
        if (deps.angular) stack.push('angular')
        if (deps.svelte) stack.push('svelte')
        if (deps.next) stack.push('next')
        if (deps['@remix-run/node']) stack.push('remix')
      } catch {
        // 忽略解析错误
      }
    }
    
    // 后端框架
    if (files.includes('package.json')) {
      try {
        const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf-8'))
        const deps = { ...pkg.dependencies, ...pkg.devDependencies }
        if (deps.express) stack.push('express')
        if (deps.koa) stack.push('koa')
        if (deps.fastify) stack.push('fastify')
        if (deps.nestjs) stack.push('nestjs')
      } catch {
        // 忽略解析错误
      }
    }
    
    return stack
  }
  
  /**
   * 检测依赖
   */
  private async detectDependencies(directory: string): Promise<string[]> {
    const deps: string[] = []
    const files = await this.listFiles(directory)
    
    if (files.includes('package.json')) {
      try {
        const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf-8'))
        deps.push(...Object.keys(pkg.dependencies || {}))
        deps.push(...Object.keys(pkg.devDependencies || {}))
      } catch {
        // 忽略解析错误
      }
    }
    
    return deps
  }
  
  /**
   * 检查是否有规划文件
   */
  private async hasPlanningFiles(directory: string): Promise<boolean> {
    const files = await this.listFiles(directory)
    return files.includes('task_plan.md') || 
           files.includes('findings.md') || 
           files.includes('progress.md')
  }
  
  /**
   * 列出目录文件
   */
  private async listFiles(directory: string): Promise<string[]> {
    try {
      const { readdir } = await import('fs/promises')
      const files = await readdir(directory)
      return files
    } catch {
      return []
    }
  }
}

