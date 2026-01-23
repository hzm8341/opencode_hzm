# Everything Claude Code 融合实施计划

**版本**: v1.0  
**日期**: 2026-01-26  
**基于**: [融合评估报告](./everything-claude-code_融合评估报告_v1.0_20260126_AI.md)

---

## 概述

本文档提供将 everything-claude-code 融合到 OpenCode 项目的详细实施计划，包括手动安装步骤和自动化安装脚本。

---

## 方案选择

根据评估报告，推荐使用 **方案 A（直接复制）+ 方案 B（安装脚本）** 的组合方案：

1. **手动安装方式**: 适合高级用户，完全控制安装过程
2. **自动化脚本**: 适合普通用户，一键安装

---

## Phase 1: 手动安装指南

### 1.1 前置条件

- OpenCode 已安装并配置
- Oh My OpenCode 插件已启用
- 对 `.claude/` 目录有写入权限

### 1.2 安装步骤

#### 步骤 1: 创建目录结构

```bash
# 在项目根目录或用户主目录创建 .claude 目录结构
mkdir -p .claude/{agents,commands,skills,rules}
mkdir -p .claude/hooks
```

#### 步骤 2: 复制 Agents

```bash
# 从 everything-claude-code 目录复制 agents
cp everything-claude-code/agents/*.md .claude/agents/
```

**包含的 Agents**:
- planner.md
- architect.md
- code-reviewer.md
- security-reviewer.md
- build-error-resolver.md
- e2e-runner.md
- refactor-cleaner.md
- doc-updater.md
- tdd-guide.md

#### 步骤 3: 复制 Commands

```bash
# 复制 commands
cp everything-claude-code/commands/*.md .claude/commands/
```

**包含的 Commands**:
- plan.md → `/plan`
- tdd.md → `/tdd`
- code-review.md → `/code-review`
- e2e.md → `/e2e`
- build-fix.md → `/build-fix`
- refactor-clean.md → `/refactor-clean`
- update-docs.md → `/update-docs`
- checkpoint.md → `/checkpoint`
- verify.md → `/verify`
- learn.md → `/learn`
- eval.md → `/eval`
- orchestrate.md → `/orchestrate`
- test-coverage.md → `/test-coverage`
- update-codemaps.md → `/update-codemaps`
- setup-pm.md → `/setup-pm`

#### 步骤 4: 复制 Skills

```bash
# 复制 skills 目录
cp -r everything-claude-code/skills/* .claude/skills/
```

**包含的 Skills**:
- backend-patterns/
- frontend-patterns/
- tdd-workflow/
- security-review/
- verification-loop/
- eval-harness/
- continuous-learning/
- strategic-compact/
- coding-standards/
- clickhouse-io/
- project-guidelines-example/

#### 步骤 5: 复制 Rules

```bash
# 复制 rules
cp everything-claude-code/rules/*.md .claude/rules/
```

**包含的 Rules**:
- security.md
- coding-style.md
- testing.md
- git-workflow.md
- agents.md
- performance.md
- memory.md
- context.md

#### 步骤 6: 合并 Hooks 配置

**重要**: Hooks 需要合并到现有的 `settings.json`，不能直接覆盖。

**方法 1: 手动合并**

1. 检查现有 hooks 配置：
```bash
cat ~/.claude/settings.json | jq '.hooks'
# 或
cat .claude/settings.json | jq '.hooks'
```

2. 备份现有配置：
```bash
cp ~/.claude/settings.json ~/.claude/settings.json.backup
```

3. 合并 hooks.json：
```bash
# 使用 jq 合并（推荐）
jq -s '.[0].hooks * .[1].hooks' ~/.claude/settings.json everything-claude-code/hooks/hooks.json > ~/.claude/settings.json.tmp
# 然后手动检查合并结果
```

**方法 2: 使用合并脚本**

```bash
# 运行合并脚本（见 Phase 2）
node scripts/merge-hooks.js
```

#### 步骤 7: 合并 MCP 配置

**重要**: MCP 配置需要合并，并替换 API 密钥占位符。

