# OpenCode DEB 包 GUI 安装程序使用指南 v1.0

**生成日期**: 2026-01-22  
**AI模型**: Claude-4  
**文档类型**: 使用指南

---

## 📦 概述

OpenCode GUI 安装程序提供了一个图形界面的安装体验，类似于 Windows 下的安装程序，让用户可以通过点击和对话框完成安装，无需记忆命令行命令。

---

## 🎯 功能特性

- ✅ **图形界面** - 使用 zenity 提供友好的 GUI 体验
- ✅ **欢迎界面** - 欢迎对话框介绍 OpenCode
- ✅ **许可协议** - 显示并确认许可协议
- ✅ **安装进度** - 实时显示安装进度
- ✅ **API 配置** - 可选的 API 密钥配置向导
- ✅ **完成提示** - 安装完成后的使用提示

---

## 📥 获取安装包

GUI 安装程序包是一个 ZIP 文件，包含：

- `install-opencode.sh` - 启动脚本（可双击运行）
- `install-gui.sh` - GUI 安装程序主脚本
- `opencode_*.deb` - DEB 安装包
- `README.txt` - 说明文件

**文件位置**: `packages/opencode/dist/opencode-gui-installer-*.zip`

---

## 🚀 使用方法

### 方法一：双击运行（推荐）

1. **解压 ZIP 文件**
   ```bash
   unzip opencode-gui-installer-*.zip
   cd opencode-gui-installer-*
   ```

2. **设置执行权限**
   ```bash
   chmod +x install-opencode.sh
   ```

3. **双击运行**（如果文件管理器支持）
   - 在文件管理器中右键点击 `install-opencode.sh`
   - 选择"属性" → "权限" → 勾选"允许作为程序执行文件"
   - 双击运行

4. **或在终端运行**
   ```bash
   ./install-opencode.sh
   ```

### 方法二：直接使用 GUI 安装程序

```bash
# 解压 ZIP 文件
unzip opencode-gui-installer-*.zip
cd opencode-gui-installer-*

# 运行 GUI 安装程序
sudo bash install-gui.sh opencode_*.deb
```

### 方法三：命令行安装（传统方式）

如果您更喜欢命令行方式：

```bash
sudo dpkg -i opencode_*.deb
sudo apt-get install -f  # 如果有依赖问题
```

---

## 🖥️ 安装流程

### 1. 欢迎界面

安装程序启动后会显示欢迎对话框，介绍 OpenCode。

### 2. 许可协议

显示 MIT 许可协议，需要确认同意才能继续。

### 3. 选择安装包

如果未指定 DEB 文件，会弹出文件选择对话框。

### 4. 安装进度

显示安装进度条，包括：
- 检查系统要求
- 验证文件
- 复制文件
- 设置权限
- 创建快捷方式

### 5. API 密钥配置（可选）

安装完成后，可以选择配置 AI 模型 API 密钥：
- 选择提供商（Anthropic、OpenAI、Google 等）
- 输入 API 密钥
- 自动创建配置文件

### 6. 完成界面

显示安装完成信息和使用提示。

---

## 🔧 系统要求

### 必需组件

- **操作系统**: Ubuntu/Debian Linux
- **权限**: 管理员权限（sudo）
- **zenity**: GUI 对话框工具（会自动安装）

### 自动安装依赖

如果系统没有安装 zenity，安装程序会自动安装：

```bash
sudo apt-get update
sudo apt-get install -y zenity
```

---

## 📋 安装步骤详解

### 步骤 1: 下载和解压

```bash
# 下载 GUI 安装程序包
wget https://github.com/your-repo/releases/download/v1.0/opencode-gui-installer-*.zip

# 解压
unzip opencode-gui-installer-*.zip
cd opencode-gui-installer-*
```

### 步骤 2: 运行安装程序

```bash
# 方法 A: 使用启动脚本（推荐）
chmod +x install-opencode.sh
./install-opencode.sh

# 方法 B: 直接运行 GUI 安装程序
sudo bash install-gui.sh opencode_*.deb
```

### 步骤 3: 按照 GUI 提示操作

1. 点击"确定"继续
2. 阅读并同意许可协议
3. 选择 DEB 文件（如果未自动选择）
4. 等待安装完成
5. 选择是否配置 API 密钥
6. 查看完成提示

