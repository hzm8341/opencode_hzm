import type { Argv } from "yargs"
import { unifiedEntry } from '../../unified'
import { Session } from '../../session'
import { Identifier } from '../../id/id'
import { cmd } from './cmd'
import { bootstrap } from '../bootstrap'
import type { UnifiedEntryOptions } from '../../unified/types'

export const UnifiedCommand = cmd({
  command: 'unified',
  describe: '统一入口命令',
  builder: (yargs: Argv) => {
    return yargs
      .option('dir', {
        alias: 'd',
        type: 'string',
        demandOption: true,
        describe: '工作目录',
      })
      .option('requirement', {
        alias: 'r',
        type: 'string',
        demandOption: true,
        describe: '需求描述',
      })
      .option('model', {
        type: 'string',
        describe: '指定模型',
      })
      .option('agent', {
        type: 'string',
        describe: '指定 Agent',
      })
      .option('useManus', {
        type: 'boolean',
        describe: '强制使用 Manus 模式',
      })
  },
  handler: async (args) => {
    await bootstrap(args.dir, async () => {
      // 创建会话
      const session = await Session.create()
      const sessionID = session.id
      
      // 调用共享模块
      const result = await unifiedEntry({
        directory: args.dir,
        requirement: args.requirement,
        sessionID,
        model: args.model,
        agent: args.agent,
        useManus: args.useManus,
      })
      
      if (!result.success) {
        console.error('Error:', result.error?.message)
        process.exit(1)
      }
      
      console.log('Success!')
      console.log('Session ID:', result.sessionID)
      if (result.planningFilesCreated) {
        console.log('Planning files created')
      }
      
      return result
    })
  },
})

