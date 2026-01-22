#!/bin/bash

# OpenCode DMG 构建脚本（生产版本）
# 用于构建 macOS DMG 安装包（生产配置）

set -e

echo "🚀 开始构建 OpenCode DMG 安装包（生产版本）..."

# 检查是否在 macOS 上运行
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ 错误: 此脚本只能在 macOS 上运行"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

# 检查依赖 - 支持 bun
PACKAGE_MANAGER=""
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
else
    echo "❌ 错误: 未找到 bun，请先安装 bun"
    exit 1
fi

# 检查 tauri CLI（优先使用本地安装的）
TAURI_CMD=""
if [ -f "./node_modules/.bin/tauri" ]; then
    TAURI_CMD="./node_modules/.bin/tauri"
elif command -v tauri &> /dev/null; then
    TAURI_CMD="tauri"
else
    echo "❌ 错误: 未找到 tauri CLI，请先安装依赖: ${PACKAGE_MANAGER} install"
    exit 1
fi

echo "📦 使用包管理器: ${PACKAGE_MANAGER}"
echo "🔧 使用 Tauri CLI: ${TAURI_CMD}"

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf src-tauri/target/release/bundle
rm -rf dist

# 构建前端
echo "📦 构建前端..."
${PACKAGE_MANAGER} run build

# 构建 Tauri 应用（包含 DMG）- 使用生产配置
echo "🔨 使用生产配置构建 Tauri 应用和 DMG..."
CI=false bun ${TAURI_CMD} build --config ./src-tauri/tauri.prod.conf.json --bundles dmg

# 查找生成的 DMG 文件
DMG_PATH=$(find src-tauri/target/release/bundle/dmg -name "*.dmg" 2>/dev/null | head -n 1)

if [ -z "$DMG_PATH" ]; then
    echo "❌ 错误: 未找到生成的 DMG 文件"
    exit 1
fi

# 获取版本号 - 支持 bun
VERSION=""
if command -v bun &> /dev/null; then
    VERSION=$(bun -e "console.log(require('./package.json').version)")
else
    # 使用 grep 作为后备方案
    VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
fi

# 创建输出目录
mkdir -p dist

# 复制 DMG 到 dist 目录
DMG_NAME="OpenCode_${VERSION}_macOS.dmg"
OUTPUT_PATH="dist/${DMG_NAME}"

cp "$DMG_PATH" "$OUTPUT_PATH"

# 显示文件信息
DMG_SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)

echo ""
echo "✅ DMG 构建完成！"
echo ""
echo "📦 文件位置: $(pwd)/${OUTPUT_PATH}"
echo "📊 文件大小: ${DMG_SIZE}"
echo "📋 版本号: ${VERSION}"
echo ""
echo "📥 安装说明:"
echo "   1. 双击 DMG 文件打开"
echo "   2. 将 OpenCode.app 拖拽到 Applications 文件夹"
echo "   3. 在 Applications 中启动 OpenCode"
echo ""