1. 检查现有 MCP 配置：
```bash
cat .claude/.mcp.json | jq '.'
# 或
cat ~/.claude/.mcp.json | jq '.'
```

2. 合并配置：
```bash
# 使用 jq 合并
jq -s '.[0].mcpServers * .[1].mcpServers' .claude/.mcp.json everything-claude-code/mcp-configs/mcp-servers.json > .claude/.mcp.json.tmp
```

3. **替换 API 密钥占位符**:
   - 查找 `YOUR_*_HERE` 占位符
   - 替换为实际的 API 密钥
   - 或删除不需要的 MCP 服务器配置

#### 步骤 8: 复制 Scripts（可选）

如果需要使用 everything-claude-code 的脚本功能：

```bash
# 创建脚本目录
mkdir -p scripts/everything-claude-code

# 复制脚本
cp -r everything-claude-code/scripts/* scripts/everything-claude-code/

# 设置执行权限
chmod +x scripts/everything-claude-code/**/*.js
```

**注意**: Scripts 中的 `${CLAUDE_PLUGIN_ROOT}` 变量需要替换为实际路径，或设置环境变量。

### 1.3 验证安装

#### 验证 Agents

```bash
# 检查 agents 是否加载
opencode run "@planner 测试规划功能"
```

#### 验证 Commands

```bash
# 在 OpenCode 中测试命令
/plan 测试计划功能
/tdd 测试 TDD 工作流
```

#### 验证 Skills

```bash
# 测试 skill 加载
opencode run "使用 tdd-workflow skill 创建测试"
```

#### 验证 Rules

```bash
# Rules 会自动注入，可以通过代码生成测试
opencode run "创建一个 Python 函数"
# 检查是否遵循了 rules 中的规范
```

#### 验证 Hooks

```bash
# Hooks 会在工具使用时自动触发
# 测试 PreToolUse hook
opencode run "运行 npm run dev"
# 应该看到 tmux 提醒

# 测试 PostToolUse hook
opencode run "编辑一个 TypeScript 文件"
# 应该看到自动格式化和类型检查
```

---

## Phase 2: 自动化安装脚本

### 2.1 脚本功能设计

**install-everything-claude-code.sh** 脚本应包含以下功能：

1. **环境检查**
   - 检查 OpenCode 是否安装
   - 检查 Oh My OpenCode 插件是否启用
   - 检查必要的目录权限

2. **冲突检测**
   - 检测已存在的 agents/commands/skills
   - 提示用户选择覆盖或跳过

3. **选择性安装**
   - 让用户选择要安装的组件
   - 支持全部安装或部分安装

4. **智能合并**
   - 自动合并 hooks.json
   - 自动合并 MCP 配置
   - 检测并提示 API 密钥占位符

5. **验证安装**
   - 验证文件是否复制成功
   - 验证配置格式是否正确

6. **回滚支持**
   - 备份现有配置
   - 支持卸载和恢复

### 2.2 脚本实现

创建 `scripts/install-everything-claude-code.sh`:

