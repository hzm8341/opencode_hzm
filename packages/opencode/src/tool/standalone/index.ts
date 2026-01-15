/**
 * Standalone Web Search and Fetch Module
 * 独立网络搜索和获取模块
 * 
 * This module exports standalone functions for web search and content fetching
 * that can be used independently without the OpenCode Agent system.
 * 
 * 此模块导出可独立使用的网络搜索和内容获取函数，无需 OpenCode Agent 系统。
 */

export { searchWeb, type SearchOptions, type SearchResult } from "./websearch"
export { fetchWeb, type FetchOptions, type FetchResult } from "./webfetch"

