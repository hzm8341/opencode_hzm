#!/bin/bash
# 传输和测试脚本 - 需要手动输入密码
# 使用方法: ./transfer_and_test.sh

set -e

REMOTE_HOST="hzm@10.200.1.59"
REMOTE_DIR="/tmp/opencode_test"
LOCAL_FILE="packages/opencode/dist/opencode-linux-x64/bin/opencode"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OpenCode 可执行文件远程测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查本地文件
if [ ! -f "$LOCAL_FILE" ]; then
    echo "错误: 未找到可执行文件: $LOCAL_FILE"
    echo "请先运行构建: bun packages/opencode/script/build_temp.ts --single"
    exit 1
fi

echo -e "${GREEN}✓ 找到可执行文件: $LOCAL_FILE${NC}"
ls -lh "$LOCAL_FILE"
echo ""

# 传输文件
echo -e "${YELLOW}正在传输文件到远程系统...${NC}"
echo "远程主机: $REMOTE_HOST"
echo "远程目录: $REMOTE_DIR"
echo ""
echo "提示: 系统将要求输入 SSH 密码（密码: hzm）"
echo ""

scp "$LOCAL_FILE" "$REMOTE_HOST:$REMOTE_DIR/opencode" || {
    echo "错误: 文件传输失败"
    exit 1
}

echo -e "${GREEN}✓ 文件传输成功${NC}"
echo ""

# 在远程系统上测试
echo -e "${BLUE}在远程系统上执行测试...${NC}"
echo ""

ssh "$REMOTE_HOST" << 'REMOTE_TEST'
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
    
    echo "=== 测试完成 ==="
REMOTE_TEST

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}测试完成${NC}"
echo -e "${GREEN}========================================${NC}"

