#!/bin/bash

# OpenCode 环境配置脚本
# 用于自动配置 OpenCode 开发环境

set -e

echo "=========================================="
echo "OpenCode 环境配置脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPencode_DIR="$SCRIPT_DIR"

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

echo "检测到 Shell: $SHELL_NAME"
echo "配置文件: $SHELL_RC"
echo ""

# 1. 检查并安装 Bun
echo "=========================================="
echo "步骤 1: 检查 Bun 运行时"
echo "=========================================="

if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun --version)
    echo -e "${GREEN}✓ Bun 已安装: $BUN_VERSION${NC}"
    
    # 检查版本
    BUN_MAJOR=$(echo $BUN_VERSION | cut -d. -f1)
    BUN_MINOR=$(echo $BUN_VERSION | cut -d. -f2)
    if [ "$BUN_MAJOR" -lt 1 ] || ([ "$BUN_MAJOR" -eq 1 ] && [ "$BUN_MINOR" -lt 3 ]); then
        echo -e "${YELLOW}⚠ Bun 版本过低，需要 1.3+，当前版本: $BUN_VERSION${NC}"
        read -p "是否更新 Bun? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            curl -fsSL https://bun.sh/install | bash
            export PATH="$HOME/.bun/bin:$PATH"
        fi
    fi
else
    echo -e "${YELLOW}⚠ Bun 未安装${NC}"
    read -p "是否安装 Bun? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        curl -fsSL https://bun.sh/install | bash
        export PATH="$HOME/.bun/bin:$PATH"
        echo -e "${GREEN}✓ Bun 安装完成${NC}"
    else
        echo -e "${RED}✗ 未安装 Bun，无法继续${NC}"
        exit 1
    fi
fi

# 2. 检查 Node.js (可选)
echo ""
echo "=========================================="
echo "步骤 2: 检查 Node.js (可选)"
echo "=========================================="

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js 已安装: $NODE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Node.js 未安装 (可选，某些工具可能需要)${NC}"
fi

# 3. 检查 Python 3
echo ""
echo "=========================================="
echo "步骤 3: 检查 Python 3"
echo "=========================================="

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python 3 已安装: $PYTHON_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Python 3 未安装 (某些 Skills 需要)${NC}"
    echo "可以使用以下命令安装:"
    echo "  Ubuntu/Debian: sudo apt-get install python3 python3-pip"
    echo "  macOS: brew install python3"
fi

# 4. 检查 Git
echo ""
echo "=========================================="
echo "步骤 4: 检查 Git"
echo "=========================================="

if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✓ Git 已安装: $GIT_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Git 未安装 (用于版本控制功能)${NC}"
fi

# 5. 安装项目依赖
echo ""
echo "=========================================="
echo "步骤 5: 安装项目依赖"
echo "=========================================="

cd "$OPencode_DIR"

if [ -f "package.json" ]; then
    echo "正在安装项目依赖..."
    bun install
    echo -e "${GREEN}✓ 项目依赖安装完成${NC}"
else
    echo -e "${RED}✗ 未找到 package.json${NC}"
    exit 1
fi

# 6. 配置全局命令别名
echo ""
echo "=========================================="
echo "步骤 6: 配置全局命令别名"
echo "=========================================="

OPencode_ALIAS="function opencode-dev() {
    cd $OPencode_DIR && bun dev \"\$@\"
}"

if grep -q "opencode-dev" "$SHELL_RC" 2>/dev/null; then
    echo -e "${YELLOW}⚠ opencode-dev 别名已存在于 $SHELL_RC${NC}"
    read -p "是否更新别名? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 删除旧的别名定义
        sed -i '/function opencode-dev/,/^}/d' "$SHELL_RC"
        echo "" >> "$SHELL_RC"
        echo "# OpenCode 全局命令配置" >> "$SHELL_RC"
        echo "$OPencode_ALIAS" >> "$SHELL_RC"
        echo -e "${GREEN}✓ 别名已更新${NC}"
    fi
else
    read -p "是否添加 opencode-dev 全局命令别名? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "" >> "$SHELL_RC"
        echo "# OpenCode 全局命令配置" >> "$SHELL_RC"
        echo "$OPencode_ALIAS" >> "$SHELL_RC"
        echo -e "${GREEN}✓ 别名已添加到 $SHELL_RC${NC}"
        echo -e "${YELLOW}⚠ 请运行 'source $SHELL_RC' 或重新打开终端使配置生效${NC}"
    fi
fi

# 7. 检查并创建配置文件目录
echo ""
echo "=========================================="
echo "步骤 7: 检查配置文件目录"
echo "=========================================="

CONFIG_DIR="$HOME/.config/opencode"
if [ ! -d "$CONFIG_DIR" ]; then
    mkdir -p "$CONFIG_DIR"
    echo -e "${GREEN}✓ 创建配置目录: $CONFIG_DIR${NC}"
