#!/bin/bash
# OpenCode DEB 包 GUI 安装程序打包脚本
# 版本: v1.0
# 日期: 2026-01-22
# 说明: 创建带有图形界面安装程序的 DEB 包

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PACKAGE_DIR/dist"
BUILD_DIR="$PACKAGE_DIR/deb_build_gui"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}OpenCode DEB GUI 安装程序打包脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查参数
if [ -z "$1" ]; then
    echo "用法: $0 <deb_file>"
    echo "示例: $0 dist/opencode_1.1.4_amd64.deb"
    exit 1
fi

DEB_FILE="$1"

if [ ! -f "$DEB_FILE" ]; then
    echo "错误: 找不到 DEB 文件: $DEB_FILE"
    exit 1
fi

echo -e "${YELLOW}正在创建 GUI 安装程序包...${NC}"

# 创建构建目录
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# 提取 DEB 包信息
DEB_NAME=$(basename "$DEB_FILE" .deb)
# 提取版本号（支持多种格式：1.1.4, 0.0.0-dev-202601221301）
VERSION=$(echo "$DEB_NAME" | sed -E 's/opencode_([^_]+)_.*/\1/' | head -1)
if [ -z "$VERSION" ] || [ "$VERSION" = "$DEB_NAME" ]; then
    VERSION="unknown"
fi
# 提取架构
ARCH=$(echo "$DEB_NAME" | grep -oE '(amd64|arm64)' | head -1)
if [ -z "$ARCH" ]; then
    ARCH="amd64"
fi

# 创建 GUI 安装程序目录结构
INSTALLER_DIR="$BUILD_DIR/opencode-gui-installer"
mkdir -p "$INSTALLER_DIR"
mkdir -p "$INSTALLER_DIR/usr/bin"
mkdir -p "$INSTALLER_DIR/usr/share/opencode-installer"
mkdir -p "$INSTALLER_DIR/usr/share/applications"

# 复制 GUI 安装脚本
cp "$SCRIPT_DIR/install-gui.sh" "$INSTALLER_DIR/usr/share/opencode-installer/install-gui.sh"
chmod +x "$INSTALLER_DIR/usr/share/opencode-installer/install-gui.sh"

# 创建启动脚本
cat > "$INSTALLER_DIR/usr/bin/opencode-installer" << 'EOF'
#!/bin/bash
exec /usr/share/opencode-installer/install-gui.sh "$@"
EOF
chmod +x "$INSTALLER_DIR/usr/bin/opencode-installer"

# 创建桌面快捷方式
cat > "$INSTALLER_DIR/usr/share/applications/opencode-installer.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=OpenCode Installer
Comment=OpenCode GUI Installation Program
Exec=/usr/share/opencode-installer/install-gui.sh
Icon=system-software-install
Terminal=false
Categories=System;PackageManager;
EOF

# 创建包装脚本（可以直接双击运行）
cat > "$BUILD_DIR/install-opencode.sh" << 'EOF'
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
EOF
chmod +x "$BUILD_DIR/install-opencode.sh"

# 复制 DEB 文件到构建目录
cp "$DEB_FILE" "$BUILD_DIR/"

# 创建 README
cat > "$BUILD_DIR/README.txt" << EOF
OpenCode GUI 安装程序
=====================

使用方法：
---------

方法 1: 双击运行（如果支持）
  双击 install-opencode.sh 文件

方法 2: 命令行运行
  chmod +x install-opencode.sh
  ./install-opencode.sh

方法 3: 直接使用 GUI 安装程序
  sudo bash install-gui.sh opencode_*.deb

系统要求：
---------
- Ubuntu/Debian Linux
- zenity (会自动安装)
- 管理员权限

注意事项：
---------
- 安装过程中可能需要输入管理员密码
- 首次运行会自动安装 zenity（如果需要）
- 安装完成后可以配置 API 密钥

更多信息：
---------
访问 https://opencode.ai 了解更多信息
EOF

# 创建压缩包
ZIP_FILE="$DIST_DIR/opencode-gui-installer-${VERSION}-${ARCH}.zip"
mkdir -p "$DIST_DIR"

cd "$BUILD_DIR"
zip -r "$ZIP_FILE" . > /dev/null

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}打包完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "GUI 安装程序包位置:"
echo "  $ZIP_FILE"
echo ""
echo "包含文件:"
echo "  - install-opencode.sh (启动脚本)"
echo "  - install-gui.sh (GUI 安装程序)"
echo "  - opencode_*.deb (DEB 安装包)"
echo "  - README.txt (说明文件)"
echo ""
echo "使用方法:"
echo "  1. 解压 ZIP 文件"
echo "  2. 双击或运行 install-opencode.sh"
echo "  3. 按照 GUI 提示完成安装"
echo ""

