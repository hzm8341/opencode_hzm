#!/bin/bash

# OpenCode 环境配置脚本
# 用于自动配置 OpenCode 开发环境
# 版本: v2.0
# 日期: 2026-01-26

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志文件
LOG_FILE="/tmp/opencode_setup_$(date +%Y%m%d_%H%M%S).log"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# 打印标题
print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查网络连接
check_network() {
    if ping -c 1 -W 2 8.8.8.8 >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 检查磁盘空间（GB）
check_disk_space() {
    local required_gb=${1:-5}
    local available_gb
    
    # 尝试多种方式获取可用空间
    if command_exists df; then
        # 优先使用 -BG 选项（如果支持）
        if df -BG "$HOME" &>/dev/null; then
            available_gb=$(df -BG "$HOME" 2>/dev/null | awk 'NR==2 {print $4}' | sed 's/G//' | head -1)
        else
            # 使用 -h 选项并转换为 GB
            available_gb=$(df -h "$HOME" 2>/dev/null | awk 'NR==2 {print $4}' | sed 's/G//' | head -1)
        fi
        
        # 验证是否为数字
        if [[ "$available_gb" =~ ^[0-9]+$ ]]; then
            if [ "$available_gb" -lt "$required_gb" ]; then
                log_warning "可用磁盘空间不足: ${available_gb}GB (需要至少 ${required_gb}GB)"
                return 1
            fi
            return 0
        else
            log_warning "无法准确检测磁盘空间，跳过检查"
            return 0
        fi
    else
        log_warning "df 命令不可用，跳过磁盘空间检查"
        return 0
    fi
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPencode_DIR="$SCRIPT_DIR"

log "开始 OpenCode 环境配置"
print_header "OpenCode 环境配置脚本 v2.0"
echo ""

# 检测 shell 类型
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    SHELL_RC="$HOME/.profile"
    SHELL_NAME="unknown"
fi

log_info "检测到 Shell: $SHELL_NAME"
log_info "配置文件: $SHELL_RC"

# 预检查：网络连接和磁盘空间
print_header "预检查"
if check_network; then
    log_success "网络连接正常"
else
    log_warning "网络连接异常，某些功能可能无法使用"
fi

if check_disk_space 5; then
    log_success "磁盘空间充足"
else
    log_warning "磁盘空间可能不足，建议清理后再继续"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 1. 检查并安装 Bun
print_header "步骤 1: 检查 Bun 运行时"

if command_exists bun; then
    BUN_VERSION=$(bun --version)
    log_success "Bun 已安装: $BUN_VERSION"
    
    # 检查版本
    BUN_MAJOR=$(echo $BUN_VERSION | cut -d. -f1)
    BUN_MINOR=$(echo $BUN_VERSION | cut -d. -f2)
    if [ "$BUN_MAJOR" -lt 1 ] || ([ "$BUN_MAJOR" -eq 1 ] && [ "$BUN_MINOR" -lt 3 ]); then
        log_warning "Bun 版本过低，需要 1.3+，当前版本: $BUN_VERSION"
        read -p "是否更新 Bun? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "正在更新 Bun..."
            if check_network; then
                curl -fsSL https://bun.sh/install | bash
                export PATH="$HOME/.bun/bin:$PATH"
                log_success "Bun 更新完成"
            else
                log_error "网络连接失败，无法更新 Bun"
            fi
        fi
    fi
else
    log_warning "Bun 未安装"
    read -p "是否安装 Bun? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if check_network; then
            log_info "正在安装 Bun..."
            curl -fsSL https://bun.sh/install | bash
            export PATH="$HOME/.bun/bin:$PATH"
            log_success "Bun 安装完成"
        else
            log_error "网络连接失败，无法安装 Bun"
            exit 1
        fi
    else
        log_error "未安装 Bun，无法继续"
        exit 1
    fi
fi

# 2. 检查 Node.js (可选)
print_header "步骤 2: 检查 Node.js (可选)"

if command_exists node; then
    NODE_VERSION=$(node --version)
    log_success "Node.js 已安装: $NODE_VERSION"
    
    # 检查 npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        log_info "npm 版本: $NPM_VERSION"
    fi
else
    log_warning "Node.js 未安装 (可选，某些工具可能需要)"
fi

# 3. 检查 Python 3
print_header "步骤 3: 检查 Python 3"

if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    log_success "Python 3 已安装: $PYTHON_VERSION"
    
    # 检查 pip3
    if command_exists pip3; then
        PIP_VERSION=$(pip3 --version | cut -d' ' -f2)
        log_info "pip3 版本: $PIP_VERSION"
    else
        log_warning "pip3 未安装"
    fi
    
    # 检查 Python 版本是否满足要求（建议 3.8+）
    PYTHON_MAJOR=$(python3 -c 'import sys; print(sys.version_info.major)')
    PYTHON_MINOR=$(python3 -c 'import sys; print(sys.version_info.minor)')
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
        log_warning "Python 版本较低，建议使用 Python 3.8+"
    fi
else
    log_warning "Python 3 未安装 (某些 Skills 需要)"
    echo "可以使用以下命令安装:"
    echo "  Ubuntu/Debian: sudo apt-get install python3 python3-pip"
    echo "  macOS: brew install python3"
fi

# 4. 检查 Git
print_header "步骤 4: 检查 Git"

if command_exists git; then
    GIT_VERSION=$(git --version)
    log_success "Git 已安装: $GIT_VERSION"
    
    # 检查 Git 配置
    if [ -z "$(git config --global user.name)" ]; then
        log_warning "Git 用户名未配置"
    fi
    if [ -z "$(git config --global user.email)" ]; then
        log_warning "Git 邮箱未配置"
    fi
else
    log_warning "Git 未安装 (用于版本控制功能)"
fi

# 5. 安装项目依赖
print_header "步骤 5: 安装项目依赖"

cd "$OPencode_DIR"

if [ -f "package.json" ]; then
    log_info "正在安装项目依赖..."
    if bun install; then
        log_success "项目依赖安装完成"
    else
        log_error "项目依赖安装失败"
        exit 1
    fi
else
    log_error "未找到 package.json"
    exit 1
fi

# 6. 配置全局命令别名
print_header "步骤 6: 配置全局命令别名"

OPencode_ALIAS="function opencode-dev() {
    cd $OPencode_DIR && bun dev \"\$@\"
}"

if grep -q "opencode-dev" "$SHELL_RC" 2>/dev/null; then
    log_warning "opencode-dev 别名已存在于 $SHELL_RC"
    read -p "是否更新别名? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 删除旧的别名定义
        sed -i '/function opencode-dev/,/^}/d' "$SHELL_RC"
        echo "" >> "$SHELL_RC"
        echo "# OpenCode 全局命令配置" >> "$SHELL_RC"
        echo "$OPencode_ALIAS" >> "$SHELL_RC"
        log_success "别名已更新"
    fi
else
    read -p "是否添加 opencode-dev 全局命令别名? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "" >> "$SHELL_RC"
        echo "# OpenCode 全局命令配置" >> "$SHELL_RC"
        echo "$OPencode_ALIAS" >> "$SHELL_RC"
        log_success "别名已添加到 $SHELL_RC"
        log_warning "请运行 'source $SHELL_RC' 或重新打开终端使配置生效"
    fi
fi

# 7. 检查并创建配置文件目录
print_header "步骤 7: 检查配置文件目录"

CONFIG_DIR="$HOME/.config/opencode"
SKILL_CONFIG_DIR="$CONFIG_DIR/skill"
PROJECT_SKILL_DIR="$OPencode_DIR/.opencode/skill"

if [ ! -d "$CONFIG_DIR" ]; then
    mkdir -p "$CONFIG_DIR"
    log_success "创建配置目录: $CONFIG_DIR"
else
    log_success "配置目录已存在: $CONFIG_DIR"
fi

# 创建 Skills 配置目录
if [ ! -d "$SKILL_CONFIG_DIR" ]; then
    mkdir -p "$SKILL_CONFIG_DIR"
    log_success "创建 Skills 配置目录: $SKILL_CONFIG_DIR"
else
    log_success "Skills 配置目录已存在: $SKILL_CONFIG_DIR"
fi

# 创建项目级 Skills 配置目录
if [ ! -d "$PROJECT_SKILL_DIR" ]; then
    mkdir -p "$PROJECT_SKILL_DIR"
    log_success "创建项目级 Skills 配置目录: $PROJECT_SKILL_DIR"
fi

# 8. 检查 Skills 目录
print_header "步骤 8: 检查 Skills 目录"

SKILLS_DIR="$OPencode_DIR/skills"
if [ -d "$SKILLS_DIR" ]; then
    SKILL_COUNT=$(find "$SKILLS_DIR" -maxdepth 1 -type d 2>/dev/null | wc -l)
    SKILL_COUNT=$((SKILL_COUNT - 1))  # 减去自身
    log_success "Skills 目录存在，包含 $SKILL_COUNT 个技能"
    
    # 检查 skill_urls.txt
    if [ -f "$SKILLS_DIR/skill_urls.txt" ]; then
        URL_COUNT=$(wc -l < "$SKILLS_DIR/skill_urls.txt" 2>/dev/null || echo "0")
        log_info "发现 $URL_COUNT 个 Skills URL 配置"
    fi
else
    log_warning "Skills 目录不存在"
fi

# 检查是否有 sync-skills.sh 脚本
SYNC_SCRIPT="$OPencode_DIR/scripts/sync-skills.sh"
if [ -f "$SYNC_SCRIPT" ]; then
    log_success "发现 Skills 同步脚本: $SYNC_SCRIPT"
    read -p "是否运行 Skills 同步脚本? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "$SKILLS_DIR/skill_urls.txt" ]; then
            log_info "正在同步 Skills..."
            bash "$SYNC_SCRIPT" sync "$SKILLS_DIR" 2>&1 | tee -a "$LOG_FILE"
            log_success "Skills 同步完成"
        else
            log_warning "未找到 skill_urls.txt，跳过同步"
        fi
    fi
fi

# 9. 安装 Skills 依赖 (可选)
print_header "步骤 9: 安装 Skills 依赖 (可选)"

read -p "是否安装 Skills 的 Python 依赖? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command_exists pip3; then
        log_info "正在安装 Python 依赖..."
        
        # PDF skill 依赖
        log_info "安装 PDF 相关依赖..."
        pip3 install --user pypdf pdfplumber reportlab defusedxml 2>&1 | tee -a "$LOG_FILE" || log_warning "部分 PDF 依赖安装失败"
        
        # DOCX skill 依赖
        log_info "安装 DOCX 相关依赖..."
        pip3 install --user defusedxml 2>&1 | tee -a "$LOG_FILE" || log_warning "部分 DOCX 依赖安装失败"
        
        # PPTX skill 依赖
        log_info "安装 PPTX 相关依赖..."
        pip3 install --user "markitdown[pptx]" defusedxml 2>&1 | tee -a "$LOG_FILE" || log_warning "部分 PPTX 依赖安装失败"
        
        # XLSX skill 依赖
        log_info "安装 XLSX 相关依赖..."
        pip3 install --user openpyxl pandas 2>&1 | tee -a "$LOG_FILE" || log_warning "部分 XLSX 依赖安装失败"
        
        # Webapp testing 依赖
        log_info "安装 Webapp testing 相关依赖..."
        pip3 install --user playwright 2>&1 | tee -a "$LOG_FILE" || log_warning "Playwright 安装失败"
        if command_exists playwright; then
            log_info "初始化 Playwright 浏览器..."
            playwright install --with-deps chromium 2>&1 | tee -a "$LOG_FILE" || log_warning "Playwright 浏览器安装失败"
        fi
        
        # Slack GIF creator 依赖
        log_info "安装 GIF 创建相关依赖..."
        pip3 install --user pillow imageio numpy 2>&1 | tee -a "$LOG_FILE" || log_warning "部分 GIF 依赖安装失败"
        
        log_success "Python 依赖安装完成"
    else
        log_error "pip3 未找到，无法安装 Python 依赖"
    fi
fi

# 10. 检查系统工具
print_header "步骤 10: 检查系统工具"

MISSING_TOOLS=()

# 检查 LibreOffice (用于 PDF/DOCX 转换)
if command_exists soffice; then
    log_success "LibreOffice 已安装"
else
    log_warning "LibreOffice 未安装 (用于 PDF/DOCX 转换)"
    MISSING_TOOLS+=("libreoffice")
    echo "  安装命令: sudo apt-get install libreoffice"
fi

# 检查 Poppler (用于 PDF 工具)
if command_exists pdftoppm; then
    log_success "Poppler 已安装"
else
    log_warning "Poppler 未安装 (用于 PDF 工具)"
    MISSING_TOOLS+=("poppler-utils")
    echo "  安装命令: sudo apt-get install poppler-utils"
fi

# 检查 Pandoc (用于文档转换)
if command_exists pandoc; then
    log_success "Pandoc 已安装"
else
    log_warning "Pandoc 未安装 (用于文档转换)"
    MISSING_TOOLS+=("pandoc")
    echo "  安装命令: sudo apt-get install pandoc"
fi

# 检查 curl
if command_exists curl; then
    log_success "curl 已安装"
else
    log_warning "curl 未安装"
    MISSING_TOOLS+=("curl")
fi

# 检查 wget
if command_exists wget; then
    log_success "wget 已安装"
else
    log_warning "wget 未安装 (可选)"
fi

# 检查 jq (用于 JSON 处理)
if command_exists jq; then
    log_success "jq 已安装"
else
    log_warning "jq 未安装 (用于 JSON 处理，可选)"
fi

# 如果有缺失的工具，询问是否安装
if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo ""
    read -p "是否安装缺失的系统工具? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command_exists apt-get; then
            log_info "正在安装系统工具..."
            sudo apt-get update && sudo apt-get install -y "${MISSING_TOOLS[@]}" 2>&1 | tee -a "$LOG_FILE"
            log_success "系统工具安装完成"
        else
            log_warning "未检测到 apt-get，请手动安装缺失的工具"
        fi
    fi
fi

# 11. 检查环境变量配置
print_header "步骤 11: 检查环境变量配置"

ENV_VARS_MISSING=()

# 检查常见的 API 密钥环境变量
check_env_var() {
    local var_name=$1
    local description=$2
    if [ -z "${!var_name}" ]; then
        ENV_VARS_MISSING+=("$var_name ($description)")
        log_warning "$var_name 未设置 ($description)"
    else
        log_success "$var_name 已设置"
    fi
}

# 检查常见的 API 密钥
check_env_var "OPENAI_API_KEY" "OpenAI API 密钥"
check_env_var "ANTHROPIC_API_KEY" "Anthropic API 密钥"
check_env_var "GEMINI_API_KEY" "Google Gemini API 密钥"

# 检查配置文件
CONFIG_FILE="$CONFIG_DIR/opencode.json"
PROJECT_CONFIG_FILE="$OPencode_DIR/opencode.json"

if [ -f "$CONFIG_FILE" ]; then
    log_success "全局配置文件存在: $CONFIG_FILE"
elif [ -f "$PROJECT_CONFIG_FILE" ]; then
    log_success "项目配置文件存在: $PROJECT_CONFIG_FILE"
else
    log_warning "未找到配置文件，可能需要手动创建"
fi

if [ ${#ENV_VARS_MISSING[@]} -gt 0 ]; then
    echo ""
    log_info "缺失的环境变量:"
    for var in "${ENV_VARS_MISSING[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "可以通过以下方式设置:"
    echo "  1. 在 $SHELL_RC 中添加: export VAR_NAME='your_key'"
    echo "  2. 创建配置文件: $CONFIG_FILE"
fi

# 12. 验证安装
print_header "步骤 12: 验证安装"

cd "$OPencode_DIR"

# 检查 bun 命令是否可用
if command_exists bun; then
    BUN_VERSION=$(bun --version)
    log_success "Bun 运行时正常: $BUN_VERSION"
    
    # 尝试运行 bun dev --help 来验证项目配置
    if bun dev --help &> /dev/null; then
        log_success "OpenCode 项目配置验证成功"
    else
        log_warning "无法验证 OpenCode 项目配置，可能需要先运行 'bun dev'"
    fi
else
    log_error "Bun 未正确安装"
    exit 1
fi

# 完成
print_header "环境配置完成！"

echo ""
log_success "所有配置步骤已完成"
echo ""
echo "下一步操作："
echo "  1. 如果添加了全局别名，请运行: ${CYAN}source $SHELL_RC${NC}"
echo "  2. 配置 API 密钥（设置环境变量或编辑配置文件）"
echo "  3. 开始使用 OpenCode: ${CYAN}bun dev${NC} 或 ${CYAN}opencode-dev${NC}"
echo ""
echo "配置文件位置:"
echo "  - 全局配置: ${CYAN}$CONFIG_DIR/opencode.json${NC}"
echo "  - 项目配置: ${CYAN}$PROJECT_CONFIG_FILE${NC}"
echo "  - Skills 配置: ${CYAN}$SKILL_CONFIG_DIR${NC}"
echo ""
echo "日志文件: ${CYAN}$LOG_FILE${NC}"
echo ""
echo "详细使用说明请查看项目文档"
echo ""

log "环境配置脚本执行完成"

