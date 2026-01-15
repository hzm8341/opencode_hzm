# MoveIt2 自动配置脚本使用说明 / MoveIt2 Auto Configuration Script Usage

## 简介 / Introduction

此脚本用于自动配置 MoveIt2 项目。如果遇到问题，脚本会使用 opencode 智能体自动修复并重试。

This script is used to automatically configure the MoveIt2 project. If problems are encountered, the script will use the opencode agent to automatically fix and retry.

**版本 / Version**: v1.0  
**日期 / Date**: 2026-01-07  
**AI 模型 / AI Model**: Claude-4 (Auto Agent Router)

## 功能特性 / Features

- ✅ 自动检查 ROS2 环境配置 / Automatic ROS2 environment check
- ✅ 自动检查依赖工具（colcon, vcs, rosdep）/ Automatic dependency check (colcon, vcs, rosdep)
- ✅ 自动创建 MoveIt2 工作空间 / Automatic MoveIt2 workspace creation
- ✅ 自动克隆和配置 MoveIt2 / Automatic MoveIt2 cloning and configuration
- ✅ 遇到问题时自动使用 opencode 智能体修复 / Automatic opencode agent fixing when problems occur
- ✅ 最多重试 10 次直到成功 / Maximum 10 retries until success

## 使用方法 / Usage

### 前置要求 / Prerequisites

1. **ROS2 环境** / **ROS2 Environment**
   - 确保已安装 ROS2（Humble、Jazzy 或 Rolling）/ Ensure ROS2 is installed (Humble, Jazzy, or Rolling)
   - 确保已 source ROS2 环境 / Ensure ROS2 environment is sourced
   ```bash
   source /opt/ros/humble/setup.bash  # 根据你的 ROS2 版本调整 / Adjust according to your ROS2 version
   ```

2. **opencode** / **opencode**
   - 确保 opencode 已安装或可用 / Ensure opencode is installed or available
   - 如果在开发环境中，脚本会自动使用 `bun dev` / If in dev environment, script will automatically use `bun dev`

3. **MoveIt2 目录** / **MoveIt2 Directory**
   - 确保 `/media/hzm/Data/github/moveit2` 目录存在 / Ensure `/media/hzm/Data/github/moveit2` directory exists

### 运行脚本 / Run Script

```bash
# 从 opencode 项目根目录运行 / Run from opencode project root
cd /media/hzm/Data/github/opencode
bun script/configure_moveit2_v1.0_20260107_AI.ts

# 或者直接运行（如果已添加执行权限）/ Or run directly (if executable permission is set)
./script/configure_moveit2_v1.0_20260107_AI.ts
```

### 环境变量 / Environment Variables

- `ROS_DISTRO`: ROS2 发行版名称（如 humble, jazzy, rolling）/ ROS2 distribution name (e.g., humble, jazzy, rolling)
- `OPENCODE_BIN_PATH`: opencode 二进制文件路径（可选）/ opencode binary path (optional)

## 工作流程 / Workflow

1. **检查目录** / **Check Directory**
   - 验证 MoveIt2 目录是否存在 / Verify MoveIt2 directory exists

2. **检查 ROS2 环境** / **Check ROS2 Environment**
   - 检查 `ROS_DISTRO` 环境变量 / Check `ROS_DISTRO` environment variable
   - 检查 `ros2` 命令是否可用 / Check if `ros2` command is available
   - 如果失败，使用 opencode 智能体修复 / If failed, use opencode agent to fix

3. **检查依赖** / **Check Dependencies**
   - 检查 `colcon`、`vcs`、`rosdep` 工具 / Check `colcon`, `vcs`, `rosdep` tools
   - 如果失败，使用 opencode 智能体修复 / If failed, use opencode agent to fix

4. **配置 MoveIt2** / **Configure MoveIt2**
   - 创建工作空间 `/media/hzm/Data/github/ws_moveit2` / Create workspace `/media/hzm/Data/github/ws_moveit2`
   - 克隆 MoveIt2 仓库 / Clone MoveIt2 repository
   - 导入依赖 / Import dependencies
   - 安装系统依赖 / Install system dependencies
   - 构建工作空间 / Build workspace
   - 如果失败，使用 opencode 智能体修复并重试 / If failed, use opencode agent to fix and retry

5. **重试机制** / **Retry Mechanism**
   - 最多重试 10 次 / Maximum 10 retries
   - 每次失败后等待 5 秒再重试 / Wait 5 seconds after each failure before retry
   - opencode 修复后等待 2 秒再重试 / Wait 2 seconds after opencode fix before retry

## 输出说明 / Output Description

- ✅ 成功步骤 / Successful steps
- ❌ 失败步骤 / Failed steps
- 🔄 重试信息 / Retry information
- 🤖 opencode 智能体修复 / opencode agent fixing
- 📁 目录操作 / Directory operations
- 📥 下载/安装操作 / Download/Install operations
- 🔨 构建操作 / Build operations

## 故障排除 / Troubleshooting

### 问题：找不到 opencode 命令 / Issue: Cannot find opencode command

**解决方案 / Solution**:
- 确保 opencode 已安装 / Ensure opencode is installed
- 设置 `OPENCODE_BIN_PATH` 环境变量 / Set `OPENCODE_BIN_PATH` environment variable
- 如果在开发环境中，确保在 opencode 项目目录下运行脚本 / If in dev environment, ensure running script in opencode project directory

### 问题：ROS2 环境未配置 / Issue: ROS2 environment not configured

**解决方案 / Solution**:
```bash
source /opt/ros/humble/setup.bash  # 根据你的 ROS2 版本调整 / Adjust according to your ROS2 version
export ROS_DISTRO=humble  # 设置 ROS 发行版 / Set ROS distribution
```

### 问题：依赖工具缺失 / Issue: Missing dependency tools

**解决方案 / Solution**:
```bash
# 安装 colcon / Install colcon
sudo apt install python3-colcon-common-extensions

# 安装 vcs / Install vcs
sudo apt install python3-vcstool

# 初始化 rosdep / Initialize rosdep
sudo rosdep init
rosdep update
```

## 注意事项 / Notes

- 脚本会在 `/media/hzm/Data/github/ws_moveit2` 目录下创建工作空间 / Script will create workspace in `/media/hzm/Data/github/ws_moveit2` directory
- 确保有足够的磁盘空间（建议至少 5GB）/ Ensure sufficient disk space (recommended at least 5GB)
- 构建过程可能需要较长时间（10-30 分钟）/ Build process may take a long time (10-30 minutes)
- 如果网络较慢，克隆和下载依赖可能需要更长时间 / If network is slow, cloning and downloading dependencies may take longer

## 许可证 / License

此脚本是 opencode 项目的一部分，遵循项目的许可证。

This script is part of the opencode project and follows the project's license.
