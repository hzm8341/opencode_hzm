#!/usr/bin/env bun
// 统一打包脚本
// 用途: 将构建好的可执行文件打包为 DEB (Linux) 或 DMG (macOS) 格式
// 用法:
//   bun run script/package.ts --format deb [--arch amd64|arm64]
//   bun run script/package.ts --format dmg [--arch arm64|x64]

import { $ } from "bun"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

import pkg from "../package.json"
import { Script } from "@opencode-ai/script"

// 解析命令行参数
const format = process.argv.includes("--format")
  ? process.argv[process.argv.indexOf("--format") + 1]
  : null

const archArg = process.argv.includes("--arch")
  ? process.argv[process.argv.indexOf("--arch") + 1]
  : null

const version = Script.version || pkg.version || "1.1.4"

if (!format || !["deb", "dmg"].includes(format)) {
  console.error("Usage: bun run script/package.ts --format <deb|dmg> [--arch <arch>]")
  console.error("")
  console.error("Examples:")
  console.error("  bun run script/package.ts --format deb --arch amd64")
  console.error("  bun run script/package.ts --format deb --arch arm64")
  console.error("  bun run script/package.ts --format dmg --arch arm64")
  console.error("  bun run script/package.ts --format dmg --arch x64")
  process.exit(1)
}

// 确定架构
let arch: string
let bunArch: string

if (format === "deb") {
  // Linux 架构
  if (archArg) {
    arch = archArg === "amd64" ? "amd64" : archArg === "arm64" ? "arm64" : "amd64"
    bunArch = arch === "amd64" ? "x64" : "arm64"
  } else {
    // 自动检测
    const systemArch = process.arch
    arch = systemArch === "x64" ? "amd64" : systemArch === "arm64" ? "arm64" : "amd64"
    bunArch = arch === "amd64" ? "x64" : "arm64"
  }
} else {
  // macOS 架构
  if (archArg) {
    bunArch = archArg === "arm64" ? "arm64" : archArg === "x64" ? "x64" : "arm64"
    arch = bunArch === "arm64" ? "arm64" : "x64"
  } else {
    // 自动检测
    const systemArch = process.arch
    bunArch = systemArch === "arm64" ? "arm64" : systemArch === "x64" ? "x64" : "arm64"
    arch = bunArch
  }
}

console.log(`📦 Packaging OpenCode ${version} as ${format.toUpperCase()} for ${arch}`)
console.log("")

// 查找可执行文件
let executableName: string
let executablePath: string

if (format === "deb") {
  executableName = `opencode-linux-${bunArch}`
  executablePath = path.join(dir, "dist", executableName, "bin", "opencode")
} else {
  executableName = `opencode-darwin-${bunArch}`
  executablePath = path.join(dir, "dist", executableName, "bin", "opencode")
}

if (!fs.existsSync(executablePath)) {
  console.error(`❌ Error: Executable not found at ${executablePath}`)
  console.error("")
  console.error("Please build the executable first:")
  console.error(`  bun run script/build.ts --single`)
  console.error("")
  console.error("Or build for specific platform:")
  if (format === "deb") {
    console.error(`  bun run script/build.ts  # Build all platforms`)
  } else {
    console.error(`  bun run script/build.ts  # Build all platforms`)
  }
  process.exit(1)
}

// 执行打包
if (format === "deb") {
  await buildDeb(executablePath, executableName, version, arch)
} else {
  await buildDmg(executablePath, executableName, version, arch)
}

async function buildDeb(
  executablePath: string,
  executableName: string,
  version: string,
  arch: string
) {
  const packageName = "opencode"
  const buildDir = path.join(dir, "deb_build")
  const debDir = path.join(buildDir, `${packageName}_${version}_${arch}`)

  console.log(`🔨 Building DEB package: ${packageName}_${version}_${arch}.deb`)

  // 清理旧的构建目录
  await $`rm -rf ${buildDir}`

  // 创建目录结构
  await $`mkdir -p ${debDir}/DEBIAN`
  await $`mkdir -p ${debDir}/usr/bin`
  await $`mkdir -p ${debDir}/usr/share/doc/${packageName}`

  // 复制可执行文件
  console.log(`📋 Copying executable from ${executablePath}`)
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

  // 添加文档
  const readmePath = path.join(dir, "..", "..", "README.md")
  if (fs.existsSync(readmePath)) {
    await $`cp ${readmePath} ${debDir}/usr/share/doc/${packageName}/README.md`
  }

  const licensePath = path.join(dir, "..", "..", "LICENSE")
  if (fs.existsSync(licensePath)) {
    await $`cp ${licensePath} ${debDir}/usr/share/doc/${packageName}/LICENSE`
  }

  // 创建 postinst 脚本（安装后自动执行）
  const postinstContent = `#!/bin/bash
set -e

# 确保可执行文件有正确的权限
chmod +x /usr/bin/opencode 2>/dev/null || true

# 更新系统命令数据库
if command -v update-alternatives >/dev/null 2>&1; then
    update-alternatives --install /usr/bin/opencode opencode /usr/bin/opencode 100 2>/dev/null || true
fi

# 显示安装完成信息
echo ""
echo "✅ OpenCode 安装完成！"
echo ""
echo "使用方法："
echo "  opencode --version    # 查看版本"
echo "  opencode --help       # 查看帮助"
echo "  opencode              # 启动 OpenCode"
echo ""
echo "首次使用需要配置 API 密钥："
echo "  opencode              # 启动后输入 /connect"
echo ""
exit 0
`

  await Bun.file(path.join(debDir, "DEBIAN", "postinst")).write(postinstContent)
  await $`chmod +x ${path.join(debDir, "DEBIAN", "postinst")}`

  // 创建 prerm 脚本（卸载前执行）
  const prermContent = `#!/bin/bash
set -e

# 清理符号链接
if command -v update-alternatives >/dev/null 2>&1; then
    update-alternatives --remove opencode /usr/bin/opencode 2>/dev/null || true
fi

exit 0
`

  await Bun.file(path.join(debDir, "DEBIAN", "prerm")).write(prermContent)
  await $`chmod +x ${path.join(debDir, "DEBIAN", "prerm")}`

  // 构建 DEB 包
  console.log("🔨 Building DEB package...")
  const debFile = path.join(dir, "dist", `${packageName}_${version}_${arch}.deb`)
  await $`mkdir -p ${path.dirname(debFile)}`
  
  try {
    await $`dpkg-deb --build ${debDir} ${debFile}`
    console.log("")
    console.log(`✅ DEB package created: ${debFile}`)
    console.log("")
    console.log("📥 安装方法（简单直接）：")
    console.log(`   sudo dpkg -i ${debFile}`)
    console.log(`   sudo apt-get install -f  # 如果有依赖问题`)
    console.log("")
    console.log("✅ 安装后直接使用：")
    console.log("   opencode --version")
    console.log("   opencode --help")
    console.log("   opencode")
    console.log("")
    
    // 显示文件信息
    const stats = fs.statSync(debFile)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`📊 Package size: ${sizeMB} MB`)
  } catch (error) {
    console.error("❌ Failed to build DEB package")
    console.error("Make sure dpkg-deb is installed:")
    console.error("  sudo apt-get install dpkg-dev")
    throw error
  }
}