```bash
#!/bin/bash
# Everything Claude Code 安装脚本
# 版本: v1.0
# 日期: 2026-01-26

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
SOURCE_DIR="${1:-everything-claude-code}"
INSTALL_MODE="${2:-project}" # project 或 user
CLAUDE_DIR=""
SETTINGS_JSON=""

# 确定安装目录
if [ "$INSTALL_MODE" = "user" ]; then
    CLAUDE_DIR="$HOME/.claude"
    SETTINGS_JSON="$HOME/.claude/settings.json"
else
    CLAUDE_DIR=".claude"
    SETTINGS_JSON=".claude/settings.json"
fi

echo -e "${GREEN}Everything Claude Code 安装脚本${NC}"
echo "=================================="
echo "源目录: $SOURCE_DIR"
echo "安装模式: $INSTALL_MODE"
echo "目标目录: $CLAUDE_DIR"
echo ""

# 检查源目录
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}错误: 源目录不存在: $SOURCE_DIR${NC}"
    exit 1
fi

# 检查 OpenCode
if ! command -v opencode &> /dev/null; then
    echo -e "${YELLOW}警告: 未找到 opencode 命令${NC}"
    read -p "是否继续安装? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 创建目录结构
echo "创建目录结构..."
mkdir -p "$CLAUDE_DIR"/{agents,commands,skills,rules}
mkdir -p "$CLAUDE_DIR"/hooks

# 备份现有配置
if [ -f "$SETTINGS_JSON" ]; then
    echo "备份现有配置..."
    cp "$SETTINGS_JSON" "$SETTINGS_JSON.backup.$(date +%Y%m%d_%H%M%S)"
fi

# 安装函数
install_component() {
    local component=$1
    local source_path=$2
    local target_path=$3
    local description=$4
    
    echo -e "\n${GREEN}安装 $description...${NC}"
    
    if [ ! -e "$source_path" ]; then
        echo -e "${YELLOW}跳过: $source_path 不存在${NC}"
        return
    fi
    
    # 检查冲突
    if [ -e "$target_path" ] && [ -d "$source_path" ]; then
        echo -e "${YELLOW}检测到现有 $description${NC}"
        read -p "覆盖现有文件? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "跳过 $description"
            return
        fi
    fi
    
    # 复制文件
    if [ -d "$source_path" ]; then
        cp -r "$source_path"/* "$target_path/"
    else
        cp "$source_path" "$target_path/"
    fi
    
    echo -e "${GREEN}✓ $description 安装完成${NC}"
}

# 安装各个组件
install_component "agents" "$SOURCE_DIR/agents" "$CLAUDE_DIR/agents" "Agents"
install_component "commands" "$SOURCE_DIR/commands" "$CLAUDE_DIR/commands" "Commands"
install_component "skills" "$SOURCE_DIR/skills" "$CLAUDE_DIR/skills" "Skills"
install_component "rules" "$SOURCE_DIR/rules" "$CLAUDE_DIR/rules" "Rules"

# 合并 Hooks
echo -e "\n${GREEN}合并 Hooks 配置...${NC}"
if [ -f "$SOURCE_DIR/hooks/hooks.json" ]; then
    if [ -f "$SETTINGS_JSON" ]; then
        # 使用 jq 合并（如果可用）
        if command -v jq &> /dev/null; then
            echo "使用 jq 合并 hooks..."
            # 这里需要实现实际的合并逻辑
            echo -e "${YELLOW}提示: 请手动检查合并后的 hooks 配置${NC}"
        else
            echo -e "${YELLOW}警告: 未找到 jq，请手动合并 hooks 配置${NC}"
            echo "源文件: $SOURCE_DIR/hooks/hooks.json"
            echo "目标文件: $SETTINGS_JSON"
        fi
    else
        # 创建新的 settings.json
        echo "创建新的 settings.json..."
        cp "$SOURCE_DIR/hooks/hooks.json" "$SETTINGS_JSON"
    fi
fi

# 合并 MCP 配置
echo -e "\n${GREEN}合并 MCP 配置...${NC}"
if [ -f "$SOURCE_DIR/mcp-configs/mcp-servers.json" ]; then
    MCP_FILE="$CLAUDE_DIR/.mcp.json"
    if [ -f "$MCP_FILE" ]; then
        if command -v jq &> /dev/null; then
            echo "合并 MCP 配置..."
            # 实现合并逻辑
        else
            echo -e "${YELLOW}警告: 请手动合并 MCP 配置${NC}"
        fi
    else
        cp "$SOURCE_DIR/mcp-configs/mcp-servers.json" "$MCP_FILE"
        echo -e "${YELLOW}提示: 请替换 MCP 配置中的 API 密钥占位符${NC}"
    fi
fi

# 复制 Scripts（可选）
echo -e "\n${GREEN}安装 Scripts...${NC}"
read -p "是否安装 Scripts? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    mkdir -p scripts/everything-claude-code
    cp -r "$SOURCE_DIR/scripts"/* scripts/everything-claude-code/
    chmod +x scripts/everything-claude-code/**/*.js 2>/dev/null || true
    echo -e "${GREEN}✓ Scripts 安装完成${NC}"
    echo -e "${YELLOW}提示: 请设置 CLAUDE_PLUGIN_ROOT 环境变量或更新脚本中的路径${NC}"
fi

# 完成
echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}安装完成！${NC}"
echo ""
echo "下一步:"
echo "1. 检查并配置 MCP API 密钥"
echo "2. 验证 hooks 配置是否正确合并"
echo "3. 测试 agents 和 commands"
echo ""
echo "卸载: 运行 scripts/uninstall-everything-claude-code.sh"
```

