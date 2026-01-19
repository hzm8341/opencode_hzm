#!/bin/bash
# OpenCode 统一入口快速测试脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/media/hzm/data_disk/opencode"
OPENCODE_DIR="$PROJECT_ROOT/packages/opencode"

# 测试目录
TEST_DIR="/tmp/opencode-test"
PROJECT_DIR="$TEST_DIR/test-project"

# 查找 bun 命令
if command -v bun &> /dev/null; then
    BUN_CMD="bun"
elif [ -f "$HOME/.bun/bin/bun" ]; then
    BUN_CMD="$HOME/.bun/bin/bun"
    export PATH="$HOME/.bun/bin:$PATH"
else
    echo -e "${RED}错误: 未找到 bun 命令${NC}"
    echo "请安装 bun 或将其添加到 PATH"
    exit 1
fi

# 检查是否使用开发模式
USE_DEV_MODE=true

# 确定 opencode 命令
if [ "$USE_DEV_MODE" = true ]; then
    # 使用开发模式（直接运行 TypeScript）
    OPENCODE_CMD="cd $OPENCODE_DIR && $BUN_CMD run --conditions=browser ./src/index.ts"
    echo -e "${BLUE}使用开发模式运行 OpenCode (使用 $BUN_CMD)${NC}"
else
    # 使用已安装的 opencode
    OPENCODE_CMD="opencode"
    echo -e "${BLUE}使用已安装的 OpenCode${NC}"
fi

# 创建测试目录
echo -e "${YELLOW}=== 准备测试环境 ===${NC}"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 创建测试项目文件
cat > package.json << 'EOF'
{
  "name": "test-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF

echo -e "${GREEN}✅ 测试环境准备完成${NC}"
echo ""

# 测试 1: 简单需求
echo -e "${YELLOW}=== 测试 1: 简单需求（不使用 Manus）===${NC}"
TEST1_OUTPUT=$(eval "$OPENCODE_CMD unified --dir \"$PROJECT_DIR\" --requirement \"帮我运行这个项目\"" 2>&1 | tee /tmp/test1.log)
TEST1_EXIT_CODE=${PIPESTATUS[0]}

if [ $TEST1_EXIT_CODE -eq 0 ] && ! echo "$TEST1_OUTPUT" | grep -q "error\|Error\|ERROR"; then
    echo -e "${GREEN}✅ 测试 1 通过${NC}"
    
    # 检查是否创建了规划文件（应该没有）
    if [ ! -f task_plan.md ] && [ ! -f findings.md ] && [ ! -f progress.md ]; then
        echo -e "${GREEN}✅ 正确：未创建规划文件${NC}"
    else
        echo -e "${RED}❌ 错误：不应该创建规划文件${NC}"
    fi
else
    echo -e "${RED}❌ 测试 1 失败${NC}"
fi
echo ""

# 清理（可选）
# rm -f task_plan.md findings.md progress.md

# 测试 2: 复杂需求（自动使用 Manus）
echo -e "${YELLOW}=== 测试 2: 复杂需求（自动使用 Manus）===${NC}"
TEST2_OUTPUT=$(eval "$OPENCODE_CMD unified --dir \"$PROJECT_DIR\" --requirement \"实现一个用户登录功能，包括前端和后端，数据库设计，API 接口，单元测试\"" 2>&1 | tee /tmp/test2.log)
TEST2_EXIT_CODE=${PIPESTATUS[0]}

if [ $TEST2_EXIT_CODE -eq 0 ] && ! echo "$TEST2_OUTPUT" | grep -q "error\|Error\|ERROR"; then
    echo -e "${GREEN}✅ 测试 2 通过${NC}"
    
    # 检查规划文件
    if [ -f task_plan.md ]; then
        echo -e "${GREEN}✅ task_plan.md 已创建${NC}"
        echo "--- task_plan.md 前 20 行 ---"
        head -20 task_plan.md
    else
        echo -e "${RED}❌ task_plan.md 未创建${NC}"
    fi
    
    if [ -f findings.md ]; then
        echo -e "${GREEN}✅ findings.md 已创建${NC}"
    else
        echo -e "${RED}❌ findings.md 未创建${NC}"
    fi
    
    if [ -f progress.md ]; then
        echo -e "${GREEN}✅ progress.md 已创建${NC}"
    else
        echo -e "${RED}❌ progress.md 未创建${NC}"
    fi
else
    echo -e "${RED}❌ 测试 2 失败${NC}"
fi
echo ""

# 测试 3: 强制使用 Manus
echo -e "${YELLOW}=== 测试 3: 强制使用 Manus 模式 ===${NC}"
# 先清理之前的文件
rm -f task_plan.md findings.md progress.md

TEST3_OUTPUT=$(eval "$OPENCODE_CMD unified --dir \"$PROJECT_DIR\" --requirement \"测试需求\" --useManus" 2>&1 | tee /tmp/test3.log)
TEST3_EXIT_CODE=${PIPESTATUS[0]}

if [ $TEST3_EXIT_CODE -eq 0 ] && ! echo "$TEST3_OUTPUT" | grep -q "error\|Error\|ERROR"; then
    echo -e "${GREEN}✅ 测试 3 通过${NC}"
    
    # 检查规划文件
    if [ -f task_plan.md ] && [ -f findings.md ] && [ -f progress.md ]; then
        echo -e "${GREEN}✅ 所有规划文件已创建${NC}"
    else
        echo -e "${RED}❌ 部分规划文件未创建${NC}"
    fi
else
    echo -e "${RED}❌ 测试 3 失败${NC}"
fi
echo ""

# 测试 4: 项目检测
echo -e "${YELLOW}=== 测试 4: 项目检测 ===${NC}"
if eval "$OPENCODE_CMD unified --dir \"$PROJECT_DIR\" --requirement \"检测项目类型\"" 2>&1 | tee /tmp/test4.log | grep -i "node\|express" > /dev/null; then
    echo -e "${GREEN}✅ 测试 4 通过：项目检测正常${NC}"
else
    echo -e "${YELLOW}⚠️  测试 4：项目检测结果未在输出中显示（可能需要查看日志）${NC}"
fi
echo ""

# 测试 5: 验证规划文件内容
echo -e "${YELLOW}=== 测试 5: 验证规划文件内容 ===${NC}"
if [ -f task_plan.md ]; then
    if grep -q "# Task Plan" task_plan.md && \
       grep -q "## Phases" task_plan.md && \
       grep -q "Phase 1" task_plan.md; then
        echo -e "${GREEN}✅ task_plan.md 内容格式正确${NC}"
    else
        echo -e "${RED}❌ task_plan.md 内容格式错误${NC}"
    fi
    
    if grep -q "## Errors" task_plan.md; then
        echo -e "${GREEN}✅ task_plan.md 包含错误记录部分${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  task_plan.md 不存在，跳过内容验证${NC}"
fi
echo ""

# 总结
echo -e "${YELLOW}=== 测试总结 ===${NC}"
echo "测试目录: $PROJECT_DIR"
echo "测试日志: /tmp/test*.log"
echo ""
echo -e "${GREEN}测试完成！${NC}"
echo ""
echo "查看详细日志："
echo "  cat /tmp/test1.log  # 测试 1 日志"
echo "  cat /tmp/test2.log  # 测试 2 日志"
echo "  cat /tmp/test3.log  # 测试 3 日志"
echo "  cat /tmp/test4.log  # 测试 4 日志"
echo ""
echo "查看规划文件："
echo "  cat $PROJECT_DIR/task_plan.md"
echo "  cat $PROJECT_DIR/findings.md"
echo "  cat $PROJECT_DIR/progress.md"

