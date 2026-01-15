# Oh My OpenCode 配置落地计划 / Oh My OpenCode Configuration Implementation Plan

**版本 / Version**: v3.0  
**日期 / Date**: 2026-01-25  
**作者 / Author**: AI Generated  
**模型 / Model**: Claude-4  
**整合说明 / Integration Note**: v3.0版本移除了Antigravity和Claude Code相关内容，改为使用官方API和官方支持的模型，规避风险

---

> ⚠️ **重要安全提示 / Important Security Notice**
> 
> **使用官方API / Using Official APIs**:
> - ✅ **本配置计划仅使用官方API和官方支持的模型**
> - ✅ **使用Anthropic、OpenAI、Google等官方API密钥**
> - ✅ **遵循各服务提供商的服务条款**
> 
> **第三方插件说明 / Third-Party Plugin Notice**:
> - ⚠️ `oh-my-opencode`是社区插件，非官方维护
> - ⚠️ 插件可能存在安全漏洞、兼容性问题或维护者弃坑风险
> - ⚠️ 使用前请仔细评估风险，建议审查插件源码（如果可能）
> 
> **安全建议 / Security Recommendations**:
> - ✅ 使用环境变量存储API密钥，不要硬编码在配置文件中
> - ✅ 定期备份配置和认证令牌
> - ✅ 监控API使用情况，设置合理的使用限额
> - ✅ 定期轮换API密钥

---

## 目录 / Table of Contents

