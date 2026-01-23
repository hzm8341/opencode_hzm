# OpenCode DEB 包简单安装使用指南 v1.0

**生成日期**: 2026-01-22  
**AI模型**: Claude-4  
**文档类型**: 简单使用指南

---

## 📦 安装（一步到位）

```bash
# 1. 安装 DEB 包
sudo dpkg -i opencode_*.deb

# 2. 如果有依赖问题，运行（通常不需要）
sudo apt-get install -f
```

**就这么简单！** 安装完成后可以直接使用。

---

## ✅ 验证安装

```bash
# 查看版本
opencode --version

# 查看帮助
opencode --help
```

---

## 🚀 开始使用

### 基本使用

```bash
# 启动 OpenCode
opencode

# 或直接运行命令
opencode run "你的任务描述"
```

### 首次配置 API 密钥（可选）

```bash
# 启动 OpenCode
opencode

# 在 TUI 中输入：
/connect

# 选择提供商并输入 API 密钥
```

---

## 📋 常用命令

```bash
opencode --version          # 查看版本
opencode --help            # 查看帮助
opencode run "任务"        # 运行任务
opencode web               # 启动 Web 界面
```

---

## 🔄 卸载

```bash
sudo dpkg -r opencode
```

---

## 📝 说明

- **安装位置**: `/usr/bin/opencode`
- **配置文件**: `~/.opencode/opencode.json`（首次使用后自动创建）
- **依赖**: 只需要 `libc6`（系统自带）

---

**就这么简单！安装后直接使用即可。**

