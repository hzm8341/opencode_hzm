#!/bin/bash
# OpenCode 集成测试脚本
# 测试 Everything Claude Code 组件是否能被 OpenCode 正确加载
# 版本: v1.0
# 日期: 2026-01-26

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}OpenCode 集成测试${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

PASSED=0
FAILED=0
SKIPPED=0

test_pass() {
    echo -e "${GREEN}✓ $1${NC}"
    PASSED=$((PASSED + 1))
}

test_fail() {
    echo -e "${RED}✗ $1${NC}"
    FAILED=$((FAILED + 1))
}

test_skip() {
    echo -e "${YELLOW}⊘ $1 (跳过)${NC}"
    SKIPPED=$((SKIPPED + 1))
}

# 检查 OpenCode 是否安装
if ! command -v opencode &> /dev/null; then
    echo -e "${RED}错误: OpenCode 未安装${NC}"
    exit 1
fi

test_pass "OpenCode 已安装"

# 检查 Oh My OpenCode 插件
echo -e "\n${BLUE}检查 Oh My OpenCode 插件...${NC}"
if bunx oh-my-opencode doctor &> /dev/null || bunx oh-my-opencode --version &> /dev/null; then
    test_pass "Oh My OpenCode 插件可用"
else
    test_fail "Oh My OpenCode 插件不可用"
    echo -e "${YELLOW}提示: 运行 'bunx oh-my-opencode install' 安装插件${NC}"
fi

# 检查文件结构
echo -e "\n${BLUE}检查文件结构...${NC}"

# 检查 Agents
if [ -d ".claude/agents" ] && [ "$(ls -1 .claude/agents/*.md 2>/dev/null | wc -l)" -ge 9 ]; then
    test_pass "Agents 目录存在且包含文件"
else
    test_fail "Agents 目录不存在或文件不足"
fi

# 检查 Commands
if [ -d ".claude/commands" ] && [ "$(ls -1 .claude/commands/*.md 2>/dev/null | wc -l)" -ge 15 ]; then
    test_pass "Commands 目录存在且包含文件"
else
    test_fail "Commands 目录不存在或文件不足"
fi

# 检查 Skills
if [ -d ".claude/skills" ] && [ "$(ls -d .claude/skills/*/ 2>/dev/null | wc -l)" -ge 11 ]; then
    test_pass "Skills 目录存在且包含目录"
else
    test_fail "Skills 目录不存在或目录不足"
fi

# 检查 Rules
if [ -d ".claude/rules" ] && [ "$(ls -1 .claude/rules/*.md 2>/dev/null | wc -l)" -ge 6 ]; then
    test_pass "Rules 目录存在且包含文件"
else
    test_fail "Rules 目录不存在或文件不足"
fi

# 检查配置文件
echo -e "\n${BLUE}检查配置文件...${NC}"

if [ -f ".claude/settings.json" ]; then
    if python3 -m json.tool .claude/settings.json > /dev/null 2>&1; then
        test_pass "settings.json 存在且格式正确"
    else
        test_fail "settings.json 格式错误"
    fi
else
    test_fail "settings.json 不存在"
fi

if [ -f ".claude/.mcp.json" ]; then
    if python3 -m json.tool .claude/.mcp.json > /dev/null 2>&1; then
        test_pass ".mcp.json 存在且格式正确"
    else
        test_fail ".mcp.json 格式错误"
    fi
else
    test_fail ".mcp.json 不存在"
fi

# 验证文件格式
echo -e "\n${BLUE}验证文件格式...${NC}"

# 验证 Agents 格式（检查 frontmatter）
AGENT_COUNT=0
for agent in .claude/agents/*.md; do
    if [ -f "$agent" ]; then
        if head -1 "$agent" | grep -q "^---"; then
            AGENT_COUNT=$((AGENT_COUNT + 1))
        fi
    fi
done

if [ "$AGENT_COUNT" -ge 9 ]; then
    test_pass "Agents 格式正确 ($AGENT_COUNT 个包含 frontmatter)"
else
    test_fail "部分 Agents 格式不正确 ($AGENT_COUNT/9 包含 frontmatter)"
fi

# 验证 Commands 格式
COMMAND_COUNT=0
for cmd in .claude/commands/*.md; do
    if [ -f "$cmd" ]; then
        if head -1 "$cmd" | grep -q "^---"; then
            COMMAND_COUNT=$((COMMAND_COUNT + 1))
        fi
    fi
done

if [ "$COMMAND_COUNT" -ge 10 ]; then
    test_pass "Commands 格式正确 ($COMMAND_COUNT 个包含 frontmatter)"
else
    echo -e "${YELLOW}⚠ 部分 Commands 缺少 frontmatter ($COMMAND_COUNT/15 包含 frontmatter，这是可选的)${NC}"
    SKIPPED=$((SKIPPED + 1))
fi

# 验证 Skills 格式
SKILL_COUNT=0
for skill_dir in .claude/skills/*/; do
    if [ -f "${skill_dir}SKILL.md" ]; then
        SKILL_COUNT=$((SKILL_COUNT + 1))
    fi
done

if [ "$SKILL_COUNT" -ge 11 ]; then
    test_pass "Skills 格式正确 ($SKILL_COUNT 个包含 SKILL.md)"
else
    test_fail "部分 Skills 格式不正确 ($SKILL_COUNT/11 包含 SKILL.md)"
fi

# 测试 OpenCode 是否能识别 agents（通过检查配置）
echo -e "\n${BLUE}测试 OpenCode 配置加载...${NC}"

# 检查 OpenCode 是否能读取配置目录
if [ -d ".claude" ]; then
    test_pass ".claude 目录可访问"
else
    test_fail ".claude 目录不可访问"
fi

# 总结
echo -e "\n${BLUE}==================================${NC}"
echo -e "${BLUE}测试总结${NC}"
echo -e "${BLUE}==================================${NC}"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo -e "${YELLOW}跳过: $SKIPPED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有集成测试通过！${NC}"
    echo ""
    echo "下一步:"
    echo "1. 运行 'opencode run \"@planner 测试规划功能\"' 测试 agent"
    echo "2. 运行 'opencode run \"/plan 创建一个测试计划\"' 测试 command"
    echo "3. 检查 MCP 配置中的 API 密钥占位符"
    exit 0
else
    echo -e "${RED}✗ 部分集成测试失败，请检查安装${NC}"
    exit 1
fi

