#!/bin/bash
# OpenCode Skills 同步脚本
# 用途：自动检测并创建 skills 符号链接，支持跨设备使用
# 版本：v1.0
# 日期：2025-01-16

# 不使用 set -e，因为我们需要处理循环中的错误

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# 可能的 skills 源路径（按优先级排序）
POSSIBLE_PATHS=(
    "/media/hzm/data_disk/opencode/skills"
    "$HOME/Dropbox/opencode-skills"
    "$HOME/OneDrive/opencode-skills"
    "$HOME/Google Drive/opencode-skills"
    "$HOME/opencode/skills"
    "$HOME/projects/opencode/skills"
    "$HOME/code/opencode/skills"
    "$HOME/workspace/opencode/skills"
)

# 目标目录
SKILLS_TARGET="$HOME/.config/opencode/skill"

# 查找 skills 目录
find_skills_dir() {
    for path in "${POSSIBLE_PATHS[@]}"; do
        if [ -d "$path" ] && [ -f "$path/docx/SKILL.md" ]; then
            echo "$path"
            return 0
        fi
    done
    
    # 如果标准路径都没找到，尝试从当前脚本位置推断
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PARENT_DIR="$(dirname "$SCRIPT_DIR")"
    if [ -d "$PARENT_DIR/skills" ] && [ -f "$PARENT_DIR/skills/docx/SKILL.md" ]; then
        echo "$PARENT_DIR/skills"
        return 0
    fi
    
    return 1
}

# 创建符号链接
create_symlinks() {
    local skills_source="$1"
    local count=0
    local skipped=0
    local errors=0
    
    info "从以下位置创建符号链接: $skills_source"
    info "目标目录: $SKILLS_TARGET"
    echo ""
    
    # 确保目标目录存在
    mkdir -p "$SKILLS_TARGET"
    cd "$SKILLS_TARGET"
    
    # 遍历所有 skill 目录
    for skill_dir in "$skills_source"/*/; do
        # 检查是否是目录
        [ ! -d "$skill_dir" ] && continue
        
        skill_name=$(basename "$skill_dir")
        
        # 检查是否包含 SKILL.md
        if [ ! -f "$skill_dir/SKILL.md" ]; then
            warning "跳过 $skill_name (缺少 SKILL.md)"
            ((skipped++))
            continue
        fi
        
        # 如果目标已存在且不是符号链接，跳过
        if [ -e "$skill_name" ] && [ ! -L "$skill_name" ]; then
            warning "跳过 $skill_name (已存在且不是符号链接)"
            ((skipped++))
            continue
        fi
        
        # 删除旧的符号链接（如果存在）
        if [ -L "$skill_name" ]; then
            # 检查链接是否指向相同位置
            current_target=$(readlink -f "$skill_name")
            new_target=$(readlink -f "$skill_dir")
            if [ "$current_target" = "$new_target" ]; then
                success "已存在: $skill_name -> $current_target"
                ((count++))
                continue
            else
                rm "$skill_name"
                info "更新链接: $skill_name"
            fi
        fi
        
        # 创建新的符号链接
        if ln -s "$skill_dir" "$skill_name" 2>/dev/null; then
            success "已链接: $skill_name"
            ((count++))
        else
            error "链接失败: $skill_name"
            ((errors++))
        fi
    done
    
    echo ""
    if [ $errors -eq 0 ]; then
        success "完成！成功链接 $count 个 skills"
        [ $skipped -gt 0 ] && warning "跳过了 $skipped 个目录"
    else
        error "完成，但有 $errors 个错误"
        success "成功链接 $count 个 skills"
        [ $skipped -gt 0 ] && warning "跳过了 $skipped 个目录"
    fi
}

# 验证链接
verify_links() {
    info "验证符号链接..."
    local valid=0
    local invalid=0
    
    if [ ! -d "$SKILLS_TARGET" ]; then
        error "目标目录不存在: $SKILLS_TARGET"
        return 1
    fi
    
    for link in "$SKILLS_TARGET"/*; do
        [ ! -L "$link" ] && continue
        
        link_name=$(basename "$link")
        if [ -f "$link/SKILL.md" ]; then
            valid=$((valid + 1))
        else
            warning "无效链接: $link_name (SKILL.md 不存在)"
            invalid=$((invalid + 1))
        fi
    done
    
    echo ""
    if [ $invalid -eq 0 ]; then
        success "所有 $valid 个链接都有效"
    else
        warning "$valid 个有效链接，$invalid 个无效链接"
    fi
}

# 列出所有 skills
list_skills() {
    info "当前已链接的 skills:"
    echo ""
    
    if [ ! -d "$SKILLS_TARGET" ]; then
        error "目标目录不存在: $SKILLS_TARGET"
        return 1
    fi
    
    local count=0
    for link in "$SKILLS_TARGET"/*; do
        [ ! -L "$link" ] && continue
        
        link_name=$(basename "$link")
        target=$(readlink -f "$link")
        
        if [ -f "$link/SKILL.md" ]; then
            # 读取 skill 名称和描述
            name=$(grep -E "^name:" "$link/SKILL.md" | head -1 | sed 's/^name:[[:space:]]*//' | tr -d '"' || echo "$link_name")
            desc=$(grep -E "^description:" "$link/SKILL.md" | head -1 | sed 's/^description:[[:space:]]*//' | tr -d '"' || echo "无描述")
            
            echo "  ${GREEN}✓${NC} $link_name"
            echo "     名称: $name"
            echo "     描述: $desc"
            echo "     路径: $target"
            echo ""
            ((count++))
        else
            echo "  ${YELLOW}⚠${NC} $link_name (无效)"
            echo ""
        fi
    done
    
    if [ $count -eq 0 ]; then
        warning "没有找到任何 skills"
    else
        success "共找到 $count 个 skills"
    fi
}

