/**
 * Standalone Web Search Module
 * 独立网络搜索模块
 * 
 * This module provides web search functionality that can be used independently
 * without requiring the OpenCode Agent system.
 * 
 * 此模块提供可独立使用的网络搜索功能，无需 OpenCode Agent 系统。
 */

const API_CONFIG = {
  BASE_URL: "https://mcp.exa.ai",
  ENDPOINTS: {
    SEARCH: "/mcp",
  },
  DEFAULT_NUM_RESULTS: 8,
  DEFAULT_TIMEOUT: 25000, // 25 seconds
} as const

interface McpSearchRequest {
  jsonrpc: string
  id: number
  method: string
  params: {
    name: string
    arguments: {
      query: string
      numResults?: number
      livecrawl?: "fallback" | "preferred"
      type?: "auto" | "fast" | "deep"
      contextMaxCharacters?: number
    }
  }
}

interface McpSearchResponse {
  jsonrpc: string
  result: {
    content: Array<{
      type: string
      text: string
    }>
  }
}

export interface SearchOptions {
  /** Search query string */
  query: string
  /** Number of search results to return (default: 8) */
  numResults?: number
  /** Live crawl mode: 'fallback' (default) or 'preferred' */
  livecrawl?: "fallback" | "preferred"
  /** Search type: 'auto' (default), 'fast', or 'deep' */
  type?: "auto" | "fast" | "deep"
  /** Maximum characters for context string optimized for LLMs */
  contextMaxCharacters?: number
  /** Request timeout in milliseconds (default: 25000) */
  timeout?: number
  /** Abort signal for cancelling the request */
  abortSignal?: AbortSignal
}

export interface SearchResult {
  /** Search result content */
  output: string
  /** Result title */
  title: string
}

/**
 * Search the web using Exa AI
 * 使用 Exa AI 搜索网络
 * 
 * @param options Search options
 * @returns Search result
 * @throws Error if search fails or times out
 * 
 * @example
 * ```typescript
 * const result = await searchWeb({ query: "TypeScript best practices" })
 * console.log(result.output)
 * ```
 */
export async function searchWeb(options: SearchOptions): Promise<SearchResult> {
  const {
    query,
    numResults = API_CONFIG.DEFAULT_NUM_RESULTS,
    livecrawl = "fallback",
    type = "auto",
    contextMaxCharacters,
    timeout = API_CONFIG.DEFAULT_TIMEOUT,
    abortSignal,
  } = options

  if (!query || query.trim().length === 0) {
    throw new Error("Search query cannot be empty")
  }

  const searchRequest: McpSearchRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "web_search_exa",
      arguments: {
        query: query.trim(),
        type,
        numResults,
        livecrawl,
        contextMaxCharacters,
      },
    },
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // Combine abort signals if provided
  const signal = abortSignal
    ? AbortSignal.any([controller.signal, abortSignal])
    : controller.signal

  try {
    const headers: Record<string, string> = {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH}`, {
      method: "POST",
      headers,
      body: JSON.stringify(searchRequest),
      signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Search error (${response.status}): ${errorText}`)
    }

    const responseText = await response.text()

    // Parse SSE response
    const lines = responseText.split("\n")
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data: McpSearchResponse = JSON.parse(line.substring(6))
          if (data.result && data.result.content && data.result.content.length > 0) {
            return {
              output: data.result.content[0].text,
              title: `Web search: ${query}`,
            }
          }
        } catch (parseError) {
          // Skip invalid JSON lines
          continue
        }
      }
    }

    return {
      output: "No search results found. Please try a different query.",
      title: `Web search: ${query}`,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Search request timed out")
    }

    throw error
  }
}

