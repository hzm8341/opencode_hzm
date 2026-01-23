# OpenCode Desktop macOS Release

## 📦 下载文件

### macOS (Apple Silicon / M1/M2/M3)
- **文件名**: `OpenCode_1.1.4_macOS.dmg`
- **文件大小**: ~66 MB
- **架构**: aarch64 (ARM64)
- **系统要求**: macOS 10.13 或更高版本

### 文件位置
```
packages/desktop/dist/OpenCode_1.1.4_macOS.dmg
```

## 📥 安装说明

### 方法一：使用 DMG 安装（推荐）

1. **下载 DMG 文件**
   - 从 GitHub Releases 页面下载 `OpenCode_1.1.4_macOS.dmg`

2. **打开 DMG 文件**
   - 双击下载的 DMG 文件
   - 如果 macOS 提示"无法打开，因为来自身份不明的开发者"：
     - 右键点击 DMG 文件
     - 选择"打开"
     - 在安全提示中点击"打开"

3. **安装应用**
   - 将 `OpenCode.app` 拖拽到 `Applications` 文件夹
   - 等待复制完成

4. **启动应用**
   - 打开 Finder
   - 进入 `Applications` 文件夹
   - 双击 `OpenCode.app` 启动

### 方法二：使用 Homebrew（如果可用）

```bash
brew install --cask opencode-desktop
```

## 🔍 验证安装

安装完成后，应用将位于：
```
/Applications/OpenCode.app
```

可以通过以下方式验证：
```bash
ls -la /Applications/OpenCode.app
```

## ⚠️ 注意事项

### 首次运行
- macOS 可能会显示安全警告
- 在"系统设置" > "隐私与安全性"中允许运行
- 或者右键点击应用，选择"打开"

### 权限要求
- 应用可能需要访问文件系统权限
- 首次使用时请授予必要的权限

### 系统兼容性
- **最低系统版本**: macOS 10.13 (High Sierra)
- **推荐系统版本**: macOS 12.0 (Monterey) 或更高
- **架构支持**: Apple Silicon (M1/M2/M3) 和 Intel (x86_64)

## 🐛 故障排除

### 问题：无法打开应用
**解决方案**:
1. 右键点击 `OpenCode.app`
2. 选择"打开"
3. 在安全提示中点击"打开"

### 问题：应用无法启动
**解决方案**:
1. 检查系统版本是否符合要求
2. 检查是否有足够的磁盘空间
3. 查看控制台日志：`Console.app` > 搜索 "OpenCode"

### 问题：找不到应用
**解决方案**:
- 确认应用已正确安装到 `/Applications/OpenCode.app`
- 使用 Spotlight 搜索 "OpenCode"

## 📋 版本信息

- **版本**: 1.1.4
- **构建日期**: 2025-01-22
- **构建类型**: 生产版本 (Production)
- **标识符**: `ai.opencode.desktop`

## 🔗 相关链接

- [GitHub Repository](https://github.com/hzm8341/opencode_hzm)
- [官方网站](https://opencode.ai)
- [文档](https://opencode.ai/docs)
- [问题反馈](https://github.com/hzm8341/opencode_hzm/issues)

## 📝 更新日志

### v1.1.4
- 生产版本构建
- 修复应用路径问题
- 优化 DMG 打包流程

---

**注意**: 这是未签名的应用，首次运行时可能需要手动允许。未来版本将提供代码签名。