1. [概述 / Overview](#概述--overview)
2. [环境准备 / Environment Preparation](#环境准备--environment-preparation)
3. [安装步骤 / Installation Steps](#安装步骤--installation-steps)
4. [配置详解 / Configuration Details](#配置详解--configuration-details)
5. [认证流程 / Authentication Process](#认证流程--authentication-process)
6. [配置验证 / Configuration Verification](#配置验证--configuration-verification)
7. [验证测试 / Verification & Testing](#验证测试--verification--testing)
8. [故障排查 / Troubleshooting](#故障排查--troubleshooting)
9. [安全最佳实践 / Security Best Practices](#安全最佳实践--security-best-practices)
10. [安全提示 / Security Warnings](#安全提示--security-warnings)
11. [兼容性矩阵 / Compatibility Matrix](#兼容性矩阵--compatibility-matrix)

---

## 概述 / Overview

### 目标 / Objectives

本文档旨在帮助您配置以下组件的完整集成：

**English**: This document aims to help you configure the complete integration of the following components:

1. **OpenCode** - 开源的终端AI编程Agent / Open source terminal AI coding agent
2. **Oh My OpenCode** - 增强框架，提供专业化Agent团队协作 / Enhanced framework providing specialized agent team collaboration
3. **官方API提供商** - Anthropic、OpenAI、Google等官方API / Official API providers: Anthropic, OpenAI, Google, etc.

### 核心功能 / Core Features

- **Sisyphus Agent**: 永不放弃的Agent，自动重试和修复 / Never-give-up agent with auto-retry and fix
- **专业化Agent团队**: Oracle、Librarian、Frontend Engineer等 / Specialized agent team: Oracle, Librarian, Frontend Engineer, etc.
- **官方模型支持**: 使用Anthropic Claude、OpenAI GPT、Google Gemini等官方模型 / Official model support: Anthropic Claude, OpenAI GPT, Google Gemini, etc.
- **OpenCode Zen**: 使用OpenCode团队提供的精选模型服务（包括免费模型） / Use OpenCode Zen curated model service (including free models)

---

## 环境准备 / Environment Preparation

### 系统要求 / System Requirements

| 项目 / Item | 要求 / Requirement |
|------------|-------------------|
| 操作系统 / OS | macOS 10.15+, Ubuntu 20.04+, 或其他现代Linux发行版 / macOS 10.15+, Ubuntu 20.04+, or other modern Linux distributions |
| 内存 / RAM | 建议 ≥ 8GB / Recommended ≥ 8GB |
| 网络 / Network | 可访问互联网（用于API调用）/ Internet access (for API calls) |
| Node.js/Bun | Bun 1.0+ 或 Node.js 18+ / Bun 1.0+ or Node.js 18+ |

### 必需工具 / Required Tools

1. **OpenCode CLI** - 必须已安装 / Must be installed
2. **Bun** - oh-my-opencode安装脚本需要 / Required by oh-my-opencode installer
3. **Git** - 用于克隆和版本控制 / For cloning and version control
4. **curl** - 用于下载安装脚本 / For downloading install scripts

### 账户准备 / Account Preparation

需要准备的API密钥 / API Keys needed:

- ✅ **Anthropic API密钥**（如果使用Claude模型）/ **Anthropic API key** (if using Claude models)
  - 获取地址: https://console.anthropic.com/
  - 支持模型: Claude Sonnet 4.5, Claude Opus 4.5, Claude Haiku 4.5等
  
- ✅ **OpenAI API密钥**（如果使用GPT模型）/ **OpenAI API key** (if using GPT models)
  - 获取地址: https://platform.openai.com/api-keys
  - 支持模型: GPT-5.2, GPT-5.1, GPT-4等
  
- ✅ **Google API密钥**（如果使用Gemini模型）/ **Google API key** (if using Gemini models)
  - 获取地址: https://makersuite.google.com/app/apikey
  - 支持模型: Gemini 3 Pro, Gemini 3 Flash等

- ✅ **OpenCode Zen**（推荐，包含免费模型）/ **OpenCode Zen** (recommended, includes free models)
  - 无需API密钥，直接使用
  - 免费模型: `opencode/big-pickle`等
  - 付费模型: 需要OpenCode Zen订阅

---

## 安装步骤 / Installation Steps

### 步骤1: 安装OpenCode / Step 1: Install OpenCode

如果尚未安装OpenCode，请执行以下命令：

**English**: If OpenCode is not installed, execute the following command:

```bash
# 官方安装脚本 / Official install script
curl -fsSL https://opencode.ai/install | bash

# 或使用包管理器 / Or use package manager
npm i -g opencode-ai@latest
# 或 / or
bun add -g opencode-ai@latest
```

验证安装 / Verify installation:

```bash
opencode --version
```

### 步骤2: 安装Bun / Step 2: Install Bun

oh-my-opencode需要Bun来运行安装脚本：

**English**: oh-my-opencode requires Bun to run the install script:

```bash
# 官方安装方法 / Official installation method
curl -fsSL https://bun.sh/install | bash

# 或使用包管理器 / Or use package manager
# macOS
brew install bun

# Ubuntu/Debian
curl -fsSL https://bun.sh/install | bash
```

验证安装 / Verify installation:

```bash
bun --version
```

**注意 / Note**: 如果Bun通过snap安装可能导致问题，建议使用官方安装脚本。  
**Note**: If Bun is installed via snap, it may cause issues. Use the official install script instead.

### 步骤3: 安装oh-my-opencode / Step 3: Install oh-my-opencode

执行安装命令：

**English**: Execute the install command:

```bash
# 使用Bun / Using Bun
bunx oh-my-opencode install

# 如果bunx不可用，使用npx / If bunx is unavailable, use npx
npx oh-my-opencode install
```

安装过程中会询问以下问题：

**English**: During installation, you will be asked:

1. **Claude API密钥** - 是否配置Anthropic API密钥 / Do you want to configure Anthropic API key?
2. **OpenAI API密钥** - 是否配置OpenAI API密钥 / Do you want to configure OpenAI API key?
3. **Google API密钥** - 是否配置Google API密钥 / Do you want to configure Google API key?

根据实际情况回答即可。  
Answer according to your actual situation.

### 步骤4: 配置OpenCode插件 / Step 4: Configure OpenCode Plugins

编辑OpenCode配置文件，添加插件：

**English**: Edit OpenCode config file to add the plugin:

**配置文件位置 / Config file location**:
- Linux/macOS: `~/.config/opencode/opencode.json`
- Windows: `%APPDATA%\opencode\opencode.json`
- 项目配置: `.opencode/opencode.json` 或项目根目录的 `opencode.json` / Project config: `.opencode/opencode.json` or `opencode.json` in project root

在`plugin`数组中添加：

**English**: Add to the `plugin` array:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "oh-my-opencode"
  ]
}
```

**注意 / Note**: 
- 本配置仅使用`oh-my-opencode`插件，不使用Antigravity相关插件 / This configuration only uses `oh-my-opencode` plugin, not Antigravity-related plugins
- 所有模型通过官方API访问 / All models are accessed through official APIs

---

## 配置详解 / Configuration Details

### 配置格式验证说明 / Configuration Format Validation

在开始配置之前，了解以下配置格式验证结果：

**English**: Before starting configuration, understand the following configuration format validation results:

#### ✅ 已验证正确的配置项 / Verified Correct Configuration Items

根据OpenCode源码验证（`packages/opencode/src/config/config.ts`）：

**English**: Verified based on OpenCode source code (`packages/opencode/src/config/config.ts`):

| 配置项 | 文档格式 | OpenCode规范 | 状态 |
|--------|---------|-------------|------|
| `plugin` | `string[]` | `z.string().array()` | ✅ 正确 |
| `provider` | `Record<string, Provider>` | `z.record(z.string(), Provider)` | ✅ 正确 |
| `provider.models` | `Record<string, Model>` | `z.record(z.string(), Model)` | ✅ 正确 |
| `agent.model` | `string` (格式: `provider/model-id`) | `z.string()` | ✅ 正确 |
| 配置文件路径 | `~/.config/opencode/opencode.json` | 官方路径 | ✅ 正确 |

#### ⚠️ 需要验证的配置项 / Items Requiring Verification

以下配置项需要插件支持或实际测试验证：

**English**: The following configuration items require plugin support or actual testing:

| 配置项 | 文档格式 | 问题 | 状态 |
|--------|---------|------|------|
| `oh-my-opencode.json` | 独立配置文件 | 是否为OpenCode原生支持？ | ⚠️ 需验证 |
| `thinkingConfig` | `{ thinkingBudget: number }` | 是否为OpenCode原生支持？ | ⚠️ 需验证 |
| `agents` (在oh-my-opencode.json中) | `Record<string, AgentConfig>` | 与OpenCode原生`agent`字段的关系？ | ⚠️ 需验证 |

**注意 / Note**: 本配置计划不使用Antigravity相关插件和配置，所有模型通过官方API访问。  
**Note**: This configuration plan does not use Antigravity-related plugins and configurations. All models are accessed through official APIs.

**已知限制 / Known Limitations**:

1. **`oh-my-opencode.json`独立配置文件**:
   - OpenCode原生配置使用`opencode.json`中的`agent`字段
   - `oh-my-opencode.json`可能是插件特定的配置文件
   - 建议同时配置`opencode.json`中的`agent`字段作为备选

2. **Agent配置优先级**:
   - 如果同时存在`opencode.json`中的`agent`配置和`oh-my-opencode.json`中的`agents`配置
   - 需要验证哪个配置优先级更高（建议查阅插件文档）

3. **API密钥管理**:
   - 必须通过环境变量或OpenCode认证命令设置API密钥
   - 不要在配置文件中硬编码API密钥
   - 定期轮换API密钥，确保安全

### 配置文件1: opencode.json

完整的`opencode.json`配置示例：

**English**: Complete `opencode.json` configuration example:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  
  // 插件列表 / Plugin list
  "plugin": [
    "oh-my-opencode"
  ],
  
  // 默认模型（推荐使用OpenCode Zen免费模型）/ Default model (recommended: OpenCode Zen free model)
  "model": "opencode/big-pickle",
  
  // Provider配置（可选，如果使用自定义Provider）/ Provider configuration (optional, if using custom providers)
  "provider": {
    // Anthropic配置示例 / Anthropic configuration example
    "anthropic": {
      "options": {
        // API密钥通过环境变量设置 / API key set via environment variable
        // export ANTHROPIC_API_KEY="sk-ant-xxx"
      }
    },
    
    // OpenAI配置示例 / OpenAI configuration example
    "openai": {
      "options": {
        // API密钥通过环境变量设置 / API key set via environment variable
        // export OPENAI_API_KEY="sk-xxx"
      }
    },
    
    // Google配置示例 / Google configuration example
    "google": {
      "options": {
        // API密钥通过环境变量设置 / API key set via environment variable
        // export GOOGLE_GENERATIVE_AI_API_KEY="xxx"
      }
    }
  },
  
  // Agent配置 / Agent configuration
  "agent": {
    "frontend-ui-ux-engineer": {
      "model": "opencode/gpt-5.1-codex",
      "description": "专业的前端UI/UX工程师 / Professional frontend UI/UX engineer"
    },
    "document-writer": {
      "model": "opencode/big-pickle",
      "description": "文档编写者 / Document writer"
    }
  },
  
  // 其他配置（根据项目需要） / Other configurations (as needed)
  "instructions": ["STYLE_GUIDE.md"],
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    }
  },
  "tools": {
    "github-triage": false,
    "github-pr-search": false
  }
}
```

### 配置文件2: oh-my-opencode.json

创建或编辑 `~/.config/opencode/oh-my-opencode.json` 或项目中的 `.opencode/oh-my-opencode.json`：

**English**: Create or edit `~/.config/opencode/oh-my-opencode.json` or `.opencode/oh-my-opencode.json` in project:

```jsonc
{
  // Agent模型覆盖配置 / Agent model override configuration
  "agents": {
    // 前端UI/UX工程师使用GPT 5.1 Codex / Frontend UI/UX engineer uses GPT 5.1 Codex
    "frontend-ui-ux-engineer": {
      "model": "opencode/gpt-5.1-codex"
    },
    
    // 文档编写者使用免费模型 / Document writer uses free model
    "document-writer": {
      "model": "opencode/big-pickle"
    },
    
    // 多模态查看器使用Gemini 3 Pro / Multimodal looker uses Gemini 3 Pro
    "multimodal-looker": {
      "model": "google/gemini-3-pro"
    },
    
    // Oracle使用Claude Sonnet 4.5 / Oracle uses Claude Sonnet 4.5
    "oracle": {
      "model": "anthropic/claude-sonnet-4-20250514"
    },
    
    // Librarian使用免费模型 / Librarian uses free model
    "librarian": {
      "model": "opencode/big-pickle"
    }
  },
  
  // Sisyphus配置（可选） / Sisyphus configuration (optional)
  "sisyphus": {
    // 启用ultrawork模式 / Enable ultrawork mode
    "ultrawork": true,
    
    // 最大重试次数 / Max retry attempts
    "max_retries": 10,
    
    // 自动修复错误 / Auto-fix errors
    "auto_fix": true,
    
    // 上下文压缩阈值 / Context compression threshold
    "context_compress_threshold": 100000
  }
}
```

### 配置文件3: 环境变量配置（推荐）

使用环境变量存储API密钥，更安全：

**English**: Use environment variables to store API keys, more secure:

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加 / Add to ~/.bashrc or ~/.zshrc

# Anthropic API密钥 / Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-xxx"

# OpenAI API密钥 / OpenAI API key
export OPENAI_API_KEY="sk-xxx"

# Google API密钥 / Google API key
export GOOGLE_GENERATIVE_AI_API_KEY="xxx"

# 重新加载配置 / Reload configuration
source ~/.bashrc  # 或 source ~/.zshrc
```

或者使用`.env`文件（不要提交到版本控制）：

**English**: Or use `.env` file (do not commit to version control):

```bash
# .env 文件
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
GOOGLE_GENERATIVE_AI_API_KEY=xxx
```

然后在配置文件中引用：

**English**: Then reference in config file:

```jsonc
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "${ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

---

## 认证流程 / Authentication Process

### 步骤1: 配置Anthropic API密钥

如果使用Claude模型，需要配置API密钥：

**English**: If using Claude models, configure API key:

**方法1: 使用环境变量（推荐）** / **Method 1: Use environment variable (recommended)**:

```bash
export ANTHROPIC_API_KEY="sk-ant-xxx"
```

**方法2: 使用OpenCode认证命令** / **Method 2: Use OpenCode auth command**:

```bash
opencode auth login
```

选择 **Anthropic** → 输入API密钥  
**English**: Select **Anthropic** → Enter API key

### 步骤2: 配置OpenAI API密钥

如果使用GPT模型，需要配置API密钥：

**English**: If using GPT models, configure API key:

```bash
export OPENAI_API_KEY="sk-xxx"
```

或使用认证命令：

**English**: Or use auth command:

```bash
opencode auth login
# 选择 OpenAI / Select OpenAI
```

### 步骤3: 配置Google API密钥

如果使用Gemini模型，需要配置API密钥：

**English**: If using Gemini models, configure API key:

```bash
export GOOGLE_GENERATIVE_AI_API_KEY="xxx"
```

或使用认证命令：

**English**: Or use auth command:

```bash
opencode auth login
# 选择 Google / Select Google
```

### 步骤4: 使用OpenCode Zen（无需API密钥）

OpenCode Zen提供免费和付费模型，无需配置API密钥：

**English**: OpenCode Zen provides free and paid models, no API key required:

```json
{
  "model": "opencode/big-pickle"  // 免费模型 / Free model
}
```

**免费模型列表** / **Free Models**:
- `opencode/big-pickle` - 默认免费模型 / Default free model
- `opencode/grok-code-fast-1` - Grok Code Fast
- `opencode/minimax-m2.1` - MiniMax M2.1
- `opencode/glm-4.7` - GLM 4.7
- `opencode/gpt-5-nano` - GPT 5 Nano

---

## 配置验证 / Configuration Verification

### 验证插件是否加载 / Verify Plugins are Loaded

在完成配置后，首先验证插件是否正确加载：

**English**: After completing configuration, first verify that plugins are loaded correctly:

```bash
# 检查插件列表 / Check plugin list
opencode --list-plugins

# 应该看到以下插件 / Should see the following plugins:
# - oh-my-opencode
```

如果插件未列出，检查：
- 配置文件语法是否正确
- 插件版本是否正确
- OpenCode版本是否 ≥ 1.0.150

### 验证模型是否可用 / Verify Models are Available

检查模型是否在模型列表中：

**English**: Check if models are in the model list:

```bash
# 列出所有模型 / List all models
opencode --list-models

# 过滤特定Provider的模型 / Filter models by provider
opencode --list-models | grep opencode
opencode --list-models | grep anthropic
opencode --list-models | grep google

# 应该看到类似以下输出 / Should see output like:
# opencode/big-pickle
# opencode/gpt-5.1-codex
# anthropic/claude-sonnet-4-20250514
# google/gemini-3-pro
```

如果模型未列出，检查：
- Provider配置是否正确
- 模型ID是否正确
- 插件是否正确加载

### 验证Agent配置 / Verify Agent Configuration

测试Agent是否可用：

**English**: Test if agents are available:

```bash
# 测试前端工程师Agent / Test frontend engineer agent
opencode run -p "@frontend-ui-ux-engineer 测试消息"

# 测试文档编写Agent / Test document writer agent
opencode run -p "@document-writer 测试消息"
```

如果Agent不可用，检查：
- `oh-my-opencode.json`配置是否正确
- Agent名称是否正确
- 模型ID是否正确

### 验证Provider配置 / Verify Provider Configuration

检查Provider配置是否正确加载：

**English**: Check if provider configuration is loaded correctly:

```bash
# 显示完整配置 / Show full configuration
opencode --config-show

# 只显示Google Provider配置 / Show only Google provider config
opencode --config-show | jq '.provider.google'

# 检查模型配置 / Check model configuration
opencode --config-show | jq '.provider.google.models'
```

### 验证认证状态 / Verify Authentication Status

检查认证是否成功：

**English**: Check if authentication is successful:

```bash
# 测试模型调用 / Test model call
opencode run -m opencode/big-pickle -p "Hello, test message"

# 如果成功，说明认证和配置都正确 / If successful, authentication and configuration are correct
```

### 配置验证检查清单 / Configuration Verification Checklist

使用以下检查清单验证配置：

**English**: Use the following checklist to verify configuration:

- [ ] OpenCode版本 ≥ 1.0.150
- [ ] Bun已正确安装
- [ ] 插件已加载（`opencode --list-plugins`）
- [ ] 模型ID存在（`opencode --list-models`）
- [ ] Agent配置生效（测试Agent命令）
- [ ] Provider配置正确（`opencode --config-show`）
- [ ] 认证成功（测试模型调用）
- [ ] 配置文件权限正确（`chmod 644 ~/.config/opencode/opencode.json`）

### 常见配置错误 / Common Configuration Errors

#### 错误1: 插件未加载

**症状 / Symptom**: `opencode --list-plugins` 中看不到插件

**解决方案 / Solution**:
1. 检查配置文件语法：`jq . ~/.config/opencode/opencode.json`
2. 确认插件名称正确（区分大小写）
3. 检查插件版本号是否正确
4. 重启OpenCode

#### 错误2: 模型未列出

**症状 / Symptom**: `opencode --list-models` 中看不到期望的模型

**解决方案 / Solution**:
1. 检查API密钥是否正确配置（环境变量或认证）
2. 确认模型ID格式正确（`provider/model-id`，如`opencode/big-pickle`）
3. 检查Provider配置是否正确
4. 查看日志：`~/.config/opencode/logs/`

#### 错误3: Agent不可用

**症状 / Symptom**: `@agent-name` 命令不工作

**解决方案 / Solution**:
1. 检查`oh-my-opencode.json`配置
2. 确认Agent名称正确
3. 检查模型ID格式（`provider/model-id`）
4. 验证`oh-my-opencode`插件已加载

---

## 验证测试 / Verification & Testing

### 测试1: 检查OpenCode版本

```bash
opencode --version
```

确保版本 ≥ 1.0.150（oh-my-opencode要求）  
**English**: Ensure version ≥ 1.0.150 (required by oh-my-opencode)

### 测试2: 检查插件是否加载

```bash
opencode run -m opencode/big-pickle -p "Hello, test message"
```

如果成功，说明插件和模型配置正确。  
**English**: If successful, the plugin and model configuration is correct.

### 测试3: 测试Sisyphus Agent

使用ultrawork模式测试：

**English**: Test using ultrawork mode:

```bash
opencode run -p "ultrawork: 帮我创建一个简单的TypeScript REST API"
```

观察Agent是否：
- 自动重试失败的任务 / Automatically retries failed tasks
- 自动修复错误 / Automatically fixes errors
- 持续工作直到完成 / Continues working until completion

### 测试4: 测试专业化Agent

测试不同的Agent：

**English**: Test different agents:

```bash
# 测试前端工程师Agent / Test frontend engineer agent
opencode run -p "@frontend-ui-ux-engineer 创建一个React组件"

# 测试文档编写Agent / Test document writer agent
opencode run -p "@document-writer 为这个项目写README"
```

### 测试5: 验证多账号负载均衡

如果配置了多个Google账号，观察日志中的账号切换：

**English**: If multiple Google accounts are configured, observe account switching in logs:

```bash
# 运行多个任务，测试模型稳定性 / Run multiple tasks, test model stability
opencode run -m opencode/big-pickle -p "Test message 1"
opencode run -m opencode/big-pickle -p "Test message 2"
```

---

## 故障排查 / Troubleshooting

### 问题1: Bun安装失败

**症状 / Symptom**: `bunx` 命令不可用  
**English**: `bunx` command unavailable

**解决方案 / Solution**:
```bash
# 使用官方安装脚本重新安装Bun / Reinstall Bun using official script
curl -fsSL https://bun.sh/install | bash

# 如果通过snap安装，卸载后重新安装 / If installed via snap, uninstall and reinstall
sudo snap remove bun
curl -fsSL https://bun.sh/install | bash
```

### 问题2: 插件未加载

**症状 / Symptom**: 模型列表中看不到期望的模型  
**English**: Expected models not visible in model list

**解决方案 / Solution**:
1. 检查配置文件语法是否正确 / Check if config file syntax is correct
2. 确认插件版本是否正确 / Verify plugin version is correct
3. 重启OpenCode / Restart OpenCode
4. 检查日志: `~/.config/opencode/logs/` / Check logs: `~/.config/opencode/logs/`

### 问题3: 认证失败

**症状 / Symptom**: API密钥认证失败  
**English**: API key authentication fails

**解决方案 / Solution**:
1. 检查API密钥是否正确设置（环境变量或配置文件）/ Check if API key is correctly set (environment variable or config file)
2. 确认API密钥有效且未过期 / Verify API key is valid and not expired
3. 检查API密钥权限是否足够 / Check if API key has sufficient permissions
4. 查看详细错误日志：`opencode run --debug` / View detailed error logs: `opencode run --debug`

### 问题4: 模型调用失败

**症状 / Symptom**: 模型调用返回错误或超时  
**English**: Model calls return errors or timeout

**解决方案 / Solution**:
1. 检查API配额是否用完 / Check if API quota is exhausted
2. 检查API密钥余额是否充足 / Check if API key has sufficient balance
3. 检查网络连接 / Check network connection
4. 查看详细日志: `opencode run --debug` / View detailed logs: `opencode run --debug`
5. 考虑使用OpenCode Zen免费模型作为备选 / Consider using OpenCode Zen free models as fallback

### 问题5: Sisyphus Agent不工作

**症状 / Symptom**: ultrawork模式没有自动重试  
**English**: ultrawork mode doesn't auto-retry

**解决方案 / Solution**:
1. 检查`oh-my-opencode.json`中`sisyphus.ultrawork`是否为`true` / Check if `sisyphus.ultrawork` is `true` in `oh-my-opencode.json`
2. 确认使用了正确的命令格式 / Ensure correct command format
3. 查看oh-my-opencode日志 / Check oh-my-opencode logs

### 问题6: 配置冲突

**症状 / Symptom**: 配置不生效或行为异常  
**English**: Configuration not working or unexpected behavior

**解决方案 / Solution**:
1. 检查配置文件加载顺序：
   - 全局配置: `~/.config/opencode/opencode.json`
   - 项目配置: `.opencode/opencode.json` 或项目根目录的 `opencode.json`
   - 项目配置会覆盖全局配置的冲突项
2. 检查配置合并规则：
   - `plugin`数组会合并
   - `provider`对象会深度合并
   - `agent`对象会覆盖
3. 使用`opencode --config-show`查看最终合并后的配置
4. 检查是否有多个配置文件同时存在导致冲突

### 问题7: 认证令牌过期

**症状 / Symptom**: 模型调用失败，提示认证错误  
**English**: Model calls fail with authentication errors

**解决方案 / Solution**:
1. 重新运行认证：
   ```bash
   opencode auth login
   ```
2. 选择对应的Provider（Anthropic、OpenAI或Google）
3. 输入有效的API密钥
4. 验证API密钥是否有效：`opencode --list-models`
5. 查看认证日志：`~/.config/opencode/logs/auth.log`

### 问题8: 模型调用超时

**症状 / Symptom**: 模型调用长时间无响应或超时  
**English**: Model calls timeout or take too long

**解决方案 / Solution**:
1. 检查网络连接
2. 增加超时时间（在Provider配置中）：
   ```json
   {
     "provider": {
       "google": {
         "options": {
           "timeout": 600000  // 10分钟 / 10 minutes
         }
       }
     }
   }
   ```
3. 检查是否有防火墙或代理阻止连接
4. 尝试使用更快的模型（如`opencode/big-pickle`或`opencode/grok-code-fast-1`）

---

## 安全最佳实践 / Security Best Practices

### 1. 密钥管理 / Key Management

#### 使用环境变量 / Use Environment Variables

**不要**在配置文件中硬编码API密钥：

**English**: **Do NOT** hardcode API keys in configuration files:

```bash
# ❌ 错误做法 / Wrong approach
# opencode.json
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "sk-ant-xxx"  // ❌ 不要这样做 / Don't do this
      }
    }
  }
}

# ✅ 正确做法 / Correct approach
# 使用环境变量 / Use environment variables
export ANTHROPIC_API_KEY="sk-ant-xxx"

# 或在配置文件中引用环境变量 / Or reference environment variables in config
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "${ANTHROPIC_API_KEY}"  // ✅ 使用环境变量 / Use env var
      }
    }
  }
}
```

#### 密钥轮换 / Key Rotation

- 定期轮换API密钥（建议每3-6个月）
- 如果密钥泄露，立即撤销并生成新密钥
- 使用不同的密钥用于不同环境（开发、测试、生产）

### 2. 文件权限设置 / File Permissions

设置正确的文件权限，防止未授权访问：

**English**: Set correct file permissions to prevent unauthorized access:

```bash
# 配置文件权限（可读，但不要包含敏感信息）/ Config file permissions (readable, but no sensitive info)
chmod 644 ~/.config/opencode/opencode.json
chmod 644 ~/.config/opencode/oh-my-opencode.json

# 认证令牌文件权限（仅所有者可读写）/ Auth token file permissions (owner read/write only)
chmod 600 ~/.config/opencode/auth.json

# 日志文件权限 / Log file permissions
chmod 644 ~/.config/opencode/logs/*.log
```

### 3. 配置文件安全 / Configuration File Security

#### 不要提交敏感信息到版本控制 / Don't Commit Sensitive Info to Version Control

创建`.gitignore`文件：

**English**: Create `.gitignore` file:

```gitignore
# OpenCode配置文件（如果包含敏感信息）/ OpenCode config files (if containing sensitive info)
.opencode/auth.json
.opencode/opencode.json
~/.config/opencode/auth.json

# 环境变量文件 / Environment variable files
.env
.env.local
.env.*.local
```

#### 使用配置模板 / Use Configuration Templates

在版本控制中只提交配置模板，不包含实际密钥：

**English**: Only commit configuration templates to version control, without actual keys:

```json
// opencode.json.template
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "${ANTHROPIC_API_KEY}"  // 使用环境变量 / Use env var
      }
    }
  }
}
```

### 4. 审计和监控 / Auditing and Monitoring

#### 定期检查日志 / Regularly Check Logs

```bash
# 查看最近的日志 / View recent logs
tail -n 100 ~/.config/opencode/logs/opencode.log

# 检查异常API调用 / Check for unusual API calls
grep -i "error\|failed\|unauthorized" ~/.config/opencode/logs/*.log

# 监控Token使用量 / Monitor token usage
grep -i "tokens" ~/.config/opencode/logs/*.log | tail -20
```

#### 设置使用限额 / Set Usage Limits

在配置中设置合理的超时和重试限制：

**English**: Set reasonable timeout and retry limits in configuration:

```json
{
  "provider": {
    "google": {
      "options": {
        "timeout": 300000,  // 5分钟超时 / 5 minute timeout
        "maxRetries": 3     // 最大重试3次 / Max 3 retries
      }
    }
  }
}
```

### 5. 备份和恢复 / Backup and Recovery

#### 定期备份配置 / Regularly Backup Configuration

```bash
# 备份配置文件 / Backup config files
mkdir -p ~/opencode-backup
cp -r ~/.config/opencode ~/opencode-backup/$(date +%Y%m%d)

# 或使用版本控制 / Or use version control
git init ~/opencode-backup
cd ~/opencode-backup
git add ~/.config/opencode/opencode.json
git commit -m "Backup OpenCode config"
```

#### 恢复配置 / Restore Configuration

```bash
# 从备份恢复 / Restore from backup
cp ~/opencode-backup/YYYYMMDD/opencode.json ~/.config/opencode/
```

### 6. 网络安全 / Network Security

#### 使用HTTPS / Use HTTPS

确保所有API调用都使用HTTPS：

**English**: Ensure all API calls use HTTPS:

```json
{
  "provider": {
    "google": {
      "options": {
        "baseURL": "https://generativelanguage.googleapis.com"  // ✅ 使用HTTPS / Use HTTPS
      }
    }
  }
}
```

#### 代理配置 / Proxy Configuration

如果需要通过代理访问，配置代理设置：

**English**: If accessing through a proxy, configure proxy settings:

```bash
# 设置代理环境变量 / Set proxy environment variables
export HTTP_PROXY="http://proxy.example.com:8080"
export HTTPS_PROXY="http://proxy.example.com:8080"
```

### 7. 多账号管理 / Multi-Account Management

#### 账号隔离 / Account Isolation

- 使用不同的Google账号用于不同项目
- 不要共享认证令牌
- 定期检查账号使用情况

#### 负载均衡 / Load Balancing

配置多个账号时，注意：
- 不要过度使用单个账号
- 监控每个账号的配额使用情况
- 如果某个账号频繁限速，减少使用频率

---

## 安全提示 / Security Warnings

### ⚠️ 重要警告 / Important Warnings

1. **使用官方API** / **Use Official APIs**
   - 本配置仅使用官方API（Anthropic、OpenAI、Google等）/ This configuration only uses official APIs (Anthropic, OpenAI, Google, etc.)
   - 遵循各服务提供商的服务条款 / Follow each service provider's terms of service
   - 使用官方API密钥，不要使用未授权的访问方式 / Use official API keys, do not use unauthorized access methods

2. **凭证安全** / **Credential Security**
   - 不要将API密钥提交到公共仓库 / Do not commit API keys to public repositories
   - 使用环境变量或安全存储 / Use environment variables or secure storage
   - 定期轮换密钥 / Rotate keys regularly

4. **API使用建议** / **API Usage Recommendations**
   - 合理使用API，避免超出配额 / Use APIs reasonably, avoid exceeding quotas
   - 监控API使用量和费用 / Monitor API usage and costs
   - 考虑使用OpenCode Zen免费模型进行开发和测试 / Consider using OpenCode Zen free models for development and testing

---

## 兼容性矩阵 / Compatibility Matrix

### OpenCode版本兼容性 / OpenCode Version Compatibility

| OpenCode版本 | oh-my-opencode | 官方API支持 | 状态 |
|-------------|----------------|------------|------|
| ≥ 1.0.150 | ✅ 支持 | ✅ 支持 | ✅ 推荐 |
| 1.0.100 - 1.0.149 | ⚠️ 部分支持 | ✅ 支持 | ⚠️ 可能有问题 |
| < 1.0.100 | ❌ 不支持 | ✅ 支持 | ⚠️ 部分兼容 |

### 插件版本兼容性 / Plugin Version Compatibility

| 插件 | 推荐版本 | 最低版本 | 最新版本检查 |
|------|---------|---------|------------|
| oh-my-opencode | latest | - | [GitHub Releases](https://github.com/code-yeongyu/oh-my-opencode/releases) |

### 系统环境兼容性 / System Environment Compatibility

| 操作系统 | Bun | Node.js | 状态 |
|---------|-----|---------|------|
| macOS 10.15+ | ✅ 1.0+ | ✅ 18+ | ✅ 完全支持 |
| Ubuntu 20.04+ | ✅ 1.0+ | ✅ 18+ | ✅ 完全支持 |
| Ubuntu 18.04 | ⚠️ 1.0+ | ⚠️ 18+ | ⚠️ 部分支持 |
| Windows 10+ | ✅ 1.0+ | ✅ 18+ | ✅ 完全支持 |
| 其他Linux发行版 | ⚠️ 1.0+ | ⚠️ 18+ | ⚠️ 需要测试 |

### 已知兼容性问题 / Known Compatibility Issues

#### 问题1: Bun通过snap安装

**症状 / Symptom**: `bunx`命令不可用或执行失败

**解决方案 / Solution**: 使用官方安装脚本，不要使用snap：

```bash
# 卸载snap版本 / Uninstall snap version
sudo snap remove bun

# 使用官方安装脚本 / Use official install script
curl -fsSL https://bun.sh/install | bash
```

#### 问题2: OpenCode版本过旧

**症状 / Symptom**: 插件无法加载或功能异常

**解决方案 / Solution**: 更新OpenCode到最新版本：

```bash
# 更新OpenCode / Update OpenCode
npm update -g opencode-ai@latest
# 或 / or
bun update -g opencode-ai@latest
```

#### 问题3: Node.js版本不兼容

**症状 / Symptom**: 安装或运行时出现错误

**解决方案 / Solution**: 使用Node.js 18或更高版本：

```bash
# 检查Node.js版本 / Check Node.js version
node --version  # 应该 >= v18.0.0

# 使用nvm更新Node.js / Update Node.js using nvm
nvm install 18
nvm use 18
```

### 文档验证信息 / Documentation Verification Info

**最后验证日期 / Last Verified Date**: 2026-01-25

**验证环境 / Verification Environment**:
- OpenCode版本: 1.0.150+
- Bun版本: 1.0+
- Node.js版本: 18+
- 操作系统: Ubuntu 22.04, macOS 13+

**已知问题 / Known Issues**:
- `oh-my-opencode.json`独立配置文件需要验证插件是否支持
- 某些高级配置项可能需要插件扩展支持
- 模型ID可能随OpenCode版本更新而变更

**风险评估总结 / Risk Assessment Summary**:

| 风险类型 | 风险等级 | 缓解状态 | 建议 |
|---------|---------|---------|------|
| 配置格式错误 | 🟡 中 | ⚠️ 部分缓解 | 需要验证所有配置项 |
| 插件兼容性 | 🟡 中 | ⚠️ 未缓解 | 需要测试和验证 |
| API密钥泄露 | 🔴 高 | ✅ 已缓解 | 已添加安全最佳实践指南 |
| 第三方插件风险 | 🟡 中 | ✅ 已警告 | 已在文档开头添加警告 |
| API配额超限 | 🟡 中 | ⚠️ 需监控 | 建议设置使用限额和监控 |

**更新日志 / Changelog**:
- 2026-01-25 v3.0: 移除Antigravity和Claude Code相关内容，改为使用官方API和官方支持的模型，规避风险
- 2026-01-25 v2.0: 整合版本文档，合并了可行性评估、实施计划和实施总结的关键信息
- 2026-01-25 v1.0: 初始版本，基于OpenCode 1.0.150+验证

---

## 完整配置示例 / Complete Configuration Examples

### 配置模板 / Configuration Templates

为了帮助您快速开始，我们提供了两个配置模板：

**English**: To help you get started quickly, we provide two configuration templates:

1. **最小化配置模板** / **Minimal Configuration Template**
   - 文件位置: `docs/Oh_My_OpenCode_配置模板_最小化_v3.0_20260125_AI.json`
   - 只包含必需配置项，使用OpenCode Zen免费模型
   - **English**: Contains only essential items, uses OpenCode Zen free model

2. **完整配置模板** / **Complete Configuration Template**
   - 文件位置: `docs/Oh_My_OpenCode_配置模板_完整版_v3.0_20260125_AI.json`
   - 包含所有可选配置项，使用官方API和OpenCode Zen
   - **English**: Contains all optional items, uses official APIs and OpenCode Zen

**使用方法 / Usage**:

```bash
# 复制模板到配置目录 / Copy template to config directory
cp docs/Oh_My_OpenCode_配置模板_最小化_v3.0_20260125_AI.json ~/.config/opencode/opencode.json

# 或使用完整版 / Or use complete version
cp docs/Oh_My_OpenCode_配置模板_完整版_v3.0_20260125_AI.json ~/.config/opencode/opencode.json

# 配置API密钥（如果使用官方API）/ Configure API keys (if using official APIs)
export ANTHROPIC_API_KEY="sk-ant-xxx"  # 如果使用Claude模型 / If using Claude models
export OPENAI_API_KEY="sk-xxx"          # 如果使用GPT模型 / If using GPT models
export GOOGLE_GENERATIVE_AI_API_KEY="xxx"  # 如果使用Gemini模型 / If using Gemini models

# 根据实际情况修改配置 / Modify configuration according to your needs
```

### 全局配置文件位置 / Global Config File Locations

**Linux/macOS**:
- `~/.config/opencode/opencode.json`
- `~/.config/opencode/oh-my-opencode.json`

**Windows**:
- `%APPDATA%\opencode\opencode.json`
- `%APPDATA%\opencode\oh-my-opencode.json`

### 项目配置文件位置 / Project Config File Locations

- `.opencode/opencode.json`
- `.opencode/oh-my-opencode.json`（如果使用oh-my-opencode插件）/ (if using oh-my-opencode plugin)
- 项目根目录的 `opencode.json`

### 配置优先级 / Configuration Priority

配置文件按以下顺序合并（后面的覆盖前面的冲突项）：

**English**: Config files are merged in the following order (later ones override conflicting items):

1. 全局配置 / Global config: `~/.config/opencode/opencode.json`
2. 项目配置 / Project config: `.opencode/opencode.json` 或项目根目录的 `opencode.json`
3. 环境变量 / Environment variables: `OPENCODE_CONFIG`
4. 命令行参数 / Command line arguments

---

## 实际使用场景 / Practical Usage Scenarios

### 场景1: 使用Sisyphus Agent完成复杂任务

Sisyphus Agent的核心特点是"永不放弃"，适合处理需要多次迭代的复杂任务。

**使用ultrawork模式**:

```bash
opencode run -p "ultrawork: 帮我重构这个项目的所有TypeScript文件，统一代码风格，修复所有eslint错误"
```

Sisyphus会：
- 自动分析项目结构
- 逐个文件进行重构
- 遇到错误自动修复
- 持续工作直到所有任务完成
- 如果上下文过长，自动压缩

### 场景2: 使用专业化Agent团队协作

不同的Agent擅长不同的任务，可以组合使用：

```bash
# 1. 先让Oracle（架构师）分析项目结构
opencode run -p "@oracle 分析这个项目的架构，提出改进建议"

# 2. 让Librarian（图书馆员）查找相关文档和实现案例
opencode run -p "@librarian 查找React Hooks的最佳实践和TypeScript类型定义示例"

# 3. 让Frontend Engineer实现前端功能
opencode run -p "@frontend-ui-ux-engineer 基于Oracle的建议，实现新的React组件"

# 4. 让Document Writer编写文档
opencode run -p "@document-writer 为新实现的组件编写完整的API文档"
```

### 场景3: 多模态任务处理

使用multimodal-looker处理包含图片、PDF等文件的任务：

```bash
opencode run -p "@multimodal-looker 分析这个PDF文档中的架构图，并生成对应的代码实现"
```

### 场景4: 大规模代码重构

结合Sisyphus和专业化Agent进行大规模重构：

```bash
opencode run -p "ultrawork: @oracle 分析项目，@frontend-ui-ux-engineer 重构所有组件，@document-writer 更新文档"
```

---

## 最佳实践 / Best Practices

### 1. 模型选择策略

- **简单任务**: 使用 `opencode/big-pickle`（免费）或 `opencode/grok-code-fast-1`，速度快、成本低
- **复杂任务**: 使用 `opencode/gpt-5.1-codex` 或 `anthropic/claude-sonnet-4-20250514`
- **需要深度思考**: 使用 `anthropic/claude-opus-4-20250514` 或 `opencode/gpt-5.2`

### 2. Agent选择指南

| Agent | 适用场景 | 推荐模型 |
|-------|---------|---------|
| Oracle | 架构设计、代码审查、策略制定 | `anthropic/claude-sonnet-4-20250514` 或 `opencode/gpt-5.1-codex` |
| Librarian | 文档查找、代码库分析、实现案例搜索 | `opencode/big-pickle`（免费） |
| Frontend Engineer | UI/UX设计、前端开发 | `opencode/gpt-5.1-codex` 或 `google/gemini-3-pro` |
| Document Writer | 文档编写、README生成 | `opencode/big-pickle`（免费） |
| Multimodal Looker | 图片/PDF分析 | `google/gemini-3-pro` 或 `opencode/gpt-5.1-codex` |

### 3. API使用管理

- 监控API使用量和费用，设置合理的使用限额
- 定期检查API配额使用情况
- 如果某个API频繁限速，考虑使用其他Provider或OpenCode Zen免费模型
- 使用OpenCode Zen免费模型进行开发和测试，节省成本

### 4. 上下文管理

- 大项目使用Sisyphus的自动上下文压缩功能
- 对于超大项目，考虑使用Librarian先分析，再让其他Agent处理具体任务
- 使用项目级别的配置文件，避免全局配置过于复杂

### 5. 错误处理

- 启用Sisyphus的`auto_fix`功能，自动修复常见错误
- 配置合理的`max_retries`，避免无限重试
- 对于持续失败的任务，手动介入检查

---

## 高级配置选项 / Advanced Configuration Options

### 模型选择配置

根据任务复杂度选择合适的模型：

**English**: Choose appropriate models based on task complexity:

```jsonc
{
  // 默认模型（用于一般任务）/ Default model (for general tasks)
  "model": "opencode/big-pickle",
  
  // Agent特定模型配置 / Agent-specific model configuration
  "agent": {
    "plan": {
      "model": "opencode/big-pickle"  // 规划任务使用免费模型 / Planning tasks use free model
    },
    "build": {
      "model": "opencode/gpt-5.1-codex"  // 构建任务使用高性能模型 / Build tasks use high-performance model
    },
    "oracle": {
      "model": "anthropic/claude-sonnet-4-20250514"  // 架构分析使用Claude / Architecture analysis uses Claude
    }
  }
}
```

**模型选择建议 / Model Selection Recommendations**:
- **免费开发**: `opencode/big-pickle`, `opencode/grok-code-fast-1`
- **生产环境**: `opencode/gpt-5.1-codex`, `anthropic/claude-sonnet-4-20250514`
- **高性能需求**: `opencode/gpt-5.2`, `anthropic/claude-opus-4-20250514`

### 自定义Agent配置

可以在`oh-my-opencode.json`中为特定Agent配置更多选项：

```jsonc
{
  "agents": {
    "frontend-ui-ux-engineer": {
      "model": "opencode/gpt-5.1-codex",
      "temperature": 0.7,
      "max_tokens": 8000,
      "description": "专业的前端工程师，专注于React和TypeScript开发 / Professional frontend engineer, focused on React and TypeScript development"
    }
  }
}
```

### 项目特定配置

在项目根目录创建`.opencode/opencode.json`，覆盖全局配置：

```jsonc
{
  "plugin": [
    "oh-my-opencode"
  ],
  "model": "opencode/big-pickle",  // 项目默认模型 / Project default model
  "agents": {
    "frontend-ui-ux-engineer": {
      "model": "opencode/gpt-5.1-codex"
    }
  },
  "instructions": ["./project-specific-instructions.md"]
}
```

---

## 性能优化建议 / Performance Optimization Tips

### 1. 减少Token消耗

- 使用`opencode/big-pickle`等免费模型处理简单任务
- 启用上下文压缩功能
- 使用Librarian先筛选相关信息，再传递给其他Agent
- 合理设置`max_tokens`限制

### 2. 提高响应速度

- 使用快速模型（如`opencode/grok-code-fast-1`）处理不需要深度思考的任务
- 配置合理的超时时间
- 使用OpenCode Zen服务，通常响应更快

### 3. 并发处理

- 可以同时运行多个OpenCode会话，处理不同的任务
- 使用不同的Agent并行处理不同模块

---

## 监控和日志 / Monitoring and Logs

### 查看日志

OpenCode的日志位置：
- Linux/macOS: `~/.config/opencode/logs/`
- Windows: `%APPDATA%\opencode\logs\`

### 启用调试模式

```bash
# 启用详细日志
opencode run --debug -p "your prompt"

# 查看特定Provider的日志
tail -f ~/.config/opencode/logs/opencode.log | grep -i "anthropic\|openai\|google"
```

### 监控账号使用情况

定期检查：
- 账号配额使用量
- 限速频率
- Token消耗趋势

---

## 常见问题FAQ / FAQ

### Q1: 如何知道当前使用的是哪个模型？

运行命令时，OpenCode会在输出中显示使用的模型。也可以在配置中设置默认模型。

### Q2: 如何切换不同的Agent？

使用`@agent-name`语法，例如：
```bash
opencode run -p "@oracle 分析这个代码"
```

### Q3: Sisyphus一直重试怎么办？

检查`max_retries`配置，如果任务确实无法完成，手动中断并检查错误原因。

### Q4: 如何更新插件版本？

编辑`opencode.json`中的插件版本号，例如：
```json
"plugin": ["oh-my-opencode"]
```
然后重启OpenCode。

### Q5: 多个项目如何管理不同的配置？

使用项目级别的配置文件（`.opencode/opencode.json`），每个项目可以有独立的配置。

### Q6: API配额用完了怎么办？

- 检查API使用量，确认是否超出配额
- 考虑升级API套餐或购买更多配额
- 使用OpenCode Zen免费模型作为备选
- 优化使用策略，减少不必要的API调用
- 考虑使用本地模型（LM Studio、Ollama等）

---

## 参考资源 / References

### 官方文档

- [OpenCode官方文档](https://opencode.ai/docs)
- [oh-my-opencode GitHub](https://github.com/code-yeongyu/oh-my-opencode)
- [OpenCode Zen](https://opencode.ai/zen) - OpenCode提供的模型服务
- [Anthropic API文档](https://docs.anthropic.com/)
- [OpenAI API文档](https://platform.openai.com/docs)
- [Google Gemini API文档](https://ai.google.dev/docs)

### 相关文章

- 西西弗斯式AI编程：永不放弃的Agent，干翻200刀的Claude Code
- [OpenCode Zen](https://opencode.ai/zen) - OpenCode提供的模型服务

### 社区支持

- [OpenCode Discord](https://discord.gg/opencode)
- [OpenCode X.com](https://x.com/opencode)

---

## 更新日志 / Changelog

### v3.0 (2026-01-25)

- **安全版本**：移除Antigravity和Claude Code相关内容，规避风险
- 改为使用官方API（Anthropic、OpenAI、Google等）
- 推荐使用OpenCode Zen免费模型
- 更新所有配置示例，使用官方支持的模型
- 增强API密钥管理和安全最佳实践

### v2.0 (2026-01-25)

- **整合版本**：合并了可行性评估、实施计划和实施总结的关键信息
- 添加了配置格式验证说明章节
- 整合了风险评估信息到兼容性矩阵
- 增强了已知问题和限制的说明
- 提供一站式配置指南，无需查阅多个文档

### v1.0 (2026-01-25)

- 初始版本
- 包含完整的安装、配置和使用指南
- 涵盖oh-my-opencode插件和官方API的集成
- 提供详细的故障排查和最佳实践

---

## 总结 / Summary

通过本文档，您应该能够：

1. ✅ 成功安装和配置OpenCode和oh-my-opencode
2. ✅ 理解Sisyphus Agent的工作原理和使用方法
3. ✅ 掌握专业化Agent团队的协作方式
4. ✅ 使用官方API和OpenCode Zen模型服务
5. ✅ 配置API密钥和安全最佳实践
6. ✅ 根据实际需求优化配置和性能

**重要提醒**：
- 使用官方API，遵循各服务提供商的服务条款
- 妥善保管API密钥，使用环境变量存储
- 监控API使用量和费用，合理控制成本
- 推荐使用OpenCode Zen免费模型进行开发和测试

祝您使用愉快！如有问题，请参考故障排查章节或访问社区获取帮助。