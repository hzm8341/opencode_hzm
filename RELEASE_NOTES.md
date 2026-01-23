# OpenCode Linux Release v0.0.0-dev-202601221306

**发布日期**: 2026-01-22  
**平台**: Linux (Ubuntu/Debian)  
**架构**: amd64

---

## 📦 下载文件

本版本提供两个安装包：

### 1. CLI 版本（推荐）⭐

**`opencode_0.0.0-dev-202601221306_amd64.deb`** (37MB)

- ✅ 轻量级，安装简单
- ✅ 命令行工具，适合开发者
- ✅ 安装后直接使用

**安装方法**:
```bash
sudo dpkg -i opencode_0.0.0-dev-202601221306_amd64.deb
sudo apt-get install -f  # 如果有依赖问题（通常不需要）
opencode --version        # 验证安装
```

### 2. GUI 版本（图形安装程序）

**`opencode-gui-installer-0.0.0-dev-202601221306-amd64.zip`** (37MB)

- ✅ 图形界面安装体验
- ✅ 友好的安装向导
- ✅ 适合不熟悉命令行的用户

**安装方法**:
```bash
unzip opencode-gui-installer-0.0.0-dev-202601221306-amd64.zip
cd opencode-gui-installer-*
chmod +x install-opencode.sh
./install-opencode.sh
```

---

## 🚀 快速开始

### 基本使用

```bash
# 查看版本
opencode --version

# 查看帮助
opencode --help

# 启动 OpenCode
opencode

# 运行任务
opencode run "你的任务描述"
```

### 首次配置（可选）

启动 OpenCode 后，输入 `/connect` 配置 AI 模型 API 密钥。

---

## 📋 系统要求

- **操作系统**: Ubuntu 18.04+ / Debian 10+
- **架构**: amd64 (x86_64)
- **依赖**: libc6 (>= 2.17) - 系统自带
- **磁盘空间**: 约 40MB

---

## 🔧 功能特性

- 🤖 **多模型支持** - Claude、OpenAI、Google 等
- 🖥️ **终端界面** - 强大的 TUI
- 🌐 **Web 界面** - 浏览器访问
- 🔌 **插件系统** - 支持扩展
- 📝 **LSP 支持** - 开箱即用
- 🔐 **多代理系统** - build 和 plan 代理

---

## 📝 更新日志

### v0.0.0-dev-202601221306 (2026-01-22)

**新增**:
- ✅ 简化安装流程，安装后直接使用
- ✅ 添加 postinst 脚本，自动设置权限
- ✅ 改进安装提示信息

**改进**:
- 🔧 优化 DEB 包结构
- 🔧 改进错误处理

**修复**:
- 🐛 修复安装后权限问题
- 🐛 修复依赖检查

---

## 📚 文档

- [使用指南](USAGE_GUIDE.md)
- [快速开始](README.md)
- [安装说明](docs/DEB包简单安装使用指南_v1.0_20260122_AI.md)

---

## 🔄 卸载

```bash
sudo dpkg -r opencode
```

---

## 📄 许可证

MIT License

---

## 🙏 致谢

感谢所有贡献者和用户的支持！

