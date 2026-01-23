# 统一Agent功能启用说明

**版本**: v1.0  
**日期**: 2025-01-26  
**AI模型**: Claude-4

---

## 概述

本文档说明如何启用OpenCode的统一Agent执行流程功能，该功能允许通过一句话输入自动触发完整的6步执行流程。

## 配置完成情况

✅ **全局配置已启用**
- 配置文件位置: `~/.config/opencode/opencode.jsonc`
- 插件已注册: `oh-my-opencode`
- Hook已启用: `unified-flow`

✅ **项目配置已启用**
- 配置文件位置: `.opencode/opencode.jsonc`
- 插件已注册: `oh-my-opencode`
- Hook已启用: `unified-flow`

## 配置文件详情

### 全局配置文件

**位置**: `~/.config/opencode/opencode.jsonc`

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["oh-my-opencode"],
  "provider": {
    "opencode": {
      "options": {}
    }
  }
}
```

**位置**: `~/.config/opencode/oh-my-opencode.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "description": "全局配置 - 启用统一Agent执行流程",
  "hooks": {
    "rules-injector": {
      "enabled": true
    },
    "unified-flow": {
      "enabled": true
    }
  },
  "disabled_hooks": []
}
```

### 项目配置文件

**位置**: `.opencode/opencode.jsonc`

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["oh-my-opencode"],
  // ... 其他配置
}
```

**位置**: `.opencode/oh-my-opencode.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "description": "OpenCode项目规则配置 - 启用统一Agent执行流程",
  "hooks": {
    "rules-injector": {
      "enabled": true
    },
    "unified-flow": {
      "enabled": true
    }
  },
  "disabled_hooks": []
}
```

## 使用方法

### 基本使用

统一流程系统已自动集成，只需在提示词中包含触发关键词即可：

```bash
# 方式1: 自动触发（推荐）
cd /path/to/your/project
bun dev run "帮我将当前的项目demo运行起来"

# 方式2: 显式触发
bun dev run "unified-flow: 运行demo"

# 方式3: 使用oh-my-opencode命令
bunx oh-my-opencode run "帮我将当前的项目demo运行起来"
```

### 触发关键词

系统会自动检测以下关键词并触发统一流程：

**中文关键词**:
- "帮我"
- "帮我将"
- "运行demo"
- "运行demo起来"
- "启动"
- "帮我运行"
- "帮我启动"
- "自动完成"
- "完整流程"

**英文关键词**:
- "unified-flow"
- "auto complete"
- "run demo"
- "help me"

**模式匹配**:
- `/帮我.*(运行|启动|完成|实现)/`
- `/将.*(运行|启动)起来/`
- `/自动.*(完成|实现|处理)/`

## 6步执行流程

统一流程包含以下6个阶段：

1. **阶段1: 任务解析** - 理解核心需求，明确交付标准
2. **阶段2: 智能拆解** - 分解为可执行步骤，确定资源需求
3. **阶段3: 并行执行** - 多线程收集/处理，实时进度跟踪
4. **阶段4: 综合构建** - 信息融合，逻辑构建
5. **阶段5: 质量保证** - 自检修正，端到端验证
6. **阶段6: 结果交付** - 按需格式化，附上执行摘要

## 使用示例

### 示例1: 运行Demo

```bash
cd /path/to/your/project
bun dev run "帮我将当前的项目demo运行起来"
```

**执行流程**:
1. **阶段1**: 系统识别任务类型为"run_demo"，收集项目信息（package.json、启动脚本等）
2. **阶段2**: 创建详细计划（检查依赖、配置环境、启动服务）
3. **阶段3-4**: 执行计划，启动服务
4. **阶段5**: 端到端验证（检查服务是否真正运行，HTTP健康检查）
5. **阶段6**: 生成执行摘要，自动退出

### 示例2: 修复Bug

```bash
cd /path/to/your/project
bun dev run "修复登录功能中的空指针异常"
```

### 示例3: 添加功能

```bash
cd /path/to/your/project
bun dev run "添加用户头像上传功能"
```

## 验证方法

### 检查插件是否加载

运行以下命令，查看日志中是否有插件加载信息：

```bash
cd /path/to/your/project
bun dev run --print-logs "测试" 2>&1 | grep -i "plugin\|oh-my-opencode"
```

### 测试统一流程触发

运行以下命令，观察是否触发统一流程：

```bash
cd /path/to/your/project
bun dev run "帮我将当前的项目demo运行起来"
```

如果统一流程被触发，你会看到：
- 系统自动识别任务类型
- 进入6阶段执行流程
- 自动进行端到端验证

## 故障排查

### 问题1: 统一流程未触发

**症状**: 输入包含关键词但未触发统一流程

**解决方案**:
1. 检查Hook是否启用
   ```bash
   cat ~/.config/opencode/oh-my-opencode.json
   ```

2. 检查插件是否注册
   ```bash
   cat ~/.config/opencode/opencode.jsonc
   ```

3. 检查日志
   ```bash
   bun dev run --print-logs "测试"
   ```

4. 显式触发
   ```bash
   bun dev run "unified-flow: 你的任务"
   ```

### 问题2: 插件未加载

**症状**: 插件未在日志中显示

**解决方案**:
1. 确认配置文件位置正确
2. 检查JSON语法是否正确
3. 重新启动OpenCode

## 相关文档

- **USAGE_GUIDE.md**: 完整使用指南
- **统一Agent执行流程使用指南**: USAGE_GUIDE.md 中的相关章节
- **开发计划**: `docs/统一Agent执行流程开发计划_v1.0_20260116_AI.md`

---

**最后更新**: 2025-01-26  
**维护者**: AI Assistant (Claude-4)
