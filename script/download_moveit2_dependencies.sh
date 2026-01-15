#!/bin/bash
# MoveIt2 依赖包下载脚本 / MoveIt2 Dependency Download Script
# 
# 此脚本用于手动下载 MoveIt2 构建所需的缺失依赖包
# This script is used to manually download missing dependencies required for MoveIt2 build
#
# Version: v1.0
# Date: 2026-01-07

set -e

# 目标目录 / Target directory
TARGET_DIR="/media/hzm/Data/github/ws_moveit2/src"

# 颜色输出 / Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "============================================================"
echo "MoveIt2 依赖包下载脚本 / MoveIt2 Dependency Download Script"
echo "============================================================"
echo ""

# 检查目标目录 / Check target directory
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}错误: 目标目录不存在 / Error: Target directory does not exist: $TARGET_DIR${NC}"
    exit 1
fi

cd "$TARGET_DIR" || exit 1
echo -e "${GREEN}目标目录 / Target directory: $TARGET_DIR${NC}"
echo ""

# 下载函数 / Download function
download_repo() {
    local name=$1
    local url=$2
    local branch=$3
    
    echo -e "${YELLOW}下载 / Downloading: $name${NC}"
    if [ -d "$name" ]; then
        echo -e "${YELLOW}⚠️  $name 已存在，跳过 / $name already exists, skipping${NC}"
        return 0
    fi
    
    # 尝试使用指定分支，如果失败则使用默认分支 / Try specified branch, fallback to default
    if [ -n "$branch" ]; then
        if git clone "$url" -b "$branch" "$name" 2>/dev/null; then
            echo -e "${GREEN}✅ $name 下载完成 (分支: $branch) / $name downloaded (branch: $branch)${NC}"
            return 0
        fi
    fi
    
    # 尝试默认分支 / Try default branch
    if git clone "$url" "$name" 2>/dev/null; then
        echo -e "${GREEN}✅ $name 下载完成 / $name downloaded${NC}"
        return 0
    else
        echo -e "${RED}❌ $name 下载失败 / $name download failed${NC}"
        return 1
    fi
}

# 1. 下载 rsl (ROS Support Library) - 现在由 PickNik Robotics 维护
download_repo "rsl" "https://github.com/PickNikRobotics/RSL.git" "main"
echo ""

# 2. 下载 cpp_polyfills (包含 tcb-span 和 tl-expected)
download_repo "cpp_polyfills" "https://github.com/PickNikRobotics/cpp_polyfills.git" "main"
echo ""

# 4. 检查 generate_parameter_library (应该已经存在)
download_repo "generate_parameter_library" "https://github.com/PickNikRobotics/generate_parameter_library.git" ""
echo ""

echo "============================================================"
echo -e "${GREEN}所有依赖包下载完成！/ All dependencies downloaded!${NC}"
echo "============================================================"
echo ""
echo "接下来可以运行构建命令 / Next, you can run the build command:"
echo ""
echo "cd /media/hzm/Data/github/ws_moveit2"
echo "source /opt/ros/humble/setup.bash"
echo "source install/setup.bash"
echo "colcon build --packages-select rsl tcb-span tl-expected parameter_traits generate_parameter_library_py generate_parameter_library --cmake-args -DCMAKE_BUILD_TYPE=Release"
echo ""
echo "或者构建所有包 / Or build all packages:"
echo "colcon build --cmake-args -DCMAKE_BUILD_TYPE=Release"
echo ""
