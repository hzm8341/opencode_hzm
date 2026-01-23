#!/bin/bash
# OpenCode GUI 安装程序
# 版本: v1.0
# 日期: 2026-01-22
# 说明: 提供图形界面的安装体验

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否以 root 权限运行
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        if command -v zenity >/dev/null 2>&1; then
            zenity --error --text="此安装程序需要管理员权限。\n\n请使用以下命令运行：\nsudo ./install-gui.sh" --title="权限错误"
        else
            echo -e "${RED}错误: 此安装程序需要管理员权限${NC}"
            echo "请使用: sudo ./install-gui.sh"
        fi
        exit 1
    fi
}

# 检查 zenity 是否安装
check_zenity() {
    if ! command -v zenity >/dev/null 2>&1; then
        echo "正在安装 zenity..."
        apt-get update -qq
        apt-get install -y zenity
    fi
}

# 显示欢迎界面
show_welcome() {
    zenity --info \
        --title="OpenCode 安装程序" \
        --text="欢迎使用 OpenCode 安装程序！\n\nOpenCode 是一个开源的 AI 编程助手工具。\n\n点击确定继续安装。" \
        --width=500 \
        --height=200
}

# 显示许可协议
show_license() {
    zenity --text-info \
        --title="许可协议" \
        --filename=/usr/share/doc/opencode/LICENSE \
        --checkbox="我已阅读并同意许可协议" \
        --width=700 \
        --height=500 \
        --ok-label="同意并继续" \
        --cancel-label="取消"
    
    if [ $? -ne 0 ]; then
        zenity --info --title="安装取消" --text="安装已取消。"
        exit 0
    fi
}

# 选择安装选项
select_options() {
    OPTIONS=$(zenity --forms \
        --title="安装选项" \
        --text="请选择安装选项：" \
        --add-combo="安装类型" \
        --combo-values="标准安装|自定义安装" \
        --add-entry="安装路径 (默认: /usr/bin)" \
        --width=500 \
        --height=200)
    
    INSTALL_TYPE=$(echo $OPTIONS | cut -d'|' -f1)
    INSTALL_PATH=$(echo $OPTIONS | cut -d'|' -f2)
    
    if [ -z "$INSTALL_PATH" ]; then
        INSTALL_PATH="/usr/bin"
    fi
}

# 显示安装进度
show_progress() {
    (
        echo "10" ; sleep 0.5
        echo "# 正在检查系统要求..." ; sleep 0.5
        echo "20" ; sleep 0.5
        echo "# 正在验证文件..." ; sleep 0.5
        echo "30" ; sleep 0.5
        echo "# 正在复制文件..." ; sleep 1
        echo "50" ; sleep 0.5
        echo "# 正在设置权限..." ; sleep 0.5
        echo "70" ; sleep 0.5
        echo "# 正在创建快捷方式..." ; sleep 0.5
        echo "90" ; sleep 0.5
        echo "# 完成安装..." ; sleep 0.5
        echo "100"
    ) | zenity --progress \
        --title="正在安装 OpenCode" \
        --text="请稍候..." \
        --percentage=0 \
        --auto-close \
        --auto-kill
}

# 执行安装
perform_install() {
    DEB_FILE="$1"
    
    if [ ! -f "$DEB_FILE" ]; then
        zenity --error --text="找不到安装包文件：$DEB_FILE" --title="错误"
        exit 1
    fi
    
    # 显示进度
    (
        echo "10" ; sleep 0.3
        echo "# 正在检查依赖..." ; sleep 0.3
        dpkg -i "$DEB_FILE" 2>&1 | while read line; do
            echo "# $line"
        done
        echo "50" ; sleep 0.3
        echo "# 正在修复依赖..." ; sleep 0.3
        apt-get install -f -y 2>&1 | while read line; do
            echo "# $line"
        done
        echo "100"
    ) | zenity --progress \
        --title="正在安装 OpenCode" \
        --text="请稍候..." \
        --percentage=0 \
        --auto-close \
        --auto-kill \
        --pulsate
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# 配置 API 密钥
configure_api() {
    zenity --question \
        --title="配置 API 密钥" \
        --text="是否现在配置 AI 模型 API 密钥？\n\n这可以在安装后通过 'opencode /connect' 命令完成。" \
        --ok-label="现在配置" \
        --cancel-label="稍后配置"
    
    if [ $? -eq 0 ]; then
        # 创建配置目录
        mkdir -p ~/.opencode
        
        # 显示配置对话框
        API_KEY=$(zenity --entry \
            --title="配置 API 密钥" \
            --text="请输入您的 API 密钥：" \
            --entry-text="" \
            --width=500)
        
        if [ -n "$API_KEY" ]; then
            PROVIDER=$(zenity --list \
                --title="选择提供商" \
                --text="请选择 AI 模型提供商：" \
                --column="提供商" \
                "Anthropic (Claude)" \
                "OpenAI" \
                "Google" \
                "OpenCode Zen")
            
            # 创建配置文件
            cat > ~/.opencode/opencode.json << EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "model": "${PROVIDER}",
  "default_agent": "build",
  "provider": {
    "${PROVIDER,,}": {
      "options": {
        "apiKey": "${API_KEY}"
      }
    }
  }
}
EOF
            
            zenity --info --title="配置完成" --text="API 密钥已配置！"
        fi
    fi
}

# 显示完成界面
show_completion() {
    zenity --info \
        --title="安装完成" \
        --text="OpenCode 已成功安装！\n\n版本: $(opencode --version 2>/dev/null || echo '未知')\n\n您现在可以：\n1. 在终端运行 'opencode' 启动\n2. 运行 'opencode --help' 查看帮助\n3. 访问 https://opencode.ai 了解更多" \
        --width=500 \
        --height=300
}

# 主函数
main() {
    # 检查 root 权限
    check_root
    
    # 检查 zenity
    check_zenity
    
    # 显示欢迎界面
    show_welcome
    
    # 显示许可协议
    show_license
    
    # 获取 DEB 文件路径
    if [ -z "$1" ]; then
        DEB_FILE=$(zenity --file-selection \
            --title="选择 OpenCode DEB 安装包" \
            --file-filter="DEB files (*.deb) | *.deb" \
            --file-filter="All files | *")
        
        if [ -z "$DEB_FILE" ]; then
            zenity --error --text="未选择安装包文件" --title="错误"
            exit 1
        fi
    else
        DEB_FILE="$1"
    fi
    
    # 执行安装
    if perform_install "$DEB_FILE"; then
        # 配置 API 密钥
        configure_api
        
        # 显示完成界面
        show_completion
    else
        zenity --error \
            --text="安装失败！\n\n请检查错误信息并重试。\n\n如果遇到依赖问题，请运行：\nsudo apt-get install -f" \
            --title="安装失败"
        exit 1
    fi
}

# 运行主函数
main "$@"

