# OpenCode 模型使用与收费分析 / OpenCode Model Usage and Pricing Analysis

**Version / 版本**: v1.0  
**Date / 日期**: 2025-01-07  
**Last Updated / 最后更新**: 2025-01-07

---

## 目录 / Table of Contents

- [当前使用的模型 / Current Model Usage](#当前使用的模型--current-model-usage)
- [模型选择机制 / Model Selection Mechanism](#模型选择机制--model-selection-mechanism)
- [收费情况分析 / Pricing Analysis](#收费情况分析--pricing-analysis)
- [免费使用方案 / Free Usage Options](#免费使用方案--free-usage-options)
- [收费风险评估 / Pricing Risk Assessment](#收费风险评估--pricing-risk-assessment)
- [推荐配置 / Recommended Configuration](#推荐配置--recommended-configuration)

---

## 当前使用的模型 / Current Model Usage

### 默认模型 / Default Model

根据代码分析，OpenCode 的默认模型选择逻辑如下：

Based on code analysis, OpenCode's default model selection logic is as follows:

1. **优先级 1** / **Priority 1**: 命令行参数指定的模型 / Model specified via command line argument
   ```bash
   bun dev run --model anthropic/claude-sonnet-4-20250514
   ```

2. **优先级 2** / **Priority 2**: 配置文件中指定的模型 / Model specified in config file
   ```json
   {
     "model": "anthropic/claude-sonnet-4-20250514"
   }
   ```

3. **优先级 3** / **Priority 3**: 最近使用的模型 / Recently used model

4. **优先级 4** / **Priority 4**: OpenCode Zen 的 "big-pickle" 模型（如果可用）/ OpenCode Zen's "big-pickle" model (if available)
   ```typescript
   // 代码位置: packages/opencode/src/acp/agent.ts
   return { providerID: "opencode", modelID: "big-pickle" }
   ```

5. **优先级 5** / **Priority 5**: 第一个可用的模型 / First available model

### 支持的模型提供商 / Supported Model Providers

OpenCode 支持 **75+ 个 LLM 提供商**，包括：

OpenCode supports **75+ LLM providers**, including:

#### 主要提供商 / Major Providers

- **Anthropic** - Claude 系列模型（Claude Sonnet, Opus, Haiku 等）
- **OpenAI** - GPT 系列模型（GPT-5, GPT-4, GPT-3.5 等）
- **Google** - Gemini 系列模型（Gemini 3 Pro, Gemini 3 Flash 等）
- **xAI** - Grok 系列模型
- **Mistral** - Mistral 系列模型
- **Cohere** - Cohere 系列模型
- **Amazon Bedrock** - 多种模型
- **Azure OpenAI** - Azure 托管的 OpenAI 模型
- **OpenRouter** - 聚合多个提供商的模型
- **本地模型** / **Local Models** - LM Studio, Ollama 等

#### OpenCode Zen（推荐） / OpenCode Zen (Recommended)

OpenCode Zen 是 OpenCode 团队提供的精选模型列表，包括：

OpenCode Zen is a curated list of models provided by the OpenCode team, including:

**免费模型** / **Free Models**:
- Big Pickle（默认免费模型 / Default free model）
- Grok Code Fast 1
- MiniMax M2.1
- GLM 4.7
- GPT 5 Nano

**付费模型** / **Paid Models**:
- GPT 5.2, GPT 5.1, GPT 5.1 Codex
- Claude Sonnet 4.5, Claude Opus 4.5, Claude Haiku 4.5
- Gemini 3 Pro, Gemini 3 Flash
- GLM 4.6
- Kimi K2
- Qwen3 Coder 480B
- 等等

---

## 模型选择机制 / Model Selection Mechanism

### 配置文件方式 / Configuration File Method

在项目根目录或全局配置中创建 `opencode.json`:

Create `opencode.json` in project root or global config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/big-pickle"
}
```

### 环境变量方式 / Environment Variable Method

```bash
export OPENCODE_MODEL="opencode/big-pickle"
# 或 / or
export OPENCODE_MODEL="anthropic/claude-sonnet-4-20250514"
```

### 命令行参数方式 / Command Line Argument Method

```bash
bun dev run --model opencode/big-pickle
```

### 交互式选择 / Interactive Selection

在 TUI 中使用 `/models` 命令选择模型：

Use `/models` command in TUI to select model:

```bash
/models
```

---

## 收费情况分析 / Pricing Analysis

### OpenCode 软件本身 / OpenCode Software Itself

✅ **完全免费** / **Completely Free**

- OpenCode 是 100% 开源软件（MIT 许可证）
- 软件本身不收取任何费用
- 可以自由使用、修改和分发

- OpenCode is 100% open source software (MIT License)
- The software itself does not charge any fees
- Free to use, modify, and distribute

### 模型服务费用 / Model Service Fees

⚠️ **取决于使用的模型** / **Depends on Model Used**

#### 1. OpenCode Zen 收费 / OpenCode Zen Pricing

**免费模型** / **Free Models**（当前免费，可能有限时）：

- Big Pickle - **免费** / **Free**
- Grok Code Fast 1 - **免费**（限时）/ **Free** (limited time)
- MiniMax M2.1 - **免费**（限时）/ **Free** (limited time)
- GLM 4.7 - **免费**（限时）/ **Free** (limited time)
- GPT 5 Nano - **免费** / **Free**

**付费模型价格示例** / **Paid Model Price Examples**（每 100 万 tokens / per 1M tokens）：

| 模型 / Model | 输入 / Input | 输出 / Output |
|-------------|-------------|---------------|
| GPT 5.2 | $1.75 | $14.00 |
| GPT 5.1 Codex | $1.07 | $8.50 |
| Claude Sonnet 4.5 | $3.00-$6.00 | $15.00-$22.50 |
| Claude Opus 4.5 | $5.00 | $25.00 |
| Gemini 3 Pro | $2.00-$4.00 | $12.00-$18.00 |

**收费特点** / **Pricing Features**:

- 按使用量付费（Pay-as-you-go）
- 零加价，按成本价收费（Zero markup, cost price）
- 仅收取支付处理费（4.4% + $0.30 每笔交易）
- 支持自动充值（余额低于 $5 时自动充值 $20）
- 支持设置月度使用限制

- Pay-as-you-go pricing
- Zero markup, charges at cost price
- Only payment processing fees (4.4% + $0.30 per transaction)
- Supports auto-reload (auto-reload $20 when balance below $5)
- Supports monthly usage limits

#### 2. 其他提供商收费 / Other Provider Pricing

**Anthropic (Claude)**:
- 需要自己的 API 密钥
- 按 Anthropic 官方定价收费
- 通常比 OpenCode Zen 稍贵

- Requires your own API key
- Charged at Anthropic's official pricing
- Usually slightly more expensive than OpenCode Zen

**OpenAI (GPT)**:
- 需要自己的 API 密钥
- 按 OpenAI 官方定价收费
- 价格因模型而异

- Requires your own API key
- Charged at OpenAI's official pricing
- Prices vary by model

**Google (Gemini)**:
- 需要自己的 API 密钥
- 按 Google 官方定价收费

- Requires your own API key
- Charged at Google's official pricing

**本地模型** / **Local Models**:
- ✅ **完全免费** / **Completely Free**
- 使用 LM Studio、Ollama 等本地运行模型
- 不需要 API 密钥
- 不产生任何费用

- ✅ **Completely Free**
- Use local models via LM Studio, Ollama, etc.
- No API key required
- No charges

---

## 免费使用方案 / Free Usage Options

### 方案 1: 使用 OpenCode Zen 免费模型 / Option 1: Use OpenCode Zen Free Models

**推荐模型** / **Recommended Model**: `opencode/big-pickle`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/big-pickle"
}
```

**优点** / **Advantages**:
- ✅ 完全免费
- ✅ 经过 OpenCode 团队测试和优化
- ✅ 适合编码任务

- ✅ Completely free
- ✅ Tested and optimized by OpenCode team
- ✅ Suitable for coding tasks

**缺点** / **Disadvantages**:
- ⚠️ 可能有限时（文档提到 "for a limited time"）
- ⚠️ 性能可能不如付费模型

- ⚠️ May be time-limited (documentation mentions "for a limited time")
- ⚠️ Performance may be inferior to paid models

### 方案 2: 使用本地模型 / Option 2: Use Local Models

**配置示例** / **Configuration Example**:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "lmstudio/google/gemma-3n-e4b"
}
```

**支持的本地模型提供商** / **Supported Local Model Providers**:

- **LM Studio** - 支持多种开源模型
- **Ollama** - 本地运行大模型
- **其他 OpenAI 兼容的本地服务**

- **LM Studio** - Supports multiple open source models
- **Ollama** - Run large models locally
- **Other OpenAI-compatible local services**

**优点** / **Advantages**:
- ✅ 完全免费
- ✅ 数据隐私（数据不离开本地）
- ✅ 无使用限制

- ✅ Completely free
- ✅ Data privacy (data doesn't leave local)
- ✅ No usage limits

**缺点** / **Disadvantages**:
- ⚠️ 需要本地硬件资源
- ⚠️ 性能取决于硬件配置
- ⚠️ 某些模型可能需要大量内存

- ⚠️ Requires local hardware resources
- ⚠️ Performance depends on hardware configuration
- ⚠️ Some models may require significant memory

### 方案 3: 使用其他免费提供商 / Option 3: Use Other Free Providers

某些提供商可能提供免费额度，例如：

Some providers may offer free tiers, for example:

- **Hugging Face** - 某些模型有免费额度
- **Replicate** - 提供免费试用
- **其他开源模型服务**

- **Hugging Face** - Some models have free tiers
- **Replicate** - Offers free trial
- **Other open source model services**

---

## 收费风险评估 / Pricing Risk Assessment

### 风险等级分析 / Risk Level Analysis

#### 🟢 低风险 / Low Risk

1. **OpenCode 软件本身** / **OpenCode Software Itself**
   - 风险等级: **无风险** / **No Risk**
   - 原因: 100% 开源，MIT 许可证
   - 未来收费可能性: **极低** / **Very Low**

2. **本地模型** / **Local Models**
   - 风险等级: **无风险** / **No Risk**
   - 原因: 完全本地运行，不依赖外部服务
   - 未来收费可能性: **无** / **None**

#### 🟡 中等风险 / Medium Risk

1. **OpenCode Zen 免费模型** / **OpenCode Zen Free Models**
   - 风险等级: **中等** / **Medium**
   - 原因: 文档明确提到 "for a limited time"（限时免费）
   - 未来收费可能性: **中等** / **Medium**
   - 建议: 准备备用方案（本地模型或其他免费提供商）

2. **其他提供商的免费额度** / **Other Providers' Free Tiers**
   - 风险等级: **中等** / **Medium**
   - 原因: 免费额度可能随时变更或取消
   - 未来收费可能性: **中等** / **Medium**

#### 🔴 高风险 / High Risk

1. **付费模型服务** / **Paid Model Services**
   - 风险等级: **高** / **High**
   - 原因: 价格可能随时调整
   - 未来收费可能性: **高** / **High**
   - 建议: 设置使用限制，监控使用量

### 风险缓解措施 / Risk Mitigation Measures

#### 1. 设置使用限制 / Set Usage Limits

**OpenCode Zen**:
```bash
# 在 OpenCode Zen 控制台设置月度限制
# Set monthly limit in OpenCode Zen console
```

**配置文件**:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/big-pickle",
  "provider": {
    "opencode": {
      "options": {
        "monthlyLimit": 20  // 美元 / USD
      }
    }
  }
}
```

#### 2. 监控使用量 / Monitor Usage

```bash
# 查看使用统计 / View usage statistics
bun dev stats
```

#### 3. 准备备用方案 / Prepare Backup Options

- 配置多个模型提供商
- 优先使用免费模型
- 准备本地模型作为备用

- Configure multiple model providers
- Prioritize free models
- Prepare local models as backup

#### 4. 使用环境变量控制 / Use Environment Variables for Control

```bash
# 仅在需要时使用付费模型 / Use paid models only when needed
export OPENCODE_MODEL="opencode/big-pickle"  # 默认免费 / Default free
# 需要时切换 / Switch when needed
export OPENCODE_MODEL="anthropic/claude-sonnet-4-20250514"
```

---

## 推荐配置 / Recommended Configuration

### 配置 1: 完全免费方案 / Configuration 1: Completely Free Option

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/big-pickle",
  "provider": {
    "opencode": {
      "options": {
        "apiKey": "{env:OPENCODE_API_KEY}"
      }
    }
  }
}
```

**说明** / **Notes**:
- 使用 OpenCode Zen 的免费模型
- 需要注册 OpenCode Zen 账户（免费）
- 无需添加支付方式

- Uses OpenCode Zen's free model
- Requires OpenCode Zen account registration (free)
- No payment method required

### 配置 2: 本地模型方案 / Configuration 2: Local Model Option

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "lmstudio/google/gemma-3n-e4b",
  "provider": {
    "lmstudio": {
      "options": {
        "baseURL": "http://localhost:1234/v1"
      }
    }
  }
}
```

**说明** / **Notes**:
- 完全免费，无任何费用
- 需要本地运行 LM Studio 或其他本地模型服务
- 数据完全本地处理，隐私性最好

- Completely free, no charges
- Requires running LM Studio or other local model service locally
- Data processed completely locally, best privacy

### 配置 3: 混合方案（推荐） / Configuration 3: Hybrid Option (Recommended)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/big-pickle",
  "provider": {
    "opencode": {
      "options": {
        "apiKey": "{env:OPENCODE_API_KEY}"
      }
    },
    "lmstudio": {
      "options": {
        "baseURL": "http://localhost:1234/v1"
      }
    }
  }
}
```

**说明** / **Notes**:
- 默认使用免费模型
- 需要高性能时切换到本地模型
- 灵活切换，成本可控

- Default to free model
- Switch to local model when high performance needed
- Flexible switching, cost controllable

### 配置 4: 付费方案（高性能） / Configuration 4: Paid Option (High Performance)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/gpt-5.1-codex",
  "provider": {
    "opencode": {
      "options": {
        "apiKey": "{env:OPENCODE_API_KEY}",
        "monthlyLimit": 50
      }
    }
  }
}
```

**说明** / **Notes**:
- 使用高性能付费模型
- 设置月度使用限制（$50）
- 适合专业开发场景

- Uses high-performance paid model
- Sets monthly usage limit ($50)
- Suitable for professional development scenarios

---

## 总结 / Summary

### 关键要点 / Key Points

1. **OpenCode 软件本身完全免费** / **OpenCode Software Itself is Completely Free**
   - 开源软件，无收费风险
   - Open source software, no pricing risk

2. **模型服务费用取决于选择** / **Model Service Costs Depend on Choice**
   - 可以选择完全免费的方案
   - 也可以选择付费的高性能方案
   - You can choose completely free options
   - Or paid high-performance options

3. **免费模型存在限时风险** / **Free Models Have Time-Limited Risk**
   - OpenCode Zen 的免费模型可能限时
   - 建议准备本地模型作为备用
   - OpenCode Zen free models may be time-limited
   - Recommend preparing local models as backup

4. **完全控制使用成本** / **Full Control Over Usage Costs**
   - 可以设置使用限制
   - 可以监控使用量
   - 可以随时切换模型
   - Can set usage limits
   - Can monitor usage
   - Can switch models anytime

### 建议 / Recommendations

1. **新用户** / **New Users**: 从免费模型开始（`opencode/big-pickle`）
2. **预算有限** / **Limited Budget**: 使用本地模型或免费模型
3. **专业开发** / **Professional Development**: 使用付费模型，但设置使用限制
4. **隐私敏感** / **Privacy Sensitive**: 使用本地模型

1. **New Users**: Start with free model (`opencode/big-pickle`)
2. **Limited Budget**: Use local models or free models
3. **Professional Development**: Use paid models but set usage limits
4. **Privacy Sensitive**: Use local models

---

## 相关资源 / Related Resources

- **OpenCode Zen 文档** / **OpenCode Zen Documentation**: https://opencode.ai/docs/zen
- **模型配置文档** / **Model Configuration Documentation**: https://opencode.ai/docs/models
- **提供商文档** / **Provider Documentation**: https://opencode.ai/docs/providers
- **OpenCode Zen 控制台** / **OpenCode Zen Console**: https://opencode.ai/auth

---

**最后更新** / **Last Updated**: 2025-01-07  
**维护者** / **Maintainer**: OpenCode Team