### 2.3 卸载脚本

创建 `scripts/uninstall-everything-claude-code.sh`:

```bash
#!/bin/bash
# Everything Claude Code 卸载脚本

set -e

CLAUDE_DIR="${1:-.claude}"

echo "卸载 Everything Claude Code..."
echo "目标目录: $CLAUDE_DIR"

read -p "确认卸载? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 删除安装的文件
rm -f "$CLAUDE_DIR"/agents/{planner,architect,code-reviewer,security-reviewer,build-error-resolver,e2e-runner,refactor-cleaner,doc-updater,tdd-guide}.md
rm -rf "$CLAUDE_DIR"/skills/{backend-patterns,frontend-patterns,tdd-workflow,security-review,verification-loop,eval-harness,continuous-learning,strategic-compact,coding-standards,clickhouse-io,project-guidelines-example}
# ... 更多删除操作

echo "卸载完成"
echo "提示: 如需恢复 hooks 配置，请从备份文件恢复"
```

---

## Phase 3: 测试和验证

### 3.1 测试清单

#### Agents 测试

- [ ] planner agent 可以正常调用
- [ ] architect agent 可以正常调用
- [ ] code-reviewer agent 可以正常调用
- [ ] security-reviewer agent 可以正常调用
- [ ] build-error-resolver agent 可以正常调用
- [ ] e2e-runner agent 可以正常调用
- [ ] refactor-cleaner agent 可以正常调用
- [ ] doc-updater agent 可以正常调用
- [ ] tdd-guide agent 可以正常调用

#### Commands 测试

- [ ] `/plan` 命令可以执行
- [ ] `/tdd` 命令可以执行
- [ ] `/code-review` 命令可以执行
- [ ] `/e2e` 命令可以执行
- [ ] `/build-fix` 命令可以执行
- [ ] `/refactor-clean` 命令可以执行
- [ ] `/update-docs` 命令可以执行
- [ ] `/checkpoint` 命令可以执行
- [ ] `/verify` 命令可以执行
- [ ] `/learn` 命令可以执行
- [ ] `/eval` 命令可以执行
- [ ] `/orchestrate` 命令可以执行
- [ ] `/test-coverage` 命令可以执行
- [ ] `/update-codemaps` 命令可以执行
- [ ] `/setup-pm` 命令可以执行

#### Skills 测试

- [ ] backend-patterns skill 可以加载
- [ ] frontend-patterns skill 可以加载
- [ ] tdd-workflow skill 可以加载
- [ ] security-review skill 可以加载
- [ ] verification-loop skill 可以加载
- [ ] eval-harness skill 可以加载
- [ ] continuous-learning skill 可以加载
- [ ] strategic-compact skill 可以加载
- [ ] coding-standards skill 可以加载

#### Rules 测试

- [ ] security.md 规则自动注入
- [ ] coding-style.md 规则自动注入
- [ ] testing.md 规则自动注入
- [ ] git-workflow.md 规则自动注入
- [ ] agents.md 规则自动注入
- [ ] performance.md 规则自动注入

#### Hooks 测试

- [ ] PreToolUse hooks 正常触发
- [ ] PostToolUse hooks 正常触发
- [ ] SessionStart hooks 正常触发
- [ ] SessionEnd hooks 正常触发
- [ ] PreCompact hooks 正常触发
- [ ] Stop hooks 正常触发

#### MCP 测试

