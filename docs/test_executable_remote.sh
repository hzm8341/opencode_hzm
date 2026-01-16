#!/bin/bash
# OpenCode 可执行文件远程测试脚本
# 用途: 在远程 Linux 系统上测试构建的可执行文件
# 日期: 2026-01-26

set -e

REMOTE_HOST="hzm@10.200.1.59"
REMOTE_DIR="/tmp/opencode_test"
EXECUTABLE_NAME="opencode"

echo "=========================================="
echo "OpenCode 可执行文件远程测试"
echo "=========================================="

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查本地可执行文件
LOCAL_EXECUTABLE=""
if [ -f "packages/opencode/dist/opencode-linux-x64/bin/opencode" ]; then
    LOCAL_EXECUTABLE="packages/opencode/dist/opencode-linux-x64/bin/opencode"
elif [ -f "dist/opencode-linux-x64/bin/opencode" ]; then
    LOCAL_EXECUTABLE="dist/opencode-linux-x64/bin/opencode"
else
    echo -e "${RED}错误: 未找到构建的可执行文件${NC}"
    echo "请先运行: bun run packages/opencode/script/build.ts --single"
    exit 1
fi

echo -e "${GREEN}✓ 找到可执行文件: ${LOCAL_EXECUTABLE}${NC}"

# 检查文件信息
echo ""
echo "本地可执行文件信息:"
ls -lh "$LOCAL_EXECUTABLE"
file "$LOCAL_EXECUTABLE"

# 检查依赖
echo ""
echo "检查依赖库:"
if command -v ldd >/dev/null 2>&1; then
    ldd "$LOCAL_EXECUTABLE" || echo "不是动态链接的可执行文件"
else
    echo "ldd 命令不可用，跳过依赖检查"
fi

# 准备传输
echo ""
echo -e "${YELLOW}准备传输文件到远程系统...${NC}"
echo "远程主机: $REMOTE_HOST"
echo "远程目录: $REMOTE_DIR"

# 创建远程目录
ssh "$REMOTE_HOST" "mkdir -p $REMOTE_DIR" || {
    echo -e "${RED}错误: 无法连接到远程主机${NC}"
    echo "请确保:"
    echo "1. SSH 密钥已配置，或"
    echo "2. 可以手动输入密码"
    exit 1
}

# 传输文件
echo ""
echo -e "${YELLOW}传输可执行文件...${NC}"
scp "$LOCAL_EXECUTABLE" "$REMOTE_HOST:$REMOTE_DIR/$EXECUTABLE_NAME" || {
    echo -e "${RED}错误: 文件传输失败${NC}"
    exit 1
}

# 设置执行权限
ssh "$REMOTE_HOST" "chmod +x $REMOTE_DIR/$EXECUTABLE_NAME"

echo -e "${GREEN}✓ 文件传输成功${NC}"

# 在远程系统上测试
echo ""
echo "=========================================="
echo "在远程系统上执行测试"
echo "=========================================="

# 测试 1: 检查系统信息
echo ""
echo "测试 1: 检查远程系统信息"
ssh "$REMOTE_HOST" << 'REMOTE_SCRIPT'
    echo "系统信息:"
    uname -a
    echo ""
    echo "发行版信息:"
    cat /etc/os-release | head -5
    echo ""
    echo "Bun 是否安装:"
    which bun || echo "Bun 未安装 (这是预期的)"
    echo ""
    echo "Node.js 是否安装:"
    which node || echo "Node.js 未安装 (这是预期的)"
REMOTE_SCRIPT

# 测试 2: 检查可执行文件
echo ""
echo "测试 2: 检查可执行文件"
ssh "$REMOTE_HOST" << 'REMOTE_SCRIPT'
    cd /tmp/opencode_test
    echo "文件信息:"
    ls -lh opencode
    file opencode
    echo ""
    echo "依赖库:"
    ldd opencode 2>&1 || echo "无法检查依赖（可能是静态链接）"
REMOTE_SCRIPT

# 测试 3: 运行基本命令
echo ""
echo "测试 3: 运行 --version 命令"
ssh "$REMOTE_HOST" "$REMOTE_DIR/$EXECUTABLE_NAME --version" || {
    echo -e "${RED}✗ --version 命令失败${NC}"
}

# 测试 4: 运行 --help 命令
echo ""
echo "测试 4: 运行 --help 命令"
ssh "$REMOTE_HOST" "$REMOTE_DIR/$EXECUTABLE_NAME --help" | head -20 || {
    echo -e "${RED}✗ --help 命令失败${NC}"
}

# 测试 5: 检查是否真的独立运行（不依赖 Bun）
echo ""
echo "测试 5: 验证独立运行能力"
ssh "$REMOTE_HOST" << 'REMOTE_SCRIPT'
    cd /tmp/opencode_test
    echo "测试环境:"
    echo "PATH: $PATH"
    echo ""
    echo "尝试直接运行:"
    ./opencode --version 2>&1
    if [ $? -eq 0 ]; then
        echo "✓ 可执行文件可以独立运行"
    else
        echo "✗ 可执行文件运行失败"
    fi
REMOTE_SCRIPT

# 清理（可选）
echo ""
read -p "是否清理远程测试文件? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh "$REMOTE_HOST" "rm -rf $REMOTE_DIR"
    echo -e "${GREEN}✓ 远程测试文件已清理${NC}"
else
    echo "远程测试文件保留在: $REMOTE_HOST:$REMOTE_DIR"
fi

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="

