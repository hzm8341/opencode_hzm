#!/usr/bin/env bun
// DMG 打包脚本（向后兼容包装器）
// 用途: 将构建好的可执行文件打包为 DMG 格式
// 注意: 此脚本现在调用统一的 package.ts 脚本

import { $ } from "bun"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

// 解析架构参数
const archArg = process.argv.includes("--arch")
  ? process.argv[process.argv.indexOf("--arch") + 1]
  : null

// 调用统一的打包脚本
const args = ["--format", "dmg"]
if (archArg) {
  args.push("--arch", archArg)
}

// 使用 spawn 调用 package.ts
const packageScript = path.join(__dirname, "package.ts")
const proc = Bun.spawn(["bun", "run", packageScript, ...args], {
  cwd: dir,
  stdout: "inherit",
  stderr: "inherit",
})

const exitCode = await proc.exited
process.exit(exitCode)

