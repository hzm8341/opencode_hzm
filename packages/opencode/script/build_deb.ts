#!/usr/bin/env bun
// DEB 打包脚本
// 用途: 将构建好的可执行文件打包为 DEB 格式

import { $ } from "bun"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

import pkg from "../package.json"

// 从 package.json 或环境变量获取版本
const version = pkg.version || process.env.OPENCODE_VERSION || "1.1.4"
const arch = process.argv.includes("--arch") 
  ? process.argv[process.argv.indexOf("--arch") + 1]
  : process.arch === "x64" ? "amd64" : process.arch === "arm64" ? "arm64" : "amd64"

const packageName = "opencode"
const buildDir = path.join(dir, "deb_build")
const debDir = path.join(buildDir, `${packageName}_${version}_${arch}`)

console.log(`Building DEB package: ${packageName}_${version}_${arch}.deb`)

// 清理旧的构建目录
await $`rm -rf ${buildDir}`

// 创建目录结构
await $`mkdir -p ${debDir}/DEBIAN`
await $`mkdir -p ${debDir}/usr/bin`
await $`mkdir -p ${debDir}/usr/share/doc/${packageName}`

// 查找可执行文件
const executableName = `opencode-linux-${arch === "amd64" ? "x64" : "arm64"}`
const executablePath = path.join(dir, "dist", executableName, "bin", "opencode")

if (!fs.existsSync(executablePath)) {
  console.error(`Error: Executable not found at ${executablePath}`)
  console.error("Please build the executable first:")
  console.error(`  bun run script/build_temp.ts --single`)
  process.exit(1)
}

// 复制可执行文件
console.log(`Copying executable from ${executablePath}`)
await $`cp ${executablePath} ${debDir}/usr/bin/opencode`
await $`chmod +x ${debDir}/usr/bin/opencode`

// 创建 control 文件
const controlContent = `Package: ${packageName}
Version: ${version}
Section: devel
Priority: optional
Architecture: ${arch}
Depends: libc6 (>= 2.17)
Maintainer: OpenCode Team <team@opencode.ai>
Description: AI-powered development tool
 OpenCode is an open source AI coding agent that works with
 Claude, OpenAI, Google, or local models. It provides a powerful
 terminal interface and web interface for AI-assisted development.
Homepage: https://opencode.ai
`

await Bun.file(path.join(debDir, "DEBIAN", "control")).write(controlContent)

// 可选: 添加文档
const readmePath = path.join(dir, "..", "..", "README.md")
if (fs.existsSync(readmePath)) {
  await $`cp ${readmePath} ${debDir}/usr/share/doc/${packageName}/README.md`
}

const licensePath = path.join(dir, "..", "..", "LICENSE")
if (fs.existsSync(licensePath)) {
  await $`cp ${licensePath} ${debDir}/usr/share/doc/${packageName}/LICENSE`
}

// 构建 DEB 包
console.log("Building DEB package...")
const debFile = path.join(dir, "dist", `${packageName}_${version}_${arch}.deb`)
await $`mkdir -p ${path.dirname(debFile)}`
await $`dpkg-deb --build ${debDir} ${debFile}`

console.log(`✅ DEB package created: ${debFile}`)
console.log("")
console.log("To install:")
console.log(`  sudo dpkg -i ${debFile}`)
console.log("")
console.log("To test:")
console.log("  opencode --version")