async function buildDmg(
  executablePath: string,
  executableName: string,
  version: string,
  arch: string
) {
  if (process.platform !== "darwin") {
    console.error("❌ Error: DMG packages can only be built on macOS")
    process.exit(1)
  }

  const packageName = "opencode"
  const dmgName = `${packageName}_${version}_${arch}.dmg`
  const buildDir = path.join(dir, "dmg_build")
  const dmgDir = path.join(buildDir, "OpenCode")
  const dmgFile = path.join(dir, "dist", dmgName)

  console.log(`🔨 Building DMG package: ${dmgName}`)

  // 清理旧的构建目录
  await $`rm -rf ${buildDir}`

  // 创建目录结构
  await $`mkdir -p ${dmgDir}`

  // 复制可执行文件
  console.log(`📋 Copying executable from ${executablePath}`)
  await $`cp ${executablePath} ${dmgDir}/opencode`
  await $`chmod +x ${dmgDir}/opencode`

  // 创建符号链接到 /usr/local/bin（可选）
  // 用户可以将 opencode 拖到 Applications 或创建符号链接

  // 添加 README
  const readmePath = path.join(dir, "..", "..", "README.md")
  if (fs.existsSync(readmePath)) {
    await $`cp ${readmePath} ${dmgDir}/README.md`
  }

  // 创建安装说明
  const installNote = `# OpenCode Installation

## Quick Install

1. Open Terminal
2. Copy opencode to /usr/local/bin:
   sudo cp opencode /usr/local/bin/

3. Or add to your PATH:
   export PATH="\$PATH:$(pwd)"

## Verify Installation

opencode --version

## More Information

See README.md for details.
`
  await Bun.file(path.join(dmgDir, "INSTALL.txt")).write(installNote)

  // 构建 DMG
  console.log("🔨 Building DMG package...")
  await $`mkdir -p ${path.dirname(dmgFile)}`

  try {
    // 创建临时 DMG
    const tempDmg = path.join(buildDir, "temp.dmg")
    const volumeName = "OpenCode"

    // 计算所需大小（MB），添加一些余量
    const stats = fs.statSync(executablePath)
    const sizeMB = Math.ceil(stats.size / (1024 * 1024)) + 10

    // 创建 DMG
    await $`hdiutil create -srcfolder ${dmgDir} -volname "${volumeName}" -fs HFS+ -fsargs "-c c=64,a=16,e=16" -format UDRW -size ${sizeMB}M ${tempDmg}`

    // 挂载 DMG
    const mountPoint = `/Volumes/${volumeName}`
    await $`hdiutil attach ${tempDmg} -readwrite -mountpoint ${mountPoint}` || true

    // 设置 DMG 属性（可选）
    // 可以添加背景图片、图标位置等

    // 卸载 DMG
    await $`hdiutil detach ${mountPoint}` || true

    // 转换为只读压缩格式
    await $`hdiutil convert ${tempDmg} -format UDZO -o ${dmgFile}`

    // 清理临时文件
    await $`rm -f ${tempDmg}`

    console.log("")
    console.log(`✅ DMG package created: ${dmgFile}`)
    console.log("")
    console.log("📥 To install:")
    console.log("   1. Double-click the DMG file")
    console.log("   2. Copy 'opencode' to /usr/local/bin:")
    console.log("      sudo cp /Volumes/OpenCode/opencode /usr/local/bin/")
    console.log("   3. Or add the directory to your PATH")
    console.log("")
    console.log("🧪 To test:")
    console.log("   opencode --version")
    console.log("")

    // 显示文件信息
    const finalStats = fs.statSync(dmgFile)
    const finalSizeMB = (finalStats.size / (1024 * 1024)).toFixed(2)
    console.log(`📊 Package size: ${finalSizeMB} MB`)
  } catch (error) {
    console.error("❌ Failed to build DMG package")
    console.error("Make sure you're on macOS and hdiutil is available")
    throw error
  }
}

