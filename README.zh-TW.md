<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenCode logo">
    </picture>
  </a>
</p>
<p align="center">開源的 AI Coding Agent。</p>
<p align="center">
  <a href="https://opencode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/opencode-ai"><img alt="npm" src="https://img.shields.io/npm/v/opencode-ai?style=flat-square" /></a>
  <a href="https://github.com/anomalyco/opencode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/anomalyco/opencode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

[![OpenCode Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://opencode.ai)

---

### 安裝

```bash
# 直接安裝 (YOLO)
curl -fsSL https://opencode.ai/install | bash

# 套件管理員
npm i -g opencode-ai@latest        # 也可使用 bun/pnpm/yarn
scoop bucket add extras; scoop install extras/opencode  # Windows
choco install opencode             # Windows
brew install opencode              # macOS 與 Linux
paru -S opencode-bin               # Arch Linux
mise use -g github:anomalyco/opencode    # 任何作業系統
nix run nixpkgs#opencode           # 或使用 github:anomalyco/opencode 以取得最新開發分支
```

> [!TIP]
> 安裝前請先移除 0.1.x 以前的舊版本。

#### 從原始碼安裝（Windows）

對於想要從原始碼安裝的 Windows 使用者，我們提供了自動化安裝腳本：

**快速安裝（推薦）：**
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows-simple.ps1
```

**完整安裝（包含系統檢查和驗證）：**
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows-environment-en.ps1
```

這些腳本將：
- ✅ 檢查系統要求（Windows 10+、PowerShell 5.1+）
- ✅ 自動安裝 Bun（如果未安裝）
- ✅ 設定 PATH 環境變數
- ✅ 安裝專案相依套件
- ✅ 驗證安裝

更多詳細資訊，請參閱 [Windows 安裝腳本說明](WINDOWS_SETUP_README.md) 或 [Windows 環境安裝設定指南](docs/Windows环境安装配置指南_v1.0_20260122_AI.md)。

### 桌面應用程式 (BETA)

OpenCode 也提供桌面版應用程式。您可以直接從 [發佈頁面 (releases page)](https://github.com/anomalyco/opencode/releases) 或 [opencode.ai/download](https://opencode.ai/download) 下載。

| 平台                  | 下載連結                              |
| --------------------- | ------------------------------------- |
| macOS (Apple Silicon) | `opencode-desktop-darwin-aarch64.dmg` |
| macOS (Intel)         | `opencode-desktop-darwin-x64.dmg`     |
| Windows               | `opencode-desktop-windows-x64.exe`    |
| Linux                 | `.deb`, `.rpm`, 或 AppImage           |

```bash
# macOS (Homebrew Cask)
brew install --cask opencode-desktop
```

#### 安裝目錄

安裝腳本會依據以下優先順序決定安裝路徑：

1. `$OPENCODE_INSTALL_DIR` - 自定義安裝目錄
2. `$XDG_BIN_DIR` - 符合 XDG 基礎目錄規範的路徑
3. `$HOME/bin` - 標準使用者執行檔目錄 (若存在或可建立)
4. `$HOME/.opencode/bin` - 預設備用路徑

```bash
# 範例
OPENCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://opencode.ai/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://opencode.ai/install | bash
```

### 主要特性

- 🤖 **多模型支援** - 支援 Claude、OpenAI、Google 或本地模型
- 🖥️ **終端介面** - 專為終端使用者打造的強大 TUI
- 🌐 **Web 介面** - 可透過瀏覽器或桌面應用程式存取
- 🔌 **外掛系統** - 可擴充，支援 Oh My OpenCode 等外掛
- 📝 **LSP 支援** - 開箱即用的語言伺服器協定支援
- 🔐 **多代理系統** - 針對不同任務的專業化代理

### Agents

OpenCode 內建了兩種 Agent，您可以使用 `Tab` 鍵快速切換。

- **build** - 預設模式，具備完整權限的 Agent，適用於開發工作。
- **plan** - 唯讀模式，適用於程式碼分析與探索。
  - 預設禁止修改檔案。
  - 執行 bash 指令前會詢問權限。
  - 非常適合用來探索陌生的程式碼庫或規劃變更。

此外，OpenCode 還包含一個 **general** 子 Agent，用於處理複雜搜尋與多步驟任務。此 Agent 供系統內部使用，亦可透過在訊息中輸入 `@general` 來呼叫。

了解更多關於 [Agents](https://opencode.ai/docs/agents) 的資訊。

### 工作流程最佳實踐

**⚠️ 計劃優先原則**

**在開始任何新任務前，必須先使用 `plan` agent 制定詳細計劃並保存為文檔，然後使用 `build` agent 逐步實施。這是一個強制性要求，不是可選項。**

**為什麼需要？**

- ✅ 提高程式碼品質和可維護性
- ✅ 減少返工和錯誤
- ✅ 便於追蹤進度和問題解決
- ✅ 知識沈澱和團隊協作

```bash
# 步驟1：制定計劃
bun dev run --agent plan --model opencode/gpt-5-nano \
  "請制定詳細計劃：[你的任務]。保存到docs/任務名_plan_v1.0_$(date +%Y%m%d)_AI.md"

# 步驟2：根據計劃實施
bun dev run --agent build --model opencode/grok-code \
  "根據docs/任務名_plan_v1.0_日期_AI.md實施..."
```

**完整示例：**

```bash
# === 階段1：計劃制定
# 使用plan agent和text-processing skill制定計劃
bun dev run --agent plan --model opencode/gpt-5-nano \
  "請制定詳細計劃：將OCS2 MPC算法封裝成ROS2節點。\
  計劃需要包含：\
  1. 程式碼結構分析\
  2. ROS2節點設計\
  3. 介面定義\
  4. 實現步驟（分階段）\
  5. 測試方案\
  6. 風險評估\
  請將計劃保存到docs/ocs2_mpc_ros2_node_plan_v1.0_$(date +%Y%m%d)_AI.md，使用中英文對照格式。"

# === 階段2：計劃審查
# 查看生成的計劃文檔，確認是否合理
cat docs/ocs2_mpc_ros2_node_plan_v1.0_*.md

# === 階段3：開始實施
# 根據計劃文檔，使用build agent和code-generation skill開始實施
bun dev run --agent build --model opencode/grok-code \
  "根據計劃文檔docs/ocs2_mpc_ros2_node_plan_v1.0_日期_AI.md，\
  開始實施階段B（ROS2包和介面原型）。\
  請使用code-generation skill來指導程式碼實現。"

# === 階段4：編譯驗證
# 如果有編譯錯誤，讓OpenCode自動修復
bun dev run --agent build --model opencode/grok-code \
  "請編譯/media/hzm/Data/github/ocs2/ocs2_mpc_ros2_node包，\
  並自動修復所有編譯錯誤。"

# === 階段5：文檔更新
# 更新實現狀態文檔
bun dev run --agent plan --model opencode/gpt-5-nano \
  "請更新docs/ocs2_mpc_ros2_node_implementation_status_v1.0_日期_AI.md，\
  記錄完成的工作、遇到的問題和解決方案。"
```

詳細使用說明請查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md)。

### 進階功能

#### Oh My OpenCode 外掛

將您的 AI Agent 轉變為完整的開發團隊，提供專業化 Agent、ultrawork 模式、並行任務執行、規則注入系統和統一 Agent 執行流程。

**主要特性：**
- 🤖 **專業化 Agent 團隊** - Oracle、Librarian、Explore、Frontend Engineer 等
- 🔄 **Sisyphus Agent** - 永不放棄機制，自動重試和錯誤修復
- 🪄 **Ultrawork 模式** - 處理複雜任務，自動分解和並行執行
- 🛠️ **LSP/AST 工具** - 進階程式碼分析能力
- 📝 **規則注入系統** - 定義和執行統一的 AI Agent 行為規則
- 🔄 **統一 Agent 執行流程** - 自動觸發完整的 6 步執行流程

```bash
# 安裝
bunx oh-my-opencode install

# 使用 ultrawork 模式
opencode run "ultrawork: 重構整個 TypeScript 程式碼庫"

# 使用專業化 Agent
opencode run "@oracle 分析專案架構"
opencode run "@librarian 查找 React Hooks 最佳實踐"

# 使用統一執行流程（自動任務完成）
bun dev run "幫我將當前的專案demo運行起來"
opencode run "unified-flow: 運行demo"
```

##### 規則注入系統

一個強大的增強功能，允許您在所有專案中為 AI Agent 定義和執行統一的行為規則，確保程式碼品質，避免「AI程式碼泛濫」問題，提升團隊協作效率。

**主要特性：**

- 📝 **規則檔案管理** - 支援 `.mdc` 和 `.md` 格式的規則檔案，使用 frontmatter 進行配置
- 🗂️ **多級配置** - 支援專案級 (`.claude/rules/`) 和使用者級 (`~/.claude/rules/`) 規則
- 🎯 **智慧匹配** - 基於 `globs` 模式匹配檔案類型，支援 `alwaysApply: true` 始終生效規則
- ⚙️ **自動注入** - 透過 `rules-injector` 鉤子自動將匹配的規則注入 AI Agent 上下文
- 🔄 **即時生效** - 規則修改後立即生效，無需重新啟動 Agent
- 📋 **全面覆蓋** - 支援程式碼風格、檔案命名、文檔管理、工作流程等各類規則

```bash
# 創建規則目錄
mkdir -p .claude/rules

# 範例規則檔案：python-rules.mdc
cat > .claude/rules/python-rules.mdc << 'EOF'
---
description: "Python程式碼規則"
globs: ["*.py"]
---

## Python程式碼規則

- 遵循PEP 8規範
- 使用類型註解（Type Hints）
- 避免使用`as any`等類型忽略語句
- 優先使用PyTorch進行深度學習實現
EOF

# 驗證規則是否生效
bun dev run "創建一個簡單的Python函數，計算斐波那契數列"
```

##### 統一 Agent 執行流程

一個核心功能，透過一句话輸入自動觸發完整的 6 步執行流程，從任務解析到結果交付，全程自動化執行。

**6 步執行流程：**

1. **階段 1：任務解析** - 理解核心需求，明確交付標準
2. **階段 2：智慧拆解** - 分解為可執行步驟，確定資源需求
3. **階段 3：並行執行** - 多執行緒收集/處理，即時進度追蹤
4. **階段 4：綜合建構** - 資訊融合，邏輯建構
5. **階段 5：品質保證** - 自檢修正，端到端驗證
6. **階段 6：結果交付** - 按需格式化，附上執行摘要

**自動觸發：**

```bash
# 自動統一流程觸發的範例
bun dev run "幫我將當前的專案demo運行起來"
bun dev run "自動完成使用者登入功能"
bun dev run "幫我運行demo"
```

**主要特性：**

- 🎯 **自動任務識別** - 自動識別任務類型，提取成功標準
- 📋 **智慧拆解** - 自動創建詳細計劃並通過審查
- ⚡ **並行執行** - 多執行緒處理，即時進度追蹤
- 🔨 **綜合建構** - 資訊融合，邏輯建構
- ✅ **品質保證** - 自檢修正，端到端驗證
- 📦 **結果交付** - 按需格式化，執行摘要

更多資訊請查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md#oh-my-opencode-插件使用指南)。

#### Everything Claude Code 整合

OpenCode 支援 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 配置集合，提供經過實戰驗證的 agents、skills、commands 和 rules。

**快速安裝：**

```bash
# 使用安裝腳本（推薦）
./scripts/install-everything-claude-code.sh

# 或手動安裝
# 詳見: docs/everything-claude-code_融合實施計劃_v1.0_20260126_AI.md
```

**包含的內容：**

- **9 個專業 Agents**: planner（規劃專家）、architect（架構設計專家）、code-reviewer（程式碼審查專家）、security-reviewer（安全審查專家）、build-error-resolver（構建錯誤修復專家）、e2e-runner（E2E 測試專家）、refactor-cleaner（重構清理專家）、doc-updater（文檔更新專家）、tdd-guide（TDD 指南專家）
- **14 個實用 Commands**: `/plan`（創建實施計劃）、`/tdd`（測試驅動開發）、`/code-review`（程式碼審查）、`/e2e`（E2E 測試生成）、`/build-fix`（修復構建錯誤）、`/refactor-clean`（重構和清理）、`/update-docs`（更新文檔）、`/checkpoint`（保存檢查點）、`/verify`（運行驗證循環）、`/learn`（提取模式）、`/eval`（評估）、`/orchestrate`（編排任務）、`/test-coverage`（測試覆蓋率）、`/update-codemaps`（更新程式碼地圖）、`/setup-pm`（配置套件管理器）
- **11 個專業 Skills**: backend-patterns（後端模式）、frontend-patterns（前端模式）、tdd-workflow（TDD 工作流程）、security-review（安全審查）、verification-loop（驗證循環）、eval-harness（評估框架）、continuous-learning（持續學習）、strategic-compact（戰略壓縮）、coding-standards（編碼標準）、clickhouse-io（ClickHouse 整合）、project-guidelines-example（專案指南範例）
- **8 個最佳實踐 Rules**: security（安全規則）、coding-style（編碼風格）、testing（測試規則）、git-workflow（Git 工作流程）、agents（Agents 規則）、performance（效能規則）、memory（記憶體規則）、context（上下文規則）
- **完整的 Hooks 配置**: 自動化工作流程
- **MCP 伺服器配置**: GitHub、Supabase、Vercel、Railway 等

詳細文檔請查看 [Everything Claude Code 整合指南](./docs/everything-claude-code_融合實施計劃_v1.0_20260126_AI.md)。

#### Claude SDK Adapter

一個相容層，允許使用 Claude Agent SDK 的介面與 OpenCode 的代理系統互動。完全獨立實現，僅使用 OpenCode 的內部 API - 不依賴 Claude Code 可執行檔案。

**主要特性：**

- 🎯 **完全相容** - 無縫使用 Claude Agent SDK 介面與 OpenCode
- 🔄 **會話管理** - 自動會話創建和管理恢復能力
- 🛡️ **權限控制** - 透過 `canUseTool` 回呼自定義工具使用權限
- ⚡ **即時串流傳輸** - 非同步訊息串流傳輸，完全支援 TypeScript
- 🏗️ **架構獨立** - 完全獨立於 Claude Code，可以替換為任何相容 OpenCode API 的後端

**基本使用：**

```typescript
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

await bootstrap("/path/to/project", async () => {
  const q = query({
    prompt: "整理當前目錄下的檔案",
    options: { cwd: "/path/to/project" },
  })

  for await (const message of q) {
    if (message.type === "text") {
      console.log(message.text)
    } else if (message.type === "tool-call") {
      console.log(`工具調用: ${message.toolName}`)
    }
  }
})
```

**進階使用：**

```typescript
// 會話恢復
const q = query({
  prompt: "繼續之前的工作",
  options: {
    resume: "ses_previous_session_id",
    cwd: "/path/to/project"
  }
})

// 自定義權限
const q = query({
  prompt: "編輯README檔案",
  options: {
    canUseTool: async (toolName, input, { signal }) => {
      if (toolName === "edit" || toolName === "write") {
        return { behavior: "ask" } // "allow" / "deny"
      }
      return { behavior: "allow", updatedInput: input }
    }
  }
})

// 取消支援
const abortController = new AbortController()
setTimeout(() => abortController.abort(), 5000)

const q = query({
  prompt: "長時間運行的任務",
  options: { abortController }
})
```

**快速範例：**

```bash
# 測試使用（整理Downloads資料夾）
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/test-usage.ts

# CLI 範例
cd /media/hzm/Data/github/opencode/packages/opencode
bun run src/claude-sdk-adapter/cli-example.ts \
  "整理當前目錄下的檔案" \
  --cwd /home/hzm/Downloads

# 恢復會話
bun run src/claude-sdk-adapter/cli-example.ts \
  "繼續" --resume ses_xxxxx --cwd /path/to/project
```

更多資訊請查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md#claude-sdk-adapter-使用指南)。

#### Skills 系統

透過模組化、自包含的技能包擴展 AI Agent 的能力，提供專業化領域支援。當 Agent 需要處理特定領域的任務時，會自動載入相應的 Skill。

**可用 Skills：**

##### 文件處理類

- **PDF Skill** (`pdf`) - PDF 文字和表格提取、合併、拆分、創建、編輯、元資料提取
- **DOCX Skill** (`docx`) - Word 文檔創建和編輯、追蹤變更（修訂模式）、格式保留、文字提取
- **PPTX Skill** (`pptx`) - PowerPoint 演示文稿創建、幻燈片編輯、模板使用、佈局管理、註釋和演講者備註
- **XLSX Skill** (`xlsx`) - Excel 電子表格創建和編輯、公式和計算、資料分析和視覺化、格式化和樣式、公式重新計算

##### 設計和創作類

- **Frontend Design Skill** (`frontend-design`) - 創建高品質前端介面、避免通用 AI 美學、生產級程式碼生成、創意 UI 設計
- **Canvas Design Skill** (`canvas-design`) - 創建視覺藝術作品、設計哲學創建、PDF 和 PNG 輸出、原創視覺設計
- **Algorithmic Art Skill** (`algorithmic-art`) - 使用 p5.js 創建演算法藝術、種子隨機性和參數探索、互動式生成藝術
- **Theme Factory Skill** (`theme-factory`) - 應用專業主題到工件、10 個預設主題、顏色和字體配對、自定義主題創建

##### Web 開發類

- **Web Artifacts Builder Skill** (`web-artifacts-builder`) - 創建複雜的多組件 HTML 工件、React + TypeScript + Tailwind CSS / React + TypeScript + Tailwind CSS、shadcn/ui 組件、單檔案 HTML 打包
- **Webapp Testing Skill** (`webapp-testing`) - 使用 Playwright 測試本地 Web 應用程式、驗證前端功能、除錯 UI 行為、擷取瀏覽器截圖

##### 工具和整合類

- **MCP Builder Skill** (`mcp-builder`) - 創建高品質的 MCP 伺服器、Python 和 Node.js、工具設計和實現、評估創建
- **Skill Creator Skill** (`skill-creator`) - 創建有效的 Skills 指南、技能創建流程、最佳實踐、技能打包

##### 通訊和協作類

- **Internal Comms Skill** (`internal-comms`) - 編寫各種內部通訊、3P 更新（進度、計劃、問題）、公司通訊和 FAQ、狀態報告和專案更新
- **Doc Coauthoring Skill** (`doc-coauthoring`) - 結構化文檔協作工作流程、上下文收集、細化和結構、讀者測試

**Skills 發現機制：**

Skills 可以透過以下位置自動發現：

1. **專案級別** - `.opencode/skill/<name>/SKILL.md`、`.claude/skills/<name>/SKILL.md`
2. **全域級別** - `~/.config/opencode/skill/<name>/SKILL.md`、`~/.claude/skills/<name>/SKILL.md`

**使用範例：**

```bash
# 自動技能載入（推薦）
bun dev run "提取document.pdf中的文字"

# 顯式技能引用
bun dev run "使用pdf skill提取document.pdf中的文字"

# 組合使用多個 skills
bun dev run "使用pptx skill和theme-factory skill建立簡報，套用Modern Minimalist主題"

# 複雜工作流程使用 skills
bun dev run "使用frontend-design skill創建一個響應式儀表板組件"
```

更多資訊請查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md#skills-使用指南)。

### 線上文件

關於如何設定 OpenCode 的詳細資訊，請參閱我們的 [**官方文件**](https://opencode.ai/docs)。

- **使用指南**: [USAGE_GUIDE.md](./USAGE_GUIDE.md) - 包含安裝、設定、工作流程和進階功能的完整指南

### 參與貢獻

如果您有興趣參與 OpenCode 的開發，請在提交 Pull Request 前先閱讀我們的 [貢獻指南 (Contributing Docs)](./CONTRIBUTING.md)。

### 基於 OpenCode 進行開發

如果您正在開發與 OpenCode 相關的專案，並在名稱中使用了 "opencode"（例如 "opencode-dashboard" 或 "opencode-mobile"），請在您的 README 中加入聲明，說明該專案並非由 OpenCode 團隊開發，且與我們沒有任何隸屬關係。

### 常見問題 (FAQ)

#### 這跟 Claude Code 有什麼不同？

在功能面上與 Claude Code 非常相似。以下是關鍵差異：

- 100% 開源。
- 不綁定特定的服務提供商。雖然我們推薦使用透過 [OpenCode Zen](https://opencode.ai/zen) 提供的模型，但 OpenCode 也可搭配 Claude, OpenAI, Google 甚至本地模型使用。隨著模型不斷演進，彼此間的差距會縮小且價格會下降，因此具備「不限廠商 (provider-agnostic)」的特性至關重要。
- 內建 LSP (語言伺服器協定) 支援。
- 專注於終端機介面 (TUI)。OpenCode 由 Neovim 愛好者與 [terminal.shop](https://terminal.shop) 的創作者打造；我們將不斷挑戰終端機介面的極限。
- 客戶端/伺服器架構 (Client/Server Architecture)。這讓 OpenCode 能夠在您的電腦上運行的同時，由行動裝置進行遠端操控。這意味著 TUI 前端只是眾多可能的客戶端之一。

#### 另一個同名的 Repo 是什麼？

另一個名稱相近的儲存庫與本專案無關。您可以點此[閱讀背後的故事](https://x.com/thdxr/status/1933561254481666466)。

---

**加入我們的社群** [Discord](https://discord.gg/opencode) | [X.com](https://x.com/opencode)
