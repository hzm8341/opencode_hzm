# OpenCode 界面实现指南 / OpenCode Interface Implementation Guide

**Version / 版本**: v1.0  
**Date / 日期**: 2025-01-07  
**Last Updated / 最后更新**: 2025-01-07

---

## 目录 / Table of Contents

- [概述 / Overview](#概述--overview)
- [TUI 界面实现 / TUI Interface Implementation](#tui-界面实现--tui-interface-implementation)
- [Web 界面实现 / Web Interface Implementation](#web-界面实现--web-interface-implementation)
- [界面架构 / Interface Architecture](#界面架构--interface-architecture)
- [开发新界面功能 / Developing New Interface Features](#开发新界面功能--developing-new-interface-features)
- [运行和测试界面 / Running and Testing Interfaces](#运行和测试界面--running-and-testing-interfaces)
- [常见问题 / FAQ](#常见问题--faq)

---

## 概述 / Overview

OpenCode 提供了两种主要的界面实现：

OpenCode provides two main interface implementations:

1. **TUI (Terminal User Interface)** - 终端用户界面，使用 `@opentui/solid` 和 SolidJS
2. **Web UI** - Web 用户界面，使用 SolidJS 和 Vite

两种界面都使用 SolidJS 作为 UI 框架，但使用不同的渲染引擎。

Both interfaces use SolidJS as the UI framework, but use different rendering engines.

---

## TUI 界面实现 / TUI Interface Implementation

### 技术栈 / Tech Stack

- **框架** / **Framework**: SolidJS
- **渲染引擎** / **Rendering Engine**: `@opentui/solid` (基于 opentui)
- **入口文件** / **Entry File**: `packages/opencode/src/cli/cmd/tui/app.tsx`
- **主要组件** / **Main Components**: `packages/opencode/src/cli/cmd/tui/`

### 核心实现 / Core Implementation

#### 1. TUI 入口点 / TUI Entry Point

TUI 界面通过 `tui()` 函数启动：

The TUI interface is started through the `tui()` function:

```typescript:packages/opencode/src/cli/cmd/tui/app.tsx
export function tui(input: { url: string; args: Args; directory?: string; onExit?: () => Promise<void> }) {
  return new Promise<void>(async (resolve) => {
    const mode = await getTerminalBackgroundColor()
    const onExit = async () => {
      await input.onExit?.()
      resolve()
    }

    render(
      () => {
        return (
          <ErrorBoundary fallback={(error, reset) => <ErrorComponent ... />}>
            <ArgsProvider {...input.args}>
              <ExitProvider onExit={onExit}>
                {/* 各种 Provider 组件 */}
                <App />
              </ExitProvider>
            </ArgsProvider>
          </ErrorBoundary>
        )
      },
      {
        targetFps: 60,
        gatherStats: false,
        exitOnCtrlC: false,
        useKittyKeyboard: {},
        consoleOptions: {
          keyBindings: [{ name: "y", ctrl: true, action: "copy-selection" }],
          onCopySelection: (text) => {
            Clipboard.copy(text).catch(...)
          },
        },
      },
    )
  })
}
```

#### 2. 启动 TUI / Starting TUI

TUI 通过以下命令启动：

TUI is started through the following commands:

```bash
# 从命令行启动 / Start from command line
bun dev

# 或通过 spawn 命令 / Or through spawn command
bun dev spawn [project]
```

**实现位置** / **Implementation Location**:
- `packages/opencode/src/cli/cmd/tui/thread.ts` - 主线程命令
- `packages/opencode/src/cli/cmd/tui/spawn.ts` - Spawn 命令

#### 3. TUI 组件结构 / TUI Component Structure

```
packages/opencode/src/cli/cmd/tui/
├── app.tsx                    # 主应用组件 / Main app component
├── routes/
│   ├── home.tsx              # 首页路由 / Home route
│   └── session/
│       └── index.tsx         # 会话路由 / Session route
├── component/                # 可复用组件 / Reusable components
│   ├── prompt/               # 提示输入组件 / Prompt input components
│   ├── todo-item.tsx         # Todo 项组件 / Todo item component
│   └── ...
├── ui/                       # UI 组件 / UI components
│   ├── dialog.tsx            # 对话框组件 / Dialog component
│   ├── dialog-help.tsx       # 帮助对话框 / Help dialog
│   └── ...
├── context/                  # 上下文提供者 / Context providers
│   ├── args.tsx              # 参数上下文 / Args context
│   ├── route.tsx             # 路由上下文 / Route context
│   ├── sdk.tsx               # SDK 上下文 / SDK context
│   └── ...
└── event.ts                  # 事件定义 / Event definitions
```

#### 4. TUI 关键特性 / TUI Key Features

**Provider 系统** / **Provider System**:

TUI 使用多层 Provider 来管理状态：

TUI uses multiple layers of Providers to manage state:

```typescript
<ArgsProvider {...input.args}>
  <ExitProvider onExit={onExit}>
    <KVProvider>
      <ToastProvider>
        <RouteProvider>
          <SDKProvider url={input.url} directory={input.directory}>
            <SyncProvider>
              <ThemeProvider mode={mode}>
                <LocalProvider>
                  <KeybindProvider>
                    <PromptStashProvider>
                      <DialogProvider>
                        <CommandProvider>
                          <FrecencyProvider>
                            <PromptHistoryProvider>
                              <PromptRefProvider>
                                <App />
                              </PromptRefProvider>
                            </PromptHistoryProvider>
                          </FrecencyProvider>
                        </CommandProvider>
                      </DialogProvider>
                    </PromptStashProvider>
                  </KeybindProvider>
                </LocalProvider>
              </ThemeProvider>
            </SyncProvider>
          </SDKProvider>
        </RouteProvider>
      </ToastProvider>
    </KVProvider>
  </ExitProvider>
</ArgsProvider>
```

**路由系统** / **Routing System**:

使用 `@tui/context/route` 进行路由管理：

Uses `@tui/context/route` for routing:

```typescript
import { useRoute } from "@tui/context/route"

function App() {
  const route = useRoute()
  
  return (
    <Switch>
      <Match when={route() === "home"}>
        <Home />
      </Match>
      <Match when={route() === "session"}>
        <Session />
      </Match>
    </Switch>
  )
}
```

**主题系统** / **Theme System**:

自动检测终端背景颜色：

Automatically detects terminal background color:

```typescript
async function getTerminalBackgroundColor(): Promise<"dark" | "light"> {
  // 检测终端背景色 / Detect terminal background color
  // 返回 "dark" 或 "light" / Returns "dark" or "light"
}
```

---

## Web 界面实现 / Web Interface Implementation

### 技术栈 / Tech Stack

- **框架** / **Framework**: SolidJS
- **构建工具** / **Build Tool**: Vite
- **路由** / **Routing**: `@solidjs/router`
- **入口文件** / **Entry File**: `packages/app/src/entry.tsx`
- **主应用** / **Main App**: `packages/app/src/app.tsx`

### 核心实现 / Core Implementation

#### 1. Web 入口点 / Web Entry Point

Web 界面通过 `entry.tsx` 启动：

The Web interface is started through `entry.tsx`:

```typescript:packages/app/src/entry.tsx
import { render } from "solid-js/web"
import { App } from "@/app"

const root = document.getElementById("root")

render(
  () => (
    <PlatformProvider value={platform}>
      <App />
    </PlatformProvider>
  ),
  root!,
)
```

#### 2. 启动 Web 界面 / Starting Web Interface

**开发模式** / **Development Mode**:

```bash
# 启动 Web 开发服务器 / Start web dev server
bun run --cwd packages/app dev

# 访问 http://localhost:5173 (或显示的端口)
```

**通过 OpenCode 命令启动** / **Start via OpenCode Command**:

```bash
# 启动无头服务器并打开 Web 界面 / Start headless server and open web interface
bun dev web

# 或指定端口 / Or specify port
bun dev web --port 4096
```

**实现位置** / **Implementation Location**:
- `packages/opencode/src/cli/cmd/web.ts` - Web 命令实现

#### 3. Web 应用结构 / Web Application Structure

```typescript:packages/app/src/app.tsx
export function App() {
  return (
    <MetaProvider>
      <Font />
      <ThemeProvider>
        <ErrorBoundary fallback={(error) => <ErrorPage error={error} />}>
          <DialogProvider>
            <MarkedProvider>
              <DiffComponentProvider component={Diff}>
                <CodeComponentProvider component={Code}>
                  <ServerProvider defaultUrl={defaultServerUrl}>
                    <ServerKey>
                      <GlobalSDKProvider>
                        <GlobalSyncProvider>
                          <Router>
                            <Route path="/" component={Home} />
                            <Route path="/:dir" component={DirectoryLayout}>
                              <Route path="/session/:id?" component={Session} />
                            </Route>
                          </Router>
                        </GlobalSyncProvider>
                      </GlobalSDKProvider>
                    </ServerKey>
                  </ServerProvider>
                </CodeComponentProvider>
              </DiffComponentProvider>
            </MarkedProvider>
          </DialogProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </MetaProvider>
  )
}
```

#### 4. Web 组件结构 / Web Component Structure

```
packages/app/src/
├── entry.tsx                 # 入口文件 / Entry file
├── app.tsx                   # 主应用组件 / Main app component
├── pages/                    # 页面组件 / Page components
│   ├── home.tsx             # 首页 / Home page
│   ├── session.tsx           # 会话页面 / Session page
│   ├── layout.tsx            # 布局组件 / Layout component
│   └── error.tsx             # 错误页面 / Error page
├── components/               # 可复用组件 / Reusable components
│   ├── prompt-input.tsx      # 提示输入 / Prompt input
│   ├── terminal.tsx          # 终端组件 / Terminal component
│   ├── file-tree.tsx         # 文件树 / File tree
│   └── ...
├── context/                  # 上下文提供者 / Context providers
│   ├── server.tsx            # 服务器上下文 / Server context
│   ├── global-sdk.tsx        # 全局 SDK 上下文 / Global SDK context
│   ├── layout.tsx            # 布局上下文 / Layout context
│   └── ...
└── hooks/                    # 自定义 Hooks / Custom hooks
    └── use-providers.ts      # 提供商 Hook / Providers hook
```

#### 5. Web 关键特性 / Web Key Features

**路由系统** / **Routing System**:

使用 `@solidjs/router` 进行路由：

Uses `@solidjs/router` for routing:

```typescript
import { Router, Route, Navigate } from "@solidjs/router"

<Router>
  <Route path="/" component={Home} />
  <Route path="/:dir" component={DirectoryLayout}>
    <Route path="/" component={() => <Navigate href="session" />} />
    <Route path="/session/:id?" component={Session} />
  </Route>
</Router>
```

**服务器连接** / **Server Connection**:

Web 界面通过 HTTP 连接到 OpenCode 服务器：

The Web interface connects to the OpenCode server via HTTP:

```typescript
const defaultServerUrl = iife(() => {
  const param = new URLSearchParams(document.location.search).get("url")
  if (param) return param
  
  if (location.hostname.includes("opencode.ai")) return "http://localhost:4096"
  if (window.__OPENCODE__) return `http://127.0.0.1:${window.__OPENCODE__.port}`
  if (import.meta.env.DEV)
    return `http://${import.meta.env.VITE_OPENCODE_SERVER_HOST ?? "localhost"}:${import.meta.env.VITE_OPENCODE_SERVER_PORT ?? "4096"}`
  
  return window.location.origin
})
```

**Provider 系统** / **Provider System**:

Web 界面也使用多层 Provider：

The Web interface also uses multiple layers of Providers:

```typescript
<ServerProvider defaultUrl={defaultServerUrl}>
  <GlobalSDKProvider>
    <GlobalSyncProvider>
      <PermissionProvider>
        <LayoutProvider>
          <NotificationProvider>
            <CommandProvider>
              {/* 应用内容 / App content */}
            </CommandProvider>
          </NotificationProvider>
        </LayoutProvider>
      </PermissionProvider>
    </GlobalSyncProvider>
  </GlobalSDKProvider>
</ServerProvider>
```

---

## 界面架构 / Interface Architecture

### 共享组件 / Shared Components

OpenCode 使用 `packages/ui` 包来共享 UI 组件：

OpenCode uses the `packages/ui` package to share UI components:

```
packages/ui/
├── src/
│   ├── components/           # 共享组件 / Shared components
│   │   ├── button.tsx        # 按钮 / Button
│   │   ├── dialog.tsx        # 对话框 / Dialog
│   │   ├── icon.tsx          # 图标 / Icon
│   │   └── ...
│   └── ...
```

### 状态管理 / State Management

**TUI 状态管理** / **TUI State Management**:

- 使用 SolidJS 的 `createSignal` 和 `createStore`
- 通过 Context API 共享状态
- 使用 Provider 模式管理全局状态

- Uses SolidJS's `createSignal` and `createStore`
- Shares state through Context API
- Uses Provider pattern for global state management

**Web 状态管理** / **Web State Management**:

- 同样使用 SolidJS 的响应式系统
- 通过 Context 和 Provider 共享状态
- 使用 `createStore` 管理复杂状态

- Also uses SolidJS's reactive system
- Shares state through Context and Provider
- Uses `createStore` for complex state management

### 通信机制 / Communication Mechanism

**TUI 通信** / **TUI Communication**:

- 直接连接到服务器（通过 Worker 或主进程）
- 使用 SDK 进行 API 调用
- 通过 WebSocket 或 HTTP 进行实时通信

- Direct connection to server (via Worker or main process)
- Uses SDK for API calls
- Real-time communication via WebSocket or HTTP

**Web 通信** / **Web Communication**:

- 通过 HTTP/WebSocket 连接到 OpenCode 服务器
- 使用 SDK 客户端进行 API 调用
- 支持跨域访问（通过 CORS 配置）

- Connects to OpenCode server via HTTP/WebSocket
- Uses SDK client for API calls
- Supports cross-origin access (via CORS configuration)

---

## 开发新界面功能 / Developing New Interface Features

### 步骤 1: 确定界面类型 / Step 1: Determine Interface Type

决定新功能应该在 TUI、Web 还是两者中实现：

Decide whether the new feature should be implemented in TUI, Web, or both:

- **TUI**: 适合终端环境、键盘操作、快速交互
- **Web**: 适合复杂 UI、鼠标操作、可视化展示
- **两者**: 需要共享逻辑时，使用 `packages/ui` 共享组件

- **TUI**: Suitable for terminal environment, keyboard operations, quick interactions
- **Web**: Suitable for complex UI, mouse operations, visual displays
- **Both**: When shared logic is needed, use `packages/ui` for shared components

### 步骤 2: 创建组件 / Step 2: Create Component

**TUI 组件示例** / **TUI Component Example**:

```typescript
// packages/opencode/src/cli/cmd/tui/component/my-component.tsx
import { useRenderer, useKeyboard } from "@opentui/solid"
import { createSignal } from "solid-js"

export function MyComponent() {
  const renderer = useRenderer()
  const keyboard = useKeyboard()
  const [count, setCount] = createSignal(0)
  
  keyboard.onKeyPress((key) => {
    if (key === "Enter") {
      setCount(count() + 1)
    }
  })
  
  return (
    <box>
      <text>Count: {count()}</text>
    </box>
  )
}
```

**Web 组件示例** / **Web Component Example**:

```typescript
// packages/app/src/components/my-component.tsx
import { createSignal } from "solid-js"
import { Button } from "@opencode-ai/ui/button"

export function MyComponent() {
  const [count, setCount] = createSignal(0)
  
  return (
    <div>
      <p>Count: {count()}</p>
      <Button onClick={() => setCount(count() + 1)}>
        Increment
      </Button>
    </div>
  )
}
```

### 步骤 3: 集成到路由 / Step 3: Integrate into Routes

**TUI 路由集成** / **TUI Route Integration**:

```typescript
// packages/opencode/src/cli/cmd/tui/routes/my-route.tsx
import { useRoute } from "@tui/context/route"
import { MyComponent } from "../component/my-component"

export function MyRoute() {
  const route = useRoute()
  
  return <MyComponent />
}
```

**Web 路由集成** / **Web Route Integration**:

```typescript
// packages/app/src/pages/my-page.tsx
import { MyComponent } from "@/components/my-component"

export default function MyPage() {
  return <MyComponent />
}

// 在 app.tsx 中添加路由
<Route path="/my-page" component={MyPage} />
```

### 步骤 4: 添加状态管理 / Step 4: Add State Management

如果需要全局状态，创建 Context Provider：

If global state is needed, create a Context Provider:

```typescript
// packages/opencode/src/cli/cmd/tui/context/my-context.tsx
import { createContext, useContext, ParentProps } from "solid-js"

const MyContext = createContext<MyState>()

export function MyProvider(props: ParentProps<{ initialState: MyState }>) {
  const [state, setState] = createStore(props.initialState)
  
  return (
    <MyContext.Provider value={[state, setState]}>
      {props.children}
    </MyContext.Provider>
  )
}

export function useMyContext() {
  const context = useContext(MyContext)
  if (!context) throw new Error("MyProvider not found")
  return context
}
```

### 步骤 5: 测试 / Step 5: Test

**测试 TUI** / **Test TUI**:

```bash
# 运行 TUI 开发服务器 / Run TUI dev server
bun dev

# 或指定目录 / Or specify directory
bun dev /path/to/test
```

**测试 Web** / **Test Web**:

```bash
# 运行 Web 开发服务器 / Run web dev server
bun run --cwd packages/app dev

# 在另一个终端启动 OpenCode 服务器 / Start OpenCode server in another terminal
bun dev web --port 4096
```

---

## 运行和测试界面 / Running and Testing Interfaces

### TUI 界面 / TUI Interface

#### 开发模式 / Development Mode

```bash
# 从项目根目录运行 / Run from project root
cd /media/hzm/Data/github/opencode
bun dev

# 在指定目录运行 / Run in specified directory
bun dev /path/to/project

# 使用 spawn 模式（用于调试）/ Use spawn mode (for debugging)
bun dev spawn [project]
```

#### 调试 TUI / Debugging TUI

```bash
# 使用 inspect 模式 / Use inspect mode
bun run --inspect=ws://localhost:6499/ dev

# 在 VSCode 中附加调试器 / Attach debugger in VSCode
# 使用 .vscode/launch.example.json 配置
```

### Web 界面 / Web Interface

#### 开发模式 / Development Mode

```bash
# 方法 1: 直接运行 Web 应用 / Method 1: Run web app directly
bun run --cwd packages/app dev

# 方法 2: 通过 OpenCode 命令启动 / Method 2: Start via OpenCode command
bun dev web

# 方法 3: 启动服务器并手动访问 / Method 3: Start server and access manually
bun dev serve --port 4096
# 然后访问 http://localhost:4096
```

#### 配置开发服务器 / Configure Dev Server

编辑 `packages/app/vite.config.ts`:

Edit `packages/app/vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    // 配置代理等 / Configure proxy, etc.
  },
})
```

#### 环境变量 / Environment Variables

创建 `.env` 文件：

Create `.env` file:

```bash
# packages/app/.env
VITE_OPENCODE_SERVER_HOST=localhost
VITE_OPENCODE_SERVER_PORT=4096
```

### 桌面应用 / Desktop Application

```bash
# 运行桌面应用 / Run desktop app
bun run --cwd packages/desktop tauri dev

# 仅运行 Web 开发服务器（无原生外壳）/ Only web dev server (no native shell)
bun run --cwd packages/desktop dev
```

---

## 常见问题 / FAQ

### TUI 相关问题 / TUI Related Questions

#### Q: TUI 界面无法显示怎么办？/ Q: What if TUI interface doesn't display?

**A**: 检查以下几点：

**A**: Check the following:

1. 确保终端支持 ANSI 转义序列 / Ensure terminal supports ANSI escape sequences
2. 检查终端尺寸 / Check terminal dimensions
3. 尝试使用不同的终端 / Try different terminal
4. 检查是否有错误输出 / Check for error output

#### Q: 如何自定义 TUI 主题？/ Q: How to customize TUI theme?

**A**: TUI 会自动检测终端背景色，也可以通过配置修改：

**A**: TUI automatically detects terminal background color, can also be modified via config:

```typescript
// 在 app.tsx 中 / In app.tsx
<ThemeProvider mode="dark"> {/* 或 "light" */}
  {/* 应用内容 / App content */}
</ThemeProvider>
```

#### Q: TUI 中的键盘快捷键如何实现？/ Q: How to implement keyboard shortcuts in TUI?

**A**: 使用 `useKeyboard` Hook：

**A**: Use `useKeyboard` Hook:

```typescript
import { useKeyboard } from "@opentui/solid"

function MyComponent() {
  const keyboard = useKeyboard()
  
  keyboard.onKeyPress((key) => {
    if (key === "Enter") {
      // 处理 Enter 键 / Handle Enter key
    }
  })
}
```

### Web 相关问题 / Web Related Questions

#### Q: Web 界面无法连接到服务器怎么办？/ Q: What if Web interface can't connect to server?

**A**: 检查以下几点：

**A**: Check the following:

1. 确保 OpenCode 服务器正在运行 / Ensure OpenCode server is running
2. 检查服务器 URL 配置 / Check server URL configuration
3. 检查 CORS 设置 / Check CORS settings
4. 查看浏览器控制台错误 / Check browser console errors

#### Q: 如何配置 Web 界面的服务器地址？/ Q: How to configure Web interface server address?

**A**: 有多种方式：

**A**: Multiple ways:

1. **URL 参数** / **URL Parameter**: `http://localhost:5173?url=http://localhost:4096`
2. **环境变量** / **Environment Variable**: `VITE_OPENCODE_SERVER_HOST` 和 `VITE_OPENCODE_SERVER_PORT`
3. **代码配置** / **Code Configuration**: 在 `app.tsx` 中修改 `defaultServerUrl`

#### Q: Web 界面如何实现实时更新？/ Q: How does Web interface implement real-time updates?

**A**: 使用 WebSocket 或轮询：

**A**: Uses WebSocket or polling:

```typescript
// 通过 SDK 连接 / Connect via SDK
import { createOpencodeClient } from "@opencode-ai/sdk/v2"

const client = createOpencodeClient({
  url: "http://localhost:4096",
})

// 监听事件 / Listen to events
client.session.onMessage((message) => {
  // 处理消息 / Handle message
})
```

### 开发相关问题 / Development Related Questions

#### Q: 如何在 TUI 和 Web 之间共享组件？/ Q: How to share components between TUI and Web?

**A**: 使用 `packages/ui` 包：

**A**: Use `packages/ui` package:

1. 在 `packages/ui/src` 中创建共享组件
2. 在 TUI 和 Web 中导入使用
3. 注意：某些组件可能需要适配（如 TUI 使用 `@opentui/solid`，Web 使用标准 DOM）

1. Create shared components in `packages/ui/src`
2. Import and use in both TUI and Web
3. Note: Some components may need adaptation (TUI uses `@opentui/solid`, Web uses standard DOM)

#### Q: 如何添加新的路由？/ Q: How to add new routes?

**A**: 

**TUI**: 在 `packages/opencode/src/cli/cmd/tui/routes/` 中创建新路由文件，然后在 `app.tsx` 中添加路由逻辑

**TUI**: Create new route file in `packages/opencode/src/cli/cmd/tui/routes/`, then add route logic in `app.tsx`

**Web**: 在 `packages/app/src/pages/` 中创建新页面，然后在 `app.tsx` 中添加 `<Route>` 组件

**Web**: Create new page in `packages/app/src/pages/`, then add `<Route>` component in `app.tsx`

#### Q: 如何调试界面问题？/ Q: How to debug interface issues?

**A**: 

1. **TUI**: 使用 `--print-logs` 和 `--log-level DEBUG` 查看日志
2. **Web**: 使用浏览器开发者工具查看控制台和网络请求
3. **两者**: 使用 `bun run --inspect` 进行调试

1. **TUI**: Use `--print-logs` and `--log-level DEBUG` to view logs
2. **Web**: Use browser developer tools to view console and network requests
3. **Both**: Use `bun run --inspect` for debugging

---

## 相关资源 / Related Resources

- **OpenTUI 文档** / **OpenTUI Documentation**: https://github.com/sst/opentui
- **SolidJS 文档** / **SolidJS Documentation**: https://www.solidjs.com/
- **Vite 文档** / **Vite Documentation**: https://vitejs.dev/
- **OpenCode 文档** / **OpenCode Documentation**: https://opencode.ai/docs

---

## 更新日志 / Changelog

### v1.0 (2025-01-07)

- 初始版本的界面实现指南 / Initial version of interface implementation guide
- 包含 TUI 和 Web 界面的实现说明 / Includes implementation instructions for TUI and Web interfaces

---

**最后更新** / **Last Updated**: 2025-01-07  
**维护者** / **Maintainer**: OpenCode Team