### 步骤 4: 验证安装

```bash
# 检查版本
opencode --version

# 查看帮助
opencode --help

# 启动 OpenCode
opencode
```

---

## 🎨 GUI 界面说明

### 欢迎对话框

- **标题**: OpenCode 安装程序
- **内容**: 欢迎信息和简介
- **按钮**: 确定/取消

### 许可协议对话框

- **标题**: 许可协议
- **内容**: MIT 许可协议全文
- **复选框**: "我已阅读并同意许可协议"
- **按钮**: 同意并继续/取消

### 安装进度对话框

- **标题**: 正在安装 OpenCode
- **进度条**: 0-100%
- **状态文本**: 当前操作说明
- **自动关闭**: 安装完成后自动关闭

### API 配置对话框

- **选择对话框**: 选择是否现在配置
- **输入对话框**: 输入 API 密钥
- **列表对话框**: 选择提供商

### 完成对话框

- **标题**: 安装完成
- **内容**: 版本信息和使用提示
- **按钮**: 确定

---

## 🐛 常见问题

### 问题 1: 无法双击运行脚本

**解决方法**:
```bash
# 设置执行权限
chmod +x install-opencode.sh

# 在终端运行
./install-opencode.sh
```

### 问题 2: 权限被拒绝

**错误信息**:
```
Permission denied
```

**解决方法**:
```bash
# 使用 sudo 运行
sudo bash install-gui.sh opencode_*.deb
```

### 问题 3: zenity 未安装

**错误信息**:
```
zenity: command not found
```

**解决方法**:
安装程序会自动安装 zenity，如果失败可以手动安装：
```bash
sudo apt-get update
sudo apt-get install -y zenity
```

### 问题 4: 依赖问题

**错误信息**:
```
dpkg: dependency problems prevent configuration
```

**解决方法**:
安装程序会自动运行 `apt-get install -f`，如果失败可以手动运行：
```bash
sudo apt-get install -f
```

### 问题 5: GUI 不显示

**可能原因**:
- 在 SSH 会话中运行（无图形环境）
- 未设置 DISPLAY 环境变量

**解决方法**:
```bash
# 检查是否有图形环境
echo $DISPLAY

# 如果没有，使用命令行安装
sudo dpkg -i opencode_*.deb
```

---

## 🔍 高级用法

### 静默安装（无 GUI）

如果不需要 GUI，可以直接使用命令行：

```bash
sudo dpkg -i opencode_*.deb
sudo apt-get install -f
```

### 指定 DEB 文件

```bash
sudo bash install-gui.sh /path/to/opencode_*.deb
```

### 跳过 API 配置

安装完成后，可以稍后配置 API 密钥：

```bash
opencode
/connect
```

---

## 📊 文件结构

GUI 安装程序包包含以下文件：

```
opencode-gui-installer-*.zip
├── install-opencode.sh          # 启动脚本
├── install-gui.sh               # GUI 安装程序主脚本
├── opencode_*.deb               # DEB 安装包
└── README.txt                   # 说明文件
```

---

## 🎯 与 Windows 安装程序的对比

| 特性 | Windows 安装程序 | Linux GUI 安装程序 |
|------|-----------------|-------------------|
| 图形界面 | ✅ NSIS/Inno Setup | ✅ zenity |
| 欢迎界面 | ✅ | ✅ |
| 许可协议 | ✅ | ✅ |
| 安装进度 | ✅ | ✅ |
| 配置向导 | ✅ | ✅ (API 密钥) |
| 完成提示 | ✅ | ✅ |
| 卸载程序 | ✅ | ⚠️ 使用 dpkg |

---

## 📚 相关文档

- [DEB 包安装后使用指南](./DEB包安装后使用指南_v1.0_20260122_AI.md)
- [DEB 包手动测试指南](./DEB包手动测试指南_v1.0_20260126_AI.md)
- [USAGE_GUIDE.md](../USAGE_GUIDE.md)

---

## 🔄 更新日志

### v1.0 (2026-01-22)
- ✅ 初始版本
- ✅ 图形界面安装程序
- ✅ API 密钥配置向导
- ✅ 自动依赖安装

---

**文档结束**

