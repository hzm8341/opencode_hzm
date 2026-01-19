#!/bin/bash
# DEB 包安装测试脚本

set -e

DEB_FILE="dist/opencode_1.1.4_amd64.deb"

echo "📦 OpenCode DEB 包安装测试"
echo ""

# 检查文件是否存在
if [ ! -f "$DEB_FILE" ]; then
    echo "❌ 错误: DEB 包不存在: $DEB_FILE"
    exit 1
fi

echo "✅ DEB 包文件存在: $DEB_FILE"
echo "📊 文件大小: $(ls -lh "$DEB_FILE" | awk '{print $5}')"
echo ""

# 显示包信息
echo "📋 包信息:"
dpkg-deb -I "$DEB_FILE" | head -10
echo ""

# 询问是否安装
read -p "是否要安装此 DEB 包? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消安装"
    exit 0
fi

# 安装
echo ""
echo "📥 正在安装..."
sudo dpkg -i "$DEB_FILE" || {
    echo ""
    echo "⚠️  如果遇到依赖问题，运行:"
    echo "   sudo apt-get install -f"
    exit 1
}

echo ""
echo "✅ 安装完成!"
echo ""

# 测试
echo "🧪 测试安装..."
if command -v opencode &> /dev/null; then
    echo "✅ opencode 命令可用"
    echo ""
    echo "版本信息:"
    opencode --version || echo "⚠️  无法获取版本信息"
else
    echo "⚠️  opencode 命令未在 PATH 中找到"
    echo "尝试使用完整路径: /usr/bin/opencode"
    /usr/bin/opencode --version || echo "⚠️  无法运行"
fi

echo ""
echo "📝 安装位置:"
dpkg -L opencode | head -5

echo ""
echo "🎉 测试完成!"
echo ""
echo "要卸载，运行:"
echo "  sudo dpkg -r opencode"

