# OpenCode DEB 打包方案评估报告 v1.0

**生成日期**: 2026-01-26  
**AI模型**: Claude-4  
**文档类型**: 技术评估与实施计划

---

## 执行摘要

本报告评估了将 OpenCode CLI 可执行文件打包为 Debian/Ubuntu DEB 安装包的可行性。

**结论**: ✅ **高度可行** - 可执行文件已构建成功，DEB 打包是标准流程，技术成熟。

---

## 1. DEB 包概述

### 1.1 什么是 DEB 包

DEB (Debian Package) 是 Debian 及其衍生发行版（如 Ubuntu）使用的软件包格式。

**优势**:
- ✅ 标准化的安装/卸载流程
- ✅ 依赖管理自动化
- ✅ 版本管理
- ✅ 系统集成（菜单、服务等）
- ✅ 用户友好的安装体验

### 1.2 DEB 包结构

```
opencode_1.1.4_amd64.deb
├── DEBIAN/
│   ├── control          # 包元数据（名称、版本、依赖等）
│   ├── postinst         # 安装后脚本（可选）
│   ├── prerm            # 卸载前脚本（可选）
│   ├── postrm           # 卸载后脚本（可选）
│   └── conffiles        # 配置文件列表（可选）
└── usr/
    ├── bin/
    │   └── opencode     # 可执行文件
    └── share/
        └── doc/
            └── opencode/  # 文档（可选）
```

---

## 2. 可行性评估

### 2.1 当前状态

#### ✅ 已有资源

1. **可执行文件**
   - 位置: `packages/opencode/dist/opencode-linux-x64/bin/opencode`
   - 大小: 134MB
   - 类型: ELF 64-bit executable
   - 状态: ✅ 已构建并测试通过

2. **版本信息**
   - 版本: 1.1.4
   - 许可证: MIT
   - 描述: AI-powered development tool

3. **依赖关系**
   - 只依赖系统标准库（libc, libpthread, libdl, libm）
   - 无需额外运行时（Bun/Node.js）

#### ⚠️ 需要创建

1. **DEB 包结构**
   - DEBIAN/control 文件
   - 安装脚本（可选）
   - 文档目录（可选）

2. **打包工具**
   - dpkg-deb（系统自带）
   - 或 fpm（Ruby gem，更易用）

### 2.2 技术可行性

| 项目 | 状态 | 说明 |
|------|------|------|
| 可执行文件 | ✅ 已有 | 已构建并测试 |
| 依赖关系 | ✅ 清晰 | 只依赖系统库 |
| 打包工具 | ✅ 可用 | dpkg-deb 或 fpm |
| 版本信息 | ✅ 已有 | 1.1.4 |
| 文档 | ⚠️ 可选 | 可以添加 |

**结论**: ✅ **完全可行**

---

## 3. DEB 包设计

### 3.1 包信息

```control
Package: opencode
Version: 1.1.4
Section: devel
Priority: optional
Architecture: amd64
Depends: libc6 (>= 2.17), libpthread-stubs0-dev
Maintainer: OpenCode Team <team@opencode.ai>
Description: AI-powered development tool
 OpenCode is an open source AI coding agent that works with
 Claude, OpenAI, Google, or local models. It provides a powerful
 terminal interface and web interface for AI-assisted development.
Homepage: https://opencode.ai
```

### 3.2 文件布局

```
/usr/bin/opencode          # 可执行文件（主要）
/usr/share/doc/opencode/    # 文档（可选）
  - README.md
  - LICENSE
  - CHANGELOG.md
```

### 3.3 安装脚本（可选）

**postinst** (安装后):
```bash
#!/bin/bash
# 创建符号链接（如果需要）
# 更新系统数据库
update-alternatives --install /usr/bin/opencode opencode /usr/bin/opencode 100
```

**prerm** (卸载前):
```bash
#!/bin/bash
# 清理符号链接
update-alternatives --remove opencode /usr/bin/opencode
```

---

## 4. 打包方案对比

### 方案一：使用 dpkg-deb（标准工具）

**优点**:
- ✅ 系统自带，无需安装
- ✅ 标准工具，兼容性好
- ✅ 完全控制包结构

**缺点**:
- ⚠️ 需要手动创建目录结构
- ⚠️ 需要手动编写 control 文件

