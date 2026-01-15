/**
 * Example usage of standalone web search and fetch modules
 * 独立网络搜索和获取模块使用示例
 * 
 * This file demonstrates how to use the standalone modules
 * 此文件演示如何使用独立模块
 */

import { searchWeb } from "./websearch"
import { fetchWeb } from "./webfetch"

/**
 * Example: Basic web search
 * 示例：基本网络搜索
 */
export async function exampleSearch() {
  try {
    const result = await searchWeb({
      query: "TypeScript best practices",
      numResults: 3,
    })
    console.log("Search Result:")
    console.log(result.title)
    console.log(result.output)
  } catch (error) {
    console.error("Search failed:", error)
  }
}

/**
 * Example: Advanced web search with options
 * 示例：带选项的高级网络搜索
 */
export async function exampleAdvancedSearch() {
  try {
    const result = await searchWeb({
      query: "Python async programming",
      numResults: 5,
      type: "deep",
      livecrawl: "preferred",
      timeout: 30000,
    })
    console.log("Advanced Search Result:")
    console.log(result.output)
  } catch (error) {
    console.error("Advanced search failed:", error)
  }
}

/**
 * Example: Fetch web content as markdown
 * 示例：以 Markdown 格式获取网页内容
 */
export async function exampleFetchMarkdown() {
  try {
    const result = await fetchWeb({
      url: "https://example.com",
      format: "markdown",
    })
    console.log("Fetched Markdown:")
    console.log(result.output)
  } catch (error) {
    console.error("Fetch failed:", error)
  }
}

/**
 * Example: Fetch web content as text
 * 示例：以文本格式获取网页内容
 */
export async function exampleFetchText() {
  try {
    const result = await fetchWeb({
      url: "https://example.com",
      format: "text",
      timeout: 60,
    })
    console.log("Fetched Text:")
    console.log(result.output)
  } catch (error) {
    console.error("Fetch failed:", error)
  }
}

/**
 * Example: Using abort signal to cancel request
 * 示例：使用中止信号取消请求
 */
export async function exampleWithAbort() {
  const controller = new AbortController()

  // Cancel after 5 seconds
  setTimeout(() => {
    controller.abort()
    console.log("Request cancelled")
  }, 5000)

  try {
    const result = await searchWeb({
      query: "test query",
      abortSignal: controller.signal,
    })
    console.log(result.output)
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Request was cancelled")
    } else {
      console.error("Search failed:", error)
    }
  }
}

// Run examples if executed directly
if (import.meta.main) {
  console.log("Running examples...\n")

  // Uncomment to run specific examples:
  // await exampleSearch()
  // await exampleAdvancedSearch()
  // await exampleFetchMarkdown()
  // await exampleFetchText()
  // await exampleWithAbort()

  console.log("\nExamples completed. Uncomment specific examples to run them.")
}

