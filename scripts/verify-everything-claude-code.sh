#!/bin/bash
# Everything Claude Code 功能验证脚本
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
echo -e "${BLUE}Everything Claude Code 功能验证${NC}"
echo -e "${BLUE}==================================${NC}"
echo "验证目录: $CLAUDE_DIR"
echo ""

# 测试结果统计
PASSED=0
FAILED=0
WARNINGS=0

# 测试函数
test_pass() {
    echo -e "${GREEN}✓ $1${NC}"
    PASSED=$((PASSED + 1))
}

test_fail() {
    echo -e "${RED}✗ $1${NC}"
    FAILED=$((FAILED + 1))
}

test_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# 检查文件是否存在且可读
check_file_readable() {
    local file=$1
    local description=$2
    
    if [ ! -f "$file" ]; then
        test_fail "$description: 文件不存在"
        return 1
    fi
    
    if [ ! -r "$file" ]; then
        test_fail "$description: 文件不可读"
        return 1
    fi
    
    return 0
}

# 检查目录是否存在
check_dir_exists() {
    local dir=$1
    local description=$2
    
    if [ ! -d "$dir" ]; then
        test_fail "$description: 目录不存在"
        return 1
    fi
    
    return 0
}

# 验证 Markdown 文件格式（检查 frontmatter）
verify_markdown_frontmatter() {
    local file=$1
    local description=$2
    
    if ! check_file_readable "$file" "$description"; then
        return 1
    fi
    
    # 检查是否有 frontmatter（以 --- 开头）
    if ! head -1 "$file" | grep -q "^---"; then
        test_warn "$description: 缺少 frontmatter（可选）"
        return 0
    fi
    
    # 检查 frontmatter 是否完整（至少有两行 ---）
    local frontmatter_lines=$(head -20 "$file" | grep -c "^---" || echo "0")
    if [ "$frontmatter_lines" -lt 2 ]; then
        test_warn "$description: frontmatter 可能不完整"
        return 0
    fi
    
    return 0
}

# 验证 JSON 文件格式
verify_json_format() {
    local file=$1
    local description=$2
    
    if ! check_file_readable "$file" "$description"; then
        return 1
    fi
    
    if command -v jq &> /dev/null; then
        if jq empty "$file" 2>/dev/null; then
            return 0
        else
            test_fail "$description: JSON 格式错误"
            return 1
        fi
    else
        # 如果没有 jq，简单检查是否以 { 开头
        if head -1 "$file" | grep -q "^[{[]"; then
            test_warn "$description: 无法验证 JSON 格式（需要 jq）"
            return 0
        else
            test_fail "$description: 不是有效的 JSON 文件"
            return 1
        fi
    fi
}

# 测试 Agents
echo -e "\n${BLUE}测试 Agents...${NC}"
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

for agent in "${AGENTS[@]}"; do
    agent_file="$CLAUDE_DIR/agents/$agent"
    if verify_markdown_frontmatter "$agent_file" "$agent"; then
        test_pass "$agent"
    fi
done

# 测试 Commands
echo -e "\n${BLUE}测试 Commands...${NC}"
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

for cmd in "${COMMANDS[@]}"; do
    cmd_file="$CLAUDE_DIR/commands/$cmd"
    if verify_markdown_frontmatter "$cmd_file" "$cmd"; then
        test_pass "$cmd"
    fi
done

# 测试 Skills
echo -e "\n${BLUE}测试 Skills...${NC}"
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

for skill in "${SKILLS[@]}"; do
    skill_dir="$CLAUDE_DIR/skills/$skill"
    if check_dir_exists "$skill_dir" "$skill/"; then
        # 检查是否有 SKILL.md 文件
        if [ -f "$skill_dir/SKILL.md" ]; then
            if verify_markdown_frontmatter "$skill_dir/SKILL.md" "$skill/SKILL.md"; then
                test_pass "$skill/"
            fi
        else
            test_warn "$skill/: 缺少 SKILL.md 文件"
        fi
    fi
done

# 测试 Rules
echo -e "\n${BLUE}测试 Rules...${NC}"
RULES=(
    "security.md"
    "coding-style.md"
    "testing.md"
    "git-workflow.md"
    "agents.md"
    "performance.md"
)