**适用场景**: 推荐用于生产环境

### 方案二：使用 fpm（Ruby gem）

**优点**:
- ✅ 简单易用，命令行友好
- ✅ 支持多种包格式（deb, rpm, tar.gz）
- ✅ 自动处理依赖关系

**缺点**:
- ⚠️ 需要安装 Ruby 和 fpm
- ⚠️ 额外依赖

**适用场景**: 快速打包，多格式支持

### 方案三：使用 dh_make + debuild（Debian 标准流程）

**优点**:
- ✅ Debian 官方推荐流程
- ✅ 完整的打包工具链
- ✅ 符合 Debian 政策

**缺点**:
- ⚠️ 学习曲线较陡
- ⚠️ 需要更多配置

**适用场景**: 如果要提交到 Debian 仓库

---

## 5. 推荐方案：使用 dpkg-deb

### 5.1 为什么选择 dpkg-deb

1. **系统自带**: 所有 Debian/Ubuntu 系统都有
2. **简单直接**: 只需创建目录结构和 control 文件
3. **完全控制**: 可以精确控制包的内容
4. **无额外依赖**: 不需要安装其他工具

### 5.2 实施步骤

#### 步骤 1: 创建打包脚本

```bash
#!/bin/bash
# 创建 DEB 包结构
VERSION="1.1.4"
ARCH="amd64"
PACKAGE_NAME="opencode"
BUILD_DIR="deb_build"

# 创建目录结构
mkdir -p ${BUILD_DIR}/${PACKAGE_NAME}_${VERSION}_${ARCH}/DEBIAN
mkdir -p ${BUILD_DIR}/${PACKAGE_NAME}_${VERSION}_${ARCH}/usr/bin
mkdir -p ${BUILD_DIR}/${PACKAGE_NAME}_${VERSION}_${ARCH}/usr/share/doc/${PACKAGE_NAME}

# 复制可执行文件
cp packages/opencode/dist/opencode-linux-x64/bin/opencode \
   ${BUILD_DIR}/${PACKAGE_NAME}_${VERSION}_${ARCH}/usr/bin/opencode

# 创建 control 文件
cat > ${BUILD_DIR}/${PACKAGE_NAME}_${VERSION}_${ARCH}/DEBIAN/control << EOF
Package: ${PACKAGE_NAME}
Version: ${VERSION}
Section: devel
Priority: optional
Architecture: ${ARCH}
Depends: libc6 (>= 2.17)
Maintainer: OpenCode Team <team@opencode.ai>
Description: AI-powered development tool
 OpenCode is an open source AI coding agent.
Homepage: https://opencode.ai
EOF

# 构建 DEB 包
dpkg-deb --build ${BUILD_DIR}/${PACKAGE_NAME}_${VERSION}_${ARCH}
```

#### 步骤 2: 测试安装

```bash
# 安装
sudo dpkg -i opencode_1.1.4_amd64.deb

# 验证
opencode --version

# 卸载
sudo dpkg -r opencode
```

---

## 6. 实施计划

### 6.1 阶段一：基础打包（1-2天）

**任务**:
1. 创建打包脚本
2. 生成基础 DEB 包
3. 测试安装/卸载

**交付物**:
- 打包脚本
- 基础 DEB 包
- 测试报告

### 6.2 阶段二：完善包信息（1天）

**任务**:
1. 添加文档
2. 完善 control 文件
3. 添加安装脚本（如需要）

**交付物**:
- 完整的 DEB 包
- 文档目录

### 6.3 阶段三：自动化集成（1天）

**任务**:
1. 集成到构建流程
2. CI/CD 自动化
3. 多架构支持（amd64, arm64）

**交付物**:
- 自动化构建脚本
- CI/CD 配置

---

## 7. 多架构支持

### 7.1 支持的架构

- **amd64** (x86_64) - ✅ 已测试
- **arm64** - ⚠️ 需要构建 arm64 版本

### 7.2 打包策略

**方案 A**: 为每个架构创建单独的 DEB 包
```
opencode_1.1.4_amd64.deb
opencode_1.1.4_arm64.deb
```

**方案 B**: 使用多架构包（需要特殊配置）

**推荐**: 方案 A（更简单，更灵活）

---

## 8. 依赖关系

### 8.1 系统依赖

```
Depends: libc6 (>= 2.17)
```

