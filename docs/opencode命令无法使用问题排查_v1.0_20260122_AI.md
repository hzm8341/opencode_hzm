# OpenCode 命令无法使用问题排查指南 v1.0

**生成日期**: 2026-01-22  
**AI模型**: Claude-4  
**问题**: `opencode run` 命令卡住或无法使用

---

## 🔍 问题现象

```bash
opencode run --agent build "编译当前项目"
>  # 命令卡住，没有响应
```

---

## ✅ 问题诊断

### 1. 检查 opencode 是否已安装

```bash
# 检查命令是否存在
which opencode

# 检查版本
opencode --version

# 查看帮助（确认命令可用）
opencode --help
```

**预期结果**:
- 命令路径: `/home/hzm/.bun/bin/opencode` 或 `/usr/bin/opencode`
- 版本号: 如 `1.1.26`
- 帮助信息正常显示

### 2. 检查配置文件

```bash
# 检查全局配置
ls -la ~/.opencode/opencode.json

# 检查项目配置
ls -la ./opencode.json ./.opencode/
```

**问题**: 如果配置文件不存在，需要先配置 API 密钥。

### 3. 检查环境变量

```bash
# 检查 API 密钥环境变量
env | grep -i "ANTHROPIC\|OPENAI\|GOOGLE\|API"
```

**问题**: 如果没有设置环境变量，需要配置。

---

## 🔧 解决方案

### 方案一：通过 TUI 配置（推荐）

```bash
# 1. 启动 OpenCode TUI
opencode

# 2. 在 TUI 中输入命令：
/connect

# 3. 选择提供商（如 opencode、anthropic、openai 等）
# 4. 按照提示输入 API 密钥
# 5. 配置完成后退出（/exit 或 Ctrl+C）
```

### 方案二：通过配置文件配置

```bash
# 1. 创建配置目录
mkdir -p ~/.opencode

# 2. 创建配置文件
cat > ~/.opencode/opencode.json << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-20250514",
  "default_agent": "build",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "your-api-key-here"
      }
    }
  }
}
EOF

# 3. 替换 your-api-key-here 为实际的 API 密钥
```

### 方案三：通过环境变量配置

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export ANTHROPIC_API_KEY="your-api-key-here"
export OPENAI_API_KEY="your-api-key-here"
export GOOGLE_API_KEY="your-api-key-here"

# 重新加载配置
source ~/.bashrc
```

---

## 🚀 使用正确的命令语法

### 问题：中文引号

**错误示例**:
```bash
opencode run --agent build "编译当前项目"  # 中文引号可能导致问题
```

**正确示例**:
```bash
# 使用英文引号
opencode run --agent build "编译当前项目"

# 或者不使用引号（如果消息中没有空格）
opencode run --agent build 编译当前项目

# 或者使用单引号
opencode run --agent build '编译当前项目'
```

### 基本命令格式

```bash
# 基本格式
opencode run [message]

# 指定 agent
opencode run --agent build "your message"
opencode run --agent plan "your message"

# 指定模型
opencode run --model anthropic/claude-sonnet-4-20250514 "your message"

# 附加文件
opencode run --file file1.txt --file file2.txt "analyze these files"
```

---

## 📋 完整使用流程

### 1. 首次使用

```bash
# 步骤 1: 配置 API 密钥
opencode
/connect
# 按照提示配置

# 步骤 2: 初始化项目（可选但推荐）
cd /path/to/your/project
opencode
/init
# 这会创建 AGENTS.md 文件

# 步骤 3: 开始使用
opencode run "your task"
```

### 2. 命令行模式使用

```bash
# 确保已配置 API 密钥后
cd /path/to/your/project

# 运行命令
opencode run --agent build "编译当前项目"

# 如果命令卡住，检查：
# 1. API 密钥是否正确配置
# 2. 网络连接是否正常
# 3. 项目目录是否正确
```

---

## 🐛 常见问题

### 问题 1: 命令卡住无响应

**可能原因**:
1. API 密钥未配置
2. 网络连接问题
3. 模型服务不可用

**解决方法**:
```bash
# 1. 检查配置
cat ~/.opencode/opencode.json

# 2. 测试连接
opencode models list

# 3. 使用调试模式
opencode run --log-level DEBUG "test message"
```

### 问题 2: 权限错误

**错误信息**:
```
Permission denied
```

**解决方法**:
```bash
# 检查文件权限
ls -l $(which opencode)

# 确保有执行权限
chmod +x $(which opencode)
```

### 问题 3: 命令未找到

**错误信息**:
```
command not found: opencode
```

**解决方法**:
```bash
# 检查 PATH
echo $PATH | grep bun

# 添加到 PATH（如果缺失）
export PATH="$HOME/.bun/bin:$PATH"

# 永久添加到 ~/.bashrc
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 问题 4: API 密钥错误

**错误信息**:
```
Authentication failed
Invalid API key
```

**解决方法**:
```bash
# 重新配置
opencode
/connect

# 或更新配置文件
nano ~/.opencode/opencode.json
```

---

## 🔍 调试技巧

### 1. 启用详细日志

```bash
# 使用调试模式
opencode run --log-level DEBUG "your message"

# 或打印日志到 stderr
opencode run --print-logs "your message"
```

### 2. 测试基本功能

```bash
# 测试版本
opencode --version

# 测试帮助
opencode --help

# 测试模型列表
opencode models list

# 测试简单命令
opencode run "hello"
```

### 3. 检查进程状态

```bash
# 如果命令卡住，检查进程
ps aux | grep opencode

# 查看网络连接
netstat -an | grep opencode
```

---

## 📝 快速检查清单

使用以下清单快速诊断问题：

- [ ] `opencode --version` 能正常显示版本
- [ ] `opencode --help` 能正常显示帮助
- [ ] 配置文件 `~/.opencode/opencode.json` 存在
- [ ] 配置文件中有有效的 API 密钥
- [ ] 环境变量中设置了 API 密钥（如果使用）
- [ ] 网络连接正常
- [ ] 项目目录存在且有权限
- [ ] 使用英文引号而非中文引号

---

## 🎯 针对您的具体情况

根据您的终端输出：
```bash
opencode run --agent build "编译当前项目"
>  # 卡住
```

**最可能的原因**:
1. ✅ **API 密钥未配置** - 这是最常见的原因
2. ⚠️ **中文引号问题** - 虽然通常不影响，但建议使用英文引号

**解决步骤**:

```bash
# 1. 先配置 API 密钥
opencode
/connect
# 按照提示完成配置

# 2. 退出 TUI
/exit

# 3. 使用正确的命令格式
cd /media/hzm/B412D05112D01A66/github/ws_moveit
opencode run --agent build "编译当前项目"

# 或者使用英文引号
opencode run --agent build '编译当前项目'
```

---

## 📚 相关文档

- [DEB 包安装后使用指南](./DEB包安装后使用指南_v1.0_20260122_AI.md)
- [USAGE_GUIDE.md](../USAGE_GUIDE.md)
- [README.md](../README.md)

---

**文档结束**

