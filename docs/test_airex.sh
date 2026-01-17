#!/bin/bash
# 在 airex@10.200.1.28 上测试 OpenCode 可执行文件
# 密码: 0000

set -e

REMOTE_HOST="airex@10.200.1.28"
REMOTE_DIR="/tmp/opencode_test"
LOCAL_FILE="packages/opencode/dist/opencode-linux-x64/bin/opencode"
PASSWORD="0000"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OpenCode 可执行文件测试 - airex@10.200.1.28${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查本地文件
if [ ! -f "$LOCAL_FILE" ]; then
    echo -e "${RED}错误: 未找到可执行文件: $LOCAL_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 找到可执行文件: $LOCAL_FILE${NC}"
ls -lh "$LOCAL_FILE"
echo ""

# 传输文件
echo -e "${YELLOW}正在传输文件到远程系统...${NC}"
echo "远程主机: $REMOTE_HOST"
echo ""

sshpass -p "$PASSWORD" scp "$LOCAL_FILE" "$REMOTE_HOST:$REMOTE_DIR/opencode" || {
    echo -e "${RED}错误: 文件传输失败${NC}"
    echo "请检查:"
    echo "1. 网络连接"
    echo "2. SSH 密码是否正确"
    echo "3. 远程主机是否可访问"
    exit 1
}

echo -e "${GREEN}✓ 文件传输成功${NC}"
echo ""

# 在远程系统上测试
echo -e "${BLUE}在远程系统上执行测试...${NC}"
echo ""

sshpass -p "$PASSWORD" ssh "$REMOTE_HOST" << 'REMOTE_TEST'
    cd /tmp/opencode_test
    chmod +x opencode
    
    echo "=== 远程系统信息 ==="
    uname -a
    cat /etc/os-release | head -5
    echo ""
    
    echo "=== 运行时检查 ==="
    which bun || echo "Bun: 未安装 (预期)"
    which node || echo "Node.js: 未安装 (预期)"
    echo ""
    
    echo "=== 可执行文件信息 ==="
    ls -lh opencode
    file opencode
    echo ""
    
    echo "=== 依赖检查 ==="
    ldd opencode 2>&1 || echo "无法检查依赖"
    echo ""
    
    echo "=== 测试 --version ==="
    ./opencode --version
    echo ""
    
    echo "=== 测试 --help (前15行) ==="
    ./opencode --help | head -15
    echo ""
    
    echo "=== 验证独立运行能力 ==="
    echo "当前 PATH: $PATH"
    ./opencode --version 2>&1
    if [ $? -eq 0 ]; then
        echo "✓ 可执行文件可以独立运行（不依赖 Bun/Node.js）"
    else
        echo "✗ 可执行文件运行失败"
    fi
    echo ""
    
    echo "=== 测试完成 ==="
REMOTE_TEST

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}测试完成${NC}"
echo -e "${GREEN}========================================${NC}"

