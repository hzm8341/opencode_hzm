#!/bin/bash
# Everything Claude Code 安装脚本
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
SOURCE_DIR="${1:-everything-claude-code}"
INSTALL_MODE="${2:-project}" # project 或 user
CLAUDE_DIR=""
SETTINGS_JSON=""
BACKUP_DIR=""

# 确定安装目录
if [ "$INSTALL_MODE" = "user" ]; then
    CLAUDE_DIR="$HOME/.claude"
    SETTINGS_JSON="$HOME/.claude/settings.json"
    BACKUP_DIR="$HOME/.claude/backup_$(date +%Y%m%d_%H%M%S)"
else
    CLAUDE_DIR=".claude"
    SETTINGS_JSON=".claude/settings.json"
    BACKUP_DIR=".claude/backup_$(date +%Y%m%d_%H%M%S)"
fi

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Everything Claude Code 安装脚本${NC}"
echo -e "${GREEN}==================================${NC}"
echo "源目录: $SOURCE_DIR"
echo "安装模式: $INSTALL_MODE"
echo "目标目录: $CLAUDE_DIR"
echo ""

# 检查源目录
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}错误: 源目录不存在: $SOURCE_DIR${NC}"
    echo "请确保 everything-claude-code 目录在当前目录下"
    exit 1
fi

# 检查必要的子目录
for dir in agents commands skills rules hooks mcp-configs; do
    if [ ! -d "$SOURCE_DIR/$dir" ]; then
        echo -e "${YELLOW}警告: 源目录缺少 $dir 子目录${NC}"
    fi
done

# 检查 OpenCode（可选）
if ! command -v opencode &> /dev/null; then
    echo -e "${YELLOW}警告: 未找到 opencode 命令${NC}"
    echo "安装将继续进行，但请确保 OpenCode 已正确安装"
    read -p "是否继续安装? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 创建目录结构
echo -e "\n${BLUE}创建目录结构...${NC}"
mkdir -p "$CLAUDE_DIR"/{agents,commands,skills,rules}
mkdir -p "$CLAUDE_DIR"/hooks
mkdir -p "$BACKUP_DIR"

# 备份现有配置
echo -e "\n${BLUE}备份现有配置...${NC}"
if [ -f "$SETTINGS_JSON" ]; then
    cp "$SETTINGS_JSON" "$BACKUP_DIR/settings.json.backup"
    echo -e "${GREEN}✓ 已备份 settings.json${NC}"
fi

if [ -f "$CLAUDE_DIR/.mcp.json" ]; then
    cp "$CLAUDE_DIR/.mcp.json" "$BACKUP_DIR/.mcp.json.backup"
    echo -e "${GREEN}✓ 已备份 .mcp.json${NC}"
fi

