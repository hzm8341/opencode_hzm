#!/bin/bash
# 清理飞连残留文件和组件
# 使用方法: sudo bash cleanup-feilian-residual.sh

set -e

echo "=========================================="
echo "清理飞连残留组件..."
echo "=========================================="

# 1. 卸载 corplink-mdm 包
echo "[1/4] 卸载 corplink-mdm 包..."
if dpkg -l | grep -q "corplink-mdm"; then
    apt-get remove --purge -y corplink-mdm 2>/dev/null || {
        echo "  尝试使用 dpkg 强制卸载..."
        dpkg --remove --force-remove-reinstreq corplink-mdm 2>/dev/null || true
        dpkg --purge --force-remove-reinstreq corplink-mdm 2>/dev/null || true
    }
    echo "  ✓ corplink-mdm 已卸载"
else
    echo "  corplink-mdm 未安装"
fi

# 2. 删除配置文件
echo "[2/4] 删除配置文件..."
rm -f /etc/profile.d/corplink-mdm.sh 2>/dev/null && echo "  ✓ 已删除 /etc/profile.d/corplink-mdm.sh" || echo "  文件不存在"
rm -f /etc/profile.d/corplink-mdm.csh 2>/dev/null && echo "  ✓ 已删除 /etc/profile.d/corplink-mdm.csh" || echo "  文件不存在"
rm -f /etc/default/corplink-mdm 2>/dev/null && echo "  ✓ 已删除 /etc/default/corplink-mdm" || echo "  文件不存在"

# 3. 清理 dpkg 信息文件
echo "[3/4] 清理 dpkg 信息文件..."
rm -f /var/lib/dpkg/info/corplink-mdm.* 2>/dev/null && echo "  ✓ 已清理 dpkg 信息文件" || echo "  文件不存在"

# 4. 清理用户配置文件
echo "[4/4] 清理用户配置文件..."
rm -rf ~/.config/feilian 2>/dev/null || true
rm -rf ~/.config/FeiLian 2>/dev/null || true
rm -rf ~/.config/corplink* 2>/dev/null || true
rm -rf ~/.local/share/feilian 2>/dev/null || true
rm -rf ~/.local/share/FeiLian 2>/dev/null || true
rm -rf ~/.local/share/corplink* 2>/dev/null || true
echo "  ✓ 已清理用户配置"

# 5. 验证清理结果
echo ""
echo "=========================================="
echo "验证清理结果..."
echo "=========================================="

if dpkg -l | grep -qi "corplink\|feilian"; then
    echo "⚠️  警告: 仍有相关软件包"
    dpkg -l | grep -i "corplink\|feilian"
else
    echo "✓ 无相关软件包"
fi

if [ -f "/etc/profile.d/corplink-mdm.sh" ] || [ -f "/etc/profile.d/corplink-mdm.csh" ] || [ -f "/etc/default/corplink-mdm" ]; then
    echo "⚠️  警告: 仍有配置文件残留"
    find /etc -name "*corplink*" -o -name "*feilian*" 2>/dev/null
else
    echo "✓ 配置文件已清理"
fi

if ps aux | grep -i "corplink\|feilian" | grep -v grep > /dev/null; then
    echo "⚠️  警告: 仍有进程在运行"
    ps aux | grep -i "corplink\|feilian" | grep -v grep
else
    echo "✓ 无相关进程运行"
fi

echo ""
echo "=========================================="
echo "清理完成！"
echo "=========================================="
echo ""
echo "建议执行以下命令："
echo "  sudo apt-get autoremove -y"
echo "  sudo apt-get autoclean"
echo ""
echo "如果遇到依赖问题，可以执行："
echo "  sudo apt --fix-broken install"

