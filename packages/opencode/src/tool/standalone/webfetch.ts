/**
 * Standalone Web Fetch Module
 * 独立网页获取模块
 * 
 * This module provides web content fetching functionality that can be used independently
 * without requiring the OpenCode Agent system.
 * 
 * 此模块提供可独立使用的网页内容获取功能，无需 OpenCode Agent 系统。
 */

import TurndownService from "turndown"

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_TIMEOUT = 30 * 1000 // 30 seconds
const MAX_TIMEOUT = 120 * 1000 // 2 minutes

export interface FetchOptions {
  /** The URL to fetch content from */
  url: string
  /** The format to return the content in (default: 'markdown') */
  format?: "text" | "markdown" | "html"
  /** Optional timeout in seconds (max 120, default: 30) */
  timeout?: number
  /** Abort signal for cancelling the request */
  abortSignal?: AbortSignal
}

export interface FetchResult {
  /** Fetched content */
  output: string
  /** Content title */
  title: string
}

/**
 * Fetch content from a URL
 * 从 URL 获取内容
 * 
 * @param options Fetch options
 * @returns Fetched content
 * @throws Error if fetch fails or times out
 * 
 * @example
 * ```typescript
 * const result = await fetchWeb({ url: "https://example.com", format: "markdown" })
 * console.log(result.output)
 * ```
 */
export async function fetchWeb(options: FetchOptions): Promise<FetchResult> {
  const { url, format = "markdown", timeout, abortSignal } = options

  // Validate URL
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("URL must start with http:// or https://")
  }

  const timeoutMs = Math.min((timeout ?? DEFAULT_TIMEOUT / 1000) * 1000, MAX_TIMEOUT)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  // Build Accept header based on requested format with q parameters for fallbacks
  let acceptHeader = "*/*"
  switch (format) {
    case "markdown":
      acceptHeader = "text/markdown;q=1.0, text/x-markdown;q=0.9, text/plain;q=0.8, text/html;q=0.7, */*;q=0.1"
      break
    case "text":
      acceptHeader = "text/plain;q=1.0, text/markdown;q=0.9, text/html;q=0.8, */*;q=0.1"
      break
    case "html":
      acceptHeader = "text/html;q=1.0, application/xhtml+xml;q=0.9, text/plain;q=0.8, text/markdown;q=0.7, */*;q=0.1"
      break
    default:
      acceptHeader =
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
  }

  // Combine abort signals if provided
  const signal = abortSignal
    ? AbortSignal.any([controller.signal, abortSignal])
    : controller.signal

  try {
    const response = await fetch(url, {
      signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: acceptHeader,
        "Accept-Language": "en-US,en;q=0.9",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Request failed with status code: ${response.status}`)
    }

    // Check content length
    const contentLength = response.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      throw new Error("Response too large (exceeds 5MB limit)")
    }

    const arrayBuffer = await response.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_RESPONSE_SIZE) {
      throw new Error("Response too large (exceeds 5MB limit)")
    }

    const content = new TextDecoder().decode(arrayBuffer)
    const contentType = response.headers.get("content-type") || ""

    const title = `${url} (${contentType})`

    // Handle content based on requested format and actual content type
    switch (format) {
      case "markdown":
        if (contentType.includes("text/html")) {
          const markdown = convertHTMLToMarkdown(content)
          return {
            output: markdown,
            title,
          }
        }
        return {
          output: content,
          title,
        }

      case "text":
        if (contentType.includes("text/html")) {
          const text = await extractTextFromHTML(content)
          return {
            output: text,
            title,
          }
        }
        return {
          output: content,
          title,
        }

      case "html":
        return {
          output: content,
          title,
        }

      default:
        return {
          output: content,
          title,
        }
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out")
    }

    throw error
  }
}

async function extractTextFromHTML(html: string): Promise<string> {
  let text = ""
  let skipContent = false

  const rewriter = new HTMLRewriter()
    .on("script, style, noscript, iframe, object, embed", {
      element() {
        skipContent = true
      },
      text() {
        // Skip text content inside these elements
      },
    })
    .on("*", {
      element(element) {
        // Reset skip flag when entering other elements
        if (!["script", "style", "noscript", "iframe", "object", "embed"].includes(element.tagName)) {
          skipContent = false
        }
      },
      text(input) {
        if (!skipContent) {
          text += input.text
        }
      },
    })
    .transform(new Response(html))

  await rewriter.text()
  return text.trim()
}

function convertHTMLToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  })
  turndownService.remove(["script", "style", "meta", "link"])
  return turndownService.turndown(html)
}