# 清理所有链接
clean_links() {
    warning "这将删除所有符号链接，是否继续？(y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        info "已取消"
        return
    fi
    
    if [ ! -d "$SKILLS_TARGET" ]; then
        info "目标目录不存在，无需清理"
        return
    fi
    
    local count=0
    for link in "$SKILLS_TARGET"/*; do
        if [ -L "$link" ]; then
            rm "$link"
            ((count++))
        fi
    done
    
    success "已删除 $count 个符号链接"
}

# 主函数
main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  OpenCode Skills 同步脚本"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    case "${1:-sync}" in
        sync)
            # 如果提供了路径参数，直接使用
            if [ -n "$2" ]; then
                SKILLS_SOURCE="$2"
                if [ ! -d "$SKILLS_SOURCE" ]; then
                    error "目录不存在: $SKILLS_SOURCE"
                    exit 1
                fi
                if [ ! -f "$SKILLS_SOURCE/docx/SKILL.md" ]; then
                    warning "警告: 目录中未找到 docx/SKILL.md，可能不是有效的 skills 目录"
                fi
            else
                info "正在查找 skills 目录..."
                SKILLS_SOURCE=$(find_skills_dir)
                if [ -z "$SKILLS_SOURCE" ]; then
                    error "未找到 skills 目录"
                    echo ""
                    echo "请检查以下路径之一是否存在:"
                    for path in "${POSSIBLE_PATHS[@]}"; do
                        echo "  - $path"
                    done
                    echo ""
                    echo "或者手动指定路径:"
                    echo "  $0 sync /path/to/skills"
                    exit 1
                fi
            fi
            
            success "找到 skills 目录: $SKILLS_SOURCE"
            echo ""
            create_symlinks "$SKILLS_SOURCE"
            echo ""
            verify_links
            ;;
        list)
            list_skills
            ;;
        verify)
            verify_links
            ;;
        clean)
            clean_links
            ;;
        *)
            echo "用法: $0 [命令] [路径]"
            echo ""
            echo "命令:"
            echo "  sync [路径]   - 同步 skills（创建符号链接）"
            echo "  list          - 列出所有已链接的 skills"
            echo "  verify        - 验证所有链接"
            echo "  clean         - 清理所有符号链接"
            echo ""
            echo "示例:"
            echo "  $0 sync                    # 自动查找并同步"
            echo "  $0 sync /path/to/skills    # 从指定路径同步"
            echo "  $0 list                    # 列出所有 skills"
            echo "  $0 verify                  # 验证链接"
            echo "  $0 clean                   # 清理所有链接"
            exit 1
            ;;
    esac
}

# 直接调用主函数
main "$@"

