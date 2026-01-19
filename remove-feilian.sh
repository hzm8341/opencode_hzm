#!/bin/bash
# 飞连软件完全删除脚本
# 使用方法: sudo bash remove-feilian.sh

set -e

echo "=========================================="
echo "开始删除飞连软件..."
echo "=========================================="

# 1. 停止所有飞连相关进程
echo "[1/6] 停止飞连相关进程..."
pkill -9 -f "corplink" 2>/dev/null || echo "  已停止进程"

# 2. 停止并禁用系统服务
echo "[2/6] 停止并禁用系统服务..."
systemctl stop corplink-service 2>/dev/null || echo "  服务已停止或不存在"
systemctl disable corplink-service 2>/dev/null || echo "  服务已禁用或不存在"

# 3. 卸载软件包
echo "[3/6] 卸载飞连软件包..."
apt-get remove --purge -y com.volcengine.feilian 2>/dev/null || {
    echo "  尝试使用dpkg卸载..."
    dpkg --remove --force-remove-reinstreq com.volcengine.feilian 2>/dev/null || true
    dpkg --purge --force-remove-reinstreq com.volcengine.feilian 2>/dev/null || true
}

# 4. 删除安装目录
echo "[4/6] 删除安装目录..."
if [ -d "/opt/apps/com.volcengine.feilian" ]; then
    rm -rf /opt/apps/com.volcengine.feilian
    echo "  已删除 /opt/apps/com.volcengine.feilian"
else
    echo "  目录不存在"
fi

# 5. 清理配置文件
echo "[5/6] 清理配置文件..."
rm -rf ~/.config/feilian 2>/dev/null || true
rm -rf ~/.config/FeiLian 2>/dev/null || true
rm -rf ~/.local/share/feilian 2>/dev/null || true
rm -rf ~/.local/share/FeiLian 2>/dev/null || true
rm -rf /etc/corplink* 2>/dev/null || true
rm -rf /var/lib/corplink* 2>/dev/null || true
echo "  已清理配置文件"

# 6. 删除安装包文件（可选）
echo "[6/6] 清理安装包文件..."
if [ -f "$HOME/Downloads/software/apps/FeiLian_Linux_amd64_v3.0.21_r5117_8e58df.deb" ]; then
    read -p "  是否删除安装包文件? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$HOME/Downloads/software/apps/FeiLian_Linux_amd64_v3.0.21_r5117_8e58df.deb"
        echo "  已删除安装包"
    else
        echo "  保留安装包"
    fi
fi

# 7. 验证删除
echo ""
echo "=========================================="
echo "验证删除结果..."
echo "=========================================="

# 检查进程
if pgrep -f "corplink" > /dev/null; then
    echo "⚠️  警告: 仍有飞连进程在运行"
    ps aux | grep -i corplink | grep -v grep
else
    echo "✓ 无飞连进程运行"
fi

# 检查软件包
if dpkg -l | grep -i feilian > /dev/null; then
    echo "⚠️  警告: 软件包可能未完全卸载"
    dpkg -l | grep -i feilian
else
    echo "✓ 软件包已卸载"
fi

# 检查安装目录
if [ -d "/opt/apps/com.volcengine.feilian" ]; then
    echo "⚠️  警告: 安装目录仍存在"
else
    echo "✓ 安装目录已删除"
fi

echo ""
echo "=========================================="
echo "删除完成！"
echo "=========================================="
echo ""
echo "建议执行以下命令清理系统："
echo "  sudo apt-get autoremove -y"
echo "  sudo apt-get autoclean"

