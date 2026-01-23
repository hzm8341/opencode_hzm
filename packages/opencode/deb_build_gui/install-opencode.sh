#!/bin/bash
# OpenCode GUI 安装程序启动脚本

DEB_FILE=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 查找 DEB 文件
if [ -f "$SCRIPT_DIR/../dist/opencode_"*.deb ]; then
    DEB_FILE=$(ls -t "$SCRIPT_DIR/../dist/opencode_"*.deb | head -1)
elif [ -f "$SCRIPT_DIR/opencode_"*.deb ]; then
    DEB_FILE=$(ls -t "$SCRIPT_DIR/opencode_"*.deb | head -1)
fi

if [ -z "$DEB_FILE" ]; then
    if command -v zenity >/dev/null 2>&1; then
        DEB_FILE=$(zenity --file-selection \
            --title="选择 OpenCode DEB 安装包" \
            --file-filter="DEB files (*.deb) | *.deb")
    else
        echo "请指定 DEB 文件路径:"
        read -r DEB_FILE
    fi
fi

if [ -z "$DEB_FILE" ] || [ ! -f "$DEB_FILE" ]; then
    echo "错误: 找不到 DEB 文件"
    exit 1
fi

# 检查是否有 sudo 权限
if [ "$EUID" -ne 0 ]; then
    if command -v zenity >/dev/null 2>&1; then
        zenity --question \
            --title="需要管理员权限" \
            --text="安装需要管理员权限。\n\n是否继续？" \
            --ok-label="继续" \
            --cancel-label="取消"
        
        if [ $? -eq 0 ]; then
            # 使用 gksudo 或 pkexec（如果可用）
            if command -v pkexec >/dev/null 2>&1; then
                pkexec bash "$SCRIPT_DIR/install-gui.sh" "$DEB_FILE"
            elif command -v gksudo >/dev/null 2>&1; then
                gksudo bash "$SCRIPT_DIR/install-gui.sh" "$DEB_FILE"
            else
                # 回退到 sudo
                sudo bash "$SCRIPT_DIR/install-gui.sh" "$DEB_FILE"
            fi
        fi
    else
        echo "需要管理员权限，请输入密码："
        sudo bash "$SCRIPT_DIR/install-gui.sh" "$DEB_FILE"
    fi
else
    bash "$SCRIPT_DIR/install-gui.sh" "$DEB_FILE"
fi