else
    echo -e "${GREEN}✓ 配置目录已存在: $CONFIG_DIR${NC}"
fi

# 8. 检查 Skills 目录
echo ""
echo "=========================================="
echo "步骤 8: 检查 Skills 目录"
echo "=========================================="

SKILLS_DIR="$OPencode_DIR/skills"
if [ -d "$SKILLS_DIR" ]; then
    SKILL_COUNT=$(find "$SKILLS_DIR" -maxdepth 1 -type d | wc -l)
    SKILL_COUNT=$((SKILL_COUNT - 1))  # 减去自身
    echo -e "${GREEN}✓ Skills 目录存在，包含 $SKILL_COUNT 个技能${NC}"
else
    echo -e "${YELLOW}⚠ Skills 目录不存在${NC}"
fi

# 9. 安装 Skills 依赖 (可选)
echo ""
echo "=========================================="
echo "步骤 9: 安装 Skills 依赖 (可选)"
echo "=========================================="

read -p "是否安装 Skills 的 Python 依赖? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v pip3 &> /dev/null; then
        echo "正在安装 Python 依赖..."
        
        # PDF skill 依赖
        pip3 install --user pypdf pdfplumber reportlab defusedxml 2>/dev/null || echo "部分 PDF 依赖安装失败"
        
        # DOCX skill 依赖
        pip3 install --user defusedxml 2>/dev/null || echo "部分 DOCX 依赖安装失败"
        
        # PPTX skill 依赖
        pip3 install --user "markitdown[pptx]" defusedxml 2>/dev/null || echo "部分 PPTX 依赖安装失败"
        
        # XLSX skill 依赖
        pip3 install --user openpyxl pandas 2>/dev/null || echo "部分 XLSX 依赖安装失败"
        
        # Webapp testing 依赖
        pip3 install --user playwright 2>/dev/null || echo "Playwright 安装失败"
        
        # Slack GIF creator 依赖
        pip3 install --user pillow imageio numpy 2>/dev/null || echo "部分 GIF 依赖安装失败"
        
        echo -e "${GREEN}✓ Python 依赖安装完成${NC}"
    else
        echo -e "${RED}✗ pip3 未找到，无法安装 Python 依赖${NC}"
    fi
fi

# 10. 检查系统工具
echo ""
echo "=========================================="
echo "步骤 10: 检查系统工具"
echo "=========================================="

# 检查 LibreOffice (用于 PDF/DOCX 转换)
if command -v soffice &> /dev/null; then
    echo -e "${GREEN}✓ LibreOffice 已安装${NC}"
else
    echo -e "${YELLOW}⚠ LibreOffice 未安装 (用于 PDF/DOCX 转换)${NC}"
    echo "可以使用以下命令安装:"
    echo "  Ubuntu/Debian: sudo apt-get install libreoffice"
    echo "  macOS: brew install --cask libreoffice"
fi

# 检查 Poppler (用于 PDF 工具)
if command -v pdftoppm &> /dev/null; then
    echo -e "${GREEN}✓ Poppler 已安装${NC}"
else
    echo -e "${YELLOW}⚠ Poppler 未安装 (用于 PDF 工具)${NC}"
    echo "可以使用以下命令安装:"
    echo "  Ubuntu/Debian: sudo apt-get install poppler-utils"
    echo "  macOS: brew install poppler"
fi

# 检查 Pandoc (用于文档转换)
if command -v pandoc &> /dev/null; then
    echo -e "${GREEN}✓ Pandoc 已安装${NC}"
else
    echo -e "${YELLOW}⚠ Pandoc 未安装 (用于文档转换)${NC}"
    echo "可以使用以下命令安装:"
    echo "  Ubuntu/Debian: sudo apt-get install pandoc"
    echo "  macOS: brew install pandoc"
fi

# 11. 验证安装
echo ""
echo "=========================================="
echo "步骤 11: 验证安装"
echo "=========================================="

cd "$OPencode_DIR"

if bun dev --version &> /dev/null; then
    VERSION=$(bun dev --version)
    echo -e "${GREEN}✓ OpenCode 安装验证成功${NC}"
    echo "  版本: $VERSION"
else
    echo -e "${RED}✗ OpenCode 验证失败${NC}"
    exit 1
fi

# 完成
echo ""
echo "=========================================="
echo "环境配置完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 如果添加了全局别名，请运行: source $SHELL_RC"
echo "2. 配置 API 密钥（设置环境变量或编辑配置文件）"
echo "3. 开始使用 OpenCode: bun dev 或 opencode-dev"
echo ""
echo "配置文件位置:"
echo "  - 全局配置: $HOME/.config/opencode/opencode.json"
echo "  - 项目配置: $OPencode_DIR/opencode.json"
echo ""
echo "详细使用说明请查看: $OPencode_DIR/USAGE_GUIDE.md"
echo ""

