#!/bin/bash

echo "🔍 检查构建状态..."
echo ""

if [ -f /tmp/tauri_build.log ]; then
    echo "📋 构建日志（最后 30 行）:"
    tail -30 /tmp/tauri_build.log
else
    echo "⚠️  日志文件不存在，构建可能还未开始"
fi

echo ""
echo "📦 检查 DMG 文件..."

DMG_FILES=$(find src-tauri/target/release/bundle/dmg -name "*.dmg" 2>/dev/null)
if [ -n "$DMG_FILES" ]; then
    echo "✅ 找到 DMG 文件:"
    ls -lh src-tauri/target/release/bundle/dmg/*.dmg
else
    echo "⏳ DMG 文件还未生成"
fi

echo ""
echo "📂 检查构建进程..."
if pgrep -f "tauri.*build" > /dev/null; then
    echo "✅ 构建进程正在运行"
else
    echo "⏸️  构建进程未运行"
fi
