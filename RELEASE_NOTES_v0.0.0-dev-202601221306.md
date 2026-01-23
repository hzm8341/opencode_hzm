# OpenCode Linux Release v0.0.0-dev-202601221306

**发布日期**: 2026-01-22  
**版本**: 0.0.0-dev-202601221306  
**平台**: Linux (Ubuntu/Debian)  
**架构**: amd64

---

## 📦 下载文件

本版本提供两个安装包，请根据您的需求选择：

### 1. CLI 版本（命令行工具）- 推荐

**文件**: `opencode_0.0.0-dev-202601221306_amd64.deb` (37MB)

**特点**:
- ✅ 轻量级，安装简单
- ✅ 命令行工具，适合开发者
- ✅ 安装后直接使用，无需额外配置

**适用场景**:
- 开发者日常使用
- CI/CD 环境
- 服务器部署
- 终端用户

### 2. GUI 版本（图形安装程序）

**文件**: `opencode-gui-installer-0.0.0-dev-202601221306-amd64.zip` (37MB)

**特点**:
- ✅ 图形界面安装体验
- ✅ 友好的安装向导
- ✅ 可选的 API 密钥配置
- ✅ 适合不熟悉命令行的用户

**适用场景**:
- 桌面用户
- 不熟悉命令行的用户
- 需要图形界面安装体验

---

## 🚀 快速开始

### CLI 版本安装（推荐）

```bash
# 1. 下载 DEB 包
wget https://github.com/your-repo/releases/download/v0.0.0-dev-202601221306/opencode_0.0.0-dev-202601221306_amd64.deb

# 2. 安装
sudo dpkg -i opencode_0.0.0-dev-202601221306_amd64.deb

# 3. 如果有依赖问题（通常不需要）
sudo apt-get install -f

# 4. 验证安装
opencode --version
```

### GUI 版本安装

```bash
# 1. 下载 ZIP 包
wget https://github.com/your-repo/releases/download/v0.0.0-dev-202601221306/opencode-gui-installer-0.0.0-dev-202601221306-amd64.zip

# 2. 解压
unzip opencode-gui-installer-0.0.0-dev-202601221306-amd64.zip
cd opencode-gui-installer-*

# 3. 运行安装程序
chmod +x install-opencode.sh
./install-opencode.sh

# 或直接运行
sudo bash install-gui.sh opencode_*.deb
```

---

## ✅ 安装后使用

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

```bash
# 启动 OpenCode
opencode

# 在 TUI 中输入：
/connect

# 选择提供商并输入 API 密钥
```

---

## 📋 系统要求

- **操作系统**: Ubuntu 18.04+ / Debian 10+
- **架构**: amd64 (x86_64)
- **依赖**: libc6 (>= 2.17) - 系统自带
- **磁盘空间**: 约 40MB

---

## 🔧 功能特性

- 🤖 **多模型支持** - 支持 Claude、OpenAI、Google 等多种 AI 模型
- 🖥️ **终端界面** - 强大的 TUI（文本用户界面）
- 🌐 **Web 界面** - 可通过浏览器访问
- 🔌 **插件系统** - 支持扩展插件
- 📝 **LSP 支持** - 开箱即用的语言服务器协议支持
- 🔐 **多代理系统** - 内置 build 和 plan 代理

---

## 📚 文档

- **使用指南**: [USAGE_GUIDE.md](USAGE_GUIDE.md)
- **快速开始**: [README.md](README.md)
- **安装说明**: [docs/DEB包简单安装使用指南.md](docs/DEB包简单安装使用指南_v1.0_20260122_AI.md)

---

## 🐛 问题反馈

如遇到问题，请：

1. 查看 [常见问题文档](docs/opencode命令无法使用问题排查_v1.0_20260122_AI.md)
2. 提交 [Issue](https://github.com/your-repo/issues)
3. 访问 [官方文档](https://opencode.ai/docs)

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

## 🔄 卸载

```bash
# 卸载 OpenCode
sudo dpkg -r opencode

# 完全卸载（包括配置文件）
sudo dpkg -P opencode
```

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

感谢所有贡献者和用户的支持！