**说明**:
- `libc6` 是所有现代 Linux 系统的标准库
- 版本要求 2.17 是 Ubuntu 12.04+ 的标准
- 实际测试显示依赖更少（libc, libpthread, libdl, libm）

### 8.2 可选依赖

```
Recommends: git
Suggests: vim, neovim
```

---

## 9. 潜在问题与解决方案

### 问题 1: 文件大小

**问题**: 可执行文件 134MB，可能影响下载速度

**解决方案**:
- 使用压缩（DEB 包内部已压缩）
- 考虑分发包（core + optional features）
- 提供 tar.gz 作为替代

### 问题 2: 版本管理

**问题**: 如何管理版本号和更新

**解决方案**:
- 使用语义化版本号
- 在 control 文件中明确版本
- 提供更新脚本或使用 apt repository

### 问题 3: 配置文件

**问题**: 用户配置文件的位置

**解决方案**:
- 使用 `~/.opencode/` 目录（用户目录）
- 不在系统目录创建配置文件
- 使用 conffiles 标记系统级配置（如果有）

---

## 10. 测试计划

### 10.1 安装测试

- [ ] 在干净的 Ubuntu 系统上安装
- [ ] 验证可执行文件权限
- [ ] 测试基本命令（--version, --help）
- [ ] 验证 PATH 中可用

### 10.2 卸载测试

- [ ] 卸载后文件完全删除
- [ ] 用户配置文件保留（如适用）
- [ ] 无残留文件

### 10.3 升级测试

- [ ] 从旧版本升级到新版本
- [ ] 配置文件迁移（如适用）
- [ ] 版本冲突处理

---

## 11. 分发策略

### 11.1 分发方式

1. **直接下载**
   - GitHub Releases
   - 官方网站下载

2. **APT 仓库**（高级）
   - 创建私有 APT 仓库
   - 使用 Launchpad PPA
   - 使用第三方仓库服务

3. **包管理器**
   - Snap
   - Flatpak
   - AppImage

### 11.2 推荐方案

**初期**: 直接下载 DEB 包
- 简单直接
- 无需维护仓库
- 适合快速发布

**长期**: APT 仓库
- 更好的用户体验
- 自动更新
- 依赖管理

---

## 12. 成功标准

### 12.1 功能标准

- ✅ DEB 包可以正常安装
- ✅ 可执行文件在 PATH 中可用
- ✅ 基本功能正常工作
- ✅ 可以正常卸载

### 12.2 质量标准

- ✅ 包结构符合 Debian 政策
- ✅ 依赖关系正确
- ✅ 版本信息准确
- ✅ 文档完整（可选）

---

## 13. 结论

### 13.1 可行性结论

✅ **DEB 打包完全可行**

**理由**:
1. 可执行文件已构建成功
2. 依赖关系清晰简单
3. 打包工具成熟可用
4. 流程标准化

### 13.2 推荐方案

**采用方案一：使用 dpkg-deb**

**实施优先级**:
1. **P0**: 创建基础打包脚本，生成 DEB 包
2. **P1**: 测试安装/卸载流程
3. **P2**: 完善包信息和文档
4. **P3**: 集成到 CI/CD，支持多架构

### 13.3 预计时间

- **基础打包**: 1-2 天
- **完善和测试**: 1-2 天
- **自动化集成**: 1 天
- **总计**: 3-5 天

---

## 附录

### A. DEB 包示例结构

```
opencode_1.1.4_amd64.deb
├── DEBIAN/
│   └── control
└── usr/
    └── bin/
        └── opencode
```

### B. control 文件模板

```control
Package: opencode
Version: 1.1.4
Section: devel
Priority: optional
Architecture: amd64
Depends: libc6 (>= 2.17)
Maintainer: OpenCode Team <team@opencode.ai>
Description: AI-powered development tool
 OpenCode is an open source AI coding agent that works with
 Claude, OpenAI, Google, or local models.
Homepage: https://opencode.ai
```

### C. 打包脚本模板

见实施计划中的脚本示例。

### D. 参考资源

- [Debian Policy Manual](https://www.debian.org/doc/debian-policy/)
- [dpkg-deb 手册](https://manpages.debian.org/dpkg-deb)
- [fpm 文档](https://fpm.readthedocs.io/)

---

**文档结束**