# 安装函数
install_component() {
    local component=$1
    local source_path=$2
    local target_path=$3
    local description=$4
    
    echo -e "\n${BLUE}安装 $description...${NC}"
    
    if [ ! -e "$source_path" ]; then
        echo -e "${YELLOW}跳过: $source_path 不存在${NC}"
        return
    fi
    
    # 检查冲突
    local conflicts=0
    if [ -d "$source_path" ]; then
        # 对于目录，检查是否有文件冲突
        for file in "$source_path"/*; do
            if [ -f "$file" ]; then
                local filename=$(basename "$file")
                if [ -f "$target_path/$filename" ]; then
                    conflicts=$((conflicts + 1))
                fi
            fi
        done
        
        if [ $conflicts -gt 0 ]; then
            echo -e "${YELLOW}检测到 $conflicts 个现有文件${NC}"
            read -p "覆盖现有文件? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "跳过 $description"
                return
            fi
        fi
    elif [ -f "$source_path" ] && [ -f "$target_path" ]; then
        echo -e "${YELLOW}检测到现有文件${NC}"
        read -p "覆盖现有文件? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "跳过 $description"
            return
        fi
    fi
    
    # 复制文件
    if [ -d "$source_path" ]; then
        cp -r "$source_path"/* "$target_path/" 2>/dev/null || true
        echo -e "${GREEN}✓ $description 安装完成 ($(ls -1 "$target_path" 2>/dev/null | wc -l) 个文件)${NC}"
    else
        cp "$source_path" "$target_path"
        echo -e "${GREEN}✓ $description 安装完成${NC}"
    fi
}

# 安装各个组件
install_component "agents" "$SOURCE_DIR/agents" "$CLAUDE_DIR/agents" "Agents"
install_component "commands" "$SOURCE_DIR/commands" "$CLAUDE_DIR/commands" "Commands"
install_component "skills" "$SOURCE_DIR/skills" "$CLAUDE_DIR/skills" "Skills"
install_component "rules" "$SOURCE_DIR/rules" "$CLAUDE_DIR/rules" "Rules"

# 合并 Hooks
echo -e "\n${BLUE}合并 Hooks 配置...${NC}"
if [ -f "$SOURCE_DIR/hooks/hooks.json" ]; then
    if [ -f "$SETTINGS_JSON" ]; then
        # 检查是否有 jq
        if command -v jq &> /dev/null; then
            echo "使用 jq 合并 hooks..."
            # 读取现有配置
            local existing_hooks=$(jq '.hooks // {}' "$SETTINGS_JSON" 2>/dev/null || echo '{}')
            local new_hooks=$(jq '.hooks // {}' "$SOURCE_DIR/hooks/hooks.json" 2>/dev/null || echo '{}')
            
            # 合并 hooks
            local merged=$(echo "$existing_hooks" "$new_hooks" | jq -s '.[0] * .[1]')
            
            # 更新 settings.json
            jq ".hooks = $merged" "$SETTINGS_JSON" > "$SETTINGS_JSON.tmp" && mv "$SETTINGS_JSON.tmp" "$SETTINGS_JSON"
            echo -e "${GREEN}✓ Hooks 配置已合并${NC}"
            echo -e "${YELLOW}提示: 请检查合并后的 hooks 配置，确保没有冲突${NC}"
        else
            echo -e "${YELLOW}警告: 未找到 jq，无法自动合并 hooks${NC}"
            echo "源文件: $SOURCE_DIR/hooks/hooks.json"
            echo "目标文件: $SETTINGS_JSON"
            echo "请手动合并 hooks 配置"
            cp "$SOURCE_DIR/hooks/hooks.json" "$BACKUP_DIR/hooks.json.source"
        fi
    else
        # 创建新的 settings.json
        echo "创建新的 settings.json..."
        mkdir -p "$(dirname "$SETTINGS_JSON")"
        cp "$SOURCE_DIR/hooks/hooks.json" "$SETTINGS_JSON"
        echo -e "${GREEN}✓ 已创建 settings.json${NC}"
    fi
else
    echo -e "${YELLOW}跳过: hooks.json 不存在${NC}"
fi

# 复制 hooks 脚本
if [ -d "$SOURCE_DIR/hooks/memory-persistence" ] || [ -d "$SOURCE_DIR/hooks/strategic-compact" ]; then
    echo -e "\n${BLUE}复制 Hooks 脚本...${NC}"
    mkdir -p "$CLAUDE_DIR/hooks"
    [ -d "$SOURCE_DIR/hooks/memory-persistence" ] && cp -r "$SOURCE_DIR/hooks/memory-persistence" "$CLAUDE_DIR/hooks/" 2>/dev/null || true
    [ -d "$SOURCE_DIR/hooks/strategic-compact" ] && cp -r "$SOURCE_DIR/hooks/strategic-compact" "$CLAUDE_DIR/hooks/" 2>/dev/null || true
    echo -e "${GREEN}✓ Hooks 脚本已复制${NC}"
fi

# 合并 MCP 配置
echo -e "\n${BLUE}合并 MCP 配置...${NC}"
if [ -f "$SOURCE_DIR/mcp-configs/mcp-servers.json" ]; then
    MCP_FILE="$CLAUDE_DIR/.mcp.json"
    if [ -f "$MCP_FILE" ]; then
        if command -v jq &> /dev/null; then
            echo "合并 MCP 配置..."
            local existing_mcp=$(jq '.mcpServers // {}' "$MCP_FILE" 2>/dev/null || echo '{}')
            local new_mcp=$(jq '.mcpServers // {}' "$SOURCE_DIR/mcp-configs/mcp-servers.json" 2>/dev/null || echo '{}')
            
            # 合并 MCP servers
            local merged_mcp=$(echo "$existing_mcp" "$new_mcp" | jq -s '.[0] * .[1]')
            
            # 更新 .mcp.json
            jq ".mcpServers = $merged_mcp" "$MCP_FILE" > "$MCP_FILE.tmp" && mv "$MCP_FILE.tmp" "$MCP_FILE"
            echo -e "${GREEN}✓ MCP 配置已合并${NC}"
        else
            echo -e "${YELLOW}警告: 请手动合并 MCP 配置${NC}"
            cp "$SOURCE_DIR/mcp-configs/mcp-servers.json" "$BACKUP_DIR/mcp-servers.json.source"
        fi
    else
        mkdir -p "$(dirname "$MCP_FILE")"
        cp "$SOURCE_DIR/mcp-configs/mcp-servers.json" "$MCP_FILE"
        echo -e "${GREEN}✓ 已创建 .mcp.json${NC}"
    fi
    echo -e "${YELLOW}重要: 请替换 MCP 配置中的 API 密钥占位符 (YOUR_*_HERE)${NC}"
else
    echo -e "${YELLOW}跳过: mcp-servers.json 不存在${NC}"
fi

# 复制 Scripts（可选）
echo -e "\n${BLUE}安装 Scripts...${NC}"
read -p "是否安装 Scripts? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    mkdir -p scripts/everything-claude-code
    if [ -d "$SOURCE_DIR/scripts" ]; then
        cp -r "$SOURCE_DIR/scripts"/* scripts/everything-claude-code/
        find scripts/everything-claude-code -type f -name "*.js" -exec chmod +x {} \; 2>/dev/null || true
        echo -e "${GREEN}✓ Scripts 安装完成${NC}"
        echo -e "${YELLOW}提示: 请设置 CLAUDE_PLUGIN_ROOT 环境变量或更新脚本中的路径${NC}"
    else
        echo -e "${YELLOW}跳过: scripts 目录不存在${NC}"
    fi
fi

# 完成
echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}安装完成！${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo "下一步:"
echo "1. 检查并配置 MCP API 密钥 (编辑 $CLAUDE_DIR/.mcp.json)"
echo "2. 验证 hooks 配置是否正确合并 (检查 $SETTINGS_JSON)"
echo "3. 测试 agents 和 commands"
echo ""
echo "备份位置: $BACKUP_DIR"
echo ""
echo "卸载: 运行 scripts/uninstall-everything-claude-code.sh"
echo "测试: 运行 scripts/test-everything-claude-code.sh"

