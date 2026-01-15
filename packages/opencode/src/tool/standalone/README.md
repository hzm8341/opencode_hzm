# Standalone Web Search and Fetch Module
# 独立网络搜索和获取模块

This module provides standalone web search and content fetching functionality that can be used independently without requiring the OpenCode Agent system.

此模块提供可独立使用的网络搜索和内容获取功能，无需 OpenCode Agent 系统。

## Features / 功能特性

- ✅ **Standalone Usage** / **独立使用**: No dependency on OpenCode Agent system
- ✅ **TypeScript Support** / **TypeScript 支持**: Full type definitions included
- ✅ **CLI Interface** / **CLI 接口**: Command-line tool for quick access
- ✅ **Flexible Options** / **灵活选项**: Configurable search and fetch parameters
- ✅ **Error Handling** / **错误处理**: Comprehensive error handling and timeouts

## Installation / 安装

This module is part of the OpenCode package. No additional installation is required.

此模块是 OpenCode 包的一部分，无需额外安装。

## Usage / 使用方法

### As a Module / 作为模块使用

```typescript
import { searchWeb, fetchWeb } from "@opencode-ai/opencode/src/tool/standalone"

// Search the web
const searchResult = await searchWeb({
  query: "TypeScript best practices",
  numResults: 5,
  type: "deep",
})

console.log(searchResult.output)

// Fetch web content
const fetchResult = await fetchWeb({
  url: "https://example.com",
  format: "markdown",
})

console.log(fetchResult.output)
```

### As a CLI Tool / 作为 CLI 工具使用

#### Search / 搜索

```bash
# Basic search
bun run packages/opencode/src/tool/standalone/cli.ts search "TypeScript best practices"

# Advanced search with options
bun run packages/opencode/src/tool/standalone/cli.ts search "Python async" \
  --num-results 5 \
  --type deep \
  --livecrawl preferred \
  --timeout 30
```

#### Fetch / 获取

```bash
# Fetch as markdown (default)
bun run packages/opencode/src/tool/standalone/cli.ts fetch "https://example.com"

# Fetch as text
bun run packages/opencode/src/tool/standalone/cli.ts fetch "https://example.com" text

# Fetch as HTML
bun run packages/opencode/src/tool/standalone/cli.ts fetch "https://example.com" html

# Fetch with timeout
bun run packages/opencode/src/tool/standalone/cli.ts fetch "https://example.com" markdown --timeout 60
```

## API Reference / API 参考

### `searchWeb(options: SearchOptions): Promise<SearchResult>`

Search the web using Exa AI.

使用 Exa AI 搜索网络。

#### Parameters / 参数

- `query` (string, required): Search query string
- `numResults` (number, optional): Number of search results to return (default: 8)
- `livecrawl` ("fallback" | "preferred", optional): Live crawl mode (default: "fallback")
- `type` ("auto" | "fast" | "deep", optional): Search type (default: "auto")
- `contextMaxCharacters` (number, optional): Maximum characters for context string
- `timeout` (number, optional): Request timeout in milliseconds (default: 25000)
- `abortSignal` (AbortSignal, optional): Abort signal for cancelling the request

#### Returns / 返回

- `output` (string): Search result content
- `title` (string): Result title

#### Example / 示例

```typescript
const result = await searchWeb({
  query: "TypeScript tutorials",
  numResults: 5,
  type: "deep",
})

console.log(result.output)
```

### `fetchWeb(options: FetchOptions): Promise<FetchResult>`

Fetch content from a URL.

从 URL 获取内容。

#### Parameters / 参数

- `url` (string, required): The URL to fetch content from
- `format` ("text" | "markdown" | "html", optional): Output format (default: "markdown")
- `timeout` (number, optional): Timeout in seconds (default: 30, max: 120)
- `abortSignal` (AbortSignal, optional): Abort signal for cancelling the request

#### Returns / 返回

- `output` (string): Fetched content
- `title` (string): Content title

#### Example / 示例

```typescript
const result = await fetchWeb({
  url: "https://example.com",
  format: "markdown",
})

console.log(result.output)
```

## CLI Options / CLI 选项

### Search Command / 搜索命令

```
bun run cli.ts search <query> [options]

Options:
  --num-results <number>        Number of results (default: 8)
  --type <auto|fast|deep>       Search type (default: auto)
  --livecrawl <fallback|preferred>  Live crawl mode (default: fallback)
  --timeout <seconds>           Timeout in seconds (default: 25)
```

### Fetch Command / 获取命令

```
bun run cli.ts fetch <url> [format] [options]

Arguments:
  url                           The URL to fetch
  format                        Output format: markdown, text, or html (default: markdown)

Options:
  --timeout <seconds>           Timeout in seconds (default: 30, max: 120)
```

## Error Handling / 错误处理

Both functions throw errors in the following cases:

两个函数在以下情况下会抛出错误：

- Invalid input parameters / 无效的输入参数
- Network errors / 网络错误
- Request timeout / 请求超时
- API errors / API 错误

Always wrap calls in try-catch blocks:

始终在 try-catch 块中包装调用：

```typescript
try {
  const result = await searchWeb({ query: "test" })
  console.log(result.output)
} catch (error) {
  console.error("Search failed:", error)
}
```

## Limitations / 限制

1. **WebSearch**: Requires Exa AI service to be available
2. **WebFetch**: Maximum response size is 5MB
3. **WebFetch**: Some websites may block automated requests

1. **WebSearch**: 需要 Exa AI 服务可用
2. **WebFetch**: 最大响应大小为 5MB
3. **WebFetch**: 某些网站可能阻止自动化请求

## Notes / 注意事项

- This module does not require the OpenCode Agent system
- No permission checks are performed (unlike the Agent tools)
- The module can be used in any Node.js/Bun environment
- All functions are async and return Promises

- 此模块不需要 OpenCode Agent 系统
- 不执行权限检查（与 Agent 工具不同）
- 模块可在任何 Node.js/Bun 环境中使用
- 所有函数都是异步的并返回 Promise

## License / 许可证

Same as OpenCode project.

与 OpenCode 项目相同。

