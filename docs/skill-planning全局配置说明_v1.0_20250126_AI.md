# skill-planning 全局配置说明

**版本**: v1.0  
**日期**: 2025-01-26  
**AI模型**: Claude-4

---

## 概述

本文档说明如何将 `packages/skill-planning` (planning-with-files) 配置为全局可用的 skill，使其在所有项目中都可以使用。

## skill-planning 简介

`planning-with-files` 是一个实现 Manus 风格文件规划模式的 skill，它使用持久化的 markdown 文件作为"磁盘上的工作记忆"。

### 核心功能

- 📋 **3文件模式**: 为每个复杂任务创建三个文件
  - `task_plan.md` - 跟踪阶段和进度
  - `findings.md` - 存储研究和发现
  - `progress.md` - 会话日志和测试结果
- 🔄 **自动会话恢复**: 在 `/clear` 后自动恢复未同步的工作
- 🎯 **智能提醒**: 在关键操作前后自动提醒更新规划文件
- ✅ **完成验证**: 在停止前自动检查所有阶段是否完成

## 配置步骤

### 1. 创建全局 skill 目录

```bash
mkdir -p ~/.config/opencode/skill
```

### 2. 创建符号链接

将 skill-planning 链接到全局 skill 目录：

```bash
cd ~/.config/opencode/skill
ln -sf /path/to/opencode_hzm/packages/skill-planning planning-with-files
```

**注意**: 请将 `/path/to/opencode_hzm` 替换为实际的项目路径。

### 3. 验证配置

检查符号链接是否正确：

```bash
# 检查符号链接
ls -la ~/.config/opencode/skill/planning-with-files

# 验证 SKILL.md 文件存在
test -f ~/.config/opencode/skill/planning-with-files/SKILL.md && echo "✅ Skill configured" || echo "❌ Skill not found"
```

### 4. 确保 oh-my-opencode 配置正确

检查 `~/.config/opencode/oh-my-opencode.json`，确保 skill 未被禁用：

```json
{
  "disabled_skills": []
}
```

如果 `planning-with-files` 在 `disabled_skills` 数组中，请移除它。

## 使用方法

### 自动使用

skill-planning 会在以下情况自动激活：

1. **开始复杂任务时**: 系统会自动创建 `task_plan.md`
2. **工具使用前**: PreToolUse hook 会重新读取计划
3. **文件写入后**: PostToolUse hook 会提醒更新状态
4. **停止前**: Stop hook 会验证所有阶段是否完成

### 手动调用

你也可以手动调用 skill：

```bash
# 使用 use_skill 工具
bun dev run "使用 planning-with-files skill 开始规划任务"

# 或者直接读取 skill 文件
bun dev run "读取 planning-with-files skill 并开始使用"
```

### 使用示例

#### 示例1: 开始复杂任务

```bash
cd /path/to/your/project
bun dev run "使用 planning-with-files skill 规划并实现用户认证系统"
```

系统会自动：
1. 创建 `task_plan.md` 文件
2. 分解任务为多个阶段
3. 跟踪进度和发现
4. 验证完成状态

#### 示例2: 研究任务

```bash
bun dev run "使用 planning-with-files skill 研究并实现 WebSocket 实时通信"
```

系统会：
1. 创建研究计划
2. 将发现存储在 `findings.md`
3. 记录测试结果在 `progress.md`

## 文件结构

配置完成后，skill-planning 的文件结构如下：

```
~/.config/opencode/skill/
└── planning-with-files -> /path/to/opencode_hzm/packages/skill-planning
    ├── SKILL.md              # Skill 定义文件
    ├── templates/            # 模板文件
    │   ├── task_plan.md
    │   ├── findings.md
    │   └── progress.md
    ├── scripts/              # 脚本文件
    │   ├── init-session.sh
    │   ├── check-complete.sh
    │   └── session-catchup.py
    └── docs/                 # 文档
```

## Skill 发现机制

OpenCode 从以下路径自动发现 skills：

### 全局路径（优先级从高到低）

