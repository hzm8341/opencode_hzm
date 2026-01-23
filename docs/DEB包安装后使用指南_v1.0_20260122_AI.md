# OpenCode DEB 包安装后使用指南 v1.0

**生成日期**: 2026-01-22  
**AI模型**: Claude-4  
**文档类型**: 使用指南

---

## 📦 安装步骤

### 1. 安装 DEB 包

```bash
# 安装 DEB 包
sudo dpkg -i packages/opencode/dist/opencode_0.0.0-dev-202601221251_amd64.deb

# 如果遇到依赖问题，运行：
sudo apt-get install -f

# 验证安装
opencode --version
```

### 2. 验证安装

```bash
# 检查版本
opencode --version

# 查看帮助信息
opencode --help

# 检查安装位置
which opencode
# 输出: /usr/bin/opencode
```

---

## ⚙️ 基本配置

### 1. 首次配置 - 连接 AI 模型提供商

OpenCode 支持多种 AI 模型提供商，需要先配置 API 密钥。

#### 方式一：通过 TUI 界面配置（推荐）

```bash
# 启动 OpenCode
opencode

# 在 TUI 中输入命令：
/connect

# 选择提供商（如 opencode、anthropic、openai 等）
# 按照提示输入 API 密钥
```

#### 方式二：通过配置文件

创建配置文件 `~/.opencode/opencode.json`:

```json
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
```

#### 方式三：通过环境变量

```bash
# 设置 API 密钥
export ANTHROPIC_API_KEY="your-api-key-here"
export OPENAI_API_KEY="your-api-key-here"
export GOOGLE_API_KEY="your-api-key-here"
```

---

## 🚀 基本使用方法

### 1. 启动 OpenCode

```bash
# 在项目目录中启动
cd /path/to/your/project
opencode
```

### 2. 初始化项目

首次使用时，需要初始化项目：

```bash
# 在 TUI 中输入：
/init
```

这会分析项目结构并创建 `AGENTS.md` 文件。

### 3. 基本命令

在 TUI 界面中可以使用以下命令：

| 命令 | 说明 |
|------|------|
| `/init` | 初始化项目，创建 AGENTS.md |
| `/connect` | 连接 AI 模型提供商 |
| `/help` | 显示帮助信息 |
| `/exit` 或 `Ctrl+C` | 退出 OpenCode |
| `@文件名` | 使用 `@` 键模糊搜索项目文件 |
| `Tab` | 切换 agent（build/plan） |

---

## 💡 常用使用场景

### 1. 询问代码问题

```bash
# 启动 OpenCode
opencode

# 在 TUI 中输入：
@packages/functions/src/api/index.ts
How is authentication handled in this file?
```

### 2. 修改代码

```bash
# 在 TUI 中输入：
Add error handling to the login function
```

### 3. 创建新功能

```bash
# 在 TUI 中输入：
Create a user registration API endpoint
```

### 4. 代码审查

```bash
# 在 TUI 中输入：
Review the authentication module for security issues
```

---

## 🔧 高级功能

### 1. 使用不同的 Agent

OpenCode 内置两个 agent，可以用 `Tab` 键切换：

- **build** - 默认 agent，可以编辑文件和运行命令
- **plan** - 只读 agent，用于分析和规划，不会直接修改文件

```bash
# 使用 plan agent 进行分析
opencode run --agent plan "Analyze the project structure"

# 使用 build agent 进行开发
opencode run --agent build "Implement user authentication"
```

### 2. 命令行模式（非交互式）

```bash
# 直接运行命令，不进入 TUI
opencode run "Add error handling to login function"

# 指定 agent
opencode run --agent plan "Analyze the codebase structure"

# 指定模型
opencode run --model anthropic/claude-sonnet-4-20250514 "Refactor the code"
```

### 3. Web 界面

```bash
# 启动 Web 界面
opencode web

# 在浏览器中打开 http://localhost:3000
```

---

## 📋 工作流程最佳实践

### ⚠️ 计划优先原则

