#!/bin/bash
# OpenCode 构建和测试完整流程脚本
# 用途: 在本地构建，然后传输到远程系统测试
# 日期: 2026-01-26

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "OpenCode 可执行文件构建和测试流程"
echo "=========================================="

# 步骤 1: 检查环境
echo ""
echo -e "${BLUE}步骤 1: 检查构建环境${NC}"
echo "----------------------------------------"

if ! command -v bun >/dev/null 2>&1; then
    echo -e "${RED}错误: Bun 未安装${NC}"
    echo "请先安装 Bun: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo -e "${GREEN}✓ Bun 已安装: $(bun --version)${NC}"

# 检查项目目录
if [ ! -f "packages/opencode/script/build.ts" ]; then
    echo -e "${RED}错误: 未找到构建脚本${NC}"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

echo -e "${GREEN}✓ 项目结构正确${NC}"

# 步骤 2: 构建可执行文件
echo ""
echo -e "${BLUE}步骤 2: 构建 Linux x64 可执行文件${NC}"
echo "----------------------------------------"

cd "$(dirname "$0")/.." || exit 1

echo "运行构建命令: bun run packages/opencode/script/build.ts --single"
bun run packages/opencode/script/build.ts --single

# 检查构建结果
BUILD_OUTPUT="packages/opencode/dist/opencode-linux-x64/bin/opencode"
if [ ! -f "$BUILD_OUTPUT" ]; then
    echo -e "${RED}错误: 构建失败，未找到输出文件${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 构建成功${NC}"
echo "输出文件: $BUILD_OUTPUT"
ls -lh "$BUILD_OUTPUT"

# 步骤 3: 本地基本测试
echo ""
echo -e "${BLUE}步骤 3: 本地基本测试${NC}"
echo "----------------------------------------"

echo "测试 --version:"
"$BUILD_OUTPUT" --version || {
    echo -e "${RED}✗ --version 测试失败${NC}"
    exit 1
}

echo ""
echo "测试 --help (前10行):"
"$BUILD_OUTPUT" --help | head -10 || {
    echo -e "${RED}✗ --help 测试失败${NC}"
    exit 1
}

echo -e "${GREEN}✓ 本地测试通过${NC}"

# 步骤 4: 准备远程测试
echo ""
echo -e "${BLUE}步骤 4: 准备远程测试${NC}"
echo "----------------------------------------"

REMOTE_HOST="hzm@10.200.1.59"
REMOTE_DIR="/tmp/opencode_test"

echo "远程主机: $REMOTE_HOST"
echo "远程目录: $REMOTE_DIR"

# 检查 SSH 连接
echo ""
echo "检查 SSH 连接..."
if ssh -o ConnectTimeout=5 "$REMOTE_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH 连接正常${NC}"
else
    echo -e "${YELLOW}⚠ SSH 连接需要密码，将在传输时提示${NC}"
fi

# 步骤 5: 传输到远程系统
echo ""
echo -e "${BLUE}步骤 5: 传输到远程系统${NC}"
echo "----------------------------------------"

# 创建远程目录
ssh "$REMOTE_HOST" "mkdir -p $REMOTE_DIR" || {
    echo -e "${RED}错误: 无法创建远程目录${NC}"
    echo "请检查 SSH 连接和权限"
    exit 1
}

# 传输文件
echo "传输可执行文件..."
scp "$BUILD_OUTPUT" "$REMOTE_HOST:$REMOTE_DIR/opencode" || {
    echo -e "${RED}错误: 文件传输失败${NC}"
    exit 1
}

# 设置执行权限
ssh "$REMOTE_HOST" "chmod +x $REMOTE_DIR/opencode"

echo -e "${GREEN}✓ 文件传输成功${NC}"

# 步骤 6: 远程系统测试
echo ""
echo -e "${BLUE}步骤 6: 远程系统测试${NC}"
echo "----------------------------------------"

# 检查远程系统信息
echo "远程系统信息:"
ssh "$REMOTE_HOST" << 'REMOTE_SCRIPT'
    echo "系统: $(uname -a)"
    echo "发行版: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
    echo "架构: $(uname -m)"
    echo ""
    echo "运行时检查:"
    echo "  Bun: $(which bun || echo '未安装')"
    echo "  Node.js: $(which node || echo '未安装')"
    echo ""
REMOTE_SCRIPT

# 测试可执行文件
echo "测试可执行文件:"
echo ""
echo "1. 文件信息:"
ssh "$REMOTE_HOST" "cd $REMOTE_DIR && ls -lh opencode && file opencode"

echo ""
echo "2. 依赖检查:"
ssh "$REMOTE_HOST" "cd $REMOTE_DIR && ldd opencode 2>&1 || echo '无法检查依赖（可能是静态链接或自包含）'"

echo ""
echo "3. 运行 --version:"
ssh "$REMOTE_HOST" "$REMOTE_DIR/opencode --version" || {
    echo -e "${RED}✗ --version 命令失败${NC}"
}

echo ""
echo "4. 运行 --help (前15行):"
ssh "$REMOTE_HOST" "$REMOTE_DIR/opencode --help" | head -15 || {
    echo -e "${RED}✗ --help 命令失败${NC}"
}

# 步骤 7: 总结
echo ""
echo "=========================================="
echo -e "${GREEN}构建和测试完成${NC}"
echo "=========================================="
echo ""
echo "构建文件位置: $BUILD_OUTPUT"
echo "远程测试位置: $REMOTE_HOST:$REMOTE_DIR/opencode"
echo ""
echo "如需清理远程文件，运行:"
echo "  ssh $REMOTE_HOST 'rm -rf $REMOTE_DIR'"
echo ""

