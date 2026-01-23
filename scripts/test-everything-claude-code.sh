#!/bin/bash
# Everything Claude Code 测试脚本
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

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}Everything Claude Code 测试脚本${NC}"
echo -e "${BLUE}==================================${NC}"
echo "测试目录: $CLAUDE_DIR"
echo ""

# 检查目录是否存在
if [ ! -d "$CLAUDE_DIR" ]; then
    echo -e "${RED}错误: 目录不存在: $CLAUDE_DIR${NC}"
    exit 1
fi

# 测试结果统计
PASSED=0
FAILED=0

# 测试函数
test_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $description 存在${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ $description 不存在${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

test_dir() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        local count=$(ls -1 "$dir" 2>/dev/null | wc -l)
        echo -e "${GREEN}✓ $description 存在 ($count 个文件)${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ $description 不存在${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 测试 Agents
echo -e "\n${BLUE}测试 Agents...${NC}"
test_file "$CLAUDE_DIR/agents/planner.md" "planner.md"
test_file "$CLAUDE_DIR/agents/architect.md" "architect.md"
test_file "$CLAUDE_DIR/agents/code-reviewer.md" "code-reviewer.md"
test_file "$CLAUDE_DIR/agents/security-reviewer.md" "security-reviewer.md"
test_file "$CLAUDE_DIR/agents/build-error-resolver.md" "build-error-resolver.md"
test_file "$CLAUDE_DIR/agents/e2e-runner.md" "e2e-runner.md"
test_file "$CLAUDE_DIR/agents/refactor-cleaner.md" "refactor-cleaner.md"
test_file "$CLAUDE_DIR/agents/doc-updater.md" "doc-updater.md"
test_file "$CLAUDE_DIR/agents/tdd-guide.md" "tdd-guide.md"

# 测试 Commands
echo -e "\n${BLUE}测试 Commands...${NC}"
test_file "$CLAUDE_DIR/commands/plan.md" "plan.md"
test_file "$CLAUDE_DIR/commands/tdd.md" "tdd.md"
test_file "$CLAUDE_DIR/commands/code-review.md" "code-review.md"
test_file "$CLAUDE_DIR/commands/e2e.md" "e2e.md"
test_file "$CLAUDE_DIR/commands/build-fix.md" "build-fix.md"
test_file "$CLAUDE_DIR/commands/refactor-clean.md" "refactor-clean.md"
test_file "$CLAUDE_DIR/commands/update-docs.md" "update-docs.md"
test_file "$CLAUDE_DIR/commands/checkpoint.md" "checkpoint.md"
test_file "$CLAUDE_DIR/commands/verify.md" "verify.md"
test_file "$CLAUDE_DIR/commands/learn.md" "learn.md"
test_file "$CLAUDE_DIR/commands/eval.md" "eval.md"
test_file "$CLAUDE_DIR/commands/orchestrate.md" "orchestrate.md"
test_file "$CLAUDE_DIR/commands/test-coverage.md" "test-coverage.md"
test_file "$CLAUDE_DIR/commands/update-codemaps.md" "update-codemaps.md"
test_file "$CLAUDE_DIR/commands/setup-pm.md" "setup-pm.md"

# 测试 Skills
echo -e "\n${BLUE}测试 Skills...${NC}"
test_dir "$CLAUDE_DIR/skills/tdd-workflow" "tdd-workflow/"
test_dir "$CLAUDE_DIR/skills/backend-patterns" "backend-patterns/"
test_dir "$CLAUDE_DIR/skills/frontend-patterns" "frontend-patterns/"
test_dir "$CLAUDE_DIR/skills/security-review" "security-review/"
test_dir "$CLAUDE_DIR/skills/verification-loop" "verification-loop/"
test_dir "$CLAUDE_DIR/skills/eval-harness" "eval-harness/"
test_dir "$CLAUDE_DIR/skills/continuous-learning" "continuous-learning/"
test_dir "$CLAUDE_DIR/skills/strategic-compact" "strategic-compact/"
test_dir "$CLAUDE_DIR/skills/coding-standards" "coding-standards/"
test_dir "$CLAUDE_DIR/skills/clickhouse-io" "clickhouse-io/"
test_dir "$CLAUDE_DIR/skills/project-guidelines-example" "project-guidelines-example/"

# 测试 Rules
echo -e "\n${BLUE}测试 Rules...${NC}"
test_file "$CLAUDE_DIR/rules/security.md" "security.md"
test_file "$CLAUDE_DIR/rules/coding-style.md" "coding-style.md"
test_file "$CLAUDE_DIR/rules/testing.md" "testing.md"
test_file "$CLAUDE_DIR/rules/git-workflow.md" "git-workflow.md"
test_file "$CLAUDE_DIR/rules/agents.md" "agents.md"
test_file "$CLAUDE_DIR/rules/performance.md" "performance.md"

# 测试 Hooks
echo -e "\n${BLUE}测试 Hooks...${NC}"
if [ -f "$CLAUDE_DIR/settings.json" ] || [ -f "$HOME/.claude/settings.json" ]; then
    SETTINGS_FILE="$CLAUDE_DIR/settings.json"
    [ ! -f "$SETTINGS_FILE" ] && SETTINGS_FILE="$HOME/.claude/settings.json"
    
    if command -v jq &> /dev/null; then
        HOOKS_COUNT=$(jq '.hooks | length' "$SETTINGS_FILE" 2>/dev/null || echo "0")
        echo -e "${GREEN}✓ settings.json 存在 (包含 $HOOKS_COUNT 个 hook 类型)${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${GREEN}✓ settings.json 存在${NC}"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "${YELLOW}⚠ settings.json 不存在（可选）${NC}"
fi

# 测试 MCP
echo -e "\n${BLUE}测试 MCP 配置...${NC}"
if [ -f "$CLAUDE_DIR/.mcp.json" ]; then
    if command -v jq &> /dev/null; then
        MCP_COUNT=$(jq '.mcpServers | length' "$CLAUDE_DIR/.mcp.json" 2>/dev/null || echo "0")
        echo -e "${GREEN}✓ .mcp.json 存在 (包含 $MCP_COUNT 个 MCP 服务器)${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${GREEN}✓ .mcp.json 存在${NC}"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "${YELLOW}⚠ .mcp.json 不存在（可选）${NC}"
fi

# 测试 Scripts
echo -e "\n${BLUE}测试 Scripts...${NC}"
if [ -d "scripts/everything-claude-code" ]; then
    SCRIPT_COUNT=$(find scripts/everything-claude-code -type f -name "*.js" 2>/dev/null | wc -l)
    echo -e "${GREEN}✓ scripts/everything-claude-code 存在 ($SCRIPT_COUNT 个脚本)${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ scripts/everything-claude-code 不存在（可选）${NC}"
fi

# 总结
echo -e "\n${BLUE}==================================${NC}"
echo -e "${BLUE}测试总结${NC}"
echo -e "${BLUE}==================================${NC}"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有测试通过！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ 部分测试失败，请检查安装${NC}"
    exit 1
fi