- [ ] MCP 配置正确加载
- [ ] API 密钥正确配置
- [ ] MCP 服务器可以连接

### 3.2 测试脚本

创建 `scripts/test-everything-claude-code.sh`:

```bash
#!/bin/bash
# Everything Claude Code 测试脚本

echo "测试 Everything Claude Code 安装..."

# 测试 agents
echo "测试 Agents..."
for agent in planner architect code-reviewer; do
    if [ -f ".claude/agents/$agent.md" ]; then
        echo "✓ $agent.md 存在"
    else
        echo "✗ $agent.md 不存在"
    fi
done

# 测试 commands
echo "测试 Commands..."
for cmd in plan tdd code-review; do
    if [ -f ".claude/commands/$cmd.md" ]; then
        echo "✓ $cmd.md 存在"
    else
        echo "✗ $cmd.md 不存在"
    fi
done

# 测试 skills
echo "测试 Skills..."
for skill in tdd-workflow backend-patterns frontend-patterns; do
    if [ -d ".claude/skills/$skill" ]; then
        echo "✓ $skill/ 存在"
    else
        echo "✗ $skill/ 不存在"
    fi
done

# 测试 rules
echo "测试 Rules..."
for rule in security coding-style testing; do
    if [ -f ".claude/rules/$rule.md" ]; then
        echo "✓ $rule.md 存在"
    else
        echo "✗ $rule.md 不存在"
    fi
done

echo "测试完成"
```

---

## Phase 4: 文档更新

### 4.1 更新 README.md

在 README.md 中添加 Everything Claude Code 部分：

```markdown
## Everything Claude Code 集成

OpenCode 支持 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 配置集合，提供经过实战验证的 agents、skills、commands 和 rules。

### 快速安装

```bash
# 使用安装脚本（推荐）
./scripts/install-everything-claude-code.sh

# 或手动安装
# 见 docs/everything-claude-code_融合实施计划_v1.0_20260126_AI.md
```

### 包含的内容

- **9 个专业 Agents**: planner, architect, code-reviewer 等
- **14 个实用 Commands**: /plan, /tdd, /code-review 等
- **11 个专业 Skills**: backend-patterns, frontend-patterns, tdd-workflow 等
- **8 个最佳实践 Rules**: security, coding-style, testing 等
- **完整的 Hooks 配置**: 自动化工作流
- **MCP 服务器配置**: GitHub, Supabase, Vercel 等

详细文档: [融合实施计划](./docs/everything-claude-code_融合实施计划_v1.0_20260126_AI.md)
```

### 4.2 更新 USAGE_GUIDE.md

在 USAGE_GUIDE.md 中添加 Everything Claude Code 使用指南。

### 4.3 创建快速开始指南

创建 `docs/everything-claude-code_快速开始_v1.0_20260126_AI.md`。

---

## 时间表

| Phase | 任务 | 预计时间 | 状态 |
|-------|------|---------|------|
| Phase 1 | 手动安装指南 | 1 天 | ✅ 完成 |
| Phase 2 | 安装脚本开发 | 1-2 天 | ⏳ 待开始 |
| Phase 3 | 测试和验证 | 1-2 天 | ⏳ 待开始 |
| Phase 4 | 文档更新 | 1 天 | ⏳ 待开始 |

**总计**: 4-6 天

---

## 注意事项

### 重要提醒

1. **备份配置**: 安装前务必备份现有的 `.claude/` 配置
2. **API 密钥**: MCP 配置中的占位符需要替换为实际 API 密钥
3. **Hooks 合并**: Hooks 配置需要手动检查合并，避免冲突
4. **冲突处理**: 如果存在同名 agents/commands，需要选择覆盖或重命名

### 已知问题

1. Scripts 中的 `${CLAUDE_PLUGIN_ROOT}` 变量需要手动配置
2. 某些 hooks 可能与现有配置冲突，需要手动调整

### 后续优化

1. 改进 hooks 合并逻辑
2. 添加更多冲突检测
3. 支持增量更新
4. 添加配置验证工具

---

**文档结束**

