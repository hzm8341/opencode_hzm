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

在開始任何新任務前，**必須先使用 `plan` agent 制定詳細計劃**，然後使用 `build` agent 逐步實施。這能提高程式碼品質、減少返工，並便於追蹤進度。

```bash
# 步驟1：制定計劃
bun dev run --agent plan --model opencode/gpt-5-nano \
  "請制定詳細計劃：[你的任務]。保存到docs/任務名_plan_v1.0_$(date +%Y%m%d)_AI.md"

# 步驟2：根據計劃實施
bun dev run --agent build --model opencode/grok-code \
  "根據docs/任務名_plan_v1.0_日期_AI.md實施..."
```

詳細使用說明請查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md)。

### 進階功能

#### Oh My OpenCode 外掛

將您的 AI Agent 轉變為完整的開發團隊，提供專業化 Agent、ultrawork 模式和並行任務執行。

**主要特性：**
- 🤖 **專業化 Agent 團隊** - Oracle、Librarian、Explore、Frontend Engineer 等
- 🔄 **Sisyphus Agent** - 永不放棄機制，自動重試和錯誤修復
- 🪄 **Ultrawork 模式** - 處理複雜任務，自動分解和並行執行
- 🛠️ **LSP/AST 工具** - 進階程式碼分析能力

```bash
# 安裝
bunx oh-my-opencode install

# 使用 ultrawork 模式
opencode run "ultrawork: 重構整個 TypeScript 程式碼庫"

# 使用專業化 Agent
opencode run "@oracle 分析專案架構"
opencode run "@librarian 查找 React Hooks 最佳實踐"
```

更多資訊請查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md#oh-my-opencode-插件使用指南)。

#### Claude SDK Adapter

相容層，允許使用 Claude Agent SDK 介面與 OpenCode 的代理系統互動。完全獨立，僅使用 OpenCode 的內部 API。

```typescript
import { query } from "@/claude-sdk-adapter"
import { bootstrap } from "@/cli/bootstrap"

await bootstrap("/path/to/project", async () => {
  const q = query({
    prompt: "整理當前目錄下的檔案",
    options: { cwd: "/path/to/project" },
  })
  
  for await (const message of q) {
    console.log(message)
  }
})
```

更多資訊請查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md#claude-sdk-adapter-使用指南)。

#### Skills 系統

透過模組化、自包含的技能包擴展 AI Agent 的能力，提供專業化領域支援。

**可用 Skills：**
- 📄 **文件處理**：PDF、DOCX、PPTX、XLSX
- 🎨 **設計與創作**：Frontend Design、Canvas Design、Algorithmic Art、Theme Factory
- 🌐 **Web 開發**：Web Artifacts Builder、Webapp Testing
- 🛠️ **工具與整合**：MCP Builder、Skill Creator
- 💬 **通訊協作**：Internal Comms、Doc Coauthoring

Skills 會在需要時自動發現和載入。您也可以明確引用它們：

```bash
# 使用 PDF skill
bun dev run "使用pdf skill提取document.pdf中的文字"

# 組合使用多個 skills
bun dev run "使用pptx skill和theme-factory skill建立簡報，套用Modern Minimalist主題"
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
