# OCS2 MPC ROS2节点编译和使用手册 v1.0 (2026-01-13 AI生成)

## 编译环境要求 (Compilation Environment Requirements)

### ROS2版本 (ROS2 Version)
- ROS2 Iron 或 Humble (推荐 Iron)
- Ubuntu 22.04 LTS

### OCS2依赖 (OCS2 Dependencies)
- OCS2 库: https://github.com/zhengxiang94/ocs2_ros2 (ROS2版本)
- Eigen v3.4+
- Boost C++ v1.74+
- Pinocchio (多体动力学库)
- HPP-FCL (碰撞检测库)

### 系统要求 (System Requirements)
- C++17 编译器支持
- CMake 3.16+
- Ubuntu 22.04 或兼容系统

## 编译步骤详解 (Detailed Compilation Steps)

### 1. 编译位置 (Compilation Location)
在ROS2工作空间中编译 (Compile in ROS2 Workspace):
```bash
# 创建ROS2工作空间
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
```

### 2. 设置编译环境 (Setup Build Environment)
```bash
# 源化ROS2环境
source /opt/ros/iron/setup.bash

# 初始化工作空间 (如果还没有)
cd ~/ros2_ws
rosdep install --from-paths src --ignore-src -r -y
```

### 3. 依赖包编译顺序 (Dependency Package Compilation Order)
1. 首先安装系统依赖
2. 克隆OCS2相关包
3. 编译Pinocchio和HPP-FCL
4. 编译OCS2包

### 4. 完整编译命令 (Complete Compilation Commands)
```bash
# 进入工作空间src目录
cd ~/ros2_ws/src

# 克隆OCS2 ROS2
git clone https://github.com/zhengxiang94/ocs2_ros2.git
cd ocs2_ros2
git submodule update --init --recursive

# 克隆依赖
cd ~/ros2_ws/src
git clone --recurse-submodules https://github.com/zhengxiang94/pinocchio.git
git clone --recurse-submodules https://github.com/zhengxiang94/hpp-fcl.git
git clone https://github.com/zhengxiang94/ocs2_robotic_assets.git
git clone https://github.com/zhengxiang94/plane_segmentation_ros2.git

# 安装系统依赖
sudo apt-get install ros-iron-grid-map-cv ros-iron-grid-map-msgs ros-iron-grid-map-ros ros-iron-grid-map-sdf libmpfr-dev libpcap-dev libglpk-dev

# 编译工作空间
cd ~/ros2_ws
colcon build --symlink-install --packages-select ocs2_core ocs2_mpc ocs2_msgs ocs2_ocs2
```

## 常见编译错误及解决方案 (Common Compilation Errors and Solutions)

### ocs2_core头文件找不到的问题 (ocs2_core Header File Not Found Issue)
**错误信息示例 (Error Message Example):**
```
fatal error: ocs2_core/.../h 没有那个文件或目录
#include <ocs2_core/.../h>
```

**解决方案 (Solution):**
1. 确保ocs2_core包已正确编译
2. 设置正确的include路径
```bash
# 在CMakeLists.txt中添加
find_package(ocs2_core REQUIRED)
include_directories(${ocs2_core_INCLUDE_DIRS})
```

3. 如果是混合构建问题，设置CMAKE_PREFIX_PATH
```bash
export CMAKE_PREFIX_PATH=$CMAKE_PREFIX_PATH:~/ros2_ws/install
```

### OCS2包的混合构建（catkin+ament）问题 (OCS2 Package Hybrid Build (catkin+ament) Issues)
**问题描述 (Problem Description):**
OCS2原版基于catkin，但ROS2使用ament。混合构建可能导致路径冲突。

**解决方案 (Solution):**
1. 使用纯ROS2版本的OCS2: https://github.com/zhengxiang94/ocs2_ros2
2. 避免在同一个工作空间混合catkin和ament包
3. 如果必须混合，使用不同的工作空间并设置正确的环境变量

**常见混合构建错误 (Common Hybrid Build Errors):**
- `catkin_make` 找不到ament包
- ament找不到catkin包
- 头文件路径冲突

**解决步骤 (Resolution Steps):**
```bash
# 1. 分离工作空间
mkdir -p ~/catkin_ws/src  # for catkin packages
mkdir -p ~/ros2_ws/src    # for ament packages

# 2. 分别编译
cd ~/catkin_ws && catkin_make
cd ~/ros2_ws && colcon build

# 3. 运行时源化两个环境
source ~/catkin_ws/devel/setup.bash
source ~/ros2_ws/install/setup.bash
```

## 验证编译是否成功的方法 (Methods to Verify Successful Compilation)

### 1. 检查包列表 (Check Package List)
```bash
cd ~/ros2_ws
ros2 pkg list | grep ocs2
```

### 2. 运行测试 (Run Tests)
```bash
colcon test --packages-select ocs2_core
colcon test-result --verbose
```

### 3. 检查节点可用性 (Check Node Availability)
```bash
ros2 pkg executables ocs2_mpc
```

### 4. 编译输出检查 (Compilation Output Check)
- 编译无错误信息
- 生成的库文件存在: `~/ros2_ws/install/lib/libocs2_core.so`
- 头文件安装正确: `~/ros2_ws/install/include/ocs2_core/`

## 如何使用编译好的节点 (How to Use the Compiled Node)

### 1. 源化环境 (Source Environment)
```bash
source ~/ros2_ws/install/setup.bash
```

### 2. 启动MPC节点 (Launch MPC Node)
```bash
# 假设有launch文件
ros2 launch ocs2_mpc mpc.launch.py
```

### 3. 或者直接运行节点 (Or Run Node Directly)
```bash
ros2 run ocs2_mpc ocs2_mpc_node
```

### 4. 参数配置 (Parameter Configuration)
通过ROS2参数服务器或配置文件设置MPC参数:
- 时间步长 (time step)
- 预测horizon
- 控制约束 (control constraints)
- 系统动态 (system dynamics)

## 故障排除指南 (Troubleshooting Guide)

### 常见问题 (Common Issues)

1. **依赖未满足 (Dependencies Not Satisfied)**
   - 运行 `rosdep install --from-paths src --ignore-src -r -y`

2. **编译内存不足 (Out of Memory During Compilation)**
   - 使用 `colcon build --parallel-workers 1`
   - 或增加交换空间

3. **版本不兼容 (Version Incompatibility)**
   - 检查Eigen版本: `pkg-config --modversion eigen3`
   - 确保C++17支持: `g++ --version`

4. **运行时库找不到 (Runtime Library Not Found)**
   - 检查LD_LIBRARY_PATH: `echo $LD_LIBRARY_PATH`
   - 添加: `export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:~/ros2_ws/install/lib`

5. **权限问题 (Permission Issues)**
   - 确保安装目录有写权限
   - 或使用 `--install-base` 指定安装目录

### 调试步骤 (Debugging Steps)
1. 清理构建缓存: `rm -rf build/ install/ log/`
2. 重新编译单个包: `colcon build --packages-select <package_name>`
3. 查看详细错误: `colcon build --event-handlers console_direct+`
4. 检查CMake输出: 查看 `log/latest_build/<package>/stdout_stderr.log`

### 获取帮助 (Getting Help)
- OCS2 GitHub Issues: https://github.com/zhengxiang94/ocs2_ros2/issues
- ROS2 Discourse: https://discourse.ros.org/
- 检查OCS2文档: https://leggedrobotics.github.io/ocs2/

---

*本手册基于2026年1月13日可用信息生成。如有更新，请检查官方仓库。*