**在开始任何新任务前，必须先使用 `plan` agent 制定详细计划，然后再使用 `build` agent 实施。**

### 完整工作流程示例

```bash
# === 阶段 1: 规划
# 使用 plan agent 创建计划
opencode run --agent plan \
  "Create detailed plan: Implement user authentication system. \
  Save to docs/auth_plan_v1.0_$(date +%Y%m%d)_AI.md"

# === 阶段 2: 审查计划
cat docs/auth_plan_v1.0_*.md

# === 阶段 3: 实施
# 使用 build agent 根据计划实施
opencode run --agent build \
  "Implement Phase 1 according to docs/auth_plan_v1.0_date_AI.md"

# === 阶段 4: 测试和修复
opencode run --agent build \
  "Run tests and fix any compilation errors"
```

---

## 🔌 插件系统

### Oh My OpenCode 插件

增强 OpenCode 功能的插件系统：

```bash
# 安装插件
bunx oh-my-opencode install

# 使用超工作模式
opencode run "ultrawork: Refactor the entire codebase"

# 使用专业 agent
opencode run "@oracle Analyze the project architecture"
opencode run "@librarian Find React Hooks best practices"
```

---

## 🛠️ Skills 系统

OpenCode 支持多种技能（Skills），可以自动发现和使用：

### 文档处理技能

```bash
# PDF 处理
opencode run "Extract text from document.pdf"

# DOCX 处理
opencode run "Create a Word document with the project summary"

# PPTX 处理
opencode run "Create a presentation about the project"
```

### 设计技能

```bash
# 前端设计
opencode run "Create a responsive dashboard component"

# Canvas 设计
opencode run "Create a logo design"
```

---

## 📚 常用命令参考

### 查看版本和帮助

```bash
opencode --version          # 查看版本
opencode --help             # 查看帮助
opencode completion         # 生成 shell 补全脚本
```

### 会话管理

```bash
opencode session list       # 列出所有会话
opencode session resume    # 恢复会话
```

### 模型管理

```bash
opencode models list        # 列出可用模型
opencode models test       # 测试模型连接
```

### 统计信息

```bash
opencode stats              # 查看使用统计
```

---

## 🐛 常见问题

### 1. 命令未找到

```bash
# 检查是否在 PATH 中
which opencode

# 如果未找到，检查安装
dpkg -l | grep opencode

# 重新加载 shell 配置
source ~/.bashrc
```

### 2. API 密钥未配置

```bash
# 检查配置文件
cat ~/.opencode/opencode.json

# 或通过 TUI 配置
opencode
/connect
```

### 3. 权限问题

```bash
# 确保可执行文件有执行权限
ls -l /usr/bin/opencode

# 如果没有权限，重新安装
sudo dpkg -i opencode_*.deb
```

### 4. 依赖问题

```bash
# 修复依赖
sudo apt-get install -f

# 检查依赖
dpkg -I opencode_*.deb
```

---

## 📖 更多资源

- **官方文档**: https://opencode.ai/docs
- **使用指南**: [USAGE_GUIDE.md](../USAGE_GUIDE.md)
- **项目 README**: [README.md](../README.md)
- **GitHub**: https://github.com/anomalyco/opencode

---

## 🔄 卸载

如果需要卸载 OpenCode：

```bash
# 卸载包
sudo dpkg -r opencode

# 完全卸载（包括配置文件）
sudo dpkg -P opencode

# 手动删除配置文件（可选）
rm -rf ~/.opencode
```

---

## 📝 示例：完整使用流程

```bash
# 1. 安装
sudo dpkg -i opencode_0.0.0-dev-202601221251_amd64.deb

# 2. 验证
opencode --version

# 3. 进入项目目录
cd /path/to/project

# 4. 启动 OpenCode
opencode

# 5. 在 TUI 中：
#    - 输入 /connect 配置 API 密钥
#    - 输入 /init 初始化项目
#    - 开始使用！

# 或者使用命令行模式：
opencode run "Help me understand this codebase"
```

---

**文档结束**