1. `~/.config/opencode/skill/` ✅ **已配置**
2. `~/.config/opencode/skills/`
3. `~/.claude/skills/`

### 项目路径

1. `.opencode/skill/`
2. `.opencode/skills/`
3. `.claude/skills/`

## 验证方法

### 方法1: 检查 skill 是否被发现

运行以下命令，查看 skill 是否在列表中：

```bash
cd /path/to/any/project
bun dev run "列出所有可用的 skills"
```

应该能看到 `planning-with-files` 在列表中。

### 方法2: 测试 skill 功能

```bash
cd /path/to/test/project
bun dev run "使用 planning-with-files skill 创建一个简单的任务规划"
```

检查是否创建了 `task_plan.md` 文件。

### 方法3: 检查日志

运行 OpenCode 时查看日志：

```bash
bun dev run --print-logs "测试" 2>&1 | grep -i "planning\|skill"
```

应该能看到 skill 相关的日志信息。

## 故障排查

### 问题1: Skill 未被发现

**症状**: 运行 `列出所有可用的 skills` 时看不到 `planning-with-files`

**解决方案**:
1. 检查符号链接是否正确：
   ```bash
   ls -la ~/.config/opencode/skill/planning-with-files
   ```
2. 检查 SKILL.md 文件是否存在：
   ```bash
   test -f ~/.config/opencode/skill/planning-with-files/SKILL.md
   ```
3. 检查 oh-my-opencode 配置：
   ```bash
   cat ~/.config/opencode/oh-my-opencode.json
   ```
   确保 `planning-with-files` 不在 `disabled_skills` 中

### 问题2: Skill 功能不工作

**症状**: Skill 被发现但功能不工作

**解决方案**:
1. 检查脚本文件权限：
   ```bash
   ls -la ~/.config/opencode/skill/planning-with-files/scripts/
   chmod +x ~/.config/opencode/skill/planning-with-files/scripts/*.sh
   ```
2. 检查 Python 脚本（如果需要）：
   ```bash
   python3 --version
   ```
3. 查看 OpenCode 日志中的错误信息

### 问题3: 符号链接路径错误

**症状**: 符号链接指向错误的路径

**解决方案**:
1. 删除旧的符号链接：
   ```bash
   rm ~/.config/opencode/skill/planning-with-files
   ```
2. 重新创建符号链接（使用正确的路径）：
   ```bash
   cd ~/.config/opencode/skill
   ln -sf /Users/minghu/Downloads/opencode_hzm/packages/skill-planning planning-with-files
   ```

## 配置摘要

### 当前配置状态

✅ **全局 skill 目录**: `~/.config/opencode/skill/`  
✅ **Skill 符号链接**: `~/.config/opencode/skill/planning-with-files`  
✅ **目标路径**: `/Users/minghu/Downloads/opencode_hzm/packages/skill-planning`  
✅ **SKILL.md 文件**: 存在  
✅ **oh-my-opencode 配置**: 未禁用

### 验证命令

```bash
# 快速验证
test -f ~/.config/opencode/skill/planning-with-files/SKILL.md && echo "✅ Skill configured" || echo "❌ Skill not found"

# 详细验证
ls -la ~/.config/opencode/skill/planning-with-files
cat ~/.config/opencode/skill/planning-with-files/SKILL.md | head -10
```

## 相关文档

- **skill-planning README**: `packages/skill-planning/README.md`
- **OpenCode Setup Guide**: `packages/skill-planning/docs/opencode.md`
- **Quick Start Guide**: `packages/skill-planning/docs/quickstart.md`
- **Workflow Diagram**: `packages/skill-planning/docs/workflow.md`

## 下一步

1. **测试 skill**: 在一个新项目中测试 skill-planning 功能
2. **学习使用**: 阅读 `docs/quickstart.md` 了解完整工作流
3. **自定义配置**: 根据需要调整模板和脚本

---

**最后更新**: 2025-01-26  
**维护者**: AI Assistant (Claude-4)