for rule in "${RULES[@]}"; do
    rule_file="$CLAUDE_DIR/rules/$rule"
    if check_file_readable "$rule_file" "$rule"; then
        test_pass "$rule"
    fi
done

# 测试 Hooks 配置
echo -e "\n${BLUE}测试 Hooks 配置...${NC}"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
[ ! -f "$SETTINGS_FILE" ] && SETTINGS_FILE="$HOME/.claude/settings.json"

if [ -f "$SETTINGS_FILE" ]; then
    if verify_json_format "$SETTINGS_FILE" "settings.json"; then
        test_pass "settings.json"
        
        # 检查是否有 hooks 字段
        if command -v jq &> /dev/null; then
            if jq -e '.hooks' "$SETTINGS_FILE" > /dev/null 2>&1; then
                local hooks_count=$(jq '.hooks | length' "$SETTINGS_FILE" 2>/dev/null || echo "0")
                echo -e "  ${GREEN}  包含 $hooks_count 个 hook 类型${NC}"
            else
                test_warn "settings.json: 缺少 hooks 字段"
            fi
        fi
    fi
else
    test_warn "settings.json: 文件不存在（可选）"
fi

# 测试 MCP 配置
echo -e "\n${BLUE}测试 MCP 配置...${NC}"
MCP_FILE="$CLAUDE_DIR/.mcp.json"
if [ -f "$MCP_FILE" ]; then
    if verify_json_format "$MCP_FILE" ".mcp.json"; then
        test_pass ".mcp.json"
        
        # 检查是否有 mcpServers 字段
        if command -v jq &> /dev/null; then
            if jq -e '.mcpServers' "$MCP_FILE" > /dev/null 2>&1; then
                local mcp_count=$(jq '.mcpServers | length' "$MCP_FILE" 2>/dev/null || echo "0")
                echo -e "  ${GREEN}  包含 $mcp_count 个 MCP 服务器${NC}"
                
                # 检查是否有 API 密钥占位符
                if grep -q "YOUR_.*_HERE" "$MCP_FILE"; then
                    test_warn ".mcp.json: 包含 API 密钥占位符，需要替换"
                fi
            else
                test_warn ".mcp.json: 缺少 mcpServers 字段"
            fi
        fi
    fi
else
    test_warn ".mcp.json: 文件不存在（可选）"
fi

# 测试 Scripts
echo -e "\n${BLUE}测试 Scripts...${NC}"
if [ -d "scripts/everything-claude-code" ]; then
    if check_dir_exists "scripts/everything-claude-code" "scripts/everything-claude-code/"; then
        script_count=$(find scripts/everything-claude-code -type f -name "*.js" 2>/dev/null | wc -l)
        if [ "$script_count" -gt 0 ]; then
            test_pass "scripts/everything-claude-code/ ($script_count 个脚本)"
        else
            test_warn "scripts/everything-claude-code/: 没有找到 .js 脚本文件"
        fi
    fi
else
    test_warn "scripts/everything-claude-code/: 目录不存在（可选）"
fi

# 验证 OpenCode 兼容性
echo -e "\n${BLUE}验证 OpenCode 兼容性...${NC}"

# 检查 OpenCode 是否安装
if command -v opencode &> /dev/null; then
    test_pass "OpenCode 已安装"
    
    # 检查 Oh My OpenCode 插件
    if bunx oh-my-opencode --version &> /dev/null || bunx oh-my-opencode doctor &> /dev/null; then
        test_pass "Oh My OpenCode 插件可用"
    else
        test_warn "Oh My OpenCode 插件可能未安装或不可用"
    fi
else
    test_warn "OpenCode 未安装（无法测试运行时功能）"
fi

# 总结
echo -e "\n${BLUE}==================================${NC}"
echo -e "${BLUE}验证总结${NC}"
echo -e "${BLUE}==================================${NC}"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo -e "${YELLOW}警告: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ 所有验证通过！${NC}"
        exit 0
    else
        echo -e "${GREEN}✓ 核心功能验证通过！${NC}"
        echo -e "${YELLOW}⚠ 有一些警告，但不影响核心功能${NC}"
        exit 0
    fi
else
    echo -e "${RED}✗ 部分验证失败，请检查安装${NC}"
    exit 1
fi

