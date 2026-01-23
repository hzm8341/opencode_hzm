#!/bin/bash
# Everything Claude Code 卸载脚本
# 版本: v1.0
# 日期: 2026-01-26

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
INSTALL_MODE="${1:-project}" # project 或 user
CLAUDE_DIR=""

# 确定安装目录
if [ "$INSTALL_MODE" = "user" ]; then
    CLAUDE_DIR="$HOME/.claude"
else
    CLAUDE_DIR=".claude"
fi

echo -e "${RED}==================================${NC}"
echo -e "${RED}Everything Claude Code 卸载脚本${NC}"
echo -e "${RED}==================================${NC}"
echo "目标目录: $CLAUDE_DIR"
echo ""

# 检查目录是否存在
if [ ! -d "$CLAUDE_DIR" ]; then
    echo -e "${YELLOW}警告: 目录不存在: $CLAUDE_DIR${NC}"
    exit 0
fi

# 确认卸载
read -p "确认卸载 Everything Claude Code? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "取消卸载"
    exit 0
fi

# 要删除的文件列表
AGENTS=(
    "planner.md"
    "architect.md"
    "code-reviewer.md"
    "security-reviewer.md"
    "build-error-resolver.md"
    "e2e-runner.md"
    "refactor-cleaner.md"
    "doc-updater.md"
    "tdd-guide.md"
)

COMMANDS=(
    "plan.md"
    "tdd.md"
    "code-review.md"
    "e2e.md"
    "build-fix.md"
    "refactor-clean.md"
    "update-docs.md"
    "checkpoint.md"
    "verify.md"
    "learn.md"
    "eval.md"
    "orchestrate.md"
    "test-coverage.md"
    "update-codemaps.md"
    "setup-pm.md"
)

SKILLS=(
    "backend-patterns"
    "frontend-patterns"
    "tdd-workflow"
    "security-review"
    "verification-loop"
    "eval-harness"
    "continuous-learning"
    "strategic-compact"
    "coding-standards"
    "clickhouse-io"
    "project-guidelines-example"
)

RULES=(
    "security.md"
    "coding-style.md"
    "testing.md"
    "git-workflow.md"
    "agents.md"
    "performance.md"
    "memory.md"
    "context.md"
)

# 删除 Agents
echo -e "\n${BLUE}删除 Agents...${NC}"
for agent in "${AGENTS[@]}"; do
    if [ -f "$CLAUDE_DIR/agents/$agent" ]; then
        rm -f "$CLAUDE_DIR/agents/$agent"
        echo -e "${GREEN}✓ 已删除 $agent${NC}"
    fi
done

# 删除 Commands
echo -e "\n${BLUE}删除 Commands...${NC}"
for cmd in "${COMMANDS[@]}"; do
    if [ -f "$CLAUDE_DIR/commands/$cmd" ]; then
        rm -f "$CLAUDE_DIR/commands/$cmd"
        echo -e "${GREEN}✓ 已删除 $cmd${NC}"
    fi
done

# 删除 Skills
echo -e "\n${BLUE}删除 Skills...${NC}"
for skill in "${SKILLS[@]}"; do
    if [ -d "$CLAUDE_DIR/skills/$skill" ]; then
        rm -rf "$CLAUDE_DIR/skills/$skill"
        echo -e "${GREEN}✓ 已删除 $skill${NC}"
    fi
done

# 删除 Rules
echo -e "\n${BLUE}删除 Rules...${NC}"
for rule in "${RULES[@]}"; do
    if [ -f "$CLAUDE_DIR/rules/$rule" ]; then
        rm -f "$CLAUDE_DIR/rules/$rule"
        echo -e "${GREEN}✓ 已删除 $rule${NC}"
    fi
done

# 删除 Scripts
echo -e "\n${BLUE}删除 Scripts...${NC}"
if [ -d "scripts/everything-claude-code" ]; then
    rm -rf scripts/everything-claude-code
    echo -e "${GREEN}✓ 已删除 scripts/everything-claude-code${NC}"
fi

# 完成
echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}卸载完成！${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo -e "${YELLOW}注意:${NC}"
echo "- Hooks 配置未删除，请手动从 settings.json 中移除"
echo "- MCP 配置未删除，请手动从 .mcp.json 中移除"
echo "- 如需恢复配置，请从备份目录恢复"

