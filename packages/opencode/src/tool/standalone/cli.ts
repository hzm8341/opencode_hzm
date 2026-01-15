#!/usr/bin/env bun
/**
 * CLI Tool for Standalone Web Search and Fetch
 * 独立网络搜索和获取 CLI 工具
 * 
 * Usage:
 *   bun run cli.ts search <query> [options]
 *   bun run cli.ts fetch <url> [format] [options]
 * 
 * Examples:
 *   bun run cli.ts search "TypeScript best practices"
 *   bun run cli.ts fetch "https://example.com" markdown
 *   bun run cli.ts fetch "https://example.com" text
 */

import { searchWeb } from "./websearch"
import { fetchWeb } from "./webfetch"

function printUsage() {
  console.log(`
Usage:
  bun run cli.ts search <query> [options]
  bun run cli.ts fetch <url> [format] [options]

Commands:
  search    Search the web
  fetch     Fetch content from a URL

Search Options:
  --num-results <number>        Number of results (default: 8)
  --type <auto|fast|deep>       Search type (default: auto)
  --livecrawl <fallback|preferred>  Live crawl mode (default: fallback)
  --timeout <seconds>           Timeout in seconds (default: 25)

Fetch Options:
  format                        Output format: markdown, text, or html (default: markdown)
  --timeout <seconds>            Timeout in seconds (default: 30, max: 120)

Examples:
  bun run cli.ts search "TypeScript best practices"
  bun run cli.ts search "Python async" --num-results 5 --type deep
  bun run cli.ts fetch "https://example.com"
  bun run cli.ts fetch "https://example.com" markdown
  bun run cli.ts fetch "https://example.com" text --timeout 60
`)
}

function parseArgs(args: string[]) {
  const parsed: Record<string, any> = { positional: [] }
  let i = 0

  while (i < args.length) {
    const arg = args[i]
    if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-/g, "")
      const value = args[i + 1]
      if (value && !value.startsWith("--")) {
        parsed[key] = value
        i += 2
      } else {
        parsed[key] = true
        i += 1
      }
    } else {
      parsed.positional.push(arg)
      i += 1
    }
  }

  return parsed
}

async function handleSearch(args: string[]) {
  const parsed = parseArgs(args)
  const query = parsed.positional.join(" ")

  if (!query || query.trim().length === 0) {
    console.error("Error: Search query is required")
    printUsage()
    process.exit(1)
  }

  try {
    const options: any = {
      query,
    }

    if (parsed.numresults) {
      options.numResults = parseInt(parsed.numresults, 10)
      if (isNaN(options.numResults)) {
        console.error("Error: --num-results must be a number")
        process.exit(1)
      }
    }

    if (parsed.type) {
      if (!["auto", "fast", "deep"].includes(parsed.type)) {
        console.error("Error: --type must be one of: auto, fast, deep")
        process.exit(1)
      }
      options.type = parsed.type
    }

    if (parsed.livecrawl) {
      if (!["fallback", "preferred"].includes(parsed.livecrawl)) {
        console.error("Error: --livecrawl must be one of: fallback, preferred")
        process.exit(1)
      }
      options.livecrawl = parsed.livecrawl
    }

    if (parsed.timeout) {
      const timeout = parseInt(parsed.timeout, 10)
      if (isNaN(timeout) || timeout <= 0) {
        console.error("Error: --timeout must be a positive number")
        process.exit(1)
      }
      options.timeout = timeout * 1000 // Convert to milliseconds
    }

    console.log(`Searching for: ${query}\n`)
    const result = await searchWeb(options)
    console.log(result.output)
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

async function handleFetch(args: string[]) {
  const parsed = parseArgs(args)
  const url = parsed.positional[0]
  const format = parsed.positional[1] || "markdown"

  if (!url) {
    console.error("Error: URL is required")
    printUsage()
    process.exit(1)
  }

  if (!["markdown", "text", "html"].includes(format)) {
    console.error("Error: Format must be one of: markdown, text, html")
    process.exit(1)
  }

  try {
    const options: any = {
      url,
      format: format as "markdown" | "text" | "html",
    }

    if (parsed.timeout) {
      const timeout = parseInt(parsed.timeout, 10)
      if (isNaN(timeout) || timeout <= 0 || timeout > 120) {
        console.error("Error: --timeout must be a number between 1 and 120")
        process.exit(1)
      }
      options.timeout = timeout
    }

    console.log(`Fetching: ${url}\n`)
    const result = await fetchWeb(options)
    console.log(result.output)
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    printUsage()
    process.exit(0)
  }

  const command = args[0]
  const commandArgs = args.slice(1)

  switch (command) {
    case "search":
      await handleSearch(commandArgs)
      break
    case "fetch":
      await handleFetch(commandArgs)
      break
    case "help":
    case "--help":
    case "-h":
      printUsage()
      break
    default:
      console.error(`Error: Unknown command: ${command}`)
      printUsage()
      process.exit(1)
  }
}

// Run if executed directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("Unexpected error:", error)
    process.exit(1)
  })
}